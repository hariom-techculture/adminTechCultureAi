"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Clock, FileText, Mail, Phone, MoreVertical } from "lucide-react";
import Link from "next/link";

interface Activity {
  id: string;
  type: "application" | "enquiry" | "contact";
  title: string;
  timestamp: string;
  status?: string;
}

interface RecentActivitiesProps {
  activities: Activity[];
  className?: string;
}

export function RecentActivities({
  activities,
  className = "",
}: RecentActivitiesProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "application":
        return (
          <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <FileText className="h-4 w-4" />
          </div>
        );
      case "enquiry":
        return (
          <div className="rounded-full bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            <Mail className="h-4 w-4" />
          </div>
        );
      case "contact":
        return (
          <div className="rounded-full bg-orange-100 p-2 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
            <Phone className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="rounded-full bg-gray-100 p-2 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            <Clock className="h-4 w-4" />
          </div>
        );
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "completed":
      case "approved":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <Card
      className={`border-slate-200 bg-white shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/50 ${className}`}
    >
      <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 dark:border-slate-700 dark:from-slate-800 dark:to-slate-700">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <Clock className="h-5 w-5" />
            Recent Activities
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              Live Updates
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="overflow-y-auto p-0">
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {activities.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                <Clock className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mb-2 font-medium text-slate-900 dark:text-white">
                No Recent Activities
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                New activities will appear here as they happen
              </p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <Link
                href={`${activity.type === "application" ? "/career/job-application" : activity.type === "enquiry" ? "/enquiry" : "/contact-us"}`}
                key={activity.id}
              >
                <div
                  key={activity.id}
                  className={`group p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                    index === 0 ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getActivityIcon(activity.type)}
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="text-sm font-medium leading-relaxed text-slate-900 dark:text-white">
                        {activity.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDistanceToNow(new Date(activity.timestamp), {
                              addSuffix: true,
                            })}
                          </span>
                          {activity.status && (
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(activity.status)}`}
                            >
                              {activity.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
