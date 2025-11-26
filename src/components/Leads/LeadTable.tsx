import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MoreHorizontal, Eye, Trash2, Download, Mail, Phone, Calendar, User, MessageSquare, X } from 'lucide-react';
import leadService from '@/services/lead.service';
import { Lead, LeadFilters, LeadResponse } from '@/types/lead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

// Simple date formatter fallback
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric' 
    });
  } catch {
    return dateString;
  }
};

const formatTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  } catch {
    return '';
  }
};

interface LeadTableProps {
  // Props can be added here if needed in the future
}

export const LeadTable: React.FC<LeadTableProps> = () => {
  const [data, setData] = useState<LeadResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [filters, setFilters] = useState<LeadFilters & { page: number; limit: number }>({
    page: 1,
    limit: 10,
    search: '',
    read: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await leadService.getMessages(filters);
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError('Failed to fetch leads');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleFilterChange = (key: keyof LeadFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleMarkAsRead = async (leadId: string, read: boolean = true) => {
    try {
      await leadService.markAsRead(leadId, read);
      fetchLeads(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lead');
    }
  };

  const handleReadMore = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedLeads.length === 0) return;
    
    try {
      await leadService.bulkMarkAsRead(selectedLeads);
      setSelectedLeads([]);
      fetchLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark leads as read');
    }
  };

  const handleExport = async (format: 'csv' | 'excel' = 'csv') => {
    try {
      const blob = await leadService.exportMessages(
        { 
          search: filters.search, 
          read: filters.read, 
          startDate: filters.startDate, 
          endDate: filters.endDate 
        }, 
        format
      );
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export leads');
    }
  };

  const toggleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const toggleSelectAll = () => {
    if (!data?.messages) return;
    
    const allSelected = data.messages.every(lead => selectedLeads.includes(lead._id));
    setSelectedLeads(allSelected ? [] : data.messages.map(lead => lead._id));
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <Button onClick={fetchLeads} className="mt-4">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Card */}
      {data?.statistics && (
        <div className="grid grid-cols-1 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold">{data.statistics.total}</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search leads by name, email, phone, or message..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* No additional filters for now */}
        </div>

        {/* Bulk Actions */}
        {selectedLeads.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedLeads.length} lead(s) selected
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={handleBulkMarkAsRead}
                  variant="outline"
                  size="sm"
                >
                  Mark as Read
                </Button>
                <Button
                  onClick={() => setSelectedLeads([])}
                  variant="ghost"
                  size="sm"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={data?.messages ? data.messages.every(lead => selectedLeads.includes(lead._id)) : false}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="p-4 text-left font-semibold">Lead Info</th>
                <th className="p-4 text-left font-semibold">Contact</th>
                <th className="p-4 text-left font-semibold">Message</th>
                <th className="p-4 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Loading leads...
                  </td>
                </tr>
              ) : data?.messages?.length ? (
                data.messages.map((lead) => (
                  <tr
                    key={lead._id}
                    className={`border-b hover:bg-gray-50 ${!lead.read ? 'bg-blue-50' : ''}`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead._id)}
                        onChange={() => toggleSelectLead(lead._id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${lead.read ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-sm text-gray-500">ID: {lead._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </div>
                        {lead.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="flex items-start gap-1">
                        <MessageSquare className="h-3 w-3 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm line-clamp-2" title={lead.message}>
                            {lead.message.length > 50 ? `${lead.message.substring(0, 50)}...` : lead.message}
                          </p>
                          {lead.message.length > 50 && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleReadMore(lead);
                              }}
                              onFocus={(e) => e.stopPropagation()}
                              className="text-blue-500 hover:text-blue-700 text-xs mt-1 underline"
                            >
                              Read more
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {formatDate(lead.createdAt)}
                      <br />
                      <span className="text-xs">
                        {formatTime(lead.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No leads found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((data.pagination.currentPage - 1) * data.pagination.limit) + 1} to{' '}
                {Math.min(data.pagination.currentPage * data.pagination.limit, data.pagination.totalCount)} of{' '}
                {data.pagination.totalCount} results
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handlePageChange(data.pagination.currentPage - 1)}
                  disabled={!data.pagination.hasPrevPage}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                
                <span className="text-sm">
                  Page {data.pagination.currentPage} of {data.pagination.totalPages}
                </span>
                
                <Button
                  onClick={() => handlePageChange(data.pagination.currentPage + 1)}
                  disabled={!data.pagination.hasNextPage}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Message Details Modal */}
      {isModalOpen && selectedLead && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleModalClose();
            }
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Message Details</h2>
                <Button onClick={handleModalClose} variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{selectedLead.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {selectedLead.phone}
                    </div>
                    {selectedLead.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {selectedLead.email}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Message:</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border">
                    <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">{selectedLead.message}</p>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>Received: {formatDate(selectedLead.createdAt)} at {formatTime(selectedLead.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};