import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import {
  DEFAULT_AI_TEXT_ANSWER,
  DEFAULT_AI_CODE_SNIPPET,
  SAMPLE_AI_PRESETS,
  SampleAIItem,
} from '../data/sampleAIContent.ts';
import {
  FileText,
  Code2,
  Layers,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Upload,
  Info,
  RotateCcw,
  Eraser,
  ClipboardPaste,
  CheckCircle2,
  Play,
  HelpCircle,
  PlusCircle,
  FileEdit,
} from 'lucide-react';

export function NewVerificationPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode: 'custom' (clean slate to paste user's own answer) vs 'sample' (pre-loaded AI output)
  const initialMode = searchParams.get('mode') === 'sample' ? 'sample' : 'custom';
  const [entryMode, setEntryMode] = useState<'custom' | 'sample'>(initialMode);

  const [activeTab, setActiveTab] = useState<'text' | 'code' | 'combined'>('text');
  const [title, setTitle] = useState('');
  const [sourceAI, setSourceAI] = useState<'ChatGPT' | 'Gemini' | 'Claude' | 'Other'>('ChatGPT');
  const [textInput, setTextInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [language, setLanguage] = useState<'python' | 'javascript' | 'typescript' | 'java'>('python');
  const [error, setError] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Initialize or handle mode change
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'sample') {
      setEntryMode('sample');
      setTitle('JWST Orbital Architecture & Specifications');
      setTextInput(DEFAULT_AI_TEXT_ANSWER);
      setCodeInput(DEFAULT_AI_CODE_SNIPPET);
      setSelectedPresetId('sample-jwst');
    } else {
      setEntryMode('custom');
      // If custom mode, leave inputs clean for user to paste their own answer
      if (searchParams.get('fresh') === 'true') {
        setTextInput('');
        setCodeInput('');
        setTitle('');
        setSelectedPresetId('');
      }
    }
  }, [searchParams]);

  // Switch to custom paste mode
  const handleSwitchToCustom = () => {
    setEntryMode('custom');
    setSelectedPresetId('');
    setTextInput('');
    setCodeInput('');
    setTitle('');
    setSearchParams({ mode: 'custom' });
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  // Switch to pre-loaded sample mode
  const handleSwitchToSample = (preset?: SampleAIItem) => {
    setEntryMode('sample');
    setSearchParams({ mode: 'sample' });
    const target = preset || SAMPLE_AI_PRESETS[0];
    handleSelectSample(target);
  };

  // Load a chosen sample AI item
  const handleSelectSample = (sample: SampleAIItem) => {
    setSelectedPresetId(sample.id);
    setTitle(sample.title);
    setSourceAI(sample.sourceAI);

    if (sample.type === 'code') {
      setActiveTab('code');
      setCodeInput(sample.content);
      if (sample.language) setLanguage(sample.language);
    } else {
      setActiveTab('text');
      setTextInput(sample.content);
    }
  };

  // Clipboard paste helper
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim().length > 0) {
        if (activeTab === 'code') {
          setCodeInput(text);
        } else {
          setTextInput(text);
        }
        setEntryMode('custom');
        setSelectedPresetId('');
        setPasteNotice('Content pasted successfully from clipboard!');
        setTimeout(() => setPasteNotice(null), 3000);
      } else {
        setPasteNotice('Clipboard is empty or did not contain plain text.');
        setTimeout(() => setPasteNotice(null), 3000);
      }
    } catch {
      setPasteNotice('Permission denied or clipboard access unavailable. Use Ctrl+V / Cmd+V directly in the box.');
      setTimeout(() => setPasteNotice(null), 4000);
    }
  };

  // Reset to empty blank slate
  const handleResetToBlank = () => {
    setTextInput('');
    setCodeInput('');
    setTitle('');
    setSelectedPresetId('');
    setEntryMode('custom');
    setSearchParams({ mode: 'custom' });
    textareaRef.current?.focus();
  };

  // File upload handler for code
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCodeInput(content);
      setSelectedPresetId('');
      setEntryMode('custom');

      // Auto detect language from extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'py') setLanguage('python');
      else if (ext === 'ts') setLanguage('typescript');
      else if (ext === 'js') setLanguage('javascript');
      else if (ext === 'java') setLanguage('java');
    };
    reader.readAsText(file);
  };

  const handleStartVerification = async () => {
    setError(null);

    // Validation
    if (activeTab === 'text' && textInput.trim().length === 0) {
      setError('Please paste or enter your AI-generated text to verify.');
      return;
    }
    if (activeTab === 'code' && codeInput.trim().length === 0) {
      setError('Please paste or upload the source code to analyze.');
      return;
    }
    if (activeTab === 'combined' && (textInput.trim().length === 0 || codeInput.trim().length === 0)) {
      setError('Both text answer and code snippet are required for combined analysis mode.');
      return;
    }

    // Save payload to session storage and navigate to Live Laboratory Processing Page
    const payload = {
      title: title.trim() || (activeTab === 'code' ? 'Code Security Audit' : 'AI Content Verification'),
      inputType: activeTab,
      sourceAI,
      text: activeTab !== 'code' ? textInput : undefined,
      code: activeTab !== 'text' ? codeInput : undefined,
      language,
      userId: currentUser?.uid || 'guest_user',
    };

    sessionStorage.setItem('trustx_pending_analysis', JSON.stringify(payload));
    navigate('/processing');
  };

  const currentPreset = SAMPLE_AI_PRESETS.find((p) => p.id === selectedPresetId);

  return (
    <div className="min-h-screen bg-[#080D18] py-10 px-4 sm:px-6 lg:px-8 cyber-grid">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Title and Mode Switcher */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#111D30] border border-cyan-500/30 mb-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-cyan-300">STAGE 1: INPUT ACQUISITION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            Start a Trust Analysis
          </h1>
          <p className="text-sm text-slate-300 mt-2 max-w-xl mx-auto">
            Paste any answer or code generated by ChatGPT, Gemini, or Claude to audit factual accuracy, contradictions,
            and security risks.
          </p>
        </div>

        {/* PRIMARY MODE SELECTOR: PASTE CUSTOM VS EXPLORE SAMPLE */}
        <div className="bg-[#111D30] border border-[#1E2D48] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 glow-cyan">
              {entryMode === 'custom' ? (
                <FileEdit className="w-5 h-5 text-cyan-400" />
              ) : (
                <Sparkles className="w-5 h-5 text-cyan-400" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white">
                  {entryMode === 'custom' ? 'Custom Verification Mode' : 'Sample Demonstration Mode'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    entryMode === 'custom'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                  }`}
                >
                  {entryMode === 'custom' ? 'BLANK SLATE READY' : 'PRE-POPULATED SAMPLE'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {entryMode === 'custom'
                  ? 'Paste your own AI-generated answer or code directly below.'
                  : 'Testing with a pre-configured sample answer to demonstrate the 6 modules.'}
              </p>
            </div>
          </div>

          {/* Action Segmented Toggle */}
          <div className="flex items-center rounded-xl bg-[#080D18] p-1 border border-[#1E2D48] self-start sm:self-auto">
            <button
              type="button"
              onClick={handleSwitchToCustom}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                entryMode === 'custom'
                  ? 'bg-cyan-400 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Paste Own AI Answer</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchToSample()}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                entryMode === 'sample'
                  ? 'bg-cyan-400 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Use Sample Output</span>
            </button>
          </div>
        </div>

        {/* If Sample Mode is selected, show sample presets */}
        {entryMode === 'sample' && (
          <div className="bg-[#111D30]/70 border border-cyan-500/40 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pre-Configured AI Outputs (Click to Load):</span>
              </span>
              <button
                type="button"
                onClick={handleSwitchToCustom}
                className="text-xs text-cyan-400 hover:underline font-mono"
              >
                Clear & paste your own instead →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {SAMPLE_AI_PRESETS.map((sample) => {
                const isSelected = selectedPresetId === sample.id;
                return (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-sm'
                        : 'bg-[#080D18] border-[#1E2D48] text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-[#111D30] text-cyan-400">
                          {sample.type === 'code' ? `${sample.language} CODE` : 'TEXT'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{sample.sourceAI}</span>
                      </div>
                      <span className="font-semibold text-[11px] block truncate">{sample.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block truncate">
                      {sample.expectedOutcome}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Format Tabs: Text, Code, or Combined */}
        <div className="flex rounded-xl bg-[#0D1524] p-1.5 border border-[#1E2D48]">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition ${
              activeTab === 'text'
                ? 'bg-[#111D30] text-cyan-400 border border-cyan-500/40 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>AI Text Verification</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition ${
              activeTab === 'code'
                ? 'bg-[#111D30] text-cyan-400 border border-cyan-500/40 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Code Security Analysis</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('combined')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition ${
              activeTab === 'combined'
                ? 'bg-[#111D30] text-cyan-400 border border-cyan-500/40 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Combined Analysis</span>
          </button>
        </div>

        {/* Feedback / Clipboard Toast */}
        {pasteNotice && (
          <div className="p-3 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-cyan-400" />
            <span>{pasteNotice}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Input Form */}
        <div className="bg-[#111D30] border border-[#1E2D48] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">
                Verification Title / Topic (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  entryMode === 'custom'
                    ? 'e.g. ChatGPT Output on Solar Energy or Custom Query'
                    : 'e.g. JWST Orbital Architecture & Specifications'
                }
                className="w-full px-3.5 py-2.5 bg-[#080D18] border border-[#1E2D48] focus:border-cyan-400 focus:outline-none rounded-lg text-sm text-white placeholder-slate-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">
                Source AI Model
              </label>
              <select
                value={sourceAI}
                onChange={(e) => setSourceAI(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-[#080D18] border border-[#1E2D48] focus:border-cyan-400 focus:outline-none rounded-lg text-sm text-white transition font-mono"
              >
                <option value="ChatGPT">ChatGPT (OpenAI)</option>
                <option value="Gemini">Gemini (Google)</option>
                <option value="Claude">Claude (Anthropic)</option>
                <option value="Other">Other LLM / Assistant</option>
              </select>
            </div>
          </div>

          {/* TAB 1: AI Text Area */}
          {(activeTab === 'text' || activeTab === 'combined') && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <label className="block text-xs font-semibold text-slate-200 font-mono">
                    {entryMode === 'custom'
                      ? 'Paste Your AI-Generated Answer Below:'
                      : 'AI-Generated Answer Text (Sample):'}
                  </label>
                  {entryMode === 'custom' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40">
                      Your Custom Content
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-500/40">
                      Sample Pre-filled
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-[11px] font-mono">
                  {/* One-click Paste from Clipboard button */}
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="px-2.5 py-1 rounded bg-[#080D18] hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 hover:text-white flex items-center space-x-1 transition shadow-sm"
                    title="Paste content from clipboard"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Paste Clipboard</span>
                  </button>

                  {/* Clear button */}
                  <button
                    type="button"
                    onClick={handleResetToBlank}
                    className="px-2.5 py-1 rounded bg-[#080D18] hover:bg-rose-950/40 border border-[#1E2D48] text-slate-400 hover:text-rose-400 flex items-center space-x-1 transition"
                    title="Clear text area"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>

                  <span className="text-slate-500 hidden sm:inline">|</span>
                  <span className="text-slate-400">{textInput.length} chars</span>
                </div>
              </div>

              <textarea
                ref={textareaRef}
                rows={8}
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  setEntryMode('custom');
                  setSelectedPresetId('');
                }}
                placeholder="Paste the answer you received from ChatGPT, Gemini, Claude, or any external AI assistant here (e.g., historical summaries, scientific explanations, or factual statements)..."
                className={`w-full p-4 bg-[#080D18] border rounded-xl text-sm text-white placeholder-slate-600 leading-relaxed font-sans resize-y transition ${
                  entryMode === 'custom' && textInput.length === 0
                    ? 'border-cyan-500/50 shadow-inner'
                    : 'border-[#1E2D48] focus:border-cyan-400'
                }`}
              />

              {entryMode === 'custom' && textInput.length === 0 && (
                <div className="mt-2 p-3 rounded-lg bg-[#080D18]/80 border border-[#1E2D48] text-xs text-slate-400 flex items-center justify-between">
                  <span>
                    Tip: Copy an answer from ChatGPT or Gemini, then click <strong>"Paste Clipboard"</strong> or press
                    Ctrl+V / Cmd+V.
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSwitchToSample()}
                    className="text-cyan-400 hover:underline font-mono text-[11px] whitespace-nowrap ml-3"
                  >
                    Need an example? Load Sample →
                  </button>
                </div>
              )}

              {currentPreset && currentPreset.type === 'text' && entryMode === 'sample' && (
                <div className="mt-2 p-2.5 rounded-lg bg-[#080D18] border border-[#1E2D48] text-xs flex items-start space-x-2 text-slate-300">
                  <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Expected Pipeline Findings: </span>
                    <span className="text-slate-400">{currentPreset.expectedOutcome}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Code Security Area */}
          {(activeTab === 'code' || activeTab === 'combined') && (
            <div className="space-y-4 pt-2 border-t border-[#1E2D48]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <label className="text-xs font-medium text-slate-300 font-mono">Target Language:</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="px-3 py-1.5 bg-[#080D18] border border-[#1E2D48] focus:border-cyan-400 focus:outline-none rounded-lg text-xs text-white font-mono"
                  >
                    <option value="python">Python (.py)</option>
                    <option value="javascript">JavaScript (.js)</option>
                    <option value="typescript">TypeScript (.ts)</option>
                    <option value="java">Java (.java)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="px-2.5 py-1 text-xs text-cyan-300 hover:text-white bg-[#080D18] border border-cyan-500/40 rounded flex items-center space-x-1"
                  >
                    <ClipboardPaste className="w-3 h-3 text-cyan-400" />
                    <span>Paste Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCodeInput('');
                      setSelectedPresetId('');
                      setEntryMode('custom');
                    }}
                    className="px-2.5 py-1 text-xs text-slate-400 hover:text-rose-400 font-mono flex items-center space-x-1"
                  >
                    <Eraser className="w-3 h-3" />
                    <span>Clear</span>
                  </button>

                  {/* Optional File Upload */}
                  <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#080D18] hover:bg-slate-800 border border-[#1E2D48] text-xs text-slate-300 transition">
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept=".py,.js,.ts,.java,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <label className="block text-xs font-semibold text-slate-200 font-mono">
                      {entryMode === 'custom'
                        ? 'Paste Your AI-Generated Code Snippet:'
                        : 'AI-Generated Code Snippet (Sample):'}
                    </label>
                    {entryMode === 'custom' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40">
                        Your Custom Code
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-500/40">
                        Sample Pre-filled
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {codeInput.split(/\r?\n/).length} lines
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={codeInput}
                  onChange={(e) => {
                    setCodeInput(e.target.value);
                    setEntryMode('custom');
                    setSelectedPresetId('');
                  }}
                  placeholder={`# Paste your AI-generated ${language} code here for static AST vulnerability scanning (e.g. from GitHub Copilot, ChatGPT, or Claude)...`}
                  className="w-full p-3.5 bg-[#080D18] border border-[#1E2D48] focus:border-cyan-400 focus:outline-none rounded-lg text-xs text-cyan-200 placeholder-slate-600 font-mono leading-relaxed resize-y"
                />

                {currentPreset && currentPreset.type === 'code' && entryMode === 'sample' && (
                  <div className="mt-2 p-2.5 rounded-lg bg-[#080D18] border border-[#1E2D48] text-xs flex items-start space-x-2 text-slate-300">
                    <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">Expected Vulnerability Findings: </span>
                      <span className="text-slate-400">{currentPreset.expectedOutcome}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Processing Methodology Banner */}
          <div className="p-4 rounded-xl bg-[#080D18]/80 border border-[#1E2D48] flex items-start space-x-3 text-xs text-slate-400 leading-relaxed">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300 block mb-0.5">Execution & Privacy Guarantee</span>
              Submitted content is analyzed strictly through external search grounding, academic Crossref DOI checks,
              and static AST pattern scanners. Code is never executed on server hardware.
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="button"
            onClick={handleStartVerification}
            className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 transition shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 glow-cyan"
          >
            <span>
              {entryMode === 'custom'
                ? 'Verify My Submitted AI Content'
                : 'Run Complete Verification Pipeline on Sample'}
            </span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>
    </div>
  );
}
