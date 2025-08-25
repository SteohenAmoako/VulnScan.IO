import fetch, { RequestInit } from 'node-fetch';

const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/api/v3';
const MAX_POLL_ATTEMPTS = 15; // Increased from 10
const POLL_INTERVAL = 5000; // Reduced to 5 seconds for faster response
const CACHE_TTL = 300000; // 5 minutes cache TTL

// Enhanced cache with TTL
interface CacheEntry {
    data: any;
    timestamp: number;
}

const cache = new Map<string, CacheEntry>();

// Clear expired cache entries
function clearExpiredCache() {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
        if (now - entry.timestamp > CACHE_TTL) {
            cache.delete(key);
        }
    }
}

async function fetchWithApiKey(endpoint: string, options: RequestInit = {}) {
    const apiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!apiKey) {
        console.error('VirusTotal API key not configured');
        return { 
            error: { 
                message: 'VirusTotal API key is not configured. Please set VIRUSTOTAL_API_KEY environment variable.',
                code: 'MISSING_API_KEY'
            } 
        };
    }

    const headers = {
        ...options.headers,
        'x-apikey': apiKey,
        'Accept': 'application/json',
        'User-Agent': 'SecurityScanner/1.0'
    };
    
    if (options.method === 'POST') {
        (headers as any)['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    const fullUrl = `${VIRUSTOTAL_API_URL}${endpoint}`;
    console.log(`Making request to VirusTotal: ${options.method || 'GET'} ${fullUrl}`);

    try {
        const response = await fetch(fullUrl, { 
            ...options, 
            headers,
            timeout: 30000 // 30 second timeout
        });
        
        console.log(`VirusTotal response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`VirusTotal API error: ${response.status} - ${errorText}`);
            
            // Handle specific status codes
            if (response.status === 429) {
                return { 
                    error: { 
                        message: 'Rate limit exceeded. Please wait before making more requests.',
                        code: 'RATE_LIMIT',
                        retryAfter: response.headers.get('retry-after') || '60'
                    }
                };
            }
            
            if (response.status === 401) {
                return { 
                    error: { 
                        message: 'Invalid API key. Please check your VirusTotal API key.',
                        code: 'INVALID_API_KEY'
                    }
                };
            }

            if (response.status === 403) {
                return { 
                    error: { 
                        message: 'Access forbidden. Your API key may not have sufficient permissions.',
                        code: 'FORBIDDEN'
                    }
                };
            }
            
            try {
                const errorJson = JSON.parse(errorText);
                return { 
                    error: { 
                        message: errorJson.error?.message || `VirusTotal API request failed with status ${response.status}`,
                        code: errorJson.error?.code || `HTTP_${response.status}`
                    }
                };
            } catch {
                return { 
                    error: { 
                        message: `VirusTotal API request failed with status ${response.status}: ${errorText}`,
                        code: `HTTP_${response.status}`
                    }
                };
            }
        }
        
        const text = await response.text();
        if (!text) {
            console.warn('Received empty response from VirusTotal');
            return { data: null };
        }

        try {
            const jsonData = JSON.parse(text);
            console.log(`Successfully parsed VirusTotal response`);
            return jsonData;
        } catch (parseError) {
            console.error('Failed to parse VirusTotal response as JSON:', parseError);
            return { 
                error: { 
                    message: 'Invalid JSON response from VirusTotal',
                    code: 'INVALID_JSON'
                }
            };
        }

    } catch (error: any) {
        console.error('Network error communicating with VirusTotal:', error);
        
        if (error.code === 'ENOTFOUND') {
            return { 
                error: { 
                    message: 'Could not resolve VirusTotal API hostname. Check internet connection.',
                    code: 'DNS_ERROR'
                }
            };
        }
        
        if (error.code === 'ETIMEDOUT' || error.name === 'TimeoutError') {
            return { 
                error: { 
                    message: 'Request to VirusTotal API timed out.',
                    code: 'TIMEOUT'
                }
            };
        }
        
        return { 
            error: { 
                message: `Failed to communicate with VirusTotal API: ${error.message}`,
                code: 'NETWORK_ERROR'
            }
        };
    }
}

// Validates URL format before submission
function validateUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
        return false;
    }
}

// Submits a URL for analysis with enhanced error handling
async function submitUrlForAnalysis(url: string): Promise<{analysisId?: string, error?: any}> {
    if (!validateUrl(url)) {
        return { 
            error: { 
                message: 'Invalid URL format. Please provide a valid HTTP or HTTPS URL.',
                code: 'INVALID_URL'
            }
        };
    }

    console.log(`Submitting URL for analysis: ${url}`);
    
    const response: any = await fetchWithApiKey('/urls', {
        method: 'POST',
        body: `url=${encodeURIComponent(url)}`,
    });
    
    if (response.error) {
        return { error: response.error };
    }

    const analysisId = response.data?.id;
    if (!analysisId) {
        console.error('No analysis ID in response:', response);
        return { 
            error: { 
                message: 'Analysis ID was not found in the VirusTotal response. The submission may have failed.',
                code: 'NO_ANALYSIS_ID'
            }
        };
    }
    
    console.log(`URL submitted successfully. Analysis ID: ${analysisId}`);
    return { analysisId };
}

// Retrieves the full analysis report for a given analysis ID
async function getUrlAnalysisReport(analysisId: string): Promise<any> {
    console.log(`Checking analysis status for ID: ${analysisId}`);
    return await fetchWithApiKey(`/analyses/${analysisId}`);
}

// Enhanced function to get URL analysis with better retry logic
export async function getUrlAnalysis(url: string) {
    clearExpiredCache(); // Clean up expired entries
    
    // Check cache first
    const cacheKey = url.toLowerCase().trim();
    if (cache.has(cacheKey)) {
        const entry = cache.get(cacheKey)!;
        if (Date.now() - entry.timestamp < CACHE_TTL) {
            console.log(`Returning cached result for URL: ${url}`);
            return entry.data;
        }
        cache.delete(cacheKey); // Remove expired entry
    }
    
    console.log(`Starting VirusTotal analysis for URL: ${url}`);
    
    const { analysisId, error: submitError } = await submitUrlForAnalysis(url);

    if (submitError) {
        console.error('Failed to submit URL for analysis:', submitError);
        return { error: submitError };
    }
    
    if (!analysisId) {
        return { 
            error: { 
                message: 'No analysis ID returned from VirusTotal.',
                code: 'NO_ANALYSIS_ID'
            }
        };
    }

    // Poll the analysis endpoint until the status is 'completed'
    let lastStatus = 'unknown';
    for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt++) {
        console.log(`Polling attempt ${attempt}/${MAX_POLL_ATTEMPTS} for analysis ${analysisId}`);
        
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));

        const report = await getUrlAnalysisReport(analysisId);

        if (report.error) {
            console.error(`Error fetching report on attempt ${attempt}:`, report.error);
            
            // For certain errors, don't continue polling
            if (['INVALID_API_KEY', 'FORBIDDEN', 'NO_ANALYSIS_ID'].includes(report.error.code)) {
                return report;
            }
            
            // For network errors, continue polling
            if (attempt === MAX_POLL_ATTEMPTS) {
                return report;
            }
            continue;
        }

        const status = report.data?.attributes?.status;
        lastStatus = status || 'unknown';
        
        console.log(`Analysis status: ${status}`);

        if (status === 'completed') {
            console.log(`Analysis completed successfully for URL: ${url}`);
            const result = {
                ...report,
                metadata: {
                    url,
                    analysisId,
                    completedAt: new Date().toISOString(),
                    attempts: attempt
                }
            };
            
            // Cache the successful result
            cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });
            
            return result;
        }
        
        // Continue polling if status is 'queued' or 'running'
        if (status === 'queued' || status === 'running') {
            continue;
        }
        
        // Handle unexpected status
        if (status && !['queued', 'running'].includes(status)) {
            console.warn(`Unexpected analysis status: ${status}`);
        }
    }

    // If the loop finishes without a completed report
    const timeoutError = {
        error: {
            message: `VirusTotal scan timed out after ${MAX_POLL_ATTEMPTS} attempts (${(MAX_POLL_ATTEMPTS * POLL_INTERVAL) / 1000} seconds). Last status: ${lastStatus}`,
            code: 'SCAN_TIMEOUT',
            lastStatus,
            analysisId
        }
    };
    
    console.error('Analysis timed out:', timeoutError);
    return timeoutError;
}

// Helper function to get a summary of the analysis results
export function getAnalysisSummary(analysisResult: any): {
    malicious: number;
    suspicious: number;
    clean: number;
    undetected: number;
    total: number;
    hasThreat: boolean;
} {
    const stats = analysisResult.data?.attributes?.stats;
    
    if (!stats) {
        return {
            malicious: 0,
            suspicious: 0,
            clean: 0,
            undetected: 0,
            total: 0,
            hasThreat: false
        };
    }
    
    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;
    const clean = stats.harmless || 0;
    const undetected = stats.undetected || 0;
    const total = malicious + suspicious + clean + undetected;
    
    return {
        malicious,
        suspicious,
        clean,
        undetected,
        total,
        hasThreat: malicious > 0 || suspicious > 0
    };
}