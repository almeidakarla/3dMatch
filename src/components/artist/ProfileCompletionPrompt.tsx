'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, User, CheckCircle, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Profile {
  id: string;
  full_name: string;
  software?: string[];
  years_experience?: number;
  architecture_style?: string[];
  favorite_project_types?: string[];
  approval_status?: string;
  portfolio_review_notes?: string;
}

interface StatusMessage {
  icon: React.ReactNode;
  title: string;
  message: string;
  submessage?: string;
  notes?: string;
  showAction: boolean;
  actionText?: string;
  actionPath?: string;
}

interface ProfileCompletionPromptProps {
  profile: Profile | null;
}

export default function ProfileCompletionPrompt({ profile }: ProfileCompletionPromptProps) {
  const router = useRouter();
  const [hasApplication, setHasApplication] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSeenApproval, setHasSeenApproval] = useState(false);

  // Check if user has seen the approval message
  useEffect(() => {
    if (profile?.id) {
      const seen = localStorage.getItem(`approval_seen_${profile.id}`);
      setHasSeenApproval(seen === 'true');
    }
  }, [profile?.id]);

  // Check if user has submitted an application
  useEffect(() => {
    const checkApplication = async () => {
      if (!profile?.id) return;

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('artist_submissions')
          .select('status')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          setHasApplication(true);
          setApplicationStatus(data[0].status);
        }
      } catch (err) {
        console.error('Error checking application:', err);
      } finally {
        setLoading(false);
      }
    };

    checkApplication();
  }, [profile?.id]);

  // Safety check - if profile is not loaded yet, show loading
  if (!profile || loading) {
    return (
      <div className="loading-screen">
        <div className="logo-icon">3D</div>
        <p>Loading profile...</p>
      </div>
    );
  }

  // Check if profile is complete (has data copied from approved application)
  const isProfileComplete = profile.software?.length && profile.software.length > 0 &&
                           profile.years_experience && profile.years_experience > 0 &&
                           profile.architecture_style?.length && profile.architecture_style.length > 0 &&
                           profile.favorite_project_types?.length && profile.favorite_project_types.length > 0;

  const getStatusMessage = (): StatusMessage => {
    // Handle missing approval_status (migration not run yet)
    const approvalStatus = profile.approval_status || 'pending';

    if (approvalStatus === 'rejected') {
      return {
        icon: <AlertCircle size={48} className="status-icon-rejected" />,
        title: 'Application Not Approved',
        message: 'Unfortunately, your application was not approved at this time.',
        notes: profile.portfolio_review_notes,
        showAction: false
      };
    }

    if (approvalStatus === 'approved') {
      // Show approval message only once
      if (!hasSeenApproval) {
        // Mark as seen
        localStorage.setItem(`approval_seen_${profile.id}`, 'true');
        return {
          icon: <CheckCircle size={48} className="status-icon-approved" />,
          title: 'Profile Approved!',
          message: 'Congratulations! Your profile has been approved. You can now start exploring and applying to projects on the platform!',
          showAction: true,
          actionText: 'Explore Projects',
          actionPath: '/dashboard/artist/browse-projects'
        };
      } else {
        // Show normal welcome screen after first time
        return {
          icon: <User size={48} className="status-icon-approved" />,
          title: `Welcome, ${profile.full_name}! 👋`,
          message: 'Explore available projects and submit your proposals to start working!',
          showAction: true,
          actionText: 'Explore Projects',
          actionPath: '/dashboard/artist/browse-projects'
        };
      }
    }

    // Pending status - check if they have a submitted application
    if (!isProfileComplete) {
      // If they have a pending application, show "under review"
      if (hasApplication && applicationStatus === 'pending') {
        return {
          icon: <Clock size={48} className="status-icon-pending" />,
          title: 'Application Under Review',
          message: 'Your application has been submitted and is being reviewed by our team.',
          submessage: 'You will receive an email once your application is approved. This usually takes up to 2 business days.',
          showAction: false
        };
      }

      // If application was rejected, allow reapplication
      if (hasApplication && applicationStatus === 'rejected') {
        return {
          icon: <AlertCircle size={48} className="status-icon-rejected" />,
          title: 'Application Not Approved',
          message: 'Your application was not approved. You can submit a new application with updated information.',
          notes: profile.portfolio_review_notes,
          showAction: true,
          actionText: 'Submit New Application',
          actionPath: '/dashboard/artist/apply'
        };
      }

      // No application yet - show completion prompt
      return {
        icon: <User size={48} className="status-icon-pending" />,
        title: 'Complete Your Application',
        message: 'To start working on the platform, complete your 3D artist application with your information and portfolio.',
        showAction: true,
        actionText: 'Complete Application Now',
        actionPath: '/dashboard/artist/apply'
      };
    }

    return {
      icon: <Clock size={48} className="status-icon-pending" />,
      title: 'Application Under Review',
      message: 'Your application is being reviewed by our team.',
      submessage: 'You will receive an email once it is approved. This usually takes up to 2 business days.',
      showAction: false
    };
  };

  const status = getStatusMessage();

  return (
    <div className="profile-completion-prompt">
      <div className="prompt-content">
        {status.icon}
        <h2>{status.title}</h2>
        <p className="prompt-message">{status.message}</p>
        {status.submessage && <p className="prompt-submessage">{status.submessage}</p>}

        {status.notes && (
          <div className="review-notes">
            <h4>Team Feedback:</h4>
            <p>{status.notes}</p>
          </div>
        )}

        {status.showAction && status.actionPath && (
          <button
            className="btn-primary btn-large"
            onClick={() => router.push(status.actionPath!)}
          >
            {status.actionText}
          </button>
        )}

        {(profile.approval_status === 'pending' || !profile.approval_status) && isProfileComplete && (
          <div className="pending-timeline">
            <h4>Next Steps:</h4>
            <ol>
              <li>Our team is reviewing your portfolio</li>
              <li>Verifying your qualifications and experience</li>
              <li>You will receive a notification with the result</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
