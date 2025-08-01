
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

# CHAPTER THREE – SYSTEM ANALYSIS & REQUIREMENTS

## 3.1 Analysis Tools Used

### 3.1.1 Use Case Diagram
The primary interactions between the user and the VulnScan.IO system can be summarized in the following use case:

*(A simple text representation of the use case diagram)*
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
        |      +-------------------------> | (View HTTPS Status)
        |      | includes                  |
        |      +-------------------------> | (View URL Parameter Analysis)
        |      | includes                  |
        |      +-------------------------> | (View Domain Info)
        |      | includes                  |
        |      +-------------------------> | (View VirusTotal Report)
        |      | includes                  |
        |      +-------------------------> | (View AI Summary)
        |      | includes                  |
        |      +-------------------------> | (View Severity Chart)
        |                                  |
User ---|> (Access Educational Resources)  |
        |                                  |
        +----------------------------------+
```

### 3.1.2 User Stories
The system requirements were captured as user stories to maintain a user-centric focus throughout development.

1.  **As a user, I want to enter a website URL into an input field so that I can initiate a security scan.**
2.  **As a user, I want to see a clear loading state after submitting a URL so that I know the scan is in progress.**
3.  **As a user, I want the application to check if the website is using the secure HTTPS protocol so that I know if my data is encrypted in transit.**
4.  **As a user, I want the application to analyze the URL's query parameters for common malicious patterns (like XSS or SQLi) so that I can identify potential injection vulnerabilities.**
5.  **As a user, I want the application to fetch and display domain information (like age and registrar) so that I can get more context about the website's history.**
6.  **As a user, I want the application to submit the URL to the VirusTotal API for a deep malware and vulnerability scan.**
7.  **As a user, I want to see a comprehensive, AI-generated summary of all findings so that I can quickly understand the overall security posture.**
8.  **As a user, I want to view a detailed, sectioned report from the VirusTotal scan, explained in clear language.**
9.  **As a user, I want to see a visual pie chart that summarizes the severity of all detected issues (High, Medium, Low).**
10. **As a user, I want to be able to access links to educational resources to learn more about the identified vulnerabilities.**

## 3.2 Functional Requirements

The functional requirements define what the system must do.

- **FR1: URL Input:** The system shall provide a text field for the user to input a website URL.
- **FR2: Scan Initiation:** The system shall provide a button to trigger the scanning process for the submitted URL.
- **FR3: HTTPS Analysis:** The system shall analyze the URL's protocol and identify whether it is HTTP or HTTPS.
- **FR4: URL Parameter Heuristics:** The system shall scan the URL's query string against a predefined list of regular expressions for malicious patterns.
- **FR5: Domain Metadata Retrieval:** The system shall make an API call to an external service (API Ninjas) to fetch WHOIS information for the domain.
- **FR6: External Vulnerability Scan:** The system shall make an API call to an external service (VirusTotal) to perform a comprehensive vulnerability scan.
- **FR7: AI-Powered Reporting:** The system shall use a Generative AI model to process the results from all analyses and generate a structured, human-readable report.
- **FR8: AI-Powered Summarization:** The system shall use a Generative AI model to generate a holistic summary of all findings.
- **FR9: Results Display:** The system shall display all analysis results on a dedicated results page, including the HTTPS status, parameter findings, domain info, AI report, and AI summary.
- **FR10: Severity Visualization:** The system shall calculate a weighted severity score and display it as a pie chart.
- **FR11: Educational Content:** The system shall display a section with links to external web security resources.
- **FR12: Error Handling:** The system shall gracefully handle invalid URLs and API failures, displaying a clear error message to the user.

## 3.3 Non-Functional Requirements

These requirements define the quality attributes of the system.

- **NFR1: Performance:** The initial page load shall be fast. The results page, while waiting for external APIs, must display a responsive loading skeleton to inform the user about the ongoing process. The total scan time should ideally be under 30 seconds.
- **NFR2: Usability:** The user interface shall be clean, intuitive, and easy to navigate. All information should be presented clearly. The application must be fully responsive and work seamlessly on desktop, tablet, and mobile devices.
- **NFR3: Security:** While this is a scanning tool, it must also be secure. API keys and other sensitive environment variables must not be exposed on the client-side. All API interactions should happen on the server-side via Next.js Server Actions and Genkit flows.
- **NFR4: Reliability:** The application should handle API errors or unexpected data formats without crashing. It should provide informative feedback to the user in case of failure.
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
     +------------------+

Explanation:
- A User provides a URL.
- The Scan Process is initiated, which is an orchestration of multiple analysis steps.
- The Scan Process produces a raw Scan Result, which contains data from various sources (HTTPS check, local heuristics, domain info API, VirusTotal API).
- The Scan Result data is then processed and transformed into the final Report, which is what the user sees. The Report includes the AI-generated summary, the detailed analysis, and the calculated severity data for the chart.
```

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
|         | 1. Orchestrates multiple async calls                    |
|         |                                                         |
|   +-----v----------------+      +--------------------------+      |
|   | getDomainInfo Flow   |      | scanWebsite Flow         |      |
|   +----------------------+      +--------------------------+      |
|              |                          | (Uses Tool)             |
|              |                          v                         |
|   +----------v-----------+      +-------v----------------+      |
|   | API Ninjas Service   |      | VirusTotal Service     |      |
|   | (lookupDomain)       |      | (getUrlAnalysis)       |      |
|   +----------------------+      +------------------------+      |
|              |                          |                         |
|   <----------+ (HTTPS Call) <----------+ (HTTPS Call)            |
|              |                          |                         |
|  +-----------v------------+    +--------v-------------+           |
|  | API Ninjas WHOIS API   |    | VirusTotal Scan API  |           |
|  +------------------------+    +----------------------+           |
|                                                                   |
|   +-------------------------------------------------------------+ |
|   | After data retrieval, `summarizeVulnerabilityReport` flow   | |
|   | is called with all data to generate the final summary.        | |
|   +-------------------------------------------------------------+ |
|                                                                   |
|              | (Returns final page props)                         |
|              v                                                    |
|         [React Server Component Renderer]                         |
|              |                                                    |
|              +---------> HTML sent back to Browser <--------------+
|                                                                   |
+-------------------------------------------------------------------+

