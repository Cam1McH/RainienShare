'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Layout components
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import MobileMenu from "./components/layout/MobileMenu";

// UI Components
import SearchModal from "./components/ui/SearchModal";
import  AIBuilder  from "./components/AIBuilder/AIBuilder";

// Page Components
import WelcomeSection from "./components/home/WelcomeSection";
import StatsRow from "./components/home/StatsRow";
import RecentActivity from "./components/home/RecentActivity";
import UpcomingEvents from "./components/home/UpcomingEvents";
import AIModelsSection from "./components/home/AIModelsSection"; // Import the new AIModelsSection

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
  const [currentModelId, setCurrentModelId] = useState<string | undefined>(undefined);
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

  // Console logs for debugging
  console.log('Dashboard Render - activeTab:', activeTab);
  console.log('Dashboard Render - showAIBuilder:', showAIBuilder);
  console.log('Dashboard Render - currentModelId:', currentModelId);
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
  const launchAIBuilder = (modelId?: string) => {
    console.log("Launching AI Builder", modelId ? `for model: ${modelId}` : "for new model");
    setCurrentModelId(modelId);
    setShowAIBuilder(true);
    setActiveTab("AI Models"); // Ensure we're on the AI Models tab
  };

  // Function to close AI Builder
  const closeAIBuilder = () => {
    console.log("Closing AI Builder");
    setShowAIBuilder(false);
    setCurrentModelId(undefined);
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

  // Determine what content to show based on state
  const renderMainContent = () => {
    // If AI Builder is active, show it regardless of activeTab
    if (showAIBuilder) {
      return (
        <AIBuilder 
          theme={theme} 
          closeAIBuilder={closeAIBuilder}
          modelId={currentModelId}
        />
      );
    }

    // Otherwise, show content based on activeTab
    switch (activeTab) {
      case "Home":
        return (
          <>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RecentActivity theme={theme} />
              <UpcomingEvents theme={theme} />
            </div>
          </>
        );

      case "AI Models":
        return (
          <AIModelsSection
            theme={theme}
            setActiveTab={setActiveTab}
            launchAIBuilder={launchAIBuilder}
          />
        );

      case "Billing":
        return (
          <>
            <WelcomeSection
              theme={theme}
              user={user}
              launchAIBuilder={launchAIBuilder}
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
        );

      case "Team":
        if (showTeamTab) {
          return (
            <PlaceholderSection
              activeTab={activeTab}
              theme={theme}
              launchAIBuilder={launchAIBuilder}
            />
          );
        }
        // Fall through to default if team tab shouldn't be shown

      default:
        return (
          <PlaceholderSection
            activeTab={activeTab}
            theme={theme}
            launchAIBuilder={launchAIBuilder}
          />
        );
    }
  };

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
        <main className={`transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"} max-w-[1600px] mx-auto space-y-6 p-4 sm:p-6`}>
          {renderMainContent()}

          {/* Only show floating action button when AI Builder is not shown and we're not on AI Models tab */}
          {!showAIBuilder && activeTab !== "AI Models" && (
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