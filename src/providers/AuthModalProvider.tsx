'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type AuthModalContextType = {
  isOpen: boolean;
  openModal: (returnUrl?: string) => void;
  closeModal: () => void;
  returnUrl: string | null;
  is2FARequired: boolean;
  setIs2FARequired: (required: boolean) => void;
  authStep: 'credentials' | '2fa' | 'complete';
  setAuthStep: (step: 'credentials' | '2fa' | 'complete') => void;
};

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [returnUrl, setReturnUrl] = useState<string | null>(null);
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [authStep, setAuthStep] = useState<'credentials' | '2fa' | 'complete'>('credentials');

  const openModal = (returnPath?: string) => {
    setIsOpen(true);
    if (returnPath) setReturnUrl(returnPath);
    setAuthStep('credentials');
    
    // Dispatch event for RouteGuard
    window.dispatchEvent(new Event('loginModalOpen'));
  };

  const closeModal = () => {
    setIsOpen(false);
    
    // Dispatch event for RouteGuard
    window.dispatchEvent(new Event('loginModalClose'));
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Wait for animation to complete
      const timer = setTimeout(() => {
        setAuthStep('credentials');
        setIs2FARequired(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        openModal,
        closeModal,
        returnUrl,
        is2FARequired,
        setIs2FARequired,
        authStep,
        setAuthStep,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};