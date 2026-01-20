Add-Type -Path "ImageProcessorV4.dll"
$p = "c:\Users\zento\Desktop\Projeler\Promoly V2\backend\storage\logo.png"
Write-Host "Processing $p..."
[ImageProcessor]::RemoveWhiteBackground($p)
[ImageProcessor]::AutoCrop($p)
Write-Host "Done."
