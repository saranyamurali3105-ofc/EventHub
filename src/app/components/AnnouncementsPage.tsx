import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { ArrowLeft, Megaphone, Plus, Search, Filter, Calendar, User, Eye, Edit3, Trash2, Pin, Archive, Send, Bell, Clock, Tag } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: 'general' | 'academic' | 'events' | 'urgent' | 'maintenance' | 'celebration';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isPinned: boolean;
  isActive: boolean;
  targetAudience: 'all' | 'students' | 'faculty' | 'staff' | string[];
  department?: string;
  expiresAt?: Date;
  attachments?: string[];
  author: string;
  authorRole: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  likes: number;
}

interface AnnouncementsPageProps {
  onBack: () => void;
  currentUser: any;
  isOfflineMode: boolean;
  addNotification: (notification: any) => void;
}

// Mock data for offline mode
const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Annual Tech Fest 2024 - Registration Open',
    content: 'We are excited to announce the Annual Tech Fest 2024! This year\'s theme is "Innovation for Tomorrow" and will feature workshops, competitions, keynote speeches, and networking opportunities. Registration is now open for all students and faculty members. Early bird discounts available until March 15th. Don\'t miss out on this amazing opportunity to showcase your skills and learn from industry experts.',
    summary: 'Annual Tech Fest 2024 registration is now open with early bird discounts until March 15th.',
    category: 'events',
    priority: 'high',
    isPinned: true,
    isActive: true,
    targetAudience: 'all',
    author: 'Dr. Rajesh Kumar',
    authorRole: 'Dean of Engineering',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
    expiresAt: new Date('2024-04-30'),
    views: 1250,
    likes: 89
  },
  {
    id: '2',
    title: 'Library Hours Extended During Exam Week',
    content: 'The college library will extend its operating hours during the upcoming exam week (March 18-25). The library will be open from 6:00 AM to 11:00 PM to accommodate students\' study needs. Additional study spaces have been arranged in the conference halls. Please maintain silence and follow library protocols.',
    summary: 'Library hours extended to 6 AM - 11 PM during exam week (March 18-25).',
    category: 'academic',
    priority: 'medium',
    isPinned: false,
    isActive: true,
    targetAudience: 'students',
    author: 'Library Administration',
    authorRole: 'Librarian',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10'),
    expiresAt: new Date('2024-03-26'),
    views: 890,
    likes: 45
  },
  {
    id: '3',
    title: 'New Student Clubs - Join Now!',
    content: 'We are launching three new student clubs this semester: AI & Machine Learning Club, Robotics Club, and Digital Arts Club. These clubs offer hands-on experience, peer learning, and industry connections. Membership is open to all students regardless of department. Club activities include workshops, competitions, and collaborative projects.',
    summary: 'Three new student clubs launched: AI/ML, Robotics, and Digital Arts. Open to all students.',
    category: 'general',
    priority: 'medium',
    isPinned: false,
    isActive: true,
    targetAudience: 'students',
    author: 'Student Affairs Office',
    authorRole: 'Student Coordinator',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05'),
    views: 567,
    likes: 34
  },
  {
    id: '4',
    title: 'Campus Network Maintenance - March 20',
    content: 'The campus network will undergo scheduled maintenance on March 20th from 2:00 AM to 6:00 AM. During this time, internet connectivity and online services may be temporarily unavailable. Please plan your online activities accordingly. The maintenance is necessary to upgrade our network infrastructure for better performance.',
    summary: 'Campus network maintenance on March 20, 2:00 AM - 6:00 AM. Internet may be unavailable.',
    category: 'maintenance',
    priority: 'urgent',
    isPinned: true,
    isActive: true,
    targetAudience: 'all',
    author: 'IT Department',
    authorRole: 'Network Administrator',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15'),
    expiresAt: new Date('2024-03-21'),
    views: 2100,
    likes: 12
  },
  {
    id: '5',
    title: 'Congratulations to Our Coding Competition Winners!',
    content: 'We are proud to announce the winners of our Inter-College Coding Competition held last weekend. First place: Team Alpha (CSE), Second place: Team Beta (IT), Third place: Team Gamma (AIML). All participants showed exceptional problem-solving skills and creativity. Certificates and prizes will be distributed next week.',
    summary: 'Coding competition results announced. Congratulations to Team Alpha, Beta, and Gamma!',
    category: 'celebration',
    priority: 'low',
    isPinned: false,
    isActive: true,
    targetAudience: 'all',
    author: 'Programming Club',
    authorRole: 'Club Coordinator',
    createdAt: new Date('2024-03-12'),
    updatedAt: new Date('2024-03-12'),
    views: 890,
    likes: 156
  }
];

