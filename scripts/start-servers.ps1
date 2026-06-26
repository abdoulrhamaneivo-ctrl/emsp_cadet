# EMSPCONNECT - compatibility launcher
# Usage:
#   .\scripts\start-servers.ps1
#   .\scripts\start-servers.ps1 -UseSqlite
#
# This script delegates to scripts/dev.ps1 so both entry points behave the same.

param(
    [switch]$UseSqlite,
    [switch]$CheckOnly
)

$ErrorActionPreference = "Stop"
$DevScript = Join-Path $PSScriptRoot "dev.ps1"

if (-not (Test-Path -LiteralPath $DevScript)) {
    throw "dev.ps1 not found: $DevScript"
}

if ($UseSqlite -and $CheckOnly) {
    & $DevScript -UseSqlite -CheckOnly
} elseif ($UseSqlite) {
    & $DevScript -UseSqlite
} elseif ($CheckOnly) {
    & $DevScript -CheckOnly
} else {
    & $DevScript
}
