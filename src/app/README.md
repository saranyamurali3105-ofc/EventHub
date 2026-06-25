# EventsHub - Complete Full-Stack Application

A comprehensive event management system for educational institutions with backend API, MongoDB database, and frontend interface.

## Features

### Core Features
- **Authentication System**: Login/Register with JWT tokens
- **Event Management**: Create, view, and manage events by department
- **Registration System**: Event registration with approval workflow
- **Document Requests**: OD letters and certificate requests
- **Admin Panel**: Complete admin dashboard for approvals and management

### Extended Features
- **Achievers Gallery**: Showcase student achievements
- **Video Library**: Educational and event videos
- **FAQ System**: Comprehensive help system
- **Notification System**: Real-time notifications
- **Profile Management**: User profiles and preferences
- **Calendar Integration**: Event calendar view
- **File Upload System**: Using Cloudinary for media storage

## Architecture

### Backend (Express.js + MongoDB)
- **Models**: User, Event, Registration, Request, Notification, Achiever, Video, FAQ
- **Authentication**: JWT-based with middleware
- **File Storage**: Cloudinary integration
- **Email**: Nodemailer for notifications
- **Security**: Helmet, rate limiting, CORS

### Frontend (React + TypeScript)
- **State Management**: React hooks
- **API Layer**: Comprehensive API service
- **UI Components**: Shadcn/ui components
- **Styling**: Tailwind CSS v4
- **Offline Mode**: Fallback when backend is unavailable

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Cloudinary account (for file uploads)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   cd server && npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp server/.env.example server/.env
   ```
   
   Edit `server/.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/eventshub
   JWT_SECRET=your-super-secret-jwt-key
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

3. **Start MongoDB:**
   ```bash
   # If using local MongoDB
   mongod
   ```

4. **Seed the database:**
   ```bash
   npm run seed
   ```

5. **Start the application:**

   **Terminal 1 - Backend:**
   ```bash
   npm run backend
   ```

   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

6. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Default Credentials

After seeding:
- **Admin**: admin.123.@gmail.com / admin@123
- **User 1**: saranya@gmail.com / password
- **User 2**: rajesh@gmail.com / password
- **User 3**: priya@gmail.com / password

## Offline Mode

The application automatically falls back to offline mode if the backend is unavailable:
- Mock authentication with predefined users
- Local state management for events and registrations
- Limited functionality with informative notifications

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Events
- `GET /api/events` - Get all events (with filters)
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get single event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Registrations
- `GET /api/registrations/my` - Get user registrations
- `POST /api/registrations/register/:eventId` - Register for event
- `PUT /api/registrations/:id/status` - Update status (admin)

### Requests (OD/Certificates)
- `GET /api/requests/my` - Get user requests
- `POST /api/requests` - Create request
- `PUT /api/requests/:id/status` - Update status (admin)
- `GET /api/requests/:id/download` - Download document

### Additional APIs
- **Achievers**: `/api/achievers`
- **Videos**: `/api/videos`
- **FAQ**: `/api/faq`
- **Notifications**: `/api/notifications`
- **Users**: `/api/users`
- **Upload**: `/api/upload`

## Database Schema

### User
- Authentication and profile information
- Admin permissions
- Activity stats and preferences

### Event
- Event details and scheduling
- Department and category classification
- Registration management

### Registration
- User event registrations
- Approval workflow
- Attendance tracking

### Request
- Document requests (OD/Certificate)
- Admin approval system
- File attachment support

## Deployment

### Backend Deployment
1. Set production environment variables
2. Deploy to services like Heroku, Railway, or DigitalOcean
3. Update CORS origins for your domain

### Frontend Deployment
1. Update API base URL in `/services/api.ts`
2. Build: `npm run build`
3. Deploy to Vercel, Netlify, or similar service

### Database
- MongoDB Atlas for cloud database
- Ensure proper indexing for performance

## Development

### Adding New Features
1. Create backend models in `/server/models/`
2. Add API routes in `/server/routes/`
3. Update frontend API service in `/services/api.ts`
4. Create UI components and pages

### Testing
- Backend: Add tests for API endpoints
- Frontend: Add component tests
- Integration: Test full user workflows

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the FAQ section in the app
2. Review existing GitHub issues
3. Create a new issue with detailed description

---

**Note**: This is a complete full-stack application ready for production deployment with proper security, scalability, and user experience considerations.