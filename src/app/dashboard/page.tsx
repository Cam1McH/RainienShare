// app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, Users } from "lucide-react"; // Ensure Users is imported if used directly

// Layout components
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import MobileMenu from "./components/layout/MobileMenu";

// UI Components
import SearchModal from "./components/ui/SearchModal";

// Page Components
import WelcomeSection from "./components/home/WelcomeSection";
import StatsRow from "./components/home/StatsRow";
import AIModelsSection from "./components/home/AIModelsSection";
import RecentActivity from "./components/home/RecentActivity";
import UpcomingEvents from "./components/home/UpcomingEvents";
import AnalyticsChart from "./components/home/AnalyticsChart";
import TeamManagement from "./components/team/TeamManagement";

// Billing Components
import BillingTabs from "./components/billing/BillingTabs";

// Common Components
import FloatingActionButton from "./components/common/FloatingActionButton";
import PlaceholderSection from "./components/common/PlaceholderSection";

// Modals
import UpgradeModal from "./components/modals/UpgradeModal";
import AddPaymentModal from "./components/modals/AddPaymentModal";

// Hooks
import useTheme from "./hooks/useTheme";
import useUser from "./hooks/useUser";

// Types
import { User } from "./types";

const Dashboard: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState("Home");
  const [showAIBuilder, setShowAIBuilder] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Billing-specific states
  const [billingSubTab, setBillingSubTab] = useState('subscription');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Custom hooks
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useUser(); // Get user and loading state

  const router = useRouter();

  // Console logs for debugging (keep these for now)
  console.log('Dashboard Render - activeTab:', activeTab);
  console.log('Dashboard Render - user:', user);
  console.log('Dashboard Render - loading:', loading);
  console.log('Dashboard Render - user?.accountType:', user?.accountType);
  const showTeamTab = user !== null && user.accountType === 'business'; // Calculate showTeamTab
  console.log('Dashboard Render - showTeamTab:', showTeamTab);


  useEffect(() => {
    // Set visibility after initial load
    setIsVisible(true);
  }, []);

  // useEffect to log user state changes
  useEffect(() => {
      console.log('>>> useEffect [user] - User state updated:', user);
      console.log('>>> useEffect [user] - showTeamTab (based on updated user):', user?.accountType === 'business');
  }, [user]);


  // Function to launch AI Builder
  const launchAIBuilder = () => {
    setShowAIBuilder(true);
    setActiveTab("AI Models");
  };

  // Function to close AI Builder
  const closeAIBuilder = () => {
    setShowAIBuilder(false);
  };

  // Billing functions
  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setShowUpgradeModal(true);
  };


  // Handle loading and unauthenticated states BEFORE rendering main layout
   if (loading) {
       return (
           <div className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-[#0a0a14]" : "bg-gray-50"}`}>
               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
           </div>
       );
   }
   if (!user && !loading) {
       router.push('/login'); // Redirect if not authenticated after loading
       return null;
   }


  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-[#0a0a14]" : "bg-gray-50"}`}>
      {/* Left side navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        showAIBuilder={showAIBuilder}
        setShowAIBuilder={setShowAIBuilder}
        theme={theme}
        toggleTheme={toggleTheme}
        user={user}
        launchAIBuilder={launchAIBuilder}
        showTeamTab={showTeamTab} // Pass the calculated value to Sidebar
      />

      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <MobileMenu setMobileMenuOpen={setMobileMenuOpen} />
      )}

      {/* Main content */}
      <div className="md:pl-[280px] transition-all duration-300">
        {/* Top navigation */}
        <Topbar
          activeTab={activeTab}
          showAIBuilder={showAIBuilder}
          theme={theme}
          setSearchOpen={setSearchOpen}
          setNotificationsOpen={setNotificationsOpen}
          notificationsOpen={notificationsOpen}
          setUserMenuOpen={setUserMenuOpen}
          userMenuOpen={userMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          user={user}
        />

        {/* Search modal */}
        {searchOpen && (
          <SearchModal
            theme={theme}
            setSearchOpen={setSearchOpen}
          />
        )}

        {/* Page content */}
        {/* Added a wrapper div for consistent padding and width */}
        <main className={`transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"} max-w-[1600px] mx-auto space-y-6 p-4 sm:p-6`}>
          {/* AI Builder Content - Placeholder */}
          {showAIBuilder ? (
            <div className="relative w-full h-full">
              <div className="absolute right-6 top-6 z-30">
                <button
                  onClick={closeAIBuilder}
                  className={`p-2 rounded-lg ${
                    theme === "dark"
                      ? "bg-[#1a1a2c] hover:bg-[#23233c] text-gray-400"
                      : "bg-white hover:bg-gray-100 text-gray-600"
                  } shadow-md`}
                  title="Close AI Builder"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
               {/* Use PlaceholderSection for AI Builder if not implemented */}
               <PlaceholderSection activeTab={"AI Models"} theme={theme} launchAIBuilder={launchAIBuilder} />
            </div>
          ) : activeTab === "Home" ? (
             <> {/* Use fragment for multiple elements */}
              <WelcomeSection
                theme={theme}
                user={user}
                launchAIBuilder={launchAIBuilder}
              />
              <StatsRow theme={theme} />
              <AIModelsSection
                theme={theme}
                setActiveTab={setActiveTab}
                launchAIBuilder={launchAIBuilder}
              />
              <RecentActivity theme={theme} />
              <UpcomingEvents theme={theme} />
              <AnalyticsChart theme={theme} />
            </>
          ) : activeTab === "Billing" ? (
            <>
              <WelcomeSection
                theme={theme}
                user={user}
                isBillingPage={true}
              />
              <BillingTabs
                theme={theme}
                billingSubTab={billingSubTab}
                setBillingSubTab={setBillingSubTab}
                handleSelectPlan={handleSelectPlan}
                setShowAddPaymentModal={setShowAddPaymentModal}
              />
            </>
          ) : activeTab === "Team" && showTeamTab ? ( // >>>>>> Corrected condition back to include showTeamTab <<<<<<
            // This condition checks if activeTab is "Team" AND showTeamTab is true
            <TeamManagement
              theme={theme}
              user={user}
            />
          ) : (
            // If activeTab is 'Team' but showTeamTab is false (e.g., personal account),
            // OR if activeTab is anything else not handled above, render the PlaceholderSection.
            <PlaceholderSection
              activeTab={activeTab}
              theme={theme}
              launchAIBuilder={launchAIBuilder}
            />
          )}

          {/* Quick action floating button */}
          {/* Only show if not in AI Builder mode */}
          {!showAIBuilder && (
            <FloatingActionButton
              launchAIBuilder={launchAIBuilder}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {showUpgradeModal && (
        <UpgradeModal
          theme={theme}
          selectedPlan={selectedPlan}
          setShowUpgradeModal={setShowUpgradeModal}
        />
      )}

      {showAddPaymentModal && (
        <AddPaymentModal
          theme={theme}
          setShowAddPaymentModal={setShowAddPaymentModal}
        />
      )}
    </div>
  );
};

export default Dashboard;