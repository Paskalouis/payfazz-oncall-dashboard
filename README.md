# Payfazz OnCall Dashboard

A personal dashboard for monitoring and analyzing on-call issues. Built to help engineering teams track on-call workload, identify trends, and measure improvements over time.

## Features

- **CSV Import** - Upload Jira CSV exports to analyze on-call data
- **Monthly Filtering** - View data by specific month or all-time
- **Month-to-Month Comparison** - Track changes vs previous month with regression highlighting
- **Issue Distribution** - Pie chart showing issues by label
- **Time Tracking** - Bar chart showing hours spent per label
- **Multi-Month Trends** - Line chart showing issues and hours over time
- **Resolution Time Analysis** - Average time to resolve issues by label
- **Top Time-Consuming Issues** - Identify issues that took the most effort

## Supported Format

This dashboard supports **Jira CSV exports** with the following required columns:
- Issue Type
- Key
- Summary
- Assignee
- Created
- Updated
- Labels
- Σ Time Spent

## Getting Started

```sh
bun install
bun run dev
```

Open http://localhost:3000 and upload your Jira CSV export.

## Build

```sh
bun run build
bun run start
```

## Tech Stack

- TanStack Start / TanStack Router
- React 19
- Tailwind CSS v4
- Recharts
- TypeScript
