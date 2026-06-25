import { useState, useEffect } from 'react';
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Badge } from "./components/ui/badge";
import { Calendar, Clock, MapPin, Mail, ArrowLeft, Bell, User, Star, CheckCircle, XCircle, Download, X, Upload, FileText, Award, Eye, Trophy, Video, HelpCircle, Settings, Users } from "lucide-react";
import { authAPI, eventsAPI, registrationsAPI, requestsAPI, notificationsAPI, achieversAPI, videosAPI, faqAPI, usersAPI, uploadAPI, setAuthToken, getAuthToken } from './services/api';

// Import new page components
import AchieversPage from './components/AchieversPage';
import VideosPage from './components/VideosPage';
import FAQPage from './components/FAQPage';
import CalendarPage from './components/CalendarPage';
import ProfilePage from './components/ProfilePage';
import NotificationsPage from './components/NotificationsPage';
import AnnouncementsPage from './components/AnnouncementsPage';
import ClubsPage from './components/ClubsPage';
import ProjectsPage from './components/ProjectsPage';
import PlacementsPage from './components/PlacementsPage';
import ResourcesPage from './components/ResourcesPage';

// Types and Interfaces
export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  contactInfo: string;
  department: string;
  createdAt: Date;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  fullName: string;
  email: string;
  registerNumber: string;
  department: string;
  slot: string;
  mobileNumber: string;
  reasonForRegistration: string;
  priorExperience?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface Request {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  type: 'OD' | 'CERTIFICATE';
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  documentUrl?: string;
  createdAt: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  createdAt: Date;
}

type PageType = 'login' | 'register' | 'dashboard' | 'eventDetails' | 'eventRegistration' | 'feedback' | 'requests' | 'admin' | 'documents' | 'achievers' | 'videos' | 'faq' | 'profile' | 'notifications' | 'calendar' | 'announcements' | 'clubs' | 'projects' | 'placements' | 'resources';

// Mock data for offline mode
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Web Development Workshop',
    date: '2024-04-15',
    time: '10:00 AM',
    location: 'Computer Lab 1',
    description: 'Learn modern web development with React and Node.js. This hands-on workshop covers frontend and backend development.',
    contactInfo: 'admin@eventshub.com',
    department: 'CSE',
    createdAt: new Date()
  },
  {
    id: '2',
    title: 'AI/ML Seminar',
    date: '2024-04-20',
    time: '2:00 PM',
    location: 'Auditorium',
    description: 'Explore the latest trends in Artificial Intelligence and Machine Learning with industry experts.',
    contactInfo: 'ai.team@eventshub.com',
    department: 'AIML',
    createdAt: new Date()
  },
  {
    id: '3',
    title: 'Coding Competition 2024',
    date: '2024-04-25',
    time: '9:00 AM',
    location: 'Main Computer Lab',
    description: 'Annual inter-departmental coding competition. Prizes worth ₹50,000!',
    contactInfo: 'competition@eventshub.com',
    department: 'IT',
    createdAt: new Date()
  },
  {
    id: '4',
    title: 'Cultural Fest - Dance Competition',
    date: '2024-05-01',
    time: '6:00 PM',
    location: 'Main Stage',
    description: 'Showcase your dancing skills in our annual cultural fest.',
    contactInfo: 'cultural@eventshub.com',
    department: 'ECE',
    createdAt: new Date()
  },
  {
    id: '5',
    title: 'Technical Symposium',
    date: '2024-05-10',
    time: '10:00 AM',
    location: 'Engineering Block',
    description: 'Technical presentations and project demonstrations.',
    contactInfo: 'tech@eventshub.com',
    department: 'Mechanical',
    createdAt: new Date()
  }
];

const mockUsers: User[] = [
  { id: '1', username: 'admin', email: 'admin.123.@gmail.com', password: 'admin@123', isAdmin: true },
  { id: '2', username: 'saranya', email: 'saranya@gmail.com', password: 'password', isAdmin: false }
];

