'use client';

import React from 'react';
import { AIBuilderProvider } from './contexts/AIBuilderContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AIBuilderProvider>
      {children}
    </AIBuilderProvider>
  );
}