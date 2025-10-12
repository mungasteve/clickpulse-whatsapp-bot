# 🚀 ClickPulse Deployment Guide

## 📋 Pre-Deployment Checklist

### System Requirements
- ✅ Node.js 18+ installed
- ✅ Chrome browser (for WhatsApp Web)
- ✅ Git installed
- ✅ Domain name (for production)
- ✅ SSL certificate (for HTTPS)

### Environment Setup
- ✅ Production server access
- ✅ Database setup (if using external DB)
- ✅ Environment variables configured
- ✅ WhatsApp Business account

## 🏠 Local Development Setup

### 1. Clone Repository
```bash
git clone <your-repository-url>
cd whatsapp-ecommerce-bot
```

### 2. Install Dependencies
```bash
# Backend dependencies
npm install

# Admin dashboard dependencies
cd admin
npm install
cd ..
```

### 3. Environment Configuration
Create `.env` file:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# WhatsApp Configuration
WHATSAPP_SESSION_PATH=./whatsapp-session

# Database (Optional)
DATABASE_URL=mongodb://localhost:27017/clickpulse

# Security
JWT_SECRET=your-jwt-secret-key
API_KEY=your-api-key

# External Services
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=your-paypal-client-id
```

### 4. Start Development Servers
```bash
# Terminal 1: Backend API
npm run dev
# or
node server.js

# Terminal 2: WhatsApp Bot
npm run bot
# or
node final-bot.js

# Terminal 3: Admin Dashboard
cd admin
npm run dev
```

### 5. Access Applications
- **API Server**: http://localhost:5000
- **Admin Dashboard**: http://localhost:3000
- **WhatsApp Bot**: Scan QR code in terminal

## ☁️ Cloud Deployment Options

## 1. Heroku Deployment

### Prerequisites
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login
```

### Deployment Steps
```bash
# Create Heroku app
heroku create clickpulse-bot

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set PORT=5000

# Deploy backend
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Deploy admin dashboard (separate app)
cd admin
heroku create clickpulse-admin
npm run build
# Deploy build folder
```

### Heroku Configuration
```yaml
# Procfile
web: node server.js
bot: node final-bot.js
```

### Scaling
```bash
# Scale web dynos
heroku ps:scale web=1

# Scale bot dynos
heroku ps:scale bot=1
```

## 2. AWS Deployment

### EC2 Instance Setup
```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Chrome (for WhatsApp Web)
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
sudo apt update
sudo apt install -y google-chrome-stable
```

### Application Deployment
```bash
# Clone repository
git clone <your-repository-url>
cd whatsapp-ecommerce-bot

# Install dependencies
npm install
cd admin && npm install && npm run build && cd ..

# Create PM2 ecosystem file
```

### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'clickpulse-api',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'clickpulse-bot',
      script: 'final-bot.js',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

### Start Applications
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/clickpulse
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /admin {
        alias /path/to/admin/build;
        try_files $uri $uri/ /index.html;
    }
}
```

## 3. Digital Ocean Deployment

### Droplet Setup
```bash
# Create droplet (Ubuntu 20.04)
# Connect via SSH
ssh root@your-droplet-ip

# Setup user
adduser clickpulse
usermod -aG sudo clickpulse
su - clickpulse
```

### Application Setup
```bash
# Install dependencies (same as AWS)
# Clone and setup application
# Configure PM2 and Nginx
```

### Firewall Configuration
```bash
# Setup UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 4. Docker Deployment

### Dockerfile
```dockerfile
# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Install Chrome for WhatsApp Web
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

EXPOSE 5000

CMD ["node", "server.js"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
    volumes:
      - ./whatsapp-session:/app/whatsapp-session
    restart: unless-stopped

  bot:
    build: .
    command: node final-bot.js
    environment:
      - NODE_ENV=production
    volumes:
      - ./whatsapp-session:/app/whatsapp-session
    restart: unless-stopped
    depends_on:
      - api

  admin:
    build: ./admin
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
      - admin
    restart: unless-stopped
```

### Deploy with Docker
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale bot=2
```

## 🔒 Security Configuration

### SSL Certificate Setup
```bash
# Using Certbot (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Environment Security
```bash
# Secure environment variables
export NODE_ENV=production
export JWT_SECRET=$(openssl rand -base64 32)
export API_KEY=$(openssl rand -hex 32)
```

### Firewall Rules
```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw deny 5000   # Block direct API access
```

## 📊 Monitoring & Logging

### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart applications
pm2 restart all
```

### Log Configuration
```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### Health Checks
```javascript
// health.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build admin dashboard
      run: |
        cd admin
        npm ci
        npm run build
        
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.4
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /path/to/app
          git pull origin main
          npm install
          pm2 restart all
```

## 📱 WhatsApp Business Setup

### Business Account Configuration
1. **Create WhatsApp Business Account**
   - Download WhatsApp Business app
   - Verify business phone number
   - Complete business profile

2. **WhatsApp Web Integration**
   - Open WhatsApp Web in Chrome
   - Scan QR code from bot terminal
   - Keep session active

3. **Business Profile Optimization**
   - Add business description
   - Set business hours
   - Add contact information
   - Upload business logo

## 🔧 Production Optimizations

### Performance Tuning
```javascript
// server.js optimizations
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(compression());
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

### Database Optimization
```javascript
// MongoDB connection with optimization
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

## 🚨 Troubleshooting

### Common Issues

1. **WhatsApp Session Expired**
```bash
# Clear session and restart
rm -rf whatsapp-session
pm2 restart clickpulse-bot
```

2. **Port Already in Use**
```bash
# Find and kill process
lsof -ti:5000 | xargs kill -9
```

3. **Chrome/Puppeteer Issues**
```bash
# Install Chrome dependencies
sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2
```

4. **Memory Issues**
```bash
# Monitor memory usage
free -h
pm2 monit

# Restart if needed
pm2 restart all
```

### Log Analysis
```bash
# Check application logs
pm2 logs clickpulse-api --lines 100

# Check system logs
sudo journalctl -u nginx -f

# Check error logs
tail -f /var/log/nginx/error.log
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Multiple server instances
- Database clustering
- CDN integration

### Vertical Scaling
- Increase server resources
- Optimize application code
- Database indexing
- Caching strategies

## 🔄 Backup & Recovery

### Automated Backups
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Backup database
mongodump --out $BACKUP_DIR/db_$DATE

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /path/to/app

# Backup WhatsApp session
cp -r /path/to/whatsapp-session $BACKUP_DIR/session_$DATE
```

### Recovery Procedures
```bash
# Restore database
mongorestore /backups/db_20240115_120000

# Restore application
tar -xzf /backups/app_20240115_120000.tar.gz -C /

# Restart services
pm2 restart all
```

This deployment guide provides comprehensive instructions for deploying ClickPulse in various environments, from local development to production cloud platforms.