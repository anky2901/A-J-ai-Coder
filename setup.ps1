#!/usr/bin/env pwsh
# Quick setup script for A J AI Coder

Write-Host "================================" -ForegroundColor Cyan
Write-Host "A J AI Coder - Setup Script" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if bun is installed
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (!(Get-Command bun -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Bun not found. Please install from https://bun.sh" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Bun found" -ForegroundColor Green

# Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
bun install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Dependency installation failed" -ForegroundColor Red
    exit 1
}

# Update package.json branding
Write-Host "`nUpdating branding..." -ForegroundColor Yellow
$packagePath = "package.json"
$package = Get-Content $packagePath | ConvertFrom-Json
$package.name = "aj-ai-coder"
$package.productName = "A J AI Coder"
$package.description = "A J AI Coder - Professional AI-Powered IDE"
$package.author = "A J"
$package | ConvertTo-Json -Depth 100 | Set-Content $packagePath
Write-Host "✅ Branding updated in package.json" -ForegroundColor Green

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: bun run dev   (for development)" -ForegroundColor White
Write-Host "2. Run: bun run build (for production)" -ForegroundColor White
Write-Host "3. Check BRANDING_UPDATE.md for integration steps`n" -ForegroundColor White

Write-Host "Live Preview Panel:" -ForegroundColor Yellow
Write-Host "- Location: src/browser/components/LivePreviewPanel.tsx" -ForegroundColor White
Write-Host "- Status: ✅ Created and ready to integrate" -ForegroundColor Green
Write-Host "- Features: HTML/CSS/JS/Python/Images preview with auto-reload`n" -ForegroundColor White

Write-Host "Happy Coding! 🚀" -ForegroundColor Cyan