```
**Architectural Layers:**
1.  **Presentation Layer (Client-Side):** This is what the user interacts with. It's built with React components and is responsible for rendering the UI and capturing user input. Components like `ScanForm` initiate the process, while `ResultsDisplay` and `SeverityChart` render the final output.
2.  **Application Layer (Server-Side):** This layer resides on the Next.js server. It handles the core business logic. The `scan/page.tsx` Server Component acts as an orchestrator. It receives the URL, invokes the necessary Genkit flows, processes the results, and passes the final data to the presentation components.
3.  **AI/Flow Layer (Server-Side):** This is a specialized part of the application layer, managed by Genkit. The flows in `src/ai/flows/` encapsulate all interactions with the Google AI models and external API tools. This isolates AI logic from the main application logic.
4.  **Service/Data Access Layer (Server-Side):** This layer consists of modules in `src/services/` that are responsible for direct communication with external APIs (VirusTotal, API Ninjas). They handle the specifics of making HTTP requests, adding API keys, and basic error handling.

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
|   |-- severity-chart.tsx (Client component for the Recharts pie chart)
|   |-- url-details.tsx (Component to display HTTPS, Param, and Domain info cards)
|   |-- educational-resources.tsx (Static component with links)
|   `-- /ui (ShadCN UI components: Button, Card, etc.)
|
|-- /ai
|   |-- genkit.ts (Genkit initialization and configuration)
|   `-- /flows
|       |-- scan-website-vulnerability.ts (Flow to call VirusTotal and generate a report)
|       |-- get-domain-info.ts (Flow to fetch domain metadata)
|       `-- summarize-vulnerability-report.ts (Flow to create the final AI summary)
|
|-- /services
|   |-- virustotal.ts (Module to interact with the VirusTotal API)
|   `-- apininjas.ts (Module to interact with the API Ninjas API)
|
|-- /lib
|   `-- utils.ts (Utility functions, e.g., `cn` for classnames)
|
`-- package.json (Project dependencies and scripts)
```

## 4.3 Database Design

This application is **stateless** and does not require a traditional database.
-   All data is fetched in real-time from external APIs upon user request.
-   A simple in-memory cache is used within the `virustotal.ts` service to prevent re-scanning the same URL in quick succession, but this data is ephemeral and does not persist across server restarts.
-   No user accounts, sessions, or scan histories are stored.

This design simplifies the architecture and eliminates the need for database management and maintenance.

