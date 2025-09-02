export interface JobApplication {
  _id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl: string;
  coverLetter?: string;
  portfolioUrl?: string;
  additionalInfo?: string;
  status: 'Applied' | 'Reviewed' | 'Interviewed' | 'Offered' | 'Rejected';
  notes?: string;
  createdAt: string;
}

export const APPLICATION_STATUS = [
  'Applied',
  'Reviewed',
  'Interviewed',
  'Offered',
  'Rejected',
] as const;