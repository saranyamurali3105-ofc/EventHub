import { useState } from 'react';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowLeft, CheckCircle, XCircle, Download, X } from "lucide-react";
import { Request, EventRegistration } from '../App';

interface AdminPageProps {
  requests: Request[];
  registrations: EventRegistration[];
  onNavigate: (page: any) => void;
  onUpdateStatus: (id: string, status: 'approved' | 'rejected', type: 'request' | 'registration') => void;
  isAuthenticated: boolean;
  onAuth: (isAuth: boolean) => void;
}

export default function AdminPage({ 
  requests, 
  registrations, 
  onNavigate, 
  onUpdateStatus, 
  isAuthenticated, 
  onAuth 
}: AdminPageProps) {
  const [adminCredentials, setAdminCredentials] = useState({ email: '', password: '' });

  const handleAdminLogin = () => {
    if (adminCredentials.email === 'admin.123.@gmail.com' && adminCredentials.password === 'admin@123') {
      onAuth(true);
    } else {
      alert('Invalid admin credentials');
    }
  };

  const handleApprove = (id: string, type: 'request' | 'registration') => {
    onUpdateStatus(id, 'approved', type);
    
    // Simulate sending notification and generating certificate/OD
    if (type === 'request') {
      const request = requests.find(r => r.id === id);
      if (request) {
        // Simulate PDF download
        const link = document.createElement('a');
        link.href = generatePDFDataURL(request.type, id);
        link.download = `${request.type.toLowerCase()}_${id}.pdf`;
        link.click();
      }
    }
  };

  const handleReject = (id: string, type: 'request' | 'registration') => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      onUpdateStatus(id, 'rejected', type);
    }
  };

  // Simulate PDF generation
  const generatePDFDataURL = (type: string, id: string) => {
    const content = type === 'OD' 
      ? `ON DUTY CERTIFICATE\n\nThis is to certify that the request has been approved.\nRequest ID: ${id}\nDate: ${new Date().toLocaleDateString()}`
      : `PARTICIPATION CERTIFICATE\n\nThis is to certify that the request has been approved.\nRequest ID: ${id}\nDate: ${new Date().toLocaleDateString()}`;
    
    return `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1a1d29] text-white flex items-center justify-center">
        <div className="bg-[#252936] rounded-lg p-8 w-96 border border-[#3a3d4a]">
          <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">Admin Login</h2>
          
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
              onClick={() => onNavigate('dashboard')}
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
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const pendingRegistrations = registrations.filter(r => r.status === 'pending');

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

      {/* Admin Panel */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-[#252936] rounded-xl p-8 border border-[#3a3d4a]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-blue-400">Admin Approval</h2>
            <button 
              onClick={() => { onAuth(false); onNavigate('dashboard'); }}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Pending Requests Section */}
          <div className="space-y-6">
            {/* OD and Certificate Requests */}
            {pendingRequests.map((request) => (
              <div key={request.id} className="bg-[#1a202c] rounded-lg p-6 border border-[#3a3d4a]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      rithu - {request.type} Request
                    </h3>
                    <p className="text-gray-400 text-sm">Event: {request.eventId}</p>
                    <p className="text-gray-400 text-sm">Reason: {request.reason || 'No reason provided'}</p>
                    <p className="text-gray-400 text-sm">
                      User ID: {request.userId}
                    </p>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="bg-yellow-600/20 text-yellow-400 border border-yellow-600/30"
                  >
                    Pending
                  </Badge>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApprove(request.id, 'request')}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReject(request.id, 'request')}
                    className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}

            {/* Event Registrations */}
            {pendingRegistrations.map((registration) => (
              <div key={registration.id} className="bg-[#1a202c] rounded-lg p-6 border border-[#3a3d4a]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      {registration.fullName} - Event Registration
                    </h3>
                    <p className="text-gray-400 text-sm">Event: {registration.eventId}</p>
                    <p className="text-gray-400 text-sm">Email: {registration.email}</p>
                    <p className="text-gray-400 text-sm">Department: {registration.department}</p>
                    <p className="text-gray-400 text-sm">Register Number: {registration.registerNumber}</p>
                    <p className="text-gray-400 text-sm">Reason: {registration.reasonForRegistration}</p>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="bg-yellow-600/20 text-yellow-400 border border-yellow-600/30"
                  >
                    Pending
                  </Badge>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApprove(registration.id, 'registration')}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReject(registration.id, 'registration')}
                    className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}

            {/* No Pending Items */}
            {pendingRequests.length === 0 && pendingRegistrations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No pending requests or registrations</p>
                <p className="text-gray-500 text-sm mt-2">All items have been processed</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}