import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { getUserVerifications, deleteVerificationRecord } from '../services/firestoreService.ts';
import { DEMO_CASES } from '../../server/demoCases.ts';
import { VerificationRecord } from '../types/index.ts';
import {
  History,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  PlusCircle,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import { generateVerificationPDF } from '../services/pdfService.ts';

export function HistoryPage() {
  const { currentUser, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'claims_desc'>('date_desc');
  const [recordToDelete, setRecordToDelete] = useState<VerificationRecord | null>(null);

  useEffect(() => {
    async function loadHistory() {
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
          console.error('Error fetching user verification history:', err);
          setRecords(localVerifs.length > 0 ? localVerifs : DEMO_CASES.map((d) => d.fullRecord));
        }
      } else if (localVerifs.length > 0) {
        setRecords(localVerifs);
      } else {
        setRecords(DEMO_CASES.map((d) => d.fullRecord));
      }
      setLoading(false);
    }

    loadHistory();
  }, [currentUser, isDemoMode]);

  const handleDelete = async () => {
    if (!recordToDelete) return;
    try {
      if (!isDemoMode && currentUser) {
        await deleteVerificationRecord(recordToDelete.verificationId);
      }
      try {
        const localList: VerificationRecord[] = JSON.parse(localStorage.getItem('trustx_local_verifications') || '[]');
        const updated = localList.filter((r) => r.verificationId !== recordToDelete.verificationId);
        localStorage.setItem('trustx_local_verifications', JSON.stringify(updated));
      } catch (err) {
        console.warn('Error syncing local delete:', err);
      }
      setRecords((prev) => prev.filter((r) => r.verificationId !== recordToDelete.verificationId));
      setRecordToDelete(null);
    } catch (err) {
      console.error('Error deleting record:', err);
    }
  };

  // Filter and search
  const filteredRecords = records
    .filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.verificationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.submittedText && r.submittedText.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = filterType === 'all' || r.inputType === filterType;
      const matchesStatus =
        filterStatus === 'all' || r.assessment?.overallLabel === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'date_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'claims_desc') return (b.claims?.length || 0) - (a.claims?.length || 0);
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#080D18] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111D30] border border-[#1E2D48] rounded-2xl p-6 shadow-xl">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <History className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
                Audit Trail Archive
              </span>
            </div>
            <h1 className="text-2xl font-bold font-heading text-white">Verification History</h1>
            <p className="text-xs text-slate-400 mt-1">
              Isolated repository of all evaluated verification sessions and reports
            </p>
          </div>

          <Link
            to="/new-verification"
            className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition shadow-md flex items-center space-x-1.5 glow-cyan self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>New Verification</span>
          </Link>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-[#111D30] border border-[#1E2D48] rounded-xl p-4 shadow-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Field */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, ID, or excerpt..."
              className="w-full pl-8 pr-3 py-2 bg-[#080D18] border border-[#1E2D48] focus:border-cyan-400 focus:outline-none rounded-lg text-white placeholder-slate-600 transition"
            />
          </div>

          {/* Filter by Input Type */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 bg-[#080D18] border border-[#1E2D48] focus:border-cyan-400 focus:outline-none rounded-lg text-white font-mono"
            >
              <option value="all">All Input Types</option>
              <option value="text">Text Answers</option>
              <option value="code">Code Audits</option>
              <option value="combined">Combined Content</option>
            </select>
          </div>

          {/* Filter by Assessment Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-[#080D18] border border-[#1E2D48] focus:border-cyan-400 focus:outline-none rounded-lg text-white font-mono"
            >
              <option value="all">All Assessment Labels</option>
              <option value="Evidence-aligned">Evidence-aligned</option>
              <option value="Mixed evidence">Mixed evidence</option>
              <option value="Needs review">Needs review</option>
              <option value="High-risk findings detected">High-risk findings detected</option>
              <option value="Insufficient verification data">Insufficient verification data</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#080D18] border border-[#1E2D48] focus:border-cyan-400 focus:outline-none rounded-lg text-white font-mono"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="claims_desc">Most Claims Evaluated</option>
            </select>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-[#111D30] border border-[#1E2D48] rounded-2xl p-6 shadow-xl overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs font-mono">
              Loading verification history from Firestore...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#1E2D48] rounded-xl bg-[#080D18]/50">
              <ShieldCheck className="w-10 h-10 text-cyan-400 mx-auto mb-3 opacity-60" />
              <h4 className="text-sm font-semibold text-white mb-1">No Matching Verification Records</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                No verifications match the search query and selected filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                  setFilterStatus('all');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#111D30] text-cyan-400 border border-[#1E2D48]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E2D48] text-slate-400 font-mono">
                    <th className="pb-3 font-semibold">VERIFICATION TITLE & ID</th>
                    <th className="pb-3 font-semibold">TIMESTAMP</th>
                    <th className="pb-3 font-semibold">TYPE</th>
                    <th className="pb-3 font-semibold">CLAIMS</th>
                    <th className="pb-3 font-semibold">OVERALL ASSESSMENT</th>
                    <th className="pb-3 font-semibold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2D48]/60">
                  {filteredRecords.map((r) => {
                    const label = r.assessment?.overallLabel || 'Complete';
                    let labelColor = 'text-amber-400 bg-amber-950/60 border-amber-500/40';
                    if (label === 'Evidence-aligned') labelColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
                    else if (label === 'High-risk findings detected') labelColor = 'text-rose-400 bg-rose-950/60 border-rose-500/40';

                    return (
                      <tr key={r.verificationId} className="hover:bg-[#16253D]/50 transition">
                        <td className="py-3.5 pr-4">
                          <Link
                            to={`/results/${r.verificationId}`}
                            className="font-semibold text-white hover:text-cyan-400 transition block truncate max-w-[260px]"
                          >
                            {r.title}
                          </Link>
                          <span className="text-[10px] text-slate-500 font-mono">{r.verificationId}</span>
                        </td>
                        <td className="py-3.5 pr-4 text-slate-400 font-mono whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
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
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => generateVerificationPDF(r, currentUser?.email || undefined)}
                              className="p-1.5 rounded bg-[#080D18] hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition"
                              title="Download PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              to={`/results/${r.verificationId}`}
                              className="px-2.5 py-1 rounded bg-[#080D18] hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 text-xs font-semibold inline-flex items-center space-x-1"
                            >
                              <span>Inspect</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                            <button
                              onClick={() => setRecordToDelete(r)}
                              className="p-1.5 rounded bg-[#080D18] hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {recordToDelete && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111D30] border border-[#1E2D48] rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center space-x-3 mb-4 text-rose-400">
                <Trash2 className="w-6 h-6" />
                <h3 className="text-base font-bold text-white">Delete Verification Record?</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Are you sure you want to permanently delete{' '}
                <strong className="text-white">"{recordToDelete.title}"</strong> (ID: {recordToDelete.verificationId})?
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setRecordToDelete(null)}
                  className="px-4 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition"
                >
                  Permanently Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
