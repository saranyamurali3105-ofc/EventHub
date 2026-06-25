# EventsHub Full-Stack Deployment Guide

## Overview
EventsHub is a comprehensive campus tech events management platform built with React (frontend) and Node.js/Express (backend) with MongoDB database. This guide covers complete deployment for production environments.

## Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │  Node.js API    │    │   MongoDB       │
│   (Frontend)    │───▶│   (Backend)     │───▶│   (Database)    │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **MongoDB**: v5.0 or higher
- **Git**: Latest version
- **Redis**: v6.0 or higher (for caching and sessions)

### Development Tools
- **VS Code** (recommended editor)
- **MongoDB Compass** (database GUI)
- **Postman** (API testing)

## Environment Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd eventshub
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Variables
Create `.env` file in backend directory:

```env
# Server Configuration
NODE_ENV=production
PORT=3001
API_URL=https://your-domain.com/api

# Frontend URL
FRONTEND_URL=https://your-domain.com

# Database
MONGODB_URI=mongodb://localhost:27017/eventshub
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/eventshub

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@eventshub.com
FROM_NAME=EventsHub

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Redis (for caching)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Admin Configuration
ADMIN_EMAIL=admin.123.@gmail.com
ADMIN_PASSWORD=admin@123
ADMIN_USERNAME=admin

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5

# Logging
LOG_LEVEL=info
LOG_FILE=logs/eventshub.log

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://your-domain.com
```

#### Database Setup
```bash
# Start MongoDB (if running locally)
mongod --dbpath /data/db

# Run database migrations and seed data
npm run db:seed
```

#### Start Backend Development Server
```bash
npm run dev
```

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
```

#### Environment Variables
Create `.env` file in frontend directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=ws://localhost:3001

# App Configuration
REACT_APP_NAME=EventsHub
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development

# Google OAuth (if using)
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id

# Analytics (optional)
REACT_APP_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX

# Feature Flags
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_WEBSOCKET=true
REACT_APP_ENABLE_OFFLINE_MODE=true
```

#### Start Frontend Development Server
```bash
npm start
```

## Production Deployment

### 1. Database Setup (MongoDB)

#### Option A: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create new cluster
3. Configure network access (whitelist your server IP)
4. Create database user
5. Get connection string and update `MONGODB_URI`

#### Option B: Self-hosted MongoDB
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database and user
mongo
use eventshub
db.createUser({
  user: "eventshub_user",
  pwd: "secure_password",
  roles: ["readWrite"]
})
```

### 2. Backend Deployment

#### Build Backend
```bash
cd backend
npm run build
```

#### Process Manager (PM2)
```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'eventshub-api',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Frontend Deployment

#### Build Frontend
```bash
cd frontend
npm run build
```

#### Nginx Configuration
```nginx
# /etc/nginx/sites-available/eventshub
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # Frontend (React build)
    location / {
        root /var/www/eventshub/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
        
        # Enable gzip compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://your-domain.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss: https:;" always;
}
```

### 4. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 5. Firewall Configuration
```bash
# UFW (Ubuntu)
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Or iptables
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

## Docker Deployment (Alternative)

### Docker Compose Setup
```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    container_name: eventshub-mongo
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: eventshub
    volumes:
      - mongodb_data:/data/db
      - ./backend/scripts/init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro

  redis:
    image: redis:6-alpine
    container_name: eventshub-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: eventshub-backend
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:password@mongodb:27017/eventshub?authSource=admin
      REDIS_URL: redis://redis:6379
    depends_on:
      - mongodb
      - redis
    volumes:
      - ./backend/logs:/app/logs
      - ./backend/uploads:/app/uploads

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: eventshub-frontend
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    volumes:
      - ./ssl:/etc/nginx/ssl:ro

volumes:
  mongodb_data:
  redis_data:
```

### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["npm", "start"]
```

### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Monitoring & Maintenance

### 1. Logging
```bash
# View PM2 logs
pm2 logs

# View specific app logs
pm2 logs eventshub-api

# Monitor system resources
pm2 monit
```

### 2. Database Backup
```bash
# Create backup script
cat > backup.sh << EOF
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="mongodb://username:password@localhost:27017/eventshub" --out="/backups/eventshub_$DATE"
tar -czf "/backups/eventshub_$DATE.tar.gz" "/backups/eventshub_$DATE"
rm -rf "/backups/eventshub_$DATE"

# Keep only last 7 days of backups
find /backups -name "eventshub_*.tar.gz" -mtime +7 -delete
EOF

chmod +x backup.sh

# Schedule daily backups
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

### 3. Health Monitoring
```bash
# Create health check script
cat > healthcheck.sh << EOF
#!/bin/bash
API_URL="https://your-domain.com/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "✅ API is healthy"
else
    echo "❌ API is down (HTTP $RESPONSE)"
    # Send alert (email, Slack, etc.)
fi
EOF

# Run every 5 minutes
echo "*/5 * * * * /path/to/healthcheck.sh" | crontab -
```

## Security Checklist

- ✅ **SSL/TLS enabled** with strong ciphers
- ✅ **Environment variables** for all secrets
- ✅ **Rate limiting** configured
- ✅ **Input validation** and sanitization
- ✅ **Authentication & authorization** implemented
- ✅ **CORS** properly configured
- ✅ **Security headers** set
- ✅ **Database access** restricted
- ✅ **File upload** restrictions in place
- ✅ **Regular security updates**

## Performance Optimization

### 1. Frontend Optimization
- ✅ Code splitting implemented
- ✅ Image optimization
- ✅ Lazy loading components
- ✅ Service worker for caching
- ✅ Bundle analysis and optimization

### 2. Backend Optimization
- ✅ Database indexing
- ✅ Query optimization
- ✅ Caching strategy (Redis)
- ✅ Connection pooling
- ✅ Compression enabled

### 3. Database Optimization
```javascript
// Create database indexes
db.events.createIndex({ "date": 1, "status": 1 })
db.users.createIndex({ "email": 1 }, { unique: true })
db.projects.createIndex({ "category": 1, "status": 1 })
db.resources.createIndex({ "category": 1, "department": 1 })
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Check logs
   sudo tail -f /var/log/mongodb/mongod.log
   ```

2. **API Not Responding**
   ```bash
   # Check PM2 status
   pm2 status
   
   # Restart application
   pm2 restart eventshub-api
   ```

3. **High Memory Usage**
   ```bash
   # Monitor memory
   pm2 monit
   
   # Check for memory leaks
   node --inspect dist/server.js
   ```

4. **SSL Certificate Issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificate
   sudo certbot renew
   ```

## Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Database clustering
- Redis clustering
- CDN implementation

### Vertical Scaling
- Server resource monitoring
- Database optimization
- Application profiling

## Support & Maintenance

### Regular Tasks
- **Daily**: Monitor logs and health checks
- **Weekly**: Review performance metrics
- **Monthly**: Security updates and patches
- **Quarterly**: Full system backup and recovery test

### Emergency Procedures
1. **Service Down**: Check PM2 status → Restart services → Check logs
2. **Database Issues**: Check connections → Review slow queries → Optimize
3. **High Traffic**: Monitor resources → Scale if needed → Implement caching

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)

---

**Note**: This guide assumes admin-only access control is implemented at the application level. Only users with admin privileges (isAdmin: true) can create, edit, or delete content. All other users have read-only access to the platform.