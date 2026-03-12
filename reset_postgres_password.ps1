# PostgreSQL Password Reset Script for Windows
$hbaPath = "C:\Program Files\PostgreSQL\17\data\pg_hba.conf"
$serviceName = "postgresql-x64-17"

echo "Step 1: Backing up configuration..."
Copy-Item $hbaPath "$hbaPath.bak" -Force

echo "Step 2: Enabling 'trust' mode..."
(Get-Content $hbaPath) -replace 'scram-sha-256', 'trust' | Set-Content $hbaPath

echo "Step 3: Restarting PostgreSQL service..."
Restart-Service $serviceName

echo "Step 4: Resetting 'postgres' password to 'admin123'..."
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD 'admin123';"

echo "Step 5: Creating 'goat_user' and 'goatbook' database..."
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -U postgres -d postgres -c "CREATE USER goat_user WITH PASSWORD 'goat_pass';"
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -U postgres -d postgres -c "CREATE DATABASE goatbook OWNER goat_user;"
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -U postgres -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE goatbook TO goat_user;"

echo "Step 6: Reverting security settings..."
Copy-Item "$hbaPath.bak" $hbaPath -Force

echo "Step 7: Final restart..."
Restart-Service $serviceName

echo "DONE! Your database is ready."
echo "New 'postgres' password is: admin123"
echo "The app is now connected via 'goat_user'."
pause
