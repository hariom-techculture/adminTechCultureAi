"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Testimonials } from "@/components/Testimonials";

export default function TestimonialsPage() {
  return (
    <>
      <Breadcrumb pageName="Testimonials" />
        
        <Testimonials />
      
    </>
  );
}