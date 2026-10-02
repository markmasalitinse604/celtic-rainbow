#!/bin/bash
# Собирает слои страницы выбора (/choose/) из оригиналов ИИ и выгружает WebP в src/choose/img/.
# Запуск из корня проекта: bash assets-src/choose/build-layers.sh   (нужен ImageMagick 6 с WebP)
#
# 1. Все слои строятся из ОДНОГО кадра intro-photo.png: в слоях «только фура/автобус» заменена лишь область
#    убранной машины, в слоях с фарами добавлены только фары и свет на дороге. Иначе ИИ-текстура «кипит» при смене.
# 2. Дорога на всех слоях обрабатывается одинаково: медианный фильтр убирает «мазки» ИИ-увеличения,
#    сверху — мелкое зерно (одно и то же для всех слоёв, -seed), машины не трогаем.
set -euo pipefail
cd "$(dirname "$0")"
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
W=2720; H=1536; OUT=../../src/choose/img

# --- 1. Слои из одного кадра ---
box() { convert -size ${W}x$H xc:black -fill white -draw "$1" -blur 0x22 "$2"; }
box "rectangle 1440,600 2420,1265 rectangle 1000,1075 2320,1325" $T/m-truck.png   # где убираем автобус
convert intro-photo.png intro-only-truck.png $T/m-truck.png -composite $T/truck.png
box "rectangle 280,430 1460,1305 rectangle 0,700 1460,1330" $T/m-bus.png          # где убираем фуру
convert intro-photo.png intro-only-bus.png $T/m-bus.png -composite $T/bus.png

lit() { # off lit out mvg — переносим только то, что стало светлее, в зоне фар и света на дороге
  convert -size ${W}x$H xc:black -fill white -draw "$4" -blur 0x45 $T/zone.png
  convert "$1" "$2" -compose difference -composite -colorspace gray -level 4%,16% -blur 0x3 \
    $T/zone.png -compose multiply -composite $T/ml.png
  convert "$1" "$2" $T/ml.png -composite "$3"
}
lit $T/truck.png intro-truck-only-light.png $T/truck-lit.png "rectangle 861,952 1451,1269 rectangle 567,1156 2267,1536"
lit $T/bus.png intro-bus-only-light.png $T/bus-lit.png "rectangle 1791,952 2403,1269 rectangle 1587,1179 2720,1536"
cp intro-photo.png $T/both.png

# --- 2. Дорога ---
# Область дороги (контур снят по кадру; озеро, скалы и горы вне неё)
convert -size ${W}x$H xc:black -fill white \
  -draw "polygon 0,759 340,759 340,952 907,952 1451,1009 2267,1111 2720,1167 2720,1536 0,1536" $T/roi.png
# Одно и то же зерно для всех слоёв: мелкое и чуть крупнее («камешки»)
convert -size ${W}x$H xc:gray50 -seed 7 -attenuate 0.35 +noise Gaussian -colorspace gray -blur 0x0.7 $T/g1.png
convert -size ${W}x$H xc:gray50 -seed 11 -attenuate 0.6 +noise Gaussian -colorspace gray -blur 0x2 -level 30%,70% $T/g2.png
# Рамки машин (до линии колёс): их не обрабатываем
TRUCK="rectangle 286,453 1442,1262"; BUS="rectangle 1455,614 2394,1215"

road() { # layer exclude-mvg out
  local L=$T/$1.png
  convert $L -colorspace HSL -channel G -separate +channel -threshold 14% -negate $T/lowsat.png  # серое
  convert $L -colorspace gray -threshold 25% $T/light.png                                        # не тёмное
  convert -size ${W}x$H xc:white -fill black -draw "$2" -blur 0x3 $T/keep.png                   # машины — нет
  convert $T/roi.png $T/lowsat.png -compose multiply -composite $T/light.png -compose multiply -composite \
    -morphology Open Disk:3 -blur 0x4 $T/keep.png -compose multiply -composite $T/mroad.png
  convert $L -statistic median 9x9 -blur 0x0.8 $T/g1.png -compose overlay -composite \
    $T/g2.png -compose soft-light -composite $T/fix.png
  convert $L $T/fix.png $T/mroad.png -composite "$3"
}
road both      "$TRUCK $BUS" intro-photo-updated.png
road truck     "$TRUCK"      intro-only-truck-updated.png
road bus       "$BUS"        intro-only-bus-updated.png
road truck-lit "$TRUCK"      intro-truck-only-light-updated.png
road bus-lit   "$BUS"        intro-bus-only-light-updated.png

# --- 3. WebP для сайта ---
for pair in both:intro-photo-updated truck:intro-only-truck-updated bus:intro-only-bus-updated \
            truck-lit:intro-truck-only-light-updated bus-lit:intro-bus-only-light-updated; do
  n=${pair%%:*}; f=${pair#*:}
  for w in 1600 2720; do
    convert $f.png -resize ${w}x -quality 78 -define webp:method=6 $OUT/choose-$n-$w.webp
  done
done
echo "Готово: assets-src/choose/*-updated.png и src/choose/img/*.webp"
