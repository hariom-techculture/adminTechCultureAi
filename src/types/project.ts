export interface Project {
  _id: string;
  title: string;
  description: string;
  image: string;
  portfolioImages?: string[];
  category: {
    _id: string;
    name: string;
    image: string;
  };
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