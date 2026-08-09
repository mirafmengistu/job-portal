import { useState, useRef } from 'react';
import { useMutation } from '@apollo/client/react';
import { useAuth } from '../../context/AuthContext';
import { APPLY_TO_JOB_MUTATION, type ApplyToJobInput } from '../../graphql/mutations/applicationMutations';
import { uploadResume } from '../../services/uploadService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, FileText, X, Loader2 } from 'lucide-react';

// Define the mutation response type
interface ApplyToJobResponse {
  applyToJob: {
    id: string;
    jobId: string;
    applicantId: string;
    status: string;
    createdAt: string;
  };
}

interface ApplyToJobModalProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ApplyToJobModal = ({
  jobId,
  jobTitle,
  companyName,
  isOpen,
  onClose,
  onSuccess,
}: ApplyToJobModalProps) => {
  const { user, token } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [applyToJob, { loading }] = useMutation<ApplyToJobResponse, ApplyToJobInput>(
    APPLY_TO_JOB_MUTATION
  );

  // Allowed file types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
  ];

  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file type
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF, DOC, DOCX, TXT, or MD file');
      setFile(null);
      return;
    }

    // Check file size
    if (selectedFile.size > maxFileSize) {
      setError('File size must be less than 5MB');
      setFile(null);
      return;
    }

    setError('');
    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!file) {
      setError('Please upload your resume/CV');
      return;
    }

    if (!token) {
      setError('You must be logged in to apply');
      return;
    }

    setUploading(true);

    try {
      // Step 1: Upload file to Cloudinary via backend
      const uploadResult = await uploadResume(file, token);

      // Step 2: Submit application with Cloudinary URL
      const input: ApplyToJobInput = {
        jobId,
        applicantId: user?.id || '',
        coverLetter,
        resume: uploadResult.url, // Cloudinary URL
      };

      const { data } = await applyToJob({
        variables: input,
      });

      if (data?.applyToJob) {
        setSuccess(true);
        setUploading(false);
        setTimeout(() => {
          onSuccess();
          onClose();
          // Reset form
          setFile(null);
          setCoverLetter('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 1500);
      }
    } catch (err: unknown) {
      setUploading(false);
      const message = err instanceof Error ? err.message : 'Failed to apply. Please try again.';
      setError(message);
    }
  };

  const isSubmitting = loading || uploading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Apply for {jobTitle}</DialogTitle>
          <DialogDescription>at {companyName}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="resume">Resume / CV *</Label>
            <div className="relative">
              <Input
                id="resume"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                accept=".pdf,.doc,.docx,.txt,.md"
                disabled={isSubmitting}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              PDF, DOC, DOCX, TXT, or MD (Max 5MB)
            </p>

            {/* File Preview */}
            {file && (
              <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md border border-border">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  disabled={isSubmitting}
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
            <Textarea
              id="coverLetter"
              placeholder="Why are you interested in this position? What makes you a great fit?"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-success/10 border-success/20 text-success">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Application submitted successfully! 🎉
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !file}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploading ? 'Uploading...' : 'Submitting...'}
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyToJobModal;