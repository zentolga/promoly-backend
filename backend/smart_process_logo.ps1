Add-Type -Path "ImageProcessorV6.dll"
$p = "c:\Users\zento\Desktop\Projeler\Promoly V2\backend\storage\logo.png"
Write-Host "Smart Processing $p..."
[ImageProcessor]::SmartRemoveBackground($p)
[ImageProcessor]::AutoCrop($p)
Write-Host "Smart Process Finished."
