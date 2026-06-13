import sys
import os
import math
from PIL import Image, ImageDraw, ImageFont
from moviepy.editor import VideoClip, AudioFileClip
from gtts import gTTS

def clean_text(prompt):
    text = prompt.strip()
    # Remove common starting phrases
    prefixes = [
        "generate a video of", 
        "generate a video showing", 
        "generate a video", 
        "generate", 
        "create a video of", 
        "create a video", 
        "create", 
        "video of"
    ]
    for prefix in prefixes:
        if text.lower().startswith(prefix):
            text = text[len(prefix):].strip()
    return text

def get_educational_words(cleaned_prompt):
    cleaned_lower = cleaned_prompt.lower()
    
    # Common educational categories
    categories = {
        "flower": "Rose Lily Tulip Lotus Sunflower Jasmine",
        "animal": "Lion Tiger Zebra Giraffe Elephant Monkey",
        "fruit": "Apple Banana Mango Orange Grape Cherry",
        "color": "Red Blue Green Yellow Pink Orange",
        "number": "One Two Three Four Five Six",
        "alphabet": "A B C D E F",
        "letter": "A B C D E F",
        "abcd": "A B C D E F",
        "vehicle": "Car Bike Bus Train Plane Boat",
        "shape": "Circle Square Triangle Star Heart Oval",
        "bird": "Sparrow Eagle Parrot Peacock Crow Dove",
        "vegetable": "Potato Tomato Onion Carrot Radish Pea"
    }
    
    # Check singular and plural
    for key, words in categories.items():
        if key in cleaned_lower or (key + "s") in cleaned_lower:
            return words
            
    # Default fallback: clean and take words from the prompt
    # Remove standard non-educational filler words
    words = cleaned_prompt.split()
    fillers = {"generate", "video", "of", "showing", "create", "show", "a", "an", "the", "for", "student", "students", "learn", "learning", "to", "give", "proper", "names", "name", "peoper"}
    cleaned_words = [w for w in words if w.lower() not in fillers]
    
    if not cleaned_words:
        cleaned_words = ["A", "B", "C", "D"]
        
    return " ".join(cleaned_words)

