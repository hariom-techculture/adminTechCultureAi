"use client";
import React, { Suspense } from "react";
import {
  Users,
  Briefcase,
  FileText,
  Mail,
  PhoneCall,
  TrendingUp,
  Calendar,
  MoreVertical,
  RefreshCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/Cards/StatsCard";
import { RecentActivities } from "@/components/Dashboard/RecentActivities";
import { DashboardChart } from "@/components/Dashboard/DashboardChart";
import { useAuth } from "@/hooks/useAuth";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

async function getStats(token: string | null) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    if (!token) {
      throw new Error("No authentication token found");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const fetchCount = async (endpoint: string) => {
      const res = await fetch(`${baseUrl}${endpoint}`, { headers });
      if (!res.ok) {
        throw new Error(`Failed to fetch ${endpoint}`);
      }
      const data = await res.json();
      return data.count || 0;
    };

    const fetchRecentItems = async (endpoint: string) => {
      const res = await fetch(`${baseUrl}${endpoint}`, { headers });
      if (!res.ok) {
        throw new Error(`Failed to fetch ${endpoint}`);
      }
      return res.json();
    };

    const [
      userCount,
      jobCount,
      applicationCount,
      enquiryCount,
      contactCount,
      recentApplications,
      recentEnquiries,
      activityData,
      recentContacts,
    ] = await Promise.all([
      fetchCount("/api/user/count"),
      fetchCount("/api/job-post/count"),
      fetchCount("/api/job-application/count"),
      fetchCount("/api/enquiry/count"),
      fetchCount("/api/contact/count"),
      fetchRecentItems("/api/job-application/recent"),
      fetchRecentItems("/api/enquiry/recent"),
      fetchRecentItems("/api/stats/activity"),
      fetchRecentItems("/api/contact/recent"),
    ]);

    return {
      userCount,
      jobCount,
      applicationCount,
      enquiryCount,
      contactCount,
      recentActivities: [
        ...recentApplications.map((app: any) => ({
          id: app._id,
          type: "application",
          title: `New application for ${app.jobTitle}`,
          timestamp: app.createdAt,
          status: app.status,
        })),
        ...recentEnquiries.map((enq: any) => ({
          id: enq._id,
          type: "enquiry",
          title: `New enquiry: ${enq.message}`,
          timestamp: enq.createdAt,
          status: enq.status,
        })),
        ...recentContacts.map((contact: any) => ({
          id: contact._id,
          type: "contact",
          title: `New contact message from ${contact.name}`,
          timestamp: contact.createdAt,
          status: contact.read,
        })) 
      ]
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
        .slice(0, 10),
      activityData: activityData.slice(-30), // Last 30 days of activity
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      userCount: 0,
      jobCount: 0,
      applicationCount: 0,
      enquiryCount: 0,
      contactCount: 0,
      recentActivities: [],
      activityData: [],
    };
  }
}

export default function Home() {
  const { token } = useAuth();
  const [stats, setStats] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedTimeFrame, setSelectedTimeFrame] = React.useState("month");

  React.useEffect(() => {
    const fetchStats = async () => {
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }
      
      try {
        const data = await getStats(token);
        setStats(data);
        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data",
        );
        setIsLoading(false);
      }
    };

    fetchStats();

    // Refresh data every 15 minutes
    const interval = setInterval(fetchStats, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  const handleRefresh = async () => {
    if (!token) {
      setError("Authentication required");
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await getStats(token);
      setStats(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="space-y-8 px-4 py-6 md:px-8 md:py-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse space-y-4 p-6">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-8 w-16 rounded bg-gray-200" />
                <div className="h-3 w-32 rounded bg-gray-200" />
              </Card>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="p-6 xl:col-span-2">
              <div className="h-[400px] animate-pulse rounded-lg bg-gray-100" />
            </Card>
            <Card className="p-6">
              <div className="h-[400px] animate-pulse rounded-lg bg-gray-100" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Card className="mx-auto max-w-md">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
              <FileText className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-semibold">Error Loading Dashboard</h3>
              <p className="text-muted-foreground text-sm">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="min-h-screen rounded-md bg-white dark:from-slate-900 dark:to-slate-800">
      <div className="space-y-8 px-4 py-6 md:px-8 md:py-8">
        {/* Enhanced Page Header */}
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-slate-300 md:text-4xl">
                Dashboard
              </h1>
              <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                Live
              </div>
            </div>
            <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Calendar className="h-4 w-4" />
              Welcome back! Here&apos;s what&apos;s happening today
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* <select
              value={selectedTimeFrame}
              onChange={(e) => setSelectedTimeFrame(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select> */}

            <button
              onClick={handleRefresh}
              className="group rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
            >
              <RefreshCcw className="h-4 w-4 text-slate-600 transition-transform duration-300 group-hover:rotate-180 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          <StatsCard
            href="/user"
            title="Total Users"
            value={stats.userCount}
            icon={Users}
            description="Active registered users"
            // change={2.5}
            // trend="up"
            color="blue"
          />
          <StatsCard
            href="/career/job-post"
            title="Job Posts"
            value={stats.jobCount}
            icon={Briefcase}
            description="Active job postings"
            // change={-1.2}
            // trend="down"
            color="purple"
          />
          <StatsCard
            href="/career/job-application"
            title="Applications"
            value={stats.applicationCount}
            icon={FileText}
            description="Job applications received"
            // change={5.7}
            // trend="up"
            color="emerald"
          />
          <StatsCard
            href="/enquiry"
            title="Enquiries"
            value={stats.enquiryCount}
            icon={Mail}
            description="Total enquiries"
            // change={3.2}
            // trend="up"
            color="orange"
          />
          <StatsCard
            href="/contact-us"
            title="Contacts"
            value={stats.contactCount}
            icon={PhoneCall}
            description="Contact messages"
            // change={1.8}
            // trend="up"
            color="teal"
          />
        </div>

        {/* Enhanced Charts and Activities Section */}
        <div className="grid grid-cols-3 gap-6">
          {/* Main Chart - Takes 2/3 width */}
          <div className="space-y-6 xl:col-span-2">
            <DashboardChart data={stats.activityData} className="w-full" />

            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100 dark:border-blue-800 dark:from-blue-950 dark:to-indigo-950">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                    <TrendingUp className="h-5 w-5" />
                    Application Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.activityData
                      .slice(-5)
                      .map((data: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg bg-white/50 p-2 dark:bg-slate-800/50"
                        >
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {new Date(data.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              {data.applications}
                            </span>
                            <span className="text-xs text-slate-500">
                              applications
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-100 dark:border-emerald-800 dark:from-emerald-950 dark:to-green-950">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
                    <Mail className="h-5 w-5" />
                    Enquiry Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.activityData
                      .slice(-5)
                      .map((data: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg bg-white/50 p-2 dark:bg-slate-800/50"
                        >
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {new Date(data.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {data.enquiries}
                            </span>
                            <span className="text-xs text-slate-500">
                              enquiries
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <RecentActivities activities={stats.recentActivities} className="" />
        </div>
      </div>
    </div>
  );
}
