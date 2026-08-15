from pathlib import Path
from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "night-compass-three-city-pack.pdf"
IMAGES = ROOT / "public" / "images"

PAGE_W, PAGE_H = A4
BLACK = HexColor("#0e0e0f")
CHARCOAL = HexColor("#181819")
CREAM = HexColor("#eee9e0")
MUTED = HexColor("#8f8a82")
RUST = HexColor("#d46537")
INK = HexColor("#171718")


def register_fonts():
    font_dir = Path("C:/Windows/Fonts")
    regular = font_dir / "arial.ttf"
    bold = font_dir / "arialbd.ttf"
    impact = font_dir / "impact.ttf"
    if regular.exists():
        pdfmetrics.registerFont(TTFont("NCBody", str(regular)))
    if bold.exists():
        pdfmetrics.registerFont(TTFont("NCBold", str(bold)))
    if impact.exists():
        pdfmetrics.registerFont(TTFont("NCDisplay", str(impact)))


register_fonts()
BODY = "NCBody" if "NCBody" in pdfmetrics.getRegisteredFontNames() else "Helvetica"
BOLD = "NCBold" if "NCBold" in pdfmetrics.getRegisteredFontNames() else "Helvetica-Bold"
DISPLAY = "NCDisplay" if "NCDisplay" in pdfmetrics.getRegisteredFontNames() else BOLD


def cover_image(c, path, x, y, w, h, darken=0.0):
    image = ImageReader(str(path))
    iw, ih = image.getSize()
    scale = max(w / iw, h / ih)
    sw, sh = iw * scale, ih * scale
    c.saveState()
    clip = c.beginPath()
    clip.rect(x, y, w, h)
    c.clipPath(clip, stroke=0, fill=0)
    c.drawImage(image, x - (sw - w) / 2, y - (sh - h) / 2, sw, sh, mask="auto")
    if darken:
        c.setFillColor(Color(0, 0, 0, alpha=darken))
        c.rect(x, y, w, h, stroke=0, fill=1)
    c.restoreState()


def wrap_lines(text, font, size, width):
    words = text.split()
    lines, current = [], ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if pdfmetrics.stringWidth(candidate, font, size) <= width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_wrapped(c, text, x, y, width, font=BODY, size=10.4, leading=15, color=INK):
    c.setFont(font, size)
    c.setFillColor(color)
    for paragraph in text.split("\n"):
        if not paragraph:
            y -= leading * 0.55
            continue
        for line in wrap_lines(paragraph, font, size, width):
            c.drawString(x, y, line)
            y -= leading
    return y


def draw_bullets(c, items, x, y, width, size=10.2, leading=15):
    for item in items:
        c.setFillColor(RUST)
        c.circle(x + 3, y + 3, 2.2, stroke=0, fill=1)
        y = draw_wrapped(c, item, x + 14, y, width - 14, BODY, size, leading, INK) - 7
    return y


def page_base(c, page_no, section):
    c.setFillColor(CREAM)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    c.setFillColor(BLACK)
    c.rect(0, PAGE_H - 42, PAGE_W, 42, stroke=0, fill=1)
    c.setFont(BOLD, 8)
    c.setFillColor(CREAM)
    c.drawString(36, PAGE_H - 27, "NIGHT COMPASS JAPAN")
    c.setFillColor(RUST)
    c.drawRightString(PAGE_W - 36, PAGE_H - 27, section.upper())
    c.setStrokeColor(HexColor("#c6beb2"))
    c.line(36, 30, PAGE_W - 36, 30)
    c.setFillColor(MUTED)
    c.setFont(BODY, 7.5)
    c.drawString(36, 17, "Source-checked travel intelligence. Verify schedules and venue conditions on the day.")
    c.drawRightString(PAGE_W - 36, 17, f"{page_no:02d}")


def section_title(c, number, kicker, title, subtitle=None):
    c.setFillColor(RUST)
    c.setFont(BOLD, 8)
    c.drawString(42, PAGE_H - 76, f"{number} / {kicker.upper()}")
    c.setFillColor(INK)
    c.setFont(DISPLAY, 30)
    c.drawString(42, PAGE_H - 118, title.upper())
    if subtitle:
        draw_wrapped(c, subtitle, 42, PAGE_H - 142, PAGE_W - 84, BODY, 10, 14, MUTED)


def heading(c, text, x, y):
    c.setFillColor(RUST)
    c.setFont(BOLD, 9)
    c.drawString(x, y, text.upper())
    return y - 21


