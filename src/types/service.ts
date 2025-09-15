export interface Service {
  _id: string;
  title: string;
  description: string;
  image?: string;
  features: string[];
  category: string;
  order?: number;
  createdAt: string;
}

export interface ServiceFormData {
  title: string;
  description: string;
  category: string;
  features: string[];
  file: File | null;
}