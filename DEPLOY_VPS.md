## Ubuntu VPS Deploy

### 1. Install runtime
```bash
sudo apt update
sudo apt install -y nginx git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### 2. Clone repo
```bash
cd /var/www
git clone https://github.com/ankur4work/-mx-brand-logo.git mx-brand-logo
cd /var/www/mx-brand-logo
```

### 3. Install packages and build frontend
```bash
npm install
cd web
npm install
cd frontend
npm install
npm run build
cd ..
```

### 4. Add production env
```bash
cp /var/www/mx-brand-logo/web/.env.example /var/www/mx-brand-logo/web/.env
nano /var/www/mx-brand-logo/web/.env
```

Required production values:
- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SCOPES`
- `HOST`
- `SHOPIFY_APP_HANDLE`
- `SHOPIFY_REQUIRE_ACTIVE_PLAN=true`
- `BILLING_MODE=managed`
- `SESSION_STORAGE=mongodb`
- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `PORT=3011`

### 5. Start with pm2
```bash
cd /var/www/mx-brand-logo
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### 6. Configure nginx
```bash
sudo cp /var/www/mx-brand-logo/deploy/nginx-mx-brand-logo.conf /etc/nginx/sites-available/mx-brand-logo
sudo nano /etc/nginx/sites-available/mx-brand-logo
```

Replace `app.example.com` with your real subdomain, then enable:
```bash
sudo ln -s /etc/nginx/sites-available/mx-brand-logo /etc/nginx/sites-enabled/mx-brand-logo
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Add SSL
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d app.example.com
```

### 8. Update Shopify app settings
In Partner Dashboard set:
- App URL: `https://app.example.com`
- Allowed redirection URL: `https://app.example.com/api/auth/callback`

### 9. Future updates
```bash
cd /var/www/mx-brand-logo
git pull
cd web/frontend
npm run build
cd ..
pm2 restart mx-brand-logo
```
