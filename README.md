# Open AEC Foundation Website

Official website for the Open AEC Foundation - an organization dedicated to developing, supporting and promoting open source software for the entire construction chain.

## Repository Overview

The OpenAEC Foundation maintains **16 open source repositories** for the AEC (Architecture, Engineering, Construction) industry. Below is a complete overview organized by category.

### BIM & Building Modeling

| Repository | Description | Language | License |
|------------|-------------|----------|---------|
| [building.py](https://github.com/OpenAEC-Foundation/building.py) | Python library for creating buildings, building systems and objects. Export to Blender, Revit, IFC, Struct4U, DXF & Speckle. | Python | GPL-2.0 |
| [INB-Template](https://github.com/OpenAEC-Foundation/INB-Template) | IFC-template for the Dutch construction sector with NEN47-compliant materials, steel profiles and building element types. | CSS | MIT |

### Viewers & Visualization

| Repository | Description | Language | License |
|------------|-------------|----------|---------|
| [monty-IFC-viewer](https://github.com/OpenAEC-Foundation/monty-IFC-viewer) | Lightweight IFC model viewer. | HTML | - |
| [CPT-viewer](https://github.com/OpenAEC-Foundation/CPT-viewer) | Viewer for CPT (Cone Penetration Test) files in GEF and BRO-xml format. | - | - |
| [Open-2D-Studio](https://github.com/OpenAEC-Foundation/Open-2D-Studio) | Cross-platform PDF viewer built with .NET and Avalonia UI. | C# | MIT |

### Data & Integration

| Repository | Description | Language | License |
|------------|-------------|----------|---------|
| [Project-Ocondat](https://github.com/OpenAEC-Foundation/Project-Ocondat) | Open building data using WikiData and other data sources. Includes steel profiles, Eurocode standards and more. | Python | MIT |
| [GIS2BIM-OpenAnalysis](https://github.com/OpenAEC-Foundation/GIS2BIM-OpenAnalysis) | GIS to BIM analysis and integration tools. | Python | - |
| [IfcGit4NextCloud](https://github.com/OpenAEC-Foundation/IfcGit4NextCloud) | NextCloud add-on for IfcGit integration. | - | - |

### Office & Productivity Tools

| Repository | Description | Language | License |
|------------|-------------|----------|---------|
| [Open-PDF-Creator](https://github.com/OpenAEC-Foundation/Open-PDF-Creator) | Open source PDF printer/creator. | Python | MIT |
| [Open-Report-Builder-Studio](https://github.com/OpenAEC-Foundation/Open-Report-Builder-Studio) | Tool/API to create complete engineering reports. Combines documents, drawings and PDFs. Integrated with AI and ERPNext. | - | - |
| [Open-Calc](https://github.com/OpenAEC-Foundation/Open-Calc) | Open source cost estimation tool. | - | - |

### Scripts & Libraries

| Repository | Description | Language | License |
|------------|-------------|----------|---------|
| [AEC-Scripts](https://github.com/OpenAEC-Foundation/AEC-Scripts) | Python scripts library for the AEC industry. | Python | MIT |

### Knowledge & Documentation

| Repository | Description | Language | License |
|------------|-------------|----------|---------|
| [OpenBooks](https://github.com/OpenAEC-Foundation/OpenBooks) | Scanning and digitizing old architectural and construction books. | HTML | - |

### Infrastructure & Automation

| Repository | Description | Language | License |
|------------|-------------|----------|---------|
| [nextcloud-talk-erp-next-bot](https://github.com/OpenAEC-Foundation/nextcloud-talk-erp-next-bot) | NextCloud Talk bot with ERPNext integration. | Python | - |
| [NextCloud-Claude-Bot](https://github.com/OpenAEC-Foundation/NextCloud-Claude-Bot) | AI-powered Claude bot for NextCloud. | - | - |

### Website

| Repository | Description | Language | License |
|------------|-------------|----------|---------|
| [website](https://github.com/OpenAEC-Foundation/website) | Official website of the OpenAEC Foundation. | HTML | MIT |

---

## Live Website

https://openaec-foundation.github.io/website/

## Features

- **Bilingual support**: Dutch (default) and English
- **Responsive design**: Works on desktop, tablet and mobile
- **Single-page layout**: Smooth scrolling navigation
- **Language persistence**: Remembers user's language preference

## Sections

- **Hero**: Introduction and call-to-action
- **About**: Why Open AEC Foundation (6 key benefits)
- **Mission**: Core mission and activities
- **Board**: Information about joining the board
- **Contact**: Contact form and details

## Technology

- Pure HTML, CSS and JavaScript
- No build tools or frameworks required
- Hosted on GitHub Pages

## Development

To run locally, simply open `index.html` in a browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

## Language System

The website uses a custom i18n system with:
- `data-i18n` attributes for text content
- `data-i18n-attr` for translating element attributes (e.g., placeholders)
- Translations stored in a JavaScript object
- Language preference saved in localStorage

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- **Initiator**: Maarten Vroegindeweij
- **Location**: Dordrecht, The Netherlands
- **Planned founding**: March 1, 2026
