"""Generate Z-Next platform privacy pages from z-next/privacy/index.html.
Edit the shared policy in that source, then run: python scripts/build-znext-privacy.py
No platform-specific data handling is asserted by this generator.
"""
from pathlib import Path
import re
ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / "z-next/privacy/index.html").read_text(encoding="utf-8")
for slug, label, device, english in [
    ("apple", "Apple", "iPhone en iPad (iOS / App Store)", "iPhone and iPad (iOS / App Store)"),
    ("google-play", "Google Play", "Android (Google Play)", "Android (Google Play)"),
]:
    url = f"https://open-aec.com/z-next/privacy/{slug}/"
    page = source.replace("https://open-aec.com/z-next/privacy/", url)
    page = page.replace("Privacyverklaring Z-Next", f"Privacyverklaring Z-Next voor {label}")
    page = page.replace('Privacyverklaring <span class="accent">Z-Next</span>', f'Privacyverklaring <span class="accent">Z-Next</span> voor {label}')
    page = page.replace('<a href="/privacy/">Privacyverklaringen</a> / Z-Next', f'<a href="/privacy/">Privacyverklaringen</a> / <a href="/z-next/privacy/">Z-Next</a> / {label}')
    page = re.sub(r'  <!-- privacy-platforms:start -->.*?  <!-- privacy-platforms:end -->', f'<div class="privacy-platforms"><p>Deze verklaring geldt voor Z-Next op {device}. Je gebruikt de app met een account dat je werkgever beheert.</p><p lang="en">This policy applies to Z-Next on {english}, accessed with an account managed by your employer.</p><p><a href="/z-next/privacy/">← Kies een ander platform / Choose another platform</a></p></div>', page, flags=re.S)
    page = page.replace('Apple en Google Play', label).replace('Apple and Google Play', label)
    page = page.replace('Privacy Policy — Z-Next (English)', f'Privacy Policy — Z-Next for {label} (English)')
    out = ROOT / f"z-next/privacy/{slug}/index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page, encoding="utf-8")
    print(out.relative_to(ROOT))
