import React, { useState, useEffect } from 'react';
import {
  Award,
  TrendingUp,
  Shield,
  Clock,
  Sparkles,
  Trophy,
  CheckCircle,
  HelpCircle,
  Medal
} from 'lucide-react';
import { rewardService } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CardSkeleton, TableSkeleton } from '../components/common/LoadingSkeleton.jsx';

export const RewardsLeaderboardPage = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [rewardData, setRewardData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('leaderboard'); // 'leaderboard' | 'history'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [meRes, leadRes] = await Promise.all([
          rewardService.getMyRewards(),
          rewardService.getLeaderboard()
        ]);

        if (meRes.data.success) setRewardData(meRes.data);
        if (leadRes.data.success) setLeaderboard(leadRes.data.leaderboard || []);
      } catch (err) {
        console.error('Failed to load rewards and leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const tiers = [
    { name: 'Eco Novice', range: '0 - 99 pts', desc: 'Starting your sustainability journey' },
    { name: 'Eco Advocate', range: '100 - 249 pts', desc: 'Regular neighborhood cleanup contributor' },
    { name: 'Green Champion', range: '250 - 499 pts', desc: 'Dedicated community recycling leader' },
    { name: 'Earth Guardian', range: '500+ pts', desc: 'Elite civic environmental steward' }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Recycling Rewards & Leaderboard</h1>
        <p className="text-xs text-slate-500">
          Earn verified sustainability points, climb tier rankings, and compete on the neighborhood leaderboard.
        </p>
      </div>

      {/* User Tier & Summary Hero Card */}
      {loading ? (
        <CardSkeleton count={1} />
      ) : (
        <div className="bg-gradient-to-r from-emerald-900 via-brand-800 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold backdrop-blur-xs">
                <Medal className="w-3.5 h-3.5 text-emerald-400" />
                Current Tier: {rewardData?.tier?.name || 'Eco Novice'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
                {rewardData?.points ?? (user?.points || 0)}{' '}
                <span className="text-emerald-300 text-lg sm:text-xl font-normal">Points Earned</span>
              </h2>
              <p className="text-emerald-100 text-xs sm:text-sm max-w-md">
                Verified across {rewardData?.stats?.verifiedReportsCount || 0} waste reports and{' '}
                {rewardData?.stats?.completedPickupsCount || 0} scheduled doorstep collections.
              </p>
            </div>

            {/* Progress to next tier */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 min-w-[260px] space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-200">
                <span>Tier Milestone</span>
                <span>{rewardData?.tier?.currentProgress || 0}%</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-400 h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(rewardData?.tier?.currentProgress || 10, 100)}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-emerald-100 text-center">
                {rewardData?.tier?.nextThreshold
                  ? `${rewardData.tier.nextThreshold - rewardData.points} points until next tier badge`
                  : 'Congratulations! Top tier reached'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
            activeTab === 'leaderboard'
              ? 'bg-brand-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Community Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
            activeTab === 'history'
              ? 'bg-brand-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>My Reward History</span>
        </button>
      </div>

      {/* Tab Content 1: Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Top Neighborhood Recyclers</h3>
                <p className="text-xs text-slate-500">Live community rankings calculated from verified collections.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Top 20 Citizens
              </span>
            </div>

            {loading ? (
              <TableSkeleton rows={5} cols={4} />
            ) : leaderboard.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No recyclers listed yet. Complete a report to join the leaderboard!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Rank</th>
                      <th className="py-3.5 px-4 sm:px-6">Citizen</th>
                      <th className="py-3.5 px-4 sm:px-6">Tier Level</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Reward Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leaderboard.map((item) => {
                      const isCurrentUser = item.id === user?.id;
                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50 transition-colors ${
                            isCurrentUser ? 'bg-emerald-50/60 font-semibold' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex items-center gap-2">
                              {item.rank === 1 && <span className="text-base">🥇</span>}
                              {item.rank === 2 && <span className="text-base">🥈</span>}
                              {item.rank === 3 && <span className="text-base">🥉</span>}
                              {item.rank > 3 && (
                                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                                  {item.rank}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-900 font-medium">{item.name}</span>
                              {isCurrentUser && (
                                <span className="text-[10px] bg-brand-700 text-white px-2 py-0.5 rounded-full font-bold">
                                  You
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 sm:px-6">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              {item.tierName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 text-right font-extrabold text-brand-700 font-heading">
                            {item.points} pts
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tier Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs">{t.name}</h4>
                  <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                    {t.range}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 2: Transaction Ledger */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Point Audit Ledger</h3>
            <p className="text-xs text-slate-500">
              Complete transaction log of earned points with references.
            </p>
          </div>

          {loading ? (
            <TableSkeleton rows={4} cols={3} />
          ) : !rewardData?.transactions || rewardData.transactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No reward transactions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Date</th>
                    <th className="py-3.5 px-4 sm:px-6">Description</th>
                    <th className="py-3.5 px-4 sm:px-6">Activity Type</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rewardData.transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 text-slate-500 text-xs">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-900">
                        {tx.description}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6">
                        <span className="capitalize px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 border border-slate-200">
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right font-extrabold text-emerald-600 font-heading">
                        +{tx.points} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RewardsLeaderboardPage;
