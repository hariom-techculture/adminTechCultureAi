export interface Project {
  _id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  location?: string;
  technologies: string[];
  status: 'ongoing' | 'completed';
  createdAt: string;
}

export interface ProjectFormData {
  title: string;
  description: string;
  category: string;
  location: string;
  technologies: string[];
  status: 'ongoing' | 'completed';
  file?: File | null;
}