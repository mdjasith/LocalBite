# ============================================
#  run-group.ps1 — Helper launched by start-all.ps1
#  Do not run this directly. It runs one group with its .env loaded.
# ============================================

param(
    [Parameter(Mandatory = $true)]
    [string]$GroupPath
)

if (-not (Test-Path $GroupPath)) {
    Write-Host "ERROR: Path not found: $GroupPath" -ForegroundColor Red
    return
}

$envFile = Join-Path $GroupPath ".env"

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith('#')) {
            $idx = $line.IndexOf('=')
            if ($idx -gt 0) {
                $name  = $line.Substring(0, $idx).Trim()
                $value = $line.Substring($idx + 1).Trim()
                if ($value) {
                    [Environment]::SetEnvironmentVariable($name, $value, 'Process')
                }
            }
        }
    }
    Write-Host "  Env vars loaded from .env" -ForegroundColor DarkGray
} else {
    Write-Host "  WARNING: .env missing - using application.properties fallbacks" -ForegroundColor Yellow
}

Set-Location $GroupPath
Write-Host "  Starting Maven in $GroupPath" -ForegroundColor Green
Write-Host ""
.\mvnw.cmd spring-boot:run