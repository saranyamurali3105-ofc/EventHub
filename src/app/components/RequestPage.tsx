import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft, FileText, Award } from "lucide-react";
import { Event, Request } from '../App';

interface RequestPageProps {
  event: Event | null;
  onNavigate: (page: any) => void;
  onAddRequest: (request: Omit<Request, 'id' | 'status' | 'createdAt'>) => void;
}

export default function RequestPage({ event, onNavigate, onAddRequest }: RequestPageProps) {
  const [activeTab, setActiveTab] = useState<'OD' | 'CERTIFICATE'>('OD');
  const [requestData, setRequestData] = useState({
    reason: '',
    additionalInfo: '',
    contactInfo: ''
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
    
    if (!requestData.reason) {
      alert('Please provide a reason for your request');
      return;
    }

    onAddRequest({
      eventId: event.id,
      userId: 'current-user-id', // This would come from your auth system
      type: activeTab,
      reason: requestData.reason
    });

    alert(`${activeTab} request submitted successfully! You will receive an update once it's reviewed.`);
    setRequestData({ reason: '', additionalInfo: '', contactInfo: '' });
    onNavigate('eventDetails');
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
          Back to Event Details
        </button>
      </div>

      {/* Request Form */}
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-[#252936] rounded-xl p-8 border border-[#3a3d4a]">
          <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">
            Request Documents
          </h2>
          
          {/* Tabs */}
          <div className="flex mb-6 bg-[#1a202c] rounded-lg p-1">
            <button
              onClick={() => setActiveTab('OD')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors ${
                activeTab === 'OD' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              On Duty (OD) Request
            </button>
            <button
              onClick={() => setActiveTab('CERTIFICATE')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors ${
                activeTab === 'CERTIFICATE' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              Certificate Request
            </button>
          </div>

          {/* Event Information */}
          <div className="bg-[#1a202c] rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-white mb-2">Event Information</h3>
            <div className="text-gray-300 space-y-1">
              <p><strong>Event:</strong> {event.title}</p>
              <p><strong>Date:</strong> {event.date}</p>
              <p><strong>Time:</strong> {event.time}</p>
              <p><strong>Location:</strong> {event.location}</p>
              <p><strong>Department:</strong> {event.department}</p>
            </div>
          </div>

          {/* Request Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Request Type Info */}
            <div className="bg-[#1a202c] rounded-lg p-4">
              {activeTab === 'OD' ? (
                <div>
                  <h4 className="font-semibold text-blue-400 mb-2">On Duty (OD) Request</h4>
                  <p className="text-gray-300 text-sm">
                    Request an official On Duty letter for attendance at this event. This document 
                    can be used to justify your absence from regular classes or work commitments.
                  </p>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold text-blue-400 mb-2">Certificate Request</h4>
                  <p className="text-gray-300 text-sm">
                    Request a participation certificate for attending this event. The certificate 
                    will be issued upon successful completion and attendance verification.
                  </p>
                </div>
              )}
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Reason for Request *
              </label>
              <Textarea
                placeholder={`Why do you need this ${activeTab === 'OD' ? 'OD letter' : 'certificate'}?`}
                value={requestData.reason}
                onChange={(e) => setRequestData(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3 min-h-[100px] resize-none"
                rows={4}
                required
              />
            </div>

            {/* Additional Information */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Additional Information (Optional)
              </label>
              <Textarea
                placeholder="Any additional details or special requirements..."
                value={requestData.additionalInfo}
                onChange={(e) => setRequestData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3 min-h-[80px] resize-none"
                rows={3}
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Preferred Contact Method (Optional)
              </label>
              <Input
                type="text"
                placeholder="Email or phone number for updates"
                value={requestData.contactInfo}
                onChange={(e) => setRequestData(prev => ({ ...prev, contactInfo: e.target.value }))}
                className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3"
              />
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
              <p className="text-yellow-200 text-sm">
                <strong>Note:</strong> Your request will be reviewed by the event organizers and administration. 
                Processing typically takes 2-3 business days. You will receive a notification once your request 
                is approved or if additional information is needed.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
            >
              Submit {activeTab === 'OD' ? 'OD' : 'Certificate'} Request
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}