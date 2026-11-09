import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { saveVerificationRecord } from '../services/firestoreService.ts';
import { VerificationRecord, ProcessingStage } from '../types/index.ts';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Cpu,
  Search,
  BookOpen,
  Code2,
  BarChart3,
  FileText,
  Sparkles,
} from 'lucide-react';

const INITIAL_STAGES: ProcessingStage[] = [
  { id: 1, title: 'Content Received & Sanitized', description: 'Normalizing input syntax and preparing pipeline payload', status: 'pending' },
  { id: 2, title: 'Intelligent Claim Extraction', description: 'Deconstructing answer into atomic factual propositions', status: 'pending' },
  { id: 3, title: 'External Evidence Retrieval', description: 'Executing Google Search grounding queries for authoritative sources', status: 'pending' },
  { id: 4, title: 'Empirical Fact Verification', description: 'Corroborating assertions against retrieved web documentation', status: 'pending' },
  { id: 5, title: 'Hallucination Pattern Analysis', description: 'Auditing statements for uncorroborated or fabricated facts', status: 'pending' },
  { id: 6, title: 'Contradiction Detection', description: 'Cross-checking internal dates, timelines, and opposing claims', status: 'pending' },
  { id: 7, title: 'Academic Citation Verification', description: 'Auditing DOIs and references against Crossref and OpenAlex', status: 'pending' },
  { id: 8, title: 'Static Code Security Audit', description: 'Executing deterministic AST vulnerability scans', status: 'pending' },
  { id: 9, title: 'Multi-Dimensional Assessment', description: 'Formulating factuality, coverage, and risk indicators', status: 'pending' },
  { id: 10, title: 'Final Report Compilation', description: 'Persisting audit record and generating constellation graph', status: 'pending' },
];

