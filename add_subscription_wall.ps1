# Script to add SubscriptionWall to remaining tools
$files = @(
    @{Name='LinkedInOptimizer.jsx'; ImportLine=18; ReturnLine=131},
    @{Name='CareerChangeTool.jsx'; ImportLine=19; ReturnLine=135},
    @{Name='ChatGPTResume.jsx'; ImportLine=18; ReturnLine=135},
    @{Name='ChatGPTCoverLetter.jsx'; ImportLine=19; ReturnLine=121},
    @{Name='InterviewPrep.jsx'; ImportLine=0; ReturnLine=80}  # No Header import found, will add manually
)

foreach ($file in $files) {
    $path = "frontend/src/components/$($file.Name)"
    Write-Host "Processing $($file.Name)..."
    
    $content = Get-Content $path -Raw
    
    # Check if already has SubscriptionWall
    if ($content -match 'SubscriptionWall') {
        Write-Host "  ✓ Already has SubscriptionWall"
        continue
    }
    
    Write-Host "  + Adding SubscriptionWall import and wrapper"
    
    # Add import after Header import
    $content = $content -replace "(import Header from './Header';)", "`$1`r`nimport SubscriptionWall from './SubscriptionWall';"
    
    # Wrap return statement
    $content = $content -replace "(\s+return \()", "`$1`r`n        <SubscriptionWall>"
    
    # Add closing tag before final closing
    $lines = $content -split "`r`n"
    $lastDivIndex = -1
    for ($i = $lines.Count - 1; $i -ge 0; $i--) {
        if ($lines[$i] -match '^\s*\);$') {
            $lines[$i] = "        </SubscriptionWall>`r`n" + $lines[$i]
            break
        }
    }
    $content = $lines -join "`r`n"
    
    Set-Content -Path $path -Value $content -NoNewline
    Write-Host "  ✓ Done"
}

Write-Host "`nAll files processed!"