## 44 User Interface Design

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
|   | HTTPS Check  | | URL Param... | | Domain Info  |  |
|   | Card         | | Card         | | Card         |  |
|   +--------------+ +--------------+ +--------------+  |
|                                                      |
+------------------------------------------------------+
|  +---------------------------+  +------------------+   |
|  |                           |  |                  |   |
|  |   <h2>Scan Complete</h2>   |  |  <h3>Severity</h3> |   |
|  |                           |  |                  |   |
|  |  +---------------------+  |  |   +------------+   |   |
|  |  |  AI Summary Card    |  |  |   | Pie Chart  |   |   |
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
- **API Key Management:** All API keys (`VIRUSTOTAL_API_KEY`, `API_NINJAS_KEY`, `GEMINI_API_KEY`) are stored in an `.env` file, which is loaded exclusively on the server. They are never exposed to the client-side, preventing theft.
- **Server-Side API Calls:** All communication with external services happens on the server within Genkit flows or Next.js Server Components. This prevents client-side manipulation of API requests.
- **Input Sanitization:** While the application is designed to accept potentially malicious URLs for analysis, the output from the AI is rendered as text or pre-formatted HTML, mitigating the risk of stored XSS from the report itself. URL inputs are URI-encoded before being used in API calls.

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
2.  Performing the local heuristic analysis (`analyzeUrlParameters`).
3.  Initiating parallel API calls for the VirusTotal scan and the domain information lookup using `Promise.all`.
4.  Calling the `summarizeVulnerabilityReport` flow with the aggregated data.
5.  Calculating the weighted severity score.
6.  Passing all the processed data as props to the client components (`ResultsDisplay`, `SeverityChart`, `URLDetails`) for rendering.

### 5.3.2 AI-Powered Report Generation (`src/ai/flows/scan-website-vulnerability.ts`)
This Genkit flow demonstrates the "tool use" capability of the AI.
- It defines a `getUrlReportTool` which wraps the `getUrlAnalysis` service function.
- The prompt instructs the AI model to act as a security expert. Crucially, it tells the model that it **must** call the `getUrlReport` tool to fetch the necessary data.
- After the tool returns the raw JSON from VirusTotal, the same prompt guides the model to parse that JSON and structure its response into the detailed, sectioned report seen by the user.

### 5.3.3 Severity Calculation and Charting
- **Calculation:** The severity score is calculated in `src/app/scan/page.tsx` using a weighted system. Malicious findings from VirusTotal carry the most weight, followed by the lack of HTTPS, suspicious findings, and finally, findings from the URL parameter scan.
- **Visualization:** The `SeverityChart` component (`src/components/severity-chart.tsx`) receives the calculated data and uses the `Recharts` library to render an interactive pie chart, providing an immediate visual summary of the risk level.

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
*Caption: The accordion allows users to drill down into specific findings from the VirusTotal scan.*

# CHAPTER SIX – TESTING & EVALUATION

## 6.1 Testing Strategy

A multi-faceted testing strategy was employed to ensure the quality and reliability of the application.

-   **Unit Testing (Conceptual):** While formal unit test files were not created for this prototype, the modular design lends itself to unit testing. For example, the `analyzeUrlParameters` function could be tested in isolation by passing various URL strings and asserting the expected findings. Service modules like `virustotal.ts` could be tested using mock API responses.
-   **Integration Testing:** This was the primary mode of testing. It involved testing the interactions between different modules:
    -   Does the `ScanForm` correctly trigger the navigation to the `scan` page?
    -   Does the `scan` page correctly invoke the Genkit flows?
    -   Do the Genkit flows correctly call the `services`?
    -   Does the data returned from the flows get rendered correctly by the `ResultsDisplay` component?
-   **User Acceptance Testing (UAT):** This was performed manually by testing the application from a user's perspective. The goal was to validate that the application meets the user stories defined in Chapter 3.
-   **Security Testing:** Given the nature of the application, security testing was crucial. This involved:
    -   Testing with known malicious URLs (e.g., `https://example.com?q=<script>alert(1)</script>`) to ensure they were processed correctly.
    -   Verifying that no API keys were exposed in the client-side source code.
    -   Ensuring all sensitive operations occurred on the server.

## 6.2 Test Cases and Results

