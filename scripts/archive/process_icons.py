import os
from PIL import Image, ImageDraw

def create_circular_mask(size):
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0) + size, fill=255)
    return mask

def make_round_icon(img, size):
    resized = img.resize(size, Image.Resampling.LANCZOS)
    mask = create_circular_mask(size)
    round_img = Image.new("RGBA", size, (0, 0, 0, 0))
    round_img.paste(resized, (0, 0), mask=mask)
    return round_img

def make_adaptive_foreground(img, canvas_size):
    foreground_size = int(canvas_size[0] * 0.65)
    resized_logo = img.resize((foreground_size, foreground_size), Image.Resampling.LANCZOS)
    
    mask = Image.new("L", (foreground_size, foreground_size), 0)
    draw = ImageDraw.Draw(mask)
    corner_radius = int(foreground_size * 0.15)
    draw.rounded_rectangle((0, 0, foreground_size, foreground_size), radius=corner_radius, fill=255)
    
    rounded_logo = Image.new("RGBA", (foreground_size, foreground_size), (0, 0, 0, 0))
    rounded_logo.paste(resized_logo, (0, 0), mask=mask)
    
    canvas = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    offset = ((canvas_size[0] - foreground_size) // 2, (canvas_size[1] - foreground_size) // 2)
    canvas.paste(rounded_logo, offset)
    return canvas

def main():
    source_path = "/Users/bekir/.gemini/antigravity/brain/0527343b-dc13-4cb3-83aa-97185dbd0eeb/erva_film_partisi_logo_1783449587402.jpg"
    print(f"Loading source image from {source_path}")
    img = Image.open(source_path).convert("RGBA")
    
    # Target 1: Chrome Extension icon
    ext_icon_dir = "/Users/bekir/Uygulamalarım/12-FilmSync/extension"
    os.makedirs(ext_icon_dir, exist_ok=True)
    ext_icon_path = os.path.join(ext_icon_dir, "icon.png")
    ext_img = img.resize((256, 256), Image.Resampling.LANCZOS)
    mask = Image.new("L", (256, 256), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, 256, 256), radius=48, fill=255)
    ext_rounded = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    ext_rounded.paste(ext_img, (0, 0), mask=mask)
    ext_rounded.save(ext_icon_path, "PNG")
    print(f"Saved extension icon to {ext_icon_path}")
    
    # Target 2: Web Frontend logo
    web_assets_dir = "/Users/bekir/Uygulamalarım/12-FilmSync/mobile/src/assets"
    os.makedirs(web_assets_dir, exist_ok=True)
    web_logo_path = os.path.join(web_assets_dir, "logo.png")
    ext_rounded.save(web_logo_path, "PNG")
    print(f"Saved web logo to {web_logo_path}")
    
    # Target 3: Android Res launcher icons
    android_res_dir = "/Users/bekir/Uygulamalarım/12-FilmSync/mobile/android/app/src/main/res"
    
    configs = [
        ("mdpi", (48, 48), (108, 108)),
        ("hdpi", (72, 72), (162, 162)),
        ("xhdpi", (96, 96), (216, 216)),
        ("xxhdpi", (144, 144), (324, 324)),
        ("xxxhdpi", (192, 192), (432, 432)),
    ]
    
    for density, size, fore_size in configs:
        density_dir = os.path.join(android_res_dir, f"mipmap-{density}")
        os.makedirs(density_dir, exist_ok=True)
        
        icon_img = img.resize(size, Image.Resampling.LANCZOS)
        mask_sq = Image.new("L", size, 0)
        draw_sq = ImageDraw.Draw(mask_sq)
        draw_sq.rounded_rectangle((0, 0) + size, radius=int(size[0]*0.18), fill=255)
        sq_rounded = Image.new("RGBA", size, (0, 0, 0, 0))
        sq_rounded.paste(icon_img, (0, 0), mask=mask_sq)
        sq_rounded.save(os.path.join(density_dir, "ic_launcher.png"), "PNG")
        
        round_icon = make_round_icon(img, size)
        round_icon.save(os.path.join(density_dir, "ic_launcher_round.png"), "PNG")
        
        fore_icon = make_adaptive_foreground(img, fore_size)
        fore_icon.save(os.path.join(density_dir, "ic_launcher_foreground.png"), "PNG")
        
        print(f"Processed icons for mipmap-{density}")
        
    print("All icons successfully generated and saved!")

if __name__ == "__main__":
    main()
