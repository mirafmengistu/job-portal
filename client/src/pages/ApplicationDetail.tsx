import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import {
  GET_APPLICATION,
  type GetApplicationData,
} from '../graphql/queries/applicationQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Calendar,
  FileText,
  User,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ArrowLeft,
} from 'lucide-react';
import type { ReactNode } from 'react';

const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { loading, error, data } = useQuery<GetApplicationData>(GET_APPLICATION, {
    variables: { id },
  });

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">Failed to load application: {error.message}</p>
        <Link to="/dashboard" className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!data?.application) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Application not found</p>
        <Link to="/dashboard" className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const application = data.application;
  const isRecruiter = user?.role === 'recruiter';

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewing: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      hired: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string): ReactNode => {
    const icons: Record<string, ReactNode> = {
      pending: <Clock className="h-5 w-5" />,
      reviewing: <Eye className="h-5 w-5" />,
      shortlisted: <CheckCircle className="h-5 w-5" />,
      rejected: <XCircle className="h-5 w-5" />,
      hired: <CheckCircle className="h-5 w-5" />,
    };
    return icons[status] || <Clock className="h-5 w-5" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(parseInt(dateString));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        to="/dashboard"
        className="text-blue-600 hover:underline mb-4 inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Application Details</CardTitle>
              <p className="text-gray-600">
                {isRecruiter ? 'Review candidate application' : 'Your application status'}
              </p>
            </div>
            <Badge className={`${getStatusColor(application.status)} text-base px-4 py-1`}>
              <span className="flex items-center gap-2">
                {getStatusIcon(application.status)}
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Position</h3>
            <Link
              to={`/jobs/${application.job.id}`}
              className="text-xl font-semibold hover:text-blue-600"
            >
              {application.job.title}
            </Link>
            <p className="text-gray-600">{application.job.company}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
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

          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              {isRecruiter ? 'Applicant' : 'Your Information'}
            </h3>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="font-medium">{application.applicant.name}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{application.applicant.email}</span>
            </div>
          </div>

          {application.coverLetter && (
            <div className="border-b pb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Cover Letter</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{application.coverLetter}</p>
            </div>
          )}


<div>
  <h3 className="text-sm font-medium text-gray-500 mb-2">Resume</h3>
  {application.resume ? (
    <a
      href={`https://docs.google.com/viewer?url=${encodeURIComponent(application.resume)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-blue-600 hover:underline"
    >
      <FileText className="h-4 w-4" />
      View Resume
    </a>
  ) : (
    <p className="text-gray-500 text-sm">No resume uploaded</p>
  )}
</div>

          <div className="text-sm text-gray-400 pt-4 border-t">
            Last updated: {formatDate(application.updatedAt)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationDetail;