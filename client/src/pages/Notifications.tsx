import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '../context/AuthContext';
import {
  MY_NOTIFICATIONS_QUERY,
  MARK_NOTIFICATION_AS_READ_MUTATION,
  MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION,
  type MyNotificationsQueryData,
  type MarkNotificationAsReadMutationData,
  type MarkAllNotificationsAsReadMutationData,
} from '../graphql/mutations/notificationMutations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const Notifications = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, loading, error, refetch } = useQuery<MyNotificationsQueryData>(
    MY_NOTIFICATIONS_QUERY,
    {
      variables: { userId: user?.id, page, limit },
      skip: !user?.id,
      fetchPolicy: 'network-only',
    }
  );

  const [markAsRead] = useMutation<MarkNotificationAsReadMutationData>(
    MARK_NOTIFICATION_AS_READ_MUTATION
  );

  const [markAllAsRead, { loading: markingAll }] = useMutation<MarkAllNotificationsAsReadMutationData>(
    MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION
  );

  const notifications = data?.myNotifications?.notifications || [];
  const pageInfo = data?.myNotifications?.pageInfo;

  const handleMarkAsRead = async (id: string) => {
    if (!user?.id) return;
    try {
      await markAsRead({
        variables: { id, userId: user.id },
      });
      refetch();
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await markAllAsRead({
        variables: { userId: user.id },
      });
      toast.success('All notifications marked as read');
      refetch();
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Please log in to view notifications.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
          >
            {markingAll ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCheck className="w-4 h-4 mr-2" />
            )}
            Mark all as read
          </Button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-destructive">
          Failed to load notifications.
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p>No notifications yet.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`transition-colors ${
              !notification.isRead ? 'border-primary/40 bg-primary/5' : ''
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-base font-semibold leading-snug">
                  {notification.title}
                </CardTitle>
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-xs"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    Mark as read
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {notification.message}
              </p>
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <span>
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
                {notification.relatedApplication && (
                  <Link
                    to={`/applications/${notification.relatedApplication.id}`}
                    className="text-primary hover:underline"
                  >
                    View application
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pageInfo && pageInfo.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
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
    </div>
  );
};

export default Notifications;