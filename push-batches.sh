#!/bin/bash
BATCH_MB=50
LIMIT=$((BATCH_MB*1024*1024))
git branch -M main 2>/dev/null
grep -qx '.DS_Store' .gitignore 2>/dev/null || echo '.DS_Store' >> .gitignore
find . -path ./.git -prune -o -type f -size +100M -print | while read f; do
  echo "ПРОПУСК (>100MB): $f"; grep -qxF "${f#./}" .gitignore || echo "${f#./}" >> .gitignore
done

push() { until git push -u origin main; do echo "повтор через 5с"; sleep 5; done; }

n=0; size=0; count=0
git add .gitignore
while IFS= read -r -d '' f; do
  s=$(stat -f%z "$f")
  if [ $((size+s)) -gt $LIMIT ] && [ $count -gt 0 ]; then
    n=$((n+1)); git commit -q -m "Add files (batch $n)"; push
    echo "== Пачка $n отправлена ($count файлов)"; size=0; count=0
  fi
  git add -- "$f"; size=$((size+s)); count=$((count+1))
done < <(git ls-files --others --exclude-standard -z)

git diff --cached --quiet || git commit -q -m "Add files (final batch)"
push
echo "Готово. Всего коммитов: $(git rev-list --count main)"
