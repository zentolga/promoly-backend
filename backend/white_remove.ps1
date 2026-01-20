Add-Type -Path "ImageProcessorV3.dll"
$path = "c:\Users\zento\Desktop\Projeler\Promoly V2\backend\storage\logo.png"
Write-Host "Removing white bg from $path..."
[ImageProcessor]::RemoveWhiteBackground($path)
Write-Host "Finished."
