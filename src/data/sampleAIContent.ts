/**
 * Default and Sample AI-Generated Content for TRUSTX AI
 * Pre-populated into the application so users can immediately test and understand
 * how the 6 verification modules work without needing to supply external text or code.
 */

export interface SampleAIItem {
  id: string;
  title: string;
  category: string;
  sourceAI: 'ChatGPT' | 'Gemini' | 'Claude';
  description: string;
  type: 'text' | 'code';
  language?: 'python' | 'javascript' | 'typescript' | 'java';
  content: string;
  expectedOutcome: string;
}

export const DEFAULT_AI_TEXT_ANSWER = `The James Webb Space Telescope (JWST) was launched on December 25, 2021, aboard an Ariane 5 rocket from Kourou, French Guiana. It operates at the Second Lagrange Point (L2), approximately 1.5 million kilometers (930,000 miles) from Earth. Its primary mirror consists of 18 hexagonal beryllium segments coated with ultra-thin gold, spanning 6.5 meters in diameter. JWST is designed primarily for infrared astronomy, enabling observations of the universe's first galaxies.`;

export const DEFAULT_AI_CODE_SNIPPET = `# AI-Generated User Management Service (Python)
import sqlite3
import os

DATABASE_URL = "sqlite:///production.db"
AWS_SECRET_KEY = "AKIAIOSFODNN7EXAMPLE/wJalrXUtnFEMI/K7MDENG/bPxRfiCY"

def get_user_profile(user_id):
    conn = sqlite3.connect("production.db")
    cursor = conn.cursor()
    # Query building for fast lookup
    query = "SELECT * FROM users WHERE id = '" + user_id + "'"
    cursor.execute(query)
    return cursor.fetchone()

def backup_user_data(backup_folder, user_id):
    # Execute system archiving utility
    cmd = f"tar -czf {backup_folder}/{user_id}.tar.gz /data/users/{user_id}"
    os.system(cmd)
    return True
`;

export const SAMPLE_AI_PRESETS: SampleAIItem[] = [
  {
    id: 'sample-jwst',
    title: 'Astronomical Deployment (Supported Facts)',
    category: 'Scientific / Space',
    sourceAI: 'ChatGPT',
    type: 'text',
    description: 'Realistic ChatGPT answer with high empirical accuracy and verifiable telemetry dates.',
    content: DEFAULT_AI_TEXT_ANSWER,
    expectedOutcome: 'High Factuality Alignment (~100%), all 4 claims supported by NASA/ESA records.',
  },
  {
    id: 'sample-quantum',
    title: 'Quantum Supremacy History (Subtle Hallucination)',
    category: 'Historical Science',
    sourceAI: 'Gemini',
    type: 'text',
    description: 'Gemini output containing an erroneous attribution claiming Richard Feynman coined "quantum supremacy".',
    content: `Quantum teleportation was first experimentally demonstrated using photons in 1997 by Anton Zeilinger's team in Vienna. The term "quantum supremacy" was coined by Richard Feynman in 1982 during his keynote address at MIT. Shor's algorithm for polynomial-time integer factorization was formulated in 1994 by Peter Shor.`,
    expectedOutcome: 'Refutes Feynman attribution (coined by John Preskill in 2012); flags potential hallucination.',
  },
  {
    id: 'sample-deepmind',
    title: 'AI Lab Timeline (Temporal Contradiction)',
    category: 'Business History',
    sourceAI: 'Claude',
    type: 'text',
    description: 'Claude output containing a direct internal timeline contradiction (founded in 2010 vs established in 2016).',
    content: `DeepMind Technologies was founded in London in September 2010 by Demis Hassabis, Shane Legg, and Mustafa Suleyman. The research lab rose to global prominence after being acquired by Google in 2014. Later in the overview, it is noted that Demis Hassabis and his co-founders established DeepMind in 2016 following their breakthrough with AlphaGo.`,
    expectedOutcome: 'Flags high-severity internal contradiction between Claim 1 (2010) and Claim 3 (2016).',
  },
  {
    id: 'sample-citation',
    title: 'Transformer Architecture Paper (DOI Mismatch)',
    category: 'Academic Research',
    sourceAI: 'ChatGPT',
    type: 'text',
    description: 'AI-generated literature review citing "Attention Is All You Need" with fabricated 2021 IEEE DOI.',
    content: `Recent developments in self-supervised representation learning demonstrate significant efficiency gains:
Vaswani, A., et al. "Attention Is All You Need." IEEE Transactions on Neural Networks, vol. 28, no. 4, 2021, pp. 1102-1115. DOI: 10.1109/TNNLS.2021.3098765.`,
    expectedOutcome: 'Crossref audit flags Metadata Mismatch: Paper was NeurIPS 2017, not IEEE 2021.',
  },
  {
    id: 'sample-code-python',
    title: 'Python Auth Service (Secrets & SQLi)',
    category: 'Backend Security',
    sourceAI: 'ChatGPT',
    type: 'code',
    language: 'python',
    description: 'AI-generated Python function with hardcoded AWS key, SQL concatenation, and unsanitized os.system().',
    content: DEFAULT_AI_CODE_SNIPPET,
    expectedOutcome: 'Flags 2 Critical findings (SEC-CRED-001, SEC-SQLI-001) and 1 High finding (SEC-CMD-001).',
  },
  {
    id: 'sample-code-js',
    title: 'Node.js Express Handler (Dynamic Eval & MD5)',
    category: 'JavaScript Security',
    sourceAI: 'Claude',
    type: 'code',
    language: 'javascript',
    description: 'AI-generated Express handler using eval() for expression parsing and broken MD5 password hashing.',
    content: `// AI-Generated Expression Evaluation & Session Auth
const express = require('express');
const crypto = require('crypto');
const app = express();

const JWT_SECRET_TOKEN = "super_secret_jwt_key_998877665544";

app.post('/api/calculate', (req, res) => {
  const formula = req.body.formula;
  // Unsafe dynamic evaluation of user formula
  const result = eval(formula);
  res.json({ result });
});

app.post('/api/login', (req, res) => {
  const { password } = req.body;
  // Broken collision-prone hash function
  const hash = crypto.createHash('md5').update(password).digest('hex');
  res.json({ hash });
});
`,
    expectedOutcome: 'Flags SEC-CRED-001 (JWT secret), SEC-EXEC-001 (eval), and SEC-CRYPTO-001 (MD5 hash).',
  },
];
