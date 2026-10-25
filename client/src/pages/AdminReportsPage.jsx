import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  Edit,
  MapPin,
  Calendar,
  CheckCircle,
  Truck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Award
} from 'lucide-react';
import { adminService } from '../services/api.js';
import { useNotification } from '../context/NotificationContext.jsx';
import { StatusBadge, CategoryBadge, UrgencyBadge } from '../components/common/Badge.jsx';
import { TableSkeleton } from '../components/common/LoadingSkeleton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export const AdminReportsPage = () => {
  const { toast } = useNotification();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [urgency, setUrgency] = useState('all');

  // Status Update Modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [newStatus, setNewStatus] = useState('Pending');
  const [assignedCollector, setAssignedCollector] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getReports({
        search,
        category,
        status,
        urgency,
        page,
        limit: 10
      });
      if (res.data.success) {
        setReports(res.data.reports || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load admin reports:', err);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [search, category, status, urgency, page, toast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleOpenStatusModal = (report) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setAssignedCollector(report.assignedCollector || '');
    setAdminNote('');
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    setUpdating(true);

    try {
      const res = await adminService.updateReportStatus(selectedReport._id, {
        status: newStatus,
        assignedCollector,
        note: adminNote || `Status updated to ${newStatus} by administrator`
      });

      if (res.data.rewardResult?.awarded) {
        toast.success(
          `Report marked Completed! Awarded ${res.data.rewardResult.points} points to ${selectedReport.resident?.name || 'resident'}.`
        );
      } else {
        toast.success(`Report status updated to '${newStatus}'`);
      }

      setSelectedReport(null);
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Municipal Report Management</h1>
        <p className="text-xs text-slate-500">
          Review reported waste hazards, dispatch field collection crews, update statuses, and award verified points.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search title, location, collector..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Categories</option>
            <option value="plastic">Plastic</option>
            <option value="paper">Paper</option>
            <option value="glass">Glass</option>
            <option value="organic">Organic</option>
            <option value="electronic">Electronic</option>
            <option value="mixed">Mixed</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={urgency}
            onChange={(e) => {
              setUrgency(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Urgency Levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : reports.length === 0 ? (
        <EmptyState
          title="No reports matching search filters"
          description="Adjust your search criteria or filters to inspect other municipal reports."
          actionText="Reset Filters"
          onAction={() => {
            setSearch('');
            setCategory('all');
            setStatus('all');
            setUrgency('all');
          }}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Case / Date</th>
                  <th className="py-3.5 px-4 sm:px-6">Report Title & Location</th>
                  <th className="py-3.5 px-4 sm:px-6">Category</th>
                  <th className="py-3.5 px-4 sm:px-6">Urgency</th>
                  <th className="py-3.5 px-4 sm:px-6">Status</th>
                  <th className="py-3.5 px-4 sm:px-6">Assigned Collector</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        #{report._id.slice(-5).toUpperCase()}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 max-w-xs">
                      <p className="font-bold text-slate-900 truncate">{report.title}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>{report.location}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        By: {report.resident?.name || 'Resident'}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <CategoryBadge category={report.category} />
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <UrgencyBadge urgency={report.urgency} />
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <StatusBadge status={report.status} />
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-xs text-slate-600">
                      {report.assignedCollector || (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/reports/${report._id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                          title="View Full Timeline"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleOpenStatusModal(report)}
                          className="px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-800 font-bold text-xs border border-brand-200 transition-colors flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Update</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                Page {page} of {pages} ({total} reports)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, pages))}
                  disabled={page === pages}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin Status & Collector Update Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200 animate-slide-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Update Report Status</h3>
                <p className="text-xs text-slate-500 font-mono">
                  Case #{selectedReport._id.slice(-6).toUpperCase()} — {selectedReport.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Lifecycle Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed (Awards Points)</option>
                  <option value="Rejected">Rejected</option>
                </select>
                {newStatus === 'Completed' && (
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>Setting status to Completed will automatically deposit reward points to the resident!</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assigned Collector / Vehicle Unit
                </label>
                <input
                  type="text"
                  value={assignedCollector}
                  onChange={(e) => setAssignedCollector(e.target.value)}
                  placeholder="e.g., Rapid Dispatch Unit #3 (Officer Diaz)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Administrative Note (Recorded in Public Timeline)
                </label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g., Verified by municipal dispatch; crew scheduled for afternoon clearing."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                ></textarea>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow-sm"
                >
                  {updating ? 'Saving Status...' : 'Apply Status Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;
