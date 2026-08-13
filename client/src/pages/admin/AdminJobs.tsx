import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '../../context/AuthContext';
import {
    ADMIN_JOBS_QUERY,
    ADMIN_TOGGLE_JOB_ACTIVE_MUTATION,
    ADMIN_DELETE_JOB_MUTATION,
    type AdminJobsQueryData,
} from '../../graphql/mutations/adminMutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminJobs = () => {
    const { user } = useAuth();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [activeFilter, setActiveFilter] = useState<string>('');

    const { data, loading, refetch } = useQuery<AdminJobsQueryData>(ADMIN_JOBS_QUERY, {
        variables: {
            adminId: user?.id,
            page,
            limit: 10,
            search: search || undefined,
            isActive: activeFilter === '' ? undefined : activeFilter === 'true',
        },
        skip: !user?.id,
        fetchPolicy: 'network-only',
    });

    const [toggleJob] = useMutation(ADMIN_TOGGLE_JOB_ACTIVE_MUTATION);
    const [deleteJob] = useMutation(ADMIN_DELETE_JOB_MUTATION);

    const jobs = data?.adminJobs?.jobs || [];
    const pageInfo = data?.adminJobs?.pageInfo;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleToggle = async (jobId: string) => {
        if (!user?.id) return;
        try {
            await toggleJob({ variables: { adminId: user.id, jobId } });
            toast.success('Job status updated');
            refetch();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update job');
        }
    };

    const handleDelete = async (jobId: string, title: string) => {
        if (!user?.id) return;
        if (!confirm(`Delete job "${title}"? This cannot be undone.`)) return;

        try {
            await deleteJob({ variables: { adminId: user.id, jobId } });
            toast.success('Job deleted');
            refetch();
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete job');
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Jobs</h1>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by title or company..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button type="submit" variant="secondary">
                        Search
                    </Button>
                </form>

                <Select
                    value={activeFilter || 'all'}
                    onValueChange={(val) => {
                        setActiveFilter(!val || val === 'all' ? '' : val);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="All jobs" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All jobs</SelectItem>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <>
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/40">
                                            <th className="text-left p-4 font-medium">Title</th>
                                            <th className="text-left p-4 font-medium">Company</th>
                                            <th className="text-left p-4 font-medium">Posted by</th>
                                            <th className="text-left p-4 font-medium">Status</th>
                                            <th className="text-left p-4 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {jobs.map((job) => (
                                            <tr key={job.id} className="border-b border-border last:border-0">
                                                <td className="p-4 font-medium">{job.title}</td>
                                                <td className="p-4 text-muted-foreground">{job.company}</td>
                                                <td className="p-4 text-muted-foreground">
                                                    {job.postedBy?.name || '—'}
                                                </td>
                                                <td className="p-4">
                                                    <span
                                                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${job.isActive
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                            }`}
                                                    >
                                                        {job.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="p-4 flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggle(job.id)}
                                                    >
                                                        {job.isActive ? 'Deactivate' : 'Activate'}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(job.id, job.title)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {pageInfo && pageInfo.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!pageInfo.hasPreviousPage}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {pageInfo.currentPage} of {pageInfo.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!pageInfo.hasNextPage}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminJobs;