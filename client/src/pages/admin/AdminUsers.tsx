import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '../../context/AuthContext';
import {
    ADMIN_USERS_QUERY,
    ADMIN_UPDATE_USER_ROLE_MUTATION,
    ADMIN_TOGGLE_USER_ACTIVE_MUTATION,
    type AdminUsersQueryData,
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
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

const AdminUsers = () => {
    const { user } = useAuth();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [searchInput, setSearchInput] = useState('');

    const { data, loading, refetch } = useQuery<AdminUsersQueryData>(ADMIN_USERS_QUERY, {
        variables: {
            adminId: user?.id,
            page,
            limit: 10,
            search: search || undefined,
            role: roleFilter || undefined,
        },
        skip: !user?.id,
        fetchPolicy: 'network-only',
    });

    const [updateRole] = useMutation(ADMIN_UPDATE_USER_ROLE_MUTATION);
    const [toggleActive] = useMutation(ADMIN_TOGGLE_USER_ACTIVE_MUTATION);

    const users = data?.adminUsers?.users || [];
    const pageInfo = data?.adminUsers?.pageInfo;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!user?.id) return;
        try {
            await updateRole({
                variables: { adminId: user.id, userId, role: newRole },
            });
            toast.success('Role updated');
            refetch();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update role');
        }
    };

    const handleToggleActive = async (userId: string) => {
        if (!user?.id) return;
        try {
            await toggleActive({
                variables: { adminId: user.id, userId },
            });
            toast.success('User status updated');
            refetch();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update status');
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Users</h1>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
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
                    value={roleFilter || 'all'}
                    onValueChange={(val) => {
                        setRoleFilter(!val || val === 'all' ? '' : val);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All roles</SelectItem>
                        <SelectItem value="seeker">Seeker</SelectItem>
                        <SelectItem value="recruiter">Recruiter</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
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
                                            <th className="text-left p-4 font-medium">Name</th>
                                            <th className="text-left p-4 font-medium">Email</th>
                                            <th className="text-left p-4 font-medium">Role</th>
                                            <th className="text-left p-4 font-medium">Status</th>
                                            <th className="text-left p-4 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u.id} className="border-b border-border last:border-0">
                                                <td className="p-4 font-medium">{u.name}</td>
                                                <td className="p-4 text-muted-foreground">{u.email}</td>
                                                <td className="p-4">
                                                    <Select
                                                        value={u.role}
                                                        onValueChange={(val) => {
                                                            if (val) {
                                                                handleRoleChange(u.id, val);
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-[130px] h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="seeker">Seeker</SelectItem>
                                                            <SelectItem value="recruiter">Recruiter</SelectItem>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                                <td className="p-4">
                                                    <span
                                                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                            }`}
                                                    >
                                                        {u.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleActive(u.id)}
                                                        disabled={u.id === user?.id || u.role === 'admin'}
                                                    >
                                                        {u.isActive ? 'Deactivate' : 'Activate'}
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

export default AdminUsers;