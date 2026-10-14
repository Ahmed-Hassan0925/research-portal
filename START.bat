@echo off
title ResearchNexus — Auto Startup
color 0B

echo.
echo  ========================================
echo    ResearchNexus  ^|  Auto Startup Script
echo  ========================================
echo.

:: ─── Find MariaDB / MySQL binary ─────────────────────────────────────────
set MYSQL_BIN=
for /f "delims=" %%i in ('where mysql 2^>nul') do set MYSQL_BIN=%%i
if not defined MYSQL_BIN (
  for /f "delims=" %%i in ('dir /b /s "C:\Program Files\MariaDB*\bin\mysql.exe" 2^>nul') do set MYSQL_BIN=%%i
)
if not defined MYSQL_BIN (
  for /f "delims=" %%i in ('dir /b /s "C:\Program Files\MySQL*\bin\mysql.exe" 2^>nul') do set MYSQL_BIN=%%i
)
if not defined MYSQL_BIN (
  echo [ERROR] MySQL/MariaDB not found. Please install it first.
  pause
  exit /b 1
)
echo [OK] Found MySQL at: %MYSQL_BIN%

:: ─── Prompt for MySQL root password ──────────────────────────────────────
set /p DB_PASS=Enter MySQL/MariaDB root password (press Enter if none): 

:: ─── Import schema ────────────────────────────────────────────────────────
echo.
echo [*] Importing database schema...
"%MYSQL_BIN%" -u root -p%DB_PASS% < "%~dp0database\schema.sql" 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo [WARN] Schema import had warnings (may already exist). Continuing...
) else (
  echo [OK] Database schema imported successfully!
)

:: ─── Update .env with password ───────────────────────────────────────────
echo.
echo [*] Updating backend .env with your password...
(
  echo DB_HOST=localhost
  echo DB_USER=root
  echo DB_PASSWORD=%DB_PASS%
  echo DB_NAME=research_portal
  echo DB_PORT=3306
  echo PORT=5000
) > "%~dp0backend\.env"
echo [OK] .env updated!

:: ─── Start backend ────────────────────────────────────────────────────────
echo.
echo [*] Starting backend server...
cd /d "%~dp0backend"
start "ResearchNexus Backend" cmd /k "node server.js"

:: ─── Wait for server ─────────────────────────────────────────────────────
echo [*] Waiting for server to start...
timeout /t 3 /nobreak >nul

:: ─── Open browser ─────────────────────────────────────────────────────────
echo [*] Opening frontend in browser...
start "" "%~dp0frontend\index.html"

echo.
echo  ========================================
echo    ALL DONE! Application is running.
echo    Backend:  http://localhost:5000
echo    Frontend: opened in your browser
echo  ========================================
echo.
pause
