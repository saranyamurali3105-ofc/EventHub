import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ArrowLeft, Trophy, Medal, Award, Star, Calendar, MapPin, User, Plus, Search, Filter, Crown, Target } from "lucide-react";
import { achieversAPI } from '../services/api';

interface Achiever {
  id: string;
  name: string;
  registerNumber: string;
  department: string;
  achievement: string;
  eventName: string;
  position: string;
  date: string;
  description: string;
  category: string;
  imageUrl?: string;
  certificateUrl?: string;
  createdAt: Date;
}

interface AchieversPageProps {
  onBack: () => void;
  currentUser: any;
  isOfflineMode: boolean;
  addNotification: (notification: any) => void;
}

// Mock data for offline mode
const mockAchievers: Achiever[] = [
  {
    id: '1',
    name: 'Adithya Krishnan',
    registerNumber: '20CSE001',
    department: 'CSE',
    achievement: 'First Place - Coding Competition 2024',
    eventName: 'TechFest 2024',
    position: '1st',
    date: '2024-03-15',
    description: 'Outstanding performance in competitive programming, solving complex algorithms within time constraints.',
    category: 'Technical',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    certificateUrl: 'https://mock-storage.com/certificates/cert1.pdf',
    createdAt: new Date('2024-03-15')
  },
  {
    id: '2',
    name: 'Priya Sharma',
    registerNumber: '20AIML015',
    department: 'AIML',
    achievement: 'Best Project Award - AI Innovation',
    eventName: 'AI Symposium',
    position: '1st',
    date: '2024-03-20',
    description: 'Developed an innovative machine learning model for healthcare diagnosis with 95% accuracy.',
    category: 'Research',
    imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b882?w=150&h=150&fit=crop&crop=face',
    certificateUrl: 'https://mock-storage.com/certificates/cert2.pdf',
    createdAt: new Date('2024-03-20')
  },
  {
    id: '3',
    name: 'Rahul Kumar',
    registerNumber: '20ECE023',
    department: 'ECE',
    achievement: 'Second Place - Circuit Design Challenge',
    eventName: 'ElectroFest 2024',
    position: '2nd',
    date: '2024-03-10',
    description: 'Designed an efficient IoT-based home automation system with energy optimization.',
    category: 'Technical',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    createdAt: new Date('2024-03-10')
  },
  {
    id: '4',
    name: 'Sneha Patel',
    registerNumber: '20IT008',
    department: 'IT',
    achievement: 'Excellence in Web Development',
    eventName: 'Web Dev Workshop',
    position: '1st',
    date: '2024-02-28',
    description: 'Created a responsive e-commerce platform with advanced features and seamless user experience.',
    category: 'Technical',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    createdAt: new Date('2024-02-28')
  },
  {
    id: '5',
    name: 'Arjun Reddy',
    registerNumber: '20MECH012',
    department: 'Mechanical',
    achievement: 'Innovation Award - Robotics',
    eventName: 'RoboFest 2024',
    position: '1st',
    date: '2024-04-05',
    description: 'Built an autonomous robot capable of complex navigation and object manipulation tasks.',
    category: 'Innovation',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    createdAt: new Date('2024-04-05')
  },
  {
    id: '6',
    name: 'Kavya Menon',
    registerNumber: '20CSBS019',
    department: 'CSBS',
    achievement: 'Best Presentation - Business Analytics',
    eventName: 'Business Summit 2024',
    position: '1st',
    date: '2024-03-25',
    description: 'Presented comprehensive market analysis with predictive modeling for startup success.',
    category: 'Business',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    createdAt: new Date('2024-03-25')
  }
];

