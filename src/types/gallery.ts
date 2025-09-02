export interface GalleryItem {
  _id: string;
  title: string;
  category: string;
  galleryType: 'image' | 'video';
  url: string;
  thumbnail: string;
  duration?: number;
  height?: number;
  width?: number;
  createdAt: string;
}

export interface GalleryFormData {
  title: string;
  category: string;
  galleryType: 'image' | 'video';
  file: File | null;
}