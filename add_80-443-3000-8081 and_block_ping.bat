set "params=%*"
cd /d "%~dp0" && ( if exist "%temp%\getadmin.vbs" del "%temp%\getadmin.vbs" ) && fsutil dirty query %systemdrive% 1>nul 2>nul || (  echo Set UAC = CreateObject^("Shell.Application"^) : UAC.ShellExecute "cmd.exe", "/k cd ""%~sdp0"" && %~s0 %params%", "", "runas", 1 >> "%temp%\getadmin.vbs" && "%temp%\getadmin.vbs" && exit /B )
:: start cmd /k echo Hello, World!
netsh advfirewall firewall add rule name="Open port 80" protocol=TCP localport=80 action=allow dir=in
netsh advfirewall firewall add rule name="Open port 443" protocol=TCP localport=443 action=allow dir=in
netsh advfirewall firewall add rule name="Open port 3000" protocol=TCP localport=3000 action=allow dir=in
netsh advfirewall firewall add rule name="Open port 3128" protocol=TCP localport=3128 action=allow dir=in
netsh advfirewall firewall add rule name="Open port 3129" protocol=TCP localport=3129 action=allow dir=in
netsh advfirewall firewall add rule name="Open port 8081" protocol=TCP localport=8081 action=allow dir=in
netsh advfirewall firewall add rule name="Open port 8080" protocol=TCP localport=8080 action=allow dir=in
netsh advfirewall firewall add rule name="Open port 8082" protocol=TCP localport=8082 action=allow dir=in
netsh advfirewall firewall add rule name="Block ping icmpv4" dir=in action=block protocol=ICMPv4
netsh advfirewall firewall add rule name="Block ping icmpv6" dir=in action=block protocol=ICMPv6
netsh interface tcp set global MaxSynRetransmissions=2

