# UniCalc Scholar

A free CGPA calculator for Nigerian university students. Add your courses, see your CGPA and class of degree instantly, plan the grades you need for a target, and export a PDF transcript.

Everything runs in the browser. There are no accounts and no server: your results are saved on your own device.

Built with plain HTML, CSS and JavaScript. No framework, no build step, no dependencies to install.

## Features

- **5.0 and 4.0 grading scales**, switchable at any time. Grade points and class of degree follow the scale.
- **Semester and cumulative results** that update as you type. CGPA is total quality points divided by total units (not an average of semester GPAs).
- **Target CGPA planner**: enter a target and the units you have left to see the average grade you need, shown as a mix of grades, or a clear message when the target is out of reach.
- **Dashboard** with a CGPA-by-semester chart, and an **academic records** page with progress rings, units earned, courses passed and per-year tables.
- **Transcript page** with a live preview, PDF download and print. It is an unofficial personal summary, not a certified transcript.
- **Autosave** to the browser's local storage, plus **backup and restore** as a JSON file from the "Your data" menu (click your name at the bottom of the sidebar).
- **Works offline** after the first visit, and can be installed to a phone or desktop (service worker and web app manifest).
- Light and dark themes everywhere (home page included), following the device setting until you choose, with a responsive layout and keyboard-accessible dialogs.

## Run it locally

The scripts are ES modules, so the pages must be opened through a web server (double-clicking the HTML files will not work). Any static server is fine:

```bash
# from the project folder, pick one
npx serve .
python3 -m http.server 8000
```

or use the Live Server extension in VS Code. Then open the address it prints (for example `http://localhost:8000`).

## Deploy

It is a static site. On Vercel, import the repository with no framework preset and no build command. `vercel.json` only adds a few response headers.

## Project structure

```
index.html                     Landing page
LICENSE                        MIT license
contact.html                   Contact details for both founders
privacy.html  terms.html       Legal pages
404.html                       Not-found page
manifest.webmanifest           Install manifest
sw.js                          Service worker (offline support) - must stay in the project root
robots.txt  sitemap.xml        Search engine files
vercel.json                    Response headers
pages/
  cgpa-calculator.html         Calculator and target planner
  dashboard.html               Overview and CGPA progression chart
  academic-records.html        Progress rings and per-year tables
  transcripts.html             Transcript preview, PDF, print
assets/
  css/
    app.css                    Landing page styles
    pages.css                  App styles (sidebar, cards, dialogs, print)
    page-simple.css            Privacy, Terms, Contact and 404 pages
  icons/                       Favicon, app icons and the social share image
  js/
    shell.js                   Sidebar, "Your data" menu, theme toggle, mobile menu
    theme.js                   Applies the saved theme before first paint (loaded in <head>)
    simple.js                  Theme toggle and offline support for Privacy, Terms, Contact, 404
    functions.js               Calculator page
    dashboard.js               Dashboard page
    transcripts.js             Transcript page
    landing.js                 Landing page
    modules/records.js         Academic records page
    core/
      calc.js                  Grading engine (pure functions, no DOM)
      storage.js               localStorage, validation, backup import/export
      transcript.js            Transcript model shared by preview, print and PDF
      transcript-pdf.js        PDF renderer (jsPDF)
      charts.js                SVG line chart
      ui.js                    Toast and dialog helpers
      html.js                  HTML escaping
      pwa.js                   Service worker registration
      theme-toggle.js          Light/dark toggle shared by every page
```

## How it works

All grading logic lives in `assets/js/core/calc.js` as pure functions, so it is easy to read and check.

| Scale | Grade points | First Class | Second Upper | Second Lower | Third Class | Pass |
| ----- | ------------ | ----------- | ------------ | ------------ | ----------- | ---- |
| 5.0   | A=5 B=4 C=3 D=2 E=1 F=0 | 4.50+ | 3.50+ | 2.40+ | 1.50+ | 1.00+ |
| 4.0   | A=4 B=3 C=2 D=1 F=0     | 3.50+ | 3.00+ | 2.50+ | 2.00+ | 1.00+ |

Universities differ in scales and cutoffs. If yours does, change the tables at the top of `calc.js`.

Rules worth knowing:

- A course counts only when it has both a unit (1 to 6) and a valid grade for the current scale. Incomplete rows are flagged, not silently counted.
- "Total units" counts every graded course (attempted). "Units earned" excludes grades worth 0 points, and is what degree progress uses.
- CGPA and GPA are rounded to 2 decimal places, and the class of degree is decided from the rounded value shown on screen.

Saved data is a single JSON object in `localStorage` under the key `unicalc:v1` (scale, name, matric number, years of semesters with course code, unit and grade, planner inputs). Everything read back from storage is validated before use, so edited or corrupted data cannot break the app.

## Privacy

No accounts, no analytics, no cookies. Nothing you enter leaves your device. The app pages load icons from `unpkg.com` and the PDF libraries from `cdnjs.cloudflare.com`; those services can see your IP address when your browser fetches the files, but receive none of your data. See `privacy.html`.

## Browser support

Any current version of Chrome, Edge, Firefox or Safari (ES modules and `localStorage` required).

## Changing the domain

The live address (`https://unicalc-delta.vercel.app`) appears in the canonical and share tags of `index.html`, `contact.html`, `privacy.html` and `terms.html`, and in `sitemap.xml` and `robots.txt`. Search and replace it in those six files if the site moves to another address. `assets/icons/og-image.png` is the picture shown when a link is shared.

## Offline support

`sw.js` saves the app's own files on the first visit and serves them again when there is no connection. Our own files are fetched network-first, so you always get the latest version when online. If you add or remove files, update the `PRECACHE` list in `sw.js` and bump `CACHE_VERSION`.

## Contributing

Ideas, bug reports and pull requests are welcome. For a quick question or feedback, use the contact page (`contact.html`); both founders read every message.

If you change the code:

- Keep it dependency-free: plain HTML, CSS and JavaScript, no build step.
- Open the project through a local web server (see "Run it locally") so the modules load.
- If you add or remove a page, script or stylesheet, update the `PRECACHE` list in `sw.js` and bump `CACHE_VERSION`, so offline mode stays correct.
- Don't commit backup files exported from the app. They contain personal details, and `.gitignore` already skips them.

## License

Released under the [MIT License](LICENSE). Copyright (c) 2026 Muhammed Fawwas Suleiman and David Adewole.

## Acknowledgements

- The icon shapes on the home and contact pages follow the [Feather](https://feathericons.com) icon set (MIT, Cole Bemis).
- The app pages load Ionicons (MIT) and jsPDF with jsPDF-AutoTable (MIT) from public CDNs at run time. They are not included in this repository.

## Credits

Developed by Rava Tech and Bhig Dave.