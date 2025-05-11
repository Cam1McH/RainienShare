// app/layout.tsx
"use client";

import "./globals.css";
import { UserProvider } from "@/providers/UserProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { AIBuilderProvider } from "./dashboard/contexts/AIBuilderContext";
import ProtectedLayout from "../components/ProtectedLayout";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <UserProvider>
            <AIBuilderProvider>
              <ProtectedLayout>
                {children}
              </ProtectedLayout>
            </AIBuilderProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}