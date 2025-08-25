// Simple Node.js script to demonstrate malicious pattern detection.

// This is the same list of malicious patterns used in the main application.
const MALICIOUS_PATTERNS = [
  // XSS (Cross-Site Scripting)
  { label: 'XSS: <script> Tag', regex: /<script\b[^>]*>(.*?)<\/script>/i },
  { label: 'XSS: JavaScript URI', regex: /javascript:[^"'\s]*/i },
  { label: 'XSS: Event Handlers (onerror, onload, etc.)', regex: /on(?:error|load|mouseover|focus|click|submit|blur)\s*=/i },
  // SQL Injection (SQLi)
  { label: 'SQLi: UNION SELECT', regex: /union\s+select/i },
  { label: 'SQLi: OR 1=1', regex: /(['"`])?\s*or\s+1\s*=\s*1/i },
  // Path Traversal
  { label: 'Path Traversal: ../', regex: /(\.\.\/)+/ },
];

/**
 * A simplified version of the analysis function from the main application.
 * It checks a URL's query parameters for known malicious patterns.
 * @param {string} inputUrl The URL to analyze.
 * @returns {{isMalicious: boolean, findings: {key: string, value: string, matches: string[]}[]}}
 */
function analyzeUrlForMaliciousPatterns(inputUrl) {
    try {
        const url = new URL(inputUrl);
        const searchParams = new URLSearchParams(url.search);
        const findings = [];

        for (const [key, value] of searchParams.entries()) {
            const matches = MALICIOUS_PATTERNS
                .filter(({ regex }) => regex.test(value) || regex.test(key))
                .map(({ label }) => label);

            if (matches.length > 0) {
              findings.push({ key, value, matches });
            }
        }
        return { isMalicious: findings.length > 0, findings };
    } catch (error) {
        return { isMalicious: false, findings: [] };
    }
}

console.log("--- Running System Test Simulation ---");
console.log("\n");

// --- Test Case ---
const maliciousTestUrl = "https://example.com/page?query=<script>alert('xss')</script>";

console.log(`🧪 Testing URL: "${maliciousTestUrl}"`);

const result = analyzeUrlForMaliciousPatterns(maliciousTestUrl);

if (result.isMalicious) {
    console.log("\n✅ PASSED: Malicious Pattern Detected!");
    console.log("   - Finding:", result.findings[0].matches[0]);
    console.log(`   - In Parameter: query="${result.findings[0].value}"`);
} else {
    console.log("\n❌ FAILED: No malicious pattern was detected.");
}

console.log("\n--- Test Complete ---");
