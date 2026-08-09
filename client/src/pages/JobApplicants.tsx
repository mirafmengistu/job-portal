import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import {
    GET_APPLICATIONS_BY_JOB,
    type GetApplicationsByJobData,
} from '../graphql/queries/applicationQueries';
import { UPDATE_APPLICATION_STATUS_MUTATION } from '../graphql/mutations/applicationMutations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
    MapPin,
    Calendar,
    User,
    Mail,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    ArrowLeft,
    Users,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Define the status update mutation response type
interface UpdateStatusResponse {
    updateApplicationStatus: {
        id: string;
        status: string;
    };
}

interface UpdateStatusVariables {
    id: string;
    status: string;
}

const JobApplicants = () => {
    const { id } = useParams<{ id: string }>();
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const { loading, error, data, refetch } = useQuery<GetApplicationsByJobData>(
        GET_APPLICATIONS_BY_JOB,
        {
            variables: { jobId: id },
            fetchPolicy: 'network-only',
        }
    );

    const [updateStatus, { loading: updating }] = useMutation<
        UpdateStatusResponse,
        UpdateStatusVariables
    >(UPDATE_APPLICATION_STATUS_MUTATION);

    if (loading) return <LoadingSpinner />;

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-destructive">Failed to load applicants: {error.message}</p>
                <Link to="/dashboard" className="text-primary hover:underline">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    const applications = data?.applicationsByJob || [];
    const job = applications[0]?.job;

    const filteredApplications =
        selectedStatus === 'all'
            ? applications
            : applications.filter((app) => app.status === selectedStatus);

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
            hired: <CheckCircle className="h-4 w-4" />,
        };
        return icons[status] || <Clock className="h-4 w-4" />;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(parseInt(dateString));
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
        setSuccessMessage('');
        setErrorMessage('');

        try {
            await updateStatus({
                variables: {
                    id: applicationId,
                    status: newStatus,
                },
            });
            setSuccessMessage('Application status updated successfully!');
            refetch();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update status';
            setErrorMessage(message);
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'reviewing', label: 'Reviewing' },
        { value: 'shortlisted', label: 'Shortlisted' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'hired', label: 'Hired' },
    ];

    const statusCounts = applications.reduce(
        (acc, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-6">
                <Link
                    to="/dashboard"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
            </div>

            {job && (
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">{job.title}</h1>
                    <p className="text-muted-foreground">{job.company}</p>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{applications.length} applicants</span>
                        </div>
                    </div>
                </div>
            )}

            {successMessage && (
                <Alert className="bg-success/10 border-success/20 text-success mb-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
            )}
            {errorMessage && (
                <Alert variant="destructive" className="mb-4">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                            <Select
                                value={selectedStatus}
                                onValueChange={(value) => setSelectedStatus(value ?? 'all')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Applicants ({applications.length})
                                    </SelectItem>
                                    {statusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label} ({statusCounts[option.value] || 0})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Showing {filteredApplications.length} of {applications.length} applicants
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Applicants</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredApplications.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground">No applicants found</h3>
                            <p className="text-muted-foreground/70">No one has applied to this job yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredApplications.map((application) => (
                                <div
                                    key={application.id}
                                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-wrap justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <User className="h-5 w-5 text-muted-foreground" />
                                                <h4 className="font-semibold text-lg">
                                                    {application.applicant.name}
                                                </h4>
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                                <Mail className="h-4 w-4" />
                                                <span>{application.applicant.email}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
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
                                                    {application.status.charAt(0).toUpperCase() +
                                                        application.status.slice(1)}
                                                </span>
                                            </Badge>

                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <Select
                                                    value={application.status}
                                                    onValueChange={(value) => {
                                                        if (value) handleStatusUpdate(application.id, value);
                                                    }}
                                                    disabled={updating}
                                                >
                                                    <SelectTrigger className="w-[140px] h-8 text-sm">
                                                        <SelectValue placeholder="Update status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {statusOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                {application.resume && (
                                                    <a
                                                        href={application.resume}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                        Resume
                                                    </a>
                                                )}

                                                <Link to={`/applications/${application.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Details
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {application.coverLetter && (
                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                <span className="font-medium">Cover Letter:</span>{' '}
                                                {application.coverLetter}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default JobApplicants;