import {
  ExtractedClaim,
  ContradictionFinding,
  HallucinationWarning,
  CitationVerification,
  CodeSecurityFinding,
  MultiDimensionalAssessment,
  AssessmentLabel,
} from '../../src/types/index.ts';

export function computeAssessment(params: {
  claims: ExtractedClaim[];
  contradictions: ContradictionFinding[];
  hallucinations: HallucinationWarning[];
  citations: CitationVerification[];
  securityFindings: CodeSecurityFinding[];
}): MultiDimensionalAssessment {
  const { claims, contradictions, hallucinations, citations, securityFindings } = params;

  const verifiableClaims = claims.filter((c) => c.verifiable);
  const totalVerifiableClaims = verifiableClaims.length;

  let supportedClaimsCount = 0;
  let refutedClaimsCount = 0;
  let insufficientClaimsCount = 0;

  for (const c of verifiableClaims) {
    if (c.verificationStatus === 'SUPPORTED') {
      supportedClaimsCount++;
    } else if (c.verificationStatus === 'REFUTED') {
      refutedClaimsCount++;
    } else {
      insufficientClaimsCount++;
    }
  }

  // 1. Factuality: Supported / (Supported + Refuted)
  const evaluatedClaimsCount = supportedClaimsCount + refutedClaimsCount;
  let factualityScore: number | null = null;
  let factualityDisplay = 'Not enough data';

  if (evaluatedClaimsCount > 0) {
    factualityScore = supportedClaimsCount / evaluatedClaimsCount;
    factualityDisplay = `${Math.round(factualityScore * 100)}% (${supportedClaimsCount}/${evaluatedClaimsCount} verified claims)`;
  }

  // 2. Evidence Coverage: (Supported + Refuted) / Total Verifiable
  let evidenceCoverageScore: number | null = null;
  let evidenceCoverageDisplay = 'Not enough data';

  if (totalVerifiableClaims > 0) {
    evidenceCoverageScore = evaluatedClaimsCount / totalVerifiableClaims;
    evidenceCoverageDisplay = `${Math.round(evidenceCoverageScore * 100)}% (${evaluatedClaimsCount}/${totalVerifiableClaims} verifiable claims)`;
  }

  // 3. Contradictions
  const contradictionsCount = contradictions.length;
  const contradictionScore = contradictionsCount > 0 ? Math.min(1, contradictionsCount * 0.35) : 0;
  const contradictionDisplay =
    contradictionsCount === 0
      ? '0 detected (Internally consistent)'
      : `${contradictionsCount} contradictory assertion pair${contradictionsCount > 1 ? 's' : ''}`;

  // 4. Citation Reliability
  let verifiedCitationsCount = 0;
  let mismatchedCitationsCount = 0;
  let notFoundCitationsCount = 0;

  for (const cit of citations) {
    if (cit.status === 'VERIFIED') verifiedCitationsCount++;
    else if (cit.status === 'METADATA_MISMATCH') mismatchedCitationsCount++;
    else notFoundCitationsCount++;
  }

  let citationReliabilityScore: number | null = null;
  let citationReliabilityDisplay = 'Not applicable';

  if (citations.length > 0) {
    citationReliabilityScore = verifiedCitationsCount / citations.length;
    citationReliabilityDisplay = `${Math.round(citationReliabilityScore * 100)}% (${verifiedCitationsCount}/${citations.length} citations verified)`;
  }

  // 5. Code Security
  let criticalSecurityCount = 0;
  let highSecurityCount = 0;
  let mediumSecurityCount = 0;
  let lowSecurityCount = 0;

  for (const f of securityFindings) {
    if (f.severity === 'Critical') criticalSecurityCount++;
    else if (f.severity === 'High') highSecurityCount++;
    else if (f.severity === 'Medium') mediumSecurityCount++;
    else lowSecurityCount++;
  }

  let codeSecurityScore: number | null = null;
  let codeSecurityDisplay = 'Not applicable';

  if (securityFindings.length > 0) {
    // Penalty scale: Critical -40, High -20, Medium -10
    const rawScore = Math.max(0, 100 - (criticalSecurityCount * 40 + highSecurityCount * 20 + mediumSecurityCount * 10));
    codeSecurityScore = rawScore / 100;
    codeSecurityDisplay = `${securityFindings.length} finding${securityFindings.length > 1 ? 's' : ''} (${criticalSecurityCount} Critical, ${highSecurityCount} High)`;
  } else if (params.securityFindings !== undefined && (params as any).hasCode) {
    codeSecurityScore = 1.0;
    codeSecurityDisplay = '0 findings detected';
  }

  // Determine Overall Label deterministically
  let overallLabel: AssessmentLabel = 'Insufficient verification data';
  let summaryExplanation = '';

  if (criticalSecurityCount > 0 || highSecurityCount > 0) {
    overallLabel = 'High-risk findings detected';
    summaryExplanation = `Security analysis identified ${criticalSecurityCount} critical and ${highSecurityCount} high vulnerability patterns in the submitted code. Immediate manual remediation required prior to execution.`;
  } else if (refutedClaimsCount >= 2 || (factualityScore !== null && factualityScore < 0.5)) {
    overallLabel = 'Needs review';
    summaryExplanation = `External evidence refutes ${refutedClaimsCount} factual assertions made in the submitted content. Relying on this output without verification introduces significant misinformation risk.`;
  } else if (contradictionsCount > 0) {
    overallLabel = 'Needs review';
    summaryExplanation = `The submitted AI content contradicts itself across ${contradictionsCount} statements. Internal conflicting assertions undermine factual coherence.`;
  } else if (mismatchedCitationsCount > 0) {
    overallLabel = 'Needs review';
    summaryExplanation = `Citation audit discovered ${mismatchedCitationsCount} metadata mismatch discrepancies against Crossref/OpenAlex databases, suggesting AI reference hallucination.`;
  } else if (evidenceCoverageScore !== null && evidenceCoverageScore < 0.35 && totalVerifiableClaims > 2) {
    overallLabel = 'Insufficient verification data';
    summaryExplanation = `Only ${Math.round((evidenceCoverageScore || 0) * 100)}% of verifiable claims could be substantiated with authoritative external evidence sources. Further manual verification is advised.`;
  } else if (factualityScore !== null && factualityScore >= 0.8 && (evidenceCoverageScore ?? 0) >= 0.6) {
    overallLabel = 'Evidence-aligned';
    summaryExplanation = `The majority (${Math.round((factualityScore ?? 0) * 100)}%) of tested factual claims correlate with independent authoritative web sources and search grounding evidence.`;
  } else if (factualityScore !== null) {
    overallLabel = 'Mixed evidence';
    summaryExplanation = `Analysis produced mixed results (${Math.round((factualityScore ?? 0) * 100)}% factuality alignment). Some claims are corroborated while others remain inconclusive or partially contested.`;
  } else {
    overallLabel = 'Insufficient verification data';
    summaryExplanation = 'No verifiable factual assertions or empirical claims could be isolated from the submitted content.';
  }

  return {
    overallLabel,
    summaryExplanation,
    factualityScore,
    factualityDisplay,
    evidenceCoverageScore,
    evidenceCoverageDisplay,
    contradictionScore,
    contradictionDisplay,
    citationReliabilityScore,
    citationReliabilityDisplay,
    codeSecurityScore,
    codeSecurityDisplay,
    totalVerifiableClaims,
    supportedClaimsCount,
    refutedClaimsCount,
    insufficientClaimsCount,
    contradictionsCount,
    hallucinationsCount: hallucinations.length,
    verifiedCitationsCount,
    mismatchedCitationsCount,
    notFoundCitationsCount,
    criticalSecurityCount,
    highSecurityCount,
    mediumSecurityCount,
    lowSecurityCount,
  };
}
