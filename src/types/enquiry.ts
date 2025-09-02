export interface Enquiry {
  _id: string;
  name: string;
  email: string;
  message: string;
  reviewed: boolean;
  createdAt: string;
}

export interface EnquiryFilters {
  reviewed: string;
}
