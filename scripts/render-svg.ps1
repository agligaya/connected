param(
  [Parameter(Mandatory = $true)][string]$Svg,
  [Parameter(Mandatory = $true)][string]$Png,
  [int]$Width,
  [int]$Height,
  [double]$Scale = 1
)
# Renders an SVG to PNG using headless Edge/Chrome (no extra tools needed).
$browser = @(
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browser) { throw "No Edge or Chrome found." }

$svgPath = (Resolve-Path $Svg).Path
$pngPath = [System.IO.Path]::GetFullPath($Png)
$html = Join-Path ([System.IO.Path]::GetTempPath()) "svg_render.html"
$src = "file:///" + ($svgPath -replace '\\', '/')
Set-Content -Path $html -Encoding UTF8 -Value "<html><body style='margin:0'><img src='$src' width='$Width' height='$Height' style='display:block'></body></html>"
& $browser --headless --disable-gpu --hide-scrollbars "--force-device-scale-factor=$Scale" "--window-size=$Width,$Height" "--screenshot=$pngPath" ("file:///" + ($html -replace '\\', '/')) 2>&1 | Out-Null
Start-Sleep -Seconds 2
Remove-Item $html -ErrorAction SilentlyContinue
Get-Item $pngPath | Select-Object Name, Length
