'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { OrderRecord, OrderStatus } from '@/types';
import { formatNaira, getWhatsAppLink, formatPhoneDisplay } from '@/lib/utils/format';
import { useAnnouncer } from '@/components/Announcer';
import {
  Search,
  RefreshCw,
  ShoppingBag,
  Clock,
  AlertTriangle,
  CheckCircle,
  Truck,
  Flame,
  MessageCircle,
  X,
  Eye,
  Check,
  Send,
  User,
  MapPin,
  Calendar,
} from 'lucide-react';

interface SummaryData {
  ordersToday: number;
  awaitingConfirmation: number;
  pendingFeeConfirmation: number;
  totalConfirmedSales: number;
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    ordersToday: 0,
    awaitingConfirmation: 0,
    pendingFeeConfirmation: 0,
    totalConfirmedSales: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  // Modal states for actions
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [interstateFeeInput, setInterstateFeeInput] = useState('');
  const [deliveryTimeInput, setDeliveryTimeInput] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  const { announce } = useAnnouncer();

  const fetchOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const params = new URLSearchParams();
      if (activeTab !== 'All') params.set('status', activeTab);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setOrders(data.orders || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err: unknown) {
      console.error(err);
      announce('Failed to refresh orders', 'assertive');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, searchQuery, announce]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateOrder = async (orderId: string, updates: Record<string, unknown>) => {
    setActionInProgress(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (res.ok && data.order) {
        announce(`Order updated successfully!`);
        // Update selected order in state
        setSelectedOrder((prev) => (prev?.id === orderId ? { ...prev, ...data.order } : prev));
        // Refresh orders list
        fetchOrders(true);
      } else {
        alert(data.error || 'Failed to update order');
      }
    } catch {
      alert('An error occurred while updating the order');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleConfirmPayment = () => {
    if (!selectedOrder) return;
    handleUpdateOrder(selectedOrder.id, {
      status: 'Payment Confirmed',
    });
  };

  const handleRejectPayment = () => {
    if (!selectedOrder || !rejectionReason.trim()) {
      alert('Please enter a reason for rejecting the payment screenshot');
      return;
    }
    handleUpdateOrder(selectedOrder.id, {
      status: 'Cancelled',
      rejectionReason: rejectionReason.trim(),
    });
    setIsRejectModalOpen(false);
    setRejectionReason('');
  };

  const handleSetInterstateFee = () => {
    if (!selectedOrder) return;
    const fee = Number(interstateFeeInput);
    if (isNaN(fee) || fee <= 0) {
      alert('Please enter a valid delivery fee in Naira');
      return;
    }
    handleUpdateOrder(selectedOrder.id, {
      interstateFee: fee,
    });
    setInterstateFeeInput('');
  };

  const handleSetDeliveryTime = () => {
    if (!selectedOrder || !deliveryTimeInput.trim()) return;
    handleUpdateOrder(selectedOrder.id, {
      estimatedDeliveryTime: deliveryTimeInput.trim(),
    });
    setDeliveryTimeInput('');
  };

  const statusFilterTabs = [
    'All',
    'Needs Action',
    'Awaiting Confirmation',
    'Pending Fee Confirmation',
    'Payment Confirmed',
    'Preparing',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Daily Summary Cards */}
      <section aria-labelledby="summary-heading" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <h2 id="summary-heading" className="sr-only">
          Today&apos;s Operations Summary
        </h2>

        {/* Orders Today */}
        <div className="bg-brand-offwhite-card border border-brand-offwhite-border rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-brand-charcoal-700 text-xs font-bold uppercase tracking-wider">
            <span>Orders Today</span>
            <Calendar className="w-4 h-4 text-brand-charcoal-700" aria-hidden="true" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-brand-charcoal-900">
            {summary.ordersToday}
          </div>
        </div>

        {/* Awaiting Confirmation */}
        <div className="bg-brand-fire-50/50 border border-brand-fire-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-brand-fire-800 text-xs font-bold uppercase tracking-wider">
            <span>Proof Uploaded</span>
            <AlertTriangle className="w-4 h-4 text-brand-fire-600" aria-hidden="true" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-brand-fire-800">
            {summary.awaitingConfirmation}
          </div>
        </div>

        {/* Pending Interstate Fee */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-brand-gold-800 text-xs font-bold uppercase tracking-wider">
            <span>Interstate Pending</span>
            <Truck className="w-4 h-4 text-brand-gold-600" aria-hidden="true" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-brand-gold-800">
            {summary.pendingFeeConfirmation}
          </div>
        </div>

        {/* Confirmed Sales */}
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <span>Confirmed Sales</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-800">
            {formatNaira(summary.totalConfirmedSales)}
          </div>
        </div>
      </section>

      {/* 2. Search & Filter Bar */}
      <div className="bg-brand-offwhite-card border border-brand-offwhite-border rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order code, phone, or name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-offwhite-border text-sm min-touch-target focus:ring-2 focus:ring-brand-fire-700 bg-white"
            />
            <Search className="w-4 h-4 text-brand-charcoal-700 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-brand-offwhite-border bg-brand-offwhite hover:bg-brand-offwhite-subtle text-xs font-bold text-brand-charcoal-900 min-touch-target"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-brand-fire-700' : ''}`} aria-hidden="true" />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {statusFilterTabs.map((tab) => {
            const isCurrent = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded-lg font-bold whitespace-nowrap min-touch-target transition-colors ${
                  isCurrent
                    ? 'bg-brand-charcoal-900 text-white'
                    : 'bg-brand-offwhite hover:bg-brand-offwhite-subtle text-brand-charcoal-800 border border-brand-offwhite-border'
                }`}
              >
                {tab}
                {tab === 'Needs Action' && summary.awaitingConfirmation + summary.pendingFeeConfirmation > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-brand-fire-600 text-white text-[10px]">
                    {summary.awaitingConfirmation + summary.pendingFeeConfirmation}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Orders List Table / Grid */}
      <section aria-labelledby="orders-list-heading">
        <h2 id="orders-list-heading" className="sr-only">
          Customer Orders List
        </h2>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-brand-fire-700" aria-hidden="true" />
            <p className="text-sm text-brand-charcoal-700">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-brand-offwhite-card border border-brand-offwhite-border rounded-2xl p-12 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 mx-auto text-brand-charcoal-700" aria-hidden="true" />
            <h3 className="text-lg font-bold text-brand-charcoal-900">No Orders Found</h3>
            <p className="text-xs text-brand-charcoal-700">
              There are currently no orders matching your selected filter.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const needsAction =
                order.status === 'Awaiting Confirmation' ||
                order.status === 'Pending Fee Confirmation';

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedOrder(order);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`bg-brand-offwhite-card border rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    needsAction
                      ? 'border-brand-fire-500 ring-2 ring-brand-fire-500/20 bg-brand-fire-50/10'
                      : 'border-brand-offwhite-border hover:border-brand-charcoal-700'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-lg text-brand-charcoal-900">
                        #{order.order_code}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          order.status === 'Awaiting Confirmation'
                            ? 'bg-brand-fire-100 text-brand-fire-800 border border-brand-fire-300'
                            : order.status === 'Pending Fee Confirmation'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : order.status === 'Payment Confirmed' || order.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-brand-charcoal-100 text-brand-charcoal-800'
                        }`}
                      >
                        {order.status}
                      </span>

                      {needsAction && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-brand-fire-700 text-white animate-pulse">
                          Needs Action
                        </span>
                      )}

                      <span className="text-xs text-brand-charcoal-700">
                        {new Date(order.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-brand-charcoal-900">
                      {order.customer_name} •{' '}
                      <span className="text-brand-charcoal-700 font-normal">
                        {formatPhoneDisplay(order.customer_phone)}
                      </span>
                    </div>

                    <div className="text-xs text-brand-charcoal-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-fire-700 shrink-0" aria-hidden="true" />
                      <span>
                        {order.customer_address}
                        {order.area ? `, ${order.area}` : ''} ({order.state})
                      </span>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="text-xs text-brand-charcoal-800">
                        {order.items.map((i) => `${i.quantity}× ${i.product_name}${i.sauce_name ? ` (${i.sauce_name})` : ''}`).join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Right side: Amount & CTA */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-brand-offwhite-subtle">
                    <span className="text-xl font-black text-brand-charcoal-900">
                      {formatNaira(order.total_amount)}
                    </span>
                    <span className="text-xs text-brand-fire-700 font-bold underline sm:mt-1">
                      Manage Order →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Order Detail Drawer / Modal */}
      {selectedOrder && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-drawer-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end"
        >
          <div className="w-full max-w-xl h-full bg-brand-offwhite-card shadow-2xl overflow-y-auto flex flex-col animate-slide-left">
            {/* Modal Header */}
            <div className="sticky top-0 bg-brand-offwhite-card/95 backdrop-blur-md px-6 py-4 border-b border-brand-offwhite-border flex items-center justify-between z-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-fire-700">
                  Order Management
                </span>
                <h3 id="order-drawer-title" className="text-xl font-black text-brand-charcoal-900">
                  Order #{selectedOrder.order_code}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order details"
                className="w-10 h-10 rounded-xl hover:bg-brand-offwhite flex items-center justify-center text-brand-charcoal-800 min-touch-target"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Current Status Pill */}
              <div className="p-4 rounded-xl bg-brand-offwhite border border-brand-offwhite-border flex items-center justify-between">
                <div>
                  <span className="text-xs text-brand-charcoal-700 block">Status</span>
                  <span className="font-extrabold text-base text-brand-charcoal-900">
                    {selectedOrder.status}
                  </span>
                </div>

                {selectedOrder.estimated_delivery_time && (
                  <div className="text-right">
                    <span className="text-xs text-brand-charcoal-700 block">ETA</span>
                    <span className="font-bold text-sm text-brand-fire-700">
                      {selectedOrder.estimated_delivery_time}
                    </span>
                  </div>
                )}
              </div>

              {/* ACTION SECTION 1: Interstate Fee Setting */}
              {selectedOrder.status === 'Pending Fee Confirmation' && (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 space-y-3">
                  <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-700" aria-hidden="true" />
                    <span>Set Interstate Delivery Fee</span>
                  </h4>
                  <p className="text-xs text-amber-900">
                    Customer is in <strong>{selectedOrder.state}</strong>. Enter the agreed transit fee to unlock bank payment details for them.
                  </p>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm text-brand-charcoal-700">
                        ₦
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={interstateFeeInput}
                        onChange={(e) => setInterstateFeeInput(e.target.value)}
                        placeholder="e.g. 3500"
                        className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-amber-300 text-sm font-bold bg-white min-touch-target"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSetInterstateFee}
                      disabled={actionInProgress}
                      className="py-2.5 px-4 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-sm min-touch-target whitespace-nowrap"
                    >
                      Save & Unlock
                    </button>
                  </div>
                </div>
              )}

              {/* ACTION SECTION 2: Payment Proof Verification */}
              {selectedOrder.status === 'Awaiting Confirmation' && (
                <div className="p-5 rounded-2xl bg-brand-fire-50/60 border border-brand-fire-300 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-brand-fire-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-brand-fire-600" aria-hidden="true" />
                      <span>Verify Payment Proof</span>
                    </h4>
                    <span className="text-xs font-bold text-brand-charcoal-900">
                      Amount: {formatNaira(selectedOrder.total_amount)}
                    </span>
                  </div>

                  {/* Payment Proof Preview */}
                  {(selectedOrder as unknown as { payment_proof_url?: string }).payment_proof_url ? (
                    <div className="space-y-2">
                      <div
                        onClick={() => setIsImageModalOpen(true)}
                        className="relative rounded-xl overflow-hidden border border-brand-fire-200 bg-black h-48 cursor-zoom-in group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={(selectedOrder as unknown as { payment_proof_url: string }).payment_proof_url}
                          alt="Customer Payment Receipt"
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold gap-1.5">
                          <Eye className="w-4 h-4" />
                          <span>Click to View Full Size</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-brand-charcoal-700">
                      Proof recorded in storage path: {selectedOrder.payment_proof_path}
                    </p>
                  )}

                  {/* Confirm / Reject Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleConfirmPayment}
                      disabled={actionInProgress}
                      className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl min-touch-target flex items-center justify-center gap-1.5 shadow"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm Payment</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsRejectModalOpen(true)}
                      disabled={actionInProgress}
                      className="py-3 px-4 bg-red-100 hover:bg-red-200 text-red-800 font-bold text-sm rounded-xl min-touch-target"
                    >
                      Reject Proof
                    </button>
                  </div>
                </div>
              )}

              {/* ACTION SECTION 3: Step Advancement */}
              <div className="p-4 rounded-xl bg-brand-offwhite border border-brand-offwhite-border space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-charcoal-700 block">
                  Advance Order Status
                </span>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateOrder(selectedOrder.id, { status: 'Preparing' })}
                    disabled={actionInProgress || selectedOrder.status === 'Preparing'}
                    className="px-3 py-2 bg-brand-charcoal-900 hover:bg-brand-charcoal-800 disabled:opacity-40 text-white rounded-lg text-xs font-bold min-touch-target flex items-center gap-1.5"
                  >
                    <Flame className="w-3.5 h-3.5 text-brand-fire-500" />
                    <span>Preparing (Grill)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateOrder(selectedOrder.id, { status: 'Out for Delivery' })}
                    disabled={actionInProgress || selectedOrder.status === 'Out for Delivery'}
                    className="px-3 py-2 bg-brand-charcoal-900 hover:bg-brand-charcoal-800 disabled:opacity-40 text-white rounded-lg text-xs font-bold min-touch-target flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5 text-brand-gold-400" />
                    <span>Out for Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateOrder(selectedOrder.id, { status: 'Delivered' })}
                    disabled={actionInProgress || selectedOrder.status === 'Delivered'}
                    className="px-3 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 text-white rounded-lg text-xs font-bold min-touch-target flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mark Delivered</span>
                  </button>
                </div>
              </div>

              {/* ACTION SECTION 4: Set Estimated Delivery Time */}
              <div className="p-4 rounded-xl bg-brand-offwhite border border-brand-offwhite-border space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-charcoal-700 block">
                  Set Estimated Delivery Time
                </span>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={deliveryTimeInput}
                    onChange={(e) => setDeliveryTimeInput(e.target.value)}
                    placeholder="e.g. 45 to 60 minutes"
                    className="flex-1 px-3 py-2 rounded-xl border border-brand-offwhite-border text-sm min-touch-target bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleSetDeliveryTime}
                    disabled={actionInProgress}
                    className="px-4 py-2 bg-brand-charcoal-900 text-white rounded-xl text-xs font-bold min-touch-target"
                  >
                    Set ETA
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['30 to 45 mins', '45 to 60 mins', '60 to 90 mins'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        handleUpdateOrder(selectedOrder.id, { estimatedDeliveryTime: preset })
                      }
                      className="px-2.5 py-1 rounded bg-brand-offwhite-subtle border border-brand-offwhite-border text-[11px] font-semibold text-brand-charcoal-800 hover:bg-white"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Contact & WhatsApp */}
              <div className="space-y-3 border-t border-brand-offwhite-subtle pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal-700">
                  Customer & Delivery Details
                </h4>

                <div className="bg-white rounded-xl p-4 border border-brand-offwhite-border space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-charcoal-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-brand-fire-700" />
                      {selectedOrder.customer_name}
                    </span>
                    <span className="text-xs text-brand-charcoal-700">
                      {formatPhoneDisplay(selectedOrder.customer_phone)}
                    </span>
                  </div>

                  <div className="text-xs text-brand-charcoal-800 flex items-start gap-2 pt-1 border-t border-brand-offwhite-subtle">
                    <MapPin className="w-4 h-4 text-brand-fire-700 shrink-0 mt-0.5" />
                    <div>
                      <p>
                        {selectedOrder.customer_address}
                        {selectedOrder.area ? `, ${selectedOrder.area}` : ''}, {selectedOrder.state}
                      </p>
                      {selectedOrder.order_note && (
                        <p className="mt-1 italic text-brand-charcoal-700">
                          Note: &quot;{selectedOrder.order_note}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* WhatsApp Chat Button */}
                <a
                  href={getWhatsAppLink(
                    selectedOrder.customer_phone,
                    `Hello ${selectedOrder.customer_name}, this is Emari Grill regarding your order #${selectedOrder.order_code}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-green-700 hover:bg-green-800 text-white font-bold text-sm rounded-xl min-touch-target flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat with Customer on WhatsApp</span>
                </a>
              </div>

              {/* Ordered Items List */}
              <div className="space-y-3 border-t border-brand-offwhite-subtle pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal-700">
                  Items Ordered
                </h4>

                <ul className="divide-y divide-brand-offwhite-subtle bg-white rounded-xl p-3 border border-brand-offwhite-border">
                  {selectedOrder.items?.map((item, idx) => (
                    <li key={item.id || idx} className="py-2 flex items-center justify-between text-sm">
                      <div>
                        <span className="font-bold text-brand-charcoal-900">
                          {item.quantity}× {item.product_name}
                        </span>
                        {item.sauce_name && (
                          <span className="block text-xs text-brand-charcoal-700">
                            Sauce: {item.sauce_name}
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-brand-charcoal-900">
                        {formatNaira(item.total_price || item.unit_price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2 space-y-1 text-xs sm:text-sm">
                  <div className="flex justify-between text-brand-charcoal-700">
                    <span>Subtotal:</span>
                    <span>{formatNaira(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-brand-charcoal-700">
                    <span>Delivery Fee:</span>
                    <span>{formatNaira(selectedOrder.delivery_fee)}</span>
                  </div>
                  <div className="flex justify-between font-black text-base text-brand-charcoal-900 border-t border-brand-offwhite-border pt-1">
                    <span>Total Amount:</span>
                    <span>{formatNaira(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Reject Payment Modal */}
      {isRejectModalOpen && selectedOrder && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-modal-title"
          className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <h4 id="reject-modal-title" className="text-lg font-bold text-red-950">
              Reject Payment Screenshot
            </h4>
            <p className="text-xs text-brand-charcoal-700">
              Please enter the reason so the customer understands why it was rejected (e.g. transfer not received, wrong amount, fake receipt).
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Payment not seen in our bank statement. Please verify transfer."
              className="w-full p-3 rounded-xl border border-brand-offwhite-border text-sm min-touch-target"
            />

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-brand-offwhite-border text-xs font-bold text-brand-charcoal-800 min-touch-target"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectPayment}
                disabled={actionInProgress}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold min-touch-target"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Full Size Image Zoom Modal */}
      {isImageModalOpen && selectedOrder && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsImageModalOpen(false)}
          className="fixed inset-0 z-60 bg-black/90 p-4 flex items-center justify-center cursor-zoom-out"
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={(selectedOrder as unknown as { payment_proof_url: string }).payment_proof_url}
              alt="Payment proof receipt full size"
              className="max-h-[85vh] w-auto object-contain rounded-lg shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white min-touch-target"
              aria-label="Close full size image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
