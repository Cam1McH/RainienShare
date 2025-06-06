// src/app/layout.tsx
"use client";

import "./globals.css";
import { UserProvider } from "@/providers/UserProvider";
import { AuthProvider } from "@/providers/AuthProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}