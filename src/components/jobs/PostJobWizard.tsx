import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import { useAuth } from '../../context/AuthContext';
import { CREATE_JOB_MUTATION, type CreateJobInput } from '../../graphql/mutations/jobMutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  FileText,
  Briefcase,
  DollarSign,
  MapPin,
  Sparkles,
} from 'lucide-react';

type StepProps = {
  formData: CreateJobInput;
  setFormData: React.Dispatch<React.SetStateAction<CreateJobInput>>;
  onNext?: () => void;
  onPrev?: () => void;
  onSubmit?: () => Promise<void>;
  loading?: boolean;
};

const Step1Details = ({ formData, setFormData, onNext }: StepProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Job Title *
        </Label>
        <Input
          id="title"
          placeholder="e.g. Senior React Developer"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="h-12 text-base"
          required
        />
        <p className="text-xs text-gray-500">
          Be specific with the role title for better search results
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company" className="text-sm font-medium">
          Company Name *
        </Label>
        <Input
          id="company"
          placeholder="e.g. Google"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="h-12 text-base"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">
            Category
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) => {
              if (value) setFormData({ ...formData, category: value });
            }}
          >
            <SelectTrigger className="h-12" id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type" className="text-sm font-medium">
            Job Type *
          </Label>
          <Select
            value={formData.type}
            onValueChange={(value) => {
              if (value) setFormData({ ...formData, type: value });
            }}
          >
            <SelectTrigger className="h-12" id="type">
              <SelectValue placeholder="Select type" />
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm font-medium">
          Location *
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <Input
            id="location"
            placeholder="e.g. Remote, New York, London"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="pl-10 h-12 text-base"
            required
          />
        </div>
        <p className="text-xs text-gray-500">
          Adding a specific location helps candidates find your job
        </p>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} className="h-12 px-8">
          Next Step
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const Step2Requirements = ({ formData, setFormData, onPrev, onNext }: StepProps) => {
  const [requirementsInput, setRequirementsInput] = useState(
    formData.requirements?.join(', ') || ''
  );
  const [experienceLevel, setExperienceLevel] = useState('mid-level');

  const handleRequirementsChange = (value: string) => {
    setRequirementsInput(value);
    const requirementsList = value
      .split(',')
      .map((req) => req.trim())
      .filter(Boolean);
    setFormData({ ...formData, requirements: requirementsList });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Job Description *
        </Label>
        <Textarea
          id="description"
          placeholder="Describe the role, responsibilities, and what makes this position great..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={8}
          className="text-base"
          required
        />
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Experience Level</Label>
        <div className="grid grid-cols-3 gap-3">
          {(['entry', 'mid-level', 'senior'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setExperienceLevel(level)}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                experienceLevel === level
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium capitalize">{level.replace('-', ' ')}</div>
              <div className="text-xs text-gray-500">
                {level === 'entry' && '0-2 years'}
                {level === 'mid-level' && '3-5 years'}
                {level === 'senior' && '5+ years'}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements" className="text-sm font-medium">
          Skills & Requirements
        </Label>
        <Input
          id="requirements"
          placeholder="e.g. React, Node.js, TypeScript, MongoDB"
          value={requirementsInput}
          onChange={(e) => handleRequirementsChange(e.target.value)}
          className="h-12 text-base"
        />
        <p className="text-xs text-gray-500">Separate skills with commas</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minSalary" className="text-sm font-medium">
            Min Salary (Monthly)
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <Input
              id="minSalary"
              type="number"
              placeholder="e.g. 5000"
              value={formData.salary?.min || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  salary: { ...formData.salary, min: e.target.value },
                })
              }
              className="pl-10 h-12"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxSalary" className="text-sm font-medium">
            Max Salary (Monthly)
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <Input
              id="maxSalary"
              type="number"
              placeholder="e.g. 8000"
              value={formData.salary?.max || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  salary: { ...formData.salary, max: e.target.value },
                })
              }
              className="pl-10 h-12"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="confidential" />
        <Label htmlFor="confidential" className="text-sm text-gray-600">
          Keep salary confidential
        </Label>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onPrev} className="h-12 px-8">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} className="h-12 px-8 flex-1">
          Next Step
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const Step3Review = ({ formData, onPrev, onSubmit, loading }: StepProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePublish = async () => {
    if (!onSubmit) return;
    setIsSubmitting(true);
    await onSubmit();
    setIsSubmitting(false);
  };

  const busy = isSubmitting || loading;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="border-2">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold">{formData.title}</h3>
                  <p className="text-lg text-gray-600">{formData.company}</p>
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                  {formData.type}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {formData.location}
                </div>
                {(formData.salary?.min || formData.salary?.max) && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {formData.salary?.min && `$${formData.salary.min}`}
                    {formData.salary?.min && formData.salary?.max && ' - '}
                    {formData.salary?.max && `$${formData.salary.max}`}
                    / month
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {formData.category || 'Technology'}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-600 text-sm whitespace-pre-wrap line-clamp-3">
                  {formData.description}
                </p>
              </div>

              {formData.requirements && formData.requirements.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Requirements</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.requirements.map((req: string, index: number) => (
                      <span
                        key={index}
                        className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-600">Expected Reach</h4>
              </div>
              <div className="text-2xl font-bold text-blue-600">5,000+</div>
              <p className="text-sm text-gray-600">Professionals will see this job</p>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Visibility</span>
                  <span className="font-medium text-green-600">Public</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium text-blue-600">Ready to publish</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onPrev} className="h-12 px-8" disabled={busy}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button variant="outline" className="h-12 px-8 flex-1" disabled>
          <FileText className="mr-2 h-4 w-4" />
          Save as Draft
        </Button>
        <Button
          onClick={handlePublish}
          className="h-12 px-8 flex-1 bg-blue-600 hover:bg-blue-700"
          disabled={busy}
        >
          {busy ? (
            'Publishing...'
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Publish Job
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const PostJobWizard = () => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState<CreateJobInput>({
    title: '',
    company: '',
    description: '',
    location: '',
    type: 'full-time',
    category: 'technology',
    salary: {
      min: '',
      max: '',
    },
    requirements: [],
    postedBy: user?.id || '',
  });

  const [createJob, { loading }] = useMutation<{ createJob: { id: string } }>(
    CREATE_JOB_MUTATION
  );

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setError('');
    try {
      const { data } = await createJob({
        variables: formData,
      });

      if (data?.createJob) {
        navigate(`/jobs/${data.createJob.id}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to post job';
      setError(message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Post a New Job</h1>
        <p className="text-gray-600">
          Step {step} of {totalSteps}
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between mb-2 text-sm text-gray-500">
          <span className={step >= 1 ? 'text-blue-600 font-medium' : ''}>Details</span>
          <span className={step >= 2 ? 'text-blue-600 font-medium' : ''}>Requirements</span>
          <span className={step >= 3 ? 'text-blue-600 font-medium' : ''}>Review</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {step === 1 && (
        <Step1Details formData={formData} setFormData={setFormData} onNext={handleNext} />
      )}

      {step === 2 && (
        <Step2Requirements
          formData={formData}
          setFormData={setFormData}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}

      {step === 3 && (
        <Step3Review
          formData={formData}
          setFormData={setFormData}
          onPrev={handlePrev}
          onSubmit={handleSubmit}
          loading={loading}
        />
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PostJobWizard;