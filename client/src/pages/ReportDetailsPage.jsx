import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  User,
  ShieldAlert,
  Award,
  CheckCircle2,
  Trash2,
  Camera,
  AlertCircle
} from 'lucide-react';
import { reportService } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { StatusBadge, CategoryBadge, UrgencyBadge } from '../components/common/Badge.jsx';

export const ReportDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useNotification();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await reportService.getById(id);
        if (res.data.success) {
          setReport(res.data.report);
        }
      } catch (err) {
        console.error('Error fetching report details:', err);
        const msg = err.response?.data?.message || 'Report not found or access restricted';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleCancelReport = async () => {
    if (!window.confirm('Are you sure you want to cancel this pending report?')) return;
    setCancelling(true);
    try {
      await reportService.delete(id);
      toast.success('Report has been cancelled');
      navigate('/reports');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel report');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-700 rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-medium">Loading report lifecycle details...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Unable to View Report</h2>
        <p className="text-xs text-slate-500">{error || 'Report does not exist.'}</p>
        <Link
          to="/reports"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Reports</span>
        </Link>
      </div>
    );
  }

  const isOwner = report.resident?._id === user?.id || report.resident === user?.id;
  const isPending = report.status === 'Pending';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to={isAdmin ? '/admin/reports' : '/reports'}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono text-slate-400">
                #{report._id.slice(-6).toUpperCase()}
              </span>
              <CategoryBadge category={report.category} />
              <StatusBadge status={report.status} />
              <UrgencyBadge urgency={report.urgency} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{report.title}</h1>
          </div>
        </div>

        {/* Quick action for resident if Pending */}
        {isOwner && isPending && (
          <button
            onClick={handleCancelReport}
            disabled={cancelling}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{cancelling ? 'Cancelling...' : 'Cancel Report'}</span>
          </button>
        )}
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Details and Photo */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400">
              Report Summary
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {report.description}
            </p>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">{report.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{new Date(report.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Photo Evidence */}
          {report.imageUrl ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-brand-600" />
                <span>Photographic Evidence</span>
              </h3>
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900">
                <img
                  src={report.imageUrl.startsWith('http') ? report.imageUrl : `${report.imageUrl}`}
                  alt="Waste hazard evidence"
                  className="w-full max-h-96 object-contain mx-auto"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 text-center text-xs text-slate-400">
              No photo was uploaded with this report.
            </div>
          )}
        </div>

        {/* Right Column (1 col): Collector, Points, and Status */}
        <div className="space-y-6">
          {/* Points Status */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Reward Status</h4>
            {report.pointsAwarded ? (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <Award className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold">Reward Points Deposited</p>
                  <p className="text-lg font-extrabold text-emerald-700 font-heading">
                    +{report.pointsAmount || 20} pts
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                Points will be awarded automatically once municipal collection is marked{' '}
                <span className="font-semibold text-slate-800">Completed</span>.
              </div>
            )}
          </div>

          {/* Assigned Collector */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Dispatch</h4>
            {report.assignedCollector ? (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-xs">
                  🚛
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{report.assignedCollector}</p>
                  <p className="text-[11px] text-slate-400">Field Collection Crew</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No field team assigned yet</p>
            )}
          </div>

          {/* Reporter Info (Admin or Self) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Submitted By</h4>
            <p className="text-xs font-bold text-slate-800">{report.resident?.name || 'Resident'}</p>
            {report.resident?.email && (
              <p className="text-xs text-slate-500">{report.resident.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Chronological Status Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Chronological Status History</h3>
          <p className="text-xs text-slate-500">
            Transparent municipal dispatch log and verification records.
          </p>
        </div>

        <div className="relative pl-6 sm:pl-8 border-l-2 border-brand-200 space-y-8 my-4">
          {report.statusHistory && report.statusHistory.length > 0 ? (
            report.statusHistory.map((step, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline node icon */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-0.5 w-6 h-6 rounded-full bg-brand-700 text-white flex items-center justify-center ring-4 ring-white shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <StatusBadge status={step.status} />
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(step.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {step.note || `Status transitioned to ${step.status}`}
                  </p>

                  {step.updatedBy && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                      <User className="w-3 h-3" />
                      <span>Updated by: {step.updatedBy.name || 'System'} ({step.updatedBy.role || 'Staff'})</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-400">No status logs recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetailsPage;
