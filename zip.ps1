# zip.ps1
$ErrorActionPreference = 'Stop'

$root = (Get-Location).Path
$zipPath = Join-Path $root ("{0}_{1}.zip" -f (Split-Path -Leaf $root), (Get-Date -Format 'yyyyMMdd_HHmmss'))

$stage = Join-Path $env:TEMP ("zipstage_{0}" -f ([guid]::NewGuid().ToString('N')))
New-Item -ItemType Directory -Path $stage | Out-Null

try {
    # Copy allowed top-level items into staging (preserves structure)
    Get-ChildItem -LiteralPath $root -Force |
        Where-Object {
            $_.Name -notlike '.*' -and
            $_.Name -notlike '*.iml' -and
            $_.Name -notlike '*.zip' -and
            $_.Name -notlike '*.ps1'
        } |
        ForEach-Object {
            Copy-Item -LiteralPath $_.FullName -Destination $stage -Recurse -Force
        }

    if (Test-Path -LiteralPath $zipPath) {
        Remove-Item -LiteralPath $zipPath -Force
    }

    Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $zipPath -Force
}
finally {
    Remove-Item -LiteralPath $stage -Recurse -Force -ErrorAction SilentlyContinue
}

"Created: $zipPath"
"Run: powershell -NoProfile -ExecutionPolicy Bypass -File .\zip.ps1"
