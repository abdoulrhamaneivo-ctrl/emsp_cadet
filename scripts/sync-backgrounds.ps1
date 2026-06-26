# Synchronise BACKGROUND/ → html5up-editorial/assets/images/backgrounds/
# Usage : .\scripts\sync-backgrounds.ps1

$src = Join-Path $PSScriptRoot "..\BACKGROUND"
$dest = Join-Path $PSScriptRoot "..\html5up-editorial\assets\images\backgrounds"
$destDjango = Join-Path $PSScriptRoot "..\aine-cadet\static\images\backgrounds"

# Mapping par motif (noms Windows / encodage variables)
$mappingPatterns = @(
    @{ Pattern = "*Emerald*"; Target = "hero-emerald.jpg" },
    @{ Pattern = "*fond vert*"; Target = "hero-pattern-green.jpg" },
    @{ Pattern = "*topographic*"; Target = "hero-topo-animation.mp4" }
)

if (-not (Test-Path $src)) {
    Write-Warning "Dossier BACKGROUND introuvable : $src"
    exit 1
}

New-Item -ItemType Directory -Force -Path $dest | Out-Null
New-Item -ItemType Directory -Force -Path $destDjango | Out-Null
$count = 0

Get-ChildItem -LiteralPath $src -File | ForEach-Object {
    $file = $_
    $match = $mappingPatterns | Where-Object { $file.Name -like $_.Pattern } | Select-Object -First 1
    if (-not $match) {
        Write-Warning "Ignoré (nom non mappé) : $($file.Name)"
        return
    }
    $targetName = $match.Target
    Copy-Item -LiteralPath $file.FullName -Destination (Join-Path $dest $targetName) -Force
    Copy-Item -LiteralPath $file.FullName -Destination (Join-Path $destDjango $targetName) -Force
    Write-Host "Copié : $($file.Name) → $targetName (vitrine + Django static)"
    $count++
}

if ($count -eq 0) {
    Write-Host "BACKGROUND/ est vide — ajoutez JPG, PNG ou MP4."
} else {
    Write-Host "Terminé — $count fichier(s) dans assets/images/backgrounds/"
}
