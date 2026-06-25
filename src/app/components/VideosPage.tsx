import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ArrowLeft, Video, Play, Calendar, Eye, Heart, Share2, Plus, Search, Filter, Clock, User, ExternalLink } from "lucide-react";
import { videosAPI } from '../services/api';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  views: number;
  likes: number;
  eventId?: string;
  eventName: string;
  department: string;
  category: string;
  uploadedBy: string;
  uploadDate: string;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
}

interface VideosPageProps {
  onBack: () => void;
  currentUser: any;
  isOfflineMode: boolean;
  addNotification: (notification: any) => void;
}

// Mock data for offline mode
const mockVideos: VideoItem[] = [
  {
    id: '1',
    title: 'TechFest 2024 Highlights',
    description: 'A comprehensive overview of the annual TechFest event featuring coding competitions, tech talks, and innovation showcases.',
    thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=225&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '12:45',
    views: 1250,
    likes: 89,
    eventId: '1',
    eventName: 'TechFest 2024',
    department: 'CSE',
    category: 'Event Highlights',
    uploadedBy: 'Admin',
    uploadDate: '2024-03-20',
    tags: ['technology', 'coding', 'competition', 'innovation'],
    isPublic: true,
    createdAt: new Date('2024-03-20')
  },
  {
    id: '2',
    title: 'AI Workshop: Machine Learning Basics',
    description: 'Introduction to machine learning concepts and practical implementation using Python and popular ML libraries.',
    thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=225&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '45:20',
    views: 2100,
    likes: 156,
    eventId: '2',
    eventName: 'AI/ML Workshop',
    department: 'AIML',
    category: 'Workshop',
    uploadedBy: 'Dr. Priya Sharma',
    uploadDate: '2024-03-15',
    tags: ['ai', 'machine-learning', 'python', 'workshop'],
    isPublic: true,
    createdAt: new Date('2024-03-15')
  },
  {
    id: '3',
    title: 'Robotics Competition Finals',
    description: 'Final round of the inter-college robotics competition showcasing autonomous robots and innovative designs.',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=225&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '28:15',
    views: 950,
    likes: 73,
    eventId: '3',
    eventName: 'RoboFest 2024',
    department: 'Mechanical',
    category: 'Competition',
    uploadedBy: 'Event Team',
    uploadDate: '2024-03-10',
    tags: ['robotics', 'competition', 'automation', 'engineering'],
    isPublic: true,
    createdAt: new Date('2024-03-10')
  },
  {
    id: '4',
    title: 'Web Development Masterclass',
    description: 'Complete guide to modern web development covering React, Node.js, and deployment strategies.',
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '1:15:30',
    views: 3200,
    likes: 245,
    eventId: '4',
    eventName: 'Web Dev Workshop',
    department: 'IT',
    category: 'Workshop',
    uploadedBy: 'Prof. Rahul Kumar',
    uploadDate: '2024-02-28',
    tags: ['web-development', 'react', 'nodejs', 'javascript'],
    isPublic: true,
    createdAt: new Date('2024-02-28')
  },
  {
    id: '5',
    title: 'Cultural Fest Dance Performance',
    description: 'Spectacular dance performances from the annual cultural festival featuring various dance forms and talented students.',
    thumbnail: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=400&h=225&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '18:42',
    views: 1800,
    likes: 134,
    eventId: '5',
    eventName: 'Cultural Fest 2024',
    department: 'ECE',
    category: 'Cultural',
    uploadedBy: 'Cultural Committee',
    uploadDate: '2024-04-05',
    tags: ['dance', 'cultural', 'performance', 'fest'],
    isPublic: true,
    createdAt: new Date('2024-04-05')
  },
  {
    id: '6',
    title: 'Startup Pitch Competition',
    description: 'Innovative startup ideas presented by students with expert feedback and mentorship sessions.',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '35:18',
    views: 1100,
    likes: 92,
    eventId: '6',
    eventName: 'Entrepreneur Summit',
    department: 'CSBS',
    category: 'Business',
    uploadedBy: 'Business Club',
    uploadDate: '2024-03-25',
    tags: ['startup', 'entrepreneurship', 'business', 'pitch'],
    isPublic: true,
    createdAt: new Date('2024-03-25')
  }
];

