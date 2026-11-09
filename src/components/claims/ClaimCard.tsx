import React, { useState } from 'react';
import { ExtractedClaim } from '../../types/index.ts';
import { CheckCircle2, XCircle, HelpCircle, ChevronDown, ChevronUp, ExternalLink, ShieldCheck } from 'lucide-react';

interface ClaimCardProps {
  claim: ExtractedClaim;
}

export function ClaimCard({ claim }: ClaimCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getStatusBadge = () => {
    switch (claim.verificationStatus) {
      case 'SUPPORTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 glow-verified">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>SUPPORTED</span>
          </span>
        );
      case 'REFUTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-950/80 text-rose-400 border border-rose-500/40 glow-refuted">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>REFUTED</span>
          </span>
        );
      case 'INSUFFICIENT_EVIDENCE':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-950/80 text-amber-400 border border-amber-500/40">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>INSUFFICIENT EVIDENCE</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-[#111D30] border border-[#1E2D48] rounded-xl p-5 hover:border-cyan-500/40 transition-all duration-200 shadow-xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#080D18] text-cyan-400 border border-[#1E2D48]">
            {claim.claimId}
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-[#0D1524]">
            {claim.claimType}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {claim.confidence !== undefined && (
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
              <span>Confidence:</span>
              <span className="text-white font-semibold">{Math.round(claim.confidence * 100)}%</span>
            </div>
          )}
          {getStatusBadge()}
        </div>
      </div>

      {/* Main Claim Text */}
      <h3 className="text-base font-medium text-white mb-3 leading-snug">
        "{claim.normalisedClaim}"
      </h3>

      {/* Verification Explanation */}
      <div className="text-xs text-slate-300 bg-[#080D18]/80 p-3.5 rounded-lg border border-[#1E2D48] mb-3 leading-relaxed">
        <div className="flex items-center space-x-1 text-slate-400 text-[10px] font-mono uppercase mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Verification Rationale & Evidence Audit</span>
        </div>
        <p>{claim.explanation || 'Verified through external search grounding engine.'}</p>
      </div>

      {/* Expand / Collapse Button for Original Context and Evidence */}
      <div className="flex items-center justify-between pt-2 border-t border-[#1E2D48]/70 text-xs">
        <div className="text-slate-400 font-mono">
          Sources: <span className="text-cyan-400 font-bold">{claim.evidenceSources?.length || 0}</span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition"
        >
          <span>{expanded ? 'Hide Source Context' : 'Inspect Original Statement & Sources'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Drawer */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-[#1E2D48] space-y-3">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
              Original Sentence in Context
            </span>
            <blockquote className="italic text-xs text-slate-300 bg-[#0D1524] p-3 rounded border-l-2 border-cyan-400">
              "{claim.originalText}"
            </blockquote>
          </div>

          {claim.evidenceSources && claim.evidenceSources.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1.5">
                Retrieved Corroborating Evidence Sources
              </span>
              <div className="space-y-2">
                {claim.evidenceSources.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#0D1524] border border-[#1E2D48] flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-white mb-1">{ev.sourceTitle}</p>
                      <p className="text-slate-400 text-[11px] mb-1 leading-relaxed">{ev.sourceSnippet}</p>
                      <span className="text-[10px] text-cyan-400/80 font-mono">
                        Relevance: {ev.relevance}
                      </span>
                    </div>
                    {ev.sourceUrl && (
                      <a
                        href={ev.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded bg-[#111D30] text-cyan-400 hover:text-cyan-300 flex-shrink-0"
                        title="Open external source"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
