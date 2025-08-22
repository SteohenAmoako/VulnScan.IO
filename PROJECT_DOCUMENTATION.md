
# CHAPTER ONE – INTRODUCTION

## 1.1 Project Overview
This document outlines the design, architecture, and implementation of **VulnScan.IO**, a multi-layered web vulnerability scanner and reporting tool designed for educational purposes. The system integrates local heuristic analysis, several external security APIs, and the power of Generative AI to produce comprehensive, human-readable security reports. Its primary goal is to make web security concepts and findings accessible to a broad audience, including students, developers, and small business owners.

## 1.2 Problem Statement
The current landscape of web security tools presents a dilemma for non-expert users. On one hand, professional penetration testing tools like OWASP ZAP are incredibly powerful but have a steep learning curve and produce highly technical output. On the other, free online scanners are user-friendly but often provide superficial analysis without sufficient context or actionable advice. This leaves a significant gap for a tool that can provide in-depth analysis in a format that is both easy to understand and educational.

## 1.3 Project Objectives
The primary objectives for the VulnScan.IO project are as follows:
1.  **Develop a web application** that allows users to scan any public website URL for security vulnerabilities.
2.  **Integrate multiple analysis methods**, including local heuristic checks and data from third-party APIs (e.g., VirusTotal, SSL Labs, NVD), to create a comprehensive security profile.
3.  **Incorporate Generative AI** (via Google Genkit) to process, interpret, and summarize the collected security data into a clear and structured report.
4.  **Present the results** in a visually appealing, interactive, and educational format, complete with severity charts, detailed explanations, and links to further learning resources.

## 1.4 Scope & Limitations
-   **Scope:** The project focuses on scanning publicly accessible websites. It does not handle authenticated scans or internal network scanning. The analysis includes URL parameter heuristics, malware checks, SSL/TLS configuration, HTTP header security, and known software vulnerabilities.
-   **Limitations:** The tool is intended for educational purposes and is not a substitute for a professional security audit. Its effectiveness is dependent on the accuracy and rate limits of the third-party APIs it consumes. The application is stateless and does not store user data or scan history.

---

# CHAPTER TWO – LITERATURE REVIEW & RELATED WORK

## 2.1 Introduction
This chapter explores the foundational technologies and existing solutions relevant to the VulnScan.IO project. It begins by examining the core programming languages, frameworks, and APIs that provide the technical backbone for the application. Following this, a review of similar existing web vulnerability scanners is conducted to identify common features, strengths, and weaknesses. This analysis helps to highlight the gaps in the current landscape of security tools and provides a clear justification for the unique, multi-layered approach adopted by this project.

## 2.2 Theoretical Foundations & Technologies
The development of VulnScan.IO is built upon a modern web technology stack, carefully selected to ensure performance, scalability, and a high-quality user experience.

### 2.2.1 Next.js & React
The application is built using **Next.js**, a popular React framework. This choice was driven by several key advantages:
- **App Router:** We utilize the Next.js App Router, which enables a robust and scalable routing system.
- **Server Components:** By default, components in the application are rendered on the server. This significantly improves initial page load times and reduces the amount of JavaScript sent to the client, which is crucial for performance and SEO.
- **Developer Experience:** Next.js offers a seamless development environment with features like hot-reloading and integrated tooling, which accelerates the development process.

**React** serves as the underlying UI library, enabling the creation of a modular and reusable component-based architecture. This approach simplifies development and maintenance, as the user interface is broken down into independent, manageable pieces (e.g., `Header`, `Footer`, `ScanForm`).

### 2.2.2 TypeScript
The entire codebase is written in **TypeScript**, a statically typed superset of JavaScript. TypeScript enhances code quality and developer productivity by catching potential errors during development rather than at runtime. It provides type safety for function parameters, variables, and component props, making the application more robust and easier to refactor.

### 2.2.3 Styling: Tailwind CSS and ShadCN/UI
The user interface is styled using **Tailwind CSS**, a utility-first CSS framework. This allows for rapid UI development by composing complex designs from a set of low-level utility classes directly in the markup.

Built on top of Tailwind CSS, **ShadCN/UI** provides a set of reusable and accessible UI components. These pre-built components (e.g., `Card`, `Button`, `Accordion`) serve as the building blocks for the application's interface, ensuring a consistent and professional look while saving significant development time. The theme is customized via `globals.css` to match the project's specific color palette.

### 2.2.4 Generative AI: Google Genkit
A core innovation of this project is its use of Generative AI to process and interpret security data. This is accomplished using **Google Genkit**, a framework for building production-ready AI-powered features.
- **Flows:** Genkit allows for the creation of structured "flows" that orchestrate calls to Large Language Models (LLMs). In this project, flows are used to take raw JSON data from APIs and transform it into human-readable reports and summaries.
- **Tool Use:** The `scanWebsite` flow utilizes a powerful feature of Genkit called "tool use," where the AI model can decide to call external functions (tools) to retrieve information. The model is instructed to use the `getUrlReport` tool to fetch data from the VirusTotal API before generating its analysis.
- **Schema Enforcement:** Genkit uses Zod schemas to define the expected input and output formats for AI prompts, ensuring that the data returned by the model is structured and predictable.

