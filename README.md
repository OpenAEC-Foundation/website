# Open AEC Foundation Website

Official website for the Open AEC Foundation - an organization dedicated to developing, supporting and promoting open source software for the entire construction chain.

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
