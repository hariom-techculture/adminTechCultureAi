import { useEffect, useState } from 'react';

interface DashboardStats {
  userCount: number;
  jobPostCount: number;
  applicationCount: number;
  enquiryCount: number;
  contactCount: number;
  recentApplications: any[];
  recentEnquiries: any[];
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    userCount: 0,
    jobPostCount: 0,
    applicationCount: 0,
    enquiryCount: 0,
    contactCount: 0,
    recentApplications: [],
    recentEnquiries: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          usersRes,
          jobsRes,
          applicationsRes,
          enquiriesRes,
          contactsRes
        ] = await Promise.all([
          fetch('/api/users/count'),
          fetch('/api/jobs/count'),
          fetch('/api/applications/count'),
          fetch('/api/enquiries/count'),
          fetch('/api/contacts/count')
        ]);

        const [
          userCount,
          jobPostCount,
          applicationCount,
          enquiryCount,
          contactCount
        ] = await Promise.all([
          usersRes.json(),
          jobsRes.json(),
          applicationsRes.json(),
          enquiriesRes.json(),
          contactsRes.json()
        ]);

        // Fetch recent items
        const [recentApplicationsRes, recentEnquiriesRes] = await Promise.all([
          fetch('/api/applications/recent'),
          fetch('/api/enquiries/recent')
        ]);

        const [recentApplications, recentEnquiries] = await Promise.all([
          recentApplicationsRes.json(),
          recentEnquiriesRes.json()
        ]);

        setStats({
          userCount,
          jobPostCount,
          applicationCount,
          enquiryCount,
          contactCount,
          recentApplications,
          recentEnquiries
        });
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}
