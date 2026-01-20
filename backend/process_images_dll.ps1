Add-Type -Path "ImageProcessor.dll"

$baseDir = "c:\Users\zento\Desktop\Projeler\Promoly V2\backend\storage"
$targets = @("apples.png", "bananas.png", "cheese.png", "chicken.png", "tomatoes.png", "milk.png", "oranges.png", "sausages.png", "beef.png", "nutella.png", "water.png", "juice.png")

foreach ($t in $targets) {
    $fullPath = Join-Path $baseDir $t
    if (Test-Path $fullPath) {
        Write-Host "Processing $t..."
        [ImageProcessor]::Process($fullPath)
    }
    else {
        Write-Host "Skipping $t (Not Found)"
    }
}
