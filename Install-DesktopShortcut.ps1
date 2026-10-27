$ErrorActionPreference = 'Stop'
$launcher = Join-Path $PSScriptRoot 'Start-TradeJournal.ps1'
if (-not (Test-Path -LiteralPath $launcher -PathType Leaf)) {
    throw "The app launcher was not found at $launcher."
}

$desktop = [Environment]::GetFolderPath('Desktop')
if ([string]::IsNullOrWhiteSpace($desktop) -or -not (Test-Path -LiteralPath $desktop -PathType Container)) {
    throw 'The Windows desktop folder could not be found.'
}

$powershell = (Get-Command powershell.exe -ErrorAction Stop).Source
$shortcutPath = Join-Path $desktop '20-Day Trading Challenge.lnk'
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $powershell
$shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Minimized -File `"$launcher`""
$shortcut.WorkingDirectory = $PSScriptRoot
$shortcut.Description = 'Start your local 20-Day Trading Challenge.'
$shortcut.WindowStyle = 7

$edgePaths = @(
    (Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe'),
    (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe')
)
$edgePath = $edgePaths | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if ($edgePath) {
    $shortcut.IconLocation = "$edgePath,0"
}

$shortcut.Save()
Write-Host "Created desktop shortcut: $shortcutPath"
