import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { ArrowLeft, HelpCircle, Plus, Search, Filter, MessageCircle, Users, BookOpen, Settings, Lightbulb, ThumbsUp, ThumbsDown, Edit, Trash2 } from "lucide-react";
import { faqAPI } from '../services/api';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpfulVotes: number;
  notHelpfulVotes: number;
  createdBy: string;
  lastUpdated: string;
  isPublished: boolean;
  order: number;
  createdAt: Date;
}

interface FAQPageProps {
  onBack: () => void;
  currentUser: any;
  isOfflineMode: boolean;
  addNotification: (notification: any) => void;
}

// Mock data for offline mode
const mockFAQs: FAQItem[] = [
  {
    id: '1',
    question: 'How do I register for an event?',
    answer: 'To register for an event, navigate to the event details page and click the "Register" button. Fill out the registration form with your personal details, select your preferred time slot, and provide a reason for registration. Your registration will be reviewed and you\'ll receive a confirmation email once approved.',
    category: 'Registration',
    tags: ['registration', 'events', 'signup'],
    helpfulVotes: 45,
    notHelpfulVotes: 3,
    createdBy: 'Admin',
    lastUpdated: '2024-03-20',
    isPublished: true,
    order: 1,
    createdAt: new Date('2024-03-15')
  },
  {
    id: '2',
    question: 'Can I cancel my event registration?',
    answer: 'Yes, you can cancel your registration up to 24 hours before the event start time. Go to your profile page, find the event under "My Registrations," and click the cancel button. Please note that cancellations made less than 24 hours before the event may not be processed.',
    category: 'Registration',
    tags: ['cancellation', 'registration', 'policy'],
    helpfulVotes: 32,
    notHelpfulVotes: 1,
    createdBy: 'Admin',
    lastUpdated: '2024-03-18',
    isPublished: true,
    order: 2,
    createdAt: new Date('2024-03-16')
  },
  {
    id: '3',
    question: 'How do I request a certificate or OD letter?',
    answer: 'After attending an event, you can request certificates or OD letters from the event details page. Click on "Certificate/OD" button and select the type of document you need. Provide a valid reason for your request. Documents are typically processed within 2-3 business days.',
    category: 'Documents',
    tags: ['certificate', 'od-letter', 'documents'],
    helpfulVotes: 67,
    notHelpfulVotes: 2,
    createdBy: 'Admin',
    lastUpdated: '2024-03-22',
    isPublished: true,
    order: 3,
    createdAt: new Date('2024-03-17')
  },
  {
    id: '4',
    question: 'What should I do if I forgot my password?',
    answer: 'If you forgot your password, click on the "Forgot Password" link on the login page. Enter your registered email address and you\'ll receive a password reset link. Follow the instructions in the email to create a new password. If you don\'t receive the email, check your spam folder.',
    category: 'Account',
    tags: ['password', 'login', 'account'],
    helpfulVotes: 28,
    notHelpfulVotes: 1,
    createdBy: 'Admin',
    lastUpdated: '2024-03-19',
    isPublished: true,
    order: 4,
    createdAt: new Date('2024-03-18')
  },
  {
    id: '5',
    question: 'How can I change my department or personal information?',
    answer: 'To update your personal information, go to your profile page and click the "Edit Profile" button. You can modify your name, contact information, and other details. However, changes to critical information like register number or department may require admin approval.',
    category: 'Account',
    tags: ['profile', 'update', 'information'],
    helpfulVotes: 21,
    notHelpfulVotes: 0,
    createdBy: 'Admin',
    lastUpdated: '2024-03-21',
    isPublished: true,
    order: 5,
    createdAt: new Date('2024-03-19')
  },
  {
    id: '6',
    question: 'Are there any prerequisites for technical workshops?',
    answer: 'Prerequisites vary by workshop. Most introductory workshops require no prior experience, while advanced sessions may require basic knowledge. Check the event description for specific requirements. If you\'re unsure, contact the event organizers using the provided contact information.',
    category: 'Events',
    tags: ['workshops', 'prerequisites', 'technical'],
    helpfulVotes: 39,
    notHelpfulVotes: 4,
    createdBy: 'Admin',
    lastUpdated: '2024-03-23',
    isPublished: true,
    order: 6,
    createdAt: new Date('2024-03-20')
  },
  {
    id: '7',
    question: 'Can students from other departments join events?',
    answer: 'Yes! Most events are open to students from all departments unless specifically mentioned otherwise. We encourage inter-departmental participation as it promotes collaboration and knowledge sharing. Check the event details for any department-specific restrictions.',
    category: 'Events',
    tags: ['departments', 'eligibility', 'participation'],
    helpfulVotes: 56,
    notHelpfulVotes: 2,
    createdBy: 'Admin',
    lastUpdated: '2024-03-24',
    isPublished: true,
    order: 7,
    createdAt: new Date('2024-03-21')
  },
  {
    id: '8',
    question: 'How do I provide feedback for an event?',
    answer: 'After attending an event, you can provide feedback by going to the event details page and clicking the "Feedback" button. Your feedback helps us improve future events. You can rate different aspects of the event and provide written comments and suggestions.',
    category: 'Feedback',
    tags: ['feedback', 'rating', 'improvement'],
    helpfulVotes: 44,
    notHelpfulVotes: 1,
    createdBy: 'Admin',
    lastUpdated: '2024-03-25',
    isPublished: true,
    order: 8,
    createdAt: new Date('2024-03-22')
  },
  {
    id: '9',
    question: 'What happens if an event is cancelled?',
    answer: 'If an event is cancelled, all registered participants will be notified via email and platform notifications. If you\'ve already received an OD letter, you may need to inform your respective authorities about the cancellation. Refunds (if applicable) will be processed automatically.',
    category: 'Events',
    tags: ['cancellation', 'refund', 'notification'],
    helpfulVotes: 33,
    notHelpfulVotes: 0,
    createdBy: 'Admin',
    lastUpdated: '2024-03-26',
    isPublished: true,
    order: 9,
    createdAt: new Date('2024-03-23')
  },
  {
    id: '10',
    question: 'How can I become an event organizer?',
    answer: 'To become an event organizer, contact your department coordinator or the EventsHub administration team. You\'ll need to submit a proposal outlining your event idea, target audience, and required resources. Once approved, you\'ll be given organizer privileges for your event.',
    category: 'Organizers',
    tags: ['organizer', 'event-creation', 'permissions'],
    helpfulVotes: 38,
    notHelpfulVotes: 3,
    createdBy: 'Admin',
    lastUpdated: '2024-03-27',
    isPublished: true,
    order: 10,
    createdAt: new Date('2024-03-24')
  }
];

