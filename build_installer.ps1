# GGit Launcher Build Script

Write-Host "--- Starting GGit Launcher Build Process ---" -ForegroundColor Cyan

# 1. Cleanup old build artifacts
if (Test-Path "build") { 
    Write-Host "Cleaning up old 'build' directory..."
    Remove-Item -Path "build" -Recurse -Force 
}
if (Test-Path "dist\GGit_Launcher") { 
    Write-Host "Cleaning up old 'dist\GGit_Launcher' directory..."
    Remove-Item -Path "dist\GGit_Launcher" -Recurse -Force 
}

# 2. Run PyInstaller
Write-Host "Running PyInstaller..." -ForegroundColor Green
pyinstaller --noconfirm --onedir --windowed --name "GGit_Launcher" `
    --add-data "launcher/GGit_launcher/dist;launcher/GGit_launcher/dist" `
    --add-data "modules;modules" `
    --add-data "helpers;helpers" `
    --add-data "launcher/bridge.py;launcher" `
    --add-data "rclone.exe;." `
    main.py

if ($LASTEXITCODE -eq 0) {
    Write-Host "PyInstaller completed successfully." -ForegroundColor Green
    Write-Host "`nNext Step: Open 'installer_script.iss' in Inno Setup and click 'Compile' (F9) to generate the final setup file." -ForegroundColor Yellow
} else {
    Write-Host "PyInstaller failed with exit code $LASTEXITCODE" -ForegroundColor Red
}
