set "params=%*"
cd /d "%~dp0" && ( if exist "%temp%\getadmin.vbs" del "%temp%\getadmin.vbs" ) && fsutil dirty query %systemdrive% 1>nul 2>nul || (  echo Set UAC = CreateObject^("Shell.Application"^) : UAC.ShellExecute "cmd.exe", "/k cd ""%~sdp0"" && %~s0 %params%", "", "runas", 1 >> "%temp%\getadmin.vbs" && "%temp%\getadmin.vbs" && exit /B )
:: start cmd /k echo Hello, World!
@echo off
FOR /F "tokens=* USEBACKQ" %%F IN (`powershell.exe -noninteractive -command Invoke-RestMethod ipinfo.io/ip`) DO (
    SET MyIP=%%F
)
:: start firefox https://%MyIP%/index_chat.php
::explorer "https://%MyIP%:443/"

start "" firefox https://%MyIP%:3129/

