import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Settings, Shield, Award, Clock, Eye, Camera, Upload } from "lucide-react";
import { usersAPI } from '../services/api';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  registerNumber: string;
  department: string;
  year: string;
  phone: string;
  bio: string;
  interests: string[];
  skills: string[];
  profilePicture: string;
  socialLinks: {
    linkedin: string;
    github: string;
    twitter: string;
  };
  joinedDate: Date;
  lastActive: Date;
  isAdmin: boolean;
  achievements: number;
  eventsAttended: number;
  eventsOrganized: number;
}

interface ProfilePageProps {
  onBack: () => void;
  currentUser: any;
  isOfflineMode: boolean;
  addNotification: (notification: any) => void;
}

// Mock profile data for offline mode
const mockProfile: UserProfile = {
  id: '1',
  username: 'saranya',
  email: 'saranya@gmail.com',
  fullName: 'Saranya Krishnan',
  registerNumber: '20CSE042',
  department: 'CSE',
  year: '3rd Year',
  phone: '+91-9876543210',
  bio: 'Passionate computer science student interested in web development, AI/ML, and open source contributions. Love participating in hackathons and tech events.',
  interests: ['Web Development', 'Machine Learning', 'Open Source', 'UI/UX Design', 'Mobile Apps'],
  skills: ['React', 'Node.js', 'Python', 'JavaScript', 'MongoDB', 'Git', 'Docker'],
  profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b882?w=150&h=150&fit=crop&crop=face',
  socialLinks: {
    linkedin: 'https://linkedin.com/in/saranya-krishnan',
    github: 'https://github.com/saranya-dev',
    twitter: 'https://twitter.com/saranya_codes'
  },
  joinedDate: new Date('2023-08-15'),
  lastActive: new Date(),
  isAdmin: false,
  achievements: 8,
  eventsAttended: 25,
  eventsOrganized: 3
};

