"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { Url } from "url";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  // change?: number;
  // trend?: "up" | "down";
  color?: "blue" | "purple" | "emerald" | "orange" | "teal";
  href: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  // change,
  // trend,
  color = "blue",
  href,
}: StatsCardProps) {
  const colorStyles = {
    blue: {
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
      iconColor: "text-blue-600 dark:text-blue-400",
      accent: "bg-blue-500",
    },
    purple: {
      gradient: "from-purple-500 to-purple-600",
      bg: "bg-purple-50 dark:bg-purple-950/30",
      iconBg: "bg-purple-100 dark:bg-purple-900/50",
      iconColor: "text-purple-600 dark:text-purple-400",
      accent: "bg-purple-500",
    },
    emerald: {
      gradient: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      accent: "bg-emerald-500",
    },
    orange: {
      gradient: "from-orange-500 to-orange-600",
      bg: "bg-orange-50 dark:bg-orange-950/30",
      iconBg: "bg-orange-100 dark:bg-orange-900/50",
      iconColor: "text-orange-600 dark:text-orange-400",
      accent: "bg-orange-500",
    },
    teal: {
      gradient: "from-teal-500 to-teal-600",
      bg: "bg-teal-50 dark:bg-teal-950/30",
      iconBg: "bg-teal-100 dark:bg-teal-900/50",
      iconColor: "text-teal-600 dark:text-teal-400",
      accent: "bg-teal-500",
    },
  };

  const style = colorStyles[color];

  return (
    <Link href={href}>
      <Card
        className={`group relative overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${style.bg} hover:-translate-y-1 h-full`}
      >
        <CardContent className="p-6 h-full">
          <div className="mb-4 flex items-center justify-center">
            <div
              className={`rounded-xl p-3 ${style.iconBg} transition-transform duration-300 group-hover:scale-110`}
            >
              <Icon className={`h-6 w-6 ${style.iconColor}`} />
            </div>
            {/* {change !== undefined && (
              <div
                className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                  trend === "up"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {trend === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(change)}%
              </div>
            )} */}
          </div>

          <div className="space-y-2 text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">
              {title}
            </h3>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {typeof value === "number" ? value.toLocaleString() : value}
            </div>
            {description && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
        </CardContent>

        {/* Accent line */}
        <div
          className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${style.gradient}`}
        />
      </Card>
    </Link>
  );
}
