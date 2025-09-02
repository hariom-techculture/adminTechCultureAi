"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";

interface DataPoint {
  date: string;
  applications: number;
  enquiries: number;
}

interface DashboardChartProps {
  data: DataPoint[];
  className?: string;
}

export function DashboardChart({ data, className }: DashboardChartProps) {
  const [chartType, setChartType] = React.useState<"line" | "area">("area");

  const totalApplications = data.reduce(
    (sum, item) => sum + item.applications,
    0,
  );
  const totalEnquiries = data.reduce((sum, item) => sum + item.enquiries, 0);

  return (
    <Card
      className={`border-slate-200 bg-white shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/50 ${className}`}
    >
      <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 dark:border-slate-700 dark:from-slate-800 dark:to-slate-700">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <TrendingUp className="h-5 w-5" />
              Activity Overview
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Track job applications and enquiries over the last 30 days
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="font-medium">
                  {totalApplications} Applications
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="font-medium">{totalEnquiries} Enquiries</span>
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              <button
                onClick={() => setChartType("area")}
                className={`rounded-md p-2 transition-colors ${
                  chartType === "area"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`rounded-md p-2 transition-colors ${
                  chartType === "line"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="applicationGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient
                    id="enquiryGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  opacity={0.4}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow:
                      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    backdropFilter: "blur(16px)",
                  }}
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  }
                />
                <Area
                  type="monotone"
                  dataKey="applications"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#applicationGradient)"
                  name="Applications"
                />
                <Area
                  type="monotone"
                  dataKey="enquiries"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#enquiryGradient)"
                  name="Enquiries"
                />
              </AreaChart>
            ) : (
              <LineChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  opacity={0.4}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow:
                      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    backdropFilter: "blur(16px)",
                  }}
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  }
                />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2, fill: "#3b82f6" }}
                  name="Applications"
                />
                <Line
                  type="monotone"
                  dataKey="enquiries"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2, fill: "#10b981" }}
                  name="Enquiries"
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart Summary */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 p-4 dark:from-blue-950/30 dark:to-blue-900/20">
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Avg Daily Applications
            </div>
            <div className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-100">
              {Math.round(totalApplications / Math.max(data.length, 1))}
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 dark:from-emerald-950/30 dark:to-emerald-900/20">
            <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Avg Daily Enquiries
            </div>
            <div className="mt-1 text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {Math.round(totalEnquiries / Math.max(data.length, 1))}
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 p-4 dark:from-purple-950/30 dark:to-purple-900/20">
            <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
              Total Interactions
            </div>
            <div className="mt-1 text-2xl font-bold text-purple-900 dark:text-purple-100">
              {totalApplications + totalEnquiries}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
