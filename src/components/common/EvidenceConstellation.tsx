import React, { useState } from 'react';
import { ExtractedClaim, EvidenceSource, ContradictionFinding } from '../../types/index.ts';
import { ShieldCheck, ShieldAlert, AlertTriangle, ExternalLink, X, Info } from 'lucide-react';

interface ConstellationProps {
  claims: ExtractedClaim[];
  evidence?: EvidenceSource[];
  contradictions?: ContradictionFinding[];
  className?: string;
}

export function EvidenceConstellation({ claims, evidence = [], contradictions = [], className = '' }: ConstellationProps) {
  const [selectedClaim, setSelectedClaim] = useState<ExtractedClaim | null>(null);

  if (!claims || claims.length === 0) {
    return (
      <div className={`p-8 rounded-xl bg-[#111D30]/60 border border-[#1E2D48] text-center text-slate-400 ${className}`}>
        <Info className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-70" />
        <p className="text-sm">No claims available for constellation graph.</p>
      </div>
    );
  }

  // Calculate layout coordinates in a circular/orbital graph
  const width = 640;
  const height = 420;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.36;

  const claimNodes = claims.map((claim, idx) => {
    const angle = (idx / claims.length) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { ...claim, x, y, angle };
  });

  return (
    <div className={`relative rounded-xl bg-[#0D1524] border border-[#1E2D48] overflow-hidden ${className}`}>
      {/* Graph Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1E2D48] bg-[#111D30]/80 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono">
            Evidence Constellation Graph
          </span>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {claims.length} claims • {evidence.length} sources • {contradictions.length} contradictions
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto flex justify-center py-4 cyber-grid">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[640px] h-[380px] select-none">
          {/* Subtle background orbital ring */}
          <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#1E2D48" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx={centerX} cy={centerY} r={radius * 0.5} fill="none" stroke="#1E2D48" strokeWidth="1" strokeDasharray="2 4" />

          {/* Central Hub Node */}
          <circle cx={centerX} cy={centerY} r="26" fill="#111D30" stroke="#20D9F5" strokeWidth="2" className="glow-cyan" />
          <text
            x={centerX}
            y={centerY + 4}
            textAnchor="middle"
            fill="#20D9F5"
            fontSize="10"
            fontWeight="bold"
            fontFamily="Space Grotesk"
          >
            TRUSTX
          </text>

          {/* Radial links from central hub to claims */}
          {claimNodes.map((node) => {
            let strokeColor = '#FFBE55';
            if (node.verificationStatus === 'SUPPORTED') strokeColor = '#25D695';
            else if (node.verificationStatus === 'REFUTED') strokeColor = '#FF5D70';

            return (
              <line
                key={`hub-${node.claimId}`}
                x1={centerX}
                y1={centerY}
                x2={node.x}
                y2={node.y}
                stroke={strokeColor}
                strokeWidth={selectedClaim?.claimId === node.claimId ? 2.5 : 1.2}
                strokeOpacity={selectedClaim?.claimId === node.claimId ? 0.9 : 0.4}
              />
            );
          })}

          {/* Contradiction links between contradictory claims */}
          {contradictions.map((c, cIdx) => {
            const nodeA = claimNodes.find((n) => n.claimId === c.claimIds[0]);
            const nodeB = claimNodes.find((n) => n.claimId === c.claimIds[1]);
            if (!nodeA || !nodeB) return null;

            return (
              <line
                key={`contr-${cIdx}`}
                x1={nodeA.x}
                y1={nodeA.y}
                x2={nodeB.x}
                y2={nodeB.y}
                stroke="#FF5D70"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                className="animate-pulse"
              />
            );
          })}

          {/* Claim Nodes */}
          {claimNodes.map((node) => {
            const isSelected = selectedClaim?.claimId === node.claimId;
            let fillColor = '#FFBE55';
            if (node.verificationStatus === 'SUPPORTED') fillColor = '#25D695';
            else if (node.verificationStatus === 'REFUTED') fillColor = '#FF5D70';

            return (
              <g
                key={node.claimId}
                className="cursor-pointer transition-transform duration-200 hover:scale-110"
                onClick={() => setSelectedClaim(node)}
              >
                {/* Node Outer Glow Ring */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? 22 : 18}
                  fill="#0D1524"
                  stroke={fillColor}
                  strokeWidth={isSelected ? 3 : 2}
                  style={{ filter: isSelected ? `drop-shadow(0px 0px 8px ${fillColor})` : 'none' }}
                />

                {/* Node ID label */}
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fill="#F3F7FC"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono"
                >
                  {node.claimId}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Graph Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 py-2.5 px-4 bg-[#111D30]/60 border-t border-[#1E2D48] text-xs">
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#25D695]" />
          <span className="text-slate-300">Supported Source</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5D70]" />
          <span className="text-slate-300">Refuted Claim</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFBE55]" />
          <span className="text-slate-300">Insufficient Evidence</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-4 h-0.5 bg-[#FF5D70] border-t-2 border-dashed border-[#FF5D70]" />
          <span className="text-slate-300">Contradiction Link</span>
        </div>
      </div>

      {/* Interactive Detail Modal Drawer */}
      {selectedClaim && (
        <div className="absolute inset-x-0 bottom-0 max-h-[85%] bg-[#111D30]/95 backdrop-blur-md border-t border-cyan-500/40 p-5 shadow-2xl transition-all duration-300 overflow-y-auto">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#1E2D48] text-cyan-400">
                {selectedClaim.claimId}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  selectedClaim.verificationStatus === 'SUPPORTED'
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                    : selectedClaim.verificationStatus === 'REFUTED'
                    ? 'bg-rose-950/80 text-rose-400 border border-rose-500/40'
                    : 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                }`}
              >
                {selectedClaim.verificationStatus}
              </span>
              {selectedClaim.confidence !== undefined && (
                <span className="text-xs text-slate-400 font-mono">
                  Confidence: {Math.round(selectedClaim.confidence * 100)}%
                </span>
              )}
            </div>
            <button
              onClick={() => setSelectedClaim(null)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-sm font-semibold text-white mb-2 leading-snug">
            "{selectedClaim.normalisedClaim}"
          </h4>

          <div className="text-xs text-slate-300 bg-[#080D18]/80 p-3 rounded-lg border border-[#1E2D48] mb-3">
            <span className="text-slate-400 block font-mono text-[10px] uppercase mb-1">Evidence Analysis</span>
            {selectedClaim.explanation || 'Analyzed against external grounding sources.'}
          </div>

          {selectedClaim.evidenceSources && selectedClaim.evidenceSources.length > 0 && (
            <div>
              <span className="text-slate-400 block font-mono text-[10px] uppercase mb-1.5">
                Connected Corroboration Sources ({selectedClaim.evidenceSources.length})
              </span>
              <div className="space-y-1.5">
                {selectedClaim.evidenceSources.map((source, sIdx) => (
                  <a
                    key={sIdx}
                    href={source.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded bg-[#0D1524] border border-[#1E2D48] hover:border-cyan-500/50 text-xs text-cyan-300 transition"
                  >
                    <span className="truncate pr-2">{source.sourceTitle}</span>
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
