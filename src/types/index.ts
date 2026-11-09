/**
 * TRUSTX AI - Universal AI Trust Verification System
 * Core Data Models & Type Definitions
 */

export type SourceAI = 'ChatGPT' | 'Gemini' | 'Claude' | 'Other';

export type VerificationInputType = 'text' | 'code' | 'combined';

export type ClaimStatus = 'SUPPORTED' | 'REFUTED' | 'INSUFFICIENT_EVIDENCE' | 'UNVERIFIED';

export type CitationStatus = 'VERIFIED' | 'METADATA_MISMATCH' | 'NOT_FOUND' | 'UNVERIFIED';

export type SecuritySeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export type AssessmentLabel =
  | 'Evidence-aligned'
  | 'Mixed evidence'
  | 'Needs review'
  | 'High-risk findings detected'
  | 'Insufficient verification data';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt?: string;
  theme?: 'dark' | 'light';
}

export interface ExtractedClaim {
  claimId: string;
  originalText: string;
  normalisedClaim: string;
  claimType: 'historical' | 'scientific' | 'technical' | 'statistical' | 'biographical' | 'general' | 'research';
  verifiable: boolean;
  verificationStatus?: ClaimStatus;
  confidence?: number;
  explanation?: string;
  evidenceSources?: EvidenceSource[];
}

export interface EvidenceSource {
  evidenceId: string;
  claimId: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceSnippet: string;
  relevance: string;
  retrievalTimestamp?: string;
}

export interface ContradictionFinding {
  contradictionId: string;
  claimIds: string[];
  claimTexts: string[];
  explanation: string;
  severity: 'high' | 'medium' | 'low';
}

export interface HallucinationWarning {
  warningId: string;
  claimId?: string;
  statement: string;
  category: 'unsupported' | 'potential_fabrication' | 'suspicious_statistic' | 'temporal_conflict';
  explanation: string;
  severity: 'high' | 'medium' | 'low';
}

export interface CitationVerification {
  citationId: string;
  submittedCitation: string;
  status: CitationStatus;
  retrievedTitle?: string;
  retrievedAuthors?: string;
  retrievedYear?: string;
  retrievedDoi?: string;
  retrievedUrl?: string;
  mismatchDetails?: string;
  databaseSource: 'Crossref' | 'OpenAlex' | 'Multiple' | 'None';
}

export interface CodeSecurityFinding {
  findingId: string;
  ruleId: string;
  name: string;
  severity: SecuritySeverity;
  lineNumber: number;
  snippet: string;
  explanation: string;
  remediation: string;
}

export interface MultiDimensionalAssessment {
  overallLabel: AssessmentLabel;
  summaryExplanation: string;
  factualityScore: number | null; // supported / (supported + refuted), null if no evaluated claims
  factualityDisplay: string;
  evidenceCoverageScore: number | null; // (supported + refuted) / total verifiable
  evidenceCoverageDisplay: string;
  contradictionScore: number; // 0 (none) to 1 (many)
  contradictionDisplay: string;
  citationReliabilityScore: number | null;
  citationReliabilityDisplay: string;
  codeSecurityScore: number | null;
  codeSecurityDisplay: string;
  totalVerifiableClaims: number;
  supportedClaimsCount: number;
  refutedClaimsCount: number;
  insufficientClaimsCount: number;
  contradictionsCount: number;
  hallucinationsCount: number;
  verifiedCitationsCount: number;
  mismatchedCitationsCount: number;
  notFoundCitationsCount: number;
  criticalSecurityCount: number;
  highSecurityCount: number;
  mediumSecurityCount: number;
  lowSecurityCount: number;
}

export interface VerificationRecord {
  verificationId: string;
  userId: string;
  title: string;
  inputType: VerificationInputType;
  sourceAI: SourceAI;
  submittedText?: string;
  submittedCode?: string;
  language?: string;
  createdAt: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  isDemo?: boolean;
  assessment: MultiDimensionalAssessment;
  claims: ExtractedClaim[];
  evidence: EvidenceSource[];
  contradictions: ContradictionFinding[];
  hallucinations: HallucinationWarning[];
  citations: CitationVerification[];
  securityFindings: CodeSecurityFinding[];
}

export interface ProcessingStage {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
}
