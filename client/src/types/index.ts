export interface User {
  id: string;
  name: string;
  email: string;
  role: 'seeker' | 'recruiter';
  createdAt: string;
}

export interface CreateJobInput {
  title: string;
  company: string;
  description: string;
  location: string;
  type: string;
  category?: string;
  salary?: {
    min?: string;
    max?: string;
  };
  requirements: string[];
  postedBy: string;
}