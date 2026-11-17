# LingoLoco

A playful, single-page language-learning experience. The player follows a path of short lessons, earning XP, streaks and hearts along the way, with a parrot named Pip providing running commentary.

## Language

**Node**:
One position on the learning path, identified by its index and carrying its own label, icon and estimated minutes. Nodes unlock in order.
_Avoid_: Lesson, step, level

**Lesson**:
One run through a node's question set, ending either in completion or in losing all three hearts.
_Avoid_: Node, quiz

**Question set**:
The questions a given language offers on a given node, identified by the pair (language, node). Currently three questions long.
_Avoid_: Quiz, bank, deck

**Fallback bank**:
The shared question set a language plays on every node until it has authored question sets of its own.
_Avoid_: Default quiz, generic questions

**Path**:
The ordered sequence of eight nodes that makes up the one unit currently on offer.
_Avoid_: Course, track, curriculum
