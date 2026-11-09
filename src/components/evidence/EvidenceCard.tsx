import React from 'react';
import { EvidenceSource } from '../../types/index.ts';
import { ExternalLink, Globe, Calendar, BookmarkCheck } from 'lucide-react';

interface EvidenceCardProps {
  evidence: EvidenceSource;
}

export function EvidenceCard({ evidence }: EvidenceCardProps) {
  let domain = '';
  try {
    if (evidence.sourceUrl) {
      domain = new URL(evidence.sourceUrl).hostname.replace('www.', '');
    }
  } catch {
    domain = 'external source';
  }

  return (
    <div className="bg-[#111D30] border border-[#1E2D48] rounded-xl p-5 hover:border-cyan-500/40 transition shadow-lg flex flex-col justify-between">
      <div>
        {/* Domain & Claim ID */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-1.5 text-xs text-cyan-400 font-mono">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[200px]">{domain}</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#080D18] text-slate-300 border border-[#1E2D48]">
            Claim {evidence.claimId}
          </span>
        </div>

        {/* Source Title */}
        <h4 className="text-sm font-semibold text-white mb-2 leading-snug">
          {evidence.sourceTitle}
        </h4>

        {/* Source Snippet */}
        <p className="text-xs text-slate-300/90 leading-relaxed mb-3 bg-[#080D18]/60 p-2.5 rounded border border-[#1E2D48]">
          "{evidence.sourceSnippet}"
        </p>

        {/* Relevance */}
        <div className="flex items-start space-x-1.5 text-[11px] text-emerald-400/90 mb-3 font-mono">
          <BookmarkCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{evidence.relevance}</span>
        </div>
      </div>

      {/* External Link & Timestamp */}
      <div className="pt-3 border-t border-[#1E2D48] flex items-center justify-between text-xs">
        <span className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>
            {evidence.retrievalTimestamp
              ? new Date(evidence.retrievalTimestamp).toLocaleDateString()
              : 'Indexed Evidence'}
          </span>
        </span>

        {evidence.sourceUrl && (
          <a
            href={evidence.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-medium transition"
          >
            <span>Open Source</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
