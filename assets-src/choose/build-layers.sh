#!/bin/bash
# Собирает слои страницы выбора (/choose/) из оригиналов ИИ и выгружает WebP в src/choose/img/.
# Запуск из корня проекта: bash assets-src/choose/build-layers.sh   (нужен ImageMagick 6 с WebP)
#
# 1. Все слои строятся из ОДНОГО кадра intro-photo.png: в слоях «только фура/автобус» заменена лишь область
#    убранной машины, в слоях с фарами добавлены только фары и свет на дороге. Иначе ИИ-текстура «кипит» при смене.
# 2. (выключено) Обработка дороги против «мазков» ИИ — см. ROAD_FIX ниже.
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

# --- 2. Дорога (ВЫКЛЮЧЕНО по умолчанию) ---
# Пробовали убрать «мазки» ИИ медианным фильтром с зерном — на экране выглядит замыленно и дёшево.
# Оставлено для экспериментов: ROAD_FIX=1 bash assets-src/choose/build-layers.sh
if [ "${ROAD_FIX:-0}" = 1 ]; then
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
  BOTH=intro-photo-updated
road truck     "$TRUCK"      intro-only-truck-updated.png
road bus       "$BUS"        intro-only-bus-updated.png
road truck-lit "$TRUCK"      intro-truck-only-light-updated.png
road bus-lit   "$BUS"        intro-bus-only-light-updated.png
else
  cp $T/truck.png intro-only-truck-updated.png
  cp $T/bus.png intro-only-bus-updated.png
  cp $T/truck-lit.png intro-truck-only-light-updated.png
  cp $T/bus-lit.png intro-bus-only-light-updated.png
fi

# --- 3. WebP для сайта ---
for pair in both:${BOTH:-intro-photo} truck:intro-only-truck-updated bus:intro-only-bus-updated \
            truck-lit:intro-truck-only-light-updated bus-lit:intro-bus-only-light-updated; do
  n=${pair%%:*}; f=${pair#*:}
  for w in 1600 2720; do
    convert $f.png -resize ${w}x -quality 78 -define webp:method=6 $OUT/choose-$n-$w.webp
  done
done

# --- 4. Вертикальная сцена для телефонов (1536x2720) ---
# Источники: intro-mobile-only-truck.png и intro-mobile-only-bus.png (совпадают между собой; intro-mobile-photo.png
# меньше и чуть смещён — только как образец). Общий кадр = «только фура» + область автобуса (с его тенью,
# которая падает влево, под перед фуры) из «только автобуса». «Только автобус» = общий кадр + область фуры
# из «только автобуса». Фар в вертикальных кадрах нет: свет переносится из горизонтальных слоёв
# (разница «с фарами − без», масштаб и сдвиг подобраны по машине: v = s*h + d).
VW=1536; VH=2720
convert -size ${VW}x$VH xc:black -fill white \
  -draw "polygon 848,1320 1536,1320 1536,1990 300,1990 300,1830 812,1830 812,1560 848,1560" -blur 0x7 $T/vm-bus.png
convert intro-mobile-only-truck.png intro-mobile-only-bus.png $T/vm-bus.png -composite intro-mobile-photo-updated.png
convert -size ${VW}x$VH xc:black -fill white -draw "rectangle 0,1230 836,1910" -blur 0x8 $T/vm-truck.png
convert intro-mobile-photo-updated.png intro-mobile-only-bus.png $T/vm-truck.png -composite intro-mobile-only-bus-updated.png
vlight() { # тип s dx dy зона-mvg(или пусто) out
  convert intro-$1-only-light-updated.png intro-only-$1-updated.png -compose difference -composite \
    -virtual-pixel black -define distort:viewport=${VW}x$VH+0+0 -distort AffineProjection "$2,0,0,$2,$3,$4" +repage $T/vl.png
  if [ -n "$5" ]; then
    convert -size ${VW}x$VH xc:black -fill white -draw "$5" -blur 0x22 $T/vz.png
    convert $T/vl.png $T/vz.png -compose multiply -composite $T/vl.png
  fi
  convert "$6" $T/vl.png -compose plus -composite "$7"
}
vlight truck 0.6718 -140.2 986.6 "" intro-mobile-only-truck.png intro-mobile-truck-light-updated.png
vlight bus 0.7001 -251.4 947.2 \
  "ellipse 1083,1723 75,48 0,360 ellipse 1328,1718 62,45 0,360 ellipse 1200,1865 310,90 0,360" \
  intro-mobile-only-bus-updated.png intro-mobile-bus-light-updated.png
for pair in both:intro-mobile-photo-updated truck:intro-mobile-only-truck bus:intro-mobile-only-bus-updated \
            truck-lit:intro-mobile-truck-light-updated bus-lit:intro-mobile-bus-light-updated; do
  n=${pair%%:*}; f=${pair#*:}
  for w in 1080 1536; do
    convert $f.png -resize ${w}x -quality 78 -define webp:method=6 $OUT/choose-v-$n-$w.webp
  done
done
echo "Готово: assets-src/choose/*-updated.png и src/choose/img/*.webp"
