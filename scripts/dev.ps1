# EMSPCONNECT - local development launcher
# Usage:
#   .\scripts\dev.ps1
#   .\scripts\dev.ps1 -UseSqlite

param(
    [switch]$UseSqlite,
    [switch]$CheckOnly
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$VitrineDir = Join-Path $Root "html5up-editorial"
$DjangoDir = Join-Path $Root "aine-cadet"
$VenvPython = Join-Path $DjangoDir ".venv\Scripts\python.exe"

if (-not (Test-Path -LiteralPath $VitrineDir)) {
    throw "Static vitrine folder not found: $VitrineDir"
}

if (-not (Test-Path -LiteralPath $DjangoDir)) {
    throw "Django folder not found: $DjangoDir"
}

if (-not (Test-Path -LiteralPath $VenvPython)) {
    throw "Virtual environment not found: $VenvPython"
}

$djangoPrefix = ""
if ($UseSqlite) {
    $djangoPrefix = '$env:DB_ENGINE = "sqlite"; '
}

$vitrineCommand = @"
Set-Location -LiteralPath '$VitrineDir'
Write-Host 'Vitrine EMSP - http://localhost:8080/index.html' -ForegroundColor Green
python -m http.server 8080
"@

$djangoCommand = @"
Set-Location -LiteralPath '$DjangoDir'
$djangoPrefix Write-Host 'Aine & Cadet - http://127.0.0.1:8000/' -ForegroundColor Green
& '$VenvPython' manage.py runserver 127.0.0.1:8000
"@

Write-Host "=== EMSPCONNECT - dev servers ===" -ForegroundColor Cyan
Write-Host "Root: $Root"
Write-Host "Vitrine: http://localhost:8080/index.html"
Write-Host "Django : http://127.0.0.1:8000/"
if ($UseSqlite) {
    Write-Host "Django DB override: SQLite" -ForegroundColor Yellow
}

if ($CheckOnly) {
    Write-Host ""
    Write-Host "Check only OK. No server started." -ForegroundColor Green
    exit 0
}

Start-Process -FilePath "powershell.exe" -WindowStyle Hidden -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-Command",
    $vitrineCommand
)

Start-Sleep -Seconds 1

Start-Process -FilePath "powershell.exe" -WindowStyle Hidden -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-Command",
    $djangoCommand
)

Write-Host ""
Write-Host "Servers started in background PowerShell windows." -ForegroundColor Green
Write-Host "Open: http://localhost:8080/index.html"
Write-Host "App : http://127.0.0.1:8000/accounts/login/"
