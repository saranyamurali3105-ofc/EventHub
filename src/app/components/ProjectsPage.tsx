import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowLeft, Code, Plus, Search, Filter, Calendar, User, Eye, Edit3, Trash2, Star, GitBranch, ExternalLink, Github, Users, Award, Clock, Tag, Download, Heart, BookOpen } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: 'web' | 'mobile' | 'ai-ml' | 'blockchain' | 'iot' | 'data-science' | 'game-dev' | 'ar-vr';
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'archived';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  technologies: string[];
  teamMembers: Array<{
    id: string;
    name: string;
    role: string;
    department: string;
    avatar?: string;
  }>;
  mentor: string;
  startDate: Date;
  endDate?: Date;
  estimatedDuration: string;
  githubUrl?: string;
  demoUrl?: string;
  documentationUrl?: string;
  screenshots: string[];
  tags: string[];
  likes: number;
  views: number;
  forks: number;
  isOpenSource: boolean;
  isActive: boolean;
  department: string;
  semester: string;
  academicYear: string;
  features: string[];
  challenges: string[];
  learnings: string[];
  futureScope: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectsPageProps {
  onBack: () => void;
  currentUser: any;
  isOfflineMode: boolean;
  addNotification: (notification: any) => void;
}

// Mock data for offline mode
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Smart Campus Management System',
    description: 'A comprehensive web application for managing campus operations including student registration, attendance tracking, course management, and resource allocation. The system features role-based access control, real-time notifications, and advanced analytics dashboard for administrators.',
    shortDescription: 'Comprehensive web app for campus operations management',
    category: 'web',
    status: 'completed',
    difficulty: 'advanced',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Socket.io', 'JWT', 'Material-UI'],
    teamMembers: [
      { id: '1', name: 'Rajesh Kumar', role: 'Full-stack Developer', department: 'CSE', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face' },
      { id: '2', name: 'Priya Sharma', role: 'Frontend Developer', department: 'IT', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b882?w=50&h=50&fit=crop&crop=face' },
      { id: '3', name: 'Arjun Reddy', role: 'Backend Developer', department: 'CSE' }
    ],
    mentor: 'Dr. Anita Singh',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-03-20'),
    estimatedDuration: '2 months',
    githubUrl: 'https://github.com/college/campus-management',
    demoUrl: 'https://campus-demo.college.edu',
    documentationUrl: 'https://docs.campus-management.com',
    screenshots: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop'
    ],
    tags: ['Campus', 'Management', 'Full-stack', 'Real-time'],
    likes: 156,
    views: 2340,
    forks: 28,
    isOpenSource: true,
    isActive: true,
    department: 'CSE',
    semester: '6th Semester',
    academicYear: '2023-24',
    features: [
      'Role-based authentication and authorization',
      'Real-time notifications and messaging',
      'Advanced analytics and reporting',
      'Course and assignment management',
      'Attendance tracking with QR codes'
    ],
    challenges: [
      'Implementing real-time features with Socket.io',
      'Designing scalable database schema',
      'Managing complex role-based permissions'
    ],
    learnings: [
      'Full-stack development with MERN stack',
      'Real-time communication implementation',
      'Database design and optimization',
      'Authentication and security best practices'
    ],
    futureScope: [
      'Mobile app development',
      'AI-powered predictive analytics',
      'Integration with existing college systems',
      'Advanced reporting features'
    ],
    createdBy: 'Rajesh Kumar',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-20')
  },
  {
    id: '2',
    title: 'AI-Powered Study Assistant',
    description: 'An intelligent study companion that uses natural language processing and machine learning to help students with personalized learning recommendations, automated doubt solving, and progress tracking. Features include smart note-taking, quiz generation, and study plan optimization.',
    shortDescription: 'AI-powered personalized learning and study assistance platform',
    category: 'ai-ml',
    status: 'in-progress',
    difficulty: 'expert',
    technologies: ['Python', 'TensorFlow', 'Flask', 'React', 'PostgreSQL', 'OpenAI API', 'scikit-learn'],
    teamMembers: [
      { id: '4', name: 'Sneha Patel', role: 'AI/ML Engineer', department: 'AIML', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face' },
      { id: '5', name: 'Vikram Gupta', role: 'Data Scientist', department: 'AIML' },
      { id: '6', name: 'Kavya Menon', role: 'Frontend Developer', department: 'CSE' }
    ],
    mentor: 'Prof. Machine Learning',
    startDate: new Date('2024-02-01'),
    estimatedDuration: '4 months',
    githubUrl: 'https://github.com/aiml-team/study-assistant',
    screenshots: [
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=400&fit=crop'
    ],
    tags: ['AI', 'Machine Learning', 'NLP', 'Education'],
    likes: 89,
    views: 1560,
    forks: 15,
    isOpenSource: true,
    isActive: true,
    department: 'AIML',
    semester: '7th Semester',
    academicYear: '2023-24',
    features: [
      'Personalized learning recommendations',
      'Automated doubt solving with NLP',
      'Smart note-taking and organization',
      'AI-generated quizzes and tests',
      'Progress tracking and analytics'
    ],
    challenges: [
      'Training custom NLP models for domain-specific content',
      'Integrating multiple AI APIs effectively',
      'Handling large datasets for personalization'
    ],
    learnings: [
      'Advanced machine learning techniques',
      'Natural language processing',
      'Model deployment and optimization',
      'AI ethics and bias mitigation'
    ],
    futureScope: [
      'Integration with AR/VR for immersive learning',
      'Multi-language support',
      'Voice-based interaction',
      'Advanced analytics dashboard'
    ],
    createdBy: 'Sneha Patel',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-15')
  },
  {
    id: '3',
    title: 'Campus IoT Environmental Monitor',
    description: 'An IoT-based system for monitoring environmental parameters across the campus including air quality, temperature, humidity, and noise levels. The system uses sensor networks, real-time data processing, and provides alerts for environmental anomalies.',
    shortDescription: 'IoT system for campus environmental monitoring and analysis',
    category: 'iot',
    status: 'completed',
    difficulty: 'intermediate',
    technologies: ['Arduino', 'Raspberry Pi', 'Python', 'MQTT', 'InfluxDB', 'Grafana', 'React'],
    teamMembers: [
      { id: '7', name: 'Karthik Raja', role: 'IoT Developer', department: 'ECE', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face' },
      { id: '8', name: 'Meera Singh', role: 'Hardware Engineer', department: 'EEE' },
      { id: '9', name: 'Aditya Sharma', role: 'Data Engineer', department: 'CSE' }
    ],
    mentor: 'Dr. Electronics Department',
    startDate: new Date('2023-10-01'),
    endDate: new Date('2024-01-15'),
    estimatedDuration: '3.5 months',
    githubUrl: 'https://github.com/iot-team/campus-monitor',
    demoUrl: 'https://campus-iot.college.edu',
    screenshots: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop'
    ],
    tags: ['IoT', 'Sensors', 'Environment', 'Real-time'],
    likes: 67,
    views: 890,
    forks: 12,
    isOpenSource: true,
    isActive: true,
    department: 'ECE',
    semester: '6th Semester',
    academicYear: '2023-24',
    features: [
      'Multi-sensor data collection',
      'Real-time dashboard visualization',
      'Alert system for anomalies',
      'Historical data analysis',
      'Mobile app for monitoring'
    ],
    challenges: [
      'Sensor calibration and accuracy',
      'Power management for outdoor sensors',
      'Data transmission reliability'
    ],
    learnings: [
      'IoT system architecture design',
      'Sensor integration and calibration',
      'Real-time data processing',
      'Wireless communication protocols'
    ],
    futureScope: [
      'Machine learning for predictive analysis',
      'Integration with campus HVAC systems',
      'Expansion to more environmental parameters',
      'Mobile alerts and notifications'
    ],
    createdBy: 'Karthik Raja',
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '4',
    title: 'Blockchain-Based Certificate Verification',
    description: 'A decentralized system for issuing and verifying academic certificates using blockchain technology. The platform ensures tamper-proof certificate storage, instant verification, and eliminates the need for traditional paper-based verification processes.',
    shortDescription: 'Blockchain platform for secure certificate issuance and verification',
    category: 'blockchain',
    status: 'planning',
    difficulty: 'expert',
    technologies: ['Solidity', 'Ethereum', 'Web3.js', 'React', 'Node.js', 'IPFS', 'MetaMask'],
    teamMembers: [
      { id: '10', name: 'Rohit Kumar', role: 'Blockchain Developer', department: 'CSE' },
      { id: '11', name: 'Anisha Patil', role: 'Smart Contract Developer', department: 'IT' }
    ],
    mentor: 'Prof. Distributed Systems',
    startDate: new Date('2024-04-01'),
    estimatedDuration: '5 months',
    githubUrl: 'https://github.com/blockchain-team/cert-verify',
    screenshots: [
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=400&fit=crop'
    ],
    tags: ['Blockchain', 'Ethereum', 'Certificate', 'Verification'],
    likes: 23,
    views: 340,
    forks: 5,
    isOpenSource: true,
    isActive: true,
    department: 'CSE',
    semester: '8th Semester',
    academicYear: '2023-24',
    features: [
      'Smart contract-based certificate storage',
      'QR code-based instant verification',
      'Decentralized identity management',
      'Batch certificate issuance',
      'Integration with existing systems'
    ],
    challenges: [
      'Gas optimization for smart contracts',
      'User experience with blockchain technology',
      'Integration with existing certificate systems'
    ],
    learnings: [
      'Blockchain architecture and consensus mechanisms',
      'Smart contract development and security',
      'Decentralized application development',
      'Cryptocurrency and token economics'
    ],
    futureScope: [
      'Multi-institutional certificate exchange',
      'Advanced analytics and reporting',
      'Mobile wallet integration',
      'Cross-chain compatibility'
    ],
    createdBy: 'Rohit Kumar',
    createdAt: new Date('2024-03-25'),
    updatedAt: new Date('2024-03-25')
  }
];

export default function ProjectsPage({ onBack, currentUser, isOfflineMode, addNotification }: ProjectsPageProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Project['category']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Project['status']>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | Project['difficulty']>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const categories = ['web', 'mobile', 'ai-ml', 'blockchain', 'iot', 'data-science', 'game-dev', 'ar-vr'] as const;
  const statuses = ['planning', 'in-progress', 'completed', 'on-hold', 'archived'] as const;
  const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'] as const;

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, categoryFilter, statusFilter, difficultyFilter]);

  const loadProjects = async () => {
    try {
      if (isOfflineMode) {
        setProjects(mockProjects);
        return;
      }

      // In a real app, this would be an API call
      setProjects(mockProjects);
      addNotification({ message: 'Loaded projects in offline mode', type: 'info' });
    } catch (error) {
      console.error('Failed to load projects:', error);
      setProjects(mockProjects);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects.filter(project => project.isActive);

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase())) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(project => project.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(project => project.difficulty === difficultyFilter);
    }

    // Sort by likes and views
    filtered.sort((a, b) => (b.likes + b.views) - (a.likes + a.views));

    setFilteredProjects(filtered);
  };

  const handleCreateProject = async (projectData: Partial<Project>) => {
    if (!currentUser?.isAdmin) {
      addNotification({ message: 'Only admins can create projects', type: 'error' });
      return;
    }

    const newProject: Project = {
      ...projectData,
      id: Math.random().toString(36).substr(2, 9),
      createdBy: currentUser?.username || 'Unknown',
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      views: 0,
      forks: 0,
      isActive: true,
      teamMembers: [],
      features: [],
      challenges: [],
      learnings: [],
      futureScope: [],
      screenshots: []
    } as Project;

    setProjects(prev => [newProject, ...prev]);
    addNotification({ message: 'Project created successfully!', type: 'success' });
    setIsCreateModalOpen(false);
  };

  const handleEditProject = async (id: string, updates: Partial<Project>) => {
    if (!currentUser?.isAdmin) {
      addNotification({ message: 'Only admins can edit projects', type: 'error' });
      return;
    }

    setProjects(prev => prev.map(project => 
      project.id === id ? { ...project, ...updates, updatedAt: new Date() } : project
    ));
    addNotification({ message: 'Project updated successfully!', type: 'success' });
    setEditingProject(null);
  };

  const handleDeleteProject = async (id: string) => {
    if (!currentUser?.isAdmin) {
      addNotification({ message: 'Only admins can delete projects', type: 'error' });
      return;
    }

    if (!confirm('Are you sure you want to delete this project?')) return;
    
    setProjects(prev => prev.filter(project => project.id !== id));
    addNotification({ message: 'Project deleted successfully', type: 'success' });
    setSelectedProject(null);
  };

  const handleLikeProject = (projectId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId ? { ...project, likes: project.likes + 1 } : project
    ));
    addNotification({ message: 'Project liked!', type: 'success' });
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setProjects(prev => prev.map(p => 
      p.id === project.id ? { ...p, views: p.views + 1 } : p
    ));
  };

  const getCategoryIcon = (category: Project['category']) => {
    switch (category) {
      case 'web': return '🌐';
      case 'mobile': return '📱';
      case 'ai-ml': return '🤖';
      case 'blockchain': return '⛓️';
      case 'iot': return '🔗';
      case 'data-science': return '📊';
      case 'game-dev': return '🎮';
      case 'ar-vr': return '🥽';
      default: return '💻';
    }
  };

  const getCategoryColor = (category: Project['category']) => {
    switch (category) {
      case 'web': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'mobile': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'ai-ml': return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
      case 'blockchain': return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      case 'iot': return 'bg-red-600/20 text-red-400 border-red-600/30';
      case 'data-science': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'game-dev': return 'bg-pink-600/20 text-pink-400 border-pink-600/30';
      case 'ar-vr': return 'bg-indigo-600/20 text-indigo-400 border-indigo-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planning': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'in-progress': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'completed': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'on-hold': return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      case 'archived': return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const getDifficultyColor = (difficulty: Project['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'intermediate': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'advanced': return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      case 'expert': return 'bg-red-600/20 text-red-400 border-red-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card className="bg-[#252936] border-[#3a3d4a] hover:border-blue-600/50 transition-all duration-200 cursor-pointer group">
      <div className="relative">
        {project.screenshots.length > 0 ? (
          <img
            src={project.screenshots[0]}
            alt={project.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-t-lg flex items-center justify-center">
            <Code className="w-16 h-16 text-blue-400" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge className={getCategoryColor(project.category)}>
            <span className="mr-1">{getCategoryIcon(project.category)}</span>
            {project.category}
          </Badge>
        </div>
        <div className="absolute top-2 left-2">
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors text-lg line-clamp-2">
            {project.title}
          </h3>
        </div>
        
        <p className="text-gray-300 text-sm line-clamp-3 mb-4">
          {project.shortDescription}
        </p>
        
        <div className="flex items-center gap-2 mb-4">
          <Badge className={getDifficultyColor(project.difficulty)} variant="outline">
            {project.difficulty}
          </Badge>
          <Badge variant="secondary" className="bg-[#3a3d4a] text-gray-300 text-xs">
            {project.department}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {project.technologies.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 3 && (
            <span className="text-xs text-gray-500">+{project.technologies.length - 3}</span>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{project.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{project.likes}</span>
            </div>
            {project.isOpenSource && (
              <div className="flex items-center gap-1">
                <GitBranch className="w-4 h-4" />
                <span>{project.forks}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{project.teamMembers.length}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleViewProject(project);
            }}
            variant="outline"
            size="sm"
            className="flex-1 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleLikeProject(project.id);
            }}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-red-600/20 hover:text-red-400"
          >
            <Heart className="w-4 h-4" />
          </Button>
          {project.githubUrl && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                window.open(project.githubUrl, '_blank');
              }}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-gray-600/20 hover:text-gray-400"
            >
              <Github className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {currentUser?.isAdmin && (
          <div className="flex gap-1 mt-3 pt-3 border-t border-[#3a3d4a]">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setEditingProject(project);
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
                handleDeleteProject(project.id);
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

  const ProjectDetailsModal = () => {
    if (!selectedProject) return null;

    return (
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="bg-[#252936] border-[#3a3d4a] text-white max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Project Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-blue-400 mb-2">{selectedProject.title}</h2>
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <Badge className={getCategoryColor(selectedProject.category)}>
                    <span className="mr-1">{getCategoryIcon(selectedProject.category)}</span>
                    {selectedProject.category}
                  </Badge>
                  <Badge className={getStatusColor(selectedProject.status)}>
                    {selectedProject.status}
                  </Badge>
                  <Badge className={getDifficultyColor(selectedProject.difficulty)}>
                    {selectedProject.difficulty}
                  </Badge>
                  {selectedProject.isOpenSource && (
                    <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                      Open Source
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {selectedProject.githubUrl && (
                  <Button
                    onClick={() => window.open(selectedProject.githubUrl, '_blank')}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-600"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>
                )}
                {selectedProject.demoUrl && (
                  <Button
                    onClick={() => window.open(selectedProject.demoUrl, '_blank')}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Live Demo
                  </Button>
                )}
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 bg-[#1a202c] rounded-lg p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="team" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Team
                </TabsTrigger>
                <TabsTrigger value="technical" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Technical
                </TabsTrigger>
                <TabsTrigger value="progress" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Progress
                </TabsTrigger>
                <TabsTrigger value="resources" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Resources
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">About Project</h3>
                  <p className="text-gray-300 leading-relaxed">{selectedProject.description}</p>
                </div>

                {selectedProject.features.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">Key Features</h3>
                    <ul className="space-y-2">
                      {selectedProject.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <Star className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Project Timeline</h4>
                    <div className="space-y-1 text-sm text-gray-400">
                      <p>Started: {new Date(selectedProject.startDate).toLocaleDateString()}</p>
                      {selectedProject.endDate && (
                        <p>Completed: {new Date(selectedProject.endDate).toLocaleDateString()}</p>
                      )}
                      <p>Duration: {selectedProject.estimatedDuration}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Academic Info</h4>
                    <div className="space-y-1 text-sm text-gray-400">
                      <p>Department: {selectedProject.department}</p>
                      <p>Semester: {selectedProject.semester}</p>
                      <p>Academic Year: {selectedProject.academicYear}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="team" className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-400">Team Members</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProject.teamMembers.map((member) => (
                    <Card key={member.id} className="bg-[#1a202c] border-[#3a3d4a]">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-white">{member.name}</h4>
                            <p className="text-blue-400 text-sm">{member.role}</p>
                            <p className="text-gray-400 text-xs">{member.department}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold text-white mb-2">Mentor</h4>
                  <p className="text-gray-300">{selectedProject.mentor}</p>
                </div>
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">Technologies Used</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="bg-[#3a3d4a] text-gray-300">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedProject.challenges.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">Technical Challenges</h3>
                    <ul className="space-y-2">
                      {selectedProject.challenges.map((challenge, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <span className="w-4 h-4 text-red-400 mt-1 flex-shrink-0">⚠️</span>
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedProject.learnings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">Key Learnings</h3>
                    <ul className="space-y-2">
                      {selectedProject.learnings.map((learning, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <BookOpen className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                          {learning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="progress" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-[#1a202c] border-[#3a3d4a]">
                    <CardContent className="p-4 text-center">
                      <Eye className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <h4 className="font-semibold text-white">Views</h4>
                      <p className="text-2xl font-bold text-blue-400">{selectedProject.views}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#1a202c] border-[#3a3d4a]">
                    <CardContent className="p-4 text-center">
                      <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
                      <h4 className="font-semibold text-white">Likes</h4>
                      <p className="text-2xl font-bold text-red-400">{selectedProject.likes}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#1a202c] border-[#3a3d4a]">
                    <CardContent className="p-4 text-center">
                      <GitBranch className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <h4 className="font-semibold text-white">Forks</h4>
                      <p className="text-2xl font-bold text-green-400">{selectedProject.forks}</p>
                    </CardContent>
                  </Card>
                </div>

                {selectedProject.futureScope.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">Future Scope</h3>
                    <ul className="space-y-2">
                      {selectedProject.futureScope.map((scope, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <span className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0">🚀</span>
                          {scope}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="resources" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedProject.githubUrl && (
                    <Card className="bg-[#1a202c] border-[#3a3d4a]">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Github className="w-8 h-8 text-gray-400" />
                          <h4 className="font-semibold text-white">Source Code</h4>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">View the complete source code and contribute</p>
                        <Button
                          onClick={() => window.open(selectedProject.githubUrl, '_blank')}
                          size="sm"
                          className="w-full bg-gray-700 hover:bg-gray-600"
                        >
                          Open GitHub
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {selectedProject.demoUrl && (
                    <Card className="bg-[#1a202c] border-[#3a3d4a]">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <ExternalLink className="w-8 h-8 text-blue-400" />
                          <h4 className="font-semibold text-white">Live Demo</h4>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">Try out the live version of the project</p>
                        <Button
                          onClick={() => window.open(selectedProject.demoUrl, '_blank')}
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          Open Demo
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {selectedProject.documentationUrl && (
                    <Card className="bg-[#1a202c] border-[#3a3d4a]">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <BookOpen className="w-8 h-8 text-green-400" />
                          <h4 className="font-semibold text-white">Documentation</h4>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">Detailed project documentation and guides</p>
                        <Button
                          onClick={() => window.open(selectedProject.documentationUrl, '_blank')}
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          View Docs
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {selectedProject.screenshots.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">Screenshots</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedProject.screenshots.map((screenshot, index) => (
                        <img
                          key={index}
                          src={screenshot}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-[#3a3d4a]"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const CreateProjectModal = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      shortDescription: '',
      category: 'web' as Project['category'],
      status: 'planning' as Project['status'],
      difficulty: 'beginner' as Project['difficulty'],
      technologies: '',
      mentor: '',
      estimatedDuration: '',
      githubUrl: '',
      demoUrl: '',
      department: '',
      semester: '',
      academicYear: '',
      tags: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.title || !formData.description || !formData.shortDescription) {
        addNotification({ message: 'Please fill in all required fields', type: 'error' });
        return;
      }

      handleCreateProject({
        ...formData,
        technologies: formData.technologies.split(',').map(s => s.trim()).filter(s => s),
        tags: formData.tags.split(',').map(s => s.trim()).filter(s => s),
        startDate: new Date(),
        isOpenSource: true
      });
    };

    return (
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-[#252936] border-[#3a3d4a] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-400">Create New Project</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a new student project to showcase innovation and learning
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Project Title *"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
              required
            />

            <Input
              placeholder="Short Description *"
              value={formData.shortDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
              required
            />

            <Textarea
              placeholder="Detailed Description *"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 min-h-[100px]"
              rows={4}
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
                      {getCategoryIcon(cat)} {cat.replace('-', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={formData.difficulty} onValueChange={(value: any) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                <SelectTrigger className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                  {difficulties.map((diff) => (
                    <SelectItem key={diff} value={diff}>
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
              />
              <Input
                placeholder="Semester"
                value={formData.semester}
                onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
              />
            </div>

            <Input
              placeholder="Academic Year"
              value={formData.academicYear}
              onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
            />

            <Input
              placeholder="Technologies (comma-separated)"
              value={formData.technologies}
              onChange={(e) => setFormData(prev => ({ ...prev, technologies: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
            />

            <Input
              placeholder="Mentor Name"
              value={formData.mentor}
              onChange={(e) => setFormData(prev => ({ ...prev, mentor: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="GitHub URL"
                value={formData.githubUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
              />
              <Input
                placeholder="Demo URL"
                value={formData.demoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, demoUrl: e.target.value }))}
                className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
              />
            </div>

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
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Create Project
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const StatsCards = () => {
    const totalProjects = projects.filter(p => p.isActive).length;
    const completedProjects = projects.filter(p => p.status === 'completed' && p.isActive).length;
    const inProgressProjects = projects.filter(p => p.status === 'in-progress' && p.isActive).length;
    const totalViews = projects.reduce((sum, project) => sum + project.views, 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Projects</p>
                <p className="text-xl font-semibold text-white">{totalProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-xl font-semibold text-white">{completedProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">In Progress</p>
                <p className="text-xl font-semibold text-white">{inProgressProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Views</p>
                <p className="text-xl font-semibold text-white">{totalViews}</p>
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
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1d29] text-white">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">EventsHub</h1>
        <p className="text-sm text-gray-400">Student Project Showcase</p>
        
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
              <h2 className="text-2xl font-bold text-blue-400">💻 Student Projects</h2>
              <p className="text-gray-400 mt-1">Showcase of innovative student projects and developments</p>
            </div>
            
            {currentUser?.isAdmin && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Project
              </Button>
            )}
          </div>

          <StatsCards />

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-[#1a202c] rounded-lg">
            <div className="flex items-center gap-2 flex-1 min-w-[300px]">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search projects, technologies, or tags..."
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
                    {getCategoryIcon(cat)} {cat.replace('-', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-40 bg-[#3a3d4a] border-[#4a4d5a] text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace('-', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={difficultyFilter} onValueChange={(value: any) => setDifficultyFilter(value)}>
              <SelectTrigger className="w-40 bg-[#3a3d4a] border-[#4a4d5a] text-white">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                <SelectItem value="all">All Levels</SelectItem>
                {difficulties.map((diff) => (
                  <SelectItem key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No projects found</p>
              <p className="text-gray-500 text-sm mt-2">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || difficultyFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add the first project to get started'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-400">
                  Showing {filteredProjects.length} of {projects.filter(p => p.isActive).length} projects
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateProjectModal />
      <ProjectDetailsModal />
    </div>
  );
}