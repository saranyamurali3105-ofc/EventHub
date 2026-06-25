import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowLeft, Users, Plus, Search, Filter, Calendar, MapPin, User, Edit3, Trash2, Star, Heart, UserPlus, Settings, Crown, Award, Activity } from "lucide-react";

interface Club {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  category: 'technical' | 'cultural' | 'sports' | 'academic' | 'social' | 'volunteer';
  logo: string;
  bannerImage: string;
  isActive: boolean;
  memberCount: number;
  maxMembers?: number;
  president: string;
  vicePresident: string;
  secretary: string;
  advisor: string;
  foundedDate: Date;
  meetingSchedule: string;
  contactEmail: string;
  socialLinks: {
    website?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
  achievements: string[];
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: string;
    location: string;
  }>;
  requirements: string[];
  benefits: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Member {
  id: string;
  clubId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'member' | 'coordinator' | 'president' | 'vice-president' | 'secretary';
  joinDate: Date;
  isActive: boolean;
}

interface ClubsPageProps {
  onBack: () => void;
  currentUser: any;
  isOfflineMode: boolean;
  addNotification: (notification: any) => void;
}

// Mock data for offline mode
const mockClubs: Club[] = [
  {
    id: '1',
    name: 'AI & Machine Learning Club',
    description: 'The AI & ML Club is dedicated to exploring the fascinating world of artificial intelligence and machine learning. We organize workshops, hackathons, and research projects to help members understand and implement cutting-edge AI technologies. Our club collaborates with industry experts and provides hands-on experience with popular ML frameworks like TensorFlow, PyTorch, and Scikit-learn.',
    shortDescription: 'Exploring AI/ML technologies through workshops, projects, and industry collaborations.',
    category: 'technical',
    logo: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100&h=100&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=200&fit=crop',
    isActive: true,
    memberCount: 45,
    maxMembers: 60,
    president: 'Rajesh Kumar',
    vicePresident: 'Priya Sharma',
    secretary: 'Arjun Reddy',
    advisor: 'Dr. Anita Singh',
    foundedDate: new Date('2023-08-15'),
    meetingSchedule: 'Every Friday 4:00 PM - 6:00 PM',
    contactEmail: 'aiml.club@college.edu',
    socialLinks: {
      website: 'https://aiml-club.college.edu',
      linkedin: 'https://linkedin.com/company/aiml-club',
      github: 'https://github.com/aiml-club'
    },
    achievements: [
      'Won 1st place in Inter-College AI Hackathon 2024',
      'Published 3 research papers in ML conferences',
      'Organized successful AI Workshop with 200+ participants'
    ],
    upcomingEvents: [
      {
        id: 'e1',
        title: 'Deep Learning Workshop',
        date: '2024-04-20',
        location: 'Computer Lab 2'
      },
      {
        id: 'e2',
        title: 'AI Ethics Seminar',
        date: '2024-04-25',
        location: 'Auditorium'
      }
    ],
    requirements: [
      'Basic programming knowledge (Python preferred)',
      'Interest in AI/ML technologies',
      'Commitment to attend regular meetings'
    ],
    benefits: [
      'Access to premium AI/ML tools and datasets',
      'Mentorship from industry experts',
      'Networking opportunities',
      'Certificate upon completion of projects'
    ],
    createdAt: new Date('2023-08-15'),
    updatedAt: new Date('2024-03-01')
  },
  {
    id: '2',
    name: 'Robotics Club',
    description: 'The Robotics Club brings together students passionate about robotics, automation, and mechatronics. We design, build, and program robots for various competitions and real-world applications. Members get hands-on experience with Arduino, Raspberry Pi, sensors, actuators, and 3D printing technologies.',
    shortDescription: 'Building and programming robots for competitions and real-world applications.',
    category: 'technical',
    logo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100&h=100&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=200&fit=crop',
    isActive: true,
    memberCount: 32,
    maxMembers: 40,
    president: 'Vikram Patel',
    vicePresident: 'Sneha Gupta',
    secretary: 'Ravi Kumar',
    advisor: 'Prof. Mechanical Engineering',
    foundedDate: new Date('2022-09-01'),
    meetingSchedule: 'Wednesday & Saturday 3:00 PM - 6:00 PM',
    contactEmail: 'robotics.club@college.edu',
    socialLinks: {
      website: 'https://robotics-club.college.edu',
      instagram: 'https://instagram.com/robotics_club_college',
      youtube: 'https://youtube.com/robotics-club'
    },
    achievements: [
      'National Robotics Competition Runners-up 2023',
      'Built autonomous drone for agriculture monitoring',
      'Collaborated with local industries for automation projects'
    ],
    upcomingEvents: [
      {
        id: 'e3',
        title: 'Robot Building Workshop',
        date: '2024-04-18',
        location: 'Robotics Lab'
      }
    ],
    requirements: [
      'Basic electronics knowledge',
      'Programming experience (C/C++, Python)',
      'Willingness to work with hardware'
    ],
    benefits: [
      'Access to robotics lab and equipment',
      'Industry project opportunities',
      'Competition participation funding',
      'Technical skill development'
    ],
    createdAt: new Date('2022-09-01'),
    updatedAt: new Date('2024-02-15')
  },
  {
    id: '3',
    name: 'Cultural Dance Society',
    description: 'The Cultural Dance Society celebrates the rich diversity of Indian and international dance forms. We organize performances, competitions, and cultural events that showcase various dance styles including classical, folk, contemporary, and fusion. Our society promotes cultural awareness and artistic expression.',
    shortDescription: 'Celebrating diverse dance forms through performances and cultural events.',
    category: 'cultural',
    logo: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=100&h=100&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600&h=200&fit=crop',
    isActive: true,
    memberCount: 28,
    president: 'Kavya Menon',
    vicePresident: 'Aditya Sharma',
    secretary: 'Rhea Nair',
    advisor: 'Dr. Fine Arts Department',
    foundedDate: new Date('2021-10-01'),
    meetingSchedule: 'Tuesday & Thursday 5:00 PM - 7:00 PM',
    contactEmail: 'dance.society@college.edu',
    socialLinks: {
      instagram: 'https://instagram.com/dance_society_college',
      youtube: 'https://youtube.com/dance-society'
    },
    achievements: [
      'Inter-College Cultural Fest Champions 2023',
      'Performed at State Cultural Festival',
      'Organized successful dance marathon for charity'
    ],
    upcomingEvents: [
      {
        id: 'e4',
        title: 'Spring Dance Festival',
        date: '2024-04-22',
        location: 'Main Auditorium'
      }
    ],
    requirements: [
      'Passion for dance and cultural arts',
      'Basic dance skills (any form)',
      'Regular practice commitment'
    ],
    benefits: [
      'Professional dance training',
      'Performance opportunities',
      'Cultural event participation',
      'Costume and makeup support'
    ],
    createdAt: new Date('2021-10-01'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '4',
    name: 'Environmental Action Club',
    description: 'The Environmental Action Club is committed to promoting environmental awareness and sustainability on campus and in the community. We organize tree planting drives, waste management campaigns, and educational workshops on climate change and conservation.',
    shortDescription: 'Promoting environmental sustainability through action and awareness.',
    category: 'volunteer',
    logo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100&h=100&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=200&fit=crop',
    isActive: true,
    memberCount: 38,
    president: 'Anisha Patil',
    vicePresident: 'Karthik Raja',
    secretary: 'Meera Singh',
    advisor: 'Dr. Environmental Science',
    foundedDate: new Date('2022-01-15'),
    meetingSchedule: 'Every Saturday 10:00 AM - 12:00 PM',
    contactEmail: 'env.action@college.edu',
    socialLinks: {
      website: 'https://env-action.college.edu',
      instagram: 'https://instagram.com/env_action_college'
    },
    achievements: [
      'Planted 500+ trees on campus',
      'Reduced campus plastic usage by 40%',
      'Organized successful Earth Day celebration'
    ],
    upcomingEvents: [
      {
        id: 'e5',
        title: 'Campus Clean-up Drive',
        date: '2024-04-15',
        location: 'College Campus'
      }
    ],
    requirements: [
      'Passion for environmental conservation',
      'Willingness to participate in outdoor activities',
      'Commitment to sustainable practices'
    ],
    benefits: [
      'Environmental leadership skills',
      'Community service certificates',
      'Networking with environmental organizations',
      'Field trip opportunities'
    ],
    createdAt: new Date('2022-01-15'),
    updatedAt: new Date('2024-02-10')
  }
];

export default function ClubsPage({ onBack, currentUser, isOfflineMode, addNotification }: ClubsPageProps) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Club['category']>('all');
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const categories = ['technical', 'cultural', 'sports', 'academic', 'social', 'volunteer'] as const;

  useEffect(() => {
    loadClubs();
  }, []);

  useEffect(() => {
    filterClubs();
  }, [clubs, searchTerm, categoryFilter]);

  const loadClubs = async () => {
    try {
      if (isOfflineMode) {
        setClubs(mockClubs);
        return;
      }

      // In a real app, this would be an API call
      setClubs(mockClubs);
      addNotification({ message: 'Loaded clubs in offline mode', type: 'info' });
    } catch (error) {
      console.error('Failed to load clubs:', error);
      setClubs(mockClubs);
    } finally {
      setLoading(false);
    }
  };

  const filterClubs = () => {
    let filtered = clubs.filter(club => club.isActive);

    if (searchTerm) {
      filtered = filtered.filter(club =>
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(club => club.category === categoryFilter);
    }

    // Sort by member count (most popular first)
    filtered.sort((a, b) => b.memberCount - a.memberCount);

    setFilteredClubs(filtered);
  };

  const handleJoinClub = async (clubId: string) => {
    if (!currentUser) {
      addNotification({ message: 'Please log in to join clubs', type: 'error' });
      return;
    }

    try {
      // Mock join functionality
      setClubs(prev => prev.map(club => 
        club.id === clubId ? { ...club, memberCount: club.memberCount + 1 } : club
      ));
      addNotification({ message: 'Successfully joined the club!', type: 'success' });
    } catch (error) {
      addNotification({ message: 'Failed to join club', type: 'error' });
    }
  };

  const handleCreateClub = async (clubData: Partial<Club>) => {
    const newClub: Club = {
      ...clubData,
      id: Math.random().toString(36).substr(2, 9),
      memberCount: 1,
      president: currentUser?.username || 'Unknown',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      achievements: [],
      upcomingEvents: [],
      requirements: [],
      benefits: [],
      socialLinks: {}
    } as Club;

    setClubs(prev => [newClub, ...prev]);
    addNotification({ message: 'Club created successfully!', type: 'success' });
    setIsCreateModalOpen(false);
  };

  const handleEditClub = async (id: string, updates: Partial<Club>) => {
    setClubs(prev => prev.map(club => 
      club.id === id ? { ...club, ...updates, updatedAt: new Date() } : club
    ));
    addNotification({ message: 'Club updated successfully!', type: 'success' });
    setEditingClub(null);
  };

  const handleDeleteClub = async (id: string) => {
    if (!confirm('Are you sure you want to delete this club?')) return;
    
    setClubs(prev => prev.filter(club => club.id !== id));
    addNotification({ message: 'Club deleted successfully', type: 'success' });
    setSelectedClub(null);
  };

  const getCategoryIcon = (category: Club['category']) => {
    switch (category) {
      case 'technical': return '💻';
      case 'cultural': return '🎭';
      case 'sports': return '⚽';
      case 'academic': return '📚';
      case 'social': return '👥';
      case 'volunteer': return '🤝';
      default: return '🏛️';
    }
  };

  const getCategoryColor = (category: Club['category']) => {
    switch (category) {
      case 'technical': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'cultural': return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
      case 'sports': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'academic': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'social': return 'bg-pink-600/20 text-pink-400 border-pink-600/30';
      case 'volunteer': return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const ClubCard = ({ club }: { club: Club }) => (
    <Card className="bg-[#252936] border-[#3a3d4a] hover:border-blue-600/50 transition-all duration-200 cursor-pointer group">
      <div className="relative">
        <img
          src={club.bannerImage}
          alt={club.name}
          className="w-full h-32 object-cover rounded-t-lg"
        />
        <div className="absolute top-2 right-2">
          <Badge className={getCategoryColor(club.category)}>
            <span className="mr-1">{getCategoryIcon(club.category)}</span>
            {club.category}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <img
            src={club.logo}
            alt={club.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-[#3a3d4a]"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
              {club.name}
            </h3>
            <p className="text-gray-400 text-sm">{club.shortDescription}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{club.memberCount} members</span>
            {club.maxMembers && <span>/ {club.maxMembers}</span>}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Founded {new Date(club.foundedDate).getFullYear()}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedClub(club);
            }}
            variant="outline"
            size="sm"
            className="flex-1 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
          >
            View Details
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleJoinClub(club.id);
            }}
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={club.maxMembers && club.memberCount >= club.maxMembers}
          >
            <UserPlus className="w-4 h-4 mr-1" />
            {club.maxMembers && club.memberCount >= club.maxMembers ? 'Full' : 'Join'}
          </Button>
        </div>
        
        {currentUser?.isAdmin && (
          <div className="flex gap-1 mt-2 pt-2 border-t border-[#3a3d4a]">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setEditingClub(club);
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
                handleDeleteClub(club.id);
              }}
              className="h-8 w-8 p-0 hover:bg-red-600/20 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const ClubDetailsModal = () => {
    if (!selectedClub) return null;

    return (
      <Dialog open={!!selectedClub} onOpenChange={() => setSelectedClub(null)}>
        <DialogContent className="bg-[#252936] border-[#3a3d4a] text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Club Header */}
            <div className="relative">
              <img
                src={selectedClub.bannerImage}
                alt={selectedClub.name}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg"></div>
              <div className="absolute bottom-4 left-4 flex items-end gap-4">
                <img
                  src={selectedClub.logo}
                  alt={selectedClub.name}
                  className="w-16 h-16 rounded-full border-4 border-white"
                />
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedClub.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getCategoryColor(selectedClub.category)}>
                      <span className="mr-1">{getCategoryIcon(selectedClub.category)}</span>
                      {selectedClub.category}
                    </Badge>
                    <Badge variant="secondary" className="bg-[#3a3d4a] text-gray-300">
                      {selectedClub.memberCount} Members
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-[#1a202c] rounded-lg p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="events" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Events
                </TabsTrigger>
                <TabsTrigger value="members" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Leadership
                </TabsTrigger>
                <TabsTrigger value="contact" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Contact
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">About</h3>
                  <p className="text-gray-300 leading-relaxed">{selectedClub.description}</p>
                </div>

                {selectedClub.achievements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">Achievements</h3>
                    <ul className="space-y-2">
                      {selectedClub.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <Award className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedClub.benefits.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">Member Benefits</h3>
                    <ul className="space-y-2">
                      {selectedClub.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <Star className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedClub.requirements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">Requirements</h3>
                    <ul className="space-y-2">
                      {selectedClub.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <span className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0">•</span>
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="events" className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-400">Upcoming Events</h3>
                {selectedClub.upcomingEvents.length === 0 ? (
                  <p className="text-gray-400">No upcoming events scheduled.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedClub.upcomingEvents.map((event) => (
                      <Card key={event.id} className="bg-[#1a202c] border-[#3a3d4a]">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-white mb-2">{event.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="members" className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-400">Club Leadership</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-[#1a202c] border-[#3a3d4a]">
                    <CardContent className="p-4 text-center">
                      <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <h4 className="font-semibold text-white">President</h4>
                      <p className="text-gray-300">{selectedClub.president}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#1a202c] border-[#3a3d4a]">
                    <CardContent className="p-4 text-center">
                      <User className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <h4 className="font-semibold text-white">Vice President</h4>
                      <p className="text-gray-300">{selectedClub.vicePresident}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#1a202c] border-[#3a3d4a]">
                    <CardContent className="p-4 text-center">
                      <Edit3 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <h4 className="font-semibold text-white">Secretary</h4>
                      <p className="text-gray-300">{selectedClub.secretary}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#1a202c] border-[#3a3d4a]">
                    <CardContent className="p-4 text-center">
                      <Settings className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <h4 className="font-semibold text-white">Faculty Advisor</h4>
                      <p className="text-gray-300">{selectedClub.advisor}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-400">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-300">
                    <User className="w-4 h-4 text-blue-400" />
                    <span>Email: {selectedClub.contactEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span>Meeting Schedule: {selectedClub.meetingSchedule}</span>
                  </div>
                  
                  {Object.keys(selectedClub.socialLinks).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-white mb-2">Social Links</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedClub.socialLinks.website && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(selectedClub.socialLinks.website, '_blank')}
                            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                          >
                            Website
                          </Button>
                        )}
                        {selectedClub.socialLinks.linkedin && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(selectedClub.socialLinks.linkedin, '_blank')}
                            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                          >
                            LinkedIn
                          </Button>
                        )}
                        {selectedClub.socialLinks.instagram && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(selectedClub.socialLinks.instagram, '_blank')}
                            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                          >
                            Instagram
                          </Button>
                        )}
                        {selectedClub.socialLinks.github && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(selectedClub.socialLinks.github, '_blank')}
                            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                          >
                            GitHub
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-3 pt-4 border-t border-[#3a3d4a]">
              <Button
                onClick={() => handleJoinClub(selectedClub.id)}
                className="bg-green-600 hover:bg-green-700 flex-1"
                disabled={selectedClub.maxMembers && selectedClub.memberCount >= selectedClub.maxMembers}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {selectedClub.maxMembers && selectedClub.memberCount >= selectedClub.maxMembers ? 'Club Full' : 'Join Club'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedClub(null)}
                className="border-gray-600 text-gray-300 hover:bg-gray-600"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const CreateClubModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      shortDescription: '',
      description: '',
      category: 'technical' as Club['category'],
      logo: '',
      bannerImage: '',
      maxMembers: '',
      meetingSchedule: '',
      contactEmail: '',
      foundedDate: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.name || !formData.description || !formData.contactEmail) {
        addNotification({ message: 'Please fill in all required fields', type: 'error' });
        return;
      }

      handleCreateClub({
        ...formData,
        maxMembers: formData.maxMembers ? parseInt(formData.maxMembers) : undefined,
        foundedDate: new Date(formData.foundedDate),
        logo: formData.logo || 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=100&h=100&fit=crop',
        bannerImage: formData.bannerImage || 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600&h=200&fit=crop'
      });
    };

    return (
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-[#252936] border-[#3a3d4a] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-400">Create New Club</DialogTitle>
            <DialogDescription className="text-gray-400">
              Start a new student organization and build your community
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Club Name *"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
              required
            />

            <Textarea
              placeholder="Short Description *"
              value={formData.shortDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 min-h-[60px]"
              rows={2}
              required
            />

            <Textarea
              placeholder="Full Description *"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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

              <Input
                type="number"
                placeholder="Max Members (Optional)"
                value={formData.maxMembers}
                onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: e.target.value }))}
                className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
              />
            </div>

            <Input
              placeholder="Meeting Schedule"
              value={formData.meetingSchedule}
              onChange={(e) => setFormData(prev => ({ ...prev, meetingSchedule: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
            />

            <Input
              type="email"
              placeholder="Contact Email *"
              value={formData.contactEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
              required
            />

            <Input
              type="date"
              placeholder="Founded Date"
              value={formData.foundedDate}
              onChange={(e) => setFormData(prev => ({ ...prev, foundedDate: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white"
            />

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
                Create Club
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const StatsCards = () => {
    const totalClubs = clubs.filter(c => c.isActive).length;
    const totalMembers = clubs.reduce((sum, club) => sum + club.memberCount, 0);
    const averageMembers = totalClubs > 0 ? Math.round(totalMembers / totalClubs) : 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Active Clubs</p>
                <p className="text-xl font-semibold text-white">{totalClubs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Members</p>
                <p className="text-xl font-semibold text-white">{totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Avg. Members</p>
                <p className="text-xl font-semibold text-white">{averageMembers}</p>
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
          <p>Loading clubs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1d29] text-white">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">EventsHub</h1>
        <p className="text-sm text-gray-400">Student Clubs & Organizations</p>
        
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
              <h2 className="text-2xl font-bold text-blue-400">🏛️ Student Clubs</h2>
              <p className="text-gray-400 mt-1">Discover and join student organizations that match your interests</p>
            </div>
            
            {currentUser?.isAdmin && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Club
              </Button>
            )}
          </div>

          <StatsCards />

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-[#1a202c] rounded-lg">
            <div className="flex items-center gap-2 flex-1 min-w-[300px]">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search clubs..."
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
          </div>

          {/* Clubs Grid */}
          {filteredClubs.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No clubs found</p>
              <p className="text-gray-500 text-sm mt-2">
                {searchTerm || categoryFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'New clubs will appear here'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-400">
                  Showing {filteredClubs.length} of {clubs.filter(c => c.isActive).length} clubs
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClubs.map((club) => (
                  <ClubCard key={club.id} club={club} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateClubModal />
      <ClubDetailsModal />
    </div>
  );
}