import { useQuery } from '@apollo/client/react';
import {
  GET_JOBS_QUERY,
  type GetJobsQueryData,
  type GetJobsQueryVariables,
} from '../../graphql/queries/jobQueries';
import { GET_SAVED_JOBS } from '../../graphql/queries/userQueries';
import { useAuth } from '../../context/AuthContext';
import JobCard from './JobCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Define types for saved jobs
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

interface JobListProps {
  search?: string;
  location?: string;
  type?: string;
}

const JobList = ({ search, location, type }: JobListProps) => {
  const { isAuthenticated, user } = useAuth();

  // Fetch jobs
  const { loading, error, data } = useQuery<GetJobsQueryData, GetJobsQueryVariables>(
    GET_JOBS_QUERY,
    {
      variables: { search, location, type },
      fetchPolicy: 'network-only',
    }
  );

  // Fetch saved jobs if user is authenticated
  const { data: savedJobsData, refetch: refetchSavedJobs } = useQuery<SavedJobsData, SavedJobsVars>(
    GET_SAVED_JOBS,
    {
      variables: { userId: user?.id || '' },
      skip: !isAuthenticated || user?.role === 'recruiter',
      fetchPolicy: 'cache-first',
    }
  );

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load jobs: {error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!data?.jobs || data.jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No jobs found</p>
        <p className="text-muted-foreground/70">Try adjusting your filters</p>
      </div>
    );
  }

  // Get list of saved job IDs
  const savedJobIds = savedJobsData?.savedJobs?.map((job: SavedJob) => job.id) || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          isSaved={savedJobIds.includes(job.id)}
          onSaveToggle={refetchSavedJobs}
        />
      ))}
    </div>
  );
};

export default JobList;