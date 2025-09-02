export interface JobPost {
  _id: string;
  jobId: string;
  title: string;
  description: string;
  department?: string;
  location?: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Remote';
  salaryRange?: {
    min: number;
    max: number;
  };
  experienceRequired?: string;
  skills: string[];
  isActive: boolean;
  deadline?: string;
  createdAt: string;
}

export const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Internship',
  'Contract',
  'Remote',
] as const;