def main():
    if len(sys.argv) < 3:
        print("Usage: python localGenerator.py <prompt> <output_path>")
        sys.exit(1)

    prompt = sys.argv[1]
    output_path = sys.argv[2]
    
    cleaned_prompt = clean_text(prompt)
    print(f"Generating local video for prompt: '{prompt}' (Cleaned: '{cleaned_prompt}')")

    # Dimensions
    width, height = 1280, 720
    duration = 10
    fps = 15

    # Load font
    font_path = "C:\\Windows\\Fonts\\comicbd.ttf" # Kid-friendly Comic Sans Bold
    if not os.path.exists(font_path):
        font_path = "C:\\Windows\\Fonts\\arialbd.ttf"
    if not os.path.exists(font_path):
        font_path = None # Fallback

    # Parse what letters or words to show in circles
    # Check if custom display words are passed as the 3rd argument
    if len(sys.argv) >= 4 and sys.argv[3].strip():
        display_text = sys.argv[3].upper()
    else:
        display_text = get_educational_words(cleaned_prompt).upper()

    words = display_text.split()
    # Limit to maximum 6 circles to fit screen nicely
    words = words[:6]
    if not words:
        words = ["A", "B", "C", "D"]

    # Fun colors for the circles
    colors = [
        (255, 99, 71),   # Tomato Red
        (30, 144, 255),  # Dodger Blue
        (255, 215, 0),   # Gold Yellow
        (50, 205, 50),   # Lime Green
        (238, 130, 238), # Violet
        (255, 165, 0)    # Orange
    ]

    def make_frame(t):
        # Create gradient background shifting with time t
        img = Image.new("RGB", (width, height))
        draw = ImageDraw.Draw(img)

        shift = int(15 * math.sin(t * 0.8))
        r1, g1, b1 = 173 + shift, 216, 230 # Soft blue
        r2, g2, b2 = 255, 182 - shift, 193 # Soft pink

        for y in range(height):
            ratio = y / height
            r = int(r1 * (1 - ratio) + r2 * ratio)
            g = int(g1 * (1 - ratio) + g2 * ratio)
            b = int(b1 * (1 - ratio) + b2 * ratio)
            draw.line([(0, y), (width, y)], fill=(r, g, b))

        # Draw cute floating bubbles/stars in background
        for i in range(6):
            bx = 120 + i * 200
            by = 150 + int(40 * math.sin(t * 1.5 + i))
            radius = 25 + int(5 * math.cos(t * 2 + i))
            draw.ellipse([bx - radius, by - radius, bx + radius, by + radius], fill=(255, 255, 255, 80), outline=(255, 255, 255))

        # Render bouncing letter circles
        num_letters = len(words)
        spacing = 180
        total_width = (num_letters - 1) * spacing
        start_x = (width - total_width) // 2

        for idx, word in enumerate(words):
            font_size = 100 if len(word) > 2 else 120
            try:
                if font_path:
                    font = ImageFont.truetype(font_path, font_size)
                else:
                    font = ImageFont.load_default()
            except:
                font = ImageFont.load_default()

            # Bouncing bounce calculation
            bounce = int(60 * abs(math.sin(t * 2.5 - idx * 0.6)))
            x = start_x + idx * spacing
            y = 380 - bounce

            color = colors[idx % len(colors)]

            # Draw circle with white outline shadow
            draw.ellipse([x - 75, y - 75, x + 75, y + 75], fill=color, outline=(255, 255, 255), width=6)

            # Center text inside circle
            try:
                bbox = draw.textbbox((0, 0), word, font=font)
                w = bbox[2] - bbox[0]
                h = bbox[3] - bbox[1]
            except:
                w, h = 50, 70

            tx = x - w // 2
            ty = y - h // 2 - 8
            
            # Shadow
            draw.text((tx + 3, ty + 3), word, fill=(0, 0, 0, 50), font=font)
            # Text
            draw.text((tx, ty), word, fill=(255, 255, 255), font=font)

        # Draw a bottom banner capsule with text
        banner_font_size = 36
        try:
            if font_path:
                b_font = ImageFont.truetype(font_path, banner_font_size)
            else:
                b_font = ImageFont.load_default()
        except:
            b_font = ImageFont.load_default()

        banner_text = f"Learning is Fun! - {cleaned_prompt.capitalize()}"
        try:
            bbox = draw.textbbox((0, 0), banner_text, font=b_font)
            bw = bbox[2] - bbox[0]
        except:
            bw = 400

        bx = (width - bw) // 2
        by = height - 120

        # Draw capsule shape
        draw.rounded_rectangle([bx - 20, by - 10, bx + bw + 20, by + 50], radius=15, fill=(255, 255, 255), outline=(100, 50, 150), width=2)
        draw.text((bx, by), banner_text, fill=(100, 50, 150), font=b_font)

        import numpy as np
        return np.array(img)

    # Generate voiceover using gTTS
    try:
        speech_text = ", ".join(words).title()
            
        print(f"Generating voiceover: '{speech_text}'")
        tts = gTTS(text=speech_text, lang='en')
        temp_audio_path = output_path.replace(".mp4", "_temp.mp3")
        tts.save(temp_audio_path)
        
        # Load the audio and combine with video clip
        audio_clip = AudioFileClip(temp_audio_path)
        clip = VideoClip(make_frame, duration=duration)
        clip = clip.set_audio(audio_clip)
        
        # Write to file with audio codec
        clip.write_videofile(output_path, fps=fps, codec="libx264", audio_codec="aac", logger=None)
        
        # Close handles and clean up
        clip.close()
        audio_clip.close()
        try:
            os.remove(temp_audio_path)
        except:
            pass
    except Exception as e:
        print(f"Failed to generate audio or combine clip, falling back to silent render. Error: {e}")
        clip = VideoClip(make_frame, duration=duration)
        clip.write_videofile(output_path, fps=fps, codec="libx264", audio=False, logger=None)
        clip.close()

    print(f"Successfully generated offline video at: {output_path}")

if __name__ == "__main__":
    main()