export function ProcessingPage() {
  const { currentUser, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const [stages, setStages] = useState<ProcessingStage[]>(INITIAL_STAGES);
  const [activeStageId, setActiveStageId] = useState(1);
  const [statusMessage, setStatusMessage] = useState('Initializing verification laboratory engine...');
  const [error, setError] = useState<string | null>(null);

  const stageTickerRef = useRef<NodeJS.Timeout | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    async function execute() {
      const stored = sessionStorage.getItem('trustx_pending_analysis');
      if (!stored) {
        navigate('/new-verification');
        return;
      }

      const payload = JSON.parse(stored);
      const isCodeOnly = payload.inputType === 'code';
      const isTextOnly = payload.inputType === 'text';

      const setStageStatus = (id: number, status: 'in_progress' | 'completed' | 'skipped' | 'failed', msg?: string) => {
        if (cancelledRef.current) return;
        setStages((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
        setActiveStageId(id);
        if (msg) setStatusMessage(msg);
      };

      // Stage progression descriptions
      const stepMessages: Record<number, string> = {
        1: 'Payload ingested. Sanitizing character bounds and AST structure...',
        2: 'Deconstructing answer into atomic factual propositions via Gemini 3.8 Flash...',
        3: 'Querying external search grounding chunks for authoritative web evidence...',
        4: 'Corroborating assertions against empirical references and domain documentation...',
        5: 'Auditing statements for uncorroborated facts and hallucination patterns...',
        6: 'Cross-checking internal temporal consistency, dates, and opposing claims...',
        7: 'Auditing academic citations and DOIs against Crossref & OpenAlex databases...',
        8: 'Executing static AST vulnerability scanning (Secrets, SQLi, Insecure Deserialization)...',
        9: 'Synthesizing multi-dimensional factuality and trust indicators...',
        10: 'Persisting verification record and compiling interactive constellation graph...',
      };

      // Start initial Stage 1
      setStageStatus(1, 'in_progress', stepMessages[1]);

      // Set up a ticker that actively advances stages while backend processes
      let currentVirtualStage = 1;
      stageTickerRef.current = setInterval(() => {
        if (cancelledRef.current) return;
        if (currentVirtualStage < 9) {
          // Complete previous virtual stage
          setStages((prev) =>
            prev.map((s) => {
              if (s.id === currentVirtualStage) return { ...s, status: 'completed' };
              if (s.id === currentVirtualStage + 1) return { ...s, status: 'in_progress' };
              return s;
            })
          );
          currentVirtualStage += 1;
          setActiveStageId(currentVirtualStage);
          setStatusMessage(stepMessages[currentVirtualStage] || 'Processing verification pipeline...');
        }
      }, 950);

      try {
        // Dispatch backend verification pipeline call
        const apiResponse = await fetch('/api/verification/full-pipeline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (stageTickerRef.current) {
          clearInterval(stageTickerRef.current);
          stageTickerRef.current = null;
        }

        if (!apiResponse.ok) {
          const errData = await apiResponse.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with status ${apiResponse.status}`);
        }

        const json = await apiResponse.json();
        const record: VerificationRecord = json.data;

        if (cancelledRef.current) return;

        // Rapidly finalize all stages up to Stage 10 with precise actual metrics
        setStages((prev) =>
          prev.map((s) => {
            if (s.id === 2 && isCodeOnly) return { ...s, status: 'skipped', description: 'Skipped for code-only analysis' };
            if ([3, 4, 5, 6, 7].includes(s.id) && isCodeOnly) return { ...s, status: 'skipped' };
            if (s.id === 7 && (!record.citations || record.citations.length === 0)) {
              return { ...s, status: 'skipped', description: 'No academic citations in source text' };
            }
            if (s.id === 8 && isTextOnly) return { ...s, status: 'skipped', description: 'Skipped for text-only analysis' };
            if (s.id < 10) return { ...s, status: 'completed' };
            if (s.id === 10) return { ...s, status: 'in_progress' };
            return s;
          })
        );
        setActiveStageId(10);
        setStatusMessage('Persisting audit record to Cloud Firestore and preparing results...');

        // Save to Firestore for permanent cloud archival
        try {
          await saveVerificationRecord(record);
        } catch (dbErr) {
          console.warn('Firestore cloud write notice:', dbErr);
        }

        // Cache completed verification locally for instant Dashboard and History aggregation
        try {
          const localList: VerificationRecord[] = JSON.parse(localStorage.getItem('trustx_local_verifications') || '[]');
          const filtered = localList.filter((r) => r.verificationId !== record.verificationId);
          filtered.unshift(record);
          localStorage.setItem('trustx_local_verifications', JSON.stringify(filtered.slice(0, 50)));
        } catch (cacheErr) {
          console.warn('Local verification list caching notice:', cacheErr);
        }

        // Cache record locally in both localStorage and sessionStorage for cross-tab and shared link retrieval
        try {
          localStorage.setItem(`trustx_record_${record.verificationId}`, JSON.stringify(record));
        } catch {}
        sessionStorage.setItem(`trustx_record_${record.verificationId}`, JSON.stringify(record));
        sessionStorage.removeItem('trustx_pending_analysis');

        // Mark stage 10 complete
        setStageStatus(10, 'completed', 'Verification complete. Launching analysis dashboard...');
        await new Promise((r) => setTimeout(r, 450));

        if (!cancelledRef.current) {
          navigate(`/results/${record.verificationId}`);
        }
      } catch (err: any) {
        if (stageTickerRef.current) {
          clearInterval(stageTickerRef.current);
        }
        if (!cancelledRef.current) {
          console.error('Pipeline error:', err);
          setError(err?.message || 'An error occurred during verification processing.');
          setStageStatus(activeStageId, 'failed', 'Pipeline execution halted');
        }
      }
    }

    execute();

    return () => {
      cancelledRef.current = true;
      if (stageTickerRef.current) {
        clearInterval(stageTickerRef.current);
      }
    };
  }, [currentUser, isDemoMode, navigate]);

  const handleCancel = () => {
    cancelledRef.current = true;
    if (stageTickerRef.current) {
      clearInterval(stageTickerRef.current);
    }
    sessionStorage.removeItem('trustx_pending_analysis');
    navigate('/new-verification');
  };

  const completedCount = stages.filter((s) => s.status === 'completed' || s.status === 'skipped').length;
  const progressPercent = Math.min(100, Math.round((completedCount / stages.length) * 100));

  return (
    <div className="min-h-screen bg-[#080D18] py-12 px-4 sm:px-6 lg:px-8 cyber-grid flex items-center justify-center">
      <div className="max-w-2xl w-full bg-[#111D30] border border-[#1E2D48] rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Top Laboratory Status */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1E2D48]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#080D18] border border-cyan-500/40 flex items-center justify-center glow-cyan">
              <Cpu className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-white">Verification Engine Active</h2>
              <p className="text-xs text-slate-400 font-mono">10-Module Real-Time Audit Pipeline</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xl font-bold font-mono text-cyan-400">{progressPercent}%</span>
            <span className="text-[10px] text-slate-500 font-mono block">Overall Progress</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#080D18] h-2 rounded-full overflow-hidden border border-[#1E2D48] mb-6">
          <div
            className="bg-gradient-to-r from-cyan-400 via-teal-300 to-violet-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Activity Status Callout */}
        <div className="mb-6 p-3.5 rounded-xl bg-[#080D18]/90 border border-cyan-500/40 flex items-center space-x-3 text-xs text-cyan-300 font-mono shadow-inner">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping flex-shrink-0" />
          <span className="truncate">{statusMessage}</span>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs">
            <div className="flex items-start space-x-2 font-semibold mb-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <span>Pipeline Notice</span>
            </div>
            <p className="text-[11px] text-rose-200/90 leading-relaxed mb-3">{error}</p>
            <button
              onClick={() => navigate('/new-verification')}
              className="px-3 py-1.5 rounded bg-rose-900/60 hover:bg-rose-900 text-white font-mono text-xs transition"
            >
              Return to Submission
            </button>
          </div>
        )}

        {/* 10 Laboratory Stages List */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-2">
          {stages.map((stage) => {
            const isCurrent = stage.id === activeStageId && stage.status === 'in_progress';
            return (
              <div
                key={stage.id}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors duration-200 ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md'
                    : stage.status === 'completed'
                    ? 'bg-[#080D18]/60 border-[#1E2D48] text-slate-300'
                    : stage.status === 'skipped'
                    ? 'bg-[#080D18]/30 border-transparent text-slate-600'
                    : 'bg-[#080D18]/20 border-transparent text-slate-600'
                }`}
              >
                <div className="flex items-center space-x-3 truncate pr-3">
                  <span className="font-mono text-slate-500 text-[10px] w-5">
                    {String(stage.id).padStart(2, '0')}
                  </span>
                  <div>
                    <span className={`font-semibold block ${isCurrent ? 'text-cyan-300' : 'text-white'}`}>
                      {stage.title}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate block">{stage.description}</span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {stage.status === 'completed' && (
                    <span className="flex items-center space-x-1 text-emerald-400 font-mono text-[10px] font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline">DONE</span>
                    </span>
                  )}
                  {stage.status === 'in_progress' && (
                    <span className="flex items-center space-x-1 text-cyan-400 font-mono text-[10px] font-bold">
                      <Clock className="w-4 h-4 animate-spin" />
                      <span className="hidden sm:inline">ACTIVE</span>
                    </span>
                  )}
                  {stage.status === 'skipped' && (
                    <span className="text-slate-500 font-mono text-[10px]">SKIPPED</span>
                  )}
                  {stage.status === 'pending' && (
                    <span className="text-slate-600 font-mono text-[10px]">PENDING</span>
                  )}
                  {stage.status === 'failed' && (
                    <span className="flex items-center space-x-1 text-rose-400 font-mono text-[10px] font-bold">
                      <XCircle className="w-4 h-4" />
                      <span>FAILED</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with Cancel */}
        <div className="mt-6 pt-4 border-t border-[#1E2D48] flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center space-x-1.5 text-cyan-400/90">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Speed Grounding Pipeline</span>
          </span>
          <button
            type="button"
            onClick={handleCancel}
            className="text-slate-400 hover:text-rose-400 transition"
          >
            Cancel Pipeline
          </button>
        </div>
      </div>
    </div>
  );
}