export default function AchieversPage({ onBack, currentUser, isOfflineMode, addNotification }: AchieversPageProps) {
  const [achievers, setAchievers] = useState<Achiever[]>([]);
  const [filteredAchievers, setFilteredAchievers] = useState<Achiever[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const departments = ['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics'];
  const categories = ['Technical', 'Research', 'Innovation', 'Business', 'Cultural', 'Sports'];

  useEffect(() => {
    loadAchievers();
  }, []);

  useEffect(() => {
    filterAchievers();
  }, [achievers, searchTerm, selectedDepartment, selectedCategory]);

  const loadAchievers = async () => {
    try {
      if (isOfflineMode) {
        setAchievers(mockAchievers);
        return;
      }

      const response = await achieversAPI.getAll();
      setAchievers(response.achievers || []);
    } catch (error) {
      console.error('Failed to load achievers:', error);
      setAchievers(mockAchievers);
      addNotification({ message: 'Loaded achievers in offline mode', type: 'info' });
    } finally {
      setLoading(false);
    }
  };

  const filterAchievers = () => {
    let filtered = achievers;

    if (searchTerm) {
      filtered = filtered.filter(achiever =>
        achiever.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        achiever.achievement.toLowerCase().includes(searchTerm.toLowerCase()) ||
        achiever.eventName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(achiever => achiever.department === selectedDepartment);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(achiever => achiever.category === selectedCategory);
    }

    setFilteredAchievers(filtered);
  };

  const getPositionIcon = (position: string) => {
    switch (position) {
      case '1st':
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case '2nd':
        return <Medal className="w-5 h-5 text-gray-400" />;
      case '3rd':
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <Trophy className="w-5 h-5 text-blue-400" />;
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case '1st':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case '2nd':
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
      case '3rd':
        return 'bg-amber-600/20 text-amber-400 border-amber-600/30';
      default:
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
    }
  };

  const AchieverCard = ({ achiever }: { achiever: Achiever }) => (
    <Card className="bg-[#252936] border-[#3a3d4a] hover:border-blue-600/50 transition-all duration-200 group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {achiever.imageUrl ? (
              <img
                src={achiever.imageUrl}
                alt={achiever.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#3a3d4a]"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <CardTitle className="text-white group-hover:text-blue-400 transition-colors">
                {achiever.name}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {achiever.registerNumber} • {achiever.department}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getPositionIcon(achiever.position)}
            <Badge className={getPositionColor(achiever.position)}>
              {achiever.position}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-white mb-1">{achiever.achievement}</h4>
          <p className="text-gray-300 text-sm">{achiever.description}</p>
        </div>
        
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(achiever.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{achiever.eventName}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <Badge variant="secondary" className="bg-[#3a3d4a] text-gray-300">
            {achiever.category}
          </Badge>
          {achiever.certificateUrl && (
            <Button
              size="sm"
              variant="outline"
              className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
              onClick={() => window.open(achiever.certificateUrl, '_blank')}
            >
              View Certificate
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const AchieverListItem = ({ achiever }: { achiever: Achiever }) => (
    <Card className="bg-[#252936] border-[#3a3d4a] hover:border-blue-600/50 transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {achiever.imageUrl ? (
              <img
                src={achiever.imageUrl}
                alt={achiever.name}
                className="w-10 h-10 rounded-full object-cover border border-[#3a3d4a]"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-white truncate">{achiever.name}</h4>
                <span className="text-gray-400 text-sm">•</span>
                <span className="text-gray-400 text-sm">{achiever.department}</span>
              </div>
              <p className="text-blue-400 text-sm font-medium mb-1">{achiever.achievement}</p>
              <p className="text-gray-400 text-sm">{achiever.eventName} • {new Date(achiever.date).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className={getPositionColor(achiever.position)}>
              {achiever.position}
            </Badge>
            <Badge variant="secondary" className="bg-[#3a3d4a] text-gray-300">
              {achiever.category}
            </Badge>
            {achiever.certificateUrl && (
              <Button
                size="sm"
                variant="outline"
                className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                onClick={() => window.open(achiever.certificateUrl, '_blank')}
              >
                Certificate
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const AddAchieverModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      registerNumber: '',
      department: '',
      achievement: '',
      eventName: '',
      position: '',
      date: '',
      description: '',
      category: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.name || !formData.achievement || !formData.eventName || !formData.position) {
        addNotification({ message: 'Please fill in all required fields', type: 'error' });
        return;
      }

      try {
        const newAchiever: Achiever = {
          ...formData,
          id: Math.random().toString(36).substr(2, 9),
          imageUrl: '',
          createdAt: new Date()
        };

        if (isOfflineMode) {
          setAchievers(prev => [newAchiever, ...prev]);
          addNotification({ message: 'Achiever added successfully (offline mode)!', type: 'success' });
        } else {
          const response = await achieversAPI.create(formData);
          setAchievers(prev => [response.achiever, ...prev]);
          addNotification({ message: 'Achiever added successfully!', type: 'success' });
        }

        setIsAddModalOpen(false);
        setFormData({
          name: '',
          registerNumber: '',
          department: '',
          achievement: '',
          eventName: '',
          position: '',
          date: '',
          description: '',
          category: ''
        });
      } catch (error) {
        addNotification({ message: 'Failed to add achiever', type: 'error' });
      }
    };

    return (
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-[#252936] border-[#3a3d4a] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-blue-400">Add New Achiever</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a new achievement to showcase student accomplishments.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Student Name *"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
                required
              />
              <Input
                placeholder="Register Number"
                value={formData.registerNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, registerNumber: e.target.value }))}
                className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <Input
              placeholder="Achievement Title *"
              value={formData.achievement}
              onChange={(e) => setFormData(prev => ({ ...prev, achievement: e.target.value }))}
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
              <Select value={formData.position} onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}>
                <SelectTrigger className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                  <SelectValue placeholder="Position *" />
                </SelectTrigger>
                <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                  <SelectItem value="1st">1st Place</SelectItem>
                  <SelectItem value="2nd">2nd Place</SelectItem>
                  <SelectItem value="3rd">3rd Place</SelectItem>
                  <SelectItem value="Participant">Participant</SelectItem>
                  <SelectItem value="Winner">Winner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white"
            />

            <Textarea
              placeholder="Achievement Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 min-h-[100px]"
              rows={4}
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
                Add Achiever
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const StatsCards = () => {
    const totalAchievers = achievers.length;
    const firstPlaceCount = achievers.filter(a => a.position === '1st').length;
    const departmentStats = departments.map(dept => ({
      name: dept,
      count: achievers.filter(a => a.department === dept).length
    })).filter(stat => stat.count > 0).sort((a, b) => b.count - a.count);

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Achievers</p>
                <p className="text-xl font-semibold text-white">{totalAchievers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">First Places</p>
                <p className="text-xl font-semibold text-white">{firstPlaceCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Top Department</p>
                <p className="text-xl font-semibold text-white">
                  {departmentStats[0]?.name || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Categories</p>
                <p className="text-xl font-semibold text-white">
                  {new Set(achievers.map(a => a.category)).size}
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
          <p>Loading achievers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1d29] text-white">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">EventsHub</h1>
        <p className="text-sm text-gray-400">Student Achievements & Recognition</p>
        
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
              <h2 className="text-2xl font-bold text-blue-400">🏆 Hall of Fame</h2>
              <p className="text-gray-400 mt-1">Celebrating our students' outstanding achievements</p>
            </div>
            
            {currentUser?.isAdmin && (
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Achiever
              </Button>
            )}
          </div>

          <StatsCards />

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-[#1a202c] rounded-lg">
            <div className="flex items-center gap-2 flex-1 min-w-[300px]">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, achievement, or event..."
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

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-blue-600' : 'border-gray-600 text-gray-300'}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-blue-600' : 'border-gray-600 text-gray-300'}
              >
                List
              </Button>
            </div>
          </div>

          {/* Results */}
          {filteredAchievers.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No achievers found</p>
              <p className="text-gray-500 text-sm mt-2">
                {searchTerm || selectedDepartment !== 'all' || selectedCategory !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add the first achiever to get started'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-400">
                  Showing {filteredAchievers.length} of {achievers.length} achievers
                </p>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAchievers.map((achiever) => (
                    <AchieverCard key={achiever.id} achiever={achiever} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAchievers.map((achiever) => (
                    <AchieverListItem key={achiever.id} achiever={achiever} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AddAchieverModal />
    </div>
  );
}