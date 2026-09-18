/* Tests live in editor/src/app/services/unit-validation.spec.ts: Angular's karma builder only picks
   up spec files under a project's own src folder, so a spec next to this file would never run. */
import { Unit } from 'common/interfaces/unit';

export const UNIT_DEFINITION_TYPE = 'speedtest-unit-definition';

export type UnitParseError = 'invalid-json' | 'wrong-type' | 'missing-version' | 'incompatible-version';

export type UnitParseResult =
  { unit: Unit, error?: undefined } |
  { unit?: undefined, error: UnitParseError };

/* Reads a stored unit definition and checks that this module can interpret it.
   expectedMajor is the major of the reading module's own unit definition version; a unit of any
   other major is rejected. The host is supposed to pair a unit with a matching module, so these
   checks are a diagnostic for when that goes wrong, not the primary contract. */
export function parseUnitDefinition(unitDefinition: string, expectedMajor: string): UnitParseResult {
  let parsedUnit: Unit;
  try {
    parsedUnit = JSON.parse(unitDefinition);
  } catch {
    return { error: 'invalid-json' };
  }
  if (typeof parsedUnit !== 'object' || parsedUnit === null) return { error: 'invalid-json' };
  if (!isSupportedType(parsedUnit.type)) return { error: 'wrong-type' };
  if (typeof parsedUnit.version !== 'string') return { error: 'missing-version' };
  if (parsedUnit.version.split('.')[0] !== expectedMajor) return { error: 'incompatible-version' };
  return { unit: toCanonicalType(parsedUnit) };
}

/* --------------------------------------------------------------------------------------------
   Backwards compatibility. Delete this block at the next major unit definition version.

   Units written before 2.2.0 carry a misspelled type. They are still accepted, and are rewritten
   to the canonical spelling on load so that every unit converges the next time it is saved.
   To remove: delete this block, replace the isSupportedType call above with
   `parsedUnit.type !== UNIT_DEFINITION_TYPE` and the toCanonicalType call with `parsedUnit`.
   -------------------------------------------------------------------------------------------- */

const LEGACY_UNIT_DEFINITION_TYPE = 'speedtest-unit-defintion';

function isSupportedType(type: unknown): boolean {
  return type === UNIT_DEFINITION_TYPE || type === LEGACY_UNIT_DEFINITION_TYPE;
}

function toCanonicalType(unit: Unit): Unit {
  return unit.type === UNIT_DEFINITION_TYPE ? unit : { ...unit, type: UNIT_DEFINITION_TYPE };
}

/* ------------------------------------- end of compatibility --------------------------------- */
