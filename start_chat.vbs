Dim oShell
Set oShell = WScript.CreateObject("WScript.Shell")
'oShell.Run "taskkill /f /im node.exe", , True
'oShell.Run "powershell -windowstyle hidden -executionpolicy bypass -File C:\bat\kill-port.ps1 3129", , True
oShell.Run "npx kill-port 3129", , True
set oShellEnv = oShell.Environment("Process")
computerName  = oShellEnv("AppData")
oShell.CurrentDirectory = computerName & "\npm\"
oShell.Run("""node"" --expose-gc server_chat.js"), 0
Set oShell = Nothing