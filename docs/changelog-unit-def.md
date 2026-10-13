## 1.0.0
- Changed globalLayout to layout and removed undefined as possible value
- Removed layout from individual questions

## 1.1.0
- Add correct answer index. This can be used to calculate right/wrong answer count for the results.

## 2.1.0
- Add new optional property: buttonWidth

## 2.2.0
- Fix the spelling of the type property: `speedtest-unit-defintion` becomes `speedtest-unit-definition`.
  Editor and player still accept the old spelling and rewrite it on load, so units of earlier 2.x
  versions keep working and adopt the new value the next time they are saved. The compatibility
  layer is removed with the next major version.

## 2.3.0
- Remove the optional property `buttonWidth`. Answer buttons are now all as wide as the widest one, which makes a fixed width unnecessary. Editor and player drop the property when loading an older unit, so such units keep working and lose it the next time they are saved.

## 2.4.0
- Add the optional property `latex`. When set, `$…$` in question and answer texts is rendered as LaTeX.
- Add the optional property `outroText`, the text shown after the last question. Without it, or when it is empty, the player shows its previous fixed text, "Keine weiteren Seiten. Weiterleitung zur nächsten Unit...".
