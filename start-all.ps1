# ============================================
#  start-all.ps1 — Launch all 4 LocalBite backend groups
#  Usage:
#    .\start-all.ps1
#    .\start-all.ps1 -SkipHealthCheck
#    .\start-all.ps1 -WaitSeconds 180
# ============================================

param(
    [switch]$SkipHealthCheck,
    [int]$WaitSeconds = 90
)

$root = "C:\Users\mdjas\OneDrive\Desktop\LocalBites-monorepo"
$base = Join-Path $root "backend"
$helper = Join-Path $root "run-group.ps1"

if (-not (Test-Path $base)) {
    Write-Host ""
    Write-Host "ERROR: backend folder not found at $base" -ForegroundColor Red
    Write-Host "Edit the `$root variable at the top of this script." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $helper)) {
    Write-Host ""
    Write-Host "ERROR: run-group.ps1 not found at $helper" -ForegroundColor Red
    Write-Host "Save run-group.ps1 next to this script." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  LocalBite - Starting all 4 groups" -ForegroundColor Cyan
Write-Host "  Base: $base" -ForegroundColor DarkGray
Write-Host "=================================================" -ForegroundColor Cyan

# ---------- Clear ports ----------
$ports = @(8081, 8084, 8088, 8091)
Write-Host ""
Write-Host "Clearing ports 8081, 8084, 8088, 8091..." -ForegroundColor Yellow -NoNewline
foreach ($port in $ports) {
    Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
        ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}
Start-Sleep -Seconds 1
Write-Host " done" -ForegroundColor Green

# ---------- Groups ----------
$groups = @(
    @{ name = "group-a"; port = 8081; desc = "auth + user + seller + admin" }
    @{ name = "group-b"; port = 8084; desc = "food + cart + order" }
    @{ name = "group-c"; port = 8088; desc = "payment + wallet + commission" }
    @{ name = "group-d"; port = 8091; desc = "delivery + review + invoice + notification + location" }
)

# ---------- Launch each group in its own window ----------
foreach ($g in $groups) {
    $groupPath = Join-Path $base $g.name

    if (-not (Test-Path $groupPath)) {
        Write-Host "  SKIP $($g.name) - folder missing: $groupPath" -ForegroundColor Red
        continue
    }

    Write-Host ""
    Write-Host "Starting $($g.name) on port $($g.port)  ($($g.desc))" -ForegroundColor Cyan

    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-File", $helper,
        "-GroupPath", $groupPath
    )

    Start-Sleep -Seconds 2
}

# ---------- Wait ----------
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  4 windows launched" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "First-time build: 2-5 min per group. Subsequent: 30-45 sec." -ForegroundColor Yellow

if ($SkipHealthCheck) {
    Write-Host ""
    Write-Host "Skipping health check (-SkipHealthCheck)." -ForegroundColor DarkGray
    exit 0
}

Write-Host ""
Write-Host "Waiting $WaitSeconds seconds..." -ForegroundColor Yellow
for ($i = $WaitSeconds; $i -gt 0; $i -= 10) {
    Write-Host "  $i s..." -ForegroundColor DarkGray
    Start-Sleep -Seconds 10
}

# ---------- Health check ----------
Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  Health Check" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$checks = @(
    @{ n = "AUTH";         u = "http://localhost:8081/api/auth/health" }
    @{ n = "USER";         u = "http://localhost:8081/api/users/health" }
    @{ n = "SELLER";       u = "http://localhost:8081/api/sellers/health" }
    @{ n = "ADMIN";        u = "http://localhost:8081/api/admin/health" }
    @{ n = "FOOD";         u = "http://localhost:8084/api/foods/health" }
    @{ n = "CATEGORIES";   u = "http://localhost:8084/api/categories/health" }
    @{ n = "CART";         u = "http://localhost:8084/api/carts/health" }
    @{ n = "ORDER";        u = "http://localhost:8084/api/orders/health" }
    @{ n = "PAYMENT";      u = "http://localhost:8088/api/payments/health" }
    @{ n = "WALLET";       u = "http://localhost:8088/api/wallets/health" }
    @{ n = "COMMISSION";   u = "http://localhost:8088/api/commissions/health" }
    @{ n = "DELIVERY";     u = "http://localhost:8091/api/deliveries/health" }
    @{ n = "REVIEW";       u = "http://localhost:8091/api/reviews/health" }
    @{ n = "INVOICE";      u = "http://localhost:8091/api/invoices/health" }
    @{ n = "NOTIFICATION"; u = "http://localhost:8091/api/notifications/health" }
    @{ n = "LOCATION";     u = "http://localhost:8091/api/locations/health" }
)

$up = 0
$down = 0
$downList = @()

foreach ($c in $checks) {
    try {
        $r = Invoke-RestMethod $c.u -TimeoutSec 5 -ErrorAction Stop
        Write-Host ("  {0,-14} UP    ({1})" -f $c.n, $r.service) -ForegroundColor Green
        $up++
    } catch {
        Write-Host ("  {0,-14} DOWN" -f $c.n) -ForegroundColor Red
        $down++
        $downList += $c.n
    }
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
$resultColor = if ($down -eq 0) { "Green" } else { "Yellow" }
Write-Host "  Result: $up UP, $down DOWN" -ForegroundColor $resultColor
Write-Host "=================================================" -ForegroundColor Cyan

if ($down -eq 0) {
    Write-Host ""
    Write-Host "  All 16 services are UP." -ForegroundColor Green
    Write-Host ""
    Write-Host "  Start the frontend next:" -ForegroundColor Cyan
    Write-Host "    cd $root\frontend\customer-seller-app" -ForegroundColor Gray
    Write-Host "    npm run dev" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "  DOWN: $($downList -join ', ')" -ForegroundColor Yellow
    Write-Host "  Check the 4 PowerShell windows for errors." -ForegroundColor Yellow
}
Write-Host ""