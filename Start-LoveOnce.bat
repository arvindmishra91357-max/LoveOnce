@echo off
title LoveOnce - Romantic Experience
echo ======================================================
echo           Starting LoveOnce Web Experience...
echo ======================================================
echo.
echo Opening LoveOnce in your default browser...
start http://localhost:8899
echo.
echo Starting local audio & web server...
node serve.js
pause
