# PaperPair

Pairs questions and answers from ICAI-style PDFs, with a library, repeats, revision and a Find/X-ray tool.

- **App:** `index.html` (installable web app with offline support: `sw.js`, `manifest.webmanifest`, `lib/`, `icons/`).
- **Source:** `source/v2.html` is the editable template; `source/build.py` builds it. Tests are in `source/tests`.
- Export-to-PDF needs the jsPDF library from cdnjs, which is cached after the first online use.
- Personal study PDFs are not stored in this repo.

Live app: https://paperpair-app.github.io/paperpair-app/
