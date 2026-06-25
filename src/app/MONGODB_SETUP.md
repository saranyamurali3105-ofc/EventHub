# MongoDB Atlas Setup Guide for EventsHub

## 🎯 Configuration Complete!

Your EventsHub application has been configured to connect to MongoDB Atlas with the following settings:

### 📊 Database Configuration
- **Connection String**: `mongodb+srv://sandhiya:sandy@cluster0.yltrgph.mongodb.net/eventshubDB?retryWrites=true&w=majority`
- **Database Name**: `eventshubDB`
- **Primary Collection**: `events`
- **Username**: `sandhiya`
- **Server Port**: `3000`

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Backend dependencies
cd server
npm install

# Frontend dependencies (if not already installed)
cd ..
npm install
```

### 2. Start the Backend Server
```bash
cd server

# Option 1: Start with connection test
npm run start:atlas

# Option 2: Start normally
npm start

# Option 3: Development mode with auto-reload
npm run dev
```

### 3. Test the Connection
```bash
cd server
npm run test:connection
```

### 4. Start the Frontend
```bash
# In the root directory
npm start
# or
npm run dev
```

## 🔧 Environment Variables

The following environment variables are configured in `/server/.env`:

```env
MONGODB_URI=mongodb+srv://sandhiya:sandy@cluster0.yltrgph.mongodb.net/eventshubDB?retryWrites=true&w=majority
DB_NAME=eventshubDB
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here_make_it_very_secure_and_long
```

## 📋 API Endpoints

Your backend will be available at: `http://localhost:3000/api`

### Health Check
- **GET** `/api/health` - Check server status and MongoDB connection

### Authentication
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/register` - User registration
- **GET** `/api/auth/me` - Get current user
- **POST** `/api/auth/logout` - User logout

### Events Management
- **GET** `/api/events` - Get all events
- **POST** `/api/events` - Create new event
- **GET** `/api/events/:id` - Get event by ID
- **PUT** `/api/events/:id` - Update event
- **DELETE** `/api/events/:id` - Delete event

### Additional Modules
- **Registrations**: `/api/registrations/*`
- **Requests**: `/api/requests/*`
- **Users**: `/api/users/*`
- **Notifications**: `/api/notifications/*`
- **Achievers**: `/api/achievers/*`
- **Videos**: `/api/videos/*`
- **FAQ**: `/api/faq/*`
- **Projects**: `/api/projects/*`
- **Placements**: `/api/placements/*`
- **Resources**: `/api/resources/*`
- **Clubs**: `/api/clubs/*`
- **Announcements**: `/api/announcements/*`

## 🔒 MongoDB Atlas Security

### Network Access
Make sure your IP address is whitelisted in MongoDB Atlas:
1. Go to MongoDB Atlas Dashboard
2. Navigate to "Network Access"
3. Add your current IP address or use `0.0.0.0/0` for development (not recommended for production)

### Database User Permissions
Your user `sandhiya` should have the following permissions:
- **Database User Privileges**: `readWrite` on `eventshubDB`
- **Built-in Role**: `readWrite`

## 🛠️ Troubleshooting

### Connection Issues
If you encounter connection problems:

1. **Check Internet Connection**
   ```bash
   ping google.com
   ```

2. **Test MongoDB Connection**
   ```bash
   cd server
   npm run test:connection
   ```

3. **Check IP Whitelist**
   - Ensure your IP is whitelisted in MongoDB Atlas
   - Or temporarily allow all IPs: `0.0.0.0/0`

4. **Verify Credentials**
   - Username: `sandhiya`
   - Password: `sandy`
   - Database: `eventshubDB`

5. **Check Cluster Status**
   - Ensure your MongoDB Atlas cluster is running
   - Check for any maintenance windows

### Common Error Messages

#### "MongoServerSelectionError"
- **Cause**: Cannot connect to MongoDB Atlas
- **Solution**: Check internet connection and IP whitelist

#### "Authentication failed"
- **Cause**: Invalid username/password
- **Solution**: Verify credentials in MongoDB Atlas

#### "Connection timeout"
- **Cause**: Network issues or firewall blocking
- **Solution**: Check firewall settings and network configuration

## 🎯 Next Steps

1. **Seed Initial Data** (optional):
   ```bash
   cd server
   npm run seed
   ```

2. **Configure Email Settings** (for notifications):
   - Update `EMAIL_*` variables in `.env`
   - Get app password from Gmail

3. **Set up File Upload** (optional):
   - Configure Cloudinary credentials in `.env`
   - Or set up local file storage

4. **Production Deployment**:
   - Update CORS origins
   - Set secure JWT secret
   - Configure production environment variables

## 📞 Support

If you encounter any issues:
1. Check the server logs for detailed error messages
2. Verify MongoDB Atlas dashboard for connection status
3. Test the health check endpoint: `http://localhost:3000/api/health`
4. Check network connectivity and firewall settings

## 🎉 Success Indicators

When everything is working correctly, you should see:
- ✅ Successfully connected to MongoDB Atlas!
- 📊 Database: eventshubDB
- 👤 User: sandhiya
- 🚀 EventsHub Server running on port 3000

Your EventsHub application is now ready to use with MongoDB Atlas!