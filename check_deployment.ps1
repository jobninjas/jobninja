# Deployment Diagnostic Script
# Run this to check for common deployment issues

Write-Host "=== DEPLOYMENT DIAGNOSTIC ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check Git Status
Write-Host "1. Checking Git Status..." -ForegroundColor Yellow
git status --short
$latestCommit = git log -1 --oneline
Write-Host "Latest commit: $latestCommit" -ForegroundColor Green
Write-Host ""

# 2. Check if build works locally
Write-Host "2. Testing Frontend Build..." -ForegroundColor Yellow
Push-Location frontend
try {
    $buildResult = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend build: SUCCESS" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Frontend build: FAILED" -ForegroundColor Red
        Write-Host "Error output:" -ForegroundColor Red
        Write-Host $buildResult
    }
}
finally {
    Pop-Location
}
Write-Host ""

# 3. Check Backend Dependencies
Write-Host "3. Checking Backend Dependencies..." -ForegroundColor Yellow
Push-Location backend
if (Test-Path "requirements.txt") {
    Write-Host "✅ requirements.txt exists" -ForegroundColor Green
    $reqCount = (Get-Content requirements.txt | Measure-Object -Line).Lines
    Write-Host "   Dependencies: $reqCount packages" -ForegroundColor Gray
}
else {
    Write-Host "❌ requirements.txt NOT FOUND" -ForegroundColor Red
}
Pop-Location
Write-Host ""

# 4. Check for common issues
Write-Host "4. Checking for Common Issues..." -ForegroundColor Yellow

# Check for incorrect import paths in ui folder
$uiFiles = Get-ChildItem -Path "frontend/src/components/ui" -Filter "*.jsx" -Recurse
$importIssues = @()
foreach ($file in $uiFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "from ['\`"]\.\.\/config\/") {
        $importIssues += $file.Name
    }
}

if ($importIssues.Count -gt 0) {
    Write-Host "❌ Found incorrect import paths in:" -ForegroundColor Red
    $importIssues | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
}
else {
    Write-Host "✅ No incorrect import paths found" -ForegroundColor Green
}
Write-Host ""

# 5. Summary
Write-Host "=== DIAGNOSTIC COMPLETE ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Check Vercel dashboard at: https://vercel.com" -ForegroundColor White
Write-Host "2. Check Railway dashboard at: https://railway.app" -ForegroundColor White
Write-Host "3. Look for deployment logs and error messages" -ForegroundColor White
Write-Host ""
Write-Host "If deployments are still failing, please share:" -ForegroundColor Yellow
Write-Host "- The exact error message from Vercel" -ForegroundColor White
Write-Host "- The exact error message from Railway" -ForegroundColor White
Write-Host "- Screenshots of the deployment logs" -ForegroundColor White
