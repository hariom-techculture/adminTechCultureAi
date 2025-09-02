"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Teams } from "@/components/Teams";

export default function TeamsPage() {
  return (
    <>
      <Breadcrumb pageName="Our Teams" />
      <Teams />
    </>
  );
}