def source_link(c, label, url, x, y, width):
    lines = wrap_lines(label, BODY, 7.6, width)
    c.setFont(BODY, 7.6)
    c.setFillColor(HexColor("#6a655e"))
    for line in lines:
        c.drawString(x, y, line)
        c.linkURL(url, (x, y - 2, x + min(width, pdfmetrics.stringWidth(line, BODY, 7.6)), y + 9), relative=0)
        y -= 11
    return y - 3


def create_pdf():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    c.setTitle("Night Compass Japan - Three-City First Night Pack")
    c.setAuthor("Night Compass Japan")
    c.setSubject("Source-checked nightlife safety and culture guide for Tokyo, Nagoya and Hamamatsu")

    # 01 Cover
    panel_w = PAGE_W / 3
    cover_image(c, IMAGES / "tokyo-night-editorial.jpg", 0, 0, panel_w, PAGE_H, 0.34)
    cover_image(c, IMAGES / "nagoya-night-editorial.jpg", panel_w, 0, panel_w, PAGE_H, 0.34)
    cover_image(c, IMAGES / "hamamatsu-night-editorial.jpg", panel_w * 2, 0, panel_w, PAGE_H, 0.34)
    c.setFillColor(Color(0, 0, 0, alpha=0.72))
    c.rect(0, PAGE_H - 312, PAGE_W, 312, stroke=0, fill=1)
    c.setFillColor(CREAM)
    c.setFont(BOLD, 9)
    c.drawString(40, PAGE_H - 56, "INDEPENDENT NIGHT DESK / 2026 EDITION")
    c.setFont(DISPLAY, 47)
    c.drawString(38, PAGE_H - 120, "NIGHT COMPASS")
    c.drawString(38, PAGE_H - 173, "JAPAN")
    c.setStrokeColor(RUST)
    c.setLineWidth(4)
    c.line(40, PAGE_H - 198, 250, PAGE_H - 198)
    c.setFont(DISPLAY, 25)
    c.drawString(40, PAGE_H - 238, "THREE-CITY FIRST NIGHT PACK")
    c.setFont(BODY, 11)
    c.setFillColor(HexColor("#d8d2c9"))
    c.drawString(40, PAGE_H - 266, "Tokyo / Nagoya / Hamamatsu")
    c.setFont(BOLD, 8)
    c.setFillColor(CREAM)
    c.drawString(40, 45, "SOURCE-CHECKED. STREET-READY. NO FAKE INSIDER TALK.")
    c.showPage()

    # 02 Use this pack
    page_base(c, 2, "Start here")
    section_title(c, "01", "Start here", "Use this pack", "A short operating manual for your first night in each city.")
    y = PAGE_H - 185
    y = heading(c, "What this guide does", 42, y)
    y = draw_wrapped(c, "This pack turns official police, tourism and transport information into decisions you can use before entering a venue, ordering a drink or committing to the trip home. It does not certify individual businesses as permanently safe.", 42, y, 510)
    y -= 18
    y = heading(c, "The four-step loop", 42, y)
    y = draw_bullets(c, [
        "Choose the district before you start drinking.",
        "Choose the venue yourself - never surrender that decision to a tout or a brand-new match.",
        "Confirm the full price before the first order.",
        "Decide the route home before the final round.",
    ], 42, y, 510)
    y -= 12
    y = heading(c, "Save these now", 42, y)
    c.setFillColor(CHARCOAL)
    c.roundRect(42, y - 108, 510, 108, 4, stroke=0, fill=1)
    c.setFillColor(CREAM)
    c.setFont(BOLD, 18)
    c.drawString(62, y - 34, "110  POLICE")
    c.drawString(235, y - 34, "119  FIRE / AMBULANCE")
    c.setFont(BODY, 9)
    c.setFillColor(HexColor("#c9c2b8"))
    c.drawString(62, y - 63, "JNTO Visitor Hotline: +81 50 3816 2787")
    c.drawString(62, y - 83, "Available 24/7 in English, Chinese and Korean.")
    c.showPage()

    # 03 Tokyo
    page_base(c, 3, "Tokyo")
    cover_image(c, IMAGES / "tokyo-night-editorial.jpg", 318, 410, 235, 300, 0.08)
    section_title(c, "02", "Tokyo", "The fast night", "Shinjuku gives you more choice and more pressure. Slow the decision down.")
    y = PAGE_H - 185
    y = heading(c, "The Tokyo rule", 42, y)
    y = draw_wrapped(c, "You choose the venue, you understand the price, and you keep your card in your possession. A friendly street approach or fluent English does not change that rule.", 42, y, 248)
    y -= 15
    y = heading(c, "Four checks before entry", 42, y)
    y = draw_bullets(c, [
        "Did you find the venue independently?",
        "Are table charge, tax, service fee and time limit clear?",
        "Is a new online match insisting on this exact bar?",
        "Can you name your route home and emergency option?",
    ], 42, y, 248, 9.6, 14)
    y = 370
    y = heading(c, "If the bill looks wrong", 42, y)
    y = draw_wrapped(c, "Ask for an itemized bill. Do not hand over your card while the amount is unclear. If you feel threatened or prevented from leaving, call 110 or move toward a koban police box.", 42, y, 510)
    y -= 14
    y = heading(c, "Useful phrase", 42, y)
    c.setFont(BOLD, 15)
    c.setFillColor(INK)
    c.drawString(42, y, "Zenbu de ikura desu ka?")
    c.setFont(BODY, 9.5)
    c.setFillColor(MUTED)
    c.drawString(42, y - 18, "How much is it in total?")
    c.showPage()

    # 04 Nagoya
    page_base(c, 4, "Nagoya")
    cover_image(c, IMAGES / "nagoya-night-editorial.jpg", 318, 410, 235, 300, 0.05)
    section_title(c, "03", "Nagoya", "The food-first night", "One district and one good meal make a stronger start than a list of famous bars.")
    y = PAGE_H - 185
    y = heading(c, "Pick one anchor", 42, y)
    y = draw_wrapped(c, "Nagoya Station works when your hotel or onward train is nearby. Sakae and Fushimi work when you want a denser evening district and an easier walk to a second stop.", 42, y, 248)
    y -= 15
    y = heading(c, "Let food set the pace", 42, y)
    y = draw_wrapped(c, "Start with a menu-led izakaya and a local dish. Confirm otoshi or table charge, tax, service and last-order time. Add a second venue only after the first one has given you a clear read on the night.", 42, y, 248)
    y = 370
    y = heading(c, "Read the room", 42, y)
    y = draw_bullets(c, [
        "A small counter can be welcoming without being suited to a large group.",
        "Look for a visible menu, open seats and a clear greeting from staff.",
        "If the system cannot be explained, leave politely before ordering.",
        "Keep the exact hotel address saved in Japanese for the return trip.",
    ], 42, y, 510)
    c.showPage()

    # 05 Hamamatsu
    page_base(c, 5, "Hamamatsu")
    cover_image(c, IMAGES / "hamamatsu-night-editorial.jpg", 318, 410, 235, 300, 0.03)
    section_title(c, "04", "Hamamatsu", "The local-rhythm night", "Stay close, listen first and decide the ride home before the final drink.")
    y = PAGE_H - 185
    y = heading(c, "Use two station pins", 42, y)
    y = draw_wrapped(c, "Save Hamamatsu Station and Shin-Hamamatsu Station separately. They serve different rail systems. Treat them as the anchor for Act City, the central streets and Yurakugai.", 42, y, 248)
    y -= 15
    y = heading(c, "Use the city's identity", 42, y)
    y = draw_wrapped(c, "Hamamatsu is Japan's City of Music. Look for current live performance schedules and small music-led venues, but verify each event and admission rule directly on the day.", 42, y, 248)
    y = 370
    y = heading(c, "Before another round", 42, y)
    y = draw_bullets(c, [
        "Check the current Enshu Railway timetable, not a copied time.",
        "Keep voices aligned with the room and ask before moving seats.",
        "Do not tip; pay the stated bill and thank the staff.",
        "Choose a taxi while your phone still has battery and your destination is clear.",
    ], 42, y, 510)
    c.showPage()

    # 06 Venue check
    page_base(c, 6, "Venue check")
    section_title(c, "05", "Venue check", "The 60-second door test", "Fill these gaps before the first order. A vague answer is useful information.")
    y = PAGE_H - 188
    rows = [
        ("Venue name", "Can I match the sign, map listing and entrance?"),
        ("Table charge", "Is there an otoshi, cover or seating fee?"),
        ("Time", "Is there a time limit and when is last order?"),
        ("Total price", "Does the listed price include tax and service?"),
        ("Payment", "Which methods are accepted and do I keep my card?"),
        ("Exit", "Can I leave freely and do I know the route home?"),
    ]
    for index, (label, question) in enumerate(rows, start=1):
        c.setFillColor(CHARCOAL if index % 2 else HexColor("#262526"))
        c.rect(42, y - 59, 510, 59, stroke=0, fill=1)
        c.setFillColor(RUST)
        c.setFont(BOLD, 8)
        c.drawString(58, y - 22, f"{index:02d}")
        c.setFillColor(CREAM)
        c.setFont(BOLD, 11)
        c.drawString(92, y - 22, label.upper())
        c.setFillColor(HexColor("#bbb4aa"))
        c.setFont(BODY, 8.5)
        c.drawString(92, y - 41, question)
        y -= 66
    y -= 5
    y = heading(c, "Two phrases worth saving", 42, y)
    c.setFont(BOLD, 13)
    c.setFillColor(INK)
    c.drawString(42, y, "Sekiryo wa arimasu ka?  -  Is there a table charge?")
    c.drawString(42, y - 25, "Meisai o kudasai.  -  Please give me an itemized bill.")
    c.showPage()

    # 07 Return plan
    page_base(c, 7, "Return plan")
    section_title(c, "06", "Return plan", "Leave before the decision gets hard", "The route home is part of the night, not an administrative detail at closing time.")
    y = PAGE_H - 190
    y = heading(c, "Before the second venue", 42, y)
    y = draw_bullets(c, [
        "Check the exact-date last train or subway connection.",
        "Save the accommodation name, address and nearest entrance in Japanese.",
        "Keep a taxi option and a payment backup.",
        "Set a battery floor: leave while navigation and calls are still reliable.",
    ], 42, y, 510)
    y -= 18
    y = heading(c, "Payment control", 42, y)
    y = draw_bullets(c, [
        "Photograph the displayed price list when charges are complex.",
        "Do not let a stranger choose your ATM or handle your card.",
        "Ask for the total before agreeing to another time block or drink plan.",
        "If pressure rises, prioritize a safe exit over winning the argument inside.",
    ], 42, y, 510)
    y -= 18
    c.setFillColor(RUST)
    c.roundRect(42, y - 76, 510, 76, 4, stroke=0, fill=1)
    c.setFillColor(CREAM)
    c.setFont(DISPLAY, 18)
    c.drawString(60, y - 31, "YOUR EXIT PLAN IS A SAFETY TOOL.")
    c.setFont(BODY, 9.5)
    c.drawString(60, y - 52, "Make it while the night is still easy.")
    c.showPage()

    # 08 Sources
    page_base(c, 8, "Sources")
    section_title(c, "07", "Sources", "Verify before you go", "Open these official pages for current operating, safety and visitor information.")
    y = PAGE_H - 182
    source_groups = [
        ("TOKYO", [
            ("Tokyo Metropolitan Police - nightlife crime prevention", "https://www.keishicho.metro.tokyo.lg.jp/multilingual/english/safe_society/victim_of_crime/sakariba_topics.html"),
            ("JNTO - emergencies and visitor support", "https://www.japan.travel/en/plan/emergencies/"),
        ]),
        ("NAGOYA", [
            ("Visit Nagoya - Japanese pubs and bars", "https://www.nagoya-info.jp/en/gourmet/?s_genre%5B%5D=45"),
            ("Aichi Prefectural Police - English information", "https://www.pref.aichi.jp/police/english/"),
        ]),
        ("HAMAMATSU", [
            ("Hamamatsu official tourism - City of Music", "https://visit.hamamatsu-japan.com/"),
            ("Hamamatsu City - travel etiquette", "https://www.hamamatsu-japan.com/en/etiquette/"),
            ("Enshu Railway - English guide", "https://www.entetsu.co.jp/tetsudou/english/"),
            ("Shizuoka Prefectural Police - languages", "https://www.pref.shizuoka.jp/police/language/index.html"),
        ]),
    ]
    for group, sources in source_groups:
        y = heading(c, group, 42, y)
        for label, url in sources:
            y = source_link(c, label, url, 42, y, 500)
        y -= 8
    c.setFillColor(CHARCOAL)
    c.roundRect(42, 62, 510, 88, 4, stroke=0, fill=1)
    c.setFillColor(CREAM)
    c.setFont(BOLD, 9)
    c.drawString(58, 126, "IMPORTANT")
    draw_wrapped(c, "Venue ownership, prices, schedules and local conditions can change. This guide provides decision tools, not a guarantee that any individual business or route is safe. In an emergency, contact the responsible public authority.", 58, 106, 476, BODY, 8.5, 12, HexColor("#c9c2b8"))
    c.showPage()

    c.save()
    print(OUTPUT)


if __name__ == "__main__":
    create_pdf()
