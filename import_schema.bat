@echo off
echo Testing MariaDB connection...
"C:\Progra~1\MariaDB 13.0\bin\mysql.exe" -u root -e "SELECT VERSION();" 2>&1
echo.
echo Importing schema...
"C:\Progra~1\MariaDB 13.0\bin\mysql.exe" -u root < "C:\Users\Dell\Downloads\A1\research-portal\database\schema.sql" 2>&1
echo.
echo Verifying data...
"C:\Progra~1\MariaDB 13.0\bin\mysql.exe" -u root -e "USE research_portal; SELECT id, title, status FROM opportunities;" 2>&1
echo.
echo Done!
