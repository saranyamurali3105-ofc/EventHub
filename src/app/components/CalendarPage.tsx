import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Clock, MapPin, User, Filter, Plus, List, Grid3X3, Eye, Users, Calendar as CalendarIcon } from "lucide-react";
import { eventsAPI } from '../services/api';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  contactInfo: string;
  department: string;
  createdAt: Date;
}

interface CalendarPageProps {
  onBack: () => void;
  currentUser: any;
  isOfflineMode: boolean;
  addNotification: (notification: any) => void;
  events: Event[];
  onEventClick: (event: Event) => void;
}

// Mock events for demonstration
const mockCalendarEvents: Event[] = [
  {
    id: '1',
    title: 'Web Development Workshop',
    date: '2024-04-15',
    time: '10:00 AM',
    location: 'Computer Lab 1',
    description: 'Learn modern web development with React and Node.js.',
    contactInfo: 'admin@eventshub.com',
    department: 'CSE',
    createdAt: new Date('2024-04-10')
  },
  {
    id: '2',
    title: 'AI/ML Seminar',
    date: '2024-04-20',
    time: '2:00 PM',
    location: 'Auditorium',
    description: 'Explore the latest trends in Artificial Intelligence.',
    contactInfo: 'ai.team@eventshub.com',
    department: 'AIML',
    createdAt: new Date('2024-04-12')
  },
  {
    id: '3',
    title: 'Coding Competition',
    date: '2024-04-25',
    time: '9:00 AM',
    location: 'Main Computer Lab',
    description: 'Annual inter-departmental coding competition.',
    contactInfo: 'competition@eventshub.com',
    department: 'IT',
    createdAt: new Date('2024-04-15')
  },
  {
    id: '4',
    title: 'Cultural Fest Dance',
    date: '2024-05-01',
    time: '6:00 PM',
    location: 'Main Stage',
    description: 'Showcase your dancing skills.',
    contactInfo: 'cultural@eventshub.com',
    department: 'ECE',
    createdAt: new Date('2024-04-18')
  },
  {
    id: '5',
    title: 'Technical Symposium',
    date: '2024-05-10',
    time: '10:00 AM',
    location: 'Engineering Block',
    description: 'Technical presentations and project demonstrations.',
    contactInfo: 'tech@eventshub.com',
    department: 'Mechanical',
    createdAt: new Date('2024-04-20')
  },
  {
    id: '6',
    title: 'Robotics Workshop',
    date: '2024-04-28',
    time: '2:00 PM',
    location: 'Robotics Lab',
    description: 'Introduction to robotics and automation.',
    contactInfo: 'robotics@eventshub.com',
    department: 'Mechatronics',
    createdAt: new Date('2024-04-22')
  },
  {
    id: '7',
    title: 'Startup Pitch Event',
    date: '2024-05-15',
    time: '4:00 PM',
    location: 'Conference Hall',
    description: 'Present your startup ideas to industry experts.',
    contactInfo: 'startup@eventshub.com',
    department: 'CSBS',
    createdAt: new Date('2024-04-25')
  }
];

