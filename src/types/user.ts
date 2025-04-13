export enum UserRole {
  ATTENDEE = 'ATTENDEE',
  VENDOR = 'VENDOR',
  VENUE_OWNER = 'VENUE_OWNER',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt: string;
  updatedAt: string;
} 