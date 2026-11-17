# Per-node question sets for Spanish

## Problem Statement

A player picks Spanish, starts the path, and is asked which word means hello. They finish the lesson, the next node unlocks, and it asks the same three questions. So does the one after that.

The path advertises eight lessons, each with its own label, icon and estimated minutes, but every node runs the same fallback bank. After the first lesson the Spanish path has nothing new in it, and the progress bar is counting repetitions rather than learning.

## Solution

Author real question sets for Spanish — one per node, matching that node's theme. A player working through the Spanish path gets 24 questions that build from greetings through to small talk, and each node is visibly its own lesson.

The other seven languages keep playing their existing fallback bank exactly as today. They are not shown node titles their content cannot honour, so nothing on the site promises more than it delivers.

## User Stories

1. As a Spanish learner, I want the first node to teach greetings and introducing myself, so that I come away able to say something real.
2. As a Spanish learner, I want the café node to teach ordering, please, thank you and asking for the bill, so that I could survive a real café.
3. As a Spanish learner, I want the "polite chaos" node to teach apologies, excuse me and responding to a sneeze, so that I can be polite in awkward moments.
4. As a Spanish learner, I want the numbers node to teach numbers 1–5, prices and order quantities, so that I can order two of something.
5. As a Spanish learner, I want the directions node to teach asking where something is and understanding left, right and straight on, so that I can find a bathroom or a station.
6. As a Spanish learner, I want the "make a friend" node to teach introductions, "mucho gusto" and asking where someone is from, so that I can start a conversation.
7. As a Spanish learner, I want the dessert node to teach asking for something, asking for it without something, and asking for the check, so that I can negotiate my own pudding.
8. As a Spanish learner, I want the small-talk node to teach "¿qué tal?", a little weather and a goodbye, so that I can end a conversation gracefully.
9. As a Spanish learner, I want every node's three questions to be different from every other node's, so that progress means new material rather than repetition.
10. As a Spanish learner, I want the wrong answers on each question to stay funny but clearly wrong, so that the joke never makes the correct answer ambiguous.
11. As a Spanish learner, I want each question to keep its "hear it" button, so that I can hear the phrase in Spanish before answering.
12. As a Spanish learner, I want a wrong answer to show me the correct phrase and explain it, so that a mistake still teaches me something.
13. As a Spanish learner, I want the lesson header to name the node I am playing, so that I know which of the eight lessons this is.
14. As a Spanish learner, I want to replay a finished node and get that node's own questions again, so that review is a review of the right material.
15. As a learner in any other language, I want all eight nodes to keep working exactly as they do today, so that nothing in my experience breaks.
16. As a learner in any other language, I want the lesson header not to name a node theme my questions do not match, so that the interface never lies to me.
17. As a learner with saved progress, I want my streak, XP and completed nodes untouched by this change, so that I do not lose my place.
18. As a learner on a phone, I want longer Spanish answers to fit their buttons at narrow widths, so that I can still tap the right one.
19. As a screen-reader user, I want the lesson heading to reflect the current question and node, so that I can tell where I am.
20. As a player who runs out of hearts, I want "try again" to bring back the same node's questions, so that failure does not shuffle me into different material.
21. As a developer, I want one command that verifies the content is complete and well-formed, so that a missing node or a malformed question is caught before anyone opens a browser.
22. As a developer, I want the check to name the language, node and question at fault, so that fixing it is immediate.
23. As a developer, I want question content to live apart from behaviour, so that editing content cannot change how the lesson runs.
24. As a developer, I want the content change to leave the stored-state format alone, so that existing players are not migrated.

## Implementation Decisions

- Question content moves out of the behaviour script into a data-only module loaded before it. The same object is exposed to the browser and to Node, so the validator imports it rather than parsing source.
- Content shape: each language holds an optional map of node index → question set, plus its existing fallback bank. Resolution order is (language, node) set, then that language's fallback bank.
- Spanish gains eight question sets of three questions each. The seven other languages keep their current bank unchanged and gain no per-node sets in this pass.
- Question fields are unchanged: prompt, emoji, spoken phrase, options, correct answer, and the fact line. Questions keep exactly three options, so the A/B/C key hints and the answer layout stay as they are.
- The node label appears in the lesson header only when the resolved set is a per-node set. When the fallback bank is serving, the header keeps its current language-only form.
- The "hear it" button keeps using the current language's speech code. No per-node voice logic is added.
- Options continue to be shuffled per lesson, and the correct answer continues to be tracked by text rather than index, so shuffling cannot desync the right answer.
- No change to state shape, storage key, XP awards, hearts, streak rules or unlocking. Progress saved before this change remains valid.
- The validator is a standalone npm script. It is not part of the build and not a git hook.
- Validator contract: for every language declaring per-node sets, node indices 0 through 7 must each appear exactly once; each set must hold exactly three questions; each question must have a non-empty prompt, emoji, spoken phrase and fact, exactly three distinct options, and exactly one correct answer that is present in the options. Any node key outside 0–7 fails. Failures name the offending language, node and question.
- The hero, the path markup and the marketing copy are untouched.

## Testing Decisions

- A good test here asserts an externally observable promise — that a node plays that node's questions, and that malformed content is refused — not the internal shape of the content objects.
- There is one seam for this feature: the content module, exercised by `npm run check:content`. No new DOM harness and no test framework are introduced for it.
- The header rule and the rendering of a node label are not automated. They are verified by hand in the browser, at desktop width and at 320px, once for an authored language and once for a fallback language.
- There is no prior art: this is the repo's first automated check. It should stay dependency-free — plain Node, no runner, no new dev dependency.

## Out of Scope

- Per-node content for any language other than Spanish, including the flavoured Pirate and Klingon options.
- New nodes, a second unit, or an expanded path.
- Rebalancing XP awards, hearts, streaks or quests.
- Spaced repetition, question history, or adapting difficulty.
- Accounts, a backend, or analytics.
- Restyling the lesson modal beyond the header line.
- Wiring the validator into CI, the build, or a pre-commit hook.

## Further Notes

- Pirate and Klingon are deliberately comic languages and stay on the fallback bank. They are not candidates for authored sets.
- A Spanish player and a French player will see different lesson headers. That asymmetry is deliberate: the header only claims a theme when the content supports it.
- Node labels are kept as they are, jokes included. The authored content interprets them generously rather than renaming them.
- Storage remains `lingoloco:v1`. Content is not persisted, so the version does not change.
- Browser voices vary. A machine with no Spanish voice is a browser limitation, not a failure of this work.