export default function CalendarPage({ onBack, currentUser, isOfflineMode, addNotification, events, onEventClick }: CalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<Event[]>([]);

  const departments = ['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'CSBS', 'Mechatronics'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    // Use provided events or fallback to mock data
    const eventsToUse = events.length > 0 ? events : mockCalendarEvents;
    setCalendarEvents(eventsToUse);
  }, [events]);

  const getFilteredEvents = () => {
    let filtered = calendarEvents;
    
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(event => event.department === selectedDepartment);
    }
    
    return filtered;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return getFilteredEvents().filter(event => event.date === dateStr);
  };

  const getEventsForMonth = (year: number, month: number) => {
    return getFilteredEvents().filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 7);
      } else {
        newDate.setDate(prev.getDate() + 7);
      }
      return newDate;
    });
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 1);
      } else {
        newDate.setDate(prev.getDate() + 1);
      }
      return newDate;
    });
  };

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(date.getDate() - day);
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    
    return week;
  };

  const getDepartmentColor = (department: string) => {
    const colors = {
      'CSE': 'bg-blue-600',
      'IT': 'bg-green-600',
      'AIML': 'bg-purple-600',
      'ECE': 'bg-red-600',
      'EEE': 'bg-yellow-600',
      'Mechanical': 'bg-orange-600',
      'Civil': 'bg-gray-600',
      'CSBS': 'bg-pink-600',
      'Mechatronics': 'bg-indigo-600'
    };
    return colors[department as keyof typeof colors] || 'bg-blue-600';
  };

  const EventCard = ({ event, compact = false }: { event: Event; compact?: boolean }) => (
    <div
      onClick={() => setSelectedEvent(event)}
      className={`${getDepartmentColor(event.department)} rounded p-2 cursor-pointer hover:opacity-80 transition-opacity ${
        compact ? 'text-xs' : 'text-sm'
      }`}
    >
      <div className="text-white font-medium truncate">{event.title}</div>
      {!compact && (
        <>
          <div className="text-white/80 text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {event.time}
          </div>
          <div className="text-white/80 text-xs flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {event.location}
          </div>
        </>
      )}
    </div>
  );

  const MonthView = () => {
    const days = getDaysInMonth(currentDate);
    const monthEvents = getEventsForMonth(currentDate.getFullYear(), currentDate.getMonth());

    return (
      <div className="bg-[#252936] rounded-lg p-4">
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center text-gray-400 font-medium py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayEvents = day ? getEventsForDate(day) : [];
            const isToday = day && day.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                className={`min-h-[100px] p-2 border border-[#3a3d4a] rounded ${
                  day ? 'bg-[#1a202c] hover:bg-[#2a2f3c]' : 'bg-transparent'
                } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-sm mb-2 ${isToday ? 'text-blue-400 font-bold' : 'text-gray-300'}`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <EventCard key={event.id} event={event} compact />
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-400">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const WeekView = () => {
    const weekDays = getWeekDays(currentDate);
    
    return (
      <div className="bg-[#252936] rounded-lg p-4">
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map(day => {
            const dayEvents = getEventsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div key={day.toISOString()} className="space-y-2">
                <div className={`text-center py-2 ${isToday ? 'text-blue-400 font-bold' : 'text-gray-300'}`}>
                  <div className="text-sm">{dayNames[day.getDay()]}</div>
                  <div className="text-lg">{day.getDate()}</div>
                </div>
                <div className="min-h-[200px] space-y-2">
                  {dayEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const DayView = () => {
    const dayEvents = getEventsForDate(currentDate).sort((a, b) => a.time.localeCompare(b.time));
    const isToday = currentDate.toDateString() === new Date().toDateString();
    
    return (
      <div className="bg-[#252936] rounded-lg p-6">
        <div className={`text-center mb-6 ${isToday ? 'text-blue-400' : 'text-gray-300'}`}>
          <h3 className="text-2xl font-bold">
            {currentDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          {isToday && <p className="text-sm text-blue-300">Today</p>}
        </div>
        
        {dayEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No events scheduled for this day</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dayEvents.map(event => (
              <Card key={event.id} className="bg-[#1a202c] border-[#3a3d4a] hover:border-blue-600/50 transition-colors cursor-pointer">
                <CardContent className="p-4" onClick={() => setSelectedEvent(event)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-2">{event.title}</h4>
                      <div className="space-y-1 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{event.contactInfo}</span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mt-2">{event.description}</p>
                    </div>
                    <Badge className={`${getDepartmentColor(event.department)} text-white border-0`}>
                      {event.department}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const ListView = () => {
    const filteredEvents = getFilteredEvents().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return (
      <div className="bg-[#252936] rounded-lg p-6">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No events found</p>
            <p className="text-gray-500 text-sm mt-2">
              {selectedDepartment !== 'all' 
                ? `No events in ${selectedDepartment} department` 
                : 'No events scheduled'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map(event => (
              <Card key={event.id} className="bg-[#1a202c] border-[#3a3d4a] hover:border-blue-600/50 transition-colors cursor-pointer">
                <CardContent className="p-4" onClick={() => setSelectedEvent(event)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-white">{event.title}</h4>
                        <Badge className={`${getDepartmentColor(event.department)} text-white border-0 text-xs`}>
                          {event.department}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{event.contactInfo}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-sm">{event.description}</p>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const EventDetailsModal = () => {
    if (!selectedEvent) return null;

    return (
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="bg-[#252936] border-[#3a3d4a] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-blue-400 text-xl">{selectedEvent.title}</DialogTitle>
            <DialogDescription className="text-gray-400">
              Event Details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-300">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span>{new Date(selectedEvent.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-5 h-5 text-blue-400" />
                <span>{selectedEvent.time}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span>{selectedEvent.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <User className="w-5 h-5 text-blue-400" />
                <span>{selectedEvent.contactInfo}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={`${getDepartmentColor(selectedEvent.department)} text-white border-0`}>
                {selectedEvent.department}
              </Badge>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">Description</h4>
              <p className="text-gray-300 leading-relaxed">{selectedEvent.description}</p>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setSelectedEvent(null);
                  onEventClick(selectedEvent);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                View Full Details
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedEvent(null)}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-600"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const StatsCards = () => {
    const totalEvents = getFilteredEvents().length;
    const thisMonthEvents = getEventsForMonth(currentDate.getFullYear(), currentDate.getMonth()).length;
    const todayEvents = getEventsForDate(new Date()).length;
    const upcomingEvents = getFilteredEvents().filter(event => 
      new Date(event.date) > new Date()
    ).length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Events</p>
                <p className="text-xl font-semibold text-white">{totalEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">This Month</p>
                <p className="text-xl font-semibold text-white">{thisMonthEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Today</p>
                <p className="text-xl font-semibold text-white">{todayEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#252936] border-[#3a3d4a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Upcoming</p>
                <p className="text-xl font-semibold text-white">{upcomingEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1a1d29] text-white">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">EventsHub</h1>
        <p className="text-sm text-gray-400">Event Calendar & Schedule</p>
        
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
              <h2 className="text-2xl font-bold text-blue-400">📅 Event Calendar</h2>
              <p className="text-gray-400 mt-1">View and manage events across different time periods</p>
            </div>
          </div>

          <StatsCards />

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-[#1a202c] rounded-lg">
            <div className="flex items-center gap-4">
              {/* Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (view === 'month') navigateMonth('prev');
                    else if (view === 'week') navigateWeek('prev');
                    else if (view === 'day') navigateDay('prev');
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="min-w-[200px] text-center">
                  <h3 className="font-semibold text-white">
                    {view === 'month' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                    {view === 'week' && `Week of ${currentDate.toLocaleDateString()}`}
                    {view === 'day' && currentDate.toLocaleDateString()}
                    {view === 'list' && 'All Events'}
                  </h3>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (view === 'month') navigateMonth('next');
                    else if (view === 'week') navigateWeek('next');
                    else if (view === 'day') navigateDay('next');
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
              >
                Today
              </Button>
            </div>

            <div className="flex items-center gap-4">
              {/* Department Filter */}
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-40 bg-[#3a3d4a] border-[#4a4d5a] text-white">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent className="bg-[#3a3d4a] border-[#4a4d5a] text-white">
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-[#3a3d4a] rounded-lg p-1">
                <Button
                  variant={view === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('month')}
                  className={`h-8 px-3 ${view === 'month' ? 'bg-blue-600' : 'hover:bg-[#4a4d5a]'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                  Month
                </Button>
                <Button
                  variant={view === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('week')}
                  className={`h-8 px-3 ${view === 'week' ? 'bg-blue-600' : 'hover:bg-[#4a4d5a]'}`}
                >
                  <Calendar className="w-4 h-4" />
                  Week
                </Button>
                <Button
                  variant={view === 'day' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('day')}
                  className={`h-8 px-3 ${view === 'day' ? 'bg-blue-600' : 'hover:bg-[#4a4d5a]'}`}
                >
                  <Clock className="w-4 h-4" />
                  Day
                </Button>
                <Button
                  variant={view === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('list')}
                  className={`h-8 px-3 ${view === 'list' ? 'bg-blue-600' : 'hover:bg-[#4a4d5a]'}`}
                >
                  <List className="w-4 h-4" />
                  List
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar Views */}
          {view === 'month' && <MonthView />}
          {view === 'week' && <WeekView />}
          {view === 'day' && <DayView />}
          {view === 'list' && <ListView />}
        </div>
      </div>

      <EventDetailsModal />
    </div>
  );
}