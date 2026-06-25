import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowLeft, Briefcase, Plus, Search, Filter, Calendar, User, Edit3, Trash2, Star, TrendingUp, Users, Award, Target, Building, ExternalLink, MapPin, DollarSign, Clock, CheckCircle } from "lucide-react";

interface Placement {
  id: string;
  studentName: string;
  registerNumber: string;
  department: string;
  batch: string;
  companyName: string;
  companyLogo?: string;
  jobTitle: string;
  packageOffered: string;
  packageType: 'LPA' | 'CTC' | 'Stipend';
  jobLocation: string;
  placementDate: Date;
  offerType: 'full-time' | 'internship' | 'part-time' | 'freelance';
  companyType: 'product' | 'service' | 'startup' | 'mnc' | 'government';
  industry: 'technology' | 'finance' | 'healthcare' | 'education' | 'consulting' | 'manufacturing' | 'other';
  selectionProcess: string[];
  cgpa: number;
  skills: string[];
  experience?: string;
  isVerified: boolean;
  isActive: boolean;
  studentPhoto?: string;
  companyWebsite?: string;
  testimonial?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PlacementDrive {
  id: string;
  companyName: string;
  companyLogo?: string;
  jobTitle: string;
  description: string;
  eligibleDepartments: string[];
  cgpaCriteria: number;
  packageRange: string;
  jobLocation: string;
  applicationDeadline: Date;
  driveDate: Date;
  selectionProcess: string[];
  requirements: string[];
  benefits: string[];
  contactPerson: string;
  applicationLink?: string;
  isActive: boolean;
  applicationsCount: number;
  createdBy: string;
  createdAt: Date;
}

interface PlacementsPageProps {
  onBack: () => void;
  currentUser: any;
  isOfflineMode: boolean;
  addNotification: (notification: any) => void;
}

// Mock data for offline mode
const mockPlacements: Placement[] = [
  {
    id: '1',
    studentName: 'Rajesh Kumar',
    registerNumber: '20CSE001',
    department: 'CSE',
    batch: '2024',
    companyName: 'Google',
    companyLogo: 'https://images.unsplash.com/photo-1573804633927-cfb6c2c6f4c3?w=100&h=100&fit=crop',
    jobTitle: 'Software Engineer',
    packageOffered: '45',
    packageType: 'LPA',
    jobLocation: 'Bangalore',
    placementDate: new Date('2024-03-15'),
    offerType: 'full-time',
    companyType: 'mnc',
    industry: 'technology',
    selectionProcess: ['Online Test', 'Technical Interview', 'HR Interview'],
    cgpa: 9.2,
    skills: ['React', 'Node.js', 'Python', 'Data Structures', 'Algorithms'],
    isVerified: true,
    isActive: true,
    studentPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    companyWebsite: 'https://careers.google.com',
    testimonial: 'The preparation through college placement cell and technical workshops really helped me crack the interview process.',
    createdBy: 'Admin',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15')
  },
  {
    id: '2',
    studentName: 'Priya Sharma',
    registerNumber: '20AIML015',
    department: 'AIML',
    batch: '2024',
    companyName: 'Microsoft',
    companyLogo: 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?w=100&h=100&fit=crop',
    jobTitle: 'Data Scientist',
    packageOffered: '42',
    packageType: 'LPA',
    jobLocation: 'Hyderabad',
    placementDate: new Date('2024-03-10'),
    offerType: 'full-time',
    companyType: 'mnc',
    industry: 'technology',
    selectionProcess: ['Coding Round', 'Technical Interview', 'System Design', 'HR Round'],
    cgpa: 9.5,
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics'],
    isVerified: true,
    isActive: true,
    studentPhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b882?w=150&h=150&fit=crop&crop=face',
    companyWebsite: 'https://careers.microsoft.com',
    testimonial: 'The AI/ML projects during my studies really gave me an edge in the technical interviews.',
    createdBy: 'Admin',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10')
  },
  {
    id: '3',
    studentName: 'Arjun Reddy',
    registerNumber: '20ECE023',
    department: 'ECE',
    batch: '2024',
    companyName: 'Qualcomm',
    companyLogo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    jobTitle: 'Embedded Systems Engineer',
    packageOffered: '28',
    packageType: 'LPA',
    jobLocation: 'Chennai',
    placementDate: new Date('2024-02-28'),
    offerType: 'full-time',
    companyType: 'mnc',
    industry: 'technology',
    selectionProcess: ['Technical Test', 'Technical Interview', 'HR Interview'],
    cgpa: 8.8,
    skills: ['C/C++', 'Embedded C', 'ARM Architecture', 'RTOS', 'Hardware Design'],
    isVerified: true,
    isActive: true,
    studentPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    companyWebsite: 'https://www.qualcomm.com/company/careers',
    testimonial: 'The hands-on experience with embedded systems in our lab projects was crucial for my success.',
    createdBy: 'Admin',
    createdAt: new Date('2024-02-28'),
    updatedAt: new Date('2024-02-28')
  },
  {
    id: '4',
    studentName: 'Sneha Patel',
    registerNumber: '20IT008',
    department: 'IT',
    batch: '2024',
    companyName: 'TCS',
    companyLogo: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=100&h=100&fit=crop',
    jobTitle: 'System Engineer',
    packageOffered: '7.5',
    packageType: 'LPA',
    jobLocation: 'Mumbai',
    placementDate: new Date('2024-01-20'),
    offerType: 'full-time',
    companyType: 'service',
    industry: 'technology',
    selectionProcess: ['Online Test', 'Technical Interview', 'HR Interview'],
    cgpa: 8.2,
    skills: ['Java', 'Spring Boot', 'MySQL', 'Web Development', 'Agile'],
    isVerified: true,
    isActive: true,
    studentPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    companyWebsite: 'https://www.tcs.com/careers',
    testimonial: 'TCS provides excellent training opportunities and exposure to diverse technologies.',
    createdBy: 'Admin',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '5',
    studentName: 'Vikram Gupta',
    registerNumber: '20CSBS019',
    department: 'CSBS',
    batch: '2024',
    companyName: 'Goldman Sachs',
    companyLogo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    jobTitle: 'Technology Analyst',
    packageOffered: '55',
    packageType: 'LPA',
    jobLocation: 'Mumbai',
    placementDate: new Date('2024-03-05'),
    offerType: 'full-time',
    companyType: 'mnc',
    industry: 'finance',
    selectionProcess: ['Online Assessment', 'Technical Interview', 'Behavioral Interview', 'Final Round'],
    cgpa: 9.4,
    skills: ['Java', 'Python', 'Financial Markets', 'Data Analysis', 'Problem Solving'],
    isVerified: true,
    isActive: true,
    studentPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    companyWebsite: 'https://www.goldmansachs.com/careers',
    testimonial: 'The combination of business and technology skills from CSBS program was perfect for this role.',
    createdBy: 'Admin',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05')
  }
];

const mockPlacementDrives: PlacementDrive[] = [
  {
    id: '1',
    companyName: 'Amazon',
    companyLogo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=100&h=100&fit=crop',
    jobTitle: 'Software Development Engineer',
    description: 'Amazon is looking for talented software engineers to join our team. Work on large-scale distributed systems and innovative technologies.',
    eligibleDepartments: ['CSE', 'IT', 'AIML'],
    cgpaCriteria: 7.5,
    packageRange: '28-45 LPA',
    jobLocation: 'Bangalore, Chennai',
    applicationDeadline: new Date('2024-04-20'),
    driveDate: new Date('2024-04-25'),
    selectionProcess: ['Online Coding Test', 'Technical Interview 1', 'Technical Interview 2', 'Behavioral Interview'],
    requirements: [
      'Strong programming skills in Java/Python/C++',
      'Good understanding of data structures and algorithms',
      'Experience with system design concepts',
      'Excellent problem-solving abilities'
    ],
    benefits: [
      'Competitive salary and stock options',
      'Health and wellness benefits',
      'Learning and development opportunities',
      'Flexible work environment'
    ],
    contactPerson: 'placement.cell@college.edu',
    applicationLink: 'https://amazon.jobs/campus-hiring',
    isActive: true,
    applicationsCount: 45,
    createdBy: 'Placement Cell',
    createdAt: new Date('2024-04-01')
  },
  {
    id: '2',
    companyName: 'Flipkart',
    companyLogo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop',
    jobTitle: 'Product Manager',
    description: 'Join Flipkart as a Product Manager and drive product strategy for millions of users across India.',
    eligibleDepartments: ['CSBS', 'CSE', 'IT'],
    cgpaCriteria: 8.0,
    packageRange: '20-30 LPA',
    jobLocation: 'Bangalore',
    applicationDeadline: new Date('2024-04-15'),
    driveDate: new Date('2024-04-22'),
    selectionProcess: ['Case Study', 'Product Interview', 'Strategy Interview', 'HR Interview'],
    requirements: [
      'Strong analytical and problem-solving skills',
      'Understanding of product management principles',
      'Good communication and presentation skills',
      'Interest in e-commerce and technology'
    ],
    benefits: [
      'Attractive compensation package',
      'Employee stock options',
      'Professional development programs',
      'Work-life balance initiatives'
    ],
    contactPerson: 'placement.cell@college.edu',
    applicationLink: 'https://flipkart.com/careers',
    isActive: true,
    applicationsCount: 32,
    createdBy: 'Placement Cell',
    createdAt: new Date('2024-03-28')
  }
];

export default function PlacementsPage({ onBack, currentUser, isOfflineMode, addNotification }: PlacementsPageProps) {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [placementDrives, setPlacementDrives] = useState<PlacementDrive[]>([]);
  const [filteredPlacements, setFilteredPlacements] = useState<Placement[]>([]);
  const [filteredDrives, setFilteredDrives] = useState<PlacementDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('placements');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [companyTypeFilter, setCompanyTypeFilter] = useState<string>('all');
  const [selectedPlacement, setSelectedPlacement] = useState<Placement | null>(null);
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);
  const [isCreatePlacementModalOpen, setIsCreatePlacementModalOpen] = useState(false);
  const [isCreateDriveModalOpen, setIsCreateDriveModalOpen] = useState(false);