export default function ProfilePage({ onBack, currentUser, isOfflineMode, addNotification }: ProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const departments = ['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      if (isOfflineMode) {
        setProfile({
          ...mockProfile,
          id: currentUser?.id || '1',
          username: currentUser?.username || 'saranya',
          email: currentUser?.email || 'saranya@gmail.com',
          isAdmin: currentUser?.isAdmin || false
        });
        return;
      }

      const response = await usersAPI.getProfile();
      setProfile(response.profile);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setProfile({
        ...mockProfile,
        id: currentUser?.id || '1',
        username: currentUser?.username || 'saranya',
        email: currentUser?.email || 'saranya@gmail.com',
        isAdmin: currentUser?.isAdmin || false
      });
      addNotification({ message: 'Loaded profile in offline mode', type: 'info' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditForm({
      fullName: profile?.fullName || '',
      registerNumber: profile?.registerNumber || '',
      department: profile?.department || '',
      year: profile?.year || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      interests: profile?.interests || [],
      skills: profile?.skills || [],
      socialLinks: profile?.socialLinks || { linkedin: '', github: '', twitter: '' }
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const updatedProfile = {
        ...profile,
        ...editForm,
        interests: typeof editForm.interests === 'string' 
          ? (editForm.interests as string).split(',').map(s => s.trim()).filter(s => s)
          : editForm.interests,
        skills: typeof editForm.skills === 'string'
          ? (editForm.skills as string).split(',').map(s => s.trim()).filter(s => s)
          : editForm.skills
      };

      if (isOfflineMode) {
        setProfile(updatedProfile);
        addNotification({ message: 'Profile updated successfully (offline mode)!', type: 'success' });
      } else {
        const response = await usersAPI.updateProfile(editForm);
        setProfile(response.profile);
        addNotification({ message: 'Profile updated successfully!', type: 'success' });
      }
      
      setIsEditing(false);
    } catch (error) {
      addNotification({ message: 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const handleImageUpload = async (file: File) => {
    try {
      // Mock image upload for offline mode
      const imageUrl = URL.createObjectURL(file);
      if (profile) {
        setProfile({ ...profile, profilePicture: imageUrl });
        addNotification({ message: 'Profile picture updated!', type: 'success' });
      }
    } catch (error) {
      addNotification({ message: 'Failed to upload image', type: 'error' });
    }
  };

  const ProfilePicture = () => (
    <div className="relative">
      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#3a3d4a] mx-auto">
        {profile?.profilePicture ? (
          <img
            src={profile.profilePicture}
            alt={profile.fullName || profile.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-blue-600 flex items-center justify-center">
            <User className="w-16 h-16 text-white" />
          </div>
        )}
      </div>
      
      {isEditing && (
        <div className="absolute bottom-0 right-0">
          <label className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer transition-colors">
            <Camera className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
          </label>
        </div>
      )}
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) => (
    <Card className="bg-[#252936] border-[#3a3d4a]">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">{label}</p>
            <p className="text-xl font-semibold text-white">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-[#252936] border-[#3a3d4a]">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <ProfilePicture />
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {profile?.fullName || profile?.username}
                  </h2>
                  <p className="text-gray-400 mb-2">@{profile?.username}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{profile?.email}</span>
                    </div>
                    {profile?.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {profile?.isAdmin && (
                    <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30">
                      <Shield className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  <Button
                    onClick={isEditing ? handleSave : handleEdit}
                    disabled={saving}
                    className={isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                  >
                    {isEditing ? (
                      saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )
                    ) : (
                      <Edit3 className="w-4 h-4 mr-2" />
                    )}
                    {isEditing ? (saving ? 'Saving...' : 'Save') : 'Edit Profile'}
                  </Button>
                  {isEditing && (
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-600"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Register Number</p>
                  <p className="text-white">{profile?.registerNumber || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Department</p>
                  <p className="text-white">{profile?.department || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Year</p>
                  <p className="text-white">{profile?.year || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Joined</p>
                  <p className="text-white">
                    {profile?.joinedDate ? new Date(profile.joinedDate).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm mb-2">Bio</p>
                <p className="text-gray-300 leading-relaxed">
                  {profile?.bio || 'No bio available. Click edit to add your bio.'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={Award}
          label="Achievements"
          value={profile?.achievements || 0}
          color="bg-yellow-600"
        />
        <StatCard
          icon={Calendar}
          label="Events Attended"
          value={profile?.eventsAttended || 0}
          color="bg-green-600"
        />
        <StatCard
          icon={Settings}
          label="Events Organized"
          value={profile?.eventsOrganized || 0}
          color="bg-blue-600"
        />
      </div>

      {/* Skills & Interests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardHeader>
            <CardTitle className="text-blue-400">Skills</CardTitle>
          </CardHeader>
          <CardContent>
            {profile?.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-[#3a3d4a] text-gray-300">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No skills added yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardHeader>
            <CardTitle className="text-blue-400">Interests</CardTitle>
          </CardHeader>
          <CardContent>
            {profile?.interests && profile.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <Badge key={index} className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                    {interest}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No interests added yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const EditTab = () => (
    <div className="space-y-6">
      <Card className="bg-[#252936] border-[#3a3d4a]">
        <CardHeader>
          <CardTitle className="text-blue-400">Edit Profile Information</CardTitle>
          <CardDescription className="text-gray-400">
            Update your personal and academic information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <Input
                value={editForm.fullName || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Register Number</label>
              <Input
                value={editForm.registerNumber || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, registerNumber: e.target.value }))}
                className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
                placeholder="20CSE042"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
              <Select 
                value={editForm.department || ''} 
                onValueChange={(value) => setEditForm(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
              <Select 
                value={editForm.year || ''} 
                onValueChange={(value) => setEditForm(prev => ({ ...prev, year: value }))}
              >
                <SelectTrigger className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
            <Input
              value={editForm.phone || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
              placeholder="+91-9876543210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
            <Textarea
              value={editForm.bio || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 min-h-[100px]"
              placeholder="Tell us about yourself, your interests, and goals..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Skills (comma-separated)</label>
            <Input
              value={Array.isArray(editForm.skills) ? editForm.skills.join(', ') : editForm.skills || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, skills: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
              placeholder="React, Node.js, Python, JavaScript"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Interests (comma-separated)</label>
            <Input
              value={Array.isArray(editForm.interests) ? editForm.interests.join(', ') : editForm.interests || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, interests: e.target.value }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
              placeholder="Web Development, AI/ML, Open Source"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#252936] border-[#3a3d4a]">
        <CardHeader>
          <CardTitle className="text-blue-400">Social Links</CardTitle>
          <CardDescription className="text-gray-400">
            Add your social media profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn</label>
            <Input
              value={editForm.socialLinks?.linkedin || ''}
              onChange={(e) => setEditForm(prev => ({ 
                ...prev, 
                socialLinks: { ...prev.socialLinks, linkedin: e.target.value } 
              }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
              placeholder="https://linkedin.com/in/your-profile"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">GitHub</label>
            <Input
              value={editForm.socialLinks?.github || ''}
              onChange={(e) => setEditForm(prev => ({ 
                ...prev, 
                socialLinks: { ...prev.socialLinks, github: e.target.value } 
              }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
              placeholder="https://github.com/your-username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Twitter</label>
            <Input
              value={editForm.socialLinks?.twitter || ''}
              onChange={(e) => setEditForm(prev => ({ 
                ...prev, 
                socialLinks: { ...prev.socialLinks, twitter: e.target.value } 
              }))}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400"
              placeholder="https://twitter.com/your-handle"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1d29] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#1a1d29] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Profile not found</p>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1d29] text-white">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">EventsHub</h1>
        <p className="text-sm text-gray-400">User Profile</p>
        
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-[#1a202c] rounded-lg p-1">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <User className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="edit" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <OverviewTab />
            </TabsContent>
            
            <TabsContent value="edit" className="mt-6">
              <EditTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}