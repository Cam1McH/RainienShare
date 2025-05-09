"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Theme, SubscriptionPlan } from "../../types";
import { subscriptionPlans } from "../../lib/mockData";
import { X } from "lucide-react";

interface UpgradeModalProps {
  theme: Theme;
  selectedPlan: string | null;
  setShowUpgradeModal: (show: boolean) => void;
}

export default function UpgradeModal({
  theme,
  selectedPlan,
  setShowUpgradeModal
}: UpgradeModalProps) {
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  
  useEffect(() => {
    if (selectedPlan) {
      const foundPlan = subscriptionPlans.find(p => p.id === selectedPlan);
      if (foundPlan) {
        setPlan(foundPlan);
      }
    }
  }, [selectedPlan]);
  
  const confirmUpgrade = () => {
    if (selectedPlan) {
      // In a real application, you would call your API here to update the subscription
      console.log(`Upgrading to plan: ${selectedPlan}`);
      
      // Close the modal
      setShowUpgradeModal(false);
    }
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50"
        onClick={() => setShowUpgradeModal(false)} // Close on backdrop click
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 rounded-xl shadow-xl overflow-hidden ${
          theme === "dark" ? "bg-[#13131f] border border-[#2a2a3c]" : "bg-white border border-gray-200"
        }`}
      >
        <div className="relative p-6">
          <button
            onClick={() => setShowUpgradeModal(false)} // Close on button click
            className={`absolute top-4 right-4 p-1 rounded-full ${
              theme === "dark" ? "hover:bg-[#1e1e2d] text-gray-400" : "hover:bg-gray-100 text-gray-500"
            } transition-colors`}
          >
            <X size={18} />
          </button>

          <h2 className={`text-xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Confirm Plan Upgrade
          </h2>

          {plan && (
            <div className="mb-6">
              <p className={`mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                You are about to upgrade to the <span className="font-semibold">{plan.name}</span> plan.
              </p>

              <div className={`${theme === "dark" ? "bg-[#1a1a2c]" : "bg-gray-50"} rounded-lg p-4 mb-4`}>
                <div className="flex justify-between mb-2">
                  <span className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>New plan:</span>
                  <span className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {plan.name}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Monthly price:</span>
                  <span className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {plan.price}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Next billing date:</span>
                  <span className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    June 1, 2025 {/* TODO: Make dynamic */}
                  </span>
                </div>
              </div>

              <p className={`text-sm mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Your subscription will be upgraded immediately. You'll be charged the prorated difference for the remainder of your current billing cycle.
              </p>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowUpgradeModal(false)} // Close on cancel
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === "dark" ? "bg-[#1e1e2d] text-gray-300 hover:bg-[#23233c]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUpgrade} // Call confirmUpgrade function
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium text-white hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                >
                  Confirm Upgrade
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}