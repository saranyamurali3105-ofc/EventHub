import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowLeft, Book, Plus, Search, Filter, Calendar, User, Edit3, Trash2, Download, ExternalLink, FileText, Video, Link, BookOpen, Users, Eye, Star, Clock, Tag } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'notes' | 'books' | 'videos' | 'tools' | 'tutorials' | 'datasets' | 'templates' | 'papers';
  subcategory: string;
  type: 'pdf' | 'video' | 'link' | 'document' | 'tool' | 'dataset';
  url: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  fileSize?: string;
  duration?: string;
  author: string;
  subject: string;
  department: string;
  semester?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  views: number;
  downloads: number;
  rating: number;
  totalRatings: number;
  isVerified: boolean;
  isFree: boolean;
  isActive: boolean;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ResourcesPageProps {
  onBack: () => void;
  currentUser: any;
  isOfflineMode: boolean;
  addNotification: (notification: any) => void;
}

// Mock data for offline mode
const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Data Structures and Algorithms - Complete Notes',
    description: 'Comprehensive notes covering all important data structures including arrays, linked lists, stacks, queues, trees, graphs, and algorithms. Includes time complexity analysis and practical implementations in C++ and Python.',
    category: 'notes',
    subcategory: 'Lecture Notes',
    type: 'pdf',
    url: 'https://example.com/dsa-notes.pdf',
    downloadUrl: 'https://example.com/download/dsa-notes.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
    fileSize: '5.2 MB',
    author: 'Dr. Rajesh Kumar',
    subject: 'Data Structures',
    department: 'CSE',
    semester: '3rd Semester',
    difficulty: 'intermediate',
    tags: ['algorithms', 'data-structures', 'programming', 'computer-science'],
    views: 2340,
    downloads: 856,
    rating: 4.8,
    totalRatings: 124,
    isVerified: true,
    isFree: true,
    isActive: true,
    uploadedBy: 'Dr. Rajesh Kumar',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15')
  },
  {
    id: '2',
    title: 'Machine Learning Fundamentals Video Course',
    description: 'Complete video series covering machine learning from basics to advanced topics. Includes supervised learning, unsupervised learning, neural networks, and practical implementations using Python and TensorFlow.',
    category: 'videos',
    subcategory: 'Course Material',
    type: 'video',
    url: 'https://youtube.com/playlist?list=ml-fundamentals',
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    duration: '12 hours',
    author: 'Prof. Priya Sharma',
    subject: 'Machine Learning',
    department: 'AIML',
    semester: '5th Semester',
    difficulty: 'advanced',
    tags: ['machine-learning', 'python', 'tensorflow', 'ai', 'neural-networks'],
    views: 5670,
    downloads: 0,
    rating: 4.9,
    totalRatings: 89,
    isVerified: true,
    isFree: true,
    isActive: true,
    uploadedBy: 'Prof. Priya Sharma',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '3',
    title: 'Circuit Analysis Solved Problems',
    description: 'Collection of solved problems in circuit analysis covering DC circuits, AC circuits, network theorems, and Laplace transforms. Perfect for exam preparation with step-by-step solutions.',
    category: 'notes',
    subcategory: 'Problem Sets',
    type: 'pdf',
    url: 'https://example.com/circuit-problems.pdf',
    downloadUrl: 'https://example.com/download/circuit-problems.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
    fileSize: '3.8 MB',
    author: 'Dr. Electrical Engineering',
    subject: 'Circuit Analysis',
    department: 'EEE',
    semester: '2nd Semester',
    difficulty: 'intermediate',
    tags: ['circuits', 'electrical', 'problems', 'analysis'],
    views: 1890,
    downloads: 623,
    rating: 4.6,
    totalRatings: 67,
    isVerified: true,
    isFree: true,
    isActive: true,
    uploadedBy: 'Dr. Electrical Engineering',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: '4',
    title: 'Python Programming Tools & IDE Setup',
    description: 'Complete guide to setting up Python development environment including VS Code, PyCharm, Jupyter notebooks, and essential libraries. Includes configuration tips and best practices.',
    category: 'tools',
    subcategory: 'Development Tools',
    type: 'link',
    url: 'https://python-setup-guide.dev',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop',
    author: 'Tech Community',
    subject: 'Programming',
    department: 'CSE',
    difficulty: 'beginner',
    tags: ['python', 'tools', 'ide', 'setup', 'development'],
    views: 3450,
    downloads: 0,
    rating: 4.7,
    totalRatings: 156,
    isVerified: true,
    isFree: true,
    isActive: true,
    uploadedBy: 'Admin',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '5',
    title: 'Database Design Tutorial Series',
    description: 'Step-by-step tutorials on database design principles, normalization, ER diagrams, SQL queries, and database optimization. Includes practical examples and exercises.',
    category: 'tutorials',
    subcategory: 'Interactive Tutorials',
    type: 'link',
    url: 'https://db-design-tutorials.edu',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=300&fit=crop',
    author: 'Database Team',
    subject: 'Database Management',
    department: 'IT',
    semester: '4th Semester',
    difficulty: 'intermediate',
    tags: ['database', 'sql', 'design', 'normalization', 'er-diagram'],
    views: 2780,
    downloads: 0,
    rating: 4.5,
    totalRatings: 92,
    isVerified: true,
    isFree: true,
    isActive: true,
    uploadedBy: 'Database Team',
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05')
  },
  {
    id: '6',
    title: 'Research Paper Template - IEEE Format',
    description: 'Professional IEEE format template for research papers with proper formatting, citation styles, and sections. Includes examples and writing guidelines for academic papers.',
    category: 'templates',
    subcategory: 'Academic Templates',
    type: 'document',
    url: 'https://example.com/ieee-template.docx',
    downloadUrl: 'https://example.com/download/ieee-template.docx',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    fileSize: '1.2 MB',
    author: 'Academic Writing Center',
    subject: 'Research Methodology',
    department: 'All Departments',
    difficulty: 'beginner',
    tags: ['template', 'ieee', 'research', 'paper', 'academic'],
    views: 4560,
    downloads: 1240,
    rating: 4.9,
    totalRatings: 203,
    isVerified: true,
    isFree: true,
    isActive: true,
    uploadedBy: 'Academic Center',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '7',
    title: 'AI/ML Datasets Collection',
    description: 'Curated collection of datasets for machine learning projects including image classification, natural language processing, and time series data. Perfect for academic projects.',
    category: 'datasets',
    subcategory: 'ML Datasets',
    type: 'dataset',
    url: 'https://ml-datasets.college.edu',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    fileSize: 'Various',
    author: 'AI/ML Department',
    subject: 'Machine Learning',
    department: 'AIML',
    difficulty: 'intermediate',
    tags: ['datasets', 'machine-learning', 'data-science', 'projects'],
    views: 1890,
    downloads: 345,
    rating: 4.8,
    totalRatings: 56,
    isVerified: true,
    isFree: true,
    isActive: true,
    uploadedBy: 'AI/ML Department',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10')
  },
  {
    id: '8',
    title: 'Digital Signal Processing Research Papers',
    description: 'Collection of latest research papers in digital signal processing, covering advanced algorithms, applications, and emerging trends. Updated monthly with new publications.',
    category: 'papers',
    subcategory: 'Research Papers',
    type: 'pdf',
    url: 'https://example.com/dsp-papers.pdf',
    downloadUrl: 'https://example.com/download/dsp-papers.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
    fileSize: '15.6 MB',
    author: 'Signal Processing Research Group',
    subject: 'Digital Signal Processing',
    department: 'ECE',
    semester: '6th Semester',
    difficulty: 'advanced',
    tags: ['signal-processing', 'research', 'algorithms', 'papers'],
    views: 1230,
    downloads: 234,
    rating: 4.7,
    totalRatings: 34,
    isVerified: true,
    isFree: true,
    isActive: true,
    uploadedBy: 'Research Group',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20')
  }
];

export default function ResourcesPage({ onBack, currentUser, isOfflineMode, addNotification }: ResourcesPageProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Resource['category']>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | Resource['difficulty']>('all');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const categories = ['notes', 'books', 'videos', 'tools', 'tutorials', 'datasets', 'templates', 'papers'] as const;
  const departments = ['All Departments', 'CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics'];
  const difficulties = ['beginner', 'intermediate', 'advanced'] as const;

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, categoryFilter, departmentFilter, difficultyFilter, activeTab]);

  const loadResources = async () => {
    try {
      if (isOfflineMode) {
        setResources(mockResources);
        return;
      }

      // In a real app, this would be an API call
      setResources(mockResources);
      addNotification({ message: 'Loaded resources in offline mode', type: 'info' });
    } catch (error) {
      console.error('Failed to load resources:', error);
      setResources(mockResources);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources.filter(resource => resource.isActive);

    if (activeTab !== 'all') {
      filtered = filtered.filter(resource => resource.category === activeTab);
    }

    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(resource => resource.category === categoryFilter);
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(resource => 
        resource.department === departmentFilter || resource.department === 'All Departments'
      );
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(resource => resource.difficulty === difficultyFilter);
    }

    // Sort by views and rating
    filtered.sort((a, b) => (b.views + b.rating * 100) - (a.views + a.rating * 100));

    setFilteredResources(filtered);
  };

  const handleCreateResource = async (resourceData: Partial<Resource>) => {
    if (!currentUser?.isAdmin) {
      addNotification({ message: 'Only admins can add resources', type: 'error' });
      return;
    }

    const newResource: Resource = {
      ...resourceData,
      id: Math.random().toString(36).substr(2, 9),
      uploadedBy: currentUser?.username || 'Unknown',
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      downloads: 0,
      rating: 0,
      totalRatings: 0,
      isVerified: true,
      isActive: true
    } as Resource;

    setResources(prev => [newResource, ...prev]);
    addNotification({ message: 'Resource added successfully!', type: 'success' });
    setIsCreateModalOpen(false);
  };

  const handleDeleteResource = async (id: string) => {
    if (!currentUser?.isAdmin) {
      addNotification({ message: 'Only admins can delete resources', type: 'error' });
      return;
    }

    if (!confirm('Are you sure you want to delete this resource?')) return;
    
    setResources(prev => prev.filter(resource => resource.id !== id));
    addNotification({ message: 'Resource deleted successfully', type: 'success' });
    setSelectedResource(null);
  };

  const handleViewResource = (resource: Resource) => {
    setSelectedResource(resource);
    setResources(prev => prev.map(r => 
      r.id === resource.id ? { ...r, views: r.views + 1 } : r
    ));
  };

  const handleDownloadResource = (resource: Resource) => {
    if (resource.downloadUrl) {
      window.open(resource.downloadUrl, '_blank');
      setResources(prev => prev.map(r => 
        r.id === resource.id ? { ...r, downloads: r.downloads + 1 } : r
      ));
      addNotification({ message: 'Download started!', type: 'success' });
    } else {
      window.open(resource.url, '_blank');
    }
  };

  const getCategoryIcon = (category: Resource['category']) => {
    switch (category) {
      case 'notes': return '📝';
      case 'books': return '📚';
      case 'videos': return '🎥';
      case 'tools': return '🛠️';
      case 'tutorials': return '🎯';
      case 'datasets': return '📊';
      case 'templates': return '📄';
      case 'papers': return '📋';
      default: return '📖';
    }
  };

  const getCategoryColor = (category: Resource['category']) => {
    switch (category) {
      case 'notes': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'books': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'videos': return 'bg-red-600/20 text-red-400 border-red-600/30';
      case 'tools': return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
      case 'tutorials': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'datasets': return 'bg-indigo-600/20 text-indigo-400 border-indigo-600/30';
      case 'templates': return 'bg-pink-600/20 text-pink-400 border-pink-600/30';
      case 'papers': return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const getDifficultyColor = (difficulty: Resource['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'intermediate': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'advanced': return 'bg-red-600/20 text-red-400 border-red-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const getTypeIcon = (type: Resource['type']) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'link': return <Link className="w-4 h-4" />;
      case 'document': return <BookOpen className="w-4 h-4" />;
      case 'tool': return <Star className="w-4 h-4" />;
      case 'dataset': return <Users className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const ResourceCard = ({ resource }: { resource: Resource }) => (
    <Card className="bg-[#252936] border-[#3a3d4a] hover:border-blue-600/50 transition-all duration-200 cursor-pointer group">
      <div className="relative">
        {resource.thumbnailUrl ? (
          <img
            src={resource.thumbnailUrl}
            alt={resource.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-t-lg flex items-center justify-center">
            <Book className="w-16 h-16 text-blue-400" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge className={getCategoryColor(resource.category)}>
            <span className="mr-1">{getCategoryIcon(resource.category)}</span>
            {resource.category}
          </Badge>
        </div>
        <div className="absolute top-2 left-2">
          <Badge className="bg-black/60 text-white border-0">
            {getTypeIcon(resource.type)}
            <span className="ml-1 capitalize">{resource.type}</span>
          </Badge>
        </div>
        {resource.isVerified && (
          <div className="absolute bottom-2 right-2">
            <Badge className="bg-green-600/80 text-white border-0">
              ✓ Verified
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors text-lg line-clamp-2">
            {resource.title}
          </h3>
        </div>
        
        <p className="text-gray-300 text-sm line-clamp-3 mb-4">
          {resource.description}
        </p>
        
        <div className="flex items-center gap-2 mb-4">
          <Badge className={getDifficultyColor(resource.difficulty)} variant="outline">
            {resource.difficulty}
          </Badge>
          <Badge variant="secondary" className="bg-[#3a3d4a] text-gray-300 text-xs">
            {resource.department}
          </Badge>
          {resource.isFree && (
            <Badge className="bg-green-600/20 text-green-400 border-green-600/30 text-xs">
              Free
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{resource.views}</span>
            </div>
            {resource.downloads > 0 && (
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                <span>{resource.downloads}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>{resource.rating.toFixed(1)} ({resource.totalRatings})</span>
            </div>
          </div>
          {(resource.fileSize || resource.duration) && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{resource.fileSize || resource.duration}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {resource.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
            >
              #{tag}
            </span>
          ))}
          {resource.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{resource.tags.length - 3}</span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleViewResource(resource);
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
              handleDownloadResource(resource);
            }}
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            {resource.type === 'link' ? 'Open' : 'Download'}
          </Button>
        </div>
        
        {currentUser?.isAdmin && (
          <div className="flex gap-1 mt-3 pt-3 border-t border-[#3a3d4a]">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteResource(resource.id);
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

  const ResourceDetailsModal = () => {
    if (!selectedResource) return null;

    return (
      <Dialog open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
        <DialogContent className="bg-[#252936] border-[#3a3d4a] text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-400 text-xl">{selectedResource.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              {selectedResource.thumbnailUrl ? (
                <img
                  src={selectedResource.thumbnailUrl}
                  alt={selectedResource.title}
                  className="w-32 h-32 rounded-lg object-cover border border-[#3a3d4a]"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                  <Book className="w-16 h-16 text-blue-400" />
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getCategoryColor(selectedResource.category)}>
                    <span className="mr-1">{getCategoryIcon(selectedResource.category)}</span>
                    {selectedResource.category}
                  </Badge>
                  <Badge className={getDifficultyColor(selectedResource.difficulty)}>
                    {selectedResource.difficulty}
                  </Badge>
                  {selectedResource.isVerified && (
                    <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                
                <p className="text-gray-300 leading-relaxed mb-4">{selectedResource.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Author</p>
                    <p className="text-white">{selectedResource.author}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Subject</p>
                    <p className="text-white">{selectedResource.subject}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Department</p>
                    <p className="text-white">{selectedResource.department}</p>
                  </div>
                  {selectedResource.semester && (
                    <div>
                      <p className="text-gray-400">Semester</p>
                      <p className="text-white">{selectedResource.semester}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-[#1a202c] border-[#3a3d4a]">
                <CardContent className="p-4 text-center">
                  <Eye className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-white">Views</h4>
                  <p className="text-2xl font-bold text-blue-400">{selectedResource.views}</p>
                </CardContent>
              </Card>
              
              {selectedResource.downloads > 0 && (
                <Card className="bg-[#1a202c] border-[#3a3d4a]">
                  <CardContent className="p-4 text-center">
                    <Download className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-white">Downloads</h4>
                    <p className="text-2xl font-bold text-green-400">{selectedResource.downloads}</p>
                  </CardContent>
                </Card>
              )}
              
              <Card className="bg-[#1a202c] border-[#3a3d4a]">
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-white">Rating</h4>
                  <p className="text-2xl font-bold text-yellow-400">
                    {selectedResource.rating.toFixed(1)}/5
                  </p>
                  <p className="text-xs text-gray-400">({selectedResource.totalRatings} ratings)</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {selectedResource.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-[#3a3d4a] text-gray-300">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => handleDownloadResource(selectedResource)}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                {selectedResource.type === 'link' ? 'Open Resource' : 'Download Resource'}
              </Button>
              {selectedResource.url !== selectedResource.downloadUrl && (
                <Button
                  onClick={() => window.open(selectedResource.url, '_blank')}
                  variant="outline"
                  className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Online
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const CreateResourceModal = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      category: 'notes' as Resource['category'],
      subcategory: '',
      type: 'pdf' as Resource['type'],
      url: '',
      downloadUrl: '',
      author: '',
      subject: '',
      department: '',
      semester: '',
      difficulty: 'beginner' as Resource['difficulty'],
      tags: '',
      fileSize: '',
      duration: '',
      isFree: true
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.title || !formData.description || !formData.url || !formData.subject) {
        addNotification({ message: 'Please fill in all required fields', type: 'error' });
        return;
      }

      handleCreateResource({
        ...formData,
        tags: formData.tags.split(',').map(s => s.trim()).filter(s => s)
      });
    };

    return (
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-[#252936] border-[#3a3d4a] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-400">Add New Resource</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a new educational resource to help students learn and grow
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Resource Title *"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
              required
            />

            <Textarea
              placeholder="Description *"
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
                      {getCategoryIcon(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="link">Web Link</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="tool">Tool</SelectItem>
                  <SelectItem value="dataset">Dataset</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input
              placeholder="Resource URL *"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
              required
            />

            <Input
              placeholder="Download URL (if different from resource URL)"
              value={formData.downloadUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, downloadUrl: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Author/Creator *"
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
                required
              />
              <Input
                placeholder="Subject *"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
                required
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

            <Input
              placeholder="Tags (comma-separated)"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFree"
                checked={formData.isFree}
                onChange={(e) => setFormData(prev => ({ ...prev, isFree: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="isFree" className="text-gray-300 text-sm">
                This is a free resource
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
                Add Resource
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const StatsCards = () => {
    const totalResources = resources.filter(r => r.isActive).length;
    const totalViews = resources.reduce((sum, resource) => sum + resource.views, 0);
    const totalDownloads = resources.reduce((sum, resource) => sum + resource.downloads, 0);
    const averageRating = resources.reduce((sum, resource) => sum + resource.rating, 0) / resources.length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Book className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Resources</p>
                <p className="text-xl font-semibold text-white">{totalResources}</p>
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
                <p className="text-xl font-semibold text-white">{totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Downloads</p>
                <p className="text-xl font-semibold text-white">{totalDownloads.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Avg Rating</p>
                <p className="text-xl font-semibold text-white">{averageRating.toFixed(1)}/5</p>
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
          <p>Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1d29] text-white">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">EventsHub</h1>
        <p className="text-sm text-gray-400">Educational Resources & Study Materials</p>
        
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
              <h2 className="text-2xl font-bold text-blue-400">📚 Learning Resources</h2>
              <p className="text-gray-400 mt-1">Comprehensive collection of study materials and educational content</p>
            </div>
            
            {currentUser?.isAdmin && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Resource
              </Button>
            )}
          </div>

          <StatsCards />

          {/* Category Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-[#1a202c] rounded-lg p-1">
                <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  All Resources
                </TabsTrigger>
                <TabsTrigger value="notes" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  📝 Notes
                </TabsTrigger>
                <TabsTrigger value="videos" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  🎥 Videos
                </TabsTrigger>
                <TabsTrigger value="books" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  📚 Books
                </TabsTrigger>
                <TabsTrigger value="tools" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  🛠️ Tools
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-[#1a202c] rounded-lg">
              <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search resources, subjects, or tags..."
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
                  {departments.slice(1).map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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

            {/* Resources Grid */}
            <TabsContent value={activeTab}>
              {filteredResources.length === 0 ? (
                <div className="text-center py-12">
                  <Book className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No resources found</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {searchTerm || departmentFilter !== 'all' || difficultyFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Add the first resource to get started'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400">
                      Showing {filteredResources.length} of {resources.filter(r => r.isActive).length} resources
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CreateResourceModal />
      <ResourceDetailsModal />
    </div>
  );
}