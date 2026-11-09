import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { getVerificationById } from '../services/firestoreService.ts';
import { generateVerificationPDF } from '../services/pdfService.ts';
import { DEMO_CASES } from '../../server/demoCases.ts';
import { VerificationRecord, ClaimStatus } from '../types/index.ts';
import { ClaimCard } from '../components/claims/ClaimCard.tsx';
import { EvidenceCard } from '../components/evidence/EvidenceCard.tsx';
import { CodeEditorViewer } from '../components/security/CodeEditorViewer.tsx';
import { EvidenceConstellation } from '../components/common/EvidenceConstellation.tsx';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Download,
  PlusCircle,
  Share2,
  FileText,
  Search,
  BookOpen,
  Code2,
  Share,
  Calendar,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';

export function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();

  const [record, setRecord] = useState<VerificationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'claims' | 'evidence' | 'hallucinations' | 'contradictions' | 'citations' | 'security' | 'constellation'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadRecord() {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // 1. Check session storage (freshly generated in current tab)
      const sessionData = sessionStorage.getItem(`trustx_record_${id}`);
      if (sessionData) {
        try {
          setRecord(JSON.parse(sessionData));
          setLoading(false);
          return;
        } catch {}
      }

      // 2. Check localStorage (opened in another tab or refreshed)
      const localData = localStorage.getItem(`trustx_record_${id}`);
      if (localData) {
        try {
          setRecord(JSON.parse(localData));
          setLoading(false);
          return;
        } catch {}
      }

      // 3. Check local verifications list
      try {
        const localList: VerificationRecord[] = JSON.parse(localStorage.getItem('trustx_local_verifications') || '[]');
        const foundLocal = localList.find((r) => r.verificationId === id);
        if (foundLocal) {
          setRecord(foundLocal);
          setLoading(false);
          return;
        }
      } catch {}

      // 4. Check if it's one of the demo presets
      const demoPreset = DEMO_CASES.find((d) => d.id === id || d.fullRecord.verificationId === id);
      if (demoPreset) {
        setRecord(demoPreset.fullRecord);
        setLoading(false);
        return;
      }

      // 5. Query backend server archive endpoint (resolves all audits generated on this instance)
      try {
        const res = await fetch(`/api/verification/record/${encodeURIComponent(id)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setRecord(json.data);
            setLoading(false);
            return;
          }
        }
      } catch (apiErr) {
        console.warn('Server archive lookup note:', apiErr);
      }

      // 6. Query Cloud Firestore
      try {
        const doc = await getVerificationById(id);
        if (doc) {
          setRecord(doc);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Firestore record query notice:', err);
      }

      setLoading(false);
    }

    loadRecord();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080D18] flex items-center justify-center p-4">
        <div className="text-center font-mono text-cyan-400 text-xs flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>Retrieving verification record...</span>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-[#080D18] flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-[#111D30] border border-[#1E2D48] rounded-2xl p-8">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Record Not Found</h2>
          <p className="text-xs text-slate-400 mb-6">
            The requested verification audit could not be retrieved from this account or archive.
          </p>
          <Link
            to="/new-verification"
            className="px-4 py-2.5 rounded-lg bg-cyan-400 text-slate-950 font-semibold text-xs inline-flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Start New Verification</span>
          </Link>
        </div>
      </div>
    );
  }

  const assessment = record.assessment;
  const hasClaims = record.claims && record.claims.length > 0;
  const hasEvidence = record.evidence && record.evidence.length > 0;
  const hasHallucinations = record.hallucinations && record.hallucinations.length > 0;
  const hasContradictions = record.contradictions && record.contradictions.length > 0;
  const hasCitations = record.citations && record.citations.length > 0;
  const hasSecurity = record.securityFindings && record.securityFindings.length > 0;

  const handleDownloadPDF = () => {
    generateVerificationPDF(record, currentUser?.email || undefined);
  };

  const handleShare = () => {
    const fullShareUrl = window.location.origin + `/results/${record.verificationId}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullShareUrl).catch(() => {});
    }
    // Store in localStorage for cross-tab sharing on same browser
    try {
      localStorage.setItem(`trustx_record_${record.verificationId}`, JSON.stringify(record));
    } catch {}
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3500);
  };

  const getAssessmentBadge = () => {
    const label = assessment?.overallLabel || 'Assessment Complete';
    switch (label) {
      case 'Evidence-aligned':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50 glow-verified';
      case 'High-risk findings detected':
        return 'bg-rose-950/80 text-rose-400 border-rose-500/50 glow-refuted';
      case 'Needs review':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/50';
      case 'Mixed evidence':
        return 'bg-indigo-950/80 text-indigo-400 border-indigo-500/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-[#080D18] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-[#111D30] border border-[#1E2D48] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#080D18] text-cyan-400 border border-[#1E2D48]">
                  ID: {record.verificationId}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-[#080D18]">
                  Source: {record.sourceAI}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-[#080D18] flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                </span>
                {record.isDemo && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    DEMO DATA
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white mb-2">
                {record.title}
              </h1>

              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-md text-xs font-bold border ${getAssessmentBadge()}`}>
                  {assessment?.overallLabel.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {record.processingStatus === 'completed' ? 'Audited & Verified' : 'Incomplete'}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition shadow-md flex items-center space-x-1.5 glow-cyan"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>Download PDF Report</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#080D18] hover:bg-slate-800 border border-[#1E2D48] transition flex items-center space-x-1.5"
              >
                <Share2 className="w-4 h-4 text-slate-400" />
                <span>{copiedLink ? 'Link Copied!' : 'Share Audit'}</span>
              </button>

              <Link
                to="/new-verification"
                className="px-4 py-2.5 rounded-xl font-semibold text-xs text-cyan-300 bg-[#0D1524] hover:bg-[#16253D] border border-cyan-500/30 transition flex items-center space-x-1.5"
              >
                <PlusCircle className="w-4 h-4 text-cyan-400" />
                <span>New Verification</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto rounded-xl bg-[#0D1524] p-1.5 border border-[#1E2D48] space-x-1 scrollbar-none text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition flex items-center space-x-1.5 ${
              activeTab === 'overview'
                ? 'bg-[#111D30] text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Executive Overview</span>
          </button>

          {hasClaims && (
            <button
              onClick={() => setActiveTab('claims')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition flex items-center space-x-1.5 ${
                activeTab === 'claims'
                  ? 'bg-[#111D30] text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Claims ({record.claims.length})</span>
            </button>
          )}

          {hasEvidence && (
            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition flex items-center space-x-1.5 ${
                activeTab === 'evidence'
                  ? 'bg-[#111D30] text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Evidence Sources ({record.evidence.length})</span>
            </button>
          )}

          {hasHallucinations && (
            <button
              onClick={() => setActiveTab('hallucinations')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition flex items-center space-x-1.5 ${
                activeTab === 'hallucinations'
                  ? 'bg-[#111D30] text-rose-400 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Hallucinations ({record.hallucinations.length})</span>
            </button>
          )}

          {hasContradictions && (
            <button
              onClick={() => setActiveTab('contradictions')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition flex items-center space-x-1.5 ${
                activeTab === 'contradictions'
                  ? 'bg-[#111D30] text-amber-400 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Contradictions ({record.contradictions.length})</span>
            </button>
          )}

          {hasCitations && (
            <button
              onClick={() => setActiveTab('citations')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition flex items-center space-x-1.5 ${
                activeTab === 'citations'
                  ? 'bg-[#111D30] text-violet-400 border border-violet-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Citations ({record.citations.length})</span>
            </button>
          )}

          {record.inputType !== 'text' && (
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition flex items-center space-x-1.5 ${
                activeTab === 'security'
                  ? 'bg-[#111D30] text-amber-400 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code Security ({record.securityFindings?.length || 0})</span>
            </button>
          )}

          {hasClaims && (
            <button
              onClick={() => setActiveTab('constellation')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition flex items-center space-x-1.5 ${
                activeTab === 'constellation'
                  ? 'bg-[#111D30] text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Evidence Constellation</span>
            </button>
          )}
        </div>

        {/* TAB CONTENT */}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Executive Summary Card */}
            <div className="bg-[#111D30] border border-[#1E2D48] rounded-2xl p-6 shadow-xl">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-2">
                Executive Synthesis
              </span>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-light">
                {assessment?.summaryExplanation}
              </p>
            </div>

            {/* Multi-Dimensional Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Factuality Indicator */}
              <div className="bg-[#111D30] border border-[#1E2D48] rounded-xl p-5 shadow-lg">
                <span className="text-xs font-mono text-slate-400 block mb-1">FACTUALITY ALIGNMENT</span>
                <div className="text-2xl font-bold font-mono text-cyan-400 mb-1">
                  {assessment?.factualityDisplay}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Formula: Supported / (Supported + Refuted). Shows ratio of claims confirmed by authoritative sources.
                </p>
              </div>

              {/* Evidence Coverage Indicator */}
              <div className="bg-[#111D30] border border-[#1E2D48] rounded-xl p-5 shadow-lg">
                <span className="text-xs font-mono text-slate-400 block mb-1">EVIDENCE COVERAGE</span>
                <div className="text-2xl font-bold font-mono text-emerald-400 mb-1">
                  {assessment?.evidenceCoverageDisplay}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Formula: Evaluated / Total Verifiable. Quantifies how thoroughly external evidence could substantiate assertions.
                </p>
              </div>

              {/* Contradiction Indicator */}
              <div className="bg-[#111D30] border border-[#1E2D48] rounded-xl p-5 shadow-lg">
                <span className="text-xs font-mono text-slate-400 block mb-1">CONTRADICTION DETECTIONS</span>
                <div className="text-2xl font-bold font-mono text-amber-400 mb-1">
                  {assessment?.contradictionDisplay}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Identifies opposing statements, date mismatches, and mathematical contradictions within the answer.
                </p>
              </div>

              {/* Citation Reliability */}
              <div className="bg-[#111D30] border border-[#1E2D48] rounded-xl p-5 shadow-lg">
                <span className="text-xs font-mono text-slate-400 block mb-1">CITATION RELIABILITY</span>
                <div className="text-2xl font-bold font-mono text-violet-400 mb-1">
                  {assessment?.citationReliabilityDisplay}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Crossref & OpenAlex metadata alignment. Flags fabricated DOIs, publication years, or venues.
                </p>
              </div>

              {/* Code Security Posture */}
              <div className="bg-[#111D30] border border-[#1E2D48] rounded-xl p-5 shadow-lg">
                <span className="text-xs font-mono text-slate-400 block mb-1">CODE SECURITY POSTURE</span>
                <div className="text-2xl font-bold font-mono text-rose-400 mb-1">
                  {assessment?.codeSecurityDisplay}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Rule-based static AST findings for credentials, SQL injection, dynamic execution, and command injection.
                </p>
              </div>

              {/* Audit Discipline & Disclaimer */}
              <div className="bg-[#111D30] border border-[#1E2D48] rounded-xl p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-slate-400 block mb-1">AUDIT DISCIPLINE</span>
                  <div className="text-sm font-bold text-white mb-1">Independent Verification Layer</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Zero arbitrary truth scores. Never treats insufficient evidence as false or consistency as absolute proof.
                  </p>
                </div>
                <span className="text-[10px] text-cyan-400/80 font-mono mt-2 block">TRUST INTELLIGENCE LAB</span>
              </div>
            </div>

            {/* Practical Actionable Recommendations */}
            <div className="bg-[#111D30] border border-[#1E2D48] rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold font-heading text-white mb-3">
                Actionable Verification Recommendations
              </h3>
              <div className="space-y-2.5 text-xs text-slate-300">
                {assessment && assessment.refutedClaimsCount > 0 && (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 flex items-start space-x-2">
                    <span className="font-bold text-rose-400">•</span>
                    <span>
                      <strong>Correct Refuted Statements:</strong> {assessment.refutedClaimsCount} statement(s) are
                      disproven by authoritative external records. Remove or amend these claims before relying on this
                      content.
                    </span>
                  </div>
                )}
                {assessment && assessment.insufficientClaimsCount > 0 && (
                  <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 flex items-start space-x-2">
                    <span className="font-bold text-amber-400">•</span>
                    <span>
                      <strong>Conduct Manual Inquiries:</strong> {assessment.insufficientClaimsCount} claim(s) have
                      insufficient external grounding sources. Verify through specialized domain libraries or archives.
                    </span>
                  </div>
                )}
                {assessment && assessment.mismatchedCitationsCount > 0 && (
                  <div className="p-3 rounded-lg bg-violet-950/40 border border-violet-500/30 flex items-start space-x-2">
                    <span className="font-bold text-violet-400">•</span>
                    <span>
                      <strong>Audit Academic DOI References:</strong> Crossref detected mismatched metadata for{' '}
                      {assessment.mismatchedCitationsCount} citation(s). Consult original conference proceedings.
                    </span>
                  </div>
                )}
                {assessment && assessment.criticalSecurityCount > 0 && (
                  <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/50 flex items-start space-x-2">
                    <span className="font-bold text-rose-400">•</span>
                    <span>
                      <strong>Remediate Code Vulnerabilities:</strong> {assessment.criticalSecurityCount} Critical
                      security pattern(s) identified. Do not deploy or execute code until secrets are removed and SQL
                      queries parameterized.
                    </span>
                  </div>
                )}
                <div className="p-3 rounded-lg bg-[#080D18] border border-[#1E2D48] text-slate-400">
                  <span>
                    Note: TRUSTX AI does not automatically rewrite content to pretend it is infallible truth. The system
                    arms human analysts with empirical evidence to make responsible editorial and security decisions.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. CLAIMS TAB */}
        {activeTab === 'claims' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono text-slate-400">
                Extracted atomic claims ({record.claims.length})
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Supported: {assessment?.supportedClaimsCount} • Refuted: {assessment?.refutedClaimsCount} • Insufficient: {assessment?.insufficientClaimsCount}
              </span>
            </div>
            {record.claims.map((claim) => (
              <ClaimCard key={claim.claimId} claim={claim} />
            ))}
          </div>
        )}

        {/* 3. EVIDENCE TAB */}
        {activeTab === 'evidence' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono text-slate-400">
                Retrieved external grounding documents ({record.evidence.length})
              </span>
            </div>
            {record.evidence.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-[#111D30] rounded-xl border border-[#1E2D48]">
                No external evidence documents recorded.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {record.evidence.map((ev) => (
                  <EvidenceCard key={ev.evidenceId} evidence={ev} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. HALLUCINATIONS TAB */}
        {activeTab === 'hallucinations' && (
          <div className="space-y-4">
            {record.hallucinations.map((h) => (
              <div
                key={h.warningId}
                className="bg-[#111D30] border border-rose-500/40 rounded-xl p-5 shadow-xl space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-950/80 text-rose-400 border border-rose-500/40">
                    {h.category.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{h.warningId}</span>
                </div>
                <h4 className="text-sm font-semibold text-white">"{h.statement}"</h4>
                <div className="text-xs text-rose-200/90 bg-[#080D18] p-3 rounded border border-rose-900/40 leading-relaxed">
                  <span className="text-slate-400 block font-mono text-[10px] uppercase mb-1">Analysis Rationale</span>
                  {h.explanation}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. CONTRADICTIONS TAB */}
        {activeTab === 'contradictions' && (
          <div className="space-y-4">
            {record.contradictions.map((c) => (
              <div
                key={c.contradictionId}
                className="bg-[#111D30] border border-amber-500/40 rounded-xl p-5 shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-950/80 text-amber-400 border border-amber-500/40">
                    INTERNAL CONTRADICTION DETECTED
                  </span>
                  <span className="text-xs font-mono text-slate-400">{c.contradictionId}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#080D18] border border-[#1E2D48]">
                    <span className="text-[10px] font-mono text-cyan-400 block mb-1">
                      Claim {c.claimIds[0] || 'A'}
                    </span>
                    <p className="text-xs text-white">"{c.claimTexts?.[0] || 'Statement A'}"</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#080D18] border border-[#1E2D48]">
                    <span className="text-[10px] font-mono text-rose-400 block mb-1">
                      Claim {c.claimIds[1] || 'B'}
                    </span>
                    <p className="text-xs text-white">"{c.claimTexts?.[1] || 'Statement B'}"</p>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-[#0D1524] p-3 rounded border border-[#1E2D48] leading-relaxed">
                  <span className="text-slate-400 block font-mono text-[10px] uppercase mb-1">
                    Conflict Explanation
                  </span>
                  {c.explanation}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 6. CITATIONS TAB */}
        {activeTab === 'citations' && (
          <div className="space-y-4">
            {record.citations.map((cit) => (
              <div
                key={cit.citationId}
                className="bg-[#111D30] border border-[#1E2D48] rounded-xl p-5 shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#080D18] text-cyan-400 border border-[#1E2D48]">
                    {cit.citationId}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                      cit.status === 'VERIFIED'
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                        : cit.status === 'METADATA_MISMATCH'
                        ? 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                        : 'bg-rose-950/80 text-rose-400 border-rose-500/40'
                    }`}
                  >
                    {cit.status}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Submitted Reference</span>
                  <p className="text-xs text-white bg-[#080D18] p-2.5 rounded border border-[#1E2D48]">
                    {cit.submittedCitation}
                  </p>
                </div>

                {cit.retrievedTitle && (
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase block mb-1">
                      Matched {cit.databaseSource} Publication Record
                    </span>
                    <div className="text-xs text-slate-300 bg-[#0D1524] p-3 rounded border border-[#1E2D48] space-y-1">
                      <p className="font-semibold text-white">{cit.retrievedTitle}</p>
                      {cit.retrievedAuthors && <p className="text-slate-400">Authors: {cit.retrievedAuthors}</p>}
                      <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
                        {cit.retrievedYear && <span>Year: {cit.retrievedYear}</span>}
                        {cit.retrievedDoi && <span>DOI: {cit.retrievedDoi}</span>}
                      </div>
                      {cit.retrievedUrl && (
                        <a
                          href={cit.retrievedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-cyan-400 hover:underline pt-1 text-xs"
                        >
                          <span>View Official Registry</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {cit.mismatchDetails && (
                  <div className="text-xs text-amber-300 bg-amber-950/40 p-2.5 rounded border border-amber-500/30">
                    <span className="font-bold block mb-0.5">Audit Mismatch Warning:</span>
                    {cit.mismatchDetails}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 7. CODE SECURITY TAB */}
        {activeTab === 'security' && (
          <div>
            <CodeEditorViewer
              code={record.submittedCode || ''}
              language={record.language || 'python'}
              findings={record.securityFindings || []}
            />
          </div>
        )}

        {/* 8. EVIDENCE CONSTELLATION TAB */}
        {activeTab === 'constellation' && (
          <div className="space-y-4">
            <EvidenceConstellation
              claims={record.claims || []}
              evidence={record.evidence || []}
              contradictions={record.contradictions || []}
            />
          </div>
        )}

        {/* Share Link Floating Notification */}
        {copiedLink && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-950/95 border border-emerald-500/80 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-mono backdrop-blur-md glow-verified">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Shareable Audit Link copied to clipboard! Anyone with this link can view this audit.</span>
          </div>
        )}
      </div>
    </div>
  );
}
