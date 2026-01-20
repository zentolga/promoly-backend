Add-Type -Path "ImageProcessor.dll"
$baseDir = "c:\Users\zento\Desktop\Projeler\Promoly V2\backend\storage"
$src = Join-Path $baseDir "apples.png"
$dest = Join-Path $baseDir "logo.png"
Write-Host "Cropping $src to $dest..."
[ImageProcessor]::CropLogo($src, $dest)
Write-Host "Done."
