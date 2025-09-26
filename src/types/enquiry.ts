export interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  projectName?: string;
  demoDate?: string;
  demoTime?: string;
  // Google Meet fields
  googleMeetLink?: string;
  googleEventId?: string;
  googleEventLink?: string;
  // Location tracking
  ip?: string;
  location?: string;
  // Status
  reviewed: boolean;
  isEmailSent?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryFilters {
  reviewed: string;
  hasDemo?: string;
}
