# Commons SVG Validator

A Toolforge-hosted utility for validating, sanitizing, repairing, and analyzing SVG files before upload to Wikimedia Commons.

**Live Tool:** https://commons-svg-validator.toolforge.org/

---

## Overview

Commons SVG Validator helps Wikimedia Commons contributors identify compatibility, security, and optimization issues in SVG files.

The tool analyzes uploaded SVG files, detects common problems, generates repair suggestions, performs sanitization, and provides downloadable repaired versions.

Its primary goal is to reduce SVG upload issues on Wikimedia Commons and improve SVG quality before publication.

---

## Features

### SVG Validation

Checks for:

- Invalid XML structure
- Missing SVG root elements
- Missing viewBox attributes
- Dangerous SVG tags
- Unsupported SVG features
- Excessive path complexity
- External references
- Embedded raster images
- Text rendering concerns
- Metadata bloat

---

### Security Analysis

Detects:

- `<script>`
- `<foreignObject>`
- `<iframe>`
- `<embed>`
- `<object>`

and other potentially unsafe SVG content.

---

### Commons Compatibility Analysis

Provides:

- Compatibility score
- Commons readiness assessment
- Upload suitability indicators
- Compatibility warnings

---

### SVG Sanitization

Automatically removes:

- Scripts
- Unsafe elements
- Unnecessary metadata
- Problematic attributes

Generates a cleaner SVG suitable for Wikimedia Commons workflows.

---

### Auto Repair Engine

Automatically repairs common SVG issues such as:

- Missing XML declarations
- Missing viewBox attributes
- Excess whitespace
- Structural formatting issues

Produces a downloadable repaired SVG.

---

### Smart Fix Suggestions

Generates human-readable recommendations including:

- Severity levels
- Explanations
- Suggested fixes
- Commons-specific guidance

---

### Optimization Report

Provides analysis of:

- Path count
- Group count
- Embedded images
- Text elements
- Metadata usage
- Potential optimization opportunities

---

### Preview Comparison

Visual comparison between:

- Original SVG
- Sanitized SVG

Allows contributors to verify sanitization results before downloading.

---

## Technology Stack

### Frontend

- Vue 3
- TypeScript
- Vite
- Tailwind CSS
- Axios

### Backend

- Fastify
- TypeScript
- SVGO
- xmldom

### Hosting

- Wikimedia Toolforge

---

## Installation

### Clone Repository

```bash
git clone https://github.com/GauriGupta21/commons-svg-validator.git

cd commons-svg-validator
```

### Frontend

```bash
cd apps/frontend

npm install

npm run build
```

### Backend

```bash
cd apps/backend

npm install

npm run build
```

### Development

Frontend:

```bash
npm run dev
```

Backend:

```bash
npm run dev
```

---

## Toolforge Deployment

Start service:

```bash
webservice node20 start
```

Update deployment:

```bash
git pull origin main

cd apps/frontend
npm run build

cd ../backend
npm run build

webservice restart
```

---

## Project Structure

```text
commons-svg-validator/

├── apps/
│   ├── frontend/
│   └── backend/
│
├── docs/
│
└── README.md
```

---

## Use Cases

### Wikimedia Commons Contributors

Validate SVGs before upload.

### Graphic Designers

Ensure Commons compatibility.

### Bot Developers

Pre-process SVG files.

### GLAM Projects

Review SVG assets before publication.

### Educational Projects

Create cleaner SVG content for Wikimedia platforms.

---

## Privacy

The tool does not require Wikimedia OAuth authentication.

No external CDNs are required for operation.

The application is designed to comply with Wikimedia Toolforge privacy requirements.

---

## Future Roadmap

Planned enhancements include:

- Wikimedia Commons API integration
- Upload simulation
- Advanced repair heuristics
- SVG diff visualization
- Batch processing
- Upload history
- OAuth integration (optional)

---

## License

MIT License

---

## Maintainer

Wikimedia Username: Gauri_Guptaa

Hosted on Wikimedia Toolforge.

---

## Feedback
Bug reports, feature requests, and contributions are welcome.

Please open an issue or submit a pull request.
Bug reports, feature requests, and contributions are welcome.

Please open an issue or submit a pull request.
