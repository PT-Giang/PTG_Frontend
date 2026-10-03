# Study workflow output plan

App root: P:/DATN/Frontend. Extend the existing Thea application, preserving /, /login, /register and /forgot-password. User authorized local functionality before later AI integration.

Observed source pathname families become dynamic application routes for locally created material IDs. Source account IDs and session query parameters are not copied.

| Source | Local route | Component namespace |
| --- | --- | --- |
| /study/{id} | /study/[id] | study-29adad87 |
| /memorize/{id}/list, /flashcards, /games | /memorize/[id]/[mode] | memorize-121927a4 |
| /test/{id} | /test/[id] | test-e8eca392 |
| /smartStudy/{id} | /smartStudy/[id] | smartStudy-2cee7095 |
| /studyGuides/{id} | /studyGuides/[id] | studyGuides-943a9720 |
| /summaries/{id} | /summaries/[id] | shared study guide view |

Each namespace is beneath src/components/sites/www-thea-study-18140289. Research uses matching docs/research paths. Shared data contracts/services are src/study; shared existing HomeHeader/HomeFooter/font/icons are reused. New sidebar SVGs reside public/sites/www-thea-study-18140289/study-29adad87. Global theme remains intact. Home create/open actions gain real study navigation; no visual rewrite.

Local documents, terms, progress and quiz history persist per material. Home metadata keeps existing storage key. Content service extracts text/definition pairs and returns source excerpts; it does not claim to run AI. No remote uploads, source user documents, identities, or account operations are copied. Invalid IDs show a recoverable empty state.

Screenshots were inspected inline through browser MCP at 1440 and 390; browser API does not offer documented screenshot file export. No nonexistent screenshot paths claimed. Quiz generated/results and matching-game behavior are local implementations because inspecting those source states would mutate account content/progress. These are fidelity limitations.
