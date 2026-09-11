import { useQuery } from '@apollo/client/react';
import { useAuth } from '../../context/AuthContext';
import {
  ADMIN_STATS_QUERY,
  type AdminStatsQueryData,
} from '../../graphql/mutations/adminMutations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, FileText, UserCheck} from 'lucide-react';
import { Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();

  const { data, loading, error } = useQuery<AdminStatsQueryData>(ADMIN_STATS_QUERY, {
    variables: { adminId: user?.id },
    skip: !user?.id,
    fetchPolicy: 'network-only',
  });

  const stats = data?.adminStats;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-destructive">
        Failed to load stats: {error.message}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      description: `${stats?.totalSeekers ?? 0} seekers · ${stats?.totalRecruiters ?? 0} recruiters`,
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers ?? 0,
      icon: UserCheck,
      description: `${stats?.inactiveUsers ?? 0} inactive`,
    },
    {
      title: 'Total Jobs',
      value: stats?.totalJobs ?? 0,
      icon: Briefcase,
      description: `${stats?.activeJobs ?? 0} active · ${stats?.inactiveJobs ?? 0} inactive`,
    },
    {
      title: 'Applications',
      value: stats?.totalApplications ?? 0,
      icon: FileText,
      description: 'All time applications',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;