import React from 'react';
import { X, Mail, Phone, Calendar, User, MessageSquare } from 'lucide-react';
import { Lead } from '@/types/lead';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Simple date formatter
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
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
      hour12: true
    });
  } catch {
    return '';
  }
};

interface LeadDetailsModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead?: (leadId: string, read: boolean) => void;
  onDelete?: (leadId: string) => void;
}

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
  lead,
  isOpen,
  onClose,
  onMarkAsRead,
  onDelete,
}) => {
  if (!isOpen || !lead) return null;

  const handleMarkAsRead = () => {
    if (onMarkAsRead) {
      onMarkAsRead(lead._id, !lead.read);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this lead?')) {
      onDelete(lead._id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Lead Details</h2>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
                lead.read
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${lead.read ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {lead.read ? 'Read' : 'Unread'}
            </span>
          </div>

          {/* Lead Information */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Full Name
                  </label>
                  <p className="text-gray-900 font-medium">{lead.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Lead ID
                  </label>
                  <p className="text-gray-900 font-mono text-sm">{lead._id}</p>
                </div>

                <div>
                  <label className="flex text-sm font-medium text-gray-600 mb-1 items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </label>
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {lead.phone}
                  </a>
                </div>

                {lead.email && (
                  <div>
                    <label className="flex text-sm font-medium text-gray-600 mb-1 items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </label>
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {lead.email}
                    </a>
                  </div>
                )}
              </div>
            </Card>

            {/* Message */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Message
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {lead.message}
                </p>
              </div>
            </Card>

            {/* Timestamps */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Created</span>
                  <div className="text-right">
                    <p className="text-gray-900 font-medium">
                      {formatDate(lead.createdAt)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatTime(lead.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Last Updated</span>
                  <div className="text-right">
                    <p className="text-gray-900 font-medium">
                      {formatDate(lead.updatedAt)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatTime(lead.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-600">Time Since Received</span>
                  <p className="text-gray-900 font-medium">
                    {getTimeAgo(lead.createdAt)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap gap-3 pt-6 border-t">
            <Button
              onClick={handleMarkAsRead}
              variant={lead.read ? "outline" : "default"}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              {lead.read ? 'Mark as Unread' : 'Mark as Read'}
            </Button>

            {lead.phone && (
              <Button
                onClick={() => window.open(`tel:${lead.phone}`, '_self')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                Call Now
              </Button>
            )}

            {lead.email && (
              <Button
                onClick={() => window.open(`mailto:${lead.email}`, '_self')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Send Email
              </Button>
            )}

            <div className="ml-auto">
              <Button
                onClick={handleDelete}
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                Delete Lead
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Helper function to calculate time ago
function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} weeks ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} months ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} years ago`;
}