import { useState } from 'react';
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Badge } from "./ui/badge";
import { Bell, User, Clock, MapPin, User as ContactIcon } from "lucide-react";
import CreateEventModal from "./CreateEventModal";
import EventsListView from "./EventsListView";
import { Event } from '../App';

interface DashboardProps {
  onNavigate: (page: any) => void;
  events: Event[];
  onAddEvent: (event: Omit<Event, 'id' | 'createdAt'>) => void;
  onEventClick: (event: Event) => void;
}

export default function Dashboard({ onNavigate, events, onAddEvent, onEventClick }: DashboardProps) {
  const [currentDepartment, setCurrentDepartment] = useState('Explore');
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);

  const departments = ['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics'];
  
  const sidebarItems = [
    { name: 'Explore', active: currentDepartment === 'Explore' },
    ...departments.map(dept => ({ 
      name: dept, 
      active: currentDepartment === dept,
      eventCount: events.filter(event => event.department === dept).length
    })),
  ];

  const getCurrentDepartmentEvents = () => {
    if (currentDepartment === 'Explore') {
      return events;
    }
    return events.filter(event => event.department === currentDepartment);
  };

  const quickLinks = [
    { title: 'Achievers', icon: '🏆' },
    { title: 'Videos', icon: '📹' },
    { title: 'FAQ', icon: '❓' },
    { title: 'Admin', icon: '⚙️' },
  ];

  const popularTags = ['#Professor', '#Sports', '#Workshop', '#Cultural', '#Hackathon', '#Seminar'];

  // Calendar data for April 2025
  const calendarDays = [
    [null, null, 1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10, 11, 12],
    [13, 14, 15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24, 25, 26],
    [27, 28, 29, 30, null, null, null],
  ];

  return (
    <div className="min-h-screen bg-[#1a1d29] text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#252936] border-r border-[#3a3d4a] flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-[#3a3d4a]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">E</span>
            </div>
            <div>
              <h1 className="font-semibold">EventsHub</h1>
              <p className="text-xs text-gray-400">College Event Hub</p>
            </div>
            <button className="ml-auto text-gray-400 hover:text-white">
              ✕
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => setCurrentDepartment(item.name)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                    item.active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-[#3a3d4a] hover:text-white'
                  }`}
                >
                  <span>{item.name}</span>
                  {'eventCount' in item && item.eventCount > 0 && (
                    <Badge variant="secondary" className="bg-blue-500 text-white text-xs px-2 py-1">
                      {item.eventCount}
                    </Badge>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#3a3d4a]">
          <button
            onClick={() => onNavigate('login')}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Content Area */}
        <div className="flex-1 p-6 space-y-6">
          {currentDepartment === 'Explore' ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Hello, User! 👋</h2>
                  <p className="text-gray-400 mt-1">Welcome to your EventsHub dashboard.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-2 rounded-lg bg-[#3a3d4a] hover:bg-[#4a4d5a] transition-colors">
                    <Bell className="w-5 h-5" />
                  </button>
                  <Button 
                    onClick={() => setIsCreateEventModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    + Create Event
                  </Button>
                  <button className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Recent Events */}
              <div className="bg-[#252936] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recent Events</h3>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">View All</button>
                </div>
                {events.length === 0 ? (
                  <p className="text-gray-400">No events found across all departments.</p>
                ) : (
                  <div className="space-y-4">
                    {events.slice(0, 3).map((event) => (
                      <EventCard key={event.id} event={event} onEventClick={onEventClick} />
                    ))}
                    {events.length > 3 && (
                      <p className="text-blue-400 text-sm">
                        +{events.length - 3} more events
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <div className="grid grid-cols-4 gap-4">
                  {quickLinks.map((link, index) => (
                    <div
                      key={index}
                      className="bg-[#252936] rounded-lg p-6 text-center hover:bg-[#2a2f3c] transition-colors cursor-pointer"
                    >
                      <div className="text-3xl mb-2">{link.icon}</div>
                      <p className="text-sm">{link.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Department Events Header */}
              <div className="flex items-center justify-between">
                <div>
                  <button 
                    onClick={() => setCurrentDepartment('Explore')}
                    className="text-blue-400 hover:text-blue-300 text-sm mb-2"
                  >
                    ← Back to Dashboard
                  </button>
                  <h2 className="text-2xl font-semibold">{currentDepartment} Department</h2>
                  <p className="text-gray-400 mt-1">Manage and view events for this department.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={() => setIsCreateEventModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    + Create Event
                  </Button>
                </div>
              </div>

              {/* Department Events List */}
              <EventsListView 
                department={currentDepartment} 
                events={getCurrentDepartmentEvents()}
                onEventClick={onEventClick}
              />
            </>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-80 p-6 space-y-6">
          {/* Calendar */}
          <div className="bg-[#252936] rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Your Calendar</h3>
              <button className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="text-center mb-4">
              <h4 className="font-medium">April 2025</h4>
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                <div key={day} className="text-center py-2 text-gray-400 font-medium">
                  {day}
                </div>
              ))}
              {calendarDays.flat().map((day, index) => (
                <div
                  key={index}
                  className={`text-center py-2 hover:bg-[#3a3d4a] rounded cursor-pointer ${
                    day === null ? 'text-transparent' : 'text-gray-300'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Popular Tags */}
          <div className="bg-[#252936] rounded-lg p-4">
            <h3 className="font-semibold mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-[#3a3d4a] text-gray-300 hover:bg-[#4a4d5a] cursor-pointer"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
        onCreateEvent={onAddEvent}
      />
    </div>
  );
}

// Event Card Component
const EventCard = ({ event, onEventClick }: { event: Event; onEventClick?: (event: Event) => void }) => (
  <div className="bg-[#1a202c] rounded-lg p-4 border border-[#3a3d4a]">
    <div className="flex items-start justify-between mb-2">
      <h4 className="font-semibold text-white">{event.title}</h4>
      <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
        {event.department}
      </Badge>
    </div>
    
    <div className="space-y-2 text-sm text-gray-400">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <span>{event.date} at {event.time}</span>
      </div>
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        <span>{event.location}</span>
      </div>
      {event.contactInfo && (
        <div className="flex items-center gap-2">
          <ContactIcon className="w-4 h-4" />
          <span>{event.contactInfo}</span>
        </div>
      )}
    </div>
    
    {event.description && (
      <p className="text-gray-300 text-sm mt-3 line-clamp-2">{event.description}</p>
    )}
    
    <Button 
      onClick={() => onEventClick?.(event)}
      variant="outline" 
      size="sm" 
      className="mt-3 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
    >
      View Details
    </Button>
  </div>
);