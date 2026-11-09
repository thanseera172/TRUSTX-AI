import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { getUserVerifications, calculateDashboardStats } from '../services/firestoreService.ts';
import { DEMO_CASES } from '../../server/demoCases.ts';
import { VerificationRecord } from '../types/index.ts';
import {
  PlusCircle,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  BookOpen,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  PieChart as PieIcon,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export function DashboardPage() {
  const { currentUser, userProfile, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const localVerifs: VerificationRecord[] = (() => {
        try {
          return JSON.parse(localStorage.getItem('trustx_local_verifications') || '[]');
        } catch {
          return [];
        }
      })();

      if (currentUser) {
        try {
          const userRecords = await getUserVerifications(currentUser.uid);
          if (userRecords.length > 0) {
            setRecords(userRecords);
          } else if (localVerifs.length > 0) {
            setRecords(localVerifs);
          } else {
            setRecords(DEMO_CASES.map((d) => d.fullRecord));
          }
        } catch (err) {
          console.error('Error loading verifications:', err);
          setRecords(localVerifs.length > 0 ? localVerifs : DEMO_CASES.map((d) => d.fullRecord));
        }
      } else if (localVerifs.length > 0) {
        setRecords(localVerifs);
      } else {
        setRecords(DEMO_CASES.map((d) => d.fullRecord));
      }
      setLoading(false);
    }

    loadData();
  }, [currentUser, isDemoMode]);

  const stats = calculateDashboardStats(records);

  // Status distribution for donut chart
  const statusPieData = [
    { name: 'Supported Claims', value: stats.supportedClaims, color: '#25D695' },
    { name: 'Refuted Claims', value: stats.refutedClaims, color: '#FF5D70' },
    { name: 'Insufficient Evidence', value: stats.insufficientClaims, color: '#FFBE55' },
  ].filter((d) => d.value > 0);

  // Activity over time
  const activityData = records
    .slice()
    .reverse()
    .map((r, idx) => ({
      name: new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      claims: r.claims?.length || 0,
      supported: r.assessment?.supportedClaimsCount || 0,
      refuted: r.assessment?.refutedClaimsCount || 0,
    }));

  const displayName = userProfile?.displayName || currentUser?.email?.split('@')[0] || (isDemoMode ? 'Demo Analyst' : 'Guest Analyst');

  return (
    <div className="min-h-screen bg-[#080D18] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111D30] border border-[#1E2D48] rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
                Intelligence Workspace
              </span>
              {isDemoMode && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  DEMO MODE DATA
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              Welcome, {displayName}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Monitor claim verification telemetry, citation mismatch registries, and static code security findings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            <Link
              to="/new-verification?mode=custom&fresh=true"
              className="px-5 py-3 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 transition shadow-lg shadow-cyan-500/20 flex items-center space-x-2 glow-cyan"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>New Verification (Paste Your Answer)</span>
            </Link>
            <Link
              to="/new-verification?mode=sample"
              className="px-4 py-3 rounded-xl font-semibold text-xs text-cyan-300 bg-[#080D18] hover:bg-[#16253D] border border-cyan-500/40 transition flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Explore Sample AI Answer</span>
            </Link>
          </div>
        </div>

        {/* 6 Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-[#111D30] border border-[#1E2D48] rounded-xl p-4 shadow-lg">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">TOTAL AUDITS</span>
            <div className="text-2xl font-bold text-white font-mono">{stats.totalVerifications}</div>
            <span className="text-[10px] text-cyan-400 font-mono mt-1 block">Completed analyses</span>
          </div>

          <div className="bg-[#111D30] border border-[#1E2D48] rounded-xl p-4 shadow-lg">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">SUPPORTED CLAIMS</span>
            <div className="text-2xl font-bold text-[#25D695] font-mono">{stats.supportedClaims}</div>
            <span className="text-[10px] text-emerald-400/80 font-mono mt-1 block">Evidence confirmed</span>
          </div>

          <div className="bg-[#111D30] border border-[#1E2D48] rounded-xl p-4 shadow-lg">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">REFUTED CLAIMS</span>
            <div className="text-2xl font-bold text-[#FF5D70] font-mono">{stats.refutedClaims}</div>
            <span className="text-[10px] text-rose-400/80 font-mono mt-1 block">Contradicted by data</span>
          </div>

          <div className="bg-[#111D30] border border-[#1E2D48] rounded-xl p-4 shadow-lg">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">INSUFFICIENT DATA</span>
            <div className="text-2xl font-bold text-[#FFBE55] font-mono">{stats.insufficientClaims}</div>
            <span className="text-[10px] text-amber-400/80 font-mono mt-1 block">Uncertain sources</span>
          </div>

          <div className="bg-[#111D30] border border-[#1E2D48] rounded-xl p-4 shadow-lg">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">CITATION ISSUES</span>
            <div className="text-2xl font-bold text-violet-400 font-mono">{stats.citationIssues}</div>
            <span className="text-[10px] text-violet-300/80 font-mono mt-1 block">Crossref/DOI flags</span>
          </div>

          <div className="bg-[#111D30] border border-[#1E2D48] rounded-xl p-4 shadow-lg">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">SECURITY FINDINGS</span>
            <div className="text-2xl font-bold text-amber-400 font-mono">{stats.securityFindings}</div>
            <span className="text-[10px] text-amber-300/80 font-mono mt-1 block">Static code risks</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Activity Over Time Line/Area Chart */}
          <div className="lg:col-span-8 bg-[#111D30] border border-[#1E2D48] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-heading flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>Verification Activity Timeline</span>
                </h3>
                <p className="text-xs text-slate-400">Claim evaluation volume across recent audits</p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {records.length} {records.length === 1 ? 'record' : 'records'}
              </span>
            </div>

            <div className="h-[250px] w-full pt-2">
              {activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#20D9F5" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#20D9F5" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#25D695" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#25D695" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2D48" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0D1524',
                        borderColor: '#1E2D48',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="claims"
                      name="Total Claims"
                      stroke="#20D9F5"
                      fillOpacity={1}
                      fill="url(#cyanGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="supported"
                      name="Supported"
                      stroke="#25D695"
                      fillOpacity={1}
                      fill="url(#emeraldGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
                  No activity recorded yet. Run your first verification to plot timeline.
                </div>
              )}
            </div>
          </div>

          {/* Status Distribution Donut Chart */}
          <div className="lg:col-span-4 bg-[#111D30] border border-[#1E2D48] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-heading flex items-center space-x-2 mb-1">
                <PieIcon className="w-4 h-4 text-violet-400" />
                <span>Status Breakdown</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">Evidence distribution of verified claims</p>
            </div>

            <div className="h-[200px] w-full flex items-center justify-center">
              {statusPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0D1524',
                        borderColor: '#1E2D48',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-slate-500 text-xs font-mono">
                  No claims evaluated yet
                </div>
              )}
            </div>

            <div className="space-y-1.5 pt-3 border-t border-[#1E2D48] text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#25D695]" />
                  <span>Supported</span>
                </span>
                <span className="font-mono text-white font-bold">{stats.supportedClaims}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5D70]" />
                  <span>Refuted</span>
                </span>
                <span className="font-mono text-white font-bold">{stats.refutedClaims}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBE55]" />
                  <span>Insufficient Data</span>
                </span>
                <span className="font-mono text-white font-bold">{stats.insufficientClaims}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Verification Records Table */}
        <div className="bg-[#111D30] border border-[#1E2D48] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold font-heading text-white">Recent Verification Records</h3>
              <p className="text-xs text-slate-400">Authenticated Firestore audit history</p>
            </div>
            <Link
              to="/history"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
            >
              <span>View All History</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs font-mono">
              Loading verification records from Firestore...
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-10 px-4 border border-dashed border-[#1E2D48] rounded-xl bg-[#080D18]/60">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3 glow-cyan">
                <Sparkles className="w-6 h-6 text-cyan-400" />
              </div>
              <h4 className="text-base font-bold text-white mb-1.5">No Prior Verifications — Sample AI Content Ready</h4>
              <p className="text-xs text-slate-300 max-w-lg mx-auto mb-5 leading-relaxed">
                You do not need to generate or paste anything from ChatGPT or Claude to explore the system.
                We have pre-configured realistic AI text answers and Python code samples directly inside the verification pipeline.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/new-verification?mode=custom&fresh=true"
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition glow-cyan"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>New Verification (Paste Your Own AI Answer)</span>
                </Link>
                <Link
                  to="/new-verification?mode=sample"
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-cyan-300 bg-[#111D30] hover:bg-[#16253D] border border-cyan-500/40 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Verify Pre-loaded Sample Answer</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E2D48] text-slate-400 font-mono">
                    <th className="pb-3 font-semibold">TITLE / TOPIC</th>
                    <th className="pb-3 font-semibold">DATE</th>
                    <th className="pb-3 font-semibold">INPUT</th>
                    <th className="pb-3 font-semibold">CLAIMS</th>
                    <th className="pb-3 font-semibold">ASSESSMENT</th>
                    <th className="pb-3 font-semibold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2D48]/60">
                  {records.slice(0, 5).map((r) => {
                    const label = r.assessment?.overallLabel || 'Analysis Complete';
                    let labelColor = 'text-amber-400 bg-amber-950/60 border-amber-500/40';
                    if (label === 'Evidence-aligned') labelColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
                    else if (label === 'High-risk findings detected') labelColor = 'text-rose-400 bg-rose-950/60 border-rose-500/40';

                    return (
                      <tr key={r.verificationId} className="hover:bg-[#16253D]/50 transition">
                        <td className="py-3.5 pr-4">
                          <span className="font-semibold text-white block truncate max-w-[240px]">
                            {r.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{r.verificationId}</span>
                        </td>
                        <td className="py-3.5 pr-4 text-slate-400 font-mono whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 pr-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#080D18] text-slate-300 border border-[#1E2D48]">
                            {r.inputType}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4 font-mono text-white">
                          {r.claims?.length || 0} claims
                        </td>
                        <td className="py-3.5 pr-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${labelColor}`}>
                            {label}
                          </span>
                        </td>
                        <td className="py-3.5 text-right whitespace-nowrap">
                          <Link
                            to={`/results/${r.verificationId}`}
                            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center space-x-1"
                          >
                            <span>Inspect Report</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
