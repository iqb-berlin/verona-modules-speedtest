/* Tests common/services/unit-validation.ts, which both modules use. It lives here because Angular's
   karma builder only discovers spec files under a project's own src folder. */
import { Unit } from 'common/interfaces/unit';
import { UNIT_DEFINITION_TYPE, parseUnitDefinition } from 'common/services/unit-validation';

describe('parseUnitDefinition', () => {
  /* A minimal but complete unit. type and version are overridden per spec; buttonWidth is only
     possible in units written before 2.3.0. */
  function unitDefinition(overrides: Partial<Unit> & { buttonWidth?: number } = {}): string {
    return JSON.stringify({
      type: UNIT_DEFINITION_TYPE,
      version: '2.2.0',
      layout: 'column',
      questionType: 'text',
      answerType: 'text',
      questions: [{ text: 'Frage 1', answers: [{ text: 'richtig' }, { text: 'falsch' }] }],
      ...overrides
    });
  }

  it('accepts a unit of the expected type and version', () => {
    const result = parseUnitDefinition(unitDefinition(), '2');

    expect(result.error).toBeUndefined();
    expect(result.unit?.questions.length).toBe(1);
  });

  it('rejects a definition that is not valid JSON', () => {
    const result = parseUnitDefinition('{ not json', '2');

    expect(result.error).toBe('invalid-json');
    expect(result.unit).toBeUndefined();
  });

  it('rejects a definition that is valid JSON but not an object', () => {
    expect(parseUnitDefinition('"a string"', '2').error).toBe('invalid-json');
    expect(parseUnitDefinition('null', '2').error).toBe('invalid-json');
  });

  it('rejects a unit belonging to another module', () => {
    const result = parseUnitDefinition(unitDefinition({ type: 'aspect-unit-definition' }), '2');

    expect(result.error).toBe('wrong-type');
    expect(result.unit).toBeUndefined();
  });

  it('rejects a unit without a version instead of throwing', () => {
    const result = parseUnitDefinition(JSON.stringify({ type: UNIT_DEFINITION_TYPE }), '2');

    expect(result.error).toBe('missing-version');
  });

  it('rejects a unit of a different major version', () => {
    expect(parseUnitDefinition(unitDefinition({ version: '1.1.0' }), '2').error).toBe('incompatible-version');
    expect(parseUnitDefinition(unitDefinition({ version: '3.0.0' }), '2').error).toBe('incompatible-version');
  });

  it('accepts any minor or patch version of the expected major', () => {
    expect(parseUnitDefinition(unitDefinition({ version: '2.0.0' }), '2').error).toBeUndefined();
    expect(parseUnitDefinition(unitDefinition({ version: '2.9.9' }), '2').error).toBeUndefined();
  });

  /* Remove together with the compatibility block in unit-validation.ts. */
  describe('units written before 2.2.0', () => {
    it('accepts the misspelled type', () => {
      const result = parseUnitDefinition(unitDefinition({ type: 'speedtest-unit-defintion' }), '2');

      expect(result.error).toBeUndefined();
    });

    it('rewrites the misspelled type to the canonical one', () => {
      const result = parseUnitDefinition(unitDefinition({ type: 'speedtest-unit-defintion' }), '2');

      expect(result.unit?.type).toBe(UNIT_DEFINITION_TYPE);
    });

    it('leaves the rest of the unit untouched', () => {
      const result = parseUnitDefinition(
        unitDefinition({ type: 'speedtest-unit-defintion', instructionText: 'Kreuze an' }), '2'
      );

      expect(result.unit?.instructionText).toBe('Kreuze an');
      expect(result.unit?.questions[0].text).toBe('Frage 1');
    });
  });

  /* Remove together with the compatibility block in unit-validation.ts. */
  describe('units written before 2.3.0', () => {
    it('drops the button width', () => {
      const result = parseUnitDefinition(unitDefinition({ version: '2.2.0', buttonWidth: 350 }), '2');

      expect(result.error).toBeUndefined();
      expect(Object.keys(result.unit ?? {})).not.toContain('buttonWidth');
    });

    it('keeps the other styling settings', () => {
      const result = parseUnitDefinition(
        unitDefinition({ version: '2.2.0', buttonWidth: 350, buttonColor: '#ff0000' }), '2'
      );

      expect(result.unit?.buttonColor).toBe('#ff0000');
    });
  });
});
