import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Clock, MapPin, User as ContactIcon } from "lucide-react";
import { Event } from '../App';

interface EventsListViewProps {
  department: string;
  events: Event[];
  onEventClick?: (event: Event) => void;
}

export default function EventsListView({ department, events, onEventClick }: EventsListViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            {department === 'Explore' ? 'All Events' : `${department} Department Events`}
          </h2>
          <p className="text-gray-400 mt-1">
            {events.length} {events.length === 1 ? 'event' : 'events'} found
          </p>
        </div>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="bg-[#252936] rounded-lg p-12 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">No Events Found</h3>
          <p className="text-gray-400">
            {department === 'Explore' 
              ? 'No events have been created yet. Be the first to create one!'
              : `No events found for ${department} department. Create one to get started!`}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onEventClick={onEventClick} />
          ))}
        </div>
      )}
    </div>
  );
}

// Event Card Component for list view
const EventCard = ({ event, onEventClick }: { event: Event; onEventClick?: (event: Event) => void }) => (
  <div className="bg-[#252936] rounded-lg p-6 border border-[#3a3d4a] hover:border-blue-500 transition-colors">
    <div className="flex items-start justify-between mb-3">
      <h3 className="font-semibold text-white text-lg">{event.title}</h3>
      <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
        {event.department}
      </Badge>
    </div>
    
    <div className="space-y-3 text-sm text-gray-400 mb-4">
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
      <p className="text-gray-300 text-sm mb-4 line-clamp-3">{event.description}</p>
    )}
    
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">
        Created {event.createdAt.toLocaleDateString()}
      </span>
      <Button 
        onClick={() => onEventClick?.(event)}
        variant="outline" 
        size="sm" 
        className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
      >
        View Details
      </Button>
    </div>
  </div>
);