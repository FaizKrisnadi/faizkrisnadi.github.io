# Website source

The approved redesign is maintained here. Run `node scripts/build-redesign.mjs` from the repository root after editing the template, stylesheet, script, or illustrations.

The generator writes the six root HTML pages and the corresponding `assets/redesign/` code. Each page has its own initial visible content, title, description, and canonical URL, and remains readable without JavaScript. Navigation uses the established `.html` URLs. Prototype hash routes remain supported for previously shared links. The CV chooser links to the existing academic `faiz-cv.pdf` and the separately preserved `faiz-professional-cv.pdf`.

The `_site-source` directory is source-only: GitHub Pages/Jekyll does not publish underscore-prefixed source directories. Keep the generated output committed because this repository uses the standard GitHub Pages branch build, not a separate Node build workflow.

## Previous design

The last pre-redesign live version is preserved at commit `9a33e69e9b88e5c2b1d15bbb53921e3284611333`, on branch `archive/pre-redesign-2026-10-18` in the same repository. An independent source ZIP and screenshots are also held in the task workspace under `work/site-backups/2026-10-18-9a33e69/`.

To roll back a deployed redesign, revert its deployment commit in a new commit and push normally; do not force-reset shared history. Existing thesis materials, legacy assets, and the academic CV were deliberately retained.
