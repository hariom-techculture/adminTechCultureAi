"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Technologies } from "@/components/Technologies";

export default function TechnologyPage() {
  return (
    <>
      <Breadcrumb pageName="Technologies" />
      <Technologies />
    </>
  );
}
