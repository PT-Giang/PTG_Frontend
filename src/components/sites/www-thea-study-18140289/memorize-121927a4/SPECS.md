# Local subcomponents

TermList: semantic searchable list, inline editor with required term and definition, add/edit/delete preserving IDs and levels. Explicit delete confirmation. Responsive two-column text rows collapse below 800px. Uses inherited Thea tokens, rounded dawn panels and primary actions. No source private content.

MatchingGame: local adaptation, at most six shuffled term/definition pairs keyed by IDs, choose a term then definition; matched pairs disabled. Feedback and restart; no persistence because game state is transient. CSS two equal columns, long text wraps, mobile readable.

FlashcardDeck: extracted source dimensions and behavior from MemorizeView spec; keyboard arrows ignore text inputs, selects and editable content. Ratings require revealed answer and persist level 0 (wrong), 1 (uncertain), increment to max3 (known). Navigation itself does not change progress.
