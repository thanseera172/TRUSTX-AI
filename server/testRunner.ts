import { analyzeCodeSecurity } from './services/codeSecurityService.ts';
import { computeAssessment } from './services/assessmentEngine.ts';
import { extractCitationCandidates } from './services/citationService.ts';

/**
 * Automated Verification Engine Tests for TRUSTX AI
 */
function runTests() {
  console.log('--- Running TRUSTX AI Automated Logic Tests ---');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
    }
  }

  // 1. Code Security Scanner Tests
  const vulnerablePython = `
AWS_SECRET_KEY = "AKIAIOSFODNN7EXAMPLE/wJalrXUtnFEMI/K7MDENG/bPxRfiCY"
def query_user(u_id):
    query = "SELECT * FROM users WHERE id = '" + u_id + "'"
    os.system("echo " + u_id)
`;
  const findings = analyzeCodeSecurity(vulnerablePython, 'python', 'test.py');
  assert(findings.length >= 3, 'Code Security: Detects hardcoded AWS key, SQL injection, and os.system');
  assert(findings.some((f) => f.ruleId === 'SEC-CRED-001'), 'Code Security: Flags SEC-CRED-001');
  assert(findings.some((f) => f.ruleId === 'SEC-SQLI-001'), 'Code Security: Flags SEC-SQLI-001');
  assert(findings.some((f) => f.ruleId === 'SEC-CMD-001'), 'Code Security: Flags SEC-CMD-001');

  // 2. Safe Python Code should have 0 findings
  const safePython = `
import os
import json
api_key = os.environ.get("API_KEY")
user_id = "123"
data = json.loads('{"name": "Alice"}')
`;
  const safeFindings = analyzeCodeSecurity(safePython, 'python', 'safe.py');
  assert(safeFindings.length === 0, 'Code Security: Zero false-positives for os.environ and json.loads');

  // 3. Multi-Dimensional Assessment Engine Tests
  const mockAssessment = computeAssessment({
    claims: [
      { claimId: 'C1', originalText: '', normalisedClaim: '', claimType: 'general', verifiable: true, verificationStatus: 'SUPPORTED' },
      { claimId: 'C2', originalText: '', normalisedClaim: '', claimType: 'general', verifiable: true, verificationStatus: 'SUPPORTED' },
      { claimId: 'C3', originalText: '', normalisedClaim: '', claimType: 'general', verifiable: true, verificationStatus: 'REFUTED' },
    ],
    contradictions: [],
    hallucinations: [],
    citations: [],
    securityFindings: [],
  });

  assert(mockAssessment.factualityScore === 2 / 3, 'Assessment: Factuality score is 2/3 (67%)');
  assert(mockAssessment.evidenceCoverageScore === 1.0, 'Assessment: Evidence coverage is 100%');
  assert(mockAssessment.overallLabel === 'Mixed evidence', 'Assessment: Classifies 67% factuality as Mixed evidence');

  // 4. Citation Candidates Extraction Test
  const citationText = `
According to recent research on quantum entanglement:
Vaswani, A., et al. "Attention Is All You Need." NeurIPS 2017. DOI: 10.48550/arXiv.1706.03762
`;
  const candidates = extractCitationCandidates(citationText);
  assert(candidates.length >= 1, 'Citation: Extracted citation candidates with DOI 10.48550/arXiv.1706.03762');

  console.log(`\n--- Test Results: ${passed}/${total} passed ---`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
