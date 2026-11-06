import os
import math
from PIL import Image, ImageDraw, ImageFont

def get_font(size, bold=False):
    # Try finding system fonts on Windows
    font_paths = [
        "C:\\Windows\\Fonts\\segoeui.ttf" if not bold else "C:\\Windows\\Fonts\\segoeuib.ttf",
        "C:\\Windows\\Fonts\\arial.ttf" if not bold else "C:\\Windows\\Fonts\\arialbd.ttf",
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except:
                pass
    return ImageFont.load_default()

WIDTH, HEIGHT = 900, 560
BG_COLOR = (248, 250, 252) # slate-50
CARD_BG = (255, 255, 255)
TEXT_DARK = (15, 23, 42)
TEXT_MUTED = (100, 116, 139)
ACCENT_PURPLE = (99, 102, 241) # indigo-500
ACCENT_DARK = (79, 70, 229) # indigo-600

font_title = get_font(28, bold=True)
font_subtitle = get_font(14, bold=False)
font_input = get_font(14, bold=False)
font_btn = get_font(14, bold=True)
font_card_title = get_font(16, bold=True)
font_card_body = get_font(12, bold=False)
font_badge = get_font(11, bold=True)

frames = []

def draw_header(draw):
    # App Logo and Name
    draw.rounded_rectangle([(30, 20), (52, 42)], radius=6, fill=ACCENT_DARK)
    draw.text((41, 31), "S", fill=(255, 255, 255), anchor="mm", font=get_font(14, bold=True))
    draw.text((60, 31), "ShipHype", fill=TEXT_DARK, anchor="lm", font=get_font(16, bold=True))
    
    # Top tags
    draw.rounded_rectangle([(140, 22), (195, 40)], radius=9, fill=(238, 242, 255), outline=(199, 210, 254))
    draw.text((167, 31), "V1 BETA", fill=ACCENT_DARK, anchor="mm", font=font_badge)

    # Right pills
    draw.rounded_rectangle([(770, 20), (870, 42)], radius=11, fill=(15, 23, 42))
    draw.text((820, 31), "GitHub Sync", fill=(255, 255, 255), anchor="mm", font=get_font(11, bold=True))

# ----------------- SCENE 1: Typing PR URL (8 frames) -----------------
pr_url = "https://github.com/NoneButACoder/ShoppinggWebSite/pull/1"

for i in range(1, 10):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw)

    # Hero headline
    draw.text((WIDTH//2, 100), "Stop procrastinating your release announcements", fill=TEXT_DARK, anchor="mm", font=font_title)
    draw.text((WIDTH//2, 135), "Paste any GitHub PR. Get an accurate changelog, 3 tweet drafts, and a Bento card in seconds.", fill=TEXT_MUTED, anchor="mm", font=font_subtitle)

    # Input Box Container
    input_box = [(120, 180), (780, 234)]
    draw.rounded_rectangle(input_box, radius=14, fill=CARD_BG, outline=(203, 213, 225), width=2)

    # Typing partial text
    chars_to_show = int(len(pr_url) * (i / 9.0))
    current_text = pr_url[:chars_to_show]
    draw.text((140, 207), current_text, fill=TEXT_DARK, anchor="lm", font=font_input)

    # Cursor blink
    if i % 2 == 1:
        tx_width = draw.textlength(current_text, font=font_input)
        draw.line([(142 + tx_width, 196), (142 + tx_width, 218)], fill=ACCENT_PURPLE, width=2)

    # Generate Button (Idle)
    btn_box = [(640, 188), (772, 226)]
    draw.rounded_rectangle(btn_box, radius=10, fill=ACCENT_DARK)
    draw.text((706, 207), "Generate Hype", fill=(255, 255, 255), anchor="mm", font=font_btn)

    frames.append(img)

# ----------------- SCENE 2: Click Button (4 frames) -----------------
for i in range(4):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw)

    draw.text((WIDTH//2, 100), "Stop procrastinating your release announcements", fill=TEXT_DARK, anchor="mm", font=font_title)
    draw.text((WIDTH//2, 135), "Paste any GitHub PR. Get an accurate changelog, 3 tweet drafts, and a Bento card in seconds.", fill=TEXT_MUTED, anchor="mm", font=font_subtitle)

    input_box = [(120, 180), (780, 234)]
    draw.rounded_rectangle(input_box, radius=14, fill=CARD_BG, outline=ACCENT_PURPLE, width=2)
    draw.text((140, 207), pr_url, fill=TEXT_DARK, anchor="lm", font=font_input)

    # Button Pressed / Hover State with Cursor
    btn_box = [(640, 188), (772, 226)]
    draw.rounded_rectangle(btn_box, radius=10, fill=(67, 56, 202)) # darker indigo
    draw.text((706, 207), "Analyzing PR...", fill=(255, 255, 255), anchor="mm", font=font_btn)

    # Draw Mouse Cursor
    cursor_x, cursor_y = 715, 212
    draw.polygon([(cursor_x, cursor_y), (cursor_x+10, cursor_y+10), (cursor_x+4, cursor_y+12), (cursor_x+7, cursor_y+20), (cursor_x+3, cursor_y+21), (cursor_x, cursor_y+14), (cursor_x-4, cursor_y+18)], fill=(15, 23, 42), outline=(255, 255, 255))

    frames.append(img)

# ----------------- SCENE 3: AI Generation Sparkle Loading (6 frames) -----------------
for step in range(6):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw)

    # Loading Center Card
    center_box = [(220, 180), (680, 360)]
    draw.rounded_rectangle(center_box, radius=20, fill=CARD_BG, outline=(226, 232, 240), width=1)

    # Spinner dots
    angle = step * (360 / 6)
    rad = math.radians(angle)
    cx, cy = WIDTH // 2, 250
    dot_x = cx + int(18 * math.cos(rad))
    dot_y = cy + int(18 * math.sin(rad))
    draw.ellipse([(cx-22, cy-22), (cx+22, cy+22)], outline=(224, 231, 255), width=3)
    draw.ellipse([(dot_x-5, dot_y-5), (dot_x+5, dot_y+5)], fill=ACCENT_DARK)

    draw.text((WIDTH//2, 295), "Gemini 2.5 AI is crafting launch materials...", fill=TEXT_DARK, anchor="mm", font=font_card_title)
    stages = ["Parsing git commit diffs...", "Writing 3 tweet angles...", "Designing 1200x630 Bento card..."]
    draw.text((WIDTH//2, 322), stages[step % len(stages)], fill=ACCENT_MUTED if 'ACCENT_MUTED' in globals() else TEXT_MUTED, anchor="mm", font=font_subtitle)

    frames.append(img)

# ----------------- SCENE 4: Results Displayed (12 frames to let viewer read) -----------------
for i in range(12):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw)

    # Workspace Sub-header
    draw.text((40, 75), "🎉 Generated Launch Assets for ShoppinggWebSite v1.2.0", fill=TEXT_DARK, anchor="lm", font=get_font(20, bold=True))
    draw.rounded_rectangle([(660, 62), (760, 88)], radius=8, fill=(240, 253, 244), outline=(187, 247, 208))
    draw.text((710, 75), "✓ Saved Draft", fill=(22, 101, 52), anchor="mm", font=font_badge)

    draw.rounded_rectangle([(770, 62), (860, 88)], radius=8, fill=ACCENT_DARK)
    draw.text((815, 75), "Publish ↗", fill=(255, 255, 255), anchor="mm", font=font_badge)

    # Left: Tweet Drafts Column
    left_card = [(40, 105), (430, 520)]
    draw.rounded_rectangle(left_card, radius=16, fill=CARD_BG, outline=(226, 232, 240), width=1)
    
    # Tweet tab
    draw.rounded_rectangle([(56, 120), (160, 142)], radius=6, fill=(241, 245, 249))
    draw.text((108, 131), "Draft 1: Bullet Hype", fill=TEXT_DARK, anchor="mm", font=get_font(11, bold=True))

    tweet_content = (
        "Just shipped ShoppinggWebSite v1.2.0! 🚀\n\n"
        "⚡ What's New:\n"
        "• Instant checkout coupons & promo codes\n"
        "• 60fps responsive cart drawer animation\n"
        "• Accurate pricing rounding on sales\n\n"
        "Check out our live changelog below 👇\n"
        "#buildinpublic #ecommerce"
    )
    draw.text((56, 160), tweet_content, fill=(30, 41, 59), font=font_card_body, spacing=4)

    # Tweet action buttons
    draw.rounded_rectangle([(56, 360), (160, 392)], radius=8, fill=(15, 23, 42))
    draw.text((108, 376), "Post to X 𝕏", fill=(255, 255, 255), anchor="mm", font=font_badge)
    
    draw.rounded_rectangle([(170, 360), (260, 392)], radius=8, fill=(248, 250, 252), outline=(203, 213, 225))
    draw.text((215, 376), "Copy Text", fill=TEXT_DARK, anchor="mm", font=font_badge)

    # Right: Bento Card Preview Column
    right_card = [(450, 105), (860, 520)]
    draw.rounded_rectangle(right_card, radius=16, fill=CARD_BG, outline=(226, 232, 240), width=1)

    # Mini Bento Card Rendering (Dark theme simulation)
    mini_bento = [(466, 120), (844, 340)]
    draw.rounded_rectangle(mini_bento, radius=12, fill=(9, 9, 11))
    
    # Bento header
    draw.rounded_rectangle([(482, 136), (544, 154)], radius=8, fill=ACCENT_DARK)
    draw.text((513, 145), "V1.2.0", fill=(255, 255, 255), anchor="mm", font=font_badge)
    draw.text((558, 145), "NoneButACoder/ShoppinggWebSite", fill=(113, 113, 122), anchor="lm", font=font_badge)

    draw.text((482, 180), "ShoppinggWebSite v1.2.0 Update", fill=(255, 255, 255), font=get_font(18, bold=True))
    draw.text((482, 208), "Instant checkout coupons, faster drawer & bug fixes.", fill=(161, 161, 170), font=font_card_body)

    # Bento 3 mini pills
    for idx, feat in enumerate(["Instant promo codes", "60fps animations", "Pricing fixes"]):
        bx = 482 + idx * 118
        draw.rounded_rectangle([(bx, 240), (bx + 112, 310)], radius=8, fill=(24, 24, 27), outline=(39, 39, 42))
        draw.text((bx + 10, 255), f"FEAT 0{idx+1}", fill=ACCENT_PURPLE, font=get_font(9, bold=True))
        draw.text((bx + 10, 275), feat, fill=(228, 228, 231), font=get_font(10, bold=False))

    # Right card actions
    draw.rounded_rectangle([(466, 360), (590, 396)], radius=8, fill=ACCENT_DARK)
    draw.text((528, 378), "📋 Copy Image PNG", fill=(255, 255, 255), anchor="mm", font=font_badge)

    draw.rounded_rectangle([(600, 360), (710, 396)], radius=8, fill=(248, 250, 252), outline=(203, 213, 225))
    draw.text((655, 378), "💾 Download 1200x630", fill=TEXT_DARK, anchor="mm", font=font_badge)

    frames.append(img)

output_path = r"C:\Users\85227\.gemini\antigravity\brain\eaf3dbd9-e677-4fa9-8e32-59ec35eefb10\shiphype_demo.gif"

# Frame durations: typing fast, loading moderate, result paused
durations = [120] * 9 + [250] * 4 + [300] * 6 + [600] * 12

frames[0].save(
    output_path,
    save_all=True,
    append_images=frames[1:],
    duration=durations,
    loop=0,
    optimize=True
)
print("SUCCESS:", output_path, os.path.getsize(output_path))
