import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Event } from '../App';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (event: Omit<Event, 'id' | 'createdAt'>) => void;
}

const departments = [
  'CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics'
];

export default function CreateEventModal({ isOpen, onClose, onCreateEvent }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    contactInfo: '',
    department: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.time || !formData.location || !formData.department) {
      alert('Please fill in all required fields');
      return;
    }

    onCreateEvent(formData);
    
    // Reset form
    setFormData({
      title: '',
      date: '',
      time: '',
      location: '',
      description: '',
      contactInfo: '',
      department: ''
    });
    
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#252936] border-[#3a3d4a] text-white max-w-lg mx-auto">
        <DialogHeader className="text-center pb-4">
          <div className="flex flex-col items-center gap-2">
            <div className="text-blue-400 mb-2">EventsHub</div>
            <DialogTitle className="text-blue-400 text-xl">Create New Event</DialogTitle>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Name */}
          <div>
            <Input
              type="text"
              placeholder="Event Name"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3"
              required
            />
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              placeholder="dd-mm-yyyy"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3"
              required
            />
            <Input
              type="time"
              placeholder="--:--"
              value={formData.time}
              onChange={(e) => handleChange('time', e.target.value)}
              className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3"
              required
            />
          </div>

          {/* Location */}
          <div>
            <Input
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3"
              required
            />
          </div>

          {/* Department */}
          <div>
            <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
              <SelectTrigger className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white rounded-lg px-4 py-3">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept} className="hover:bg-[#4a4d5a]">
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3 min-h-[80px] resize-none"
              rows={3}
            />
          </div>

          {/* Contact Info */}
          <div>
            <Input
              type="text"
              placeholder="Contact Info"
              value={formData.contactInfo}
              onChange={(e) => handleChange('contactInfo', e.target.value)}
              className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3"
            />
          </div>

          {/* Create Event Button */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              ⊕ Create Event
            </Button>
          </div>
        </form>

        {/* Your Events Section */}
        <div className="mt-8 pt-6 border-t border-[#3a3d4a]">
          <div className="bg-[#1a202c] rounded-lg p-6 text-center">
            <h3 className="text-blue-400 text-lg mb-4">Your Events</h3>
            <p className="text-gray-400">No events found. Create one above!</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}