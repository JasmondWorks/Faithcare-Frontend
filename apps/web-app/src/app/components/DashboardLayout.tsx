import React from "react";
import { Header } from "./Header";

export default function DashboardLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-8">
      <Header title={title} subtitle={subtitle} />
      {children}
    </div>
  );
}
