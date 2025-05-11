"use client";

interface MobileMenuProps {
  setMobileMenuOpen: (open: boolean) => void;
}

export default function MobileMenu({ setMobileMenuOpen }: MobileMenuProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-30 md:hidden"
      onClick={() => setMobileMenuOpen(false)}
    ></div>
  );
}