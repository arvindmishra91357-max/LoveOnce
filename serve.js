const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const PORT = process.env.PORT || 8899;
const DATA_DIR = path.join(__dirname, 'data');
const STORIES_FILE = path.join(DATA_DIR, 'stories.json');
const ROOMS_FILE = path.join(DATA_DIR, 'chat_rooms.json');
const UPLOADS_DIR = path.join(__dirname, 'assets', 'images', 'uploads');

// Ensure directories exist
[DATA_DIR, UPLOADS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// In-memory active SSE listeners for real-time chat: roomId -> Set of res objects
const sseClients = new Map();

// Active authorized session tokens cache: token -> { roomId, expiresAt }
const activeTokens = new Map();

// MIME Types map
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8'
};

// Helpers for data storage
function loadJson(file, defaultData = {}) {
  try {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      return JSON.parse(content || '{}');
    }
  } catch (err) {
    console.error(`Error loading ${file}:`, err.message);
  }
  return defaultData;
}

function saveJson(file, data) {
  try {
    const tempFile = `${file}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, file);
    return true;
  } catch (err) {
    console.error(`Error saving ${file}:`, err.message);
    return false;
  }
}

// XSS Sanitization Helper
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Keyword Hashing Helper (Salted SHA-256)
function hashKeyword(keyword, salt) {
  const norm = String(keyword || '').trim().toLowerCase();
  return crypto.createHmac('sha256', salt).update(norm).digest('hex');
}

// Create Signed Stateless Token
function createSignedToken(roomId, salt) {
  const timestamp = Date.now();
  const signature = crypto.createHmac('sha256', salt).update(`${roomId}:${timestamp}`).digest('hex');
  return `${roomId}.${timestamp}.${signature}`;
}

// Verify Signed Stateless Token
function verifySignedToken(token, rooms) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [roomId, timestampStr, signature] = parts;
  const room = rooms[roomId];
  if (!room || !room.salt) return null;

  const expectedSig = crypto.createHmac('sha256', room.salt).update(`${roomId}:${timestampStr}`).digest('hex');
  try {
    if (crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSig, 'hex'))) {
      return roomId;
    }
  } catch (e) {
    return null;
  }
  return null;
}

// Initialize Default Room if needed
function ensureDefaultRoom() {
  const rooms = loadJson(ROOMS_FILE, {});
  const defaultRoomId = 'LOV-8F42KQ';
  if (!rooms[defaultRoomId]) {
    const salt = crypto.randomBytes(16).toString('hex');
    rooms[defaultRoomId] = {
      id: defaultRoomId,
      name: 'Our Secret Place',
      salt: salt,
      keywordHash: hashKeyword('moonlight', salt),
      fallbackKeywordHash: hashKeyword('forever', salt),
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-init-1',
          sender: 'Arvind',
          text: 'Welcome to our secret place. Every word written here stays between us forever. ❤️',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          reactions: { '❤️': 1 }
        },
        {
          id: 'msg-init-2',
          sender: 'My Love',
          text: 'I found our secret... I love you so much. ✨',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          reactions: { '🌹': 1 }
        }
      ]
    };
    saveJson(ROOMS_FILE, rooms);
  }
}
ensureDefaultRoom();

// Helper to broadcast SSE event to all connected clients in a room
function broadcastSSE(roomId, eventType, data) {
  const clients = sseClients.get(roomId);
  if (!clients || clients.size === 0) return;
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try {
      client.write(payload);
    } catch (e) {
      clients.delete(client);
    }
  }
}

// Helper to read JSON request body
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // 30MB limit for high-res photos
      if (body.length > 30 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Request body exceeded 30MB limit'));
      }
    });
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed);
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', err => reject(err));
  });
}

// Send JSON Response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Room-Token'
  });
  res.end(JSON.stringify(data));
}

// Natural romantic captions repository for contextual AI generation
const ROMANTIC_CAPTIONS = [
  "Every picture with you feels like a page from my favorite story. ❤️",
  "Some moments are ordinary, but with you they become my favorite memories. ✨",
  "I don't need a perfect moment. I just need another moment with you. 🌹",
  "In your eyes, I found the quiet place my heart was always searching for.",
  "You turn simple seconds into timeless poetry. 💗",
  "If I could freeze one feeling, it would be the warmth of holding your hand.",
  "You are my today, my tomorrow, and every beautiful dream in between. 🌙",
  "Our smiles together are my favorite souvenirs of this lifetime.",
  "The world becomes softer, brighter, and kinder whenever you are near.",
  "No distance, no time, no season can ever dim the light you bring to my soul."
];

// Server Request Handler
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Room-Token'
    });
    res.end();
    return;
  }

  // =========================================================================
  // API ROUTES
  // =========================================================================

  // 1. GET /api/story/:id or /api/story?id=...
  if (method === 'GET' && pathname.startsWith('/api/story')) {
    const stories = loadJson(STORIES_FILE, {});
    let storyId = pathname.replace('/api/story/', '').replace('/api/story', '').replace('/', '');
    if (!storyId) {
      storyId = parsedUrl.query.id || 'default';
    }
    const story = stories[storyId] || stories['default'];
    if (!story) {
      return sendJson(res, 404, { error: 'Story not found' });
    }

    // Sanitize: Do not send raw secretKeyword or password over public story GET
    const sanitized = { ...story };
    delete sanitized.rawKeyword;
    return sendJson(res, 200, { success: true, story: sanitized });
  }

  // 2. POST /api/story/save
  if (method === 'POST' && pathname === '/api/story/save') {
    try {
      const data = await parseRequestBody(req);
      const stories = loadJson(STORIES_FILE, {});
      const rooms = loadJson(ROOMS_FILE, {});

      let storyId = data.id || `lov-${crypto.randomBytes(4).toString('hex')}`;
      let roomId = data.secretRoomId;

      // If sender provided a secret keyword, create or update a secret room for this story
      const secretKeyword = (data.secretKeyword || 'moonlight').trim().toLowerCase();
      if (!roomId || !rooms[roomId]) {
        roomId = `LOV-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        const salt = crypto.randomBytes(16).toString('hex');
        rooms[roomId] = {
          id: roomId,
          name: `${data.partnerName || 'Our'} Secret Place`,
          salt: salt,
          keywordHash: hashKeyword(secretKeyword, salt),
          createdAt: new Date().toISOString(),
          messages: [
            {
              id: 'msg-welcome',
              sender: data.yourName || 'LoveOnce',
              text: `Welcome to our secret haven, ${data.partnerName || 'my love'}. Everything we say here stays here forever. ❤️`,
              timestamp: new Date().toISOString(),
              reactions: { '❤️': 1 }
            }
          ]
        };
        saveJson(ROOMS_FILE, rooms);
      } else {
        // Update room keyword if changed
        const salt = crypto.randomBytes(16).toString('hex');
        rooms[roomId].salt = salt;
        rooms[roomId].keywordHash = hashKeyword(secretKeyword, salt);
        saveJson(ROOMS_FILE, rooms);
      }

      const newStory = {
        id: storyId,
        partnerName: data.partnerName || 'My Love',
        yourName: data.yourName || 'Arvind',
        relationshipDate: data.relationshipDate || '14 February 2025',
        specialDate: data.specialDate || '',
        favoriteMemory: data.favoriteMemory || '',
        favoriteColor: data.favoriteColor || '#ff1a53',
        romanticMessage: data.romanticMessage || '',
        customLoveLetter: data.customLoveLetter || '',
        secretRoomId: roomId,
        flower: data.flower || 'rose',
        timeline: Array.isArray(data.timeline) ? data.timeline : [],
        memories: Array.isArray(data.memories) ? data.memories : [],
        bookPages: Array.isArray(data.bookPages) ? data.bookPages : [],
        updatedAt: new Date().toISOString()
      };

      stories[storyId] = newStory;
      saveJson(STORIES_FILE, stories);

      return sendJson(res, 200, {
        success: true,
        storyId,
        roomId,
        url: `/?story=${storyId}`
      });
    } catch (err) {
      console.error('Error saving story:', err);
      return sendJson(res, 500, { error: 'Failed to save story' });
    }
  }

  // 3. POST /api/upload-photo
  if (method === 'POST' && pathname === '/api/upload-photo') {
    try {
      const data = await parseRequestBody(req);
      const base64Data = data.image; // data:image/png;base64,...
      if (!base64Data) {
        return sendJson(res, 400, { error: 'No image provided' });
      }

      const matches = base64Data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      let ext = 'jpg';
      let buffer;

      if (matches) {
        ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(base64Data, 'base64');
      }

      const filename = `photo-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
      const savePath = path.join(UPLOADS_DIR, filename);
      fs.writeFileSync(savePath, buffer);

      const publicUrl = `/assets/images/uploads/${filename}`;
      return sendJson(res, 200, { success: true, url: publicUrl });
    } catch (err) {
      console.error('Error uploading photo:', err);
      return sendJson(res, 500, { error: 'Failed to upload photo' });
    }
  }

  // 4. POST /api/generate-love-art
  if (method === 'POST' && pathname === '/api/generate-love-art') {
    try {
      const data = await parseRequestBody(req);
      const originalImage = data.image; // data URL or path
      const partnerName = data.partnerName || 'My Love';
      const title = data.title || 'A Special Memory';
      const customContext = data.customContext || '';

      if (!originalImage) {
        return sendJson(res, 400, { error: 'No image provided' });
      }

      // Contextual romantic caption generation
      const pool = [
        `Every picture with ${partnerName} feels like a page from my favorite story. ❤️`,
        `Some moments are ordinary, but with ${partnerName} they become my favorite memories. ✨`,
        `I don't need a perfect moment. I just need another moment with ${partnerName}. 🌹`,
        `In ${partnerName}'s smile, I find every reason to be happy today. 💗`,
        `Under every star and through every quiet night, loving ${partnerName} is my favorite thing. 🌙`,
        `A snapshot frozen in time, but my love for ${partnerName} only grows with every breath.`
      ];
      const caption = pool[Math.floor(Math.random() * pool.length)];

      // Check if Gemini API key is configured
      const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

      // Provide painterly Ghibli transformation payload
      return sendJson(res, 200, {
        success: true,
        originalImage: originalImage,
        generatedImage: originalImage, // Client-side Canvas filters apply high-fidelity watercolor/storybook palette
        hasGeminiKey: !!geminiApiKey,
        style: 'ghibli-watercolor-storybook',
        caption: caption,
        title: title
      });
    } catch (err) {
      console.error('Error generating love art:', err);
      return sendJson(res, 200, {
        success: false,
        message: 'Your memory is beautiful even without the magic. ❤️',
        originalImage: (data && data.image) || null
      });
    }
  }

  // 5. POST /api/generate-caption
  if (method === 'POST' && pathname === '/api/generate-caption') {
    try {
      const data = await parseRequestBody(req);
      const partnerName = data.partnerName || 'My Love';
      const memoryTitle = data.memoryTitle || '';
      const context = data.customContext || '';

      const pool = [
        `Every picture with ${partnerName} feels like a page from my favorite story. ❤️`,
        `Some moments are ordinary, but with ${partnerName} they become my favorite memories. ✨`,
        `I don't need a perfect moment. I just need another moment with ${partnerName}. 🌹`,
        `Looking at this memory, I am reminded once again of why my heart chose ${partnerName}.`,
        `In ${partnerName}'s smile, I find every reason to be happy today. 💗`,
        `Under every star and through every quiet night, loving ${partnerName} is my favorite thing. 🌙`,
        `Holding hands, quiet whispers, and a love that feels like home with ${partnerName}.`,
        `If life is a collection of chapters, every page with ${partnerName} is my favorite.`
      ];

      const chosen = pool[Math.floor(Math.random() * pool.length)];
      return sendJson(res, 200, { success: true, caption: chosen });
    } catch (err) {
      return sendJson(res, 200, {
        success: true,
        caption: "Some moments are ordinary, but with you they become my favorite memories. ❤️"
      });
    }
  }

  // 6. POST /api/chat/verify-keyword
  // Secure server-side check with salted SHA-256 HMAC and timingSafeEqual
  if (method === 'POST' && pathname === '/api/chat/verify-keyword') {
    try {
      const data = await parseRequestBody(req);
      const inputKeyword = String(data.keyword || '').trim().toLowerCase();
      const targetRoomId = data.roomId ? String(data.roomId).trim() : null;

      if (!inputKeyword) {
        return sendJson(res, 400, { error: 'Keyword required' });
      }

      const rooms = loadJson(ROOMS_FILE, {});
      let matchedRoom = null;

      if (targetRoomId && rooms[targetRoomId]) {
        const r = rooms[targetRoomId];
        const computed = hashKeyword(inputKeyword, r.salt);
        if (crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(r.keywordHash))) {
          matchedRoom = r;
        } else if (r.fallbackKeywordHash) {
          const fallback = hashKeyword(inputKeyword, r.salt);
          if (crypto.timingSafeEqual(Buffer.from(fallback), Buffer.from(r.fallbackKeywordHash))) {
            matchedRoom = r;
          }
        }
      } else {
        // Search without leaking room IDs to client
        for (const rId of Object.keys(rooms)) {
          const r = rooms[rId];
          if (!r.salt || !r.keywordHash) continue;
          const computed = hashKeyword(inputKeyword, r.salt);
          if (computed === r.keywordHash || (r.fallbackKeywordHash && computed === r.fallbackKeywordHash)) {
            matchedRoom = r;
            break;
          }
        }
      }

      if (!matchedRoom) {
        // Subtle failure: do not provide error details
        return sendJson(res, 200, { valid: false });
      }

      // Generate cryptographically signed token (survives restarts)
      const token = createSignedToken(matchedRoom.id, matchedRoom.salt);
      activeTokens.set(token, {
        roomId: matchedRoom.id,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
      });

      return sendJson(res, 200, {
        valid: true,
        roomId: matchedRoom.id,
        roomName: matchedRoom.name || 'Our Secret Place',
        token: token
      });
    } catch (err) {
      console.error('Error verifying keyword:', err);
      return sendJson(res, 500, { error: 'Server error' });
    }
  }

  // Token validator helper for chat operations
  function validateToken(req, roomId) {
    const authHeader = req.headers['authorization'] || '';
    const tokenHeader = req.headers['x-room-token'] || '';
    const queryToken = parsedUrl.query.token;
    const token = authHeader.replace('Bearer ', '') || tokenHeader || queryToken;

    if (!token) return false;

    // Check signed token
    const rooms = loadJson(ROOMS_FILE, {});
    const verifiedRoomId = verifySignedToken(token, rooms);
    if (verifiedRoomId && verifiedRoomId === roomId) {
      return true;
    }

    // Check memory session
    const session = activeTokens.get(token);
    if (session && session.roomId === roomId && Date.now() <= session.expiresAt) {
      return true;
    }

    return false;
  }

  // 7. GET /api/chat/messages
  if (method === 'GET' && pathname === '/api/chat/messages') {
    const roomId = parsedUrl.query.roomId;
    if (!roomId) {
      return sendJson(res, 400, { error: 'Missing roomId' });
    }
    if (!validateToken(req, roomId)) {
      return sendJson(res, 401, { error: 'Unauthorized' });
    }

    const rooms = loadJson(ROOMS_FILE, {});
    const room = rooms[roomId];
    if (!room) {
      return sendJson(res, 404, { error: 'Room not found' });
    }

    return sendJson(res, 200, {
      success: true,
      roomId: room.id,
      name: room.name,
      messages: room.messages || []
    });
  }

  // 8. POST /api/chat/message
  if (method === 'POST' && pathname === '/api/chat/message') {
    try {
      const data = await parseRequestBody(req);
      const roomId = data.roomId;
      if (!roomId) {
        return sendJson(res, 400, { error: 'Missing roomId' });
      }
      if (!validateToken(req, roomId)) {
        return sendJson(res, 401, { error: 'Unauthorized' });
      }

      const rooms = loadJson(ROOMS_FILE, {});
      if (!rooms[roomId]) {
        return sendJson(res, 404, { error: 'Room not found' });
      }

      const cleanText = sanitizeString(data.text || '');
      const cleanSender = sanitizeString(data.sender || 'Me');

      const newMessage = {
        id: `msg-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        sender: cleanSender,
        text: cleanText,
        photo: data.photo || null,
        photoArt: data.photoArt || null,
        type: data.type || (data.photo ? 'photo' : 'text'),
        timestamp: new Date().toISOString(),
        reactions: {}
      };

      if (!rooms[roomId].messages) rooms[roomId].messages = [];
      rooms[roomId].messages.push(newMessage);
      rooms[roomId].updatedAt = new Date().toISOString();
      saveJson(ROOMS_FILE, rooms);

      // Broadcast to real-time clients in this room
      broadcastSSE(roomId, 'new_message', newMessage);

      return sendJson(res, 200, { success: true, message: newMessage });
    } catch (err) {
      console.error('Error posting chat message:', err);
      return sendJson(res, 500, { error: 'Failed to post message' });
    }
  }

  // 9. POST /api/chat/react
  if (method === 'POST' && pathname === '/api/chat/react') {
    try {
      const data = await parseRequestBody(req);
      const { roomId, messageId, emoji } = data;
      if (!roomId || !messageId || !emoji) {
        return sendJson(res, 400, { error: 'Missing reaction fields' });
      }

      const rooms = loadJson(ROOMS_FILE, {});
      const room = rooms[roomId];
      if (!room) return sendJson(res, 404, { error: 'Room not found' });

      const msg = (room.messages || []).find(m => m.id === messageId);
      if (!msg) return sendJson(res, 404, { error: 'Message not found' });

      if (!msg.reactions) msg.reactions = {};
      msg.reactions[emoji] = (msg.reactions[emoji] || 0) + 1;
      saveJson(ROOMS_FILE, rooms);

      broadcastSSE(roomId, 'reaction', { messageId, reactions: msg.reactions });
      return sendJson(res, 200, { success: true, reactions: msg.reactions });
    } catch (err) {
      return sendJson(res, 500, { error: 'Failed to react' });
    }
  }

  // 10. POST /api/chat/save-to-story
  if (method === 'POST' && pathname === '/api/chat/save-to-story') {
    try {
      const data = await parseRequestBody(req);
      const { storyId, roomId, messageId } = data;
      const stories = loadJson(STORIES_FILE, {});
      const rooms = loadJson(ROOMS_FILE, {});

      const targetStoryId = storyId || 'default';
      const story = stories[targetStoryId];
      const room = rooms[roomId];

      if (!story || !room) {
        return sendJson(res, 404, { error: 'Story or room not found' });
      }

      const msg = (room.messages || []).find(m => m.id === messageId);
      if (!msg) {
        return sendJson(res, 404, { error: 'Message not found' });
      }

      if (!story.bookPages) story.bookPages = [];
      const newPage = {
        pageNumber: story.bookPages.length + 1,
        type: 'chat_memory',
        title: 'A Whisper From Our Secret Place',
        sender: msg.sender,
        text: msg.text,
        photo: msg.photoArt || msg.photo,
        date: new Date(msg.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      story.bookPages.push(newPage);
      saveJson(STORIES_FILE, stories);

      return sendJson(res, 200, { success: true, page: newPage });
    } catch (err) {
      return sendJson(res, 500, { error: 'Failed to save to story' });
    }
  }

  // 11. GET /api/chat/events (Server-Sent Events)
  if (method === 'GET' && pathname === '/api/chat/events') {
    const roomId = parsedUrl.query.roomId;
    if (!roomId) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing roomId');
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    if (!sseClients.has(roomId)) {
      sseClients.set(roomId, new Set());
    }
    const clients = sseClients.get(roomId);
    clients.add(res);

    // Initial connection ack
    res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', roomId })}\n\n`);

    // Keep-alive heartbeat every 20 seconds
    const heartbeat = setInterval(() => {
      try {
        res.write(': keepalive\n\n');
      } catch (e) {
        clearInterval(heartbeat);
      }
    }, 20000);

    req.on('close', () => {
      clearInterval(heartbeat);
      clients.delete(res);
      if (clients.size === 0) {
        sseClients.delete(roomId);
      }
    });
    return;
  }

  // =========================================================================
  // STATIC FILE SERVING
  // =========================================================================
  let reqPath = decodeURI(pathname);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(__dirname, reqPath);

  // Security check: prevent path traversal outside project root
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If client requests /story/:id or /l/:id, route to index.html for SPA handling
      if (reqPath.startsWith('/story/') || reqPath.startsWith('/l/')) {
        const indexPath = path.join(__dirname, 'index.html');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(indexPath).pipe(res);
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    // Audio streaming with HTTP Range Requests
    const range = req.headers.range;
    if (range && (ext === '.mp3' || ext === '.ogg' || ext === '.wav')) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunkSize = (end - start) + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType
      });
      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stats.size,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': ext === '.mp3' ? 'public, max-age=86400' : 'no-cache'
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✨ LoveOnce server running at http://localhost:${PORT}`);
});
