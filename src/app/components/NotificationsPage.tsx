import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { ArrowLeft, Bell, BellRing, Check, X, Clock, Calendar, User, Mail, Trash2, MailOpen, Settings, Filter, Search, Archive, Send } from "lucide-react";
import { notificationsAPI } from '../services/api';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'event' | 'registration' | 'approval' | 'reminder' | 'announcement' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  eventId?: string;
  actionUrl?: string;
  createdAt: Date;
  expiresAt?: Date;
  sender?: string;
  metadata?: any;
}

interface NotificationsPageProps {
  onBack: () => void;
  currentUser: any;
  isOfflineMode: boolean;
  addNotification: (notification: any) => void;
}

// Mock notifications for offline mode
const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Event Registration Approved',
    message: 'Your registration for "Web Development Workshop" has been approved. The event starts tomorrow at 10:00 AM.',
    type: 'approval',
    priority: 'high',
    isRead: false,
    eventId: '1',
    actionUrl: '/events/1',
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    sender: 'Event Team'
  },
  {
    id: '2',
    title: 'New Event: AI/ML Workshop',
    message: 'A new workshop on Artificial Intelligence and Machine Learning has been announced. Registration opens tomorrow.',
    type: 'event',
    priority: 'medium',
    isRead: false,
    eventId: '2',
    actionUrl: '/events/2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    sender: 'AIML Department'
  },
  {
    id: '3',
    title: 'Certificate Ready for Download',
    message: 'Your participation certificate for "Coding Competition 2024" is now ready for download.',
    type: 'approval',
    priority: 'medium',
    isRead: true,
    actionUrl: '/documents',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    sender: 'Admin'
  },
  {
    id: '4',
    title: 'Event Reminder',
    message: 'Don\'t forget about the "Technical Symposium" happening tomorrow at 10:00 AM in Engineering Block.',
    type: 'reminder',
    priority: 'high',
    isRead: false,
    eventId: '5',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // Expires in 24 hours
    sender: 'System'
  },
  {
    id: '5',
    title: 'System Maintenance Notice',
    message: 'EventsHub will undergo scheduled maintenance on Sunday from 2:00 AM to 4:00 AM. Some features may be temporarily unavailable.',
    type: 'system',
    priority: 'low',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // Expires in 3 days
    sender: 'System Admin'
  },
  {
    id: '6',
    title: 'Welcome to EventsHub!',
    message: 'Welcome to EventsHub! Explore upcoming events, register for workshops, and connect with your college community.',
    type: 'announcement',
    priority: 'low',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
    sender: 'EventsHub Team'
  }
];