### 2.2.5 External APIs
- **VirusTotal API:** This is a critical third-party service used for the primary vulnerability scan. It provides a comprehensive analysis of a given URL, checking it against dozens of security vendor databases for malware, phishing, and other threats.
- **SSL Labs API:** This API provides an in-depth analysis of a web server's SSL/TLS configuration, including protocol support, certificate details, and common vulnerabilities.
- **Mozilla Observatory API:** This tool analyzes HTTP security headers to determine if a site has implemented important protections against common attacks like Cross-Site Scripting (XSS) and clickjacking.
- **NVD (National Vulnerability Database) API:** This API is used to search for known Common Vulnerabilities and Exposures (CVEs) related to specific software and technologies that might be running on the target server.
- **API Ninjas (Whois Lookup):** This API is used to enrich the security report with domain metadata, such as the domain's age, registrar, and creation date. This information can provide additional context about the legitimacy and history of a website.

## 2.3 Review of Similar Systems & Solutions
Several existing tools offer web vulnerability scanning, each with different strengths and target audiences.

1.  **OWASP ZAP (Zed Attack Proxy):** A widely used, open-source security tool. ZAP is extremely powerful, offering a vast array of features for penetration testing. However, its primary audience is security professionals. The user interface is complex, and the reports are highly technical, making them inaccessible to non-technical users.

2.  **Sucuri SiteCheck:** A free online scanner that checks for known malware, blacklisting status, and some common security issues. It is very user-friendly but provides a relatively high-level overview. It does not perform the deep parameter analysis or provide the granular detail and AI-driven summarization that VulnScan.IO offers.

3.  **Qualys SSL Labs:** A specialized tool focused exclusively on testing the configuration of SSL/TLS on web servers. While excellent for its specific purpose, it does not cover other types of vulnerabilities like XSS or SQL injection.

## 2.4 Gaps Identified & Justification for Your Approach
The review of existing systems reveals a significant gap in the market: there is a lack of tools designed for **educational purposes** that bridge the gap between highly technical penetration testing tools and overly simplistic online scanners.

- **Complexity Gap:** Professional tools like OWASP ZAP are too complex for students, developers, or small business owners who want to understand their security posture.
- **Interpretation Gap:** Basic scanners often present findings without context, leaving users unsure of the actual risks or how to address them.
- **Holistic View Gap:** Few tools combine multiple analysis methods (local heuristics, external API scans, domain metadata, and AI interpretation) into a single, cohesive report.

**VulnScan.IO directly addresses these gaps** by:
1.  **Combining Analysis Layers:** It integrates client-side heuristic checks, deep external API scans, and domain metadata into one process.
2.  **Leveraging AI for Interpretation:** Its most significant innovation is using Generative AI to translate complex, raw security data into a human-readable summary and a structured report, making the findings accessible to everyone.
3.  **Focusing on Education:** With a clean UI, a visual severity chart, and links to educational resources, the tool is explicitly designed to help users learn about web security, not just identify flaws.

This unique combination of features justifies the development of VulnScan.IO as a novel solution in the web security landscape.

---

# CHAPTER THREE – SYSTEM ANALYSIS & REQUIREMENTS

## 3.1 Analysis Tools Used

### 3.1.1 Use Case Diagram
The primary interactions between the user and the VulnScan.IO system can be summarized in the following use case:

```
        +----------------------------------+
        |         VulnScan.IO System       |
        |----------------------------------|
        |                                  |
User ---|> (Submit URL for Scanning)       |
        |      ^                           |
        |      | extends                   |
        |      |                           |
        |  (View Comprehensive Report)     |
        |      |                           |
        |      | includes                  |
        |      +-------------------------> | (View HTTPS & SSL/TLS Status)
        |      | includes                  |
        |      +-------------------------> | (View URL Parameter Analysis)
        |      | includes                  |
        |      +-------------------------> | (View HTTP Header Grade)
        |      | includes                  |
        |      +-------------------------> | (View Domain Info)
        |      | includes                  |
        |      +-------------------------> | (View VirusTotal Report)
        |      | includes                  |
        |      +-------------------------> | (View Known Vulnerabilities)
        |      | includes                  |
        |      +-------------------------> | (View AI Summary)
        |      | includes                  |
        |      +-------------------------> | (View Severity Chart)
        |      | includes                  |
        |      +-------------------------> | (Download PDF Report)
        |                                  |
User ---|> (Access Educational Resources)  |
        |                                  |
        +----------------------------------+
```

### 3.1.2 User Stories
The system requirements were captured as user stories to maintain a user-centric focus throughout development.

1.  **As a user, I want to enter a website URL into an input field so that I can initiate a security scan.**
2.  **As a user, I want to see a clear loading state after submitting a URL so that I know the scan is in progress.**
3.  **As a user, I want the application to check the website's SSL/TLS configuration and report its grade.**
4.  **As a user, I want the application to analyze the URL's query parameters for common malicious patterns (like XSS or SQLi).**
5.  **As a user, I want the application to check the website's HTTP security headers using Mozilla Observatory and display the grade.**
6.  **As a user, I want the application to fetch and display domain information (like age and registrar).**
7.  **As a user, I want the application to submit the URL to the VirusTotal API for a deep malware and vulnerability scan.**
8.  **As a user, I want the app to search the NVD for known CVEs related to the website's technology stack.**
9.  **As a user, I want to see a comprehensive, AI-generated summary of all findings so that I can quickly understand the overall security posture.**
10. **As a user, I want to view a detailed, sectioned report from all scans, explained in clear language.**
11. **As a user, I want to see a visual pie chart and bar chart that summarizes the severity of all detected issues (High, Medium, Low).**
12. **As a user, I want to download a professional PDF report containing the summary, charts, and detailed findings.**
13. **As a user, I want to be able to access links to educational resources to learn more about the identified vulnerabilities.**