export default function FAQPage({ onBack, currentUser, isOfflineMode, addNotification }: FAQPageProps) {
  const [faqs, setFAQs] = useState<FAQItem[]>([]);
  const [filteredFAQs, setFilteredFAQs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const categories = ['Registration', 'Documents', 'Account', 'Events', 'Feedback', 'Organizers', 'Technical'];

  useEffect(() => {
    loadFAQs();
  }, []);

  useEffect(() => {
    filterFAQs();
  }, [faqs, searchTerm, selectedCategory]);

  const loadFAQs = async () => {
    try {
      if (isOfflineMode) {
        setFAQs(mockFAQs);
        return;
      }

      const response = await faqAPI.getAll();
      setFAQs(response.faqs || []);
    } catch (error) {
      console.error('Failed to load FAQs:', error);
      setFAQs(mockFAQs);
      addNotification({ message: 'Loaded FAQs in offline mode', type: 'info' });
    } finally {
      setLoading(false);
    }
  };

  const filterFAQs = () => {
    let filtered = faqs.filter(faq => faq.isPublished);

    if (searchTerm) {
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    // Sort by order and then by helpful votes
    filtered.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return b.helpfulVotes - a.helpfulVotes;
    });

    setFilteredFAQs(filtered);
  };

  const handleVote = async (faqId: string, type: 'helpful' | 'notHelpful') => {
    setFAQs(prev => prev.map(faq => 
      faq.id === faqId 
        ? { 
            ...faq, 
            helpfulVotes: type === 'helpful' ? faq.helpfulVotes + 1 : faq.helpfulVotes,
            notHelpfulVotes: type === 'notHelpful' ? faq.notHelpfulVotes + 1 : faq.notHelpfulVotes
          }
        : faq
    ));
    
    addNotification({ 
      message: `Thank you for your feedback!`, 
      type: 'success' 
    });
  };

  const handleDeleteFAQ = async (faqId: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    
    setFAQs(prev => prev.filter(faq => faq.id !== faqId));
    addNotification({ message: 'FAQ deleted successfully', type: 'success' });
  };

  const FAQCard = ({ faq }: { faq: FAQItem }) => (
    <Card className="bg-[#252936] border-[#3a3d4a] hover:border-blue-600/50 transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white text-lg leading-relaxed pr-4">
              {faq.question}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs">
                {faq.category}
              </Badge>
              <span className="text-gray-400 text-xs">
                Updated {new Date(faq.lastUpdated).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {currentUser?.isAdmin && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingFAQ(faq)}
                className="h-8 w-8 p-0 hover:bg-blue-600/20 hover:text-blue-400"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteFAQ(faq.id)}
                className="h-8 w-8 p-0 hover:bg-red-600/20 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
        
        {faq.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {faq.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t border-[#3a3d4a]">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Was this helpful?</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleVote(faq.id, 'helpful')}
                className="h-8 px-2 hover:bg-green-600/20 hover:text-green-400 flex items-center gap-1"
              >
                <ThumbsUp className="w-3 h-3" />
                <span>{faq.helpfulVotes}</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleVote(faq.id, 'notHelpful')}
                className="h-8 px-2 hover:bg-red-600/20 hover:text-red-400 flex items-center gap-1"
              >
                <ThumbsDown className="w-3 h-3" />
                <span>{faq.notHelpfulVotes}</span>
              </Button>
            </div>
          </div>
          
          <span className="text-xs text-gray-500">by {faq.createdBy}</span>
        </div>
      </CardContent>
    </Card>
  );

  const AddEditFAQModal = () => {
    const [formData, setFormData] = useState({
      question: '',
      answer: '',
      category: '',
      tags: '',
      isPublished: true
    });

    useEffect(() => {
      if (editingFAQ) {
        setFormData({
          question: editingFAQ.question,
          answer: editingFAQ.answer,
          category: editingFAQ.category,
          tags: editingFAQ.tags.join(', '),
          isPublished: editingFAQ.isPublished
        });
      } else {
        setFormData({
          question: '',
          answer: '',
          category: '',
          tags: '',
          isPublished: true
        });
      }
    }, [editingFAQ]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.question || !formData.answer || !formData.category) {
        addNotification({ message: 'Please fill in all required fields', type: 'error' });
        return;
      }

      try {
        const faqData = {
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        };

        if (editingFAQ) {
          // Update existing FAQ
          const updatedFAQ: FAQItem = {
            ...editingFAQ,
            ...faqData,
            lastUpdated: new Date().toISOString().split('T')[0]
          };
          
          setFAQs(prev => prev.map(faq => faq.id === editingFAQ.id ? updatedFAQ : faq));
          addNotification({ message: 'FAQ updated successfully!', type: 'success' });
        } else {
          // Create new FAQ
          const newFAQ: FAQItem = {
            ...faqData,
            id: Math.random().toString(36).substr(2, 9),
            helpfulVotes: 0,
            notHelpfulVotes: 0,
            createdBy: currentUser?.username || 'Unknown',
            lastUpdated: new Date().toISOString().split('T')[0],
            order: faqs.length + 1,
            createdAt: new Date()
          };

          if (isOfflineMode) {
            setFAQs(prev => [newFAQ, ...prev]);
            addNotification({ message: 'FAQ added successfully (offline mode)!', type: 'success' });
          } else {
            const response = await faqAPI.create(faqData);
            setFAQs(prev => [response.faq, ...prev]);
            addNotification({ message: 'FAQ added successfully!', type: 'success' });
          }
        }

        setIsAddModalOpen(false);
        setEditingFAQ(null);
      } catch (error) {
        addNotification({ message: 'Failed to save FAQ', type: 'error' });
      }
    };

    const isOpen = isAddModalOpen || !!editingFAQ;
    const onClose = () => {
      setIsAddModalOpen(false);
      setEditingFAQ(null);
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-[#252936] border-[#3a3d4a] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-blue-400">
              {editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingFAQ ? 'Update the FAQ information.' : 'Add a new frequently asked question to help users.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Question *"
              value={formData.question}
              onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
              required
            />

            <Textarea
              placeholder="Answer *"
              value={formData.answer}
              onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 min-h-[120px]"
              rows={5}
              required
            />

            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                <SelectValue placeholder="Category *" />
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

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="isPublished" className="text-gray-300 text-sm">
                Publish immediately
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {editingFAQ ? 'Update FAQ' : 'Add FAQ'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const CategoryQuickLinks = () => {
    const categoryStats = categories.map(cat => ({
      name: cat,
      count: faqs.filter(faq => faq.category === cat && faq.isPublished).length,
      icon: getCategoryIcon(cat)
    })).filter(stat => stat.count > 0);

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {categoryStats.map((category) => (
          <Button
            key={category.name}
            variant={selectedCategory === category.name ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category.name)}
            className={`h-16 flex flex-col items-center gap-1 ${
              selectedCategory === category.name 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'border-[#3a3d4a] text-gray-300 hover:bg-[#3a3d4a]'
            }`}
          >
            <span className="text-lg">{category.icon}</span>
            <span className="text-xs">{category.name}</span>
            <Badge variant="secondary" className="text-xs bg-[#3a3d4a] text-gray-300">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Registration': return '📝';
      case 'Documents': return '📄';
      case 'Account': return '👤';
      case 'Events': return '📅';
      case 'Feedback': return '💬';
      case 'Organizers': return '👥';
      case 'Technical': return '⚙️';
      default: return '❓';
    }
  };

  const StatsCards = () => {
    const totalFAQs = faqs.filter(faq => faq.isPublished).length;
    const totalHelpfulVotes = faqs.reduce((sum, faq) => sum + faq.helpfulVotes, 0);
    const mostHelpful = faqs.sort((a, b) => b.helpfulVotes - a.helpfulVotes)[0];
    const categoriesCount = new Set(faqs.filter(faq => faq.isPublished).map(faq => faq.category)).size;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total FAQs</p>
                <p className="text-xl font-semibold text-white">{totalFAQs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <ThumbsUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Helpful Votes</p>
                <p className="text-xl font-semibold text-white">{totalHelpfulVotes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Most Helpful</p>
                <p className="text-sm font-semibold text-white line-clamp-1">
                  {mostHelpful?.question.slice(0, 20) + '...' || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Categories</p>
                <p className="text-xl font-semibold text-white">{categoriesCount}</p>
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
          <p>Loading FAQs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1d29] text-white">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">EventsHub</h1>
        <p className="text-sm text-gray-400">Frequently Asked Questions</p>
        
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#3a3d4a] hover:bg-[#4a4d5a] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-[#252936] rounded-xl p-8 border border-[#3a3d4a]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-blue-400">❓ Frequently Asked Questions</h2>
              <p className="text-gray-400 mt-1">Find answers to common questions about EventsHub</p>
            </div>
            
            {currentUser?.isAdmin && (
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add FAQ
              </Button>
            )}
          </div>

          <StatsCards />

          {/* Quick Category Filter */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Browse by Category</h3>
            <div className="flex gap-2 mb-4">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className={selectedCategory === 'all' ? 'bg-blue-600' : 'border-[#3a3d4a] text-gray-300'}
              >
                All Categories
              </Button>
            </div>
            <CategoryQuickLinks />
          </div>

          {/* Search */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-[#1a202c] rounded-lg">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search FAQs, answers, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 flex-1"
              />
            </div>
          </div>

          {/* Results */}
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No FAQs found</p>
              <p className="text-gray-500 text-sm mt-2">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search or category filter'
                  : 'Add the first FAQ to get started'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-400">
                  Showing {filteredFAQs.length} of {faqs.filter(faq => faq.isPublished).length} FAQs
                  {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                </p>
              </div>

              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <FAQCard key={faq.id} faq={faq} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <AddEditFAQModal />
    </div>
  );
}