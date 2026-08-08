import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  MapPin,
  Briefcase,
  Users,
  Building,
  Award,
  ArrowRight,
  Star,
  Clock,
  Sparkles,
  Shield,
  Zap,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { GET_JOBS_QUERY, GET_STATS_QUERY, type GetJobsQueryData, type GetStatsQueryData } from '../graphql/queries/jobQueries';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');

  // Fetch featured jobs (latest 6)
  const { loading: jobsLoading, data: jobsData } = useQuery<GetJobsQueryData>(GET_JOBS_QUERY, {
    variables: { search: '', location: '', type: '' },
    fetchPolicy: 'cache-first',
  });

  // Fetch stats
  const { loading: statsLoading, data: statsData } = useQuery<GetStatsQueryData>(GET_STATS_QUERY, {
    fetchPolicy: 'cache-first',
  });

  const featuredJobs = jobsData?.jobs?.slice(0, 6) || [];
  const stats = statsData?.jobsStats;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (location) params.append('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  const features = [
    {
      title: 'Smart Job Matching',
      description: 'AI-powered recommendations tailored precisely to your unique skill set.',
      icon: Sparkles,
    },
    {
      title: 'One-Click Apply',
      description: 'Skip repetitive forms and apply instantly using your verified candidate profile.',
      icon: Zap,
    },
    {
      title: 'Real-Time Tracking',
      description: 'Get immediate status alerts as soon as employers review your application.',
      icon: Clock,
    },
    {
      title: 'Verified Employers',
      description: 'Connect safely with vetted companies and transparent hiring workflows.',
      icon: Shield,
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      company: 'Google',
      content: 'Found my dream role within two weeks. The platform streamlined everything from discovery to interview.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Product Manager',
      company: 'Microsoft',
      content: 'The role recommendations were exceptionally accurate. I landed interviews at top tech companies seamlessly.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'UX Designer',
      company: 'Figma',
      content: 'A wonderfully clean interface and efficient workflow tracker. An absolute game-changer for job seekers.',
      rating: 5,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden border-b border-border bg-gradient-to-b from-muted/50 via-background to-background">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full text-sm font-medium border-primary/30 bg-primary/5 text-primary gap-2">
              <Sparkles className="w-4 h-4" />
              <span>{stats?.totalApplications || '10k+'}+ Successful Placements Made</span>
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              Discover Your Next <span className="text-primary bg-clip-text">Big Career Move</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore verified opportunities from world-class tech companies, startups, and remote-first organizations.
            </p>

            {/* Modern Search Bar */}
            <form onSubmit={handleSearch} className="bg-card border border-border rounded-2xl p-2 shadow-xl shadow-black/5 flex flex-col md:flex-row gap-2 mt-8">
              <div className="flex-1 relative flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Job title, keywords, or company"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 border-0 focus-visible:ring-0 text-base bg-transparent shadow-none"
                />
              </div>
              <div className="hidden md:block w-px bg-border my-2" />
              <div className="flex-1 relative flex items-center">
                <MapPin className="absolute left-4 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="City, state, or remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-12 h-14 border-0 focus-visible:ring-0 text-base bg-transparent shadow-none"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-8 rounded-xl font-medium text-base">
                Search Jobs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>

            {/* Popular Searches */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Trending:</span>
              {['React', 'Remote', 'Product Manager', 'UX Designer', 'Node.js'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearchTerm(tag)}
                  className="px-3 py-1 rounded-full bg-secondary/60 hover:bg-secondary text-secondary-foreground transition-colors text-xs font-medium"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-5xl mx-auto">
            {[
              { label: 'Active Jobs', value: stats?.totalJobs || '0', suffix: '+', icon: Briefcase },
              { label: 'Companies', value: stats?.totalCompanies || '0', suffix: '+', icon: Building },
              { label: 'Job Seekers', value: stats?.totalUsers || '0', suffix: '+', icon: Users },
              { label: 'Placements', value: stats?.totalApplications || '0', suffix: '+', icon: Award },
            ].map((stat, idx) => (
              <Card key={idx} className="border-border/60 bg-card/50 backdrop-blur-sm shadow-sm hover:border-primary/40 transition-all">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold tracking-tight">{stat.value}{stat.suffix}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Featured Opportunities</h2>
              <p className="text-muted-foreground mt-1">Handpicked vacancies from high-growth companies</p>
            </div>
            <Link to="/jobs">
              <Button variant="outline" className="gap-2">
                Browse All Jobs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {jobsLoading ? (
            <div className="py-20">
              <LoadingSpinner />
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-2xl">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">No open positions available right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <Card key={job.id} className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg flex flex-col justify-between">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                          <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                        </h3>
                        <p className="text-sm font-medium text-muted-foreground">{job.company}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-xs font-medium">
                        {job.type}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="line-clamp-1">{job.location}</span>
                      </div>
                      {job.salary && (job.salary.min || job.salary.max) && (
                        <div className="flex items-center gap-2 font-medium text-foreground">
                          <Briefcase className="h-4 w-4 shrink-0 text-primary" />
                          <span>
                            {job.salary.min && `$${job.salary.min.toLocaleString()}`}
                            {job.salary.min && job.salary.max && ' - '}
                            {job.salary.max && `$${job.salary.max.toLocaleString()}`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <Link to={`/jobs/${job.id}`} className="block">
                        <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 border-t border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Why Professionals Choose Us</h2>
            <p className="text-muted-foreground">Designed to cut through the noise and land you where you belong.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-card p-6 rounded-2xl border border-border/60 shadow-sm space-y-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Success Stories</h2>
            <p className="text-muted-foreground">Hear from candidates who secured their ideal roles through our platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border/60 shadow-sm">
                <CardContent className="p-8 flex flex-col justify-between h-full space-y-6">
                  <div className="space-y-4">
                    <div className="flex gap-1 text-amber-500">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground text-sm italic leading-relaxed">"{testimonial.content}"</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role} at <span className="font-medium text-foreground">{testimonial.company}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center max-w-3xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready to Accelerate Your Career?</h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto text-base">
            Join thousands of modern tech professionals who found their next career chapter here.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="px-8 font-medium">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/jobs">
              <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground hover:text-primary px-8 font-medium">
                Browse All Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;