export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  htmlLink: string;
  totalCapacity?: number;
  registeredCount?: number;
  mentor?: string;
  theme?: string;
  status?: string;
}

export interface UserBooking {
  id: string;
  eventId: string;
  userId: string;
  week: number;
  year: number;
  category?: string;
  timestamp: string | null;
  rating: number;
  feedback: string;
  evaluatedAt?: string | null;
  eventDetail: GoogleCalendarEvent | null;
}
