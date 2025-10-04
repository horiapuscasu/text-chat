'oShell.Run "cmd.exe /k ""wmic process where name='node.exe' delete"" && exit", , True
Dim oShell
Set oShell = WScript.CreateObject("WScript.Shell")
oShell.Run "wmic process where name='node.exe' delete", , True
oShell.Run "taskkill /f /im node.exe", , True

Port = "3129"
If PortIsOpen(Port) Then
	oShell.Run "npx kill-port " & Port, , True
End If  
Port = "8081"
If PortIsOpen(Port) Then
	oShell.Run "npx kill-port " & Port, , True
End If

set oShellEnv = oShell.Environment("Process")
computerName  = oShellEnv("AppData")
oShell.CurrentDirectory = computerName & "\npm\"
Dim FSO
Set FSO = CreateObject("Scripting.FileSystemObject")

If fso.FileExists(computerName & "\npm\" & "server_chat.js") Then
    oShell.Run("""node"" --expose-gc server_chat.js"), 0
End If
If fso.FileExists(computerName & "\npm\" & "signaling-server.js") Then
    oShell.Run("""node"" --expose-gc signaling-server.js"), 0
End If
Set oShell = Nothing
'****************************************************************
Function DblQuote(Str)
    DblQuote = Chr(34) & Str & Chr(34)
End Function
'****************************************************************
Function PortIsOpen(port)
    PortIsOpen = False
    Set StdOut = WScript.StdOut
    Set objShell = CreateObject("WScript.Shell")
    Set objScriptExec = objShell.Exec("cmd /C ""netstat -ano -p tcp | find "":" & port & " "" "" ")
    strPingResults = objScriptExec.StdOut.ReadAll
    If Len(strPingResults) > 0 Then PortIsOpen = True
End Function

