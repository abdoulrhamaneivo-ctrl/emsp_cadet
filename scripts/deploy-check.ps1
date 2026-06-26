# EMSPCONNECT - pre-deployment checks
# Usage:
#   .\scripts\deploy-check.ps1
#   .\scripts\deploy-check.ps1 -SkipVitrine
#   .\scripts\deploy-check.ps1 -UseSqlite

param(
    [switch]$SkipVitrine,
    [switch]$UseSqlite,
    [switch]$SkipTests
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$AineCadet = Join-Path $Root "aine-cadet"
$VenvPython = Join-Path $AineCadet ".venv\Scripts\python.exe"
$BuildVitrine = Join-Path $Root "scripts\build-vitrine.py"

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host ">> $Message" -ForegroundColor Cyan
}

function Invoke-Checked {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Label,
        [Parameter(Mandatory = $true)]
        [scriptblock]$Command
    )

    Write-Step $Label
    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "$Label failed with exit code $LASTEXITCODE"
    }
}

Write-Host "=== EMSPCONNECT - deploy-check ===" -ForegroundColor Cyan
Write-Host "Root: $Root"

if (-not (Test-Path -LiteralPath $AineCadet)) {
    throw "Django folder not found: $AineCadet"
}

if (-not (Test-Path -LiteralPath $VenvPython)) {
    throw "Virtual environment not found: $VenvPython"
}

if (-not $SkipVitrine) {
    if (-not (Test-Path -LiteralPath $BuildVitrine)) {
        throw "Vitrine build script not found: $BuildVitrine"
    }
    Invoke-Checked "Build static vitrine" {
        & $VenvPython $BuildVitrine
    }
}

Push-Location $AineCadet
try {
    $previousDbEngine = $env:DB_ENGINE
    if ($UseSqlite) {
        $env:DB_ENGINE = "sqlite"
        Write-Host "DB override: SQLite for this check run" -ForegroundColor Yellow
    }

    Invoke-Checked "Check migrations" {
        & $VenvPython manage.py makemigrations --check --dry-run
    }

    Invoke-Checked "Django system check" {
        & $VenvPython manage.py check
    }

    if (-not $SkipTests) {
        Invoke-Checked "Run Django tests" {
            & $VenvPython manage.py test apps --verbosity=1
        }
    }

    Invoke-Checked "Collect static dry-run" {
        & $VenvPython manage.py collectstatic --noinput --dry-run
    }
}
finally {
    if ($UseSqlite) {
        if ($null -eq $previousDbEngine) {
            Remove-Item Env:\DB_ENGINE -ErrorAction SilentlyContinue
        } else {
            $env:DB_ENGINE = $previousDbEngine
        }
    }
    Pop-Location
}

Write-Host ""
Write-Host "=== deploy-check OK ===" -ForegroundColor Green
