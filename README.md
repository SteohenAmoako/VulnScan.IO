# Website Vulnerability Scanner and Reporting Tool

## Description
This project, VulnScan.IO, is an advanced web application designed to provide a multi-layered security assessment of websites for educational purposes. It moves beyond traditional scanners by integrating several analysis techniques into a single, user-friendly interface. The system combines local, heuristic-based checks with powerful third-party APIs and leverages Generative AI to deliver comprehensive, human-readable security reports.

The core of the application lies in its three-pronged analysis approach:
1.  **Client-Side Heuristics:** It performs an initial scan of URL parameters against a comprehensive library of known malicious patterns, identifying potential vectors for common attacks like XSS, SQL Injection, and Path Traversal right in the browser.
2.  **External API Integration:** The tool enriches its analysis by querying external services. It integrates with the VirusTotal API for malware scanning, API Ninjas for domain metadata, Mozilla Observatory for HTTP header analysis, SSL Labs for TLS configuration, and the National Vulnerability Database (NVD) for known software vulnerabilities.
3.  **AI-Powered Reporting:** A key innovation is the use of a Genkit-powered AI flow to process and interpret the raw data from all sources. The AI generates a holistic summary that explains the overall security posture in plain language, making complex findings accessible to non-technical users.

The results are presented in a clean, intuitive dashboard featuring a visual severity chart, detailed breakdown cards for each analysis type, and links to educational resources, empowering users to understand and address potential security weaknesses.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Node.js (version 18 or later recommended)
* npm or yarn
* A Google Cloud project with Genkit enabled and configured for AI models.

## APIs
- **Google AI:** https://aistudio.google.com/app/apikey
- **VirusTotal:** https://www.virustotal.com/gui/my-apikey
- **API Ninjas:** https://api-ninjas.com/api/domainlookup
- **NVD API:** https://nvd.nist.gov/developers/request-an-api-key


### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
   Create a `.env` file in the root of the project and add your API keys:
   ```
   VIRUSTOTAL_API_KEY=your_virustotal_api_key
   API_NINJAS_KEY=your_api_ninjas_key
   GEMINI_API_KEY=your_gemini_api_key
   NVD_API_KEY=your_nvd_api_key
   ```

4. Run the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:9001`.
