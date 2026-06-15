# BuildBetter Project Instructions

## Project

BuildBetter is a React/Vite/Tailwind website for PC upgrade recommendations.

Users enter:

* CPU
* GPU
* RAM
* Storage
* Motherboard
* Power Supply
* Case, optional
* Upgrade Budget
* Main Use Case

Use case options:

* Gaming
* School
* CAD
* Streaming
* General Use

The frontend project is inside:

client/

Main files:

* client/src/App.jsx
* client/src/index.css
* client/vite.config.js
* client/package.json

## Current State

The project is already created with Vite + React.

The site currently has:

* BuildBetter hero section
* Three explanation cards
* PC parts form
* Mock results after clicking Analyze My PC
* Tailwind styling working
* Vite preview running on port 5173 in Codespaces

## Development Rules

Do as much implementation as possible directly in the repo.

Do not only give code to copy unless you are blocked from editing files.

Before editing, inspect:

* pwd
* ls
* ls client
* ls client/src
* cat client/package.json
* cat client/src/App.jsx

If the `client` folder is not accessible, stop and explain the access problem.

After changes, run:

cd client
npm run build

Fix all errors before reporting finished work.

Keep the project beginner-friendly:

* Use React + Vite + Tailwind
* Do not add TypeScript
* Do not add backend yet
* Do not add real API keys
* Do not add unnecessary libraries
* Prefer simple working code over fancy architecture

## Main Goal

Turn the current frontend mockup into a polished frontend MVP.

## Required Features

### 1. Clean Current App

Make sure:

* The app renders without Vite errors
* The form works
* Analyze My PC shows results
* Tailwind works
* Layout is responsive
* Design is dark, clean, and modern

### 2. Split Into Components

Refactor into files like:

client/src/
App.jsx
index.css
data/
recommendationRules.js
utils/
analysis.js
systemInfoParser.js
components/
Hero.jsx
StepCard.jsx
SpecsForm.jsx
AutoFillSystemInfo.jsx
Results.jsx
ResultCard.jsx
SummaryItem.jsx

Do not overcomplicate it.

### 3. Add System Info Auto-Fill

A normal browser website cannot automatically scan a user’s PC specs. For the MVP, add a safe paste-based feature.

Add a section above the form:

Title:
Auto-Fill From System Info

Description:
Paste your Windows System Information text below. BuildBetter will try to fill in the parts it recognizes.

Textarea placeholder:
Paste your System Information text here...

Button:
Auto-Fill My Specs

Parse text like:

OS Name Microsoft Windows 11 Home
System Manufacturer ASUSTeK COMPUTER INC.
System Model ASUS TUF Dash F15 FX516PM_FX516PM
Processor 11th Gen Intel(R) Core(TM) i7-11370H @ 3.30GHz
BaseBoard Manufacturer ASUSTeK COMPUTER INC.
BaseBoard Product FX516PM
Installed Physical Memory (RAM) 16.0 GB

Map parsed values into:

* cpu
* ram
* motherboard
* case/model field

Also support GPU parsing if pasted text includes display info like:

Name NVIDIA GeForce RTX 3060
Adapter RAM
Driver Version

Do not crash if the pasted text is messy.

### 4. Better Frontend Recommendation Logic

Replace fixed mock results with simple frontend logic based on:

* Budget
* Use case
* CPU/GPU/RAM/storage fields
* Common bottleneck patterns

Results should show:

1. Current Build Summary
2. Estimated Used Value
3. Likely Bottleneck
4. Recommended First Upgrade
5. Upgrade Path
6. AI Explanation Placeholder

Important:
Estimated used value is still a rough demo estimate, not real market pricing.

Use simple rules:

* Gaming usually prioritizes GPU
* School/general use often benefits from SSD/RAM
* CAD may need CPU/RAM/GPU
* Streaming may need CPU or GPU encoder
* Low RAM should recommend RAM
* Missing/weak storage should recommend SSD

### 5. Improve UX

Add:

* Clean spacing
* Better cards
* Clear headings
* Better labels/placeholders
* Required indicators where useful
* Helper text
* Empty results state before analysis
* Demo-only badge for estimated value
* Responsive layout
* Button hover/focus states
* Friendly validation errors

### 6. Validation

Add simple validation:

* Budget should be a positive number
* At least CPU or GPU should be entered
* If the user tries to analyze with almost nothing filled out, show a friendly error
* Empty fields should not crash the app

### 7. README

Update README with:

* What BuildBetter is
* How to run it
* Current MVP features
* Known limitations
* Future features:

  * real pricing API
  * AI explanation API
  * saved builds
  * downloadable helper app/desktop tool for automatic hardware detection

## Finish

When done:

1. Run `cd client && npm run build`
2. Fix errors
3. Summarize changed files
4. Explain how I should test it
5. Commit if Git access works:

git add .
git commit -m "Build frontend MVP with specs analysis and system info auto-fill"

If commit does not work, tell me the exact commands to run.
