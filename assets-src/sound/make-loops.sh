#!/usr/bin/env bash
# Бесшовные петли «холостой ход» и «езда» для звука главной (src/shared/sound.js, режим двух петель).
# Из исходника берём кусок длиной L + C, конец (C секунд) сводим с началом и приклеиваем середину:
# на стыке петли звук продолжается без щелчка и провала (сведение по четверти синуса — без провала громкости). Громкость выравниваем (idle тише, drive громче).
# Запуск: bash assets-src/sound/make-loops.sh   (нужен ffmpeg с libfdk_aac или встроенным aac)
set -euo pipefail
cd "$(dirname "$0")/../.."
OUT=src/assets/media

# loop <источник> <начало> <длина L> <свод C> <громкость dB> <выход> [доп. фильтры]
loop() {
  local src=$1 s=$2 L=$3 C=$4 vol=$5 out=$6 extra=${7:+,$7}
  ffmpeg -hide_banner -loglevel error -y -ss "$s" -t "$(echo "$L + $C" | bc)" -i "$src" -filter_complex "
    [0:a]aresample=48000,asplit=3[a][b][c];
    [a]atrim=start=$L:end=$(echo "$L + $C" | bc),asetpts=PTS-STARTPTS,afade=t=out:d=$C:curve=qsin[tail];
    [b]atrim=start=0:end=$C,asetpts=PTS-STARTPTS,afade=t=in:d=$C:curve=qsin[head];
    [tail][head]amix=inputs=2:normalize=0[joint];
    [c]atrim=start=$C:end=$L,asetpts=PTS-STARTPTS[mid];
    [joint][mid]concat=n=2:v=0:a=1,volume=${vol}dB${extra}[o]" -map "[o]" -c:a aac -b:a 96k "$OUT/$out"
}

SRC=assets-src/sound/bus-idle-to-drive-off.mp3   # freesound: bus idle to drive off (0–6 с холостой, 8–12 с едет)
# холостой — «дальше»: меньше верха (издалека его не слышно), владелец попросил дальше/тише
loop "$SRC" 1.5 4.0 0.5 2  engine-bus-idle.m4a "treble=g=-6:f=2000:t=s:w=0.7,lowpass=f=4000"
loop "$SRC" 9.0 2.0 0.5 -8 engine-bus-drive.m4a

# Фура. Езда — из проезжающей фуры (freesound: 1,75–4,25 с едет ровно, дальше проезд мимо — не брать: скачок и Доплер).
# Холостого хода в записи нет — берём холостой автобуса на 12% ниже по тону (asetrate) — тяжелее, как у фуры.
TRUCK=assets-src/sound/truck-driving.mp3
loop "$SRC"   1.5  4.0 0.5 2 engine-truck-idle.m4a  "asetrate=42240,aresample=48000,treble=g=-6:f=2000:t=s:w=0.7,lowpass=f=3600"
loop "$TRUCK" 1.85 2.0 0.4 4.5 engine-truck-drive.m4a
