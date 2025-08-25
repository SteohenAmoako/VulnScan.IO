// We are temporarily using require for this simple Node.js script.
const { z } = require('zod');

// This is the exact validation schema from your scan-form.tsx component.
const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL including http:// or https://" }),
});

console.log("--- Running Unit Tests for URL Validation ---");
console.log("\n");

// --- Test Cases ---
const testCases = [
  { description: "Test with a valid HTTPS URL", input: "https://google.com" },
  { description: "Test with a valid HTTP URL", input: "https://gemini.google.com/" },
  { description: "Test with a malformed URL (missing TLD)", input: "https://invalid" },
  { description: "Test with a non-URL string", input: "not a url" },
  { description: "Test with an empty string", input: "" },
  { description: "Test with a URL missing the protocol", input: "www.github.com" },
];

let passed = 0;
let failed = 0;

// --- Run Tests and Print Results ---
testCases.forEach(test => {
  console.log(`🧪 Running: ${test.description}`);
  console.log(`   Input: "${test.input}"`);
  const result = formSchema.safeParse({ url: test.input });

  if (result.success) {
    console.log("   ✅ Result: PASSED");
    passed++;
  } else {
    console.log(`   ❌ Result: FAILED`);
    console.log(`   Reason: ${result.error.errors[0].message}`);
    failed++;
  }
  console.log("-".repeat(40));
});

console.log("\n--- Test Summary ---");
console.log(`Total Tests: ${testCases.length}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);