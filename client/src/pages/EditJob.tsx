import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_JOB_QUERY, type GetJobQueryData } from '../graphql/queries/jobQueries';
import { UPDATE_JOB_MUTATION, type UpdateJobInput } from '../graphql/mutations/jobMutations';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { AlertCircle, CheckCircle, ArrowLeft, Save } from 'lucide-react';

const EditJob = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState<UpdateJobInput>({
        id: id || '',
        title: '',
        company: '',
        description: '',
        location: '',
        type: '',
        salary: {
            min: '',
            max: '',
        },
        requirements: [],
        isActive: true,
    });
    const [requirementsInput, setRequirementsInput] = useState('');

    const { loading: jobLoading, data: jobData } = useQuery<GetJobQueryData>(GET_JOB_QUERY, {
        variables: { id },
        fetchPolicy: 'network-only',
    });

    const [updateJob, { loading: updating }] = useMutation<{ updateJob: { id: string } }>(
        UPDATE_JOB_MUTATION
    );

    useEffect(() => {
        if (jobData?.job) {
            const job = jobData.job;
            setFormData({
                id: job.id,
                title: job.title,
                company: job.company,
                description: job.description,
                location: job.location,
                type: job.type,
                salary: {
                    min: job.salary?.min || '',
                    max: job.salary?.max || '',
                },
                requirements: job.requirements || [],
                isActive: job.isActive,
            });
            setRequirementsInput((job.requirements || []).join(', '));
        }
    }, [jobData]);

    if (jobLoading) return <LoadingSpinner />;

    if (!jobData?.job) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-gray-500">Job not found</p>
                <Link to="/dashboard" className="text-blue-600 hover:underline">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    if (user?.id !== jobData.job.postedBy.id) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
                <p className="text-gray-600">You don't have permission to edit this job.</p>
                <Link to="/dashboard" className="text-blue-600 hover:underline">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        const requirementsList = requirementsInput
            .split(',')
            .map((req) => req.trim())
            .filter(Boolean);

        try {
            const { data } = await updateJob({
                variables: {
                    id: formData.id,
                    title: formData.title,
                    company: formData.company,
                    description: formData.description,
                    location: formData.location,
                    type: formData.type,
                    salary: {
                        min: formData.salary?.min,
                        max: formData.salary?.max,
                    },
                    requirements: requirementsList,
                    isActive: formData.isActive,
                },
            });

            if (data?.updateJob) {
                setSuccess(true);
                setTimeout(() => {
                    navigate(`/jobs/${data.updateJob.id}`);
                }, 1500);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update job';
            setError(message);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="mb-6">
                <Link
                    to={`/jobs/${id}`}
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Job Details
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Edit Job</CardTitle>
                    <p className="text-gray-600">Update your job listing details</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Job Title *</Label>
                            <Input
                                id="title"
                                placeholder="e.g. Senior React Developer"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                disabled={updating}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company">Company Name *</Label>
                            <Input
                                id="company"
                                placeholder="e.g. Google"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                required
                                disabled={updating}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location *</Label>
                            <Input
                                id="location"
                                placeholder="e.g. Remote, New York, London"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                required
                                disabled={updating}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Job Type *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => {
                                    if (value) setFormData({ ...formData, type: value });
                                }}
                                disabled={updating}
                            >
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Select job type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full-time">Full Time</SelectItem>
                                    <SelectItem value="part-time">Part Time</SelectItem>
                                    <SelectItem value="remote">Remote</SelectItem>
                                    <SelectItem value="contract">Contract</SelectItem>
                                    <SelectItem value="internship">Internship</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="minSalary">Min Salary (USD)</Label>
                                <Input
                                    id="minSalary"
                                    type="number"
                                    placeholder="e.g. 50000"
                                    value={formData.salary?.min}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            salary: { ...formData.salary, min: e.target.value },
                                        })
                                    }
                                    disabled={updating}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxSalary">Max Salary (USD)</Label>
                                <Input
                                    id="maxSalary"
                                    type="number"
                                    placeholder="e.g. 80000"
                                    value={formData.salary?.max}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            salary: { ...formData.salary, max: e.target.value },
                                        })
                                    }
                                    disabled={updating}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Job Description *</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe the role, responsibilities, and what makes this position great..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={6}
                                required
                                disabled={updating}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="requirements">Requirements / Skills</Label>
                            <Input
                                id="requirements"
                                placeholder="e.g. React, Node.js, TypeScript (comma separated)"
                                value={requirementsInput}
                                onChange={(e) => setRequirementsInput(e.target.value)}
                                disabled={updating}
                            />
                            <p className="text-sm text-gray-500">
                                Separate skills with commas (e.g. React, Node.js, MongoDB)
                            </p>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, isActive: checked as boolean })
                                }
                                disabled={updating}
                            />
                            <Label htmlFor="isActive" className="text-sm font-normal">
                                Job is active (visible to job seekers)
                            </Label>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className="bg-green-50 border-green-200">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-600">
                                    Job updated successfully! Redirecting...
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" className="flex-1" disabled={updating}>
                                <Save className="h-4 w-4 mr-2" />
                                {updating ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(`/jobs/${id}`)}
                                disabled={updating}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EditJob;