import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  Clock,
  Truck,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { adminService } from '../services/api.js';
import { StatusBadge, CategoryBadge, UrgencyBadge } from '../components/common/Badge.jsx';
import { StatSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton.jsx';

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDashboardStats();
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
        setError('Failed to fetch administrator analytics. Ensure you are signed in as an administrator.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  const CATEGORY_COLORS = ['#059669', '#0284c7', '#d97706', '#84cc16', '#7c3aed', '#64748b'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Operations Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Municipal Waste & Analytics Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time operations metrics, dispatch tracking, and category breakdown across the municipality.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/reports"
            className="px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Manage Reports</span>
          </Link>
          <Link
            to="/admin/users"
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
          >
            <Users className="w-4 h-4 text-slate-500" />
            <span>User Directory</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      {loading ? (
        <StatSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Citizens</p>
            <p className="text-2xl font-extrabold text-slate-900 font-heading">{data?.stats?.totalUsers || 0}</p>
            <p className="text-[11px] text-slate-400">Active accounts</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reports</p>
            <p className="text-2xl font-extrabold text-slate-900 font-heading">{data?.stats?.totalReports || 0}</p>
            <p className="text-[11px] text-slate-400">All-time logs</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Action</p>
            <p className="text-2xl font-extrabold text-amber-600 font-heading">{data?.stats?.pendingReports || 0}</p>
            <p className="text-[11px] text-amber-700">Needs review</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Pickups</p>
            <p className="text-2xl font-extrabold text-sky-600 font-heading">{data?.stats?.activePickups || 0}</p>
            <p className="text-[11px] text-slate-400">In route / pending</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved Rate</p>
            <p className="text-2xl font-extrabold text-emerald-600 font-heading">{data?.stats?.resolutionRate || 0}%</p>
            <p className="text-[11px] text-emerald-700">{data?.stats?.completedCollections || 0} completed</p>
          </div>
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: 6-Month Collection Trends */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Monthly Collection Volume</h3>
              <p className="text-xs text-slate-400">Report submission vs. verified collections</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
              Past 6 Months
            </span>
          </div>

          <div className="h-64 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading trend chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.charts?.trends || []}>
                  <defs>
                    <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#047857" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#047857" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="reports"
                    name="Submitted Reports"
                    stroke="#047857"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorReports)"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    name="Completed Collections"
                    stroke="#0284c7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCompleted)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Waste by Category (Donut/Pie Chart) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Waste Breakdown by Category</h3>
              <p className="text-xs text-slate-400">Distribution of reported recyclable materials</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading category chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.charts?.byCategory || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="category"
                  >
                    {(data?.charts?.byCategory || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Chart 3: Reports by Status (Bar Chart) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Pipeline Status Distribution</h3>
            <p className="text-xs text-slate-400">Total cases in each phase of collection lifecycle</p>
          </div>
        </div>

        <div className="h-56 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading status chart...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.charts?.byStatus || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" name="Report Count" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Reports */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Recent Incoming Reports</h3>
            <Link to="/admin/reports" className="text-xs font-semibold text-brand-700 hover:underline">
              View All Reports →
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentActivity?.reports?.map((r) => (
              <div
                key={r._id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={r.status} />
                    <CategoryBadge category={r.category} />
                  </div>
                  <p className="font-bold text-slate-900 truncate">{r.title}</p>
                  <p className="text-slate-400 truncate">By {r.resident?.name || 'Resident'}</p>
                </div>
                <Link
                  to={`/reports/${r._id}`}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 flex-shrink-0"
                >
                  Inspect
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Pickups */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Recent Pickup Requests</h3>
            <span className="text-xs text-slate-400">Doorstep pickups</span>
          </div>

          <div className="space-y-3">
            {data?.recentActivity?.pickups?.map((p) => (
              <div
                key={p._id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={p.status} />
                    <CategoryBadge category={p.category} />
                  </div>
                  <p className="font-bold text-slate-900 truncate">{p.address}</p>
                  <p className="text-slate-400">
                    Slot: {new Date(p.preferredDate).toLocaleDateString()} ({p.timeSlot})
                  </p>
                </div>
                <span className="text-[11px] text-slate-400">
                  {p.resident?.name || 'Resident'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