export default function NotificationsPage({ onBack, currentUser, isOfflineMode, addNotification }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | NotificationItem['type']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, filter, typeFilter, searchTerm]);

  const loadNotifications = async () => {
    try {
      if (isOfflineMode) {
        setNotifications(mockNotifications);
        return;
      }

      const response = await notificationsAPI.getAll();
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications(mockNotifications);
      addNotification({ message: 'Loaded notifications in offline mode', type: 'info' });
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    // Filter by read status
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.sender?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
    
    try {
      if (!isOfflineMode) {
        await notificationsAPI.markAsRead(notificationId);
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAsUnread = async (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: false } : n
    ));
    
    try {
      if (!isOfflineMode) {
        await notificationsAPI.markAsUnread(notificationId);
      }
    } catch (error) {
      console.error('Failed to mark as unread:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
    
    try {
      if (!isOfflineMode) {
        await notificationsAPI.delete(notificationId);
      }
      addNotification({ message: 'Notification deleted', type: 'success' });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      addNotification({ message: 'Failed to delete notification', type: 'error' });
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    
    try {
      if (!isOfflineMode) {
        await notificationsAPI.markAllAsRead();
      }
      addNotification({ message: 'All notifications marked as read', type: 'success' });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteSelected = async () => {
    if (selectedNotifications.length === 0) return;
    
    setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
    setSelectedNotifications([]);
    
    try {
      if (!isOfflineMode) {
        await Promise.all(selectedNotifications.map(id => notificationsAPI.delete(id)));
      }
      addNotification({ message: `${selectedNotifications.length} notifications deleted`, type: 'success' });
    } catch (error) {
      console.error('Failed to delete notifications:', error);
    }
  };

  const toggleSelection = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAll = () => {
    setSelectedNotifications(filteredNotifications.map(n => n.id));
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'event': return '📅';
      case 'registration': return '📝';
      case 'approval': return '✅';
      case 'reminder': return '⏰';
      case 'announcement': return '📢';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  const getPriorityColor = (priority: NotificationItem['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-600/20 text-red-400 border-red-600/30';
      case 'high': return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      case 'medium': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'low': return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
      default: return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const NotificationCard = ({ notification }: { notification: NotificationItem }) => (
    <Card 
      className={`bg-[#252936] border-[#3a3d4a] transition-all duration-200 cursor-pointer ${
        !notification.isRead ? 'border-blue-600/50 bg-[#252936]/80' : ''
      } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-600' : ''}`}
      onClick={() => !notification.isRead && markAsRead(notification.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedNotifications.includes(notification.id)}
              onChange={(e) => {
                e.stopPropagation();
                toggleSelection(notification.id);
              }}
              className="rounded"
            />
            <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className={`font-semibold ${notification.isRead ? 'text-gray-300' : 'text-white'}`}>
                  {notification.title}
                </h3>
                <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-400' : 'text-gray-300'}`}>
                  {notification.message}
                </p>
              </div>
              
              <div className="flex items-center gap-2 ml-3">
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
                <Badge className={getPriorityColor(notification.priority)} variant="outline">
                  {notification.priority}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(notification.createdAt)}</span>
                </div>
                {notification.sender && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{notification.sender}</span>
                  </div>
                )}
                {notification.expiresAt && new Date(notification.expiresAt) > new Date() && (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Calendar className="w-3 h-3" />
                    <span>Expires {formatTimeAgo(notification.expiresAt)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    notification.isRead ? markAsUnread(notification.id) : markAsRead(notification.id);
                  }}
                  className="h-6 w-6 p-0 hover:bg-blue-600/20 hover:text-blue-400"
                >
                  {notification.isRead ? <MailOpen className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  className="h-6 w-6 p-0 hover:bg-red-600/20 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const StatsCards = () => {
    const totalNotifications = notifications.length;
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const todayCount = notifications.filter(n => {
      const today = new Date();
      const notificationDate = new Date(n.createdAt);
      return notificationDate.toDateString() === today.toDateString();
    }).length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-xl font-semibold text-white">{totalNotifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <BellRing className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Unread</p>
                <p className="text-xl font-semibold text-white">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Today</p>
                <p className="text-xl font-semibold text-white">{todayCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1d29] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1d29] text-white">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">EventsHub</h1>
        <p className="text-sm text-gray-400">Notifications Center</p>
        
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#3a3d4a] hover:bg-[#4a4d5a] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-[#252936] rounded-xl p-8 border border-[#3a3d4a]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-blue-400">🔔 Notifications</h2>
              <p className="text-gray-400 mt-1">Stay updated with the latest events and announcements</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={markAllAsRead}
                variant="outline"
                size="sm"
                className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                disabled={notifications.filter(n => !n.isRead).length === 0}
              >
                <Check className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            </div>
          </div>

          <StatsCards />

          {/* Filters and Actions */}
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-[#1a202c] rounded-lg">
            <div className="flex items-center gap-2 flex-1 min-w-[300px]">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 flex-1"
              />
            </div>
            
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-32 bg-[#3a3d4a] border-[#4a4d5a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
              <SelectTrigger className="w-40 bg-[#3a3d4a] border-[#4a4d5a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="event">Events</SelectItem>
                <SelectItem value="registration">Registration</SelectItem>
                <SelectItem value="approval">Approvals</SelectItem>
                <SelectItem value="reminder">Reminders</SelectItem>
                <SelectItem value="announcement">Announcements</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <div className="flex items-center justify-between mb-4 p-3 bg-blue-600/20 border border-blue-600/30 rounded-lg">
              <span className="text-blue-400 text-sm">
                {selectedNotifications.length} notification(s) selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={deleteSelected}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearSelection}
                  className="border-gray-600 text-gray-300 hover:bg-gray-600"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}

          {/* Quick Selection */}
          <div className="flex items-center gap-2 mb-4">
            <Button
              size="sm"
              variant="outline"
              onClick={selectAll}
              className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
            >
              Select All
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedNotifications(filteredNotifications.filter(n => !n.isRead).map(n => n.id))}
              className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white"
            >
              Select Unread
            </Button>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No notifications found</p>
              <p className="text-gray-500 text-sm mt-2">
                {searchTerm || filter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'New notifications will appear here'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}