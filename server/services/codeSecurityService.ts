import { CodeSecurityFinding, SecuritySeverity } from '../../src/types/index.ts';

interface SecurityRule {
  ruleId: string;
  name: string;
  severity: SecuritySeverity;
  languages: ('python' | 'javascript' | 'typescript' | 'java')[];
  description: string;
  pattern: RegExp;
  antiPattern?: RegExp; // If matches, ignore (false positive prevention)
  explanation: string;
  remediation: string;
}

const SECURITY_RULES: SecurityRule[] = [
  // 1. Hardcoded Credentials / Secrets
  {
    ruleId: 'SEC-CRED-001',
    name: 'Hardcoded API Key or Secret Token',
    severity: 'Critical',
    languages: ['python', 'javascript', 'typescript', 'java'],
    description: 'Detection of plaintext API keys, secret tokens, or private credentials committed directly into source code.',
    pattern: /(?:api_?key|secret(?:_?key)?|password|auth_?token|jwt_?secret|aws_?(?:secret|access_?key))\s*[:=]\s*['"][A-Za-z0-9_\-+/=]{16,}['"]/i,
    antiPattern: /(?:process\.env|os\.environ|System\.getenv|placeholder|your_api_key|<API_KEY>)/i,
    explanation: 'Embedding cryptographic secrets or API credentials in source code exposes production infrastructure to credential harvesting and repository exfiltration.',
    remediation: 'Extract credentials to external environment variables or cloud secret managers (e.g. AWS Secrets Manager, Google Secret Manager, HashiCorp Vault). Never commit secrets to code.',
  },
  {
    ruleId: 'SEC-CRED-002',
    name: 'Hardcoded Database Password',
    severity: 'Critical',
    languages: ['python', 'javascript', 'typescript', 'java'],
    description: 'Database connection strings or passwords embedded as raw string literals.',
    pattern: /(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql):\/\/[^:\s]+:[^@\s]+@/i,
    explanation: 'Database connection strings containing plaintext passwords can be extracted by anyone with read access to the codebase or decompiled binaries.',
    remediation: 'Construct connection strings dynamically from environment variables (e.g., `process.env.DATABASE_URL` or parameter stores).',
  },

  // 2. SQL Injection
  {
    ruleId: 'SEC-SQLI-001',
    name: 'Potential SQL Injection via String Concatenation',
    severity: 'Critical',
    languages: ['python', 'javascript', 'typescript', 'java'],
    description: 'Dynamic assembly of SQL statements using direct string concatenation or template interpolation.',
    pattern: /(?:(?:execute|query|cursor\.execute|createQuery)\s*\(\s*)?(?:['"`].*?(?:SELECT|INSERT|UPDATE|DELETE|DROP).*?['"`]\s*\+|f['"].*?(?:SELECT|INSERT|UPDATE|DELETE|DROP).*?\{|`.*?(?:SELECT|INSERT|UPDATE|DELETE|DROP).*?\$\{)/i,
    explanation: 'Constructing SQL queries using runtime string formatting permits adversaries to inject malicious SQL syntax, bypassing authentication or dumping database contents.',
    remediation: 'Use parameterized queries, prepared statements with bind variables, or an Object-Relational Mapper (ORM) with automated escaping.',
  },

  // 3. Unsafe Dynamic Execution
  {
    ruleId: 'SEC-EXEC-001',
    name: 'Unsafe Dynamic Code Evaluation (eval / exec)',
    severity: 'Critical',
    languages: ['python', 'javascript', 'typescript'],
    description: 'Direct invocation of dynamic execution primitives capable of compiling arbitrary string statements at runtime.',
    pattern: /\b(?:eval|exec|Function)\s*\([^)]+\)/,
    antiPattern: /eval\(\s*['"](?:use strict|{}|[0-9]+)['"]\s*\)/,
    explanation: 'Evaluating runtime strings with eval() or Function() allows untrusted input to execute arbitrary native statements in the application host process.',
    remediation: 'Refactor code to use explicit parser logic (such as JSON.parse for structured data) or safe domain-specific interpreters. Eliminate dynamic execution.',
  },

  // 4. Dangerous OS Command Execution
  {
    ruleId: 'SEC-CMD-001',
    name: 'Dangerous OS Command Injection Vector',
    severity: 'High',
    languages: ['python', 'javascript', 'typescript', 'java'],
    description: 'Invoking host system shells with dynamic variables or shell=True parameters.',
    pattern: /(?:os\.system|subprocess\.(?:call|Popen|run)\(.*shell\s*=\s*True|child_process\.exec\s*\(|Runtime\.getRuntime\(\)\.exec\s*\()/i,
    explanation: 'Executing system shell commands with concatenated arguments allows malicious users to supply shell metacharacters (; | &) and execute arbitrary operating system utilities.',
    remediation: 'Use argument arrays with `subprocess.run(["command", arg1], shell=False)` in Python or `execFile / spawn` in Node.js, and strictly validate inputs against an allowlist.',
  },

  // 5. Insecure Deserialization
  {
    ruleId: 'SEC-DESER-001',
    name: 'Insecure Object Deserialization',
    severity: 'High',
    languages: ['python', 'java'],
    description: 'Deserializing untrusted streams using unsafe object serializers like Python pickle or Java ObjectInputStream.',
    pattern: /(?:pickle\.loads?|yaml\.load\([^,)]+\)|ObjectInputStream\.readObject)/,
    antiPattern: /yaml\.safe_load|yaml\.load\(.*Loader\s*=\s*SafeLoader/i,
    explanation: 'Deserializing arbitrary byte streams from untrusted origins can trigger gadget chains leading to immediate remote code execution (RCE).',
    remediation: 'For Python, use `json.loads()` or `yaml.safe_load()`. For Java, enforce strict `ObjectInputFilter` schemas or migrate to protocol buffers/JSON.',
  },

  // 6. Weak Cryptographic Usage
  {
    ruleId: 'SEC-CRYPTO-001',
    name: 'Broken or Weak Hash Algorithm (MD5 / SHA1)',
    severity: 'Medium',
    languages: ['python', 'javascript', 'typescript', 'java'],
    description: 'Utilization of collision-vulnerable hash algorithms (MD5 or SHA-1) for sensitive security operations.',
    pattern: /(?:crypto\.createHash\(['"](?:md5|sha1)['"]\)|hashlib\.(?:md5|sha1)\(|MessageDigest\.getInstance\(['"](?:MD5|SHA-1)['"]\))/i,
    explanation: 'MD5 and SHA-1 suffer from proven cryptographic collision vulnerabilities and practical collision generation attacks. They are completely unsuitable for password hashing or integrity verification.',
    remediation: 'For password hashing, use dedicated memory-hard functions (Argon2id, bcrypt, scrypt). For general data hashing, use SHA-256 or SHA-3.',
  },
  {
    ruleId: 'SEC-CRYPTO-002',
    name: 'Insecure Pseudo-Random Number Generation for Security',
    severity: 'Medium',
    languages: ['javascript', 'typescript', 'python', 'java'],
    description: 'Use of non-cryptographic PRNG (Math.random or random.random) for generating security tokens, session IDs, or nonces.',
    pattern: /(?:Math\.random\(\)|random\.(?:random|randint|choice)\(|new\s+Random\(\))/i,
    antiPattern: /(?:crypto\.getRandomValues|secrets\.|SecureRandom)/i,
    explanation: 'Standard pseudo-random number generators are deterministic and predictable. If used for tokens or password resets, an attacker can anticipate future outputs.',
    remediation: 'Use cryptographically secure pseudorandom number generators (CSPRNG): `crypto.randomBytes()` in Node.js, `secrets` module in Python, or `SecureRandom` in Java.',
  },

  // 7. Path Traversal
  {
    ruleId: 'SEC-PATH-001',
    name: 'Path Traversal / Arbitrary File Access Pattern',
    severity: 'High',
    languages: ['python', 'javascript', 'typescript', 'java'],
    description: 'File system reads using unfiltered user parameters concatenated directly into file paths.',
    pattern: /(?:fs\.readFile(?:Sync)?|open|FileInputStream)\s*\(\s*(?:path\.join\([^)]*req\.|['"`].*?\/.*?['"`]\s*\+\s*(?:req|filename|param))/i,
    explanation: 'Constructing file paths directly from client request variables permits directory traversal sequences (../) to escape intended directory roots and read arbitrary server files.',
    remediation: 'Sanitize path inputs with `path.basename()`, verify canonical paths using `path.resolve()`, and verify the resulting path starts with the designated base directory.',
  },

  // 8. Cross-Site Scripting (XSS)
  {
    ruleId: 'SEC-XSS-001',
    name: 'Potential Cross-Site Scripting (Unsafe DOM Injection)',
    severity: 'High',
    languages: ['javascript', 'typescript'],
    description: 'Injecting unescaped dynamic content into the DOM via innerHTML or dangerouslySetInnerHTML.',
    pattern: /(?:\.innerHTML\s*=\s*|dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:)/i,
    explanation: 'Directly assigning dynamic HTML strings allows malicious payload tags (<script>, <img onerror>) to execute within victim browsers.',
    remediation: 'Use `textContent`, DOMPurify sanitization before injection, or standard React JSX expressions which perform automatic context-aware escaping.',
  },
];

/**
 * Normalizes language identifier
 */
export function normalizeLanguage(lang: string = 'python'): 'python' | 'javascript' | 'typescript' | 'java' {
  const l = lang.toLowerCase().trim();
  if (l.includes('py')) return 'python';
  if (l.includes('ts') || l.includes('typescript')) return 'typescript';
  if (l.includes('js') || l.includes('javascript') || l.includes('node')) return 'javascript';
  if (l.includes('java')) return 'java';
  return 'python';
}

/**
 * MODULE 5: Static Security Analysis Engine
 */
export function analyzeCodeSecurity(
  code: string,
  rawLanguage: string = 'python',
  filename: string = 'snippet'
): CodeSecurityFinding[] {
  if (!code || code.trim().length === 0) {
    return [];
  }

  const language = normalizeLanguage(rawLanguage);
  const lines = code.split(/\r?\n/);
  const findings: CodeSecurityFinding[] = [];
  let findingCount = 0;

  // Filter rules applicable to the specified language
  const applicableRules = SECURITY_RULES.filter((rule) => rule.languages.includes(language));

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const trimmed = line.trim();

    // Skip empty lines or pure comments
    if (trimmed.length === 0) continue;
    if (trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
      continue;
    }

    for (const rule of applicableRules) {
      if (rule.pattern.test(line)) {
        // Check if an anti-pattern (false-positive prevention) matches
        if (rule.antiPattern && rule.antiPattern.test(line)) {
          continue;
        }

        findingCount++;
        findings.push({
          findingId: `SEC-${String(findingCount).padStart(3, '0')}`,
          ruleId: rule.ruleId,
          name: rule.name,
          severity: rule.severity,
          lineNumber: lineIdx + 1,
          snippet: trimmed.slice(0, 140),
          explanation: rule.explanation,
          remediation: rule.remediation,
        });
      }
    }
  }

  return findings;
}
