# Team Functioning Assessment

A privacy-first, research-informed static team assessment designed for GitHub Pages.

## Features

- 28-item assessment across eight team-functioning dimensions plus four outcome indicators.
- Client-side scoring only.
- Anonymous JSON export containing dimension/outcome scores, not raw item responses.
- Local aggregation of multiple team-member exports.
- Team means and respondent standard deviations.
- CSV export.
- Predefined LLM-analysis prompts that are copied to the clipboard; the site itself sends no data to an LLM.
- No cookies, analytics, localStorage, IndexedDB, service worker, external JavaScript, or application network requests.

## Research basis

The diagnostic synthesizes constructs from:

1. Wageman, Hackman & Lehman (2005), *Team Diagnostic Survey: Development of an Instrument*. https://doi.org/10.1177/0021886305281984
2. Salas, Sims & Burke (2005), *Is There a “Big Five” in Teamwork?* https://doi.org/10.1177/1046496405277134
3. Edmondson (1999), *Psychological Safety and Learning Behavior in Work Teams*. https://doi.org/10.2307/2666999
4. Hoegl & Gemuenden (2001), *Teamwork Quality and the Success of Innovative Projects*. https://doi.org/10.1287/orsc.12.4.435.10635
5. Mathieu, Maynard, Rapp & Gilson (2008), *Team Effectiveness 1997–2007*. https://doi.org/10.1177/0149206308316061

### Psychometric caveat

The constructs are research-grounded, but the wording is original/adapted. This exact instrument has not been separately validated or normed. Treat it as a development diagnostic, not a standardized psychological test, personnel-selection instrument, or population benchmark.

## Privacy architecture

Responses remain in JavaScript memory until refresh/close unless the user explicitly exports them. The Content Security Policy includes `connect-src 'none'`.

GitHub may log ordinary HTTP request metadata while serving GitHub Pages; the application code does not transmit assessment responses.

## Deployment

The repository includes a GitHub Pages workflow. Pushes to `main` deploy the repository root as a static site.

## License

Application code is MIT licensed. Academic works referenced above retain their respective copyrights.