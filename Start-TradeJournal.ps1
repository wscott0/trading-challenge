$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath($PSScriptRoot).TrimEnd('\') + '\'
$appUrl = 'http://127.0.0.1:8765/'
$appMarker = 'id="goal-mode-view"'

$openApp = {
    $edgePaths = @(
        (Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe'),
        (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe')
    )
    $edgePath = $edgePaths | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
    if ($edgePath) {
        Start-Process -FilePath $edgePath -ArgumentList "--app=$appUrl"
    } else {
        Start-Process $appUrl
    }
}

$isChallengeApp = {
    param ($Response)
    return $Response.StatusCode -eq 200 -and $Response.Content.Contains($appMarker)
}

try {
    $existingApp = Invoke-WebRequest -Uri $appUrl -UseBasicParsing -TimeoutSec 2
    if (& $isChallengeApp $existingApp) {
        & $openApp
        exit 0
    }
} catch {
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode -ne 404) {
        $existingApp = $null
    }
}

$listener = New-Object Net.HttpListener
$listener.Prefixes.Add($appUrl)
try {
    $listener.Start()
} catch {
    $startError = $_.Exception.Message
    $listener.Close()
    try {
        $existingApp = Invoke-WebRequest -Uri $appUrl -UseBasicParsing -TimeoutSec 2
    } catch {
        throw "Could not start the local journal server at $appUrl. $startError"
    }
    if (-not (& $isChallengeApp $existingApp)) {
        throw "Another application is using $appUrl. Close it and try again."
    }
    & $openApp
    exit 0
}

try {
    & $openApp
} catch {
    $listener.Stop()
    $listener.Close()
    throw "The local server could not open the app in your browser: $($_.Exception.Message)"
}

Write-Host 'The Trading Challenge & Goal Mode app is open in your browser.'
Write-Host 'Keep this minimized window open while you use the app. Close it to stop the local server.'

$contentTypes = @{
    '.html' = 'text/html; charset=utf-8'
    '.css' = 'text/css; charset=utf-8'
    '.js' = 'text/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.svg' = 'image/svg+xml'
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $relativePath = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))
        if ([string]::IsNullOrWhiteSpace($relativePath)) {
            $relativePath = 'index.html'
        }

        $filePath = [IO.Path]::GetFullPath((Join-Path $root $relativePath))
        if (-not $filePath.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
            $context.Response.StatusCode = 404
            $context.Response.Close()
            continue
        }

        $extension = [IO.Path]::GetExtension($filePath).ToLowerInvariant()
        if ($contentTypes.ContainsKey($extension)) {
            $context.Response.ContentType = $contentTypes[$extension]
        } else {
            $context.Response.StatusCode = 404
            $context.Response.Close()
            continue
        }

        $bytes = [IO.File]::ReadAllBytes($filePath)
        $context.Response.ContentLength64 = $bytes.Length
        try {
            $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        } catch [Net.HttpListenerException] {
            if ($_.Exception.ErrorCode -notin @(64, 995)) {
                throw
            }
        } catch [System.IO.IOException] {
            if ($_.Exception.HResult -ne -2147024832) {
                throw
            }
        } finally {
            $context.Response.Close()
        }
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
