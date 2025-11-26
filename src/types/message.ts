export interface Message {
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

export interface MessageFilters {
  search?: string;
  read?: boolean;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MessagePagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface MessageStatistics {
  total: number;
  unread: number;
  today: number;
  filtered: number;
}

export interface MessageResponse {
  messages: Message[];
  pagination: MessagePagination;
  statistics: MessageStatistics;
  filters: MessageFilters;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}