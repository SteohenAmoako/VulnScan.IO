
// k6 Load Testing Script for VulnScan.IO

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

// --- Configuration ---
// !!! IMPORTANT: Replace this with your PUBLICLY DEPLOYED app URL !!!
const BASE_URL = 'https://your-deployed-app-url.web.app'; 

// A URL that is safe to scan repeatedly for the test.
const URL_TO_SCAN = 'https://example.com';

// Define a custom metric to track the response time of a full scan.
const scanResponseTime = new Trend('scan_response_time');

export const options = {
  stages: [
    // Ramp-up: Slowly increase from 1 to 5 concurrent users over 30 seconds.
    { duration: '30s', target: 5 },  
    // Steady State: Maintain 5 concurrent users for 1 minute.
    { duration: '1m', target: 5 },   
    // Ramp-down: Decrease back to 0 users over 15 seconds.
    { duration: '15s', target: 0 }, 
  ],
  thresholds: {
    // We can set performance goals here. 
    // e.g., 95% of requests must complete below 20 seconds.
    'scan_response_time': ['p(95)<20000'], 
  },
};

export default function () {
  // 1. Simulate a user visiting the home page (optional but good practice).
  const homeRes = http.get(BASE_URL);
  check(homeRes, { 'home page accessible': (r) => r.status === 200 });

  sleep(1); // User pauses for 1 second.

  // 2. Simulate the user submitting the URL for a scan.
  // This is the main transaction we want to measure.
  const scanUrl = `${BASE_URL}/scan?url=${encodeURIComponent(URL_TO_SCAN)}`;
  const scanRes = http.get(scanUrl);

  // 3. Check the result and record the response time.
  check(scanRes, {
    'scan request successful': (r) => r.status === 200,
  });

  // Record the time it took for the scan page to load into our custom metric.
  scanResponseTime.add(scanRes.timings.duration);

  // Wait for a few seconds before the next simulated user starts.
  sleep(3);
}
