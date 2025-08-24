'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, PlusCircle, BookUser, User, Trophy, Target } from "lucide-react";
import { useStoreUser } from "@/hooks/use-store-user";

export default function BottomNav() {
  const path = usePathname();
  const { isLoading, isAuthenticated, userId } = useStoreUser();
  // Define left and right items; Add button will be centered absolutely
  const leftItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/groups", icon: Users, label: "Groups" },
    { href: "/budget", icon: Target, label: "Budget" },
  ];
  const rightItems = [
    { href: "/challenges", icon: Trophy, label: "Challenges" },
    { href: "/contacts", icon: BookUser, label: "Contacts" },
  ];
  if (userId) {
    rightItems.push({ href: `/person/${userId}`, icon: User, label: "Profile" });
  }
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-end justify-center md:hidden">
      <div className="relative flex gap-2 px-4 py-2 glass shadow-2xl rounded-full backdrop-blur-xl border border-border">
        {/* Left side items */}
        {leftItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center px-4 py-2 rounded-full transition-all duration-200 ${path.startsWith(item.href) ? "bg-gradient-to-r from-green-100 to-blue-100 text-primary font-bold" : "text-muted-foreground hover:bg-muted/60"}`}
            aria-label={item.label}
          >
            <item.icon className="h-6 w-6 mb-1" />
            <span className="text-xs font-semibold">{item.label}</span>
          </Link>
        ))}

        {/* Spacer equal to Add button width + gaps to keep perfect symmetry */}
        <div className="w-[72px]" aria-hidden />

        {/* Right side items */}
        {rightItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center px-4 py-2 rounded-full transition-all duration-200 ${path.startsWith(item.href) ? "bg-gradient-to-r from-green-100 to-blue-100 text-primary font-bold" : "text-muted-foreground hover:bg-muted/60"}`}
            aria-label={item.label}
          >
            <item.icon className="h-6 w-6 mb-1" />
            <span className="text-xs font-semibold">{item.label}</span>
          </Link>
        ))}

        {/* Center Add button overlayed perfectly in the middle */}
        <Link
          href="/expenses/new"
          className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center"
          aria-label="Add"
        >
          <div className="premium-gradient rounded-full w-16 h-16 flex items-center justify-center shadow-xl border-4 border-white/80">
            <PlusCircle className="h-8 w-8" />
          </div>
          <span className="text-xs font-semibold mt-1 text-primary/80">Add</span>
        </Link>
      </div>
    </nav>
  );
} 