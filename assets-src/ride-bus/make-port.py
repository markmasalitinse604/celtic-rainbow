#!/usr/bin/env python3
# Кадры автобуса для телефона (src/assets/ride-bus/port, 720×1280, 120 шт.) из ГОРИЗОНТАЛЬНОГО ролика video/bus.mp4:
# вертикального ролика автобуса нет, поэтому вырезаем окно 9:16, которое ведёт автобус и слегка приближает его,
# чтобы автобус всё время был в нижней трети (низ — на 88% высоты), а сверху оставалось небо под карточки.
# Запуск из корня репозитория: python3 assets-src/ride-bus/make-port.py   (нужны ffmpeg с libwebp и ImageMagick)
#
# track.txt — замер автобуса по кадрам 4 к/с в масштабе 958×540: «кадр ширина высота x y площадь» — светлая крыша,
# найдена так: ffmpeg -i video/bus.mp4 -vf "fps=4,scale=958:-2" t%03d.png, затем для каждого кадра
# convert t.png -crop 958x330+0+170 +repage -colorspace gray -threshold 72% -define connected-components:verbose=true
#   -define connected-components:area-threshold=120 -connected-components 8 null:  (крупнейшее пятно ниже озера; y + 170).
# Новый ролик — новый замер (track.txt) и проверка кадров глазами.
import os, subprocess, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
SRC, OUT = 'video/bus.mp4', 'src/assets/ride-bus/port'
SW, SH = 3832, 2164          # размер исходника
BOTTOM = 0.88                # низ автобуса — доля высоты окна

rows = [l.split() for l in open(os.path.join(HERE, 'track.txt')) if l.strip()]
T = [(int(r[0][1:]) - 1) / 4 for r in rows]
W = [int(r[1]) for r in rows]; X = [int(r[3]) for r in rows]; TOP = [int(r[4]) for r in rows]

def fit(ts, ys, deg=3):  # сглаживание: полином по МНК (без numpy)
    n = deg + 1
    A = [[sum(t ** (i + j) for t in ts) for j in range(n)] for i in range(n)]
    b = [sum(y * t ** i for t, y in zip(ts, ys)) for i in range(n)]
    for i in range(n):
        p = max(range(i, n), key=lambda r: abs(A[r][i])); A[i], A[p] = A[p], A[i]; b[i], b[p] = b[p], b[i]
        for r in range(i + 1, n):
            f = A[r][i] / A[i][i]
            for c in range(i, n): A[r][c] -= f * A[i][c]
            b[r] -= f * b[i]
    c = [0] * n
    for i in reversed(range(n)): c[i] = (b[i] - sum(A[i][k] * c[k] for k in range(i + 1, n))) / A[i][i]
    return lambda t: sum(c[k] * t ** k for k in range(n))

cx, top, w = fit(T, [x + v / 2 for x, v in zip(X, W)]), fit(T, TOP), fit(T, W)
S = SW / 958
with tempfile.TemporaryDirectory() as tmp:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', SRC, '-frames:v', '120', '-vf', 'fps=12', f'{tmp}/f%03d.png'], check=True)
    for i in range(120):
        t = i / 12
        h = 44 + 0.474 * (w(t) - 52)            # высота автобуса по ширине крыши (замер: 145 px при 265, 44 px при 52)
        ch = min(SH, (top(t) + h) * S / BOTTOM); cw = ch * 9 / 16
        x = min(SW - cw, max(0, cx(t) * S - cw / 2))
        subprocess.run(['convert', f'{tmp}/f{i + 1:03d}.png', '-crop', f'{round(cw)}x{round(ch)}+{round(x)}+0', '+repage',
                        '-filter', 'Lanczos', '-resize', '720x1280!', f'{tmp}/p{i + 1:03d}.png'], check=True)
    os.makedirs(OUT, exist_ok=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{tmp}/p%03d.png', '-c:v', 'libwebp', '-quality', '56', f'{OUT}/%03d.webp'], check=True)
print('Готово:', OUT)
