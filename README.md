# Website Vulnerability Scanner and Reporting Tool

## Description
This project is a web-based tool designed to scan websites for potential vulnerabilities and generate easy-to-understand reports. It leverages external scanning services (like VirusTotal based on the file structure) and uses AI to summarize complex vulnerability data and provide educational resources. The goal is to provide users with actionable insights to improve their website's security posture.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Node.js (version 18 or later recommended)
* npm or yarn
* Access to a VirusTotal API key (or similar scanning service configured in `src/services/virustotal.ts`)
* Google Cloud project with Genkit enabled and configured for AI models.

## APIs
https://aistudio.google.com/app/apikey
https://www.virustotal.com/gui/my-apikey


### Installation

1. Clone the repository:
