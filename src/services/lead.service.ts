import { LeadResponse, LeadFilters, LeadApiResponse } from '@/types/lead';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api`;

const ENABLE_MOCK = false; // Set to false when backend is ready

class LeadService {
  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<LeadApiResponse<T>> {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get messages (leads) with pagination, search, and filters
   */
  async getMessages(filters: LeadFilters & { page?: number; limit?: number } = {}) {
    const queryParams = new URLSearchParams();
    
    // Add pagination params
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    
    // Add filter params
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.read !== undefined) queryParams.append('read', filters.read.toString());
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

    // Use the simple /messages endpoint since your API returns direct array
    const endpoint = `/messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    try {
      const response = await this.apiCall<any>(endpoint);
      
      // Transform the response to match our expected format
      if (response.success && Array.isArray(response.data)) {
        const messages = response.data;
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        
        // Apply client-side filtering and pagination since API doesn't seem to support it yet
        let filteredMessages = [...messages];
        
        // Apply search filter
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredMessages = filteredMessages.filter(msg => 
            msg.name.toLowerCase().includes(searchTerm) ||
            (msg.email && msg.email.toLowerCase().includes(searchTerm)) ||
            msg.phone.includes(searchTerm) ||
            msg.message.toLowerCase().includes(searchTerm)
          );
        }
        
        // Apply read filter
        if (filters.read !== undefined) {
          filteredMessages = filteredMessages.filter(msg => msg.read === filters.read);
        }
        
        // Apply date filters
        if (filters.startDate) {
          filteredMessages = filteredMessages.filter(msg => 
            new Date(msg.createdAt) >= new Date(filters.startDate!)
          );
        }
        
        if (filters.endDate) {
          filteredMessages = filteredMessages.filter(msg => 
            new Date(msg.createdAt) <= new Date(filters.endDate!)
          );
        }
        
        // Sort messages
        const sortBy = filters.sortBy || 'createdAt';
        const sortOrder = filters.sortOrder || 'desc';
        
        filteredMessages.sort((a, b) => {
          let aValue: any = (a as any)[sortBy];
          let bValue: any = (b as any)[sortBy];
          
          if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
            aValue = new Date(aValue).getTime();
            bValue = new Date(bValue).getTime();
          }
          
          if (sortOrder === 'desc') {
            return aValue > bValue ? -1 : 1;
          } else {
            return aValue < bValue ? -1 : 1;
          }
        });
        
        // Apply pagination
        const totalCount = filteredMessages.length;
        const totalPages = Math.ceil(totalCount / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedMessages = filteredMessages.slice(startIndex, endIndex);
        
        // Calculate statistics
        const totalMessages = messages.length;
        const unreadCount = messages.filter((msg: any) => !msg.read).length;
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayCount = messages.filter((msg: any) => {
          const msgDate = new Date(msg.createdAt);
          return msgDate >= todayStart;
        }).length;
        
        return {
          success: true,
          data: {
            messages: paginatedMessages,
            pagination: {
              currentPage: page,
              totalPages,
              totalCount,
              limit,
              hasNextPage: page < totalPages,
              hasPrevPage: page > 1,
              nextPage: page < totalPages ? page + 1 : null,
              prevPage: page > 1 ? page - 1 : null,
            },
            statistics: {
              total: totalMessages,
              unread: unreadCount,
              today: todayCount,
              filtered: totalCount,
            },
            filters: {
              search: filters.search,
              read: filters.read,
              startDate: filters.startDate,
              endDate: filters.endDate,
              sortBy: filters.sortBy,
              sortOrder: filters.sortOrder,
            }
          }
        };
      }
      
      throw new Error('Invalid API response format');
      
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      throw error;
    }
  }

  /**
   * Mark a message as read/unread
   */
  async markAsRead(messageId: string, read: boolean = true) {
    return this.apiCall(`/messages/${messageId}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ read }),
    });
  }

  /**
   * Get message by ID
   */
  async getMessageById(messageId: string) {
    return this.apiCall(`/messages/${messageId}`);
  }

  /**
   * Bulk operations
   */
  async bulkMarkAsRead(messageIds: string[]) {
    return this.apiCall('/messages/bulk/read', {
      method: 'PATCH',
      body: JSON.stringify({ messageIds, read: true }),
    });
  }

  /**
   * Export messages
   */
  async exportMessages(filters: LeadFilters = {}, format: 'csv' | 'excel' = 'csv') {
    const queryParams = new URLSearchParams();
    
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.read !== undefined) queryParams.append('read', filters.read.toString());
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    queryParams.append('format', format);

    const endpoint = `/messages/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }
}

export const leadService = new LeadService();
export default leadService;