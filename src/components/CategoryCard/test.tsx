import Image from 'next/image';
import { Category } from '@/types/category';

interface CategoryCardProps {
  category: Category;
  onClick: (category: Category) => void;
  projectCount: number;
}

export const CategoryCard = ({ category, onClick, projectCount }: CategoryCardProps) => {
  return (
    <div
      className="cursor-pointer overflow-hidden rounded-lg border border-stroke bg-white shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.02] dark:border-strokedark dark:bg-boxdark"
      onClick={() => onClick(category)}
    >
      <div className="relative aspect-video">
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
          {category.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {category.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-primary">
            {projectCount} {projectCount === 1 ? 'Project' : 'Projects'}
          </span>
          <svg 
            className="h-5 w-5 text-gray-400 transition-colors duration-200 group-hover:text-primary" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};
