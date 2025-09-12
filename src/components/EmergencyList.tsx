import { Clock, MapPin, Phone, User, AlertTriangle } from 'lucide-react';
import { type EmergencyRequest } from '@/lib/supabase';
import { formatDistanceToNow, isPast } from 'date-fns';

interface EmergencyListProps {
  requests: EmergencyRequest[];
  loading?: boolean;
  compact?: boolean;
}

const EmergencyList = ({ requests, loading, compact = false }: EmergencyListProps) => {
  const getTimeRemaining = (needBy?: string) => {
    if (!needBy) return null;
    
    const needByDate = new Date(needBy);
    const isOverdue = isPast(needByDate);
    
    return {
      text: formatDistanceToNow(needByDate, { addSuffix: !isOverdue }),
      isOverdue,
    };
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(compact ? 3 : 5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertTriangle size={40} className="mx-auto mb-2 text-gray-400" />
        <p>No active emergency requests</p>
        <p className="text-sm mt-1">All clear! 🎉</p>
      </div>
    );
  }

  return (
    <div className={`space-y-${compact ? '3' : '4'}`}>
      {requests.map((request) => {
        const timeRemaining = getTimeRemaining(request.need_by);
        
        return (
          <div 
            key={request.id}
            className={`border border-gray-200 rounded-lg p-${compact ? '3' : '4'} ${
              timeRemaining?.isOverdue ? 'bg-red-50 border-red-200' : 'bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center">
                <span className={`vgu-badge ${
                  timeRemaining?.isOverdue ? 'vgu-badge-danger' : 'vgu-badge-warning'
                }`}>
                  {request.blood_group}
                </span>
                {request.units_needed > 1 && (
                  <span className="ml-2 text-sm text-gray-600">
                    {request.units_needed} units
                  </span>
                )}
              </div>
              
              <span className="vgu-badge-primary text-xs">
                {request.status}
              </span>
            </div>

            {!compact && request.requester_name && (
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <User size={14} className="mr-2" />
                <span>{request.requester_name}</span>
              </div>
            )}

            {request.hospital && (
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin size={14} className="mr-2" />
                <span className={compact ? 'truncate' : ''}>
                  {request.hospital}
                  {request.location && `, ${request.location}`}
                </span>
              </div>
            )}

            {request.contact_phone && !compact && (
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Phone size={14} className="mr-2" />
                <a
                  href={`https://wa.me/${request.contact_phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-accent"
                >
                  {request.contact_phone}
                </a>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                Created {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
              </span>
              
              {timeRemaining && (
                <div className="flex items-center">
                  <Clock size={12} className="mr-1" />
                  <span className={timeRemaining.isOverdue ? 'text-red-600 font-medium' : ''}>
                    {timeRemaining.isOverdue ? 'Overdue!' : `Need by ${timeRemaining.text}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EmergencyList;