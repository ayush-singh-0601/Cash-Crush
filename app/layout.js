import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import BottomNav from "@/components/bottom-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Cash Crush",
  description: "Crush your group expenses with AI! The Gen Z way to split, track, and settle bills with friends.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logos/logo-s.png" sizes="any" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#36d7b7" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Cash Crush" />
      </head>
      <body className={`${inter.className}`}>
        <ConvexClientProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <div className="flex flex-col min-h-screen bg-gray-50">
                <Header />
                <main className="flex-1 p-4 pt-20 pb-20 md:pb-4">
                  {children}
                </main>
                <BottomNav />
              </div>
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
