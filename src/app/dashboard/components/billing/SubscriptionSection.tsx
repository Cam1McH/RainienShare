"use client";

import { Theme, SubscriptionPlan } from "../../types";
import { subscriptionPlans } from "../../lib/mockData";
import { CheckCircle } from "lucide-react";
import PlanCard from "./PlanCard";

interface SubscriptionSectionProps {
  theme: Theme;
  handleSelectPlan: (planId: string) => void;
}

export default function SubscriptionSection({ 
  theme, 
  handleSelectPlan 
}: SubscriptionSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-semibold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Current Plan
        </h2>

        {subscriptionPlans.map(plan => plan.current && (
          <div key={plan.id} className={`${theme === "dark" ? "bg-[#1a1a2c] border-purple-500/30" : "bg-gray-50 border-purple-300"} rounded-xl p-6 border`}>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} mt-1`}>
                  {plan.description}
                </p>
              </div>

              <div className="text-right">
                <div className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {plan.price}
                  <span className={`text-sm ml-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Next billing date: June 1, 2025 {/* TODO: Make dynamic */}
                </p>
              </div>
            </div>

            <div className={`mt-6 pt-6 border-t ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-300/50"}`}>
              <h4 className={`font-medium mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Plan Features
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                    <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className={`text-xl font-semibold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Available Plans
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {subscriptionPlans.map(plan => !plan.current && (
            <PlanCard 
              key={plan.id}
              plan={plan}
              theme={theme}
              handleSelectPlan={handleSelectPlan}
            />
          ))}
        </div>
      </div>
    </div>
  );
}