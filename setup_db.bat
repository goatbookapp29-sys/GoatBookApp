@echo off
set "PSQL_PATH=C:\Program Files\PostgreSQL\17\bin\psql.exe"
echo Setting up GoatBook Database...
"%PSQL_PATH%" -U postgres -d postgres -c "CREATE USER goat_user WITH PASSWORD 'goat_pass'; CREATE DATABASE goatbook OWNER goat_user; GRANT ALL PRIVILEGES ON DATABASE goatbook TO goat_user;"
echo.
echo If you saw 'CREATE ROLE' and 'CREATE DATABASE', setup is successful!
pause
