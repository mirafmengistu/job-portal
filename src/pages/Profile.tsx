import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '../context/AuthContext';
import { GET_USER_PROFILE, type GetUserProfileData } from '../graphql/queries/userQueries';
import { UPDATE_USER_MUTATION, type UpdateUserMutationData } from '../graphql/mutations/userMutations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Mail,
  Briefcase,
  Calendar,
  Save,
  AlertCircle,
  CheckCircle,
  Edit,
} from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { loading, data, refetch } = useQuery<GetUserProfileData>(GET_USER_PROFILE, {
    variables: { id: user?.id },
    skip: !user?.id,
    fetchPolicy: 'network-only',
  });

  const [updateUser, { loading: updating }] = useMutation<UpdateUserMutationData>(
    UPDATE_USER_MUTATION
  );

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (data?.user) {
      setFormData({
        name: data.user.name || '',
        email: data.user.email || '',
      });
    }
  }, [data]);

  if (!user) return null;
  if (loading) return <LoadingSpinner />;

  if (!data?.user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  const profile = data.user;
  const isSeeker = profile.role === 'seeker';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const { data: result } = await updateUser({
        variables: {
          id: profile.id,
          name: formData.name,
          email: formData.email,
        },
      });

      if (result?.updateUser) {
        setSuccess(true);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
        refetch();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      toast.error(message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(parseInt(dateString));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: string) => {
    if (role === 'recruiter') {
      return <Badge className="bg-blue-100 text-blue-800">Recruiter</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Job Seeker</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-shrink-0">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6366f1&color=fff&size=128`}
                />
                <AvatarFallback className="text-2xl bg-indigo-100 text-indigo-600">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                {getRoleBadge(profile.role)}
              </div>
              <div className="flex flex-wrap gap-4 mt-2 text-gray-600">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(profile.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{isSeeker ? 'Job Seeker' : 'Recruiter'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={updating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={updating}
                />
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
                    Profile updated successfully!
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={updating}>
                  <Save className="h-4 w-4 mr-2" />
                  {updating ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: profile.name,
                      email: profile.email,
                    });
                  }}
                  disabled={updating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {isSeeker && <TabsTrigger value="applications">Applications</TabsTrigger>}
          {!isSeeker && <TabsTrigger value="jobs">My Jobs</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Account Type</span>
                <span className="font-medium">{isSeeker ? 'Job Seeker' : 'Recruiter'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Email</span>
                <span className="font-medium">{profile.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium">{formatDate(profile.createdAt)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Status</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isSeeker && (
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">My Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  <Link to="/dashboard" className="text-blue-600 hover:underline">
                    View all applications in Dashboard
                  </Link>
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {!isSeeker && (
          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">My Job Postings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  <Link to="/dashboard" className="text-blue-600 hover:underline">
                    View all jobs in Dashboard
                  </Link>
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Profile;