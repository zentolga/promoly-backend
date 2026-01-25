$baseDir = "C:\Users\zento\Desktop\Projeler\Promoly V2\backend\storage\products"
New-Item -ItemType Directory -Force -Path $baseDir | Out-Null

$items = @{
    "Apfel"      = "https://png.pngtree.com/png-clipart/20230113/ourmid/pngtree-red-apple-fruit-png-image_6561494.png"
    "Banane"     = "https://png.pngtree.com/png-clipart/20220716/ourmid/pngtree-banana-yellow-fruit-banana-skewers-png-image_5944324.png"
    "Milch"      = "https://png.pngtree.com/png-clipart/20230426/original/pngtree-milk-carton-box-png-image_9099951.png"
    "Brot"       = "https://png.pngtree.com/png-clipart/20230504/original/pngtree-fresh-bread-and-wheat-png-image_9138350.png"
    "Käse"       = "https://png.pngtree.com/png-clipart/20231017/original/pngtree-cheese-gouda-isolated-png-image_13324622.png"
    "Wurst"      = "https://png.pngtree.com/png-clipart/20231001/original/pngtree-sausage-bratwurst-snack-png-image_13025232.png"
    "Wasser"     = "https://png.pngtree.com/png-clipart/20230414/original/pngtree-mineral-water-plastic-bottle-png-image_9056860.png"
    "Cola"       = "https://png.pngtree.com/png-clipart/20230427/original/pngtree-cola-drink-bottle-png-image_9115891.png"
    "Bier"       = "https://png.pngtree.com/png-clipart/20231118/original/pngtree-beer-glass-with-foam-png-image_13715201.png"
    "Wein"       = "https://png.pngtree.com/png-clipart/20230928/original/pngtree-red-wine-bottle-png-image_13006245.png"
    "Schokolade" = "https://png.pngtree.com/png-clipart/20230419/original/pngtree-chocolate-bar-pieces-png-image_9068069.png"
    "Chips"      = "https://png.pngtree.com/png-clipart/20230522/original/pngtree-potato-chips-snacks-png-image_9167666.png"
    "Pizza"      = "https://png.pngtree.com/png-clipart/20230325/original/pngtree-pizza-italian-food-png-image_9000494.png"
    "Nudeln"     = "https://png.pngtree.com/png-clipart/20231124/original/pngtree-pasta-raw-penne-png-image_13713601.png"
    "Reis"       = "https://png.pngtree.com/png-clipart/20230925/original/pngtree-rice-bowl-food-png-image_13000969.png"
    "Kaffee"     = "https://png.pngtree.com/png-clipart/20230502/original/pngtree-coffee-beans-pile-png-image_9133099.png"
}

foreach ($name in $items.Keys) {
    $url = $items[$name]
    $out = Join-Path $baseDir "$name.png"
    try {
        Invoke-WebRequest -Uri $url -OutFile $out
        Write-Host "Downloaded $name to $out"
    }
    catch {
        Write-Host "Failed to download $name"
    }
}
