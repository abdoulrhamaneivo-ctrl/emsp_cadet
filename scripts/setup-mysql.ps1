# setup-mysql.ps1 - Configuration MySQL pour Aine et Cadet (Django)
# Usage : .\scripts\setup-mysql.ps1
#
# Prerequis MySQL (une commande SQL) :
#   CREATE DATABASE emspconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
#
# Puis renseignez DB_USER et DB_PASSWORD dans aine-cadet/.env

param(
    [switch]$SkipSuperuser,
    [switch]$SkipTests,
    [switch]$SkipSeed,
    [switch]$ForceReset
)

$Root = Split-Path -Parent $PSScriptRoot
$DjangoDir = Join-Path $Root "aine-cadet"
$VenvPython = Join-Path $DjangoDir ".venv\Scripts\python.exe"
$VenvPip = Join-Path $DjangoDir ".venv\Scripts\pip.exe"
$EnvExample = Join-Path $DjangoDir ".env.example"
$EnvFile = Join-Path $DjangoDir ".env"
$Requirements = Join-Path $DjangoDir "requirements.txt"
$MysqlTestPy = Join-Path $PSScriptRoot "test-mysql-connection.py"

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host ">> $Message" -ForegroundColor Cyan
}

function Write-Ok([string]$Message) {
    Write-Host "   OK - $Message" -ForegroundColor Green
}

function Write-Warn([string]$Message) {
    Write-Host "   ATTENTION - $Message" -ForegroundColor Yellow
}

function Write-Fail([string]$Message) {
    Write-Host "   ERREUR - $Message" -ForegroundColor Red
}

function Test-EnvHasMysql {
    param([string]$Content)
    return $Content -match "(?m)^\s*DB_ENGINE\s*=\s*mysql(\s*#.*)?\s*$"
}

function Ensure-EnvValue {
    param(
        [string]$FilePath,
        [string]$Key,
        [string]$Value
    )
    $raw = Get-Content $FilePath -Raw -ErrorAction SilentlyContinue
    if (-not $raw) { return }
    if ($raw -match "(?m)^\s*$([regex]::Escape($Key))\s*=") {
        return
    }
    Add-Content $FilePath "`n$Key=$Value"
    Write-Ok "$Key=$Value ajoute dans .env"
}

function Invoke-Django {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )
    # Django ecrit des WARNINGS sur stderr - ne pas les traiter comme erreurs PowerShell
    $prevEap = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    Push-Location $DjangoDir
    try {
        $output = & $VenvPython @Arguments 2>&1
        $code = $LASTEXITCODE
    } finally {
        Pop-Location
        $ErrorActionPreference = $prevEap
    }
    if ($output) {
        $output | ForEach-Object { Write-Host $_ }
    }
    return @{
        ExitCode = $code
        Output   = ($output | Out-String)
    }
}

function Invoke-DjangoMigrate {
    if ($ForceReset) {
        Write-Warn "ForceReset : suppression des donnees Django (flush)"
        $flush = Invoke-Django @("manage.py", "flush", "--no-input")
        if ($flush.ExitCode -ne 0) {
            Write-Warn "flush impossible - base peut etre vide ou partielle"
        }
    }

    $migrate = Invoke-Django @("manage.py", "migrate")
    if ($migrate.ExitCode -eq 0) {
        return $true
    }

    if ($migrate.Output -match "already exists|1050") {
        Write-Warn "Tables deja presentes sans historique django_migrations - reconciliation --fake-initial"
        $fake = Invoke-Django @("manage.py", "migrate", "--fake-initial")
        if ($fake.ExitCode -eq 0) {
            Write-Ok "Migrations reconciliees (--fake-initial)"
            return $true
        }
    }

    Write-Fail "migrate a echoue"
    Write-Host ""
    Write-Host "=== ACTIONS POSSIBLES ===" -ForegroundColor Yellow
    Write-Host "1. Verifiez que la base existe :" -ForegroundColor Yellow
    Write-Host "   CREATE DATABASE emspconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" -ForegroundColor White
    Write-Host "2. Verifiez DB_USER et DB_PASSWORD dans aine-cadet\.env"
    Write-Host "3. Si tables partielles : .\scripts\setup-mysql.ps1 -ForceReset"
    Write-Host "4. Ou manuellement : cd aine-cadet ; python manage.py migrate --fake-initial"
    return $false
}

