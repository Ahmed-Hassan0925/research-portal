@echo off
setlocal
set MARIADB_BIN=C:\Progra~1\MariaDB 13.0\bin
set MARIADB_DATA=C:\Progra~1\MariaDB 13.0\data

echo [1/4] Initializing MariaDB data directory if needed...
if not exist "%MARIADB_DATA%\mysql" (
  "%MARIADB_BIN%\mysql_install_db.exe" --datadir="%MARIADB_DATA%" --service=MariaDB --password= 2>&1
) else (
  echo      Data directory already exists, skipping init.
)

echo [2/4] Installing MariaDB as Windows service...
"%MARIADB_BIN%\mysqld.exe" --install MariaDB --defaults-file="%MARIADB_DATA%\my.ini" 2>&1

echo [3/4] Starting MariaDB service...
net start MariaDB 2>&1

echo [4/4] Done. Checking status...
sc query MariaDB 2>&1
