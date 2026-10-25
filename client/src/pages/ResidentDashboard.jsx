import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Truck,
  Award,
  PlusCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { reportService, pickupService, rewardService } from '../services/api.js';
import { StatusBadge, CategoryBadge, UrgencyBadge } from '../components/common/Badge.jsx';
import { CardSkeleton, StatSkeleton } from '../components/common/LoadingSkeleton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export const ResidentDashboard = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [rewardData, setRewardData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [repRes, pickRes, rewRes] = await Promise.all([
          reportService.getMyReports({ limit: 4, sortBy: 'createdAt', order: 'desc' }),
          pickupService.getMyPickups({ limit: 3 }),
          rewardService.getMyRewards()
        ]);

        if (repRes.data.success) setReports(repRes.data.reports || []);
        if (pickRes.data.success) setPickups(pickRes.data.pickups || []);
        if (rewRes.data.success) setRewardData(rewRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Could not load some dashboard metrics. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const pendingReportsCount = reports.filter((r) => r.status === 'Pending').length;
  const activePickupsCount = pickups.filter((p) => ['Pending', 'Approved', 'Assigned', 'In Progress'].includes(p.status)).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold backdrop-blur-xs">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            {rewardData?.tier?.name || 'Eco Novice'} Tier
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.name || 'Resident'}! 👋
          </h1>
          <p className="text-emerald-100 text-sm leading-relaxed">
            Welcome to your sustainability hub. Report neighborhood waste hazards, track municipal collection progress,
            and earn rewards for keeping your community clean.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/reports/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-brand-900 rounded-xl font-bold text-xs sm:text-sm hover:bg-emerald-50 transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-brand-700" />
              <span>Report Waste</span>
            </Link>
            <Link
              to="/pickups"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-700/60 hover:bg-brand-700 text-white rounded-xl font-semibold text-xs sm:text-sm border border-white/20 transition-colors"
            >
              <Truck className="w-4 h-4" />
              <span>Schedule Pickup</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      {loading ? (
        <StatSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Points */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reward Points</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1 font-heading">
                {rewardData?.points ?? (user?.points || 0)}
              </p>
              <Link to="/rewards" className="text-[11px] font-semibold text-brand-700 hover:underline mt-1 inline-block">
                View Ledger & Ranks →
              </Link>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Award className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Reports */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted Reports</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1 font-heading">{reports.length}</p>
              <Link to="/reports" className="text-[11px] font-semibold text-brand-700 hover:underline mt-1 inline-block">
                Manage Reports →
              </Link>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Pending */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Verification</p>
              <p className="text-2xl font-extrabold text-amber-600 mt-1 font-heading">{pendingReportsCount}</p>
              <p className="text-[11px] text-slate-400 mt-1">Awaiting dispatch</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Pickups */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Pickups</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1 font-heading">{activePickupsCount}</p>
              <Link to="/pickups" className="text-[11px] font-semibold text-brand-700 hover:underline mt-1 inline-block">
                View Schedule →
              </Link>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Truck className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Progress & Tier Card */}
      {rewardData?.tier && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">Recycling Tier Status</span>
              <h3 className="text-lg font-bold text-slate-900">{rewardData.tier.name}</h3>
            </div>
            <div className="text-sm font-semibold text-slate-600">
              {rewardData.tier.nextThreshold
                ? `${rewardData.tier.nextThreshold - rewardData.points} points needed for next tier`
                : 'Highest Tier Achieved!'}
            </div>
          </div>

          {rewardData.tier.nextThreshold && (
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-brand-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${rewardData.tier.currentProgress || 10}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {/* Two Column Layout: Recent Reports & Pickups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Recent Reports */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Recent Waste Reports</h2>
              <p className="text-xs text-slate-500">Your latest reported waste hazards</p>
            </div>
            <Link
              to="/reports"
              className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <CardSkeleton count={2} />
          ) : reports.length === 0 ? (
            <EmptyState
              title="No reports submitted yet"
              description="Help keep your neighborhood clean by submitting your first waste hazard report."
              actionText="Create Report"
              actionLink="/reports/new"
            />
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <CategoryBadge category={report.category} />
                      <StatusBadge status={report.status} />
                      <UrgencyBadge urgency={report.urgency} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 truncate">{report.title}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{report.location}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span className="text-[11px] text-slate-400">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      to={`/reports/${report._id}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1 col): Upcoming Pickups */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Pickup Schedule</h2>
              <p className="text-xs text-slate-500">Doorstep recyclable collections</p>
            </div>
            <Link
              to="/pickups"
              className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <CardSkeleton count={1} />
          ) : pickups.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center space-y-3">
              <Truck className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500">No scheduled pickups currently pending.</p>
              <Link
                to="/pickups"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:underline"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Schedule a collection
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {pickups.map((pickup) => (
                <div
                  key={pickup._id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <CategoryBadge category={pickup.category} />
                    <StatusBadge status={pickup.status} />
                  </div>
                  <div className="text-xs space-y-1 text-slate-600">
                    <p className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-brand-600" />
                      {new Date(pickup.preferredDate).toLocaleDateString()}
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {pickup.timeSlot}
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-500 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {pickup.address}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;
