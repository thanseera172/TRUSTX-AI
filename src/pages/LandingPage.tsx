import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { DEMO_CASES } from '../../server/demoCases.ts';
import { EvidenceConstellation } from '../components/common/EvidenceConstellation.tsx';
import {
  ShieldCheck,
  Search,
  AlertTriangle,
  BookOpen,
  Code2,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Layers,
  FileCheck,
  ChevronRight,
  Database,
  Cpu,
} from 'lucide-react';

export function LandingPage() {
  const { isDemoMode, setIsDemoMode } = useAuth();
  const navigate = useNavigate();
  const [activeTabModule, setActiveTabModule] = useState(0);

  const modules = [
    {
      id: 1,
      title: 'Claim Extraction',
      badge: 'Module 01',
      icon: Search,
      color: 'text-cyan-400',
      description: 'Breaks down unstructured AI answers into individual, testable factual propositions.',
      detail:
        'Uses Gemini structured JSON schemas to separate verifiable empirical assertions from subjective opinions, assigning unique claim IDs and taxonomy classifications.',
    },
    {
      id: 2,
      title: 'Search Grounding',
      badge: 'Module 02',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      description: 'Validates individual claims against external live web sources and authoritative registries.',
      detail:
        'Queries Google Search grounding to retrieve authoritative web documents, classifying assertions as SUPPORTED, REFUTED, or INSUFFICIENT_EVIDENCE with confidence metrics.',
    },
    {
      id: 3,
      title: 'Hallucination & Contradictions',
      badge: 'Module 03',
      icon: AlertTriangle,
      color: 'text-rose-400',
      description: 'Detects internal conflicting timelines, impossible numbers, and fabricated facts.',
      detail:
        'Cross-compares all statements within the same answer to flag temporal conflicts (e.g. conflicting dates) and highlights unsupported assertions.',
    },
    {
      id: 4,
      title: 'Citation Audit',
      badge: 'Module 04',
      icon: BookOpen,
      color: 'text-violet-400',
      description: 'Audits academic references and DOIs against Crossref and OpenAlex databases.',
      detail:
        'Resolves DOI identifiers, cross-checks journal titles, author lists, and publication years to catch fabricated paper citations common in LLM outputs.',
    },
    {
      id: 5,
      title: 'Code Security Scanner',
      badge: 'Module 05',
      icon: Code2,
      color: 'text-amber-400',
      description: 'Deterministic static security analysis for AI-generated code snippets.',
      detail:
        'Scans Python, JavaScript, TypeScript, and Java for hardcoded API keys, SQL injection string concatenation, unsafe dynamic eval(), and shell command vectors without executing code.',
    },
    {
      id: 6,
      title: 'Multi-Dimensional Trust',
      badge: 'Module 06',
      icon: BarChart3,
      color: 'text-cyan-400',
      description: 'Synthesizes transparent, explainable assessment scores with zero arbitrary percentages.',
      detail:
        'Formulates Factuality Alignment, Evidence Coverage, Contradiction Frequency, and Code Security Posture, explaining the exact rationale behind every label.',
    },
  ];

  const handleLaunchDemoCase = (demoId: string) => {
    setIsDemoMode(true);
    navigate(`/results/${demoId}`);
  };

  return (
    <div className="min-h-screen bg-[#080D18] text-[#F3F7FC] selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden cyber-grid border-b border-[#1E2D48]">
        {/* Soft Ambient Lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#111D30] border border-cyan-500/30 mb-6 glow-border">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-semibold tracking-wide text-cyan-300">
                TRUST INTELLIGENCE LAB • EVIDENCE BEFORE TRUST
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-heading leading-tight mb-6">
              Don't Just Trust AI. <br />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-violet-400 bg-clip-text text-transparent">
                Verify It.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-light max-w-3xl mx-auto mb-10">
              An intelligent verification layer that analyses AI-generated answers, validates claims against external
              evidence, detects contradictions, audits research citations, and identifies potential code security risks.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/new-verification"
                className="px-6 py-3.5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition flex items-center space-x-2 glow-cyan"
              >
                <span>Verify Sample AI Answer</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </Link>

              <button
                onClick={() => handleLaunchDemoCase('demo-case-1')}
                className="px-6 py-3.5 rounded-xl font-semibold text-white bg-[#111D30] hover:bg-[#16253D] border border-[#1E2D48] hover:border-cyan-500/40 transition flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Launch Interactive Demo</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-3">
              Default AI-generated answers & code are pre-loaded — no external copying required to test.
            </p>
          </div>

          {/* Interactive Hero Constellation Visual */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="text-center mb-3">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Live Evidence Constellation Preview — JWST Telemetry Verification
              </span>
            </div>
            <EvidenceConstellation
              claims={DEMO_CASES[0].fullRecord.claims}
              evidence={DEMO_CASES[0].fullRecord.claims.flatMap((c: any) => c.evidenceSources || [])}
              contradictions={[]}
              className="shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Six Core Modules Showcase */}
      <section className="py-20 bg-[#0D1524] border-b border-[#1E2D48]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase mb-2 block">
              Core Architectural Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white">
              The Six Integrated Verification Modules
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              TRUSTX AI does not replace external AI assistants. It operates as an independent audit engine to check
              empirical support before reliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.id}
                  className="bg-[#111D30] border border-[#1E2D48] rounded-xl p-6 glass-panel-hover flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-[#080D18] border border-[#1E2D48] flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${m.color}`} />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-400 bg-[#080D18] px-2.5 py-0.5 rounded border border-[#1E2D48]">
                        {m.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{m.title}</h3>
                    <p className="text-xs text-slate-300 mb-3 leading-relaxed">{m.description}</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-mono bg-[#080D18]/60 p-2.5 rounded border border-[#1E2D48]">
                      {m.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Instant Demo Sandbox Presets */}
      <section className="py-20 bg-[#080D18] border-b border-[#1E2D48]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-2">
                Demonstration Laboratory
              </span>
              <h2 className="text-3xl font-bold font-heading text-white">
                Pre-Configured Evaluation Test Cases
              </h2>
              <p className="text-slate-400 text-sm mt-2 max-w-2xl">
                Inspect how TRUSTX AI handles supported claims, temporal contradictions, fake DOI citations, and
                vulnerable Python code.
              </p>
            </div>
            <Link
              to="/new-verification"
              className="mt-4 md:mt-0 inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              <span>Verify custom AI content</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DEMO_CASES.map((d) => (
              <div
                key={d.id}
                onClick={() => handleLaunchDemoCase(d.id)}
                className="bg-[#111D30] border border-[#1E2D48] hover:border-cyan-500/50 rounded-xl p-5 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-cyan-400 bg-[#080D18] border border-[#1E2D48]">
                      {d.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{d.sourceAI}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition mb-1.5">
                    {d.name}
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">{d.tagline}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#1E2D48] text-xs">
                  <span className="text-[11px] font-mono text-slate-400">{d.inputType.toUpperCase()} AUDIT</span>
                  <span className="text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Transparency Section */}
      <section className="py-20 bg-[#0D1524]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#111D30] to-[#0A1220] border border-[#1E2D48] rounded-2xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
            <div className="max-w-3xl">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-3">
                Methodological Integrity
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white mb-4">
                Evidence Before Trust — Transparency by Design
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                TRUSTX AI adheres to strict academic and cybersecurity verification ethics. We never generate arbitrary
                "truth percentages" or claim to eliminate 100% of hallucinations. Claims are checked against verifiable
                external search grounding chunks, cross-referenced DOIs via Crossref and OpenAlex, and AST-parsed code
                rules.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#1E2D48]">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase font-mono mb-1">Zero Blind Trust</h4>
                  <p className="text-[11px] text-slate-400">
                    Evidence is retrieved from independent web sources and peer-reviewed indices.
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase font-mono mb-1">Sandboxed Safety</h4>
                  <p className="text-[11px] text-slate-400">
                    Submitted code is never executed on our servers. Analysis is strictly static pattern auditing.
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase font-mono mb-1">Exportable Artifacts</h4>
                  <p className="text-[11px] text-slate-400">
                    Download full audit reports in PDF format complete with timestamps and citation links.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#080D18] border-t border-[#1E2D48] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="font-heading font-bold text-slate-300">TRUSTX AI</span>
            <span>• Universal AI Trust Verification and Risk Analysis System</span>
          </div>
          <div className="flex items-center space-x-6 text-slate-400 font-mono text-[11px]">
            <Link to="/help" className="hover:text-cyan-400 transition">
              Methodology & Docs
            </Link>
            <Link to="/new-verification" className="hover:text-cyan-400 transition">
              New Verification
            </Link>
            <span>Final Year B.E. Computer Science</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
