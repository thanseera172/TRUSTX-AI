import React, { useState } from 'react';
import { CodeSecurityFinding, SecuritySeverity } from '../../types/index.ts';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2, ChevronRight, Copy, Check } from 'lucide-react';

interface CodeEditorViewerProps {
  code: string;
  language?: string;
  findings: CodeSecurityFinding[];
  className?: string;
}

export function CodeEditorViewer({ code, language = 'python', findings, className = '' }: CodeEditorViewerProps) {
  const [selectedFinding, setSelectedFinding] = useState<CodeSecurityFinding | null>(findings[0] || null);
  const [copied, setCopied] = useState(false);

  const lines = code.split(/\r?\n/);

  // Group findings by line number for fast indicator lookup
  const findingsByLine = new Map<number, CodeSecurityFinding[]>();
  findings.forEach((f) => {
    const list = findingsByLine.get(f.lineNumber) || [];
    list.push(f);
    findingsByLine.set(f.lineNumber, list);
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const severityBadge = (sev: SecuritySeverity) => {
    switch (sev) {
      case 'Critical':
        return 'bg-rose-950/80 text-rose-400 border-rose-500/40';
      case 'High':
        return 'bg-orange-950/80 text-orange-400 border-orange-500/40';
      case 'Medium':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/40';
      case 'Low':
        return 'bg-blue-950/80 text-blue-400 border-blue-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-5 ${className}`}>
      {/* Code Viewer Panel */}
      <div className="lg:col-span-7 bg-[#080D18] border border-[#1E2D48] rounded-xl overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0D1524] border-b border-[#1E2D48]">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 text-xs font-mono text-cyan-400 uppercase font-semibold">
              {language} Static Inspection
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-[#111D30] hover:bg-slate-800 rounded border border-[#1E2D48] transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code Content with Line Highlights */}
        <div className="p-4 font-mono text-xs overflow-x-auto max-h-[500px] overflow-y-auto select-text leading-relaxed">
          {lines.map((line, idx) => {
            const lineNum = idx + 1;
            const lineFindings = findingsByLine.get(lineNum);
            const isVulnerable = !!lineFindings && lineFindings.length > 0;
            const isSelected = selectedFinding?.lineNumber === lineNum;

            return (
              <div
                key={idx}
                id={`code-line-${lineNum}`}
                onClick={() => {
                  if (lineFindings && lineFindings.length > 0) {
                    setSelectedFinding(lineFindings[0]);
                  }
                }}
                className={`flex items-start rounded px-2 py-0.5 transition-colors ${
                  isSelected
                    ? 'bg-rose-950/70 border-l-4 border-rose-500'
                    : isVulnerable
                    ? 'bg-rose-950/30 border-l-2 border-rose-500/60 cursor-pointer hover:bg-rose-950/50'
                    : 'hover:bg-slate-900/60'
                }`}
              >
                {/* Line Number */}
                <span className="w-10 text-right pr-4 text-slate-600 select-none flex-shrink-0 font-mono">
                  {lineNum}
                </span>

                {/* Severity indicator dot if vulnerable */}
                {isVulnerable && (
                  <span className="mr-2 text-rose-400 select-none animate-pulse" title="Vulnerability on this line">
                    ●
                  </span>
                )}

                {/* Code text */}
                <span
                  className={`flex-1 break-all ${
                    isVulnerable ? 'text-rose-200 font-semibold' : 'text-slate-300'
                  }`}
                >
                  {line || ' '}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Findings Inspector Panel */}
      <div className="lg:col-span-5 flex flex-col space-y-4">
        <div className="bg-[#111D30] border border-[#1E2D48] rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-[#1E2D48] pb-2">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Static Security Findings ({findings.length})</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Rule-Based AST Scan</span>
          </div>

          {findings.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-emerald-300">No static security patterns flagged.</p>
              <p className="text-xs text-slate-500 mt-1">
                Zero hardcoded credentials, SQLi, command injection, or unsafe deserialization patterns detected.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {findings.map((f) => {
                const isSelected = selectedFinding?.findingId === f.findingId;
                return (
                  <div
                    key={f.findingId}
                    onClick={() => {
                      setSelectedFinding(f);
                      const el = document.getElementById(`code-line-${f.lineNumber}`);
                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-500/80 shadow-md'
                        : 'bg-[#0D1524] border-[#1E2D48] hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${severityBadge(f.severity)}`}>
                        {f.severity}
                      </span>
                      <span className="font-mono text-slate-400 text-[11px]">L{f.lineNumber}</span>
                      <span className="truncate font-medium text-white">{f.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Finding Detail & Remediation Card */}
        {selectedFinding && (
          <div className="bg-[#111D30] border border-[#1E2D48] rounded-xl p-5 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 rounded border text-xs font-bold ${severityBadge(selectedFinding.severity)}`}>
                  {selectedFinding.severity} Severity
                </span>
                <span className="text-xs font-mono text-cyan-400">
                  {selectedFinding.ruleId} • Line {selectedFinding.lineNumber}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mb-2">{selectedFinding.name}</h4>

              <div className="mb-3">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Risk Explanation</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-[#080D18]/70 p-2.5 rounded border border-[#1E2D48]">
                  {selectedFinding.explanation}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-emerald-400 block mb-1">
                  Suggested Remediation
                </span>
                <p className="text-xs text-emerald-200/90 leading-relaxed bg-emerald-950/30 p-2.5 rounded border border-emerald-500/30">
                  {selectedFinding.remediation}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1E2D48] text-[11px] text-slate-400 flex items-center justify-between">
              <span>Code Execution: Sandboxed Static AST only</span>
              <span className="font-mono text-slate-400">{selectedFinding.findingId}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
