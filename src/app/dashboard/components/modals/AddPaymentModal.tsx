"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Theme } from "../../types";
import { X } from "lucide-react";

interface AddPaymentModalProps {
  theme: Theme;
  setShowAddPaymentModal: (show: boolean) => void;
}

export default function AddPaymentModal({
  theme,
  setShowAddPaymentModal
}: AddPaymentModalProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [makeDefault, setMakeDefault] = useState(true);
  
  const addPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would process the payment form with Stripe or another provider
    // You would typically collect card details securely using their SDK
    console.log('Attempting to add payment method...');
    console.log({
      cardNumber,
      expiryDate,
      cvc,
      cardholderName,
      makeDefault
    });
    
    // Example API call placeholder:
    // const response = await fetch('/api/billing/payment-methods', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ /* payment details */ })
    // });
    // const data = await response.json();
    // if (response.ok) {
    //   // Update payment methods state
    //   // Close modal
    // } else {
    //   // Handle error
    // }
    
    // Close modal
    setShowAddPaymentModal(false);
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50"
        onClick={() => setShowAddPaymentModal(false)} // Close on backdrop click
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 rounded-xl shadow-xl overflow-hidden ${
          theme === "dark" ? "bg-[#13131f] border border-[#2a2a3c]" : "bg-white border border-gray-200"
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent clicks from closing the modal
      >
        <div className="relative p-6">
          <button
            onClick={() => setShowAddPaymentModal(false)} // Close on button click
            className={`absolute top-4 right-4 p-1 rounded-full ${
              theme === "dark" ? "hover:bg-[#1e1e2d] text-gray-400" : "hover:bg-gray-100 text-gray-500"
            } transition-colors`}
          >
            <X size={18} />
          </button>

          <h2 className={`text-xl font-semibold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Add Payment Method
          </h2>

          <form onSubmit={addPaymentMethod}> {/* Call addPaymentMethod on form submit */}
            <div className="space-y-4">
              <div>
                <label htmlFor="cardNumber" className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Card Number
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    theme === "dark"
                      ? "bg-[#1a1a2c] border-[#2a2a3c] text-white"
                      : "bg-gray-50 border-gray-200 text-gray-900"
                  } border`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiryDate" className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Expiration Date
                  </label>
                  <input
                    type="text"
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                      theme === "dark"
                        ? "bg-[#1a1a2c] border-[#2a2a3c] text-white"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    } border`}
                  />
                </div>

                <div>
                  <label htmlFor="cvc" className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    CVC
                  </label>
                  <input
                    type="text"
                    id="cvc"
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                      theme === "dark"
                        ? "bg-[#1a1a2c] border-[#2a2a3c] text-white"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    } border`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cardholderName" className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Cardholder Name
                </label>
                <input
                  type="text"
                  id="cardholderName"
                  placeholder="John Doe"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    theme === "dark"
                      ? "bg-[#1a1a2c] border-[#2a2a3c] text-white"
                      : "bg-gray-50 border-gray-200 text-gray-900"
                  } border`}
                />
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <input
                  type="checkbox"
                  id="make-default"
                  checked={makeDefault}
                  onChange={(e) => setMakeDefault(e.target.checked)}
                  className={`w-4 h-4 rounded border text-purple-600 focus:ring-purple-600 ${
                    theme === "dark" ? "bg-[#1a1a2c] border-[#2a2a3c]" : "bg-gray-50 border-gray-300"
                  }`}
                />
                <label htmlFor="make-default" className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Make this my default payment method
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium text-white hover:shadow-lg hover:shadow-purple-500/20 transition-all"
              >
                Add Method
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
}