import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft } from "lucide-react";
import { Event, EventRegistration } from '../App';

interface EventRegistrationPageProps {
  event: Event | null;
  onNavigate: (page: any) => void;
  onRegister: (registration: Omit<EventRegistration, 'id' | 'status' | 'createdAt'>) => void;
}

const departments = ['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics'];
const slots = ['Morning (9:00 AM - 12:00 PM)', 'Afternoon (1:00 PM - 4:00 PM)', 'Evening (5:00 PM - 8:00 PM)'];

export default function EventRegistrationPage({ event, onNavigate, onRegister }: EventRegistrationPageProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    registerNumber: '',
    department: '',
    slot: '',
    mobileNumber: '',
    reasonForRegistration: '',
    priorExperience: ''
  });

  if (!event) {
    return (
      <div className="min-h-screen bg-[#1a1d29] text-white flex items-center justify-center">
        <p>Event not found</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.registerNumber || 
        !formData.department || !formData.slot || !formData.mobileNumber || 
        !formData.reasonForRegistration) {
      alert('Please fill in all required fields');
      return;
    }

    onRegister({
      eventId: event.id,
      ...formData
    });

    alert('Registration submitted successfully! You will receive a confirmation email shortly.');
    onNavigate('eventDetails');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[#1a1d29] text-white">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">EventsHub</h1>
        <p className="text-sm text-gray-400">Your User ID: 1678816113565366542</p>
        
        <button 
          onClick={() => onNavigate('eventDetails')}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#3a3d4a] hover:bg-[#4a4d5a] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </button>
      </div>

      {/* Registration Form */}
      <div className="max-w-xl mx-auto px-6">
        <div className="bg-[#252936] rounded-xl p-8 border border-[#3a3d4a]">
          <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">
            Registration
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <Input
              type="text"
              placeholder="Your Full Name"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3"
              required
            />

            {/* Email */}
            <Input
              type="email"
              placeholder="Your Gmail"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3"
              required
            />

            {/* Register Number */}
            <Input
              type="text"
              placeholder="Register Number"
              value={formData.registerNumber}
              onChange={(e) => handleChange('registerNumber', e.target.value)}
              className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3"
              required
            />

            {/* Department */}
            <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
              <SelectTrigger className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white rounded-lg px-4 py-3">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept} className="hover:bg-[#4a4d5a]">
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Slot */}
            <Select value={formData.slot} onValueChange={(value) => handleChange('slot', value)}>
              <SelectTrigger className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white rounded-lg px-4 py-3">
                <SelectValue placeholder="Slot" />
              </SelectTrigger>
              <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                {slots.map((slot) => (
                  <SelectItem key={slot} value={slot} className="hover:bg-[#4a4d5a]">
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Mobile Number */}
            <Input
              type="tel"
              placeholder="Mobile Number"
              value={formData.mobileNumber}
              onChange={(e) => handleChange('mobileNumber', e.target.value)}
              className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3"
              required
            />

            {/* Reason for Registration */}
            <Textarea
              placeholder="Reason for Registration"
              value={formData.reasonForRegistration}
              onChange={(e) => handleChange('reasonForRegistration', e.target.value)}
              className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3 min-h-[100px] resize-none"
              rows={4}
              required
            />

            {/* Prior Experience (Optional) */}
            <Textarea
              placeholder="Prior Experience (Optional)"
              value={formData.priorExperience}
              onChange={(e) => handleChange('priorExperience', e.target.value)}
              className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3 min-h-[100px] resize-none"
              rows={4}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium mt-6"
            >
              Submit Registration
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}