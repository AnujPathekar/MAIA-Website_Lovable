MAIA · Microsoft AI Accelerator: site files (27 November 2026)

PAGES
  index.html                 Landing page
  about.html                 About the programme (Frontier / Copilot / Security tabs)
  questionnaires.html        Choose an evaluation
  nominate.html              Nominate an account (posts to the same Power Automate flow as before)
  terms.html                 Terms of Use & Privacy Statement, version 1.2

  Track pages (introduce each track, link to its questionnaires)
  frontier.html  copilot.html  security.html

  Questionnaires: named <track>-<type>.html
  frontier-executive.html    (was executive.html)
  frontier-technical.html    (was technical.html)
  copilot-general.html       (was copilot.html, which is now the Copilot track page)
  security-executive.html
  security-technical.html

  The questionnaire engines, Power Automate URLs, payloads and saved-progress (localStorage) keys are
  unchanged. Answers saved in a browser before the rename are still found.

INVITATION LINKS ALREADY SENT
  legacy-redirects/executive.html and legacy-redirects/technical.html forward to the new names and keep
  ?project= / ?invite= / ?company= / ?domain=. Copy both to the site root (next to index.html) if any
  invitation already uses executive.html or technical.html.
  WARNING: an old link to copilot.html now opens the Copilot track page, which has a button to the
  questionnaire. It no longer opens the questionnaire directly.

Every page carries the invitation parameters on its internal links. The Home link becomes
index.html?invite=...#home. The query must come before the #, otherwise index.html redirects to the
questionnaires page.