  const departments = ['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics'];
  const companyTypes = ['product', 'service', 'startup', 'mnc', 'government'];
  const industries = ['technology', 'finance', 'healthcare', 'education', 'consulting', 'manufacturing', 'other'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterData();
  }, [placements, placementDrives, searchTerm, departmentFilter, companyTypeFilter, activeTab]);

  const loadData = async () => {
    try {
      if (isOfflineMode) {
        setPlacements(mockPlacements);
        setPlacementDrives(mockPlacementDrives);
        return;
      }

      // In a real app, these would be API calls
      setPlacements(mockPlacements);
      setPlacementDrives(mockPlacementDrives);
      addNotification({ message: 'Loaded placement data in offline mode', type: 'info' });
    } catch (error) {
      console.error('Failed to load placement data:', error);
      setPlacements(mockPlacements);
      setPlacementDrives(mockPlacementDrives);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    // Filter placements
    let filteredP = placements.filter(p => p.isActive && p.isVerified);

    if (searchTerm) {
      filteredP = filteredP.filter(p =>
        p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter !== 'all') {
      filteredP = filteredP.filter(p => p.department === departmentFilter);
    }

    if (companyTypeFilter !== 'all') {
      filteredP = filteredP.filter(p => p.companyType === companyTypeFilter);
    }

    // Sort by package (highest first)
    filteredP.sort((a, b) => parseFloat(b.packageOffered) - parseFloat(a.packageOffered));
    setFilteredPlacements(filteredP);

    // Filter placement drives
    let filteredD = placementDrives.filter(d => d.isActive);

    if (searchTerm) {
      filteredD = filteredD.filter(d =>
        d.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter !== 'all') {
      filteredD = filteredD.filter(d => d.eligibleDepartments.includes(departmentFilter));
    }

    // Sort by application deadline
    filteredD.sort((a, b) => new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime());
    setFilteredDrives(filteredD);
  };

  const handleCreatePlacement = async (placementData: Partial<Placement>) => {
    if (!currentUser?.isAdmin) {
      addNotification({ message: 'Only admins can add placements', type: 'error' });
      return;
    }

    const newPlacement: Placement = {
      ...placementData,
      id: Math.random().toString(36).substr(2, 9),
      createdBy: currentUser?.username || 'Unknown',
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: true,
      isActive: true
    } as Placement;

    setPlacements(prev => [newPlacement, ...prev]);
    addNotification({ message: 'Placement record added successfully!', type: 'success' });
    setIsCreatePlacementModalOpen(false);
  };

  const handleCreateDrive = async (driveData: Partial<PlacementDrive>) => {
    if (!currentUser?.isAdmin) {
      addNotification({ message: 'Only admins can create placement drives', type: 'error' });
      return;
    }

    const newDrive: PlacementDrive = {
      ...driveData,
      id: Math.random().toString(36).substr(2, 9),
      createdBy: currentUser?.username || 'Unknown',
      createdAt: new Date(),
      isActive: true,
      applicationsCount: 0
    } as PlacementDrive;

    setPlacementDrives(prev => [newDrive, ...prev]);
    addNotification({ message: 'Placement drive created successfully!', type: 'success' });
    setIsCreateDriveModalOpen(false);
  };

  const handleDeletePlacement = async (id: string) => {
    if (!currentUser?.isAdmin) {
      addNotification({ message: 'Only admins can delete placements', type: 'error' });
      return;
    }

    if (!confirm('Are you sure you want to delete this placement record?')) return;
    
    setPlacements(prev => prev.filter(p => p.id !== id));
    addNotification({ message: 'Placement record deleted successfully', type: 'success' });
    setSelectedPlacement(null);
  };

  const getCompanyTypeColor = (type: string) => {
    switch (type) {
      case 'product': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'service': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'startup': return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
      case 'mnc': return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      case 'government': return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const getOfferTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'internship': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'part-time': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'freelance': return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const PlacementCard = ({ placement }: { placement: Placement }) => (
    <Card className="bg-[#252936] border-[#3a3d4a] hover:border-blue-600/50 transition-all duration-200 cursor-pointer group">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {placement.studentPhoto ? (
            <img
              src={placement.studentPhoto}
              alt={placement.studentName}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#3a3d4a]"
            />
          ) : (
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {placement.studentName}
                </h3>
                <p className="text-gray-400 text-sm">{placement.registerNumber} • {placement.department}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getOfferTypeColor(placement.offerType)}>
                  {placement.offerType}
                </Badge>
                {placement.isVerified && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-3">
              {placement.companyLogo ? (
                <img
                  src={placement.companyLogo}
                  alt={placement.companyName}
                  className="w-8 h-8 rounded object-cover"
                />
              ) : (
                <Building className="w-8 h-8 text-gray-400" />
              )}
              <div>
                <p className="font-semibold text-blue-400">{placement.companyName}</p>
                <p className="text-gray-300 text-sm">{placement.jobTitle}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>{placement.packageOffered} {placement.packageType}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{placement.jobLocation}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(placement.placementDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>CGPA: {placement.cgpa}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Badge className={getCompanyTypeColor(placement.companyType)} variant="outline">
                  {placement.companyType}
                </Badge>
                <Badge variant="secondary" className="bg-[#3a3d4a] text-gray-300 text-xs">
                  {placement.industry}
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlacement(placement);
                  }}
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                >
                  View Details
                </Button>
                {currentUser?.isAdmin && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlacement(placement.id);
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-red-600/20 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const DriveCard = ({ drive }: { drive: PlacementDrive }) => (
    <Card className="bg-[#252936] border-[#3a3d4a] hover:border-blue-600/50 transition-all duration-200 cursor-pointer group">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {drive.companyLogo ? (
            <img
              src={drive.companyLogo}
              alt={drive.companyName}
              className="w-16 h-16 rounded object-cover border-2 border-[#3a3d4a]"
            />
          ) : (
            <div className="w-16 h-16 bg-purple-600 rounded flex items-center justify-center">
              <Building className="w-8 h-8 text-white" />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors text-lg">
                  {drive.companyName}
                </h3>
                <p className="text-blue-400 font-medium">{drive.jobTitle}</p>
              </div>
              <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                Active
              </Badge>
            </div>
            
            <p className="text-gray-300 text-sm mb-4 line-clamp-2">{drive.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-4">
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>{drive.packageRange}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{drive.jobLocation}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Apply by: {new Date(drive.applicationDeadline).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>Min CGPA: {drive.cgpaCriteria}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {drive.eligibleDepartments.slice(0, 3).map((dept) => (
                <Badge key={dept} variant="secondary" className="bg-[#3a3d4a] text-gray-300 text-xs">
                  {dept}
                </Badge>
              ))}
              {drive.eligibleDepartments.length > 3 && (
                <Badge variant="secondary" className="bg-[#3a3d4a] text-gray-300 text-xs">
                  +{drive.eligibleDepartments.length - 3}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Users className="w-4 h-4" />
                <span>{drive.applicationsCount} applications</span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDrive(drive);
                  }}
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                >
                  View Details
                </Button>
                {drive.applicationLink && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(drive.applicationLink, '_blank');
                    }}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Apply Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PlacementDetailsModal = () => {
    if (!selectedPlacement) return null;

    return (
      <Dialog open={!!selectedPlacement} onOpenChange={() => setSelectedPlacement(null)}>
        <DialogContent className="bg-[#252936] border-[#3a3d4a] text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-400 text-xl">{selectedPlacement.studentName} - Placement Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              {selectedPlacement.studentPhoto ? (
                <img
                  src={selectedPlacement.studentPhoto}
                  alt={selectedPlacement.studentName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#3a3d4a]"
                />
              ) : (
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedPlacement.studentName}</h2>
                <div className="space-y-1 text-gray-300">
                  <p>Register Number: {selectedPlacement.registerNumber}</p>
                  <p>Department: {selectedPlacement.department}</p>
                  <p>Batch: {selectedPlacement.batch}</p>
                  <p>CGPA: {selectedPlacement.cgpa}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#1a202c] border-[#3a3d4a]">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Company Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Company:</strong> {selectedPlacement.companyName}</p>
                  <p><strong>Job Title:</strong> {selectedPlacement.jobTitle}</p>
                  <p><strong>Package:</strong> {selectedPlacement.packageOffered} {selectedPlacement.packageType}</p>
                  <p><strong>Location:</strong> {selectedPlacement.jobLocation}</p>
                  <p><strong>Offer Type:</strong> {selectedPlacement.offerType}</p>
                  <p><strong>Company Type:</strong> {selectedPlacement.companyType}</p>
                  <p><strong>Industry:</strong> {selectedPlacement.industry}</p>
                  {selectedPlacement.companyWebsite && (
                    <Button
                      onClick={() => window.open(selectedPlacement.companyWebsite, '_blank')}
                      variant="outline"
                      size="sm"
                      className="mt-2 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Company Website
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-[#1a202c] border-[#3a3d4a]">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Selection Process
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-1">
                    {selectedPlacement.selectionProcess.map((step, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#1a202c] border-[#3a3d4a]">
              <CardHeader>
                <CardTitle className="text-blue-400">Skills & Technologies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedPlacement.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-[#3a3d4a] text-gray-300">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedPlacement.testimonial && (
              <Card className="bg-[#1a202c] border-[#3a3d4a]">
                <CardHeader>
                  <CardTitle className="text-blue-400">Student Testimonial</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 italic">"{selectedPlacement.testimonial}"</p>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const DriveDetailsModal = () => {
    if (!selectedDrive) return null;

    return (
      <Dialog open={!!selectedDrive} onOpenChange={() => setSelectedDrive(null)}>
        <DialogContent className="bg-[#252936] border-[#3a3d4a] text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-400 text-xl">{selectedDrive.companyName} - Placement Drive</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              {selectedDrive.companyLogo ? (
                <img
                  src={selectedDrive.companyLogo}
                  alt={selectedDrive.companyName}
                  className="w-24 h-24 rounded object-cover border-4 border-[#3a3d4a]"
                />
              ) : (
                <div className="w-24 h-24 bg-purple-600 rounded flex items-center justify-center">
                  <Building className="w-12 h-12 text-white" />
                </div>
              )}
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedDrive.companyName}</h2>
                <p className="text-blue-400 text-lg mb-4">{selectedDrive.jobTitle}</p>
                <p className="text-gray-300 leading-relaxed">{selectedDrive.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#1a202c] border-[#3a3d4a]">
                <CardHeader>
                  <CardTitle className="text-blue-400">Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Package Range:</strong> {selectedDrive.packageRange}</p>
                  <p><strong>Location:</strong> {selectedDrive.jobLocation}</p>
                  <p><strong>Min CGPA:</strong> {selectedDrive.cgpaCriteria}</p>
                  <p><strong>Application Deadline:</strong> {new Date(selectedDrive.applicationDeadline).toLocaleDateString()}</p>
                  <p><strong>Drive Date:</strong> {new Date(selectedDrive.driveDate).toLocaleDateString()}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#1a202c] border-[#3a3d4a]">
                <CardHeader>
                  <CardTitle className="text-blue-400">Eligible Departments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedDrive.eligibleDepartments.map((dept) => (
                      <Badge key={dept} variant="secondary" className="bg-[#3a3d4a] text-gray-300">
                        {dept}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#1a202c] border-[#3a3d4a]">
              <CardHeader>
                <CardTitle className="text-blue-400">Selection Process</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {selectedDrive.selectionProcess.map((step, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#1a202c] border-[#3a3d4a]">
                <CardHeader>
                  <CardTitle className="text-blue-400">Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {selectedDrive.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-[#1a202c] border-[#3a3d4a]">
                <CardHeader>
                  <CardTitle className="text-blue-400">Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {selectedDrive.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-4">
              {selectedDrive.applicationLink && (
                <Button
                  onClick={() => window.open(selectedDrive.applicationLink, '_blank')}
                  className="bg-green-600 hover:bg-green-700 flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Apply Now
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setSelectedDrive(null)}
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

  const StatsCards = () => {
    const totalPlacements = placements.filter(p => p.isActive && p.isVerified).length;
    const averagePackage = placements.reduce((sum, p) => sum + parseFloat(p.packageOffered), 0) / placements.length;
    const topPlacement = Math.max(...placements.map(p => parseFloat(p.packageOffered)));
    const activeDrives = placementDrives.filter(d => d.isActive).length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Placements</p>
                <p className="text-xl font-semibold text-white">{totalPlacements}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Avg Package</p>
                <p className="text-xl font-semibold text-white">{averagePackage.toFixed(1)} LPA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Highest Package</p>
                <p className="text-xl font-semibold text-white">{topPlacement} LPA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Active Drives</p>
                <p className="text-xl font-semibold text-white">{activeDrives}</p>
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
          <p>Loading placement data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1d29] text-white">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">EventsHub</h1>
        <p className="text-sm text-gray-400">Placement & Career Opportunities</p>
        
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
              <h2 className="text-2xl font-bold text-blue-400">💼 Placements & Careers</h2>
              <p className="text-gray-400 mt-1">Student placement records and upcoming opportunities</p>
            </div>
            
            {currentUser?.isAdmin && (
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsCreatePlacementModalOpen(true)}
                  variant="outline"
                  className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Placement
                </Button>
                <Button
                  onClick={() => setIsCreateDriveModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Drive
                </Button>
              </div>
            )}
          </div>

          <StatsCards />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-[#1a202c] rounded-lg p-1 mb-6">
              <TabsTrigger 
                value="placements" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Placement Records ({filteredPlacements.length})
              </TabsTrigger>
              <TabsTrigger 
                value="drives" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Active Drives ({filteredDrives.length})
              </TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-[#1a202c] rounded-lg">
              <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder={activeTab === 'placements' ? "Search students, companies..." : "Search companies, roles..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 flex-1"
                />
              </div>
              
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
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

              {activeTab === 'placements' && (
                <Select value={companyTypeFilter} onValueChange={setCompanyTypeFilter}>
                  <SelectTrigger className="w-40 bg-[#3a3d4a] border-[#4a4d5a] text-white">
                    <SelectValue placeholder="Company Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                    <SelectItem value="all">All Types</SelectItem>
                    {companyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <TabsContent value="placements">
              {filteredPlacements.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No placement records found</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {searchTerm || departmentFilter !== 'all' || companyTypeFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Add the first placement record to get started'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPlacements.map((placement) => (
                    <PlacementCard key={placement.id} placement={placement} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="drives">
              {filteredDrives.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No placement drives found</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {searchTerm || departmentFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Create the first placement drive to get started'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDrives.map((drive) => (
                    <DriveCard key={drive.id} drive={drive} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <PlacementDetailsModal />
      <DriveDetailsModal />
    </div>
  );
}