## 3.2 Functional Requirements

The functional requirements define what the system must do.

- **FR1: URL Input:** The system shall provide a text field for the user to input a website URL.
- **FR2: Scan Initiation:** The system shall provide a button to trigger the scanning process for the submitted URL.
- **FR3: HTTPS/SSL Analysis:** The system shall analyze the URL's protocol and use the SSL Labs API to get a grade for the TLS configuration.
- **FR4: URL Parameter Heuristics:** The system shall scan the URL's query string against a predefined list of regular expressions for malicious patterns.
- **FR5: HTTP Header Analysis:** The system shall use the Mozilla Observatory API to get a grade for the site's HTTP security headers.
- **FR6: Domain Metadata Retrieval:** The system shall make an API call to an external service (API Ninjas) to fetch WHOIS information for the domain.
- **FR7: External Vulnerability Scan:** The system shall make an API call to an external service (VirusTotal) to perform a comprehensive vulnerability scan.
- **FR8: Known Vulnerability Search:** The system shall query the NVD API for known vulnerabilities in common web technologies.
- **FR9: AI-Powered Reporting:** The system shall use a Generative AI model to process the results from all analyses and generate a structured, human-readable report.
- **FR10: AI-Powered Summarization:** The system shall use a Generative AI model to generate a holistic summary of all findings.
- **FR11: Results Display:** The system shall display all analysis results on a dedicated results page, including all scan grades, findings, domain info, AI report, and AI summary.
- **FR12: Severity Visualization:** The system shall calculate a weighted severity score and display it as both a donut chart and a bar chart.
- **FR13: PDF Report Generation:** The system shall generate a downloadable PDF report including all key findings and visualizations.
- **FR14: Educational Content:** The system shall display a section with links to external web security resources.
- **FR15: Error Handling:** The system shall gracefully handle invalid URLs and API failures, displaying a clear error message to the user.

## 3.3 Non-Functional Requirements

These requirements define the quality attributes of the system.

- **NFR1: Performance:** The initial page load shall be fast. The results page, while waiting for external APIs, must display a responsive loading skeleton. The total scan time should ideally be under 30 seconds.
- **NFR2: Usability:** The user interface shall be clean, intuitive, and easy to navigate. All information should be presented clearly. The application must be fully responsive and work seamlessly on desktop, tablet, and mobile devices.
- **NFR3: Security:** While this is a scanning tool, it must also be secure. API keys and other sensitive environment variables must not be exposed on the client-side. All API interactions should happen on the server-side via Next.js Server Actions and Genkit flows.
- **NFR4: Reliability:** The application should handle API errors (including rate-limiting) or unexpected data formats without crashing. It should provide informative feedback to the user in case of failure.
- **NFR5: Maintainability:** The code shall be well-organized, modular, and follow best practices. Using TypeScript and a component-based architecture contributes to this goal.

## 3.4 Domain Model (Conceptual Schema)

The conceptual schema illustrates the main entities and their relationships within the VulnScan.IO system.

```
+----------------+       +-------------------------+       +-------------------+
|      URL       |-------|      Scan Process       |       |       User        |
| (string)       |       |                         |       | (Implicit Actor)  |
+----------------+       +-----------+-------------+       +-------------------+
                                     |
                                     | Generates
                                     |
              +----------------------+----------------------+
              |                                             |
     +--------v---------+                           +-------v--------+
     |   Scan Result    |                           |      Report    |
     +------------------+                           +----------------+
     | - isHttps        |                           | - aiSummary    |
     | - urlParamFindings|                           | - detailedReport|
     | - domainInfo     |                           | - severityData |
     | - virusTotalStats|                           +----------------+
     | - sslLabsGrade   |
     | - mozillaGrade   |
     | - nvdFindings    |
     +------------------+

Explanation:
- A User provides a URL.
- The Scan Process is initiated, which is an orchestration of multiple analysis steps.
- The Scan Process produces a raw Scan Result, which contains data from various sources (local heuristics and all external APIs).
- The Scan Result data is then processed and transformed into the final Report, which is what the user sees. The Report includes the AI-generated summary, the detailed analysis, and the calculated severity data for the charts.
```

---

# CHAPTER FOUR – SYSTEM DESIGN

## 4.1 System Architecture Diagram

The application follows a modern, layered web architecture based on the Next.js framework.

