"use client";

import React from "react";
import { Button } from "./ui/button";
import { LayoutDashboard, PlusCircle, Trophy } from "lucide-react";
import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { useSidebar } from "./ui/sidebar";
import { BarLoader } from "react-spinners";
import { Authenticated, Unauthenticated } from "convex/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NotificationBell } from "./notifications/notification-bell";
import { useStoreUser } from "@/hooks/use-store-user";

export default function Header() {
  const { isLoading } = useStoreUser();
  const path = usePathname();
  const { toggleSidebar } = useSidebar();

  return (
    <header className="fixed top-0 left-0 right-0 border-b glass shadow-xl z-50 supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleSidebar}
            className="h-8 w-8 bg-gray-200 border border-gray-400 rounded flex items-center justify-center hover:bg-gray-300"
          >
            <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Image
            src="/logos/logo.png"
            alt="Splitr Logo"
            width={200}
            height={60}
            className="h-11 w-auto object-contain"
          />
          </Link>
        </div>

        {path === "/" && (
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-medium hover:text-green-600 transition"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium hover:text-green-600 transition"
            >
              How It Works
            </Link>
          </div>
        )}

        <div className="flex items-center gap-4">
          <Authenticated>
            <nav className="hidden md:flex items-center gap-6 mr-4">
              <Link href="/dashboard" className={`flex items-center gap-2 text-sm font-medium transition ${path === '/dashboard' ? 'text-green-600' : 'hover:text-green-600'}`}>
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link href="/gamification" className={`flex items-center gap-2 text-sm font-medium transition ${path === '/gamification' ? 'text-green-600' : 'hover:text-green-600'}`}>
                <Trophy className="w-4 h-4" />
                Gamification
              </Link>
            </nav>
            <NotificationBell />
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                  userButtonPopoverCard: "shadow-xl",
                  userPreviewMainIdentifier: "font-semibold",
                },
              }}
              afterSignOutUrl="/"
            />
          </Authenticated>
          <Unauthenticated>
            <SignInButton>
              <Button variant="ghost">Sign In</Button>
            </SignInButton>
            <SignUpButton>
              <Button className="bg-green-600 hover:bg-green-700 border-none">
                Get Started
              </Button>
            </SignUpButton>
          </Unauthenticated>
        </div>
      </nav>
      {isLoading && <BarLoader width={"100%"} color="#36d7b7" />}
    </header>
  );
}