| Test Case ID | Description                                                                        | Expected Result                                                                                                                                                             | Actual Result                                                                                             | Status |
| :----------- | :--------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- | :----- |
| TC-01        | Submit a clean URL (e.g., `https://google.com`).                                     | The report should indicate no threats. The AI summary should reflect a secure status. The severity chart should show 100% "Secure" or "Low/Info".                             | As expected. The report correctly identifies the site as harmless.                                        | Pass   |
| TC-02        | Submit a URL with a known XSS pattern (e.g., `?q=<script>`).                         | The "URL Parameter Analysis" card should flag the pattern. The AI summary and severity chart should reflect a medium-to-high risk.                                       | As expected. The heuristic check identifies the pattern, and the severity is elevated.                  | Pass   |
| TC-03        | Submit a URL that is known to be malicious (using a test URL from a malware database). | The VirusTotal report should flag the URL as malicious. The AI summary and severity chart should indicate "High" severity.                                                      | As expected. The `Detected Threats` section is populated, and severity is high.                           | Pass   |
| TC-04        | Submit a non-existent or invalid URL string.                                         | The application should display a clear error message and not attempt to scan.                                                                                               | As expected. The `ScanForm` shows a validation error for invalid formats. The results page shows an error state. | Pass   |
| TC-05        | Simulate an API key failure (by temporarily removing an API key from `.env`).          | The application should fail gracefully and display an informative error message indicating that the specific API key is missing.                                                | As expected. The UI shows a "Scan Failed" message with context about the missing key.                   | Pass   |
| TC-06        | Test the application on a mobile device's screen resolution.                         | The layout should adapt correctly. All text should be readable, and all buttons should be easily clickable. The charts and cards should resize appropriately.             | As expected. The responsive design works correctly across different viewport sizes.                       | Pass   |

## 6.3 Validation with Sample Users
N/A. As a prototype developed by a single developer, formal validation with a sample user group was not conducted. However, the design and functionality were continually evaluated against the user stories to ensure user-centricity.

## 6.4 Performance Observations
- **Initial Load:** The home page loads almost instantly due to the simplicity of the page and Next.js optimizations.
- **Scan Time:** The total scan time is heavily dependent on the response time of the external APIs, particularly VirusTotal. The implemented 15-second delay in the `virustotal.ts` service is the primary bottleneck. In a production system, this would be replaced with a polling mechanism or webhook to avoid the fixed delay, but for this project's scope, it provides a reliable if slow experience. The loading skeleton UI effectively manages user perception during this wait time.

## 6.5 Limitations Identified in the Implementation
1.  **Fixed Scan Delay:** The reliance on a `setTimeout` of 15 seconds for the VirusTotal scan is inefficient. It may be too long for quick scans or too short for complex ones, potentially leading to incomplete data.
2.  **Statelessness:** The application does not store scan history. Each visit requires a new scan, which is inefficient if a user wants to re-check a previously scanned URL.
3.  **Heuristic Limitations:** The local URL parameter analysis is based on a fixed set of regular expressions. Sophisticated or obfuscated attacks could bypass these checks.
4.  **API Rate Limits:** The application's performance is tied to the rate limits of the free tiers of the VirusTotal and API Ninjas APIs. Heavy usage could lead to temporary service unavailability.

# CHAPTER SEVEN – CONCLUSION & FUTURE WORK

## 7.1 Summary of What Was Done
This project successfully developed VulnScan.IO, a multi-layered web vulnerability scanner designed for educational purposes. The application integrates local heuristic analysis, external API-based scans, and domain metadata retrieval into a single, user-friendly interface. A key innovation is its use of Google's Genkit AI framework to process and interpret complex security data, generating a comprehensive, human-readable report and a visual severity chart. The final system provides users with an accessible yet powerful tool to understand the security posture of a website, bridging the gap between overly technical professional tools and simplistic online scanners.

## 7.2 Evaluation of Project against Objectives
The project successfully met all the objectives outlined in Chapter One.
-   **Objective 1 (Develop a tool to scan URLs):** Achieved. The core functionality allows users to submit a URL for a multi-faceted scan.
-   **Objective 2 (Integrate heuristic and API-based scanning):** Achieved. The system combines local regex-based parameter analysis with deep scans from the VirusTotal API.
-   **Objective 3 (Incorporate AI for report generation):** Achieved. Genkit is used to generate both a detailed report and a holistic summary from the raw scan data.
-   **Objective 4 (Provide clear, visual, and educational results):** Achieved. The results are presented in a clean UI with informational cards, a severity pie chart, and a dedicated section for educational resources.

