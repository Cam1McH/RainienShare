"use client";

import { useState } from "react";
import { Theme, Invoice } from "../../types";
import { invoices as mockInvoices } from "../../lib/mockData";
import { FileText, DownloadCloud, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface BillingHistorySectionProps {
  theme: Theme;
}

export default function BillingHistorySection({
  theme
}: BillingHistorySectionProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);

  return (
    <div>
      <h2 className={`text-xl font-semibold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
        Billing History
      </h2>

      {invoices.length === 0 ? (
        <div className={`text-center py-10 border border-dashed ${
          theme === "dark" ? "border-[#2a2a3c]" : "border-gray-300"
        } rounded-xl`}>
          <FileText size={32} className={`mx-auto mb-3 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
          <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            No invoices yet
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"}`}>
                <th className={`text-left pb-3 font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Invoice
                </th>
                <th className={`text-left pb-3 font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Date
                </th>
                <th className={`text-left pb-3 font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Amount
                </th>
                <th className={`text-left pb-3 font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Status
                </th>
                <th className={`text-right pb-3 font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, i) => (
                <tr
                  key={invoice.id}
                  className={`${
                    i !== invoices.length - 1 ? `border-b ${theme === "dark" ? "border-[#2a2a3c]" : "border-gray-200"}` : ""
                  }`}
                >
                  <td className="py-4">
                    <span className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      Invoice #{invoice.id.split('_')[1]}
                    </span>
                  </td>
                  <td className={`py-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    {invoice.date}
                  </td>
                  <td className={`py-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    {invoice.amount}
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${invoice.status === 'paid'
                          ? theme === "dark" ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700"
                          : invoice.status === 'pending'
                            ? theme === "dark" ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-yellow-700"
                            : theme === "dark" ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-700"
                        }`}
                    >
                      {invoice.status === 'paid' && <CheckCircle size={12} className="mr-1" />}
                      {invoice.status === 'pending' && <Clock size={12} className="mr-1" />}
                      {invoice.status === 'failed' && <AlertCircle size={12} className="mr-1" />}
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button className={`px-3 py-1 rounded-lg text-xs inline-flex items-center transition-colors ${
                      theme === "dark" ? "bg-[#23233c] text-gray-300 hover:bg-[#2a2a4c]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}>
                      <DownloadCloud size={12} className="mr-1" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}