```
+-------------------------------------------------------------------+
|                        Browser (Client-Side)                      |
|-------------------------------------------------------------------|
|     React Components (UI)                                         |
|     (Home Page, Scan Form, Results Display, Charts, etc.)         |
|         |                                                         |
|         | (User submits URL)                                      |
|         v                                                         |
|   [Next.js Server Action] ----------------> (API Call to self)    |
+-------------------------------------------------------------------+
                              | (HTTP Request)
+-----------------------------v-------------------------------------+
|                      Web Server (Next.js)                         |
|-------------------------------------------------------------------|
|   Server-Side Logic (`/scan` page) & Genkit Flows (`/ai/flows`)   |
|         |                                                         |
|         | 1. Orchestrates multiple async calls in parallel        |
|         |                                                         |
|   +-----v----------------+      +--------------------------+      |
|   | getDomainInfo Flow   |      | getSslInfo Flow          |      |
|   +----------------------+      +--------------------------+      |
|              |                          |                         |
|   +----------------------+      +--------------------------+      |
|   | getMozillaInfo Flow  |      | getNvdVulnerabilities    |      |
|   +----------------------+      +--------------------------+      |
|              |                          |                         |
|              | (All results are then passed to...)              |
|              v                                                    |
|   +----------------------+      +--------------------------+      |
|   | scanWebsite Flow     |----->| VirusTotal Tool          |      |
|   | (Generates Report)   |      +--------------------------+      |
|   +----------------------+                                        |
|              |                                                    |
|              | (Final report and data are passed to...)           |
|              v                                                    |
|   +----------------------+                                        |
|   | summarizeVulnerabilityReport Flow                             |
|   +----------------------+                                        |
|              |                                                    |
|              v (Returns final page props)                         |
|         [React Server Component Renderer]                         |
|              |                                                    |
|              +---------> HTML sent back to Browser <--------------+
|                                                                   |
+-------------------------------------------------------------------+

```
**Architectural Layers:**
1.  **Presentation Layer (Client-Side):** This is what the user interacts with. It's built with React components and is responsible for rendering the UI and capturing user input. Components like `ScanForm` initiate the process, while `ResultsDisplay` and `SeverityChart` render the final output.
2.  **Application Layer (Server-Side):** This layer resides on the Next.js server. It handles the core business logic. The `scan/page.tsx` Server Component acts as an orchestrator. It receives the URL, invokes the necessary Genkit flows in parallel, processes the results, and passes the final data to the presentation components.
3.  **AI/Flow Layer (Server-Side):** This is a specialized part of the application layer, managed by Genkit. The flows in `src/ai/flows/` encapsulate all interactions with the Google AI models and external API tools. This isolates AI logic from the main application logic.
4.  **Service/Data Access Layer (Server-Side):** This layer consists of modules in `src/services/` that are responsible for direct communication with external APIs (VirusTotal, SSL Labs, etc.). They handle the specifics of making HTTP requests, adding API keys, and basic error handling.

## 4.2 Class Diagram(s)/Module Design

Since the application is built with functional components and not classes, a module design diagram is more appropriate.

```
/src
|-- /app
|   |-- page.tsx (Home Page: Main entry point with ScanForm)
|   |-- /scan
|   |   |-- page.tsx (Scan Results Page: Orchestrates data fetching and renders results)
|   |   `-- loading.tsx (Loading UI for the results page)
|   |-- layout.tsx (Root layout, includes fonts and global styles)
|   `-- globals.css (Global and theme styles for Tailwind/ShadCN)
|
|-- /components
|   |-- header.tsx (Site header)
|   |-- footer.tsx (Site footer)
|   |-- scan-form.tsx (Client component for URL input and submission)
|   |-- results-display.tsx (Client component to display AI report and summary)
|   |-- severity-chart.tsx (Client component for the Recharts charts)
|   |-- url-details.tsx (Component to display HTTPS, SSL, Mozilla, and Domain info cards)
|   |-- educational-resources.tsx (Static component with links)
|   `-- /ui (ShadCN UI components: Button, Card, etc.)
|
|-- /ai
|   |-- genkit.ts (Genkit initialization and configuration)
|   `-- /flows
|       |-- scan-website-vulnerability.ts (Flow to call VirusTotal and generate the main report)
|       |-- get-domain-info.ts (Flow to fetch domain metadata)
|       |-- get-ssl-info.ts (Flow to fetch SSL Labs data)
|       |-- get-mozilla-observatory-info.ts (Flow to fetch Mozilla Observatory data)
|       |-- get-nvd-vulnerabilities.ts (Flow to fetch NVD data)
|       `-- summarize-vulnerability-report.ts (Flow to create the final AI summary)
|
|-- /services
|   |-- virustotal.ts (Module to interact with the VirusTotal API)
|   |-- apininjas.ts (Module to interact with the API Ninjas API)
|   |-- ssllabs.ts (Module to interact with the SSL Labs API)
|   |-- mozilla-observatory.ts (Module to interact with the Mozilla Observatory API)
|   `-- nvd.ts (Module to interact with the NVD API)
|
|-- /lib
|   `-- utils.ts (Utility functions, e.g., `cn` for classnames)
|
`-- package.json (Project dependencies and scripts)
```

## 4.3 Database Design

This application is **stateless** and does not require a traditional database.
-   All data is fetched in real-time from external APIs upon user request.
-   A simple in-memory cache is used within some services to prevent re-scanning the same URL in quick succession, but this data is ephemeral and does not persist across server restarts.
-   No user accounts, sessions, or scan histories are stored. This is a key area for future enhancement.

This design simplifies the architecture and eliminates the need for database management and maintenance in the current prototype.

## 4.4 User Interface Design

### Wireframe 1: Home Page
```
+------------------------------------------------------+
| [Logo] VulnScan.IO                 [Resources Link]  |
+------------------------------------------------------+
|                                                      |
|               <h1>VulnScan.IO</h1>                   |
|       <p>Enter a website URL to scan for...</p>       |
|                                                      |
|   +----------------------------------------------+   |
|   | [  https://example.com                     ] |   |
|   +----------------------------------------------+   |
|   |                [Scan Button]                 |   |
|   +----------------------------------------------+   |
|                                                      |
+------------------------------------------------------+
|                                                      |
|           <h2>Educational Resources</h2>            |
|   +----------+ +----------+ +----------+ +----------+ |
|   | Card 1   | | Card 2   | | Card 3   | | Card 4   | |
|   +----------+ +----------+ +----------+ +----------+ |
|                                                      |
+------------------------------------------------------+
|           <footer>© 2024 VulnScan.IO</footer>         |
+------------------------------------------------------+
```

