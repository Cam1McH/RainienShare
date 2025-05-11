"use client";

import { Theme } from "../../types";
import { CircleDollarSign, CreditCard, FileText } from "lucide-react";
import SubscriptionSection from "./SubscriptionSection";
import PaymentMethodsSection from "./PaymentMethodsSection";
import BillingHistorySection from "./BillingHistorySection";

interface BillingTabsProps {
  theme: Theme;
  billingSubTab: string;
  setBillingSubTab: (tab: string) => void;
  handleSelectPlan: (planId: string) => void;
  setShowAddPaymentModal: (show: boolean) => void;
}

export default function BillingTabs({
  theme,
  billingSubTab,
  setBillingSubTab,
  handleSelectPlan,
  setShowAddPaymentModal
}: BillingTabsProps) {
  return (
    <div className={`rounded-2xl overflow-hidden ${
      theme === "dark" ? "bg-[#13131f] border-[#2a2a3c]" : "bg-white border-gray-200"
    } border shadow-sm`}>
      <div className={`p-2 border-b ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"}`}>
        <div className="flex">
          <button
            onClick={() => setBillingSubTab('subscription')}
            className={`flex items-center justify-center flex-1 py-3 px-4 rounded-xl text-sm transition-colors ${
              billingSubTab === 'subscription'
                ? theme === "dark"
                  ? 'bg-[#23233c] text-white'
                  : 'bg-purple-50 text-purple-700'
                : theme === "dark"
                ? 'text-gray-400 hover:text-white hover:bg-[#1e1e2d]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <CircleDollarSign className="h-4 w-4 mr-2" />
            <span>Subscription</span>
          </button>

          <button
            onClick={() => setBillingSubTab('payment-methods')}
            className={`flex items-center justify-center flex-1 py-3 px-4 rounded-xl text-sm transition-colors ${
              billingSubTab === 'payment-methods'
                ? theme === "dark"
                  ? 'bg-[#23233c] text-white'
                  : 'bg-purple-50 text-purple-700'
                : theme === "dark"
                ? 'text-gray-400 hover:text-white hover:bg-[#1e1e2d]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            <span>Payment Methods</span>
          </button>

          <button
            onClick={() => setBillingSubTab('billing-history')}
            className={`flex items-center justify-center flex-1 py-3 px-4 rounded-xl text-sm transition-colors ${
              billingSubTab === 'billing-history'
                ? theme === "dark"
                  ? 'bg-[#23233c] text-white'
                  : 'bg-purple-50 text-purple-700'
                : theme === "dark"
                ? 'text-gray-400 hover:text-white hover:bg-[#1e1e2d]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <FileText className="h-4 w-4 mr-2" />
            <span>Billing History</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Subscription Tab Content */}
        {billingSubTab === 'subscription' && (
          <SubscriptionSection 
            theme={theme} 
            handleSelectPlan={handleSelectPlan} 
          />
        )}

        {/* Payment Methods Tab Content */}
        {billingSubTab === 'payment-methods' && (
          <PaymentMethodsSection 
            theme={theme} 
            setShowAddPaymentModal={setShowAddPaymentModal} 
          />
        )}

        {/* Billing History Tab Content */}
        {billingSubTab === 'billing-history' && (
          <BillingHistorySection 
            theme={theme} 
          />
        )}
      </div>
    </div>
  );
}