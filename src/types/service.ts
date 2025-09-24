export interface Service {
  _id: string;
  title: string;
  description: string;
  image?: string;
  features: string[];
  category: string;
  order?: number;
  showOnHomePage?: boolean;
  createdAt: string;
  updatedAt: string;
  slug: string;
  sliderImage?: string[];
  showOnHeader?: boolean;
}

export interface ServiceFormData {
  title: string;
  description: string;
  category: string;
  features: string[];
  file: File | null;
  sliderImage: File[] | null;
  order?: number;
  showOnHomePage?: boolean;
  showOnHeader?: boolean;
}