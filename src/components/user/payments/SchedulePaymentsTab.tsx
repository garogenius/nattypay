"use client";

import React, { useState } from "react";
import Image, { StaticImageData } from "next/image";
import { IoAdd } from "react-icons/io5";
import { HiOutlineTrash } from "react-icons/hi";
import { FiClock } from "react-icons/fi";
import { NetworkProvider } from "@/components/user/bill/bill.data";
import AddSchedulePaymentModal from "@/components/modals/AddSchedulePaymentModal";
import ConfirmDialog from "@/components/modals/ConfirmDialog";

interface ScheduledPayment {
  id: string;
  type: "airtime" | "data";
  network: string;
  amount: number;
  frequency: string;
  logo: StaticImageData;
}

const SchedulePaymentsTab: React.FC = () => {
  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPayment[]>([
    {
      id: "1",
      type: "airtime",
      network: "MTN",
      amount: 5000,
      frequency: "Every Sunday",
      logo: NetworkProvider[0].logo,
    },
    {
      id: "2", 
      type: "airtime",
      network: "GLO",
      amount: 5000,
      frequency: "Every Sunday",
      logo: NetworkProvider[1].logo,
    },
    {
      id: "3",
      type: "airtime", 
      network: "MTN",
      amount: 5000,
      frequency: "Every Sunday",
      logo: NetworkProvider[0].logo,
    },
    {
      id: "4",
      type: "airtime",
      network: "MTN", 
      amount: 5000,
      frequency: "Every Sunday",
      logo: NetworkProvider[0].logo,
    },
    {
      id: "5",
      type: "airtime",
      network: "AIRTEL",
      amount: 5000,
      frequency: "Every Sunday", 
      logo: NetworkProvider[2].logo,
    },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<ScheduledPayment | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const handleAddPayment = (newPayment: ScheduledPayment) => {
    setScheduledPayments(prev => [...prev, newPayment]);
  };

  const handleDeletePayment = (id: string) => {
    setDeletingPaymentId(id);
    setConfirmOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!deletingPaymentId) return;
    try {
      setDeletingLoading(true);
      // If later connected to backend, place API call here
      setScheduledPayments(prev => prev.filter(p => p.id !== deletingPaymentId));
    } finally {
      setDeletingLoading(false);
      setConfirmOpen(false);
      setDeletingPaymentId(null);
    }
  };

  const handleEditPayment = (payment: ScheduledPayment) => {
    setEditingPayment(payment);
    setIsEditModalOpen(true);
  };

  const handleSavePayment = (updated: ScheduledPayment) => {
    setScheduledPayments(prev => prev.map(p => (p.id === updated.id ? { ...p, ...updated } : p)));
    setIsEditModalOpen(false);
    setEditingPayment(null);
  };

  return (
    <div className="relative flex flex-col gap-4 rounded-3xl border border-border-800/70 dark:border-border-700/70 bg-bg-600/20 dark:bg-bg-1100/20 p-4 sm:p-5 md:p-6">
      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm rounded-3xl flex items-center justify-center pointer-events-auto">
        <div className="text-center px-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#D4B139]/20 flex items-center justify-center border-2 border-[#D4B139]">
            <FiClock className="text-3xl text-[#D4B139]" />
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">Coming Soon</h3>
          <p className="text-white/70 text-sm">Schedule payments feature will be available soon</p>
        </div>
      </div>

      {/* Content - disabled with pointer-events-none */}
      <div className="pointer-events-none opacity-50">
        {/* Add New Schedule Payment Button */}
        <div 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 sm:gap-3 px-2 py-2 sm:px-4 sm:py-3 rounded-xl bg-transparent cursor-pointer"
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary flex items-center justify-center">
            <IoAdd className="text-black text-sm sm:text-base" />
          </div>
          <span className="text-primary text-sm">Add New Schedule Payment</span>
        </div>

        {/* Scheduled Payments List */}
        <div className="flex flex-col gap-3.5 mt-4">
          {scheduledPayments.map((payment) => (
            <div
              key={payment.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-2xl border border-border-800/60 dark:border-border-700/60 bg-bg-600 dark:bg-bg-1100 hover:bg-white/5 transition-colors"
            >
              {/* Left Side - Network Info */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden">
                    <Image
                      src={payment.logo}
                      alt={payment.network}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] leading-[10px] bg-white/5 text-white/50 capitalize">{payment.network.toLowerCase()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium text-sm">
                    {payment.type === "airtime" ? "Airtime" : "Data"}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs text-white/60">
                    <span className="text-primary">₦{payment.amount.toLocaleString()}.00</span>
                    <span className="w-1 h-1 rounded-full bg-white/30 inline-block" />
                    <span className="text-white/80">{payment.frequency}</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Action Buttons */}
              <div className="flex items-center gap-4 sm:gap-5 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                <button
                  onClick={() => handleEditPayment(payment)}
                  className="text-white/70 hover:text-white text-[11px] sm:text-xs font-medium transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeletePayment(payment.id)}
                  className="text-white/50 hover:text-white/70 text-[11px] sm:text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                >
                  <HiOutlineTrash className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Schedule Payment Modal */}
      <AddSchedulePaymentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddPayment}
      />

      {/* Edit Schedule Payment Modal */}
      <AddSchedulePaymentModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingPayment(null); }}
        onSave={handleSavePayment}
        initialPayment={editingPayment as any}
      />

      {/* Global Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Scheduled Payment"
        description="Are you sure you want to delete this scheduled payment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={onConfirmDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingPaymentId(null); }}
        isLoading={deletingLoading}
      />
    </div>
  );
};

export default SchedulePaymentsTab;
