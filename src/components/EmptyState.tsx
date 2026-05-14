import React from 'react';
import { Calendar, FileText, Search, BookOpen, Heart, AlertCircle } from 'lucide-react';
import { Button } from './ui/core';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondary?: {
    label: string;
    onClick: () => void;
  };
}

function EmptyStateBase({ icon, title, description, action, secondary }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="text-blue-200 dark:text-blue-900 mb-6">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8">{description}</p>
      <div className="flex gap-3">
        {action && (
          <Button onClick={action.onClick} size="lg">
            {action.label}
          </Button>
        )}
        {secondary && (
          <Button variant="outline" onClick={secondary.onClick} size="lg">
            {secondary.label}
          </Button>
        )}
      </div>
    </div>
  );
}

export function EmptyAppointments({ onBookNow }: { onBookNow?: () => void }) {
  return (
    <EmptyStateBase
      icon={<Calendar size={64} />}
      title="No Appointments Yet"
      description="You haven't booked any appointments. Start by exploring available doctors and book your first appointment."
      action={{
        label: 'Find a Doctor',
        onClick: onBookNow || (() => window.location.href = '/dashboard'),
      }}
    />
  );
}

export function EmptyMedicalRecords({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyStateBase
      icon={<FileText size={64} />}
      title="No Medical Records"
      description="Your medical vault is empty. Upload important documents like test results and prescriptions to keep them organized."
      action={{
        label: 'Upload Document',
        onClick: onUpload || (() => alert('Upload functionality coming soon')),
      }}
    />
  );
}

export function EmptySearchResults({ query, onClear }: { query: string; onClear?: () => void }) {
  return (
    <EmptyStateBase
      icon={<Search size={64} />}
      title="No Results Found"
      description={`We couldn't find any doctors matching "${query}". Try adjusting your search criteria.`}
      action={{
        label: 'Clear Filters',
        onClick: onClear || (() => window.location.reload()),
      }}
    />
  );
}

export function ErrorState({ title, description, onRetry }: { title: string; description: string; onRetry?: () => void }) {
  return (
    <EmptyStateBase
      icon={<AlertCircle size={64} className="text-red-400" />}
      title={title}
      description={description}
      action={{
        label: 'Try Again',
        onClick: onRetry || (() => window.location.reload()),
      }}
    />
  );
}

export function OfflineState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyStateBase
      icon={<AlertCircle size={64} className="text-yellow-400" />}
      title="You're Offline"
      description="It looks like you've lost your internet connection. Some features may not be available."
      action={{
        label: 'Retry',
        onClick: onRetry || (() => window.location.reload()),
      }}
    />
  );
}

export function NoFavoriteDoctors({ onExplore }: { onExplore?: () => void }) {
  return (
    <EmptyStateBase
      icon={<Heart size={64} />}
      title="No Favorite Doctors"
      description="Add doctors to your favorites for quick access to their profiles and appointments."
      action={{
        label: 'Explore Doctors',
        onClick: onExplore || (() => window.location.href = '/dashboard'),
      }}
    />
  );
}

export function NoBookingHistory() {
  return (
    <EmptyStateBase
      icon={<BookOpen size={64} />}
      title="No Booking History"
      description="Your completed appointments will appear here for future reference."
    />
  );
}