import React, { useState, useEffect, useCallback } from 'react';
import {
  Truck,
  PlusCircle,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  X,
  AlertCircle,
  FileText
} from 'lucide-react';
import { pickupService } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { StatusBadge, CategoryBadge } from '../components/common/Badge.jsx';
import { CardSkeleton } from '../components/common/LoadingSkeleton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export const PickupRequestsPage = () => {
  const { user } = useAuth();
  const { toast } = useNotification();

  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // New Pickup Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Tomorrow's date formatted as YYYY-MM-DD for min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    category: 'plastic',
    address: user?.address || '',
    preferredDate: minDate,
    timeSlot: '08:00 AM - 11:00 AM',
    instructions: ''
  });

  const categories = [
    { id: 'plastic', label: 'Plastic (Sorted Containers)' },
    { id: 'paper', label: 'Paper & Cardboard' },
    { id: 'glass', label: 'Glass Bottles' },
    { id: 'organic', label: 'Organic / Garden Yard Trimmings' },
    { id: 'electronic', label: 'Electronic Scrap & Appliances' },
    { id: 'mixed', label: 'Mixed Recyclables' }
  ];

  const timeSlots = [
    '08:00 AM - 11:00 AM',
    '11:00 AM - 02:00 PM',
    '02:00 PM - 05:00 PM',
    '05:00 PM - 08:00 PM'
  ];

  const fetchPickups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await pickupService.getMyPickups({ status: statusFilter });
      if (res.data.success) {
        setPickups(res.data.pickups || []);
      }
    } catch (err) {
      console.error('Failed to load pickups:', err);
      toast.error('Could not load pickup requests');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    fetchPickups();
  }, [fetchPickups]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.address.trim() || !formData.preferredDate || !formData.timeSlot) {
      toast.error('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await pickupService.create(formData);
      toast.success('Pickup request submitted successfully!');
      setModalOpen(false);
      setFormData({
        category: 'plastic',
        address: user?.address || '',
        preferredDate: minDate,
        timeSlot: '08:00 AM - 11:00 AM',
        instructions: ''
      });
      fetchPickups();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to schedule pickup';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this pending pickup request?')) return;
    try {
      await pickupService.update(id, { status: 'Cancelled' });
      toast.success('Pickup request cancelled');
      fetchPickups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel pickup');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doorstep Pickup Requests</h1>
          <p className="text-xs text-slate-500">
            Schedule on-demand doorstep collection for sorted recyclables and e-waste.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Schedule New Pickup</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {['all', 'Pending', 'Approved', 'Assigned', 'In Progress', 'Completed', 'Cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
              statusFilter === st
                ? 'bg-brand-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Pickups List */}
      {loading ? (
        <CardSkeleton count={3} />
      ) : pickups.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No pickup requests found"
          description="You haven't scheduled any doorstep collections for this filter yet."
          actionText="Request a Pickup"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pickups.map((item) => {
            const isPending = item.status === 'Pending';
            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <CategoryBadge category={item.category} />
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700">
                    <p className="flex items-center gap-2 font-bold text-slate-900">
                      <Calendar className="w-4 h-4 text-brand-700" />
                      <span>{new Date(item.preferredDate).toLocaleDateString()}</span>
                    </p>
                    <p className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.timeSlot}</span>
                    </p>
                    <p className="flex items-center gap-2 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{item.address}</span>
                    </p>
                  </div>

                  {item.instructions && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-700">Notes: </span>
                      {item.instructions}
                    </div>
                  )}

                  {item.assignedCollector && (
                    <div className="text-[11px] text-brand-800 bg-brand-50/60 p-2 rounded-lg border border-brand-100">
                      <span className="font-semibold">Collector: </span>
                      {item.assignedCollector}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Req #{item._id.slice(-5).toUpperCase()}</span>
                  {isPending && (
                    <button
                      onClick={() => handleCancel(item._id)}
                      className="text-rose-600 font-semibold hover:underline"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Pickup Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200 animate-slide-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-700 text-white flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Request Doorstep Pickup</h3>
                  <p className="text-[11px] text-slate-500">Pickups earn 25 community reward points upon completion.</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Waste Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pickup Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street name, house number, landmark"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    min={minDate}
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Time Window *
                  </label>
                  <select
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {timeSlots.map((ts) => (
                      <option key={ts} value={ts}>{ts}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="e.g., Bags kept on front porch; call upon arrival."
                  maxLength={500}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                ></textarea>
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow-sm"
                >
                  {submitting ? 'Scheduling...' : 'Confirm Pickup Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickupRequestsPage;