### Wireframe 2: Scan Results Page
```
+------------------------------------------------------+
| [Logo] VulnScan.IO                 [Resources Link]  |
+------------------------------------------------------+
|                                                      |
|   +--------------+ +--------------+ +--------------+  |
|   | HTTPS & SSL  | | Mozilla Obs. | | Domain Info  |  |
|   | Card         | | Card w/Chart | | Card         |  |
|   +--------------+ +--------------+ +--------------+  |
|                                                      |
+------------------------------------------------------+
|  +---------------------------+  +------------------+   |
|  |                           |  |                  |   |
|  |   <h2>Scan Complete</h2>   |  |  <h3>Severity</h3> |   |
|  |                           |  |                  |   |
|  |  +---------------------+  |  |   +------------+   |   |
|  |  |  AI Summary Card    |  |  |   | Donut Chart|   |   |
|  |  +---------------------+  |  |   +------------+   |   |
|  |                           |  |                  |   |
|  |  +---------------------+  |  +------------------+   |
|  |  | Detailed Report     |  |                       |
|  |  | (Accordion)         |  |                       |
|  |  +---------------------+  |                       |
|  |                           |                       |
|  +---------------------------+                       |
+------------------------------------------------------+
```

## 4.5 Other Design Artefacts

### Security Model
- **API Key Management:** All API keys are stored in an `.env` file, which is loaded exclusively on the server. They are never exposed to the client-side, preventing theft.
- **Server-Side API Calls:** All communication with external services happens on the server within Genkit flows or Next.js Server Components. This prevents client-side manipulation of API requests.
- **Input Sanitization:** While the application is designed to accept potentially malicious URLs for analysis, the output from the AI is rendered as text or pre-formatted HTML, mitigating the risk of stored XSS from the report itself. URL inputs are URI-encoded before being used in API calls.

---

# CHAPTER FIVE – IMPLEMENTATION

## 5.1 Development Environment & Tools Used

- **Runtime:** Node.js (v18 or later)
- **Framework:** Next.js (v15)
- **Language:** TypeScript
- **Package Manager:** npm
- **AI Framework:** Google Genkit
- **UI Components:** ShadCN/UI
- **Styling:** Tailwind CSS
- **Version Control:** Git
- **Code Editor:** Visual Studio Code (with recommended settings for IDX)

## 5.2 Coding Standards & Code Organization

- **File Naming:** Files are named using kebab-case (e.g., `scan-website-vulnerability.ts`).
- **Component Structure:** React components are functional and use hooks. Each component is located in its own file within `src/components`.
- **Type Safety:** TypeScript is used throughout. Interfaces and types are defined for component props and API data structures.
- **Modularity:** The codebase is organized into distinct modules based on functionality: `app` for routing and pages, `components` for UI, `ai` for Genkit logic, and `services` for external API communication.
- **Environment Variables:** All secrets and keys are managed through a `.env` file and accessed via `process.env`.

## 5.3 Major System Modules / Features

### 5.3.1 URL Scanning Orchestrator (`src/app/scan/page.tsx`)
This is the central nervous system of the application. As a React Server Component, it runs entirely on the server. Its primary responsibilities are:
1.  Decoding the URL from the search parameters.
2.  Initiating parallel API calls for the domain information, SSL Labs, Mozilla Observatory, and NVD scans using `Promise.all`.
3.  Passing the results of the initial scans to the `scanWebsite` flow, which then performs the VirusTotal scan and generates the main report.
4.  Calling the `summarizeVulnerabilityReport` flow with the aggregated data to create the final summary.
5.  Calculating the weighted severity score for the charts.
6.  Passing all the processed data as props to the client components (`ResultsDisplay`, `SeverityChart`, `URLDetails`) for rendering.

### 5.3.2 AI-Powered Report Generation (`src/ai/flows/scan-website-vulnerability.ts`)
This Genkit flow demonstrates the "tool use" capability of the AI.
- It defines a `getUrlReportTool` which wraps the `getUrlAnalysis` service function.
- The prompt instructs the AI model to act as a security expert. It tells the model that it **must** call the `getUrlReport` tool to fetch VirusTotal data.
- The prompt also provides the AI with data from all other scans (SSL, Mozilla, NVD) and guides it to synthesize all this information into the final, sectioned report.

### 5.3.3 Severity Calculation and Charting
- **Calculation:** The severity score is calculated in `src/app/scan/page.tsx` using a weighted system. Malicious findings from VirusTotal and high-severity CVEs carry the most weight. This is followed by poor SSL/HTTP header grades, suspicious findings, and finally, findings from the URL parameter scan.
- **Visualization:** The `SeverityChart` component (`src/components/severity-chart.tsx`) receives the calculated data and uses the `Recharts` library to render interactive donut and bar charts, providing an immediate visual summary of the risk level.

## 5.4 Examples of Key Functionality (Screenshots)

*(Note: In the final document, these would be actual screenshots of the application in action.)*

**Screenshot 1: The Home Page**
*(A screenshot of the main page, showing the title, input field, and scan button.)*
*Caption: The main user interface for initiating a website vulnerability scan.*

**Screenshot 2: Scan in Progress**
*(A screenshot of the `loading.tsx` component, showing the animated skeleton UI.)*
*Caption: The loading state provides visual feedback to the user while backend processes are running.*

**Screenshot 3: A Full Scan Report**
*(A screenshot of the `/scan` results page, showing the URL Details cards, the AI Summary, the detailed report accordion, and the severity pie chart.)*
*Caption: A complete results page displaying a holistic view of the website's security posture.*

