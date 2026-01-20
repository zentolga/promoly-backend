using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

public class ImageProcessor {
    public static void SmartRemoveBackground(string filePath) {
        if (!File.Exists(filePath)) return;
        try {
            using (Bitmap bmp = new Bitmap(filePath)) {
                int w = bmp.Width;
                int h = bmp.Height;
                using (Bitmap newImg = new Bitmap(w, h, PixelFormat.Format32bppArgb)) {
                    using (Graphics g = Graphics.FromImage(newImg)) {
                        g.Clear(Color.Transparent);
                        g.DrawImage(bmp, 0, 0);
                    }

                    // Flood fill transparency from corners/edges
                    bool[,] visited = new bool[w, h];
                    Queue<Point> queue = new Queue<Point>();

                    // Add all edge pixels that are "white-ish"
                    for (int x = 0; x < w; x++) {
                        AddIfWhite(newImg, x, 0, visited, queue);
                        AddIfWhite(newImg, x, h - 1, visited, queue);
                    }
                    for (int y = 0; y < h; y++) {
                        AddIfWhite(newImg, 0, y, visited, queue);
                        AddIfWhite(newImg, w - 1, y, visited, queue);
                    }

                    while (queue.Count > 0) {
                        Point p = queue.Dequeue();
                        // Set this pixel to transparent
                        newImg.SetPixel(p.X, p.Y, Color.Transparent);

                        // Check neighbors
                        int[] dx = { 0, 0, 1, -1 };
                        int[] dy = { 1, -1, 0, 0 };
                        for (int i = 0; i < 4; i++) {
                            int nx = p.X + dx[i];
                            int ny = p.Y + dy[i];
                            if (nx >= 0 && nx < w && ny >= 0 && ny < h && !visited[nx, ny]) {
                                AddIfWhite(newImg, nx, ny, visited, queue);
                            }
                        }
                    }

                    // Save the result
                    newImg.Save(filePath, ImageFormat.Png);
                    Console.WriteLine("Smart BG removal completed: " + filePath);
                }
            }
        } catch (Exception ex) {
            Console.WriteLine("Smart removal error: " + ex.Message);
        }
    }

    private static void AddIfWhite(Bitmap bmp, int x, int y, bool[,] visited, Queue<Point> queue) {
        Color c = bmp.GetPixel(x, y);
        // RGB > 235 is white-ish. 
        if (!visited[x, y] && c.A > 0 && c.R > 235 && c.G > 235 && c.B > 235) {
            visited[x, y] = true;
            queue.Enqueue(new Point(x, y));
        }
    }

    public static void AutoCrop(string filePath) {
        if (!File.Exists(filePath)) return;
        try {
            Bitmap cropped = null;
            using (Bitmap original = new Bitmap(filePath)) {
                int minX = original.Width, minY = original.Height, maxX = 0, maxY = 0;
                bool found = false;
                for (int y = 0; y < original.Height; y++) {
                    for (int x = 0; x < original.Width; x++) {
                        Color c = original.GetPixel(x, y);
                        if (c.A > 10) {
                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                            found = true;
                        }
                    }
                }
                if (found) {
                    int padding = 5;
                    minX = Math.Max(0, minX - padding);
                    minY = Math.Max(0, minY - padding);
                    maxX = Math.Min(original.Width - 1, maxX + padding);
                    maxY = Math.Min(original.Height - 1, maxY + padding);
                    int w = maxX - minX + 1;
                    int h = maxY - minY + 1;
                    cropped = new Bitmap(w, h);
                    using (Graphics g = Graphics.FromImage(cropped)) {
                        g.Clear(Color.Transparent);
                        g.DrawImage(original, new Rectangle(0, 0, w, h), new Rectangle(minX, minY, w, h), GraphicsUnit.Pixel);
                    }
                }
            }
            if (cropped != null) {
                cropped.Save(filePath, ImageFormat.Png);
                cropped.Dispose();
                Console.WriteLine("AutoCropped: " + filePath);
            }
        } catch (Exception ex) { Console.WriteLine("AutoCrop Err: " + ex.Message); }
    }

    public static void Process(string f) {}
    public static void CropLogo(string s, string d) {}
    public static void RemoveWhiteBackground(string f) { SmartRemoveBackground(f); }
}
