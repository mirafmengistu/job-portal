import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_JOB_QUERY, type GetJobQueryData } from '../graphql/queries/jobQueries';
import { CHECK_APPLICATION_STATUS } from '../graphql/queries/applicationQueries';
import { GET_SAVED_JOBS } from '../graphql/queries/userQueries';
import { DELETE_JOB_MUTATION } from '../graphql/mutations/jobMutations';
import { SAVE_JOB_MUTATION, UNSAVE_JOB_MUTATION } from '../graphql/mutations/userMutations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { MapPin, DollarSign, Calendar, Building, Users, FileText, CheckCircle, Bookmark, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useMemo } from 'react';
import ApplyToJobModal from '../components/jobs/ApplyToJobModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { toast } from 'sonner';

// Define types for the saved jobs response
interface SavedJobsData {
    savedJobs: Array<{
        id: string;
        title: string;
        company: string;
        location: string;
    }>;
}

interface SavedJobsVars {
    userId: string;
}

// Define types for application status check
interface ApplicationStatusData {
    applicationsByJob: Array<{
        id: string;
        status: string;
        applicant: {
            id: string;
            name: string;
            email: string;
        };
        job: {
            id: string;
            title: string;
        };
    }>;
}

interface ApplicationStatusVars {
    jobId: string;
    applicantId: string;
}

// Define types for delete mutation
interface DeleteJobResponse {
    deleteJob: {
        id: string;
        title: string;
        success: boolean;
    };
}

interface DeleteJobVars {
    id: string;
}

// Define types for save/unsave mutations
interface SaveJobResponse {
    saveJob: {
        id: string;
        userId: string;
        jobId: string;
    };
}

interface UnsaveJobResponse {
    unsaveJob: {
        id: string;
        userId: string;
        jobId: string;
    };
}

interface SaveJobVars {
    userId: string;
    jobId: string;
}

const JobDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Get job details
    const { loading: jobLoading, error: jobError, data: jobData } = useQuery<GetJobQueryData>(GET_JOB_QUERY, {
        variables: { id },
    });

    // Check if user has already applied
    const { data: applicationData, refetch: refetchApplications } = useQuery<ApplicationStatusData, ApplicationStatusVars>(
        CHECK_APPLICATION_STATUS,
        {
            variables: {
                jobId: id || '',
                applicantId: user?.id || '',
            },
            skip: !isAuthenticated || user?.role === 'recruiter' || !id || !user?.id,
        }
    );

    // Get saved jobs to check if this job is saved
    const { data: savedJobsData, refetch: refetchSavedJobs } = useQuery<SavedJobsData, SavedJobsVars>(
        GET_SAVED_JOBS,
        {
            variables: {
                userId: user?.id || '',
            },
            skip: !isAuthenticated || user?.role === 'recruiter' || !user?.id,
        }
    );

    // Delete mutation
    const [deleteJob, { loading: deleting }] = useMutation<DeleteJobResponse, DeleteJobVars>(
        DELETE_JOB_MUTATION
    );

    // Save/Unsave mutations
    const [saveJob, { loading: saving }] = useMutation<SaveJobResponse, SaveJobVars>(
        SAVE_JOB_MUTATION
    );
    const [unsaveJob, { loading: unsaving }] = useMutation<UnsaveJobResponse, SaveJobVars>(
        UNSAVE_JOB_MUTATION
    );

    // Check if user has applied
    const hasApplied = useMemo(() => {
        if (!applicationData?.applicationsByJob || !user?.id) return false;
        return applicationData.applicationsByJob.some(
            (app) => app.applicant.id === user.id
        );
    }, [applicationData, user]);

    // Check if job is saved
    const isSaved = useMemo(() => {
        if (!savedJobsData?.savedJobs || !user?.id) return false;
        return savedJobsData.savedJobs.some(
            (job) => job.id === id
        );
    }, [savedJobsData, id]);

    // Get application status if applied
    const applicationStatus = useMemo(() => {
        if (!applicationData?.applicationsByJob || !user?.id) return null;
        const app = applicationData.applicationsByJob.find(
            (app) => app.applicant.id === user.id
        );
        return app?.status || null;
    }, [applicationData, user]);

    // Handle save/unsave
    const handleSaveJob = async () => {
        if (!user?.id || !id) return;
        try {
            await saveJob({
                variables: {
                    userId: user.id,
                    jobId: id,
                },
            });
            toast.success('Job saved successfully! 🔖');
            await refetchSavedJobs();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to save job';
            toast.error(message);
        }
    };

    const handleUnsaveJob = async () => {
        if (!user?.id || !id) return;
        try {
            await unsaveJob({
                variables: {
                    userId: user.id,
                    jobId: id,
                },
            });
            toast.success('Job removed from saved!');
            await refetchSavedJobs();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to unsave job';
            toast.error(message);
        }
    };

    if (jobLoading) return <LoadingSpinner />;

    if (jobError) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-destructive">Failed to load job details: {jobError.message}</p>
                <Link to="/jobs" className="text-primary hover:underline">Back to jobs</Link>
            </div>
        );
    }

    if (!jobData?.job) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-muted-foreground">Job not found</p>
                <Link to="/jobs" className="text-primary hover:underline">Back to jobs</Link>
            </div>
        );
    }

    const job = jobData.job;
    const isRecruiter = user?.role === 'recruiter';
    const isJobOwner = user?.id === job.postedBy.id;

    const formatDate = (dateString: string) => {
        const date = new Date(parseInt(dateString));
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'full-time': 'bg-success/10 text-success border-success/20',
            'part-time': 'bg-info/10 text-info border-info/20',
            'remote': 'bg-primary/10 text-primary border-primary/20',
            'contract': 'bg-warning/10 text-warning border-warning/20',
            'internship': 'bg-destructive/10 text-destructive border-destructive/20',
        };
        return colors[type] || 'bg-muted/10 text-muted-foreground border-muted/20';
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'pending': 'bg-warning/10 text-warning border-warning/20',
            'reviewing': 'bg-info/10 text-info border-info/20',
            'shortlisted': 'bg-success/10 text-success border-success/20',
            'rejected': 'bg-destructive/10 text-destructive border-destructive/20',
            'hired': 'bg-primary/10 text-primary border-primary/20',
        };
        return colors[status] || 'bg-muted/10 text-muted-foreground border-muted/20';
    };

    const handleDelete = async () => {
        try {
            const { data } = await deleteJob({
                variables: { id: job.id },
            });
            if (data?.deleteJob) {
                setShowDeleteDialog(false);
                toast.success(`"${job.title}" has been deleted successfully!`);
                navigate('/dashboard');
            }
        } catch (error: unknown) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to delete job';
            toast.error(errorMsg);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link to="/jobs" className="text-primary hover:underline mb-4 inline-flex items-center gap-1">
                ← Back to Jobs
            </Link>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                            <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Building className="w-4 h-4" />
                                <span className="font-medium">{job.company}</span>
                            </div>
                        </div>
                        <Badge variant="outline" className={getTypeColor(job.type)}>
                            {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Job Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                        </div>

                        {job.salary && (job.salary.min || job.salary.max) && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <DollarSign className="w-4 h-4" />
                                <span>
                                    {job.salary.min && `$${job.salary.min}`}
                                    {job.salary.min && job.salary.max && ' - '}
                                    {job.salary.max && `$${job.salary.max}`}
                                    {job.salary.min && job.salary.max && ' / year'}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>Posted {formatDate(job.createdAt)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>Posted by {job.postedBy.name}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Job Description</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                    </div>

                    {/* Requirements */}
                    {job.requirements && job.requirements.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                            <ul className="list-disc list-inside space-y-1">
                                {job.requirements.map((req, index) => (
                                    <li key={index} className="text-muted-foreground">{req}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                        {isAuthenticated && !isRecruiter && (
                            <>
                                {hasApplied ? (
                                    <Button disabled className="bg-success/10 text-success hover:bg-success/20 border-success/20">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Applied
                                        {applicationStatus && (
                                            <Badge variant="outline" className={`ml-2 ${getStatusColor(applicationStatus)}`}>
                                                {applicationStatus.charAt(0).toUpperCase() + applicationStatus.slice(1)}
                                            </Badge>
                                        )}
                                    </Button>
                                ) : (
                                    <Button onClick={() => setShowApplyModal(true)}>
                                        <FileText className="w-4 h-4 mr-2" />
                                        Apply Now
                                    </Button>
                                )}

                                {/* Save/Unsave Button */}
                                {isSaved ? (
                                    <Button 
                                        variant="outline" 
                                        onClick={handleUnsaveJob}
                                        disabled={unsaving}
                                        className="text-primary border-primary hover:bg-primary/10"
                                    >
                                        <Bookmark className="w-4 h-4 mr-2 fill-current" />
                                        {unsaving ? 'Removing...' : 'Saved'}
                                    </Button>
                                ) : (
                                    <Button 
                                        variant="outline" 
                                        onClick={handleSaveJob}
                                        disabled={saving}
                                    >
                                        <Bookmark className="w-4 h-4 mr-2" />
                                        {saving ? 'Saving...' : 'Save Job'}
                                    </Button>
                                )}
                            </>
                        )}

                        {isAuthenticated && isRecruiter && isJobOwner && (
                            <>
                                <Link to={`/jobs/${job.id}/edit`}>
                                    <Button variant="outline">
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Job
                                    </Button>
                                </Link>
                                <Button 
                                    variant="destructive" 
                                    onClick={() => setShowDeleteDialog(true)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Job
                                </Button>
                            </>
                        )}

                        {!isAuthenticated && (
                            <div className="text-muted-foreground">
                                <Link to="/login" className="text-primary hover:underline">Login</Link> to apply for this job
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Apply Modal */}
            <ApplyToJobModal
                jobId={job.id}
                jobTitle={job.title}
                companyName={job.company}
                isOpen={showApplyModal}
                onClose={() => setShowApplyModal(false)}
                onSuccess={() => {
                    refetchApplications();
                }}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDelete}
                title="Delete Job"
                description={`Are you sure you want to delete "${job.title}"? This action cannot be undone. All applications for this job will also be deleted.`}
                confirmText="Yes, Delete Job"
                cancelText="Cancel"
                variant="destructive"
                isLoading={deleting}
            />
        </div>
    );
};

export default JobDetail;