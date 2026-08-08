import { useAuth } from '../context/AuthContext';
import { useQuery } from '@apollo/client/react';
import { GET_APPLICATIONS_BY_APPLICANT } from '../graphql/queries/applicationQueries';
import { GET_JOBS_BY_RECRUITER, type GetJobsByRecruiterData } from '../graphql/queries/jobQueries';
import type { GetApplicationsByApplicantData } from '../graphql/queries/applicationQueries';
import { GET_SAVED_JOBS } from '../graphql/queries/userQueries';
import type { Job } from '../graphql/queries/jobQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  Bookmark,
} from 'lucide-react';

// Define types for the saved jobs response
interface SavedJobsData {
  savedJobs: Job[];
}

interface SavedJobsVars {
  userId: string;
}

// Extend Job type to include applications if needed
interface JobWithApplications extends Job {
  applications?: Array<{ id: string }>;
}

const formatDate = (dateString: string) => {
  const date = new Date(parseInt(dateString));
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please Login</h1>
        <p className="text-muted-foreground mb-4">You need to be logged in to view your dashboard.</p>
        <Link to="/login" className="text-primary hover:underline">
          Go to Login
        </Link>
      </div>
    );
  }

  if (user?.role === 'seeker') {
    return <SeekerDashboard userId={user.id} />;
  }

  if (user?.role === 'recruiter') {
    return <RecruiterDashboard userId={user.id} />;
  }

  return null;
};

// -------------------- SEEKER DASHBOARD --------------------
const SeekerDashboard = ({ userId }: { userId: string }) => {
  const { loading, error, data } = useQuery<GetApplicationsByApplicantData>(
    GET_APPLICATIONS_BY_APPLICANT,
    {
      variables: { applicantId: userId },
      fetchPolicy: 'network-only',
    }
  );

  const { loading: savedJobsLoading, data: savedJobsData } = useQuery<SavedJobsData, SavedJobsVars>(
    GET_SAVED_JOBS,
    {
      variables: { userId },
      skip: !userId,
    }
  );

  if (loading || savedJobsLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-destructive">Failed to load applications: {error.message}</p>
      </div>
    );
  }

  const applications = data?.applicationsByApplicant || [];
  const savedJobs = savedJobsData?.savedJobs || [];

  const totalApplications = applications.length;
  const pending = applications.filter((app) => app.status === 'pending').length;
  const reviewing = applications.filter((app) => app.status === 'reviewing').length;
  const shortlisted = applications.filter((app) => app.status === 'shortlisted').length;
  const hired = applications.filter((app) => app.status === 'hired').length;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-warning/10 text-warning border-warning/20',
      reviewing: 'bg-info/10 text-info border-info/20',
      shortlisted: 'bg-success/10 text-success border-success/20',
      rejected: 'bg-destructive/10 text-destructive border-destructive/20',
      hired: 'bg-primary/10 text-primary border-primary/20',
    };
    return colors[status] || 'bg-muted/10 text-muted-foreground border-muted/20';
  };

  const getStatusIcon = (status: string): ReactNode => {
    const icons: Record<string, ReactNode> = {
      pending: <Clock className="h-4 w-4" />,
      reviewing: <Eye className="h-4 w-4" />,
      shortlisted: <CheckCircle className="h-4 w-4" />,
      rejected: <XCircle className="h-4 w-4" />,
      hired: <TrendingUp className="h-4 w-4" />,
    };
    return icons[status] || <Clock className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <p className="text-muted-foreground">Track your job applications and activity</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{totalApplications}</p>
              <p className="text-sm text-muted-foreground">Total Applications</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-info">{reviewing}</p>
              <p className="text-sm text-muted-foreground">Reviewing</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{shortlisted}</p>
              <p className="text-sm text-muted-foreground">Shortlisted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{hired}</p>
              <p className="text-sm text-muted-foreground">Hired</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">My Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No applications yet</h3>
              <p className="text-muted-foreground/70 mb-4">Start applying to jobs to track them here</p>
              <Link to="/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1">
                      <Link to={`/jobs/${application.job.id}`}>
                        <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                          {application.job.title}
                        </h3>
                      </Link>
                      <p className="text-muted-foreground">{application.job.company}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{application.job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Applied {formatDate(application.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className={getStatusColor(application.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(application.status)}
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </Badge>
                      <Link to={`/applications/${application.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Jobs Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            Saved Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {savedJobs.length === 0 ? (
            <div className="text-center py-8">
              <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No saved jobs</h3>
              <p className="text-muted-foreground/70 mb-4">Start saving jobs you're interested in</p>
              <Link to="/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedJobs.map((job: Job) => (
                <div
                  key={job.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Link to={`/jobs/${job.id}`}>
                        <h4 className="font-semibold hover:text-primary">{job.title}</h4>
                      </Link>
                      <p className="text-muted-foreground text-sm">{job.company}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <MapPin className="h-3 w-3" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                  </div>
                  <Link to={`/jobs/${job.id}`} className="mt-3 block">
                    <Button variant="outline" size="sm" className="w-full">
                      View Job
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// -------------------- RECRUITER DASHBOARD --------------------
const RecruiterDashboard = ({ userId }: { userId: string }) => {
  const { loading, error, data } = useQuery<GetJobsByRecruiterData>(
    GET_JOBS_BY_RECRUITER,
    {
      variables: { recruiterId: userId },
      fetchPolicy: 'network-only',
    }
  );

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-destructive">Failed to load jobs: {error.message}</p>
      </div>
    );
  }

  const jobs = (data?.jobsByRecruiter || []) as JobWithApplications[];
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((job) => job.isActive).length;
  
  // Calculate total applications across all jobs
  const totalApplications = jobs.reduce((total, job) => {
    // Check if applications exists and is an array
    if (job.applications && Array.isArray(job.applications)) {
      return total + job.applications.length;
    }
    return total;
  }, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
          <p className="text-muted-foreground">Manage your job postings and applicants</p>
        </div>
        <Link to="/post-job">
          <Button>Post a Job</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{totalJobs}</p>
              <p className="text-sm text-muted-foreground">Total Jobs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{activeJobs}</p>
              <p className="text-sm text-muted-foreground">Active Jobs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-info">{totalApplications}</p>
              <p className="text-sm text-muted-foreground">Total Applicants</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-foreground">0</p>
              <p className="text-sm text-muted-foreground">New Messages</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Your Job Postings</CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No jobs posted yet</h3>
              <p className="text-muted-foreground/70 mb-4">Post your first job to start receiving applications</p>
              <Link to="/post-job">
                <Button>Post a Job</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const applicationCount = job.applications && Array.isArray(job.applications) 
                  ? job.applications.length 
                  : 0;
                
                return (
                  <div
                    key={job.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="flex-1">
                        <Link to={`/jobs/${job.id}`}>
                          <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                        </Link>
                        <p className="text-muted-foreground">{job.company}</p>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{applicationCount} applicants</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Posted {formatDate(job.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge 
                          variant="outline"
                          className={job.isActive ? 'bg-success/10 text-success border-success/20' : 'bg-muted/10 text-muted-foreground border-muted/20'}
                        >
                          {job.isActive ? 'Open' : 'Closed'}
                        </Badge>
                        <Link to={`/jobs/${job.id}/applications`}>
                          <Button variant="outline" size="sm">
                            View Applicants
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;