export default function AnnouncementsPage({ onBack, currentUser, isOfflineMode, addNotification }: AnnouncementsPageProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Announcement['category']>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Announcement['priority']>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const categories = ['general', 'academic', 'events', 'urgent', 'maintenance', 'celebration'] as const;
  const priorities = ['low', 'medium', 'high', 'urgent'] as const;

  useEffect(() => {
    loadAnnouncements();
  }, []);

  useEffect(() => {
    filterAnnouncements();
  }, [announcements, searchTerm, categoryFilter, priorityFilter]);

  const loadAnnouncements = async () => {
    try {
      if (isOfflineMode) {
        setAnnouncements(mockAnnouncements);
        return;
      }

      // In a real app, this would be an API call
      setAnnouncements(mockAnnouncements);
      addNotification({ message: 'Loaded announcements in offline mode', type: 'info' });
    } catch (error) {
      console.error('Failed to load announcements:', error);
      setAnnouncements(mockAnnouncements);
    } finally {
      setLoading(false);
    }
  };

  const filterAnnouncements = () => {
    let filtered = announcements.filter(a => a.isActive);

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(a => a.category === categoryFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(a => a.priority === priorityFilter);
    }

    // Sort by pinned first, then by creation date
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredAnnouncements(filtered);
  };

  const handleCreateAnnouncement = async (announcementData: Partial<Announcement>) => {
    const newAnnouncement: Announcement = {
      ...announcementData,
      id: Math.random().toString(36).substr(2, 9),
      author: currentUser?.username || 'Unknown',
      authorRole: currentUser?.isAdmin ? 'Administrator' : 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      likes: 0,
      isActive: true
    } as Announcement;

    setAnnouncements(prev => [newAnnouncement, ...prev]);
    addNotification({ message: 'Announcement created successfully!', type: 'success' });
    setIsCreateModalOpen(false);
  };

  const handleEditAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    setAnnouncements(prev => prev.map(a => 
      a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
    ));
    addNotification({ message: 'Announcement updated successfully!', type: 'success' });
    setEditingAnnouncement(null);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    addNotification({ message: 'Announcement deleted successfully', type: 'success' });
  };

  const handleTogglePin = async (id: string) => {
    setAnnouncements(prev => prev.map(a => 
      a.id === id ? { ...a, isPinned: !a.isPinned } : a
    ));
    addNotification({ message: 'Announcement pin status updated', type: 'success' });
  };

  const handleViewAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setAnnouncements(prev => prev.map(a => 
      a.id === announcement.id ? { ...a, views: a.views + 1 } : a
    ));
  };

  const getCategoryIcon = (category: Announcement['category']) => {
    switch (category) {
      case 'general': return '📢';
      case 'academic': return '📚';
      case 'events': return '🎉';
      case 'urgent': return '🚨';
      case 'maintenance': return '🔧';
      case 'celebration': return '🎊';
      default: return '📋';
    }
  };

  const getCategoryColor = (category: Announcement['category']) => {
    switch (category) {
      case 'general': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'academic': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'events': return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
      case 'urgent': return 'bg-red-600/20 text-red-400 border-red-600/30';
      case 'maintenance': return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      case 'celebration': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const getPriorityColor = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-600/20 text-red-400 border-red-600/30';
      case 'high': return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      case 'medium': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'low': return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
      default: return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
    }
  };

  const AnnouncementCard = ({ announcement }: { announcement: Announcement }) => (
    <Card className={`bg-[#252936] border-[#3a3d4a] hover:border-blue-600/50 transition-all duration-200 cursor-pointer ${
      announcement.isPinned ? 'ring-1 ring-yellow-600/30' : ''
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {announcement.isPinned && <Pin className="w-4 h-4 text-yellow-400" />}
              <h3 className="font-semibold text-white text-lg line-clamp-2">
                {announcement.title}
              </h3>
            </div>
            <p className="text-gray-300 text-sm line-clamp-3 mb-3">
              {announcement.summary}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getCategoryColor(announcement.category)}>
                <span className="mr-1">{getCategoryIcon(announcement.category)}</span>
                {announcement.category}
              </Badge>
              <Badge className={getPriorityColor(announcement.priority)} variant="outline">
                {announcement.priority}
              </Badge>
              {announcement.expiresAt && new Date(announcement.expiresAt) > new Date() && (
                <Badge variant="secondary" className="bg-[#3a3d4a] text-gray-300 text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Expires {new Date(announcement.expiresAt).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>
          
          {currentUser?.isAdmin && (
            <div className="flex items-center gap-1 ml-4">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTogglePin(announcement.id);
                }}
                className="h-8 w-8 p-0 hover:bg-yellow-600/20 hover:text-yellow-400"
              >
                <Pin className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingAnnouncement(announcement);
                }}
                className="h-8 w-8 p-0 hover:bg-blue-600/20 hover:text-blue-400"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteAnnouncement(announcement.id);
                }}
                className="h-8 w-8 p-0 hover:bg-red-600/20 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{announcement.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{announcement.views}</span>
            </div>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleViewAnnouncement(announcement);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Read More
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CreateAnnouncementModal = () => {
    const [formData, setFormData] = useState({
      title: '',
      content: '',
      summary: '',
      category: 'general' as Announcement['category'],
      priority: 'medium' as Announcement['priority'],
      isPinned: false,
      targetAudience: 'all',
      expiresAt: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.title || !formData.content) {
        addNotification({ message: 'Please fill in all required fields', type: 'error' });
        return;
      }

      handleCreateAnnouncement({
        ...formData,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined
      });
    };

    return (
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-[#252936] border-[#3a3d4a] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-400">Create New Announcement</DialogTitle>
            <DialogDescription className="text-gray-400">
              Share important information with the campus community
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Announcement Title *"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
              required
            />

            <Textarea
              placeholder="Brief Summary *"
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 min-h-[60px]"
              rows={2}
              required
            />

            <Textarea
              placeholder="Full Content *"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 min-h-[120px]"
              rows={5}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Select value={formData.category} onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {getCategoryIcon(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Input
              type="date"
              placeholder="Expiration Date (Optional)"
              value={formData.expiresAt}
              onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white"
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPinned"
                checked={formData.isPinned}
                onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="isPinned" className="text-gray-300 text-sm">
                Pin this announcement to the top
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Publish Announcement
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const ViewAnnouncementModal = () => {
    if (!selectedAnnouncement) return null;

    return (
      <Dialog open={!!selectedAnnouncement} onOpenChange={() => setSelectedAnnouncement(null)}>
        <DialogContent className="bg-[#252936] border-[#3a3d4a] text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-blue-400 text-xl mb-2">
                  {selectedAnnouncement.isPinned && <Pin className="w-5 h-5 text-yellow-400 inline mr-2" />}
                  {selectedAnnouncement.title}
                </DialogTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getCategoryColor(selectedAnnouncement.category)}>
                    <span className="mr-1">{getCategoryIcon(selectedAnnouncement.category)}</span>
                    {selectedAnnouncement.category}
                  </Badge>
                  <Badge className={getPriorityColor(selectedAnnouncement.priority)} variant="outline">
                    {selectedAnnouncement.priority}
                  </Badge>
                </div>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-gray-300 leading-relaxed">
              {selectedAnnouncement.content}
            </div>
            
            <div className="border-t border-[#3a3d4a] pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                <div>
                  <p><strong>Author:</strong> {selectedAnnouncement.author}</p>
                  <p><strong>Role:</strong> {selectedAnnouncement.authorRole}</p>
                </div>
                <div>
                  <p><strong>Published:</strong> {new Date(selectedAnnouncement.createdAt).toLocaleDateString()}</p>
                  <p><strong>Views:</strong> {selectedAnnouncement.views}</p>
                </div>
              </div>
              
              {selectedAnnouncement.expiresAt && (
                <div className="mt-2 p-2 bg-yellow-600/20 border border-yellow-600/30 rounded text-yellow-200 text-sm">
                  <strong>Expires:</strong> {new Date(selectedAnnouncement.expiresAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const StatsCards = () => {
    const totalAnnouncements = announcements.filter(a => a.isActive).length;
    const pinnedCount = announcements.filter(a => a.isPinned && a.isActive).length;
    const urgentCount = announcements.filter(a => a.priority === 'urgent' && a.isActive).length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Active</p>
                <p className="text-xl font-semibold text-white">{totalAnnouncements}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                <Pin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Pinned</p>
                <p className="text-xl font-semibold text-white">{pinnedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Urgent</p>
                <p className="text-xl font-semibold text-white">{urgentCount}</p>
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
          <p>Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1d29] text-white">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">EventsHub</h1>
        <p className="text-sm text-gray-400">Campus Announcements</p>
        
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#3a3d4a] hover:bg-[#4a4d5a] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-[#252936] rounded-xl p-8 border border-[#3a3d4a]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-blue-400">📢 Campus Announcements</h2>
              <p className="text-gray-400 mt-1">Stay informed with the latest campus news and updates</p>
            </div>
            
            {currentUser?.isAdmin && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Announcement
              </Button>
            )}
          </div>

          <StatsCards />

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-[#1a202c] rounded-lg">
            <div className="flex items-center gap-2 flex-1 min-w-[300px]">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 flex-1"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
              <SelectTrigger className="w-40 bg-[#3a3d4a] border-[#4a4d5a] text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {getCategoryIcon(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
              <SelectTrigger className="w-32 bg-[#3a3d4a] border-[#4a4d5a] text-white">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                <SelectItem value="all">All Priorities</SelectItem>
                {priorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Announcements List */}
          {filteredAnnouncements.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No announcements found</p>
              <p className="text-gray-500 text-sm mt-2">
                {searchTerm || categoryFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'New announcements will appear here'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-400">
                  Showing {filteredAnnouncements.length} of {announcements.filter(a => a.isActive).length} announcements
                </p>
              </div>

              <div className="space-y-4">
                {filteredAnnouncements.map((announcement) => (
                  <AnnouncementCard key={announcement.id} announcement={announcement} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateAnnouncementModal />
      <ViewAnnouncementModal />
    </div>
  );
}