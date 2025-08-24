"use client";

import { Authenticated } from "convex/react";
import { redirect } from "next/navigation";

export default function PersonalFinanceLayout({ children }) {
  return (
    <Authenticated>
      <div className="container mx-auto px-4 max-w-7xl">
        {children}
      </div>
    </Authenticated>
  );
}
