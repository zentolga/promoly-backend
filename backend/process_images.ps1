$code = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

public class ImageProcessor {
    public static void Process(string filePath) {
        if (!File.Exists(filePath)) {
            Console.WriteLine("File not found: " + filePath);
            return;
        }
        try {
            byte[] bytes = File.ReadAllBytes(filePath);
            using (MemoryStream ms = new MemoryStream(bytes))
            using (Bitmap original = new Bitmap(ms)) {
                using (Bitmap newImg = new Bitmap(original.Width, original.Height)) {
                    // 96 DPI fix? Keep original resolution
                    newImg.SetResolution(original.HorizontalResolution, original.VerticalResolution);

                    using (Graphics g = Graphics.FromImage(newImg)) {
                        g.DrawImage(original, 0, 0);
                    }
                    
                    Rectangle rect = new Rectangle(0, 0, newImg.Width, newImg.Height);
                    BitmapData bmpData = newImg.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
                    
                    unsafe {
                        byte* ptr = (byte*)bmpData.Scan0;
                        int bytesCount = Math.Abs(bmpData.Stride) * newImg.Height;
                        
                        for (int i = 0; i < bytesCount; i += 4) {
                            byte b = ptr[i];
                            byte g = ptr[i+1];
                            byte r = ptr[i+2];
                            
                            // Threshold: remove white background
                            if (r > 240 && g > 240 && b > 240) {
                                ptr[i+3] = 0;
                            }
                        }
                    }
                    
                    newImg.UnlockBits(bmpData);
                    newImg.Save(filePath, ImageFormat.Png);
                    Console.WriteLine("Success: " + filePath);
                }
            }
        } catch (Exception ex) {
            Console.WriteLine("Error on " + filePath + ": " + ex.Message);
        }
    }
}
"@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing -CompilerOptions "/unsafe"

$baseDir = "c:\Users\zento\Desktop\Projeler\Promoly V2\backend\storage"
$targets = @("apples.png", "bananas.png", "cheese.png", "chicken.png", "tomatoes.png")

foreach ($t in $targets) {
    $fullPath = Join-Path $baseDir $t
    if (Test-Path $fullPath) {
        [ImageProcessor]::Process($fullPath)
    }
    else {
        Write-Host "Not Found: $fullPath"
    }
}