export default function App() {
  // State Management
  const [currentPage, setCurrentPage] = useState<PageType>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [achievers, setAchievers] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Initialize with some sample data for better demo
  useEffect(() => {
    if (isOfflineMode && currentUser) {
      // Add some sample requests and registrations for demo
      setRequests([
        {
          id: 'req1',
          eventId: '1',
          userId: currentUser.id,
          userName: currentUser.username,
          type: 'CERTIFICATE',
          status: 'approved',
          reason: 'Need certificate for academic records',
          documentUrl: 'https://mock-storage.com/certificates/cert1.pdf',
          createdAt: new Date()
        }
      ]);
      
      setRegistrations([
        {
          id: 'reg1',
          eventId: '1',
          fullName: currentUser.username,
          email: currentUser.email,
          registerNumber: '20CSE001',
          department: 'CSE',
          slot: 'Morning (9:00 AM - 12:00 PM)',
          mobileNumber: '+91-9876543210',
          reasonForRegistration: 'Interested in learning web development',
          status: 'approved',
          createdAt: new Date()
        }
      ]);
    }
  }, [isOfflineMode, currentUser]);

  // Add notification helper function
  const addNotificationLocal = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    };
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  };

  // Initialize app and check authentication
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    setLoading(true);
    
    // Check if we can reach the API
    const isApiAvailable = await checkApiAvailability();
    
    if (!isApiAvailable) {
      // Immediately go to offline mode
      setIsOfflineMode(true);
      setEvents(mockEvents);
      setLoading(false);
      addNotificationLocal({ 
        message: 'Running in offline mode - backend not available', 
        type: 'info' 
      });
      return;
    }

    try {
      const token = getAuthToken();
      if (token) {
        const userResponse = await authAPI.getCurrentUser();
        if (userResponse.success) {
          setCurrentUser(userResponse.user);
          setCurrentPage('dashboard');
          await loadDashboardData();
        } else {
          // Invalid token, clear it
          setAuthToken(null);
        }
      }
    } catch (error) {
      console.error('Failed to initialize app, switching to offline mode:', error);
      setAuthToken(null);
      setIsOfflineMode(true);
      setEvents(mockEvents);
      addNotificationLocal({ 
        message: 'Running in offline mode - connection failed', 
        type: 'info' 
      });
    } finally {
      setLoading(false);
    }
  };

  const checkApiAvailability = async () => {
    try {
      // Simple connectivity check
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
      
      const response = await fetch(`${(typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 'http://localhost:3000/api'}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.log('API not available, using offline mode');
      return false;
    }
  };

  const loadDashboardData = async () => {
    if (isOfflineMode) {
      setEvents(mockEvents);
      return;
    }

    try {
      // Load all necessary data for dashboard
      const [eventsRes, notificationsRes] = await Promise.all([
        eventsAPI.getAll({ limit: 20 }),
        notificationsAPI.getUnreadCount()
      ]);
      
      if (eventsRes.success) {
        setEvents(eventsRes.events || []);
      }
      if (notificationsRes.success) {
        setUnreadNotifications(notificationsRes.count || 0);
      }
    } catch (error) {
      console.error('Failed to load dashboard data, switching to offline mode:', error);
      // Fallback to mock data
      setEvents(mockEvents);
      setIsOfflineMode(true);
      addNotificationLocal({ 
        message: 'Switched to offline mode - data loading failed', 
        type: 'info' 
      });
    }
  };

  // Authentication Functions
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    // Always check offline mode first or try offline if API fails
    const attemptOfflineLogin = () => {
      const user = mockUsers.find(u => (u.username === email || u.email === email) && u.password === password);
      if (user) {
        setCurrentUser(user);
        setCurrentPage('dashboard');
        setIsOfflineMode(true);
        setEvents(mockEvents);
        addNotificationLocal({ message: 'Successfully logged in (offline mode)!', type: 'success' });
        return true;
      }
      return false;
    };

    if (isOfflineMode) {
      if (attemptOfflineLogin()) {
        return true;
      }
      addNotificationLocal({ message: 'Invalid credentials', type: 'error' });
      return false;
    }

    try {
      const response = await authAPI.login(email, password);
      if (response.success && response.user) {
        setCurrentUser(response.user);
        setCurrentPage('dashboard');
        addNotificationLocal({ message: 'Successfully logged in!', type: 'success' });
        await loadDashboardData();
        return true;
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('API login failed, trying offline mode:', error);
      // Fallback to offline mode
      if (attemptOfflineLogin()) {
        return true;
      }
      addNotificationLocal({ message: 'Invalid credentials', type: 'error' });
      return false;
    }
  };

  const handleRegister = async (username: string, email: string, password: string): Promise<boolean> => {
    const attemptOfflineRegister = () => {
      const existingUser = mockUsers.find(u => u.username === username || u.email === email);
      if (existingUser) {
        addNotificationLocal({ message: 'User already exists', type: 'error' });
        return false;
      }
      
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        email,
        password,
        isAdmin: false
      };
      
      mockUsers.push(newUser);
      setCurrentUser(newUser);
      setCurrentPage('dashboard');
      setIsOfflineMode(true);
      setEvents(mockEvents);
      addNotificationLocal({ message: 'Account created successfully (offline mode)!', type: 'success' });
      return true;
    };

    if (isOfflineMode) {
      return attemptOfflineRegister();
    }

    try {
      const response = await authAPI.register(username, email, password);
      if (response.success && response.user) {
        setCurrentUser(response.user);
        setCurrentPage('dashboard');
        addNotificationLocal({ message: 'Account created successfully!', type: 'success' });
        await loadDashboardData();
        return true;
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('API registration failed, trying offline mode:', error);
      // Fallback to offline mode
      return attemptOfflineRegister();
    }
  };

  const handleLogout = async () => {
    try {
      if (!isOfflineMode) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always perform local logout regardless of API call success
      setCurrentUser(null);
      setCurrentPage('login');
      setEvents([]);
      setNotifications([]);
      setUnreadNotifications(0);
      setIsOfflineMode(false);
      addNotificationLocal({ message: 'Logged out successfully', type: 'info' });
    }
  };

  // Helper Functions
  const addEvent = async (newEvent: Omit<Event, 'id' | 'createdAt'>) => {
    try {
      if (isOfflineMode) {
        const event: Event = {
          ...newEvent,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date()
        };
        setEvents(prev => [event, ...prev]);
        addNotificationLocal({ message: 'Event created successfully (offline mode)!', type: 'success' });
        return;
      }

      const response = await eventsAPI.create(newEvent);
      setEvents(prev => [response.event, ...prev]);
      addNotificationLocal({ message: 'Event created successfully!', type: 'success' });
    } catch (error: any) {
      // Fallback to offline mode creation
      const event: Event = {
        ...newEvent,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date()
      };
      setEvents(prev => [event, ...prev]);
      setIsOfflineMode(true);
      addNotificationLocal({ message: 'Event created successfully (offline mode)!', type: 'success' });
    }
  };

  const addRegistration = async (registration: Omit<EventRegistration, 'id' | 'status' | 'createdAt'>) => {
    try {
      if (isOfflineMode) {
        const newRegistration: EventRegistration = {
          ...registration,
          id: Math.random().toString(36).substr(2, 9),
          status: 'pending',
          createdAt: new Date()
        };
        setRegistrations(prev => [...prev, newRegistration]);
        addNotificationLocal({ message: 'Registration submitted successfully (offline mode)!', type: 'success' });
        return;
      }

      const response = await registrationsAPI.register(registration.eventId, {
        personalInfo: {
          fullName: registration.fullName,
          email: registration.email,
          phone: registration.mobileNumber,
          registerNumber: registration.registerNumber,
          department: registration.department
        },
        eventDetails: {
          slot: registration.slot,
          reasonForRegistration: registration.reasonForRegistration,
          priorExperience: registration.priorExperience
        }
      });
      setRegistrations(prev => [...prev, response.registration]);
      addNotificationLocal({ message: 'Registration submitted successfully!', type: 'success' });
    } catch (error: any) {
      // Fallback to offline mode
      const newRegistration: EventRegistration = {
        ...registration,
        id: Math.random().toString(36).substr(2, 9),
        status: 'pending',
        createdAt: new Date()
      };
      setRegistrations(prev => [...prev, newRegistration]);
      setIsOfflineMode(true);
      addNotificationLocal({ message: 'Registration submitted successfully (offline mode)!', type: 'success' });
    }
  };

  const addRequest = async (request: Omit<Request, 'id' | 'status' | 'createdAt'>) => {
    try {
      if (isOfflineMode) {
        const newRequest: Request = {
          ...request,
          id: Math.random().toString(36).substr(2, 9),
          status: 'pending',
          createdAt: new Date()
        };
        setRequests(prev => [...prev, newRequest]);
        addNotificationLocal({ message: 'Request submitted successfully (offline mode)!', type: 'success' });
        return;
      }

      const response = await requestsAPI.create({
        eventId: request.eventId,
        type: request.type,
        reason: request.reason
      });
      setRequests(prev => [...prev, response.request]);
      addNotificationLocal({ message: 'Request submitted successfully!', type: 'success' });
    } catch (error: any) {
      // Fallback to offline mode
      const newRequest: Request = {
        ...request,
        id: Math.random().toString(36).substr(2, 9),
        status: 'pending',
        createdAt: new Date()
      };
      setRequests(prev => [...prev, newRequest]);
      setIsOfflineMode(true);
      addNotificationLocal({ message: 'Request submitted successfully (offline mode)!', type: 'success' });
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setCurrentPage('eventDetails');
  };

  // Login Component
  const LoginPage = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const success = await handleLogin(credentials.username, credentials.password);
      if (!success) {
        alert('Invalid credentials');
      }
    };

    return (
      <div className="min-h-screen bg-[#252a3d] flex items-center justify-center">
        <div className="bg-[#2d3748] rounded-2xl p-8 w-96 shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to your account</p>
            {isOfflineMode && (
              <div className="mt-2 p-2 bg-yellow-600/20 rounded text-yellow-200 text-sm">
                <p>Running in offline mode</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <Input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full bg-[#4a5568] border-[#5a6578] text-white rounded-lg px-4 py-3"
                placeholder="saranya"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <Input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full bg-[#4a5568] border-[#5a6578] text-white rounded-lg px-4 py-3"
                placeholder="••••••"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
            >
              Log In
            </Button>
          </form>

          <div className="text-center mt-4">
            <p className="text-gray-400">Or</p>
            <Button
              variant="outline"
              className="w-full mt-2 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Sign in with Google
            </Button>
          </div>

          <div className="text-center mt-6 space-y-3">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={() => setCurrentPage('register')}
                className="text-blue-400 hover:text-blue-300"
              >
                Register here
              </button>
            </p>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Demo Credentials:</strong></p>
              <p>Admin: admin.123.@gmail.com / admin@123</p>
              <p>User: saranya@gmail.com / password</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Register Component
  const RegisterPage = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const success = await handleRegister(formData.username, formData.email, formData.password);
      if (!success) {
        alert('User already exists');
      }
    };

    return (
      <div className="min-h-screen bg-[#252a3d] flex items-center justify-center">
        <div className="bg-[#2d3748] rounded-2xl p-8 w-96 shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Join EventsHub</h1>
            <p className="text-gray-400">Create a new account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full bg-[#4a5568] border-[#5a6578] text-white rounded-lg px-4 py-3"
                placeholder="saranya"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-[#4a5568] border-[#5a6578] text-white rounded-lg px-4 py-3"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full bg-[#4a5568] border-[#5a6578] text-white rounded-lg px-4 py-3"
                placeholder="••••••"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
            >
              Register
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => setCurrentPage('login')}
                className="text-blue-400 hover:text-blue-300"
              >
                Log in here
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Dashboard Component
  const DashboardPage = () => {
    const [currentDepartment, setCurrentDepartment] = useState('Explore');
    const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);

    const departments = ['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics'];
    
    const sidebarItems = [
      { name: 'Explore', active: currentDepartment === 'Explore', key: 'explore' },
      ...departments.map(dept => ({ 
        name: dept, 
        active: currentDepartment === dept,
        eventCount: events.filter(event => event.department === dept).length,
        key: dept
      })),
    ];

    const getCurrentDepartmentEvents = () => {
      if (currentDepartment === 'Explore') {
        return events;
      }
      return events.filter(event => event.department === currentDepartment);
    };

    const quickLinks = [
      { 
        title: 'Projects', 
        icon: '💻', 
        action: () => setCurrentPage('projects')
      },
      { 
        title: 'Placements', 
        icon: '💼', 
        action: () => setCurrentPage('placements')
      },
      { 
        title: 'Resources', 
        icon: '📚', 
        action: () => setCurrentPage('resources')
      },
      { 
        title: 'Clubs', 
        icon: '👥', 
        action: () => setCurrentPage('clubs') 
      },
      { 
        title: 'Announcements', 
        icon: '📢', 
        action: () => setCurrentPage('announcements') 
      },
    ];

    const popularTags = ['#Professor', '#Sports', '#Workshop', '#Cultural', '#Hackathon', '#Seminar'];

    const calendarDays = [
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, null, null, null],
    ];

    return (
      <div className="min-h-screen bg-[#1a1d29] text-white flex">
        {/* Sidebar */}
        <div className="w-64 bg-[#252936] border-r border-[#3a3d4a] flex flex-col">
          <div className="p-4 border-b border-[#3a3d4a]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <div>
                <h1 className="font-semibold">EventsHub</h1>
                <p className="text-xs text-gray-400">College Event Hub</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={() => setCurrentDepartment(item.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                      item.active
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-[#3a3d4a] hover:text-white'
                    }`}
                  >
                    <span>{item.name}</span>
                    {'eventCount' in item && item.eventCount > 0 && (
                      <Badge variant="secondary" className="bg-blue-500 text-white text-xs px-2 py-1">
                        {item.eventCount}
                      </Badge>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Quick Navigation */}
          <div className="p-4 border-t border-[#3a3d4a]">
            <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Modules</h4>
            <div className="space-y-1">
              <button
                onClick={() => setCurrentPage('projects')}
                className="w-full text-left px-3 py-2 rounded-lg transition-colors text-gray-300 hover:bg-[#3a3d4a] hover:text-white flex items-center gap-2 text-sm"
              >
                <span>💻</span>
                <span>Projects</span>
              </button>
              <button
                onClick={() => setCurrentPage('placements')}
                className="w-full text-left px-3 py-2 rounded-lg transition-colors text-gray-300 hover:bg-[#3a3d4a] hover:text-white flex items-center gap-2 text-sm"
              >
                <span>💼</span>
                <span>Placements</span>
              </button>
              <button
                onClick={() => setCurrentPage('resources')}
                className="w-full text-left px-3 py-2 rounded-lg transition-colors text-gray-300 hover:bg-[#3a3d4a] hover:text-white flex items-center gap-2 text-sm"
              >
                <span>📚</span>
                <span>Resources</span>
              </button>
              <button
                onClick={() => setCurrentPage('clubs')}
                className="w-full text-left px-3 py-2 rounded-lg transition-colors text-gray-300 hover:bg-[#3a3d4a] hover:text-white flex items-center gap-2 text-sm"
              >
                <span>👥</span>
                <span>Clubs</span>
              </button>
              <button
                onClick={() => setCurrentPage('achievers')}
                className="w-full text-left px-3 py-2 rounded-lg transition-colors text-gray-300 hover:bg-[#3a3d4a] hover:text-white flex items-center gap-2 text-sm"
              >
                <span>🏆</span>
                <span>Achievers</span>
              </button>
              <button
                onClick={() => setCurrentPage('videos')}
                className="w-full text-left px-3 py-2 rounded-lg transition-colors text-gray-300 hover:bg-[#3a3d4a] hover:text-white flex items-center gap-2 text-sm"
              >
                <span>📹</span>
                <span>Videos</span>
              </button>
              <button
                onClick={() => setCurrentPage('announcements')}
                className="w-full text-left px-3 py-2 rounded-lg transition-colors text-gray-300 hover:bg-[#3a3d4a] hover:text-white flex items-center gap-2 text-sm"
              >
                <span>📢</span>
                <span>Announcements</span>
              </button>
              <button
                onClick={() => setCurrentPage('calendar')}
                className="w-full text-left px-3 py-2 rounded-lg transition-colors text-gray-300 hover:bg-[#3a3d4a] hover:text-white flex items-center gap-2 text-sm"
              >
                <span>📅</span>
                <span>Calendar</span>
              </button>
              <button
                onClick={() => setCurrentPage('faq')}
                className="w-full text-left px-3 py-2 rounded-lg transition-colors text-gray-300 hover:bg-[#3a3d4a] hover:text-white flex items-center gap-2 text-sm"
              >
                <span>❓</span>
                <span>FAQ</span>
              </button>
            </div>
          </div>

          <div className="p-4 border-t border-[#3a3d4a]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
            >
              <span>🚪</span>
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          <div className="flex-1 p-6 space-y-6">
            {currentDepartment === 'Explore' ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">Hello, {currentUser?.username}! 👋</h2>
                    <p className="text-gray-400 mt-1">Welcome to your EventsHub dashboard.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-2 rounded-lg bg-[#3a3d4a] hover:bg-[#4a4d5a] transition-colors">
                      <Bell className="w-5 h-5" />
                    </button>
                    {currentUser?.isAdmin && (
                      <Button onClick={() => setCurrentPage('admin')} className="bg-purple-600 hover:bg-purple-700">
                        Admin Panel
                      </Button>
                    )}
                    <Button 
                      onClick={() => setIsCreateEventModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      + Create Event
                    </Button>
                    <button className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-[#252936] rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Recent Events</h3>
                    <button className="text-blue-400 hover:text-blue-300 text-sm">View All</button>
                  </div>
                  {events.length === 0 ? (
                    <p className="text-gray-400">No events found across all departments.</p>
                  ) : (
                    <div className="space-y-4">
                      {events.slice(0, 3).map((event) => (
                        <EventCard key={event.id} event={event} onEventClick={handleEventClick} />
                      ))}
                      {events.length > 3 && (
                        <p className="text-blue-400 text-sm">
                          +{events.length - 3} more events
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                  <div className="grid grid-cols-5 gap-4">
                    {quickLinks.map((link) => (
                      <div
                        key={link.title}
                        onClick={link.action}
                        className="bg-[#252936] rounded-lg p-6 text-center hover:bg-[#2a2f3c] transition-colors cursor-pointer"
                      >
                        <div className="text-3xl mb-2">{link.icon}</div>
                        <p className="text-sm">{link.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <button 
                      onClick={() => setCurrentDepartment('Explore')}
                      className="text-blue-400 hover:text-blue-300 text-sm mb-2"
                    >
                      ← Back to Dashboard
                    </button>
                    <h2 className="text-2xl font-semibold">{currentDepartment} Department</h2>
                    <p className="text-gray-400 mt-1">Manage and view events for this department.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={() => setIsCreateEventModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      + Create Event
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  {getCurrentDepartmentEvents().length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400 text-lg">No events found for {currentDepartment} department</p>
                      <p className="text-gray-500 text-sm mt-2">Create the first event for this department</p>
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {getCurrentDepartmentEvents().map((event) => (
                        <EventCard key={event.id} event={event} onEventClick={handleEventClick} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-80 p-6 space-y-6">
            <div className="bg-[#252936] rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Your Calendar</h3>
                <button 
                  onClick={() => setCurrentPage('calendar')}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  View Full
                </button>
              </div>
              <div className="text-center mb-4">
                <h4 className="font-medium">April 2025</h4>
              </div>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <div key={`header-${index}`} className="text-center py-2 text-gray-400 font-medium">
                    {day}
                  </div>
                ))}
                {calendarDays.flat().map((day, index) => (
                  <div
                    key={`day-${index}`}
                    className={`text-center py-2 hover:bg-[#3a3d4a] rounded cursor-pointer ${
                      day === null ? 'text-transparent' : 'text-gray-300'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#252936] rounded-lg p-4">
              <h3 className="font-semibold mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-[#3a3d4a] text-gray-300 hover:bg-[#4a4d5a] cursor-pointer"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Create Event Modal */}
        {isCreateEventModalOpen && (
          <CreateEventModal
            onClose={() => setIsCreateEventModalOpen(false)}
            onCreateEvent={addEvent}
          />
        )}
      </div>
    );
  };

  // Event Card Component
  const EventCard = ({ event, onEventClick }: { event: Event; onEventClick?: (event: Event) => void }) => (
    <div className="bg-[#1a202c] rounded-lg p-4 border border-[#3a3d4a]">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-white">{event.title}</h4>
        <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
          {event.department}
        </Badge>
      </div>
      
      <div className="space-y-2 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{event.date} at {event.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{event.location}</span>
        </div>
        {event.contactInfo && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{event.contactInfo}</span>
          </div>
        )}
      </div>
      
      {event.description && (
        <p className="text-gray-300 text-sm mt-3 line-clamp-2">{event.description}</p>
      )}
      
      <Button 
        onClick={() => onEventClick?.(event)}
        variant="outline" 
        size="sm" 
        className="mt-3 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
      >
        View Details
      </Button>
    </div>
  );

  // Create Event Modal Component
  const CreateEventModal = ({ onClose, onCreateEvent }: { onClose: () => void; onCreateEvent: (event: Omit<Event, 'id' | 'createdAt'>) => void }) => {
    const [eventData, setEventData] = useState({
      title: '',
      date: '',
      time: '',
      location: '',
      description: '',
      contactInfo: '',
      department: ''
    });

    const departments = ['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics'];

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!eventData.title || !eventData.date || !eventData.time || !eventData.location || !eventData.department) {
        alert('Please fill in all required fields');
        return;
      }
      
      onCreateEvent(eventData);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#252936] rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto border border-[#3a3d4a]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Create New Event</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Event Title *"
              value={eventData.title}
              onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                value={eventData.date}
                onChange={(e) => setEventData(prev => ({ ...prev, date: e.target.value }))}
                className="bg-[#3a3d4a] border-[#4a4d5a] text-white rounded-lg px-4 py-3"
                required
              />
              <Input
                type="time"
                value={eventData.time}
                onChange={(e) => setEventData(prev => ({ ...prev, time: e.target.value }))}
                className="bg-[#3a3d4a] border-[#4a4d5a] text-white rounded-lg px-4 py-3"
                required
              />
            </div>

            <Input
              type="text"
              placeholder="Location *"
              value={eventData.location}
              onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3"
              required
            />

            <Select value={eventData.department} onValueChange={(value) => setEventData(prev => ({ ...prev, department: value }))}>
              <SelectTrigger className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white rounded-lg px-4 py-3">
                <SelectValue placeholder="Select Department *" />
              </SelectTrigger>
              <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept} className="hover:bg-[#4a4d5a]">
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="text"
              placeholder="Contact Information"
              value={eventData.contactInfo}
              onChange={(e) => setEventData(prev => ({ ...prev, contactInfo: e.target.value }))}
              className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3"
            />

            <Textarea
              placeholder="Event Description"
              value={eventData.description}
              onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3 min-h-[100px] resize-none"
              rows={4}
            />

            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Create Event
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Event Details Page Component
  const EventDetailsPage = () => {
    if (!selectedEvent) {
      return (
        <div className="min-h-screen bg-[#1a1d29] text-white flex items-center justify-center">
          <p>Event not found</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#1a1d29] text-white">
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-blue-400 mb-2">EventsHub</h1>
          <p className="text-sm text-gray-400">Your User ID: {currentUser?.id}</p>
          
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#3a3d4a] hover:bg-[#4a4d5a] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </button>
        </div>

        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-[#252936] rounded-xl p-8 border border-[#3a3d4a]">
            <h2 className="text-3xl font-bold text-blue-400 mb-6 text-center">
              {selectedEvent.title}
            </h2>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span>{selectedEvent.date}</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-300">
                <Clock className="w-5 h-5 text-blue-400" />
                <span>{selectedEvent.time}</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span>{selectedEvent.location}</span>
              </div>

              <div className="bg-[#1a202c] rounded-lg p-4">
                <p className="text-gray-300 text-center">{selectedEvent.department}</p>
              </div>
              
              {selectedEvent.contactInfo && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span>Contact: {selectedEvent.contactInfo}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setCurrentPage('eventRegistration')}
                className="bg-[#3a3d4a] hover:bg-[#4a4d5a] text-white rounded-lg py-6 flex flex-col items-center gap-2"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  👤
                </div>
                Register
              </Button>

              <Button
                onClick={() => setCurrentPage('feedback')}
                className="bg-[#3a3d4a] hover:bg-[#4a4d5a] text-white rounded-lg py-6 flex flex-col items-center gap-2"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  💬
                </div>
                Feedback
              </Button>

              <Button
                onClick={() => setCurrentPage('requests')}
                className="bg-[#3a3d4a] hover:bg-[#4a4d5a] text-white rounded-lg py-6 flex flex-col items-center gap-2"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  🏅
                </div>
                Certificate/OD
              </Button>

              {currentUser?.isAdmin && (
                <Button
                  onClick={() => setCurrentPage('admin')}
                  className="bg-[#3a3d4a] hover:bg-[#4a4d5a] text-white rounded-lg py-6 flex flex-col items-center gap-2"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    📊
                  </div>
                  Admin View
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Event Registration Page Component
  const EventRegistrationPage = () => {
    const [formData, setFormData] = useState({
      fullName: '',
      email: '',
      registerNumber: '',
      department: '',
      slot: '',
      mobileNumber: '',
      reasonForRegistration: '',
      priorExperience: ''
    });

    const departments = ['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics'];
    const slots = ['Morning (9:00 AM - 12:00 PM)', 'Afternoon (1:00 PM - 4:00 PM)', 'Evening (5:00 PM - 8:00 PM)'];

    if (!selectedEvent) {
      return (
        <div className="min-h-screen bg-[#1a1d29] text-white flex items-center justify-center">
          <p>Event not found</p>
        </div>
      );
    }

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.fullName || !formData.email || !formData.registerNumber || 
          !formData.department || !formData.slot || !formData.mobileNumber || 
          !formData.reasonForRegistration) {
        alert('Please fill in all required fields');
        return;
      }

      addRegistration({
        eventId: selectedEvent.id,
        ...formData
      });

      alert('Registration submitted successfully! You will receive a confirmation email shortly.');
      setCurrentPage('eventDetails');
    };

    const handleChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
      <div className="min-h-screen bg-[#1a1d29] text-white">
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-blue-400 mb-2">EventsHub</h1>
          <p className="text-sm text-gray-400">Your User ID: {currentUser?.id}</p>
          
          <button 
            onClick={() => setCurrentPage('eventDetails')}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#3a3d4a] hover:bg-[#4a4d5a] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Event Details
          </button>
        </div>

        <div className="max-w-xl mx-auto px-6">
          <div className="bg-[#252936] rounded-xl p-8 border border-[#3a3d4a]">
            <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">
              Registration
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Your Full Name"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3"
                required
              />

              <Input
                type="email"
                placeholder="Your Gmail"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3"
                required
              />

              <Input
                type="text"
                placeholder="Register Number"
                value={formData.registerNumber}
                onChange={(e) => handleChange('registerNumber', e.target.value)}
                className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3"
                required
              />

              <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
                <SelectTrigger className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white rounded-lg px-4 py-3">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept} className="hover:bg-[#4a4d5a]">
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={formData.slot} onValueChange={(value) => handleChange('slot', value)}>
                <SelectTrigger className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white rounded-lg px-4 py-3">
                  <SelectValue placeholder="Slot" />
                </SelectTrigger>
                <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                  {slots.map((slot) => (
                    <SelectItem key={slot} value={slot} className="hover:bg-[#4a4d5a]">
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="tel"
                placeholder="Mobile Number"
                value={formData.mobileNumber}
                onChange={(e) => handleChange('mobileNumber', e.target.value)}
                className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3"
                required
              />

              <Textarea
                placeholder="Reason for Registration"
                value={formData.reasonForRegistration}
                onChange={(e) => handleChange('reasonForRegistration', e.target.value)}
                className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3 min-h-[100px] resize-none"
                rows={4}
                required
              />

              <Textarea
                placeholder="Prior Experience (Optional)"
                value={formData.priorExperience}
                onChange={(e) => handleChange('priorExperience', e.target.value)}
                className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3 min-h-[100px] resize-none"
                rows={4}
              />

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium mt-6"
              >
                Submit Registration
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Feedback Page Component
  const FeedbackPage = () => {
    const [feedback, setFeedback] = useState({
      name: '',
      email: '',
      rating: 0,
      eventRating: 0,
      organizationRating: 0,
      contentRating: 0,
      comments: '',
      suggestions: ''
    });

    if (!selectedEvent) {
      return (
        <div className="min-h-screen bg-[#1a1d29] text-white flex items-center justify-center">
          <p>Event not found</p>
        </div>
      );
    }

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!feedback.name || !feedback.email || feedback.rating === 0) {
        alert('Please fill in all required fields');
        return;
      }

      console.log('Feedback submitted:', feedback);
      alert('Thank you for your feedback! Your response has been recorded.');
      setCurrentPage('eventDetails');
    };

    const StarRating = ({ rating, onRatingChange, label }: { rating: number; onRatingChange: (rating: number) => void; label: string }) => (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange(star)}
              className={`p-1 transition-colors ${
                star <= rating ? 'text-yellow-400' : 'text-gray-500'
              }`}
            >
              <Star className="w-6 h-6 fill-current" />
            </button>
          ))}
        </div>
      </div>
    );

    return (
      <div className="min-h-screen bg-[#1a1d29] text-white">
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-blue-400 mb-2">EventsHub</h1>
          <p className="text-sm text-gray-400">Your User ID: {currentUser?.id}</p>
          
          <button 
            onClick={() => setCurrentPage('eventDetails')}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#3a3d4a] hover:bg-[#4a4d5a] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Event Details
          </button>
        </div>

        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-[#252936] rounded-xl p-8 border border-[#3a3d4a]">
            <h2 className="text-2xl font-bold text-blue-400 mb-2 text-center">
              Event Feedback
            </h2>
            <p className="text-center text-gray-400 mb-6">
              Help us improve by sharing your experience with "{selectedEvent.title}"
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder="Your Name *"
                  value={feedback.name}
                  onChange={(e) => setFeedback(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3"
                  required
                />
                <Input
                  type="email"
                  placeholder="Your Email *"
                  value={feedback.email}
                  onChange={(e) => setFeedback(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3"
                  required
                />
              </div>

              <StarRating
                rating={feedback.rating}
                onRatingChange={(rating) => setFeedback(prev => ({ ...prev, rating }))}
                label="Overall Event Rating *"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StarRating
                  rating={feedback.eventRating}
                  onRatingChange={(rating) => setFeedback(prev => ({ ...prev, eventRating: rating }))}
                  label="Event Content"
                />
                <StarRating
                  rating={feedback.organizationRating}
                  onRatingChange={(rating) => setFeedback(prev => ({ ...prev, organizationRating: rating }))}
                  label="Organization"
                />
                <StarRating
                  rating={feedback.contentRating}
                  onRatingChange={(rating) => setFeedback(prev => ({ ...prev, contentRating: rating }))}
                  label="Learning Value"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  What did you like most about this event?
                </label>
                <Textarea
                  placeholder="Share your thoughts..."
                  value={feedback.comments}
                  onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
                  className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3 min-h-[100px] resize-none"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Any suggestions for improvement?
                </label>
                <Textarea
                  placeholder="How can we make future events better?"
                  value={feedback.suggestions}
                  onChange={(e) => setFeedback(prev => ({ ...prev, suggestions: e.target.value }))}
                  className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3 min-h-[100px] resize-none"
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
              >
                Submit Feedback
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Request Page Component
  const RequestPage = () => {
    const [activeTab, setActiveTab] = useState<'OD' | 'CERTIFICATE'>('OD');
    const [requestData, setRequestData] = useState({
      reason: '',
      additionalInfo: '',
      contactInfo: ''
    });

    if (!selectedEvent) {
      return (
        <div className="min-h-screen bg-[#1a1d29] text-white flex items-center justify-center">
          <p>Event not found</p>
        </div>
      );
    }

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!requestData.reason) {
        alert('Please provide a reason for your request');
        return;
      }

      addRequest({
        eventId: selectedEvent.id,
        userId: currentUser?.id || '',
        userName: currentUser?.username || '',
        type: activeTab,
        reason: requestData.reason
      });

      alert(`${activeTab} request submitted successfully! You will receive an update once it's reviewed.`);
      setRequestData({ reason: '', additionalInfo: '', contactInfo: '' });
      setCurrentPage('eventDetails');
    };

    return (
      <div className="min-h-screen bg-[#1a1d29] text-white">
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-blue-400 mb-2">EventsHub</h1>
          <p className="text-sm text-gray-400">Your User ID: {currentUser?.id}</p>
          
          <button 
            onClick={() => setCurrentPage('eventDetails')}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#3a3d4a] hover:bg-[#4a4d5a] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Event Details
          </button>
        </div>

        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-[#252936] rounded-xl p-8 border border-[#3a3d4a]">
            <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">
              Request Documents
            </h2>
            
            <div className="flex mb-6 bg-[#1a202c] rounded-lg p-1">
              <button
                onClick={() => setActiveTab('OD')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors ${
                  activeTab === 'OD' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                On Duty (OD) Request
              </button>
              <button
                onClick={() => setActiveTab('CERTIFICATE')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors ${
                  activeTab === 'CERTIFICATE' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                Certificate Request
              </button>
            </div>

            <div className="bg-[#1a202c] rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-white mb-2">Event Information</h3>
              <div className="text-gray-300 space-y-1">
                <p><strong>Event:</strong> {selectedEvent.title}</p>
                <p><strong>Date:</strong> {selectedEvent.date}</p>
                <p><strong>Time:</strong> {selectedEvent.time}</p>
                <p><strong>Location:</strong> {selectedEvent.location}</p>
                <p><strong>Department:</strong> {selectedEvent.department}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-[#1a202c] rounded-lg p-4">
                {activeTab === 'OD' ? (
                  <div>
                    <h4 className="font-semibold text-blue-400 mb-2">On Duty (OD) Request</h4>
                    <p className="text-gray-300 text-sm">
                      Request an official On Duty letter for attendance at this event. This document 
                      can be used to justify your absence from regular classes or work commitments.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-semibold text-blue-400 mb-2">Certificate Request</h4>
                    <p className="text-gray-300 text-sm">
                      Request a participation certificate for attending this event. The certificate 
                      will be issued upon successful completion and attendance verification.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Reason for Request *
                </label>
                <Textarea
                  placeholder={`Why do you need this ${activeTab === 'OD' ? 'OD letter' : 'certificate'}?`}
                  value={requestData.reason}
                  onChange={(e) => setRequestData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3 min-h-[100px] resize-none"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Additional Information (Optional)
                </label>
                <Textarea
                  placeholder="Any additional details or special requirements..."
                  value={requestData.additionalInfo}
                  onChange={(e) => setRequestData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                  className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3 min-h-[80px] resize-none"
                  rows={3}
                />
              </div>

              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                <p className="text-yellow-200 text-sm">
                  <strong>Note:</strong> Your request will be reviewed by the event organizers and administration. 
                  Processing typically takes 2-3 business days. You will receive a notification once your request 
                  is approved or if additional information is needed.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
              >
                Submit {activeTab === 'OD' ? 'OD' : 'Certificate'} Request
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Admin Page Component
  const AdminPage = () => {
    const [uploading, setUploading] = useState<string | null>(null);

    const handleApprove = async (id: string, type: 'request' | 'registration') => {
      if (type === 'request') {
        setRequests(prev => prev.map(req => 
          req.id === id ? { ...req, status: 'approved' } : req
        ));
      } else {
        setRegistrations(prev => prev.map(reg => 
          reg.id === id ? { ...reg, status: 'approved' } : reg
        ));
      }
      
      addNotificationLocal({ message: `Request approved successfully`, type: 'success' });
    };

    const handleReject = (id: string, type: 'request' | 'registration') => {
      const reason = prompt('Please provide a reason for rejection:');
      if (reason) {
        if (type === 'request') {
          setRequests(prev => prev.map(req => 
            req.id === id ? { ...req, status: 'rejected' } : req
          ));
        } else {
          setRegistrations(prev => prev.map(reg => 
            reg.id === id ? { ...reg, status: 'rejected' } : reg
          ));
        }
        addNotificationLocal({ message: `Request rejected`, type: 'info' });
      }
    };

    const handleFileUpload = async (requestId: string, file: File) => {
      setUploading(requestId);
      try {
        // Mock upload for offline mode
        const documentUrl = `https://mock-storage.com/documents/${requestId}_${file.name}`;
        
        setRequests(prev => prev.map(req => 
          req.id === requestId ? { ...req, documentUrl, status: 'approved' } : req
        ));
        
        addNotificationLocal({ message: 'Document uploaded and request approved!', type: 'success' });
      } catch (error) {
        addNotificationLocal({ message: 'Failed to upload document', type: 'error' });
      } finally {
        setUploading(null);
      }
    };

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const pendingRegistrations = registrations.filter(r => r.status === 'pending');

    return (
      <div className="min-h-screen bg-[#1a1d29] text-white">
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-blue-400 mb-2">EventsHub</h1>
          <p className="text-sm text-gray-400">Admin Panel</p>
          
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#3a3d4a] hover:bg-[#4a4d5a] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-[#252936] rounded-xl p-8 border border-[#3a3d4a]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-blue-400">Admin Approval</h2>
            </div>

            <div className="space-y-6">
              {pendingRequests.map((request) => (
                <div key={request.id} className="bg-[#1a202c] rounded-lg p-6 border border-[#3a3d4a]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        {request.userName} - {request.type} Request
                      </h3>
                      <p className="text-gray-400 text-sm">Event: {request.eventId}</p>
                      <p className="text-gray-400 text-sm">Reason: {request.reason || 'No reason provided'}</p>
                      <p className="text-gray-400 text-sm">User ID: {request.userId}</p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="bg-yellow-600/20 text-yellow-400 border border-yellow-600/30"
                    >
                      Pending
                    </Badge>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <Button
                      onClick={() => handleApprove(request.id, 'request')}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(request.id, 'request')}
                      className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                    
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(request.id, file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading === request.id}
                      />
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                        disabled={uploading === request.id}
                      >
                        <Upload className="w-4 h-4" />
                        {uploading === request.id ? 'Uploading...' : 'Upload Document'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {pendingRegistrations.map((registration) => (
                <div key={registration.id} className="bg-[#1a202c] rounded-lg p-6 border border-[#3a3d4a]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        {registration.fullName} - Event Registration
                      </h3>
                      <p className="text-gray-400 text-sm">Event: {registration.eventId}</p>
                      <p className="text-gray-400 text-sm">Email: {registration.email}</p>
                      <p className="text-gray-400 text-sm">Department: {registration.department}</p>
                      <p className="text-gray-400 text-sm">Register Number: {registration.registerNumber}</p>
                      <p className="text-gray-400 text-sm">Reason: {registration.reasonForRegistration}</p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="bg-yellow-600/20 text-yellow-400 border border-yellow-600/30"
                    >
                      Pending
                    </Badge>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApprove(registration.id, 'registration')}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(registration.id, 'registration')}
                      className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}

              {pendingRequests.length === 0 && pendingRegistrations.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No pending requests or registrations</p>
                  <p className="text-gray-500 text-sm mt-2">All items have been processed</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Documents Page Component
  const DocumentsPage = () => {
    const userRequests = requests.filter(r => r.userId === currentUser?.id);
    const approvedRequests = userRequests.filter(r => r.status === 'approved' && r.documentUrl);

    const handleDownload = async (documentUrl: string, filename: string) => {
      try {
        // Mock download for offline mode
        const link = document.createElement('a');
        link.href = documentUrl;
        link.download = filename;
        link.target = '_blank';
        link.click();
        addNotificationLocal({ message: 'Document download initiated!', type: 'success' });
      } catch (error) {
        addNotificationLocal({ message: 'Failed to download document', type: 'error' });
      }
    };

    return (
      <div className="min-h-screen bg-[#1a1d29] text-white">
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-blue-400 mb-2">EventsHub</h1>
          <p className="text-sm text-gray-400">Your Documents</p>
          
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#3a3d4a] hover:bg-[#4a4d5a] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-[#252936] rounded-xl p-8 border border-[#3a3d4a]">
            <h2 className="text-2xl font-bold text-blue-400 mb-6">My Documents</h2>

            {approvedRequests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No approved documents available</p>
                <p className="text-gray-500 text-sm mt-2">Your approved certificates and OD letters will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvedRequests.map((request) => (
                  <div key={request.id} className="bg-[#1a202c] rounded-lg p-6 border border-[#3a3d4a]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white mb-2">
                          {request.type === 'OD' ? 'On Duty Letter' : 'Participation Certificate'}
                        </h3>
                        <p className="text-gray-400 text-sm">Event: {request.eventId}</p>
                        <p className="text-gray-400 text-sm">
                          Approved on: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                        <Badge className="bg-green-600/20 text-green-400 border border-green-600/30 mt-2">
                          Approved
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDownload(request.documentUrl!, `${request.type}_${request.id}.pdf`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                        <Button
                          onClick={() => window.open(request.documentUrl, '_blank')}
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-600 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 bg-[#1a202c] rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">All My Requests</h3>
              <div className="space-y-2">
                {userRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between py-2">
                    <span className="text-gray-300">
                      {request.type} Request - Event: {request.eventId}
                    </span>
                    <Badge 
                      className={`${
                        request.status === 'approved' ? 'bg-green-600/20 text-green-400 border-green-600/30' :
                        request.status === 'rejected' ? 'bg-red-600/20 text-red-400 border-red-600/30' :
                        'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
                      }`}
                    >
                      {request.status}
                    </Badge>
                  </div>
                ))}
                {userRequests.length === 0 && (
                  <p className="text-gray-400 text-sm">No requests found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main Render Function
  const renderPage = () => {
    if (!currentUser && currentPage !== 'register') {
      return <LoginPage />;
    }

    switch (currentPage) {
      case 'register':
        return <RegisterPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'eventDetails':
        return <EventDetailsPage />;
      case 'eventRegistration':
        return <EventRegistrationPage />;
      case 'feedback':
        return <FeedbackPage />;
      case 'requests':
        return <RequestPage />;
      case 'admin':
        return currentUser?.isAdmin ? <AdminPage /> : <DashboardPage />;
      case 'documents':
        return <DocumentsPage />;
      case 'achievers':
        return (
          <AchieversPage 
            onBack={() => setCurrentPage('dashboard')}
            currentUser={currentUser}
            isOfflineMode={isOfflineMode}
            addNotification={addNotificationLocal}
          />
        );
      case 'videos':
        return (
          <VideosPage 
            onBack={() => setCurrentPage('dashboard')}
            currentUser={currentUser}
            isOfflineMode={isOfflineMode}
            addNotification={addNotificationLocal}
          />
        );
      case 'faq':
        return (
          <FAQPage 
            onBack={() => setCurrentPage('dashboard')}
            currentUser={currentUser}
            isOfflineMode={isOfflineMode}
            addNotification={addNotificationLocal}
          />
        );
      case 'calendar':
        return (
          <CalendarPage 
            onBack={() => setCurrentPage('dashboard')}
            currentUser={currentUser}
            isOfflineMode={isOfflineMode}
            addNotification={addNotificationLocal}
            events={events}
            onEventClick={handleEventClick}
          />
        );
      case 'profile':
        return (
          <ProfilePage 
            onBack={() => setCurrentPage('dashboard')}
            currentUser={currentUser}
            isOfflineMode={isOfflineMode}
            addNotification={addNotificationLocal}
          />
        );
      case 'notifications':
        return (
          <NotificationsPage 
            onBack={() => setCurrentPage('dashboard')}
            currentUser={currentUser}
            isOfflineMode={isOfflineMode}
            addNotification={addNotificationLocal}
          />
        );
      case 'announcements':
        return (
          <AnnouncementsPage 
            onBack={() => setCurrentPage('dashboard')}
            currentUser={currentUser}
            isOfflineMode={isOfflineMode}
            addNotification={addNotificationLocal}
          />
        );
      case 'clubs':
        return (
          <ClubsPage 
            onBack={() => setCurrentPage('dashboard')}
            currentUser={currentUser}
            isOfflineMode={isOfflineMode}
            addNotification={addNotificationLocal}
          />
        );
      case 'projects':
        return (
          <ProjectsPage 
            onBack={() => setCurrentPage('dashboard')}
            currentUser={currentUser}
            isOfflineMode={isOfflineMode}
            addNotification={addNotificationLocal}
          />
        );
      case 'placements':
        return (
          <PlacementsPage 
            onBack={() => setCurrentPage('dashboard')}
            currentUser={currentUser}
            isOfflineMode={isOfflineMode}
            addNotification={addNotificationLocal}
          />
        );
      case 'resources':
        return (
          <ResourcesPage 
            onBack={() => setCurrentPage('dashboard')}
            currentUser={currentUser}
            isOfflineMode={isOfflineMode}
            addNotification={addNotificationLocal}
          />
        );
      default:
        return <DashboardPage />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1d29] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white">Loading EventsHub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1d29]">
      {renderPage()}
      
      {/* Offline Mode Indicator */}
      {isOfflineMode && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
            <span className="text-sm">Offline Mode</span>
          </div>
        </div>
      )}
      
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.slice(-3).map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg text-white shadow-lg ${
                notification.type === 'success' ? 'bg-green-600' :
                notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{notification.message}</span>
                <button
                  onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                  className="ml-2 text-white/70 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}