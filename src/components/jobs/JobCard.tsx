import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, DollarSign, Calendar } from 'lucide-react';
import type { Job } from '../../graphql/queries/jobQueries';
import SaveJobButton from './SaveJobButton';

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onSaveToggle?: () => void;
}

const JobCard = ({ job, isSaved, onSaveToggle }: JobCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(parseInt(dateString));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'full-time': 'bg-success/10 text-success border-success/20',
      'part-time': 'bg-info/10 text-info border-info/20',
      'remote': 'bg-primary/10 text-primary border-primary/20',
      'contract': 'bg-warning/10 text-warning border-warning/20',
      'internship': 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return colors[type] || 'bg-muted/10 text-muted-foreground border-muted/20';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl hover:text-primary">
              <Link to={`/jobs/${job.id}`}>{job.title}</Link>
            </CardTitle>
            <p className="text-muted-foreground font-medium">{job.company}</p>
          </div>
          <SaveJobButton jobId={job.id} size="sm" showText={false} variant="ghost" />
        </div>
        <Badge variant="outline" className={getTypeColor(job.type)}>
          {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-muted-foreground line-clamp-2">{job.description}</p>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{job.location}</span>
          </div>
          {job.salary && (job.salary.min || job.salary.max) && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>
                {job.salary.min && `$${job.salary.min}`}
                {job.salary.min && job.salary.max && ' - '}
                {job.salary.max && `$${job.salary.max}`}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Posted {formatDate(job.createdAt)}</span>
          </div>
        </div>

        {job.requirements && job.requirements.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.requirements.slice(0, 3).map((req, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {req}
              </Badge>
            ))}
            {job.requirements.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{job.requirements.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Link to={`/jobs/${job.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default JobCard;