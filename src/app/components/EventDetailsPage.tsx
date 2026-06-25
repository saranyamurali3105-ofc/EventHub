import { useState } from 'react';
import { Button } from "./ui/button";
import { Calendar, Clock, MapPin, Mail, ArrowLeft } from "lucide-react";
import { Event } from '../App';

interface EventDetailsPageProps {
  event: Event | null;
  onNavigate: (page: any) => void;
  onAdminAuth: (isAuth: boolean) => void;
}

export default function EventDetailsPage({ event, onNavigate, onAdminAuth }: EventDetailsPageProps) {
  const [adminCredentials, setAdminCredentials] = useState({ email: '', password: '' });
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  if (!event) {
    return (
      <div className="min-h-screen bg-[#1a1d29] text-white flex items-center justify-center">
        <p>Event not found</p>
      </div>
    );
  }

  const handleAdminLogin = () => {
    if (adminCredentials.email === 'admin.123.@gmail.com' && adminCredentials.password === 'admin@123') {
      onAdminAuth(true);
      onNavigate('admin');
    } else {
      alert('Invalid admin credentials');
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1d29] text-white">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">EventsHub</h1>
        <p className="text-sm text-gray-400">Your User ID: 1678816113565366542</p>
        
        <button 
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#3a3d4a] hover:bg-[#4a4d5a] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </button>
      </div>

      {/* Event Details Card */}
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-[#252936] rounded-xl p-8 border border-[#3a3d4a]">
          {/* Event Title */}
          <h2 className="text-3xl font-bold text-blue-400 mb-6 text-center">
            {event.title}
          </h2>

          {/* Event Info */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-gray-300">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span>{event.date}</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-300">
              <Clock className="w-5 h-5 text-blue-400" />
              <span>{event.time}</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-300">
              <MapPin className="w-5 h-5 text-blue-400" />
              <span>{event.location}</span>
            </div>

            <div className="bg-[#1a202c] rounded-lg p-4">
              <p className="text-gray-300 text-center">{event.department}</p>
            </div>
            
            {event.contactInfo && (
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="w-5 h-5 text-blue-400" />
                <span>Contact: {event.contactInfo}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => onNavigate('eventRegistration')}
              className="bg-[#3a3d4a] hover:bg-[#4a4d5a] text-white rounded-lg py-6 flex flex-col items-center gap-2"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                👤
              </div>
              Register
            </Button>

            <Button
              onClick={() => onNavigate('feedback')}
              className="bg-[#3a3d4a] hover:bg-[#4a4d5a] text-white rounded-lg py-6 flex flex-col items-center gap-2"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                💬
              </div>
              Feedback
            </Button>

            <Button
              onClick={() => onNavigate('requests')}
              className="bg-[#3a3d4a] hover:bg-[#4a4d5a] text-white rounded-lg py-6 flex flex-col items-center gap-2"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                🏅
              </div>
              Certificate/OD
            </Button>

            <Button
              onClick={() => setShowAdminLogin(true)}
              className="bg-[#3a3d4a] hover:bg-[#4a4d5a] text-white rounded-lg py-6 flex flex-col items-center gap-2"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                📊
              </div>
              Admin View
            </Button>
          </div>
        </div>
      </div>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#252936] rounded-lg p-6 w-96 border border-[#3a3d4a]">
            <h3 className="text-xl font-semibold mb-4 text-center">Admin Authentication</h3>
            
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Admin Email"
                value={adminCredentials.email}
                onChange={(e) => setAdminCredentials(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 bg-[#3a3d4a] border border-[#4a4d5a] rounded-lg text-white placeholder-gray-400"
              />
              
              <input
                type="password"
                placeholder="Admin Password"
                value={adminCredentials.password}
                onChange={(e) => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 bg-[#3a3d4a] border border-[#4a4d5a] rounded-lg text-white placeholder-gray-400"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowAdminLogin(false)}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdminLogin}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}