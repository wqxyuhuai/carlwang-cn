param(
  [string]$Target = "E:\OneDrive\Design files sync\AI\Proj. carlwang.cn\Source",
  [switch]$IncludeEnvLocal
)

$ErrorActionPreference = "Stop"

$Source = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

if (-not (Test-Path -LiteralPath $Target)) {
  New-Item -ItemType Directory -Path $Target | Out-Null
}

$ExcludedDirs = @("node_modules", "dist", "screenshots")
$ExcludedFiles = @("vite-dev.log", ".env")
if (-not $IncludeEnvLocal) {
  $ExcludedFiles += ".env.local"
}

$RobocopyArgs = @(
  $Source,
  $Target,
  "/E",
  "/XD"
) + $ExcludedDirs + @(
  "/XF"
) + $ExcludedFiles + @(
  "/R:2",
  "/W:2",
  "/DCOPY:DAT",
  "/COPY:DAT"
)

& robocopy @RobocopyArgs
$ExitCode = $LASTEXITCODE

if ($ExitCode -ge 8) {
  throw "robocopy failed with exit code $ExitCode"
}

Write-Host "Copied source project to $Target"
