Set oShell = CreateObject("WScript.Shell")

' Backend (Django sirve todo: API + Frontend)
oShell.Run "cmd /c cd /d D:\ASISTENCIA-TUPAC\lectora\backend && call venv\Scripts\activate && python manage.py runserver 0.0.0.0:8000", 0, False
