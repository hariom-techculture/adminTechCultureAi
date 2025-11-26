export interface Lead {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  timestamp?: string;
}

export interface LeadFilters {
  search?: string;
  read?: boolean;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LeadPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface LeadStatistics {
  total: number;
  unread: number;
  today: number;
  filtered: number;
}

export interface LeadResponse {
  messages: Lead[];
  pagination: LeadPagination;
  statistics: LeadStatistics;
  filters: LeadFilters;
}

export interface LeadApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}