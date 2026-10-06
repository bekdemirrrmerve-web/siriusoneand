@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"
set "NODE_VERSION=22.16.0"
set "NODE_DIR=%~dp0node"
set "NODE_ZIP=%~dp0node-runtime.zip"
set "NODE_URL=https://nodejs.org/dist/v%NODE_VERSION%/node-v%NODE_VERSION%-win-x64.zip"

cls
echo =============================================
echo              SIRIUS ONE PORTABLE
echo =============================================
echo.
echo Bu kurulum Windows'a program kurmaz.
echo Her sey bu klasorun icinde calisir.
echo.

if not exist "%NODE_DIR%\node.exe" goto :getnode
goto :nodeok

:getnode
echo [1/4] Tasinabilir Node.js hazirlaniyor...
if not exist "%NODE_ZIP%" (
  echo Node.js indiriliyor...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference='SilentlyContinue'; try { Invoke-WebRequest -UseBasicParsing -Uri '%NODE_URL%' -OutFile '%NODE_ZIP%' -TimeoutSec 180 } catch { exit 1 }"
  if errorlevel 1 (
    echo.
    echo Node.js otomatik indirilemedi.
    echo Kurumsal ag nodejs.org adresini engelliyor olabilir.
    echo Bu pencerenin ekran goruntusunu bana gonder.
    pause
    exit /b 1
  )
)

if exist ".node_tmp" rmdir /s /q ".node_tmp"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -Path '%NODE_ZIP%' -DestinationPath '.node_tmp' -Force"
if errorlevel 1 goto :fail
for /d %%D in (.node_tmp\node-v*-win-x64) do move "%%D" node >nul
rmdir /s /q .node_tmp
if not exist "%NODE_DIR%\node.exe" goto :fail

:nodeok
set "PATH=%NODE_DIR%;%PATH%"
echo [2/4] Node hazir.

if not exist "node_modules\next\dist\bin\next" (
  echo [3/4] Sirius One kutuphaneleri kuruluyor...
  call "%NODE_DIR%\npm.cmd" config set registry https://registry.npmjs.org/
  call "%NODE_DIR%\npm.cmd" install --no-audit --no-fund
  if errorlevel 1 goto :fail
) else (
  echo [3/4] Kutuphaneler zaten hazir.
)

echo [4/4] Yerel veritabani kontrol ediliyor...
call "%NODE_DIR%\npx.cmd" prisma generate
if errorlevel 1 goto :fail
call "%NODE_DIR%\npx.cmd" prisma db push
if errorlevel 1 goto :fail
if not exist "prisma\.seeded" (
  call "%NODE_DIR%\npx.cmd" prisma db seed
  if errorlevel 1 goto :fail
  echo seeded>"prisma\.seeded"
)

echo.
echo =============================================
echo  SIRIUS ONE HAZIR
echo  Adres: http://localhost:3000
echo =============================================
echo.
start "" http://localhost:3000
call "%NODE_DIR%\npm.cmd" run dev
exit /b 0

:fail
echo.
echo =============================================
echo Kurulumda bir hata olustu.
echo Bu pencerenin ekran goruntusunu bana gonder.
echo =============================================
pause
exit /b 1
