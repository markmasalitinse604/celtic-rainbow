# Логотип: нижняя надпись по дуге поверх старого логотипа (верх, колесо и цвета — без изменений).
# Запуск: python3 make-logo.py ['ТЕКСТ'] [выход.png] [градусов_дуги]; затем для сайта:
#   convert logo-400.png -filter Lanczos -resize 144x144 -strip -quality 90 -define webp:alpha-quality=100 -define webp:method=6 ../../src/assets/logo.webp
import math, subprocess, sys, os
S = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(S, 'logo-old-400.png')                    # старый логотип (из истории git: src/assets/logo.png)
FONT = os.path.join(S, 'Montserrat-ExtraBold.ttf')            # Google Fonts, Montserrat 800 (OFL) — положить рядом
TEXT = sys.argv[1] if len(sys.argv) > 1 else 'INTERNATIONAL DRIVING SCHOOL'
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(S, 'logo-400.png')
SPAN = float(sys.argv[3]) if len(sys.argv) > 3 else 166   # градусов дуги под надпись
K = 4; C = 200 * K; RC = 170 * K                            # центр букв — на радиусе 170 (у старой надписи было 165: сдвинули к краю, там дуга длиннее)
BLUE, YELLOW = '#216FB7', '#F2DC10'
TRACK = 0.03                                               # межбуквенный интервал, доля кегля

def width(ch, p):
    if ch == ' ': ch = 'n'                                  # ширина пробела ≈ узкой буквы
    out = subprocess.check_output(['convert', '-font', FONT, '-pointsize', str(p), 'label:' + ch, '-format', '%w', 'info:'])
    return int(out)

def layout(p):
    ws = [width(c, p) * (0.55 if c == ' ' else 1) for c in TEXT]
    total = sum(ws) + TRACK * p * (len(TEXT) - 1)
    return ws, total

# подбираем кегль: самая крупная надпись, что влезает в SPAN градусов
p = 140
while True:
    ws, total = layout(p)
    if math.degrees(total / RC) <= SPAN: break
    p -= 2
cap = p * 0.70                                              # высота заглавных у Montserrat ≈ 0,7 кегля
span = total / RC
phi = math.pi / 2 + span / 2                                # начало слева, идём по часовой → направо по низу
cmds = []
acc = 0
for c, w in zip(TEXT, ws):
    mid = acc + w / 2
    f = phi - mid / RC
    x, y = C + RC * math.cos(f), C + RC * math.sin(f)
    rot = math.degrees(f) - 90
    if c != ' ':
        t = c.replace("'", "\\'")
        cmds += ['-draw', f"translate {x:.2f},{y:.2f} rotate {rot:.3f} text {-w/2:.2f},{cap/2:.2f} '{t}'"]
    acc += w + TRACK * p
print(f'pointsize {p/K:.1f}px (cap {cap/K:.1f}px), span {math.degrees(span):.1f}°', file=sys.stderr)

layer = os.path.join(S, 'text4x.png')
subprocess.check_call(['convert', '-size', f'{2*C}x{2*C}', 'xc:none', '-font', FONT, '-pointsize', str(p), '-fill', YELLOW] + cmds + [layer])

# стираем старую нижнюю надпись: синий сектор кольца от 4° до 176° (низ), радиусы 124–197
def pt(r, a): return f'{200 + r*math.cos(math.radians(a)):.2f},{200 + r*math.sin(math.radians(a)):.2f}'
a0, a1, ri, ro = 4, 176, 124, 197
path = f"M {pt(ro,a0)} A {ro},{ro} 0 0,1 {pt(ro,a1)} L {pt(ri,a1)} A {ri},{ri} 0 0,0 {pt(ri,a0)} Z"
subprocess.check_call(['convert', SRC, '-fill', BLUE, '-stroke', 'none', '-draw', f"path '{path}'",
                       '(', layer, '-filter', 'Lanczos', '-resize', '25%', ')', '-composite', OUT])
print(OUT, file=sys.stderr)

os.remove(layer)
