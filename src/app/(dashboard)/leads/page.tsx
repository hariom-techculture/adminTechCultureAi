"use client";

import React from 'react';
import { LeadTable } from '@/components/Leads';

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leads</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          View and manage all incoming messages.
        </p>
      </div>

      <LeadTable />
    </div>
  );
}