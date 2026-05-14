@echo off
set MESSAGE=Update %date% %time%
git add .
git commit -m "%MESSAGE%"
git push
pause