export default function VideosPage({ onBack, currentUser, isOfflineMode, addNotification }: VideosPageProps) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'most-liked'>('newest');

  const departments = ['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics'];
  const categories = ['Event Highlights', 'Workshop', 'Competition', 'Cultural', 'Business', 'Technical', 'Seminar'];

  useEffect(() => {
    loadVideos();
  }, []);

  useEffect(() => {
    filterAndSortVideos();
  }, [videos, searchTerm, selectedDepartment, selectedCategory, sortBy]);

  const loadVideos = async () => {
    try {
      if (isOfflineMode) {
        setVideos(mockVideos);
        return;
      }

      const response = await videosAPI.getAll();
      setVideos(response.videos || []);
    } catch (error) {
      console.error('Failed to load videos:', error);
      setVideos(mockVideos);
      addNotification({ message: 'Loaded videos in offline mode', type: 'info' });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortVideos = () => {
    let filtered = videos;

    if (searchTerm) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(video => video.department === selectedDepartment);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(video => video.category === selectedCategory);
    }

    // Sort videos
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'most-liked':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    setFilteredVideos(filtered);
  };

  const formatDuration = (duration: string) => {
    return duration;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const handleVideoClick = (video: VideoItem) => {
    setSelectedVideo(video);
    // Increment view count
    setVideos(prev => prev.map(v => 
      v.id === video.id ? { ...v, views: v.views + 1 } : v
    ));
  };

  const handleLikeVideo = (videoId: string) => {
    setVideos(prev => prev.map(v => 
      v.id === videoId ? { ...v, likes: v.likes + 1 } : v
    ));
    addNotification({ message: 'Video liked!', type: 'success' });
  };

  const handleShare = (video: VideoItem) => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description,
        url: video.videoUrl,
      });
    } else {
      navigator.clipboard.writeText(video.videoUrl);
      addNotification({ message: 'Video link copied to clipboard!', type: 'success' });
    }
  };

  const VideoCard = ({ video }: { video: VideoItem }) => (
    <Card className="bg-[#252936] border-[#3a3d4a] hover:border-blue-600/50 transition-all duration-200 group cursor-pointer">
      <div className="relative">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-t-lg">
          <Button
            onClick={() => handleVideoClick(video)}
            className="bg-blue-600 hover:bg-blue-700 rounded-full w-16 h-16 flex items-center justify-center"
          >
            <Play className="w-6 h-6 text-white ml-1" />
          </Button>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {formatDuration(video.duration)}
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-white group-hover:text-blue-400 transition-colors line-clamp-2">
          {video.title}
        </CardTitle>
        <CardDescription className="text-gray-400 line-clamp-2">
          {video.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{formatViews(video.views)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{video.likes}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(video.uploadDate).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-[#3a3d4a] text-gray-300 text-xs">
              {video.department}
            </Badge>
            <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs">
              {video.category}
            </Badge>
          </div>
          
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleLikeVideo(video.id);
              }}
              className="h-8 w-8 p-0 hover:bg-red-600/20 hover:text-red-400"
            >
              <Heart className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleShare(video);
              }}
              className="h-8 w-8 p-0 hover:bg-blue-600/20 hover:text-blue-400"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-gray-400">
          <div className="flex items-center gap-1 mb-1">
            <User className="w-3 h-3" />
            <span>by {video.uploadedBy}</span>
          </div>
          <p className="text-blue-400">{video.eventName}</p>
        </div>
        
        {video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {video.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
            {video.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{video.tags.length - 3}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const AddVideoModal = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      videoUrl: '',
      eventName: '',
      department: '',
      category: '',
      tags: '',
      isPublic: true
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.title || !formData.videoUrl || !formData.eventName) {
        addNotification({ message: 'Please fill in all required fields', type: 'error' });
        return;
      }

      try {
        const newVideo: VideoItem = {
          ...formData,
          id: Math.random().toString(36).substr(2, 9),
          thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=225&fit=crop',
          duration: '00:00',
          views: 0,
          likes: 0,
          uploadedBy: currentUser?.username || 'Unknown',
          uploadDate: new Date().toISOString().split('T')[0],
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          createdAt: new Date()
        };

        if (isOfflineMode) {
          setVideos(prev => [newVideo, ...prev]);
          addNotification({ message: 'Video added successfully (offline mode)!', type: 'success' });
        } else {
          const response = await videosAPI.create(formData);
          setVideos(prev => [response.video, ...prev]);
          addNotification({ message: 'Video added successfully!', type: 'success' });
        }

        setIsAddModalOpen(false);
        setFormData({
          title: '',
          description: '',
          videoUrl: '',
          eventName: '',
          department: '',
          category: '',
          tags: '',
          isPublic: true
        });
      } catch (error) {
        addNotification({ message: 'Failed to add video', type: 'error' });
      }
    };

    return (
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-[#252936] border-[#3a3d4a] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-blue-400">Add New Video</DialogTitle>
            <DialogDescription className="text-gray-400">
              Upload a new video to the EventsHub video library.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Video Title *"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
              required
            />

            <Textarea
              placeholder="Video Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 min-h-[80px]"
              rows={3}
            />

            <Input
              placeholder="Video URL (YouTube, Vimeo, etc.) *"
              value={formData.videoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Event Name *"
                value={formData.eventName}
                onChange={(e) => setFormData(prev => ({ ...prev, eventName: e.target.value }))}
                className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
                required
              />

              <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                <SelectTrigger className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Tags (comma-separated)"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Add Video
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const VideoPlayerModal = () => {
    if (!selectedVideo) return null;

    const getEmbedUrl = (url: string) => {
      // Convert YouTube URLs to embed format
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1].split('&')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    };

    return (
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="bg-[#252936] border-[#3a3d4a] text-white max-w-4xl">
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={getEmbedUrl(selectedVideo.videoUrl)}
                title={selectedVideo.title}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
              />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">{selectedVideo.title}</h3>
              <p className="text-gray-400 mb-4">{selectedVideo.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-4">
                  <span>{formatViews(selectedVideo.views)} views</span>
                  <span>{selectedVideo.likes} likes</span>
                  <span>Uploaded on {new Date(selectedVideo.uploadDate).toLocaleDateString()}</span>
                </div>
                <Button
                  onClick={() => window.open(selectedVideo.videoUrl, '_blank')}
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                  {selectedVideo.department}
                </Badge>
                <Badge variant="secondary" className="bg-[#3a3d4a] text-gray-300">
                  {selectedVideo.category}
                </Badge>
                {selectedVideo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const StatsCards = () => {
    const totalVideos = videos.length;
    const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
    const totalLikes = videos.reduce((sum, video) => sum + video.likes, 0);
    const departmentStats = departments.map(dept => ({
      name: dept,
      count: videos.filter(v => v.department === dept).length
    })).filter(stat => stat.count > 0).sort((a, b) => b.count - a.count);

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Videos</p>
                <p className="text-xl font-semibold text-white">{totalVideos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Views</p>
                <p className="text-xl font-semibold text-white">{formatViews(totalViews)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Likes</p>
                <p className="text-xl font-semibold text-white">{totalLikes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Categories</p>
                <p className="text-xl font-semibold text-white">
                  {new Set(videos.map(v => v.category)).size}
                </p>
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
          <p>Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1d29] text-white">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">EventsHub</h1>
        <p className="text-sm text-gray-400">Video Library & Event Highlights</p>
        
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#3a3d4a] hover:bg-[#4a4d5a] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-[#252936] rounded-xl p-8 border border-[#3a3d4a]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-blue-400">📹 Video Gallery</h2>
              <p className="text-gray-400 mt-1">Watch event highlights, workshops, and presentations</p>
            </div>
            
            {currentUser?.isAdmin && (
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Video
              </Button>
            )}
          </div>

          <StatsCards />

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-[#1a202c] rounded-lg">
            <div className="flex items-center gap-2 flex-1 min-w-[300px]">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search videos, events, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 flex-1"
              />
            </div>
            
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-40 bg-[#3a3d4a] border-[#4a4d5a] text-white">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40 bg-[#3a3d4a] border-[#4a4d5a] text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40 bg-[#3a3d4a] border-[#4a4d5a] text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most Viewed</SelectItem>
                <SelectItem value="most-liked">Most Liked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          {filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No videos found</p>
              <p className="text-gray-500 text-sm mt-2">
                {searchTerm || selectedDepartment !== 'all' || selectedCategory !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add the first video to get started'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-400">
                  Showing {filteredVideos.length} of {videos.length} videos
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <AddVideoModal />
      <VideoPlayerModal />
    </div>
  );
}