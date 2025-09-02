export interface Contact {
  _id: string;
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ContactFilters {
  service: string;
  read: string;
}
