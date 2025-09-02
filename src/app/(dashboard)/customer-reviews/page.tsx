"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { CustomerReviews } from "@/components/CustomerReviews";

export default function CustomerReviewsPage() {
  return (
    <>
      <Breadcrumb pageName="Customer Reviews" />
      <CustomerReviews />
    </>
  );
}
