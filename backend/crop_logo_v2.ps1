Add-Type -Path "ImageProcessorV2.dll"
$baseDir = "c:\Users\zento\Desktop\Projeler\Promoly V2\backend\storage"
$src = Join-Path $baseDir "apples.png"
$dest = Join-Path $baseDir "logo.png"
Write-Host "Cropping V2 $src to $dest..."
[ImageProcessor]::CropLogo($src, $dest)
if (Test-Path $dest) { Write-Host "Success: $dest created." } else { Write-Host "Error: Dest validation failed." }
