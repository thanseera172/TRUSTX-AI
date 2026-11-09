import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { getUserVerifications } from '../services/firestoreService.ts';
import { generateVerificationPDF } from '../services/pdfService.ts';
import { DEMO_CASES } from '../../server/demoCases.ts';
import { VerificationRecord } from '../types/index.ts';
import {
  FileText,
  Download,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Share2,
} from 'lucide-react';

export function ReportsPage() {
  const { currentUser, isDemoMode } = useAuth();
  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadReports() {
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
          console.error('Error fetching reports:', err);
          setRecords(localVerifs.length > 0 ? localVerifs : DEMO_CASES.map((d) => d.fullRecord));
        }
      } else if (localVerifs.length > 0) {
        setRecords(localVerifs);
      } else {
        setRecords(DEMO_CASES.map((d) => d.fullRecord));
      }
      setLoading(false);
    }

    loadReports();
  }, [currentUser, isDemoMode]);

  const filtered = records.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.verificationId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#080D18] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-[#111D30] border border-[#1E2D48] rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
              Verification Document Center
            </span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-white">Downloadable Audit Reports</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Generate and export publication-ready PDF reports with full methodological breakdowns, claim corroboration
            tables, grounding evidence citations, and static code security audits.
          </p>
        </div>

        {/* Search */}
        <div className="bg-[#111D30] border border-[#1E2D48] rounded-xl p-4 shadow-lg">
          <div className="relative max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports by topic or ID..."
              className="w-full pl-8 pr-3 py-2 bg-[#080D18] border border-[#1E2D48] focus:border-cyan-400 focus:outline-none rounded-lg text-xs text-white placeholder-slate-600 transition"
            />
          </div>
        </div>

        {/* Report Cards Grid */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-mono">
            Loading document repository...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#1E2D48] rounded-xl bg-[#080D18]/50">
            <FileText className="w-10 h-10 text-cyan-400 mx-auto mb-3 opacity-60" />
            <h4 className="text-sm font-semibold text-white mb-1">No Audit Reports Available</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Run a verification to compile exportable PDF reports for academic or enterprise distribution.
            </p>
            <Link
              to="/new-verification"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-400"
            >
              <span>Run Verification</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((r) => {
              const label = r.assessment?.overallLabel || 'Assessment Complete';
              return (
                <div
                  key={r.verificationId}
                  className="bg-[#111D30] border border-[#1E2D48] hover:border-cyan-500/40 rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#080D18] text-cyan-400 border border-[#1E2D48]">
                        {r.verificationId}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2 leading-snug">
                      {r.title}
                    </h3>

                    <div className="space-y-1.5 text-xs text-slate-400 mb-4 bg-[#080D18]/60 p-3 rounded-lg border border-[#1E2D48]">
                      <div className="flex justify-between">
                        <span>Classification:</span>
                        <span className="font-semibold text-white">{label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Factual Claims:</span>
                        <span className="font-mono text-cyan-400">{r.claims?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Evidence Sources:</span>
                        <span className="font-mono text-emerald-400">{r.evidence?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1E2D48] flex items-center justify-between gap-2">
                    <Link
                      to={`/results/${r.verificationId}`}
                      className="text-xs text-slate-300 hover:text-cyan-400 transition flex items-center space-x-1"
                    >
                      <span>View Online</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const url = window.location.origin + `/results/${r.verificationId}`;
                          if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(url).catch(() => {});
                          }
                          try {
                            localStorage.setItem(`trustx_record_${r.verificationId}`, JSON.stringify(r));
                          } catch {}
                          setCopiedId(r.verificationId);
                          setTimeout(() => setCopiedId(null), 2500);
                        }}
                        title="Copy shareable audit link"
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-[#080D18] hover:bg-slate-800 border border-[#1E2D48] transition flex items-center space-x-1"
                      >
                        <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{copiedId === r.verificationId ? 'Copied!' : 'Share'}</span>
                      </button>

                      <button
                        onClick={() => generateVerificationPDF(r, currentUser?.email || undefined)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition flex items-center space-x-1.5 shadow-sm glow-cyan"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