Write-Host "=== EMSPCONNECT - setup MySQL (Aine et Cadet) ===" -ForegroundColor Cyan
Write-Host "Racine : $Root"

Write-Step "1/8 - Verification de l environnement virtuel"

if (-not (Test-Path $VenvPython)) {
    Write-Fail "Environnement virtuel introuvable : $VenvPython"
    Write-Host ""
    Write-Host "Creez-le avec :" -ForegroundColor Yellow
    Write-Host "  cd aine-cadet"
    Write-Host "  python -m venv .venv"
    Write-Host "  .venv\Scripts\activate"
    Write-Host "  pip install -r requirements.txt"
    exit 1
}
Write-Ok "venv detecte"

Write-Step "2/8 - Installation des dependances"

$prevEap = $ErrorActionPreference
$ErrorActionPreference = "Continue"
& $VenvPip install -r $Requirements --quiet 2>&1 | Out-Null
$ErrorActionPreference = $prevEap
if ($LASTEXITCODE -ne 0) {
    Write-Fail "pip install a echoue"
    exit 1
}
Write-Ok "Dependances installees (PyMySQL inclus)"

Write-Step "3/8 - Fichier .env (MySQL)"

if (-not (Test-Path $EnvFile)) {
    if (-not (Test-Path $EnvExample)) {
        Write-Fail ".env.example introuvable"
        exit 1
    }
    Copy-Item $EnvExample $EnvFile
    Write-Ok ".env cree depuis .env.example"
} else {
    Write-Ok ".env deja present"
}

Ensure-EnvValue -FilePath $EnvFile -Key "DB_ENGINE" -Value "mysql"
Ensure-EnvValue -FilePath $EnvFile -Key "DB_NAME" -Value "emspconnect"
Ensure-EnvValue -FilePath $EnvFile -Key "DB_USER" -Value "root"
Ensure-EnvValue -FilePath $EnvFile -Key "DB_HOST" -Value "127.0.0.1"
Ensure-EnvValue -FilePath $EnvFile -Key "DB_PORT" -Value "3306"

$envContent = Get-Content $EnvFile -Raw
if (-not (Test-EnvHasMysql $envContent)) {
    Write-Fail "DB_ENGINE=mysql absent de .env"
    exit 1
}
Write-Ok "DB_ENGINE=mysql actif"

Write-Step "4/8 - Test de connexion MySQL"

$mysqlExit = 0
if (Test-Path $MysqlTestPy) {
    $prevEap = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $mysqlTestOutput = & $VenvPython $MysqlTestPy 2>&1 | Out-String
    $ErrorActionPreference = $prevEap
    Write-Host $mysqlTestOutput
    $mysqlExit = $LASTEXITCODE
} else {
    Write-Warn "test-mysql-connection.py introuvable - etape ignoree"
}

if ($mysqlExit -eq 2) {
    Write-Fail "Version MySQL incompatible - voir docs/MYSQL.md"
    exit 1
}
if ($mysqlExit -eq 3) {
    Write-Warn "MariaDB 10.4 (XAMPP) - MYSQL_ALLOW_LEGACY=1 requis"
    Ensure-EnvValue -FilePath $EnvFile -Key "MYSQL_ALLOW_LEGACY" -Value "1"
}
if ($mysqlExit -eq 1) {
    Write-Fail "Connexion MySQL impossible. Le serveur local ne repond pas sur DB_HOST/DB_PORT."
    Write-Host ""
    Write-Host "Actions rapides :" -ForegroundColor Yellow
    Write-Host "1. Demarrez MySQL ou MariaDB dans XAMPP/WAMP/Services Windows."
    Write-Host "2. Verifiez aine-cadet\.env : DB_HOST, DB_PORT, DB_USER, DB_PASSWORD."
    Write-Host "3. Relancez : .\scripts\setup-mysql.ps1"
    Write-Host ""
    Write-Host "Pour lancer l'app sans MySQL en attendant : .\scripts\dev.ps1 -UseSqlite" -ForegroundColor Cyan
    exit 1
}

