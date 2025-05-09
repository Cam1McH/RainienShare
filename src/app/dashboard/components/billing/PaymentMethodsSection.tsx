"use client";

import { useState } from "react";
import { Theme, PaymentMethod } from "../../types";
import { paymentMethods } from "../../lib/mockData";
import { CreditCard, Plus } from "lucide-react";

interface PaymentMethodsSectionProps {
  theme: Theme;
  setShowAddPaymentModal: (show: boolean) => void;
}

export default function PaymentMethodsSection({
  theme,
  setShowAddPaymentModal
}: PaymentMethodsSectionProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>(paymentMethods);

  const setDefaultPayment = (paymentId: string) => {
    setMethods(
      methods.map(method => ({
        ...method,
        isDefault: method.id === paymentId
      }))
    );
    // Call API to set default payment method
    console.log(`Setting default payment to: ${paymentId}`);
  };

  const deletePaymentMethod = (paymentId: string) => {
    setMethods(
      methods.filter(method => method.id !== paymentId)
    );
    // Call API to delete payment method
    console.log(`Deleting payment method: ${paymentId}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Payment Methods
        </h2>
        <button
          onClick={() => setShowAddPaymentModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-sm font-medium text-white hover:shadow-lg hover:shadow-purple-500/20 transition-all"
        >
          <Plus className="h-4 w-4 inline mr-1" /> Add Payment Method
        </button>
      </div>

      {methods.length === 0 ? (
        <div className={`text-center py-10 border border-dashed ${
          theme === "dark" ? "border-[#2a2a3c]" : "border-gray-300"
        } rounded-xl`}>
          <CreditCard size={32} className={`mx-auto mb-3 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
          <p className={`mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            No payment methods added yet
          </p>
          <button
            onClick={() => setShowAddPaymentModal(true)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              theme === "dark" ? "bg-[#1e1e2d] text-gray-300 hover:bg-[#23233c]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Add a Payment Method
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {methods.map(method => (
            <div
              key={method.id}
              className={`${theme === "dark" ? "bg-[#1a1a2c] border-[#2a2a3c]" : "bg-gray-50 border-gray-200"} rounded-xl p-4 border`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-10 h-10 ${theme === "dark" ? "bg-[#23233c]" : "bg-gray-200"} rounded-lg flex items-center justify-center mr-4`}>
                    <CreditCard size={20} className={theme === "dark" ? "text-white" : "text-gray-700"} />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {method.brand} •••• {method.last4}
                      </span>
                      {method.isDefault && (
                        <span className={`ml-2 px-2 py-0.5 text-xs ${
                          theme === "dark" ? "bg-[#23233c] text-gray-300" : "bg-gray-200 text-gray-700"
                        } rounded-full`}>
                          Default
                        </span>
                      )}
                    </div>
                    <div className={`text-sm mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Expires {method.expMonth.toString().padStart(2, '0')}/{method.expYear}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!method.isDefault && (
                    <button
                      onClick={() => setDefaultPayment(method.id)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        theme === "dark" ? "bg-[#23233c] text-gray-300 hover:bg-[#2a2a4c]" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Set as Default
                    </button>
                  )}

                  <button
                    onClick={() => deletePaymentMethod(method.id)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      theme === "dark" ? "bg-red-900/20 text-red-400 hover:bg-red-900/40" : "bg-red-100 text-red-600 hover:bg-red-200"
                    }`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}