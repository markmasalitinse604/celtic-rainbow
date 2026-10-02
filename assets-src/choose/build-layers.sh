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
# Как на ПК: ВСЕ слои строятся от одного цельного кадра intro-mobile-photo.png (обе машины, правильная тень
# автобуса). Он 832x1472 и чуть смещён относительно остальных — увеличен и подогнан: v = (1.8631, 1.8705)*p + (-6, -16.5).
# В слое «только фура» заменена лишь область автобуса и его тени (из intro-mobile-only-truck.png),
# в слое «только автобус» — лишь область фуры (из intro-mobile-only-bus.png как есть, как на ПК).
# Фары — из кадров генератора с горящими фарами (addlight ниже).
VW=1536; VH=2720
SHADOW="879,1615 1033,1777 1195,1789 1277,1825 1254,1862 956,1876 606,1886 486,1862 447,1763 452,1717 649,1647"
TRUCKPOLY="100,1260 812,1260 812,1565 788,1585 788,1765 780,1786 766,1796 742,1792 738,1818 668,1820 660,1792 476,1792 470,1816 420,1826 400,1840 100,1840"
convert intro-mobile-photo.png -filter Lanczos -virtual-pixel edge -define distort:viewport=${VW}x$VH+0+0 \
  -distort AffineProjection "1.8631,0,0,1.8705,-6,-16.5" +repage -unsharp 0x1.2+0.6+0 intro-mobile-photo-updated.png
# «только фура»: автобус, его тень и дорога вокруг — из «только фуры»; кузов фуры остаётся с общего кадра
convert -size ${VW}x$VH xc:black -fill white -draw "rectangle 830,1300 1536,1990" -draw "polygon $SHADOW" \
  -fill black -draw "polygon $TRUCKPOLY" -blur 0x14 $T/m-t.png
convert intro-mobile-photo-updated.png intro-mobile-only-truck.png $T/m-t.png -composite intro-mobile-only-truck-updated.png
# «только автобус»: фура и дорога на её месте — из «только автобуса» как есть (так же, как на ПК), без заплаток
convert -size ${VW}x$VH xc:black -fill white -draw "polygon 0,1230 845,1230 845,1990 0,1990" -blur 0x14 $T/m-b.png
convert intro-mobile-photo-updated.png intro-mobile-only-bus.png $T/m-b.png -composite intro-mobile-only-bus-updated.png
# Фары: настоящие кадры из генератора — intro-mobile-truck-light.png / intro-mobile-bus-light.png (редактирование
# «только фуры» / «только автобуса», чуть сдвинуты и масштабированы — подогнаны по машине и фону). Берётся только
# прибавка света «с фарами − без фар»: у самих фар резко, на дороге мягко, и только в зоне фар и света перед машиной.
# Она добавляется на наши слои без фар — фон и тень остаются те же, что в слоях без фар, ничего не прыгает.
addlight() { # кадр-с-фарами "sx,sy,dx,dy" кадр-без-фар слой вырезка зона-света фары(mvg) результат
  local C=$5; IFS='x+' read cw ch cx cy <<<"$C"
  convert "$1" -virtual-pixel edge -define distort:viewport=${VW}x$VH+0+0 \
    -distort AffineProjection "$(echo $2 | awk -F, '{print $1",0,0,"$2","$3","$4}')" +repage -crop $C +repage $T/la.png
  convert "$3" -crop $C +repage $T/lr.png
  convert $T/la.png $T/lr.png -fx "max(0,u-v)" $T/ld.png
  convert $T/ld.png -blur 0x3 $T/ldb.png
  convert -size ${cw}x$ch xc:black -fill white -draw "translate -$cx,-$cy $7" -blur 0x10 $T/llm.png
  convert $T/ldb.png $T/ld.png $T/llm.png -composite $T/ldd.png
  convert -size ${cw}x$ch xc:black -fill white -draw "translate -$cx,-$cy polygon $6" -blur 0x25 $T/lzm.png
  convert $T/ldd.png $T/lzm.png -compose multiply -composite $T/ldz.png
  convert "$4" -crop $C +repage $T/ldz.png -compose plus -composite $T/lc.png
  convert "$4" $T/lc.png -geometry +$cx+$cy -compose over -composite "$8"
}
addlight intro-mobile-truck-light.png 0.9880,0.9895,9.25,14.75 intro-mobile-only-truck.png intro-mobile-only-truck-updated.png \
  1150x950+250+1560 "380,1600 830,1600 830,1830 1350,2150 1350,2480 300,2480 380,1830" \
  "ellipse 470,1765 70,50 0,360 ellipse 750,1760 70,50 0,360" intro-mobile-truck-light-updated.png
addlight intro-mobile-bus-light.png 0.9885,0.9955,10,6 intro-mobile-only-bus.png intro-mobile-only-bus-updated.png \
  620x1120+916+1600 "990,1620 1400,1620 1536,1700 1536,2720 980,2720 980,1850" \
  "ellipse 1083,1723 60,40 0,360 ellipse 1328,1718 55,38 0,360" intro-mobile-bus-light-updated.png
for pair in both:intro-mobile-photo-updated truck:intro-mobile-only-truck-updated bus:intro-mobile-only-bus-updated \
            truck-lit:intro-mobile-truck-light-updated bus-lit:intro-mobile-bus-light-updated; do
  n=${pair%%:*}; f=${pair#*:}
  for w in 1080 1536; do
    convert $f.png -resize ${w}x -quality 78 -define webp:method=6 $OUT/choose-v-$n-$w.webp
  done
done
echo "Готово: assets-src/choose/*-updated.png и src/choose/img/*.webp"