Write-Step "5/8 - Migrations Django (manage.py migrate)"

$makemigrations = Invoke-Django @("manage.py", "makemigrations", "--check", "--dry-run")
if ($makemigrations.ExitCode -ne 0) {
    Write-Warn "Migrations en attente - generation"
    Invoke-Django @("manage.py", "makemigrations") | Out-Null
} else {
    Write-Ok "Aucune migration en attente"
}

if (-not (Invoke-DjangoMigrate)) {
    exit 1
}
Write-Ok "Toutes les tables sont a jour"

Write-Step "6/8 - Compte administrateur Django"

if ($SkipSuperuser) {
    Write-Warn "creation admin ignoree (-SkipSuperuser)"
} else {
    $createAdmin = Read-Host "Creer ou reparer le compte admin EMSP ? (O/n)"
    if ($createAdmin -notmatch "^[nN]") {
        $adminEmail = Read-Host "Email admin [admin@emsp.int]"
        if ([string]::IsNullOrWhiteSpace($adminEmail)) {
            $adminEmail = "admin@emsp.int"
        }
        $securePassword = Read-Host "Mot de passe admin" -AsSecureString
        $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
        try {
            $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
        } finally {
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
        }
        if ([string]::IsNullOrWhiteSpace($plainPassword)) {
            Write-Fail "Mot de passe admin vide"
            exit 1
        }
        $previousAdminPassword = $env:EMSP_ADMIN_PASSWORD
        $env:EMSP_ADMIN_PASSWORD = $plainPassword
        try {
            $adminResult = Invoke-Django @("manage.py", "initialiser_admin", "--email", $adminEmail, "--no-input")
            if ($adminResult.ExitCode -ne 0) {
                Write-Fail "creation du compte admin echouee"
                exit 1
            }
        } finally {
            $env:EMSP_ADMIN_PASSWORD = $previousAdminPassword
        }
    } else {
        Write-Warn "Plus tard : cd aine-cadet ; `$env:EMSP_ADMIN_PASSWORD='...' ; python manage.py initialiser_admin --email admin@emsp.int --no-input"
    }
}

Write-Step "7/8 - Verification Django (manage.py check)"

$check = Invoke-Django @("manage.py", "check")
if ($check.ExitCode -ne 0) {
    Write-Fail "manage.py check a echoue"
    exit 1
}
Write-Ok "Configuration Django valide"

Write-Step "8/8 - Tests automatiques et donnees initiales"

if ($SkipTests) {
    Write-Warn "Tests ignores (-SkipTests)"
} else {
    $tests = Invoke-Django @("manage.py", "test", "apps", "-v", "1")
    if ($tests.ExitCode -ne 0) {
        Write-Fail "Tests echoues"
        exit 1
    }
    Write-Ok "Tests apps OK"
}

if (-not $SkipSeed) {
    Write-Host "   Initialisation filieres et badges..." -ForegroundColor Gray
    $f = Invoke-Django @("manage.py", "initialiser_filieres")
    if ($f.ExitCode -eq 0) { Write-Ok "initialiser_filieres" } else { Write-Warn "initialiser_filieres ignore" }
    $b = Invoke-Django @("manage.py", "initialiser_badges")
    if ($b.ExitCode -eq 0) { Write-Ok "initialiser_badges" } else { Write-Warn "initialiser_badges ignore" }
}

Write-Host ""
Write-Host "=== setup MySQL termine ===" -ForegroundColor Green
Write-Host ""
Write-Host "Lancez l application : .\scripts\dev.ps1" -ForegroundColor Cyan
Write-Host "  Vitrine  -> http://localhost:8080/index.html"
Write-Host "  Django   -> http://127.0.0.1:8000/"
