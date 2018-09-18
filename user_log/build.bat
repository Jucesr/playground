@echo off
call pkg -t node8-win-x64 src/setup.js & move /Y "setup.exe" "./build/setup.exe"
call pkg . -t node8-win-x64 & move /Y "hermosillo_user_log.exe" "./build/generate_report.exe"
call pkg -t node8-win-x64 src/save_logs.js & move /Y "save_logs.exe" "./build/save_logs.exe"