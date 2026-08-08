import { Link } from 'react-router-dom';
import PostJobWizard from '../components/jobs/PostJobWizard';
import { useAuth } from '../context/AuthContext';

const PostJob = () => {
  const { user } = useAuth();

  if (user?.role !== 'recruiter') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-4">Only recruiters can post jobs.</p>
        <Link to="/dashboard" className="text-blue-600 hover:underline">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PostJobWizard />
    </div>
  );
};

export default PostJob;