import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ArrowLeft, Star } from "lucide-react";
import { Event } from '../App';

interface FeedbackPageProps {
  event: Event | null;
  onNavigate: (page: any) => void;
}

export default function FeedbackPage({ event, onNavigate }: FeedbackPageProps) {
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    rating: 0,
    eventRating: 0,
    organizationRating: 0,
    contentRating: 0,
    comments: '',
    suggestions: ''
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
    
    if (!feedback.name || !feedback.email || feedback.rating === 0) {
      alert('Please fill in all required fields');
      return;
    }

    // Here you would typically send the feedback to your backend
    console.log('Feedback submitted:', feedback);
    alert('Thank you for your feedback! Your response has been recorded.');
    onNavigate('eventDetails');
  };

  const StarRating = ({ rating, onRatingChange, label }: { rating: number; onRatingChange: (rating: number) => void; label: string }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`p-1 transition-colors ${
              star <= rating ? 'text-yellow-400' : 'text-gray-500'
            }`}
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
        ))}
      </div>
    </div>
  );

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

      {/* Feedback Form */}
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-[#252936] rounded-xl p-8 border border-[#3a3d4a]">
          <h2 className="text-2xl font-bold text-blue-400 mb-2 text-center">
            Event Feedback
          </h2>
          <p className="text-center text-gray-400 mb-6">
            Help us improve by sharing your experience with "{event.title}"
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="Your Name *"
                value={feedback.name}
                onChange={(e) => setFeedback(prev => ({ ...prev, name: e.target.value }))}
                className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3"
                required
              />
              <Input
                type="email"
                placeholder="Your Email *"
                value={feedback.email}
                onChange={(e) => setFeedback(prev => ({ ...prev, email: e.target.value }))}
                className="bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3"
                required
              />
            </div>

            {/* Overall Rating */}
            <StarRating
              rating={feedback.rating}
              onRatingChange={(rating) => setFeedback(prev => ({ ...prev, rating }))}
              label="Overall Event Rating *"
            />

            {/* Detailed Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StarRating
                rating={feedback.eventRating}
                onRatingChange={(rating) => setFeedback(prev => ({ ...prev, eventRating: rating }))}
                label="Event Content"
              />
              <StarRating
                rating={feedback.organizationRating}
                onRatingChange={(rating) => setFeedback(prev => ({ ...prev, organizationRating: rating }))}
                label="Organization"
              />
              <StarRating
                rating={feedback.contentRating}
                onRatingChange={(rating) => setFeedback(prev => ({ ...prev, contentRating: rating }))}
                label="Learning Value"
              />
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                What did you like most about this event?
              </label>
              <Textarea
                placeholder="Share your thoughts..."
                value={feedback.comments}
                onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
                className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3 min-h-[100px] resize-none"
                rows={4}
              />
            </div>

            {/* Suggestions */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Any suggestions for improvement?
              </label>
              <Textarea
                placeholder="How can we make future events better?"
                value={feedback.suggestions}
                onChange={(e) => setFeedback(prev => ({ ...prev, suggestions: e.target.value }))}
                className="w-full bg-[#3a3d4a] border-[#4a4d5a] text-white placeholder-gray-400 rounded-lg px-4 py-3 min-h-[100px] resize-none"
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
            >
              Submit Feedback
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}