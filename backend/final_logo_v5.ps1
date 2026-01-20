Add-Type -Path "ImageProcessorV5.dll"
$p = "c:\Users\zento\Desktop\Projeler\Promoly V2\backend\storage\logo.png"
Write-Host "Processing V5 $p..."
[ImageProcessor]::RemoveWhiteBackground($p)
[ImageProcessor]::AutoCrop($p)
Write-Host "Finished."