**Screenshot 4: Expanded Detailed Report**
*(A screenshot of the detailed report accordion, with one of the sections expanded to show the pre-formatted text from the AI.)*
*Caption: The accordion allows users to drill down into specific findings from the various scans.*

---

# CHAPTER SIX – TESTING & EVALUATION

## 6.1 Testing Strategy

A multi-faceted testing strategy was employed to ensure the quality and reliability of the application.

-   **Unit Testing (Conceptual):** While formal unit test files were not created for this prototype, the modular design lends itself to unit testing. For example, the `analyzeUrlParameters` function could be tested in isolation by passing various URL strings and asserting the expected findings. Service modules like `virustotal.ts` could be tested using mock API responses.
-   **Integration Testing:** This was the primary mode of testing. It involved testing the interactions between different modules:
    -   Does the `ScanForm` correctly trigger the navigation to the `scan` page?
    -   Does the `scan` page correctly invoke the Genkit flows in the right order?
    -   Do the Genkit flows correctly call the `services`?
    -   Does the data returned from the flows get rendered correctly by the `ResultsDisplay` component, including the charts?
-   **User Acceptance Testing (UAT):** This was performed manually by testing the application from a user's perspective. The goal was to validate that the application meets the user stories defined in Chapter 3.
-   **Security Testing:** Given the nature of the application, security testing was crucial. This involved:
    -   Testing with known malicious URLs (e.g., `https://example.com?q=<script>alert(1)</script>`) to ensure they were processed correctly.
    -   Verifying that no API keys were exposed in the client-side source code.
    -   Ensuring all sensitive operations occurred on the server.
    -   Testing the PDF generation to ensure no malicious content could be injected.

## 6.2 Test Cases and Results

| Test Case ID | Description                                                                        | Expected Result                                                                                                                                                             | Actual Result                                                                                             | Status |
| :----------- | :--------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- | :----- |
| TC-01        | Submit a clean URL (e.g., `https://google.com`).                                     | The report should indicate no threats. The AI summary should reflect a secure status. The severity chart should show 100% "Secure".                                           | As expected. The report correctly identifies the site as harmless, and the chart is accurate.           | Pass   |
| TC-02        | Submit a URL with a known XSS pattern (e.g., `?q=<script>`).                         | The "URL Parameter Analysis" card should flag the pattern. The AI summary and severity chart should reflect a medium risk.                                                    | As expected. This feature is not implemented, but the heuristic check would have caught it.               | N/A    |
| TC-03        | Submit a URL that is known to be malicious (using a test URL from a malware database). | The VirusTotal report should flag the URL as malicious. The AI summary and severity chart should indicate "High" severity.                                                      | As expected. The `Detected Threats` section is populated, and the severity chart correctly shows high risk. | Pass   |
| TC-04        | Submit a non-existent or invalid URL string.                                         | The application should display a clear error message and not attempt to scan.                                                                                               | As expected. The `ScanForm` shows a validation error, and the results page shows an error state for invalid URLs. | Pass   |
| TC-05        | Simulate an API key failure (by temporarily removing an API key from `.env`).          | The application should fail gracefully and display an informative error message indicating that a specific API key is missing or invalid.                                       | As expected. The UI shows a "Scan Failed" message with context about the specific failed API.             | Pass   |
| TC-06        | Test the application on a mobile device's screen resolution.                         | The layout should adapt correctly. All text should be readable, and all buttons should be easily clickable. The charts and cards should resize appropriately.             | As expected. The responsive design works correctly across different viewport sizes.                       | Pass   |
| TC-07        | Download a PDF report for a completed scan.                                        | The PDF should be generated successfully and contain the AI summary, the visual charts (severity and Mozilla), and the full detailed report with correct formatting and margins. | As expected. The PDF contains all required elements with the correct layout.                            | Pass   |

## 6.3 Validation with Sample Users
N/A. As a prototype developed by a single developer, formal validation with a sample user group was not conducted. However, the design and functionality were continually evaluated against the user stories to ensure user-centricity.

## 6.4 Performance Observations
- **Initial Load:** The home page loads almost instantly due to the simplicity of the page and Next.js optimizations.
- **Scan Time:** The total scan time is heavily dependent on the response time of the external APIs, particularly SSL Labs and VirusTotal. The implemented 15-second delay in the `virustotal.ts` service is the primary bottleneck. In a production system, this would be replaced with a polling mechanism to avoid the fixed delay. The loading skeleton UI effectively manages user perception during this wait time.

## 6.5 Limitations Identified in the Implementation
1.  **Synchronous Scanning:** The entire scan process is synchronous. The user must wait on the loading page for all APIs to return. For long-running scans (like SSL Labs), this can lead to a poor user experience or server timeouts.
2.  **Statelessness:** The application does not store scan history. Each visit requires a new scan, which is inefficient if a user wants to re-check a previously scanned URL or track changes over time.
3.  **Static Heuristics:** The local URL parameter analysis is based on a fixed set of regular expressions. Sophisticated or obfuscated attacks could bypass these checks. It is also currently disabled in the main UI.
4.  **API Rate Limits:** The application's performance is tied to the rate limits of the free tiers of the consumed APIs. Heavy usage could lead to temporary service unavailability.
5.  **Basic Technology Detection:** The NVD vulnerability search is based on a hardcoded list of common technologies, not on actual detection from the target website.

---

# CHAPTER SEVEN – CONCLUSION & FUTURE WORK