## 7.3 Lessons Learnt
-   **The Power of AI in Data Interpretation:** The project was a powerful demonstration of how LLMs can serve as a "translation layer" between raw, technical data and end-users. Structuring the correct prompt and tool definitions is critical to achieving reliable output.
-   **Importance of Robust Error Handling:** Early iterations of the application struggled with unhelpful error messages. Implementing detailed error handling in the service layer and ensuring errors are propagated correctly through Genkit flows to the UI was a critical step in making the application debuggable and reliable.
-   **Server Components vs. Client Components:** The project provided practical experience with the Next.js App Router paradigm, highlighting the need to be deliberate about where state and logic reside (server vs. client) to avoid architectural errors.

## 7.4 Recommendations & Possible Enhancements
-   **Implement Asynchronous Polling:** Replace the 15-second `setTimeout` for VirusTotal with a more robust polling mechanism. The client could make periodic requests to a server endpoint to check the status of the scan, providing a much better user experience.
-   **Add User Accounts and Scan History:** Introduce user authentication to allow users to save and review their past scan reports. This would transform the tool from a one-off scanner into a persistent security dashboard.
-   **Expand Local Analysis:** Enhance the client-side heuristics to scan for more than just URL parameters. This could include checking for insecure HTTP headers, analyzing linked scripts, or checking for vulnerable JavaScript libraries.
-   **Integrate More APIs:** Add other security APIs to enrich the report further, such as services that check for SSL certificate misconfigurations (like Qualys SSL Labs) or services that check if a domain is on a spam blacklist.
-   **Allow Configuration:** Allow users to configure the scan, such as choosing which tests to run or providing authentication credentials for scanning protected pages.

## 7.5 Final Remarks
VulnScan.IO successfully demonstrates a modern approach to building user-friendly and educational security tools. By combining a robust technology stack with the interpretive power of Generative AI, it provides a valuable service that makes web security more accessible. The project serves as a strong foundation that can be expanded upon with the features recommended above to create a truly comprehensive and production-grade security analysis platform.

---
# REFERENCES

- Next.js Documentation. (2024). Retrieved from https://nextjs.org/docs
- React Documentation. (2024). Retrieved from https://react.dev/
- Google Genkit Documentation. (2024). Retrieved from https://ai.google.dev/genkit/docs
- VirusTotal API Documentation. (2024). Retrieved from https://developers.virustotal.com/reference
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
-   **URL Details:** At the top, you will find cards displaying the HTTPS status, the results of the URL parameter analysis, and any available domain information.
-   **Overall Severity:** To the right, a pie chart provides a quick visual summary of the identified risks.
-   **AI Summary:** A concise, easy-to-understand summary of all findings, generated by AI.
-   **Detailed Vulnerability Report:** An accordion component that provides a section-by-section breakdown of the VirusTotal scan results. Click on any section title to expand it and view the details.

## Appendix B: Sample Source Code

### Key Function: Scan Orchestration (`src/app/scan/page.tsx`)
```typescript
async function ScanResults({ url }: { url: string }) {
  let decodedUrl: string;
  let domain: string;

  try {
    decodedUrl = decodeURIComponent(url);
    // ... URL validation and parsing ...
    domain = new URL(decodedUrl).hostname;
  } catch (error) {
    // ... error handling ...
  }

  try {
    const isHttps = new URL(decodedUrl).protocol === 'https:';
    const urlParamAnalysis = analyzeUrlParameters(decodedUrl);
    
    // Initiate parallel API calls
    const scanPromise = scanWebsite({ url: decodedUrl });
    const domainInfoPromise = getDomainInfo({ domain });

    const [scanResult, domainInfo] = await Promise.all([
        scanPromise,
        domainInfoPromise
    ]);

    // Aggregate data for the AI summary
    const summaryContext = {
        report: scanResult.scanReport,
        isHttps,
        urlParamFindings: urlParamAnalysis.findings,
    };

    const summaryResult = await summarizeVulnerabilityReport(summaryContext);

    // Calculate severity for the chart
    const stats = getStatsFromReport(scanResult.scanReport);
    let highSeverity = (stats.malicious * 3) + (!isHttps ? 2 : 0);
    // ... rest of severity calculation ...

    // Render components with the fetched data
    return (
      <>
        <URLDetails url={decodedUrl} domainInfo={domainInfo} urlParamAnalysis={urlParamAnalysis} />
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
    // ... error handling ...
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
  system: `You are a security expert tasked with analyzing website vulnerability data. The user will provide a URL. Your job is to call the getUrlReport tool to fetch the raw JSON data for that URL from the VirusTotal API, and then interpret that data to generate a comprehensive, human-readable report.
... // Rest of the system prompt
`,
  prompt: `Please generate a security report for the following URL: {{{url}}}`,
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
