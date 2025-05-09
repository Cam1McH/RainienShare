"use client";

import { Theme, SubscriptionPlan } from "../../types";
import { CheckCircle } from "lucide-react";

interface PlanCardProps {
  plan: SubscriptionPlan;
  theme: Theme;
  handleSelectPlan: (planId: string) => void;
}

export default function PlanCard({ 
  plan, 
  theme, 
  handleSelectPlan 
}: PlanCardProps) {
  return (
    <div
      className={`${theme === "dark" ? "bg-[#1a1a2c] border-[#2a2a3c]" : "bg-gray-50 border-gray-200"} rounded-xl p-6 border relative ${
        plan.popular ? "ring-2 ring-purple-500" : ""
      } hover:shadow-lg transition-shadow`}
    >
      {plan.popular && (
        <div className="absolute top-0 right-6 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium rounded-b-lg">
          Popular
        </div>
      )}

      <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
        {plan.name}
      </h3>
      <div className={`text-2xl font-bold mt-2 mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
        {plan.price}
        <span className={`text-sm ml-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
          {plan.period}
        </span>
      </div>
      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-4`}>
        {plan.description}
      </p>

      <ul className="space-y-2 mb-6">
        {plan.features.slice(0, 4).map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {feature}
            </span>
          </li>
        ))}

        {plan.features.length > 4 && (
          <li className={`text-sm pl-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            +{plan.features.length - 4} more features
          </li>
        )}
      </ul>

      <button
        onClick={() => handleSelectPlan(plan.id)}
        className={`w-full py-3 rounded-xl text-white font-medium transition-all ${
          plan.popular
            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/20"
            : theme === "dark" ? "bg-[#23233c] hover:bg-[#2a2a4c]" : "bg-gray-700 hover:bg-gray-800"
        }`}
      >
        Upgrade to {plan.name}
      </button>
    </div>
  );
}