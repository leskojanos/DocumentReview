<#
.SYNOPSIS
    Robocopy wrapper script közvetlen futtatással és garantált logfájl mentéssel.
.DESCRIPTION
    Syntax: .\copymachine-3v1.ps1 [SourceDirectory] [TargetDirectory] [/XD "directory_to_exclude"]
#>

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$SourceDir,

    [Parameter(Mandatory=$true, Position=1)]
    [string]$TargetDir,

    [Parameter(Mandatory=$false, Position=2)]
    [string]$XD
)

# 1. Ellenőrzés, hogy a forrás létezik-e
if (-not (Test-Path -Path $SourceDir -PathType Container)) {
    Write-Error "A megadott forrás könyvtár nem létezik: $SourceDir"
    Exit 1
}

# A log fájl útvonala fixen a szkript saját mappája lesz
$LogFile = Join-Path $PSScriptRoot "robocopy_desktop_copy.log"

Write-Host "Másolás indítása..." -ForegroundColor Cyan
Write-Host "Forrás: $SourceDir" -ForegroundColor White
Write-Host "Cél:    $TargetDir" -ForegroundColor White
if ($XD) { Write-Host "Kizárva: $XD" -ForegroundColor Magenta }
Write-Host "Log:    $LogFile" -ForegroundColor Yellow

# 2. Robocopy argumentumok beállítása (Csak a ténylegesen másolt fájlok listázása)
$RoboArgs = @($SourceDir, $TargetDir, "/E", "/Z", "/MT:16", "/R:1", "/W:2", "/NDL", "/LOG:$LogFile", "/TEE", "/XJ", "/FFT")
if ($XD) {
    $RoboArgs += "/XD"
    $RoboArgs += $XD
}


# 3. KÖZVETLEN FUTTATÁS (Nincs háttér Job, a log azonnal létrejön!)
robocopy @RoboArgs

# A tényleges Robocopy exit kód elmentése
$ActualExitCode = $LASTEXITCODE

# 4. Eredmény ellenőrzése
if ($ActualExitCode -le 7) {
    Write-Host "`n[SIKER] A másolás sikeresen befejeződött!" -ForegroundColor Green
    if (Test-Path -Path $LogFile) {
        Write-Host "A részletes jelentést megtalálod a szkript mellett: $LogFile" -ForegroundColor Yellow
    }
} else {
    Write-Warning "`nA másolás során figyelmeztetések vagy hibák léptek fel. Exit kód: $ActualExitCode"
}
