import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useAuth } from '../../context/AuthContext';
import { SAVE_JOB_MUTATION, UNSAVE_JOB_MUTATION } from '../../graphql/mutations/userMutations';
import { GET_SAVED_JOBS } from '../../graphql/queries/jobQueries';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { toast } from 'sonner';

// Define types for the saved jobs response
interface SavedJob {
  id: string;
  title: string;
  company: string;
  location: string;
}

interface SavedJobsData {
  savedJobs: SavedJob[];
}

interface SavedJobsVars {
  userId: string;
}

interface SaveJobButtonProps {
  jobId: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'link';
  showText?: boolean;
  className?: string;
  onSavedChange?: (isSaved: boolean) => void;
}

const SaveJobButton = ({
  jobId,
  size = 'default',
  variant = 'outline',
  showText = true,
  className = '',
  onSavedChange,
}: SaveJobButtonProps) => {
  const { user, isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if job is saved
  const { data, refetch } = useQuery<SavedJobsData, SavedJobsVars>(GET_SAVED_JOBS, {
    variables: { userId: user?.id || '' },
    skip: !isAuthenticated || !user?.id,
  });

  // Update isSaved state when data changes
  useEffect(() => {
    if (data?.savedJobs) {
      const saved = data.savedJobs.some((job: SavedJob) => job.id === jobId);
      setIsSaved(saved);
      if (onSavedChange) {
        onSavedChange(saved);
      }
    }
  }, [data, jobId, onSavedChange]);

  // Save mutation
  const [saveJob] = useMutation(SAVE_JOB_MUTATION);
  
  // Unsave mutation
  const [unsaveJob] = useMutation(UNSAVE_JOB_MUTATION);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation if inside a link

    if (!isAuthenticated) {
      toast.error('Please login to save jobs');
      return;
    }

    setIsLoading(true);

    try {
      if (isSaved) {
        // Unsave
        await unsaveJob({
          variables: {
            userId: user?.id,
            jobId: jobId,
          },
        });
        setIsSaved(false);
        if (onSavedChange) {
          onSavedChange(false);
        }
        toast.success('Job removed from saved list');
      } else {
        // Save
        await saveJob({
          variables: {
            userId: user?.id,
            jobId: jobId,
          },
        });
        setIsSaved(true);
        if (onSavedChange) {
          onSavedChange(true);
        }
        toast.success('Job saved successfully!');
      }
      
      // Refetch saved jobs to update cache
      await refetch();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update saved job';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  // Determine button styles based on saved state
  const getButtonStyles = () => {
    if (isSaved) {
      return `text-primary border-primary hover:bg-primary/10 ${className}`;
    }
    return className;
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleSave}
      disabled={isLoading}
      className={getButtonStyles()}
      aria-label={isSaved ? 'Remove from saved jobs' : 'Save job'}
    >
      {isSaved ? (
        <>
          <BookmarkCheck className={`h-4 w-4 ${showText ? 'mr-2' : ''} fill-current`} />
          {showText && 'Saved'}
        </>
      ) : (
        <>
          <Bookmark className={`h-4 w-4 ${showText ? 'mr-2' : ''}`} />
          {showText && 'Save Job'}
        </>
      )}
    </Button>
  );
};

export default SaveJobButton;