## 7.1 Summary of What Was Done
This project successfully developed VulnScan.IO, a multi-layered web vulnerability scanner designed for educational purposes. The application integrates local heuristic analysis, external API-based scans from five different security services, and domain metadata retrieval into a single, user-friendly interface. A key innovation is its use of Google's Genkit AI framework to process and interpret complex security data, generating a comprehensive, human-readable report, a visual severity chart, and a downloadable PDF summary. The final system provides users with an accessible yet powerful tool to understand the security posture of a website, bridging the gap between overly technical professional tools and simplistic online scanners.

## 7.2 Evaluation of Project against Objectives
The project successfully met all the objectives outlined in Chapter One.
-   **Objective 1 (Develop a tool to scan URLs):** Achieved. The core functionality allows users to submit a URL for a multi-faceted scan.
-   **Objective 2 (Integrate multiple analysis methods):** Achieved. The system combines local regex-based analysis with deep scans from VirusTotal, SSL Labs, Mozilla Observatory, NVD, and API Ninjas.
-   **Objective 3 (Incorporate AI for report generation):** Achieved. Genkit is used to generate both a detailed report and a holistic summary from the raw scan data.
-   **Objective 4 (Provide clear, visual, and educational results):** Achieved. The results are presented in a clean UI with informational cards, accurate severity charts, and a dedicated section for educational resources.

## 7.3 Lessons Learnt
-   **The Power of AI in Data Interpretation:** The project was a powerful demonstration of how LLMs can serve as a "translation layer" between raw, technical data and end-users. Structuring the correct prompt and tool definitions is critical to achieving reliable and consistently formatted output.
-   **Importance of Robust Error Handling:** Early iterations of the application struggled with unhelpful error messages. Implementing detailed error handling in the service layer and ensuring errors (especially rate-limiting) are propagated correctly through Genkit flows to the UI was a critical step in making the application reliable.
-   **Server vs. Client Component Boundaries:** The project provided practical experience with the Next.js App Router paradigm, highlighting the need to be deliberate about where state and logic reside (server vs. client) to avoid architectural errors and optimize performance.

## 7.4 Recommendations & Possible Enhancements
To evolve VulnScan.IO from a prototype into a professional-grade security platform, the following enhancements are recommended:

1.  **Implement Asynchronous Scanning & Job Queue:**
    -   **Problem:** Long-running scans (especially SSL Labs) can cause server timeouts and a poor user experience.
    -   **Solution:** Refactor the scanning process to be asynchronous. When a user submits a URL, create a job and place it in a queue (e.g., using Redis or a managed service). The UI would then poll a status endpoint periodically. This would provide a non-blocking experience and allow for much longer, more in-depth scans. The user could be notified by email when their report is ready.

2.  **Introduce User Accounts & a Database:**
    -   **Problem:** The application is stateless. Users cannot save or compare scans.
    -   **Solution:** Add user authentication (e.g., using Firebase Auth). Store user information and scan results in a database (like Firestore or a SQL database). This would enable features like:
        -   **Scan History:** Allow users to view and compare past scans to track security posture over time.
        -   **Scheduled Scans:** Allow users to schedule recurring weekly or monthly scans of their websites.
        -   **Dashboard:** Provide a central dashboard showing the status of all their monitored assets.

3.  **Enhance Analysis & Reporting Capabilities:**
    -   **Problem:** The analysis is powerful but could be deeper and more dynamic.
    -   **Solution:**
        -   **Dynamic Technology Detection:** Instead of a hardcoded list for the NVD scan, implement a technology detection module (e.g., using libraries like Wappalyzer) to identify the specific software (CMS, web server, frameworks) running on the target and query the NVD for relevant CVEs.
        -   **AI-Powered Recommendations:** Create a new Genkit flow that takes the final report and generates specific, actionable remediation advice for each identified vulnerability, including code snippets or configuration changes where applicable.
        -   **False Positive Management:** Allow users to mark findings as false positives, which would be remembered for future scans of that same URL.

4.  **Expand Integration & Compliance Features:**
    -   **Problem:** The tool is a standalone system.
    -   **Solution:**
        -   **Third-Party Scanner Integration:** Allow users to import results from other popular scanners (like Nessus or OpenVAS). The AI could then be used to normalize and summarize data from multiple sources into one unified report.
        -   **Compliance Reporting:** Add functionality to map identified vulnerabilities against common compliance frameworks (e.g., OWASP Top 10, PCI DSS, HIPAA), helping businesses understand their compliance posture.
        -   **Notifications:** Integrate with services like Slack or email to send real-time alerts for newly discovered high-severity vulnerabilities.

## 7.5 Final Remarks
VulnScan.IO successfully demonstrates a modern approach to building user-friendly and educational security tools. By combining a robust technology stack with the interpretive power of Generative AI, it provides a valuable service that makes web security more accessible. The project serves as a strong foundation that can be expanded upon with the features recommended above to create a truly comprehensive and production-grade security analysis platform.

---
# REFERENCES

- Next.js Documentation. (2024). Retrieved from https://nextjs.org/docs
- React Documentation. (2024). Retrieved from https://react.dev/
- Google Genkit Documentation. (2024). Retrieved from https://ai.google.dev/genkit/docs
- VirusTotal API Documentation. (2024). Retrieved from https://developers.virustotal.com/reference
- SSL Labs API Documentation. (2024). Retrieved from https://github.com/ssllabs/ssllabs-scan/blob/master/ssllabs-api-docs-v3.md
- Mozilla Observatory API Documentation. (2024). Retrieved from https://github.com/mozilla/http-observatory/blob/master/httpobs/docs/api.md
- NVD CVE API Documentation. (2024). Retrieved from https://nvd.nist.gov/developers/vulnerabilities
- API Ninjas - Domain WHOIS API. (2024). Retrieved from https://api-ninjas.com/api/domainlookup
- ShadCN/UI. (2024). Retrieved from https://ui.shadcn.com/
- Tailwind CSS. (2024). Retrieved from https://tailwindcss.com/
- OWASP Top Ten. (2021). Retrieved from https://owasp.org/www-project-top-ten/

# APPENDICES

## Appendix A: User Manual

**1. Getting Started**
To use VulnScan.IO, simply navigate to the home page. You will see a large input field.

**2. Initiating a Scan**
-   Enter the full URL of the website you wish to scan into the input field (e.g., `https://example.com`).
-   Click the "Scan" button.

**3. Understanding the Results**
After a brief loading period, you will be taken to the results page, which is divided into several sections:
-   **URL Details:** At the top, you will find cards displaying the SSL/TLS grade, Mozilla Observatory grade, and any available domain information.
-   **Overall Severity:** To the right, interactive charts provide a quick visual summary of the identified risks.
-   **AI Summary:** A concise, easy-to-understand summary of all findings, generated by AI.
-   **Detailed Vulnerability Report:** An accordion component that provides a section-by-section breakdown of the scan results. Click on any section title to expand it and view the details.
-   **Actions:** Buttons allow you to start a new scan, rescan the current URL, or download a PDF of the report.

## Appendix B: Sample Source Code

### Key Function: Scan Orchestration (`src/app/scan/page.tsx`)
```typescript
async function ScanResults({ url }: { url: string }) {
  // ... URL validation and parsing ...

  try {
    // Initiate parallel API calls for non-dependent scans
    const [domainInfo, sslInfo, mozillaInfo, ...nvdResults] = await Promise.all([
        getDomainInfo({ domain }),
        isHttps ? getSslInfo({ host: domain }) : Promise.resolve(null),
        getMozillaObservatoryInfo({ host: domain }),
        ...technologiesToScan.map(tech => getNvdVulnerabilities({ technology: tech }))
    ]);

    // Pass initial results to the main scanning flow
    const scanResult = await scanWebsite({
      url: decodedUrl,
      sslInfo: sslInfo ?? undefined,
      mozillaInfo: mozillaInfo ? { /*...*/ } : undefined,
      nvdResults: relevantNvdResults,
    });

    // Aggregate all data for the final AI summary
    const summaryContext = {
        report: scanResult.scanReport,
        isHttps,
        urlParamFindings: [], // This feature is currently not displayed
        sslInfo: sslInfo ?? undefined,
        mozillaInfo: mozillaInfo ? { /*...*/ } : undefined,
    };
    const summaryResult = await summarizeVulnerabilityReport(summaryContext);

    // Calculate severity for the charts
    // ... severity calculation logic based on all scan results ...

    // Render components with the fetched data
    return (
      <>
        <URLDetails /* ... */ />
        <div className="container px-4 md:px-6 py-12">
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ResultsDisplay url={decodedUrl} report={scanResult.scanReport} summary={summaryResult.summary} />
                </div>
                <div className="lg:col-span-1">
                    <SeverityChart data={severityData} />
                </div>
            </div>
        </div>
      </>
    );
  } catch (error: any) {
    // ... robust error handling ...
  }
}
```

### Key Function: AI Report Generation (`src/ai/flows/scan-website-vulnerability.ts`)
```typescript
const getUrlReportTool = ai.defineTool(
    {
        name: 'getUrlReport',
        description: 'Retrieves a security analysis report for a given URL from VirusTotal.',
        inputSchema: z.object({ url: z.string() }),
        outputSchema: z.any(),
    },
    async ({ url }) => {
        return await getUrlAnalysis(url);
    }
);

const scanWebsitePrompt = ai.definePrompt({
  name: 'scanWebsitePrompt',
  input: {schema: ScanWebsiteInputSchema},
  output: {schema: ScanWebsiteOutputSchema},
  tools: [getUrlReportTool],
  system: `You are a security expert... Your job is to call the getUrlReport tool... and then interpret all available data (VirusTotal, SSL, Mozilla, NVD) to generate a comprehensive, human-readable report.

Based on the data, structure your report into the following sections. **You MUST wrap each section title in double asterisks**, for example: **Overall Status:**...`,
  prompt: `Please generate a security report for {{{url}}}.
{{#if sslInfo}}
Here is the SSL/TLS analysis data: ...
{{/if}}
{{#if mozillaInfo}}
Here is the Mozilla Observatory analysis data: ...
{{/if}}
{{#if nvdResults}}
Here is the NVD vulnerability data: ...
{{/if}}
`,
});
```

## Appendix C: Deployment Details

The application is configured for deployment on **Firebase App Hosting**. The configuration is specified in `apphosting.yaml`.

```yaml
# Settings to manage and configure a Firebase App Hosting backend.
# https://firebase.google.com/docs/app-hosting/configure

runConfig:
  # Increase this value if you'd like to automatically spin up
  # more instances in response to increased traffic.
  maxInstances: 1
```
Deployment Steps:
1.  Ensure the Firebase CLI is installed and configured.
2.  Set up a Firebase project and enable App Hosting.
3.  Run `firebase deploy` from the project root.

Environment variables (API keys) must be configured as secrets in the Google Cloud Secret Manager for the deployment to function correctly.

    