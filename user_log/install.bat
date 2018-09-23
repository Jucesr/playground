@echo off
set currentpath=%~dp0
set buildpath=%currentpath%build

mkdir "C:\Program Files\HermosilloUserLog"
mkdir "C:\Program Files\HermosilloUserLog\assets"
xcopy %buildpath% "C:\Program Files\HermosilloUserLog" /s /e
cd "C:\Program Files\HermosilloUserLog"

FOR /F "usebackq delims=" %%i in (`cscript find.vbs`) DO SET DESKTOPDIR=%%i
SET COMPLETEPATH=%DESKTOPDIR%\HermosilloUserLog.lnk

call link.vbs %COMPLETEPATH% setup.exe

REM cls
cd %currentpath%

echo Archivos instalados correctamente.

pause