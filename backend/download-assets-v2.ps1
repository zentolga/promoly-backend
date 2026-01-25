$baseDir = "C:\Users\zento\Desktop\Projeler\Promoly V2\backend\storage\products"
if (-not (Test-Path $baseDir)) { New-Item -ItemType Directory -Force -Path $baseDir | Out-Null }

$items = @{
    "Apfel"      = "https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg"
    "Banane"     = "https://upload.wikimedia.org/wikipedia/commons/4/44/Bananas_white_background_DS.jpg"
    "Milch"      = "https://upload.wikimedia.org/wikipedia/commons/c/c8/Milk_carton.jpg"
    "Brot"       = "https://upload.wikimedia.org/wikipedia/commons/7/71/Anpan_2016.jpg"
    "Käse"       = "https://upload.wikimedia.org/wikipedia/commons/8/89/Swiss_cheese_cubes.jpg"
    "Wurst"      = "https://upload.wikimedia.org/wikipedia/commons/5/5e/Bratwurst_sausage.jpg"
    "Wasser"     = "https://upload.wikimedia.org/wikipedia/commons/e/e4/Plastic_water_bottle.jpg"
    "Cola"       = "https://upload.wikimedia.org/wikipedia/commons/e/e8/15-09-26-RalfR-WLC-0098.jpg"
    "Bier"       = "https://upload.wikimedia.org/wikipedia/commons/3/36/Lager_beer_in_glass.jpg"
    "Wein"       = "https://upload.wikimedia.org/wikipedia/commons/e/e0/Red_Wine_Glass.jpg"
    "Schokolade" = "https://upload.wikimedia.org/wikipedia/commons/7/70/Chocolate_%28blue_background%29.jpg"
    "Chips"      = "https://upload.wikimedia.org/wikipedia/commons/6/69/Potato-Chips.jpg"
    "Pizza"      = "https://upload.wikimedia.org/wikipedia/commons/a/a3/Eq_it-na_pizza-margherita_sep2005_sml.jpg"
    "Nudeln"     = "https://upload.wikimedia.org/wikipedia/commons/6/6d/Fusilli_pasta.jpg"
    "Reis"       = "https://upload.wikimedia.org/wikipedia/commons/7/7b/White_rice.jpg"
    "Kaffee"     = "https://upload.wikimedia.org/wikipedia/commons/4/45/A_small_cup_of_coffee.JPG"
}

foreach ($name in $items.Keys) {
    $url = $items[$name]
    $out = Join-Path $baseDir "$name.png" # Saving as PNG extension even if source is JPG (browser handles it usually, or we convert)
    # Better: Save as is, but we need consistent naming for DB. 
    # Let's save as png for simplicity in DB, but content is JPG. Browser is smart.
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $out
        Write-Host "Downloaded $name to $out"
    }
    catch {
        Write-Host "Failed to download $name $_"
    }
}
