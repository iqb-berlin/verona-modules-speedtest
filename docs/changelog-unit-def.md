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
