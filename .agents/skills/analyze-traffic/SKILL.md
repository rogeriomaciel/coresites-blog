---
name: analyze-traffic
description: Analyze traffic for the last X days to identify trending content, traffic sources, and generate new content ideas. Triggered when the user asks to analyze traffic or see what is trending.
---

# Analyze Traffic & Content Generator

## When to Use

Use this skill when the user asks to "analyze traffic", "see what is trending", or "generate content ideas based on traffic" for a certain period (e.g., "last 30 days").

## Goal

Your goal is to fetch data from GA4, analyze it, and provide a 4-part report:
1. **O que tá bombando (Trends):** Top pages by views.
2. **De onde vem o tráfego (Sources):** Top traffic sources/mediums.
3. **Assunto mais relevante (Key Topic):** The common theme among the top performing pages.
4. **Ideias de Conteúdo (Content Ideas):** 3 to 5 new content titles/outlines based on the top topics.

## Execution Steps

### 1. Determine the Date Range
Determine the number of days the user requested. If not specified, default to `30`.

### 2. Fetch Data from GA4
Run the custom script to fetch data automatically from GA4.
Use the `run_command` tool to execute:
```bash
bun core/.agents/skills/analyze-traffic/scripts/fetch_ga4.js <days>
```
*(Replace `<days>` with the number of days, e.g., 30)*

**Important:** If the script fails because `GA4_PROPERTY_ID` or `GOOGLE_APPLICATION_CREDENTIALS` are missing, stop and instruct the user on how to set up Google Analytics Data API credentials and export the variables.

### 3. Analyze the Data
The script will output a JSON containing `top_pages` and `top_sources`.
- Review the `top_pages` to see what is currently trending.
- Review the `top_sources` to understand where users are coming from.
- Analyze the page titles/paths to deduce the most relevant overarching topic.

### 4. Generate the Report
Present the final report to the user using markdown formatting. Be enthusiastic and insightful.

**Format your output like this:**

🚀 **Análise de Tráfego: Últimos [X] dias**

**1. O que tá bombando:**
- [Page Title 1] - [Views] acessos
- [Page Title 2] - [Views] acessos

**2. De onde vem o tráfego:**
- [Source 1] - [Sessions] sessões
- [Source 2] - [Sessions] sessões

**3. Assunto mais relevante:**
- [Your analysis of the common theme and why it's working]

**4. O que podemos criar:**
- **[Idea 1]**: [Brief description based on the winning topic]
- **[Idea 2]**: [Brief description]
- **[Idea 3]**: [Brief description]
