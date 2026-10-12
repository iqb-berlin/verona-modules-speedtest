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
  return { unit: toCurrentForm(parsedUnit) };
}

/* --------------------------------------------------------------------------------------------
   Backwards compatibility. Delete this block at the next major unit definition version.

   Older units are still accepted and rewritten to the current form on load, so that every unit
   converges the next time it is saved:
   - Units written before 2.2.0 carry a misspelled type, which is rewritten to the canonical one.
   - Units written before 2.3.0 may carry buttonWidth, a fixed answer button width. It was replaced
     by answer buttons that are all as wide as the widest one, and is dropped.
   To remove: delete this block, replace the isSupportedType call above with
   `parsedUnit.type !== UNIT_DEFINITION_TYPE` and the toCurrentForm call with `parsedUnit`.
   -------------------------------------------------------------------------------------------- */

const LEGACY_UNIT_DEFINITION_TYPE = 'speedtest-unit-defintion';

type LegacyUnit = Unit & { buttonWidth?: number };

function isSupportedType(type: unknown): boolean {
  return type === UNIT_DEFINITION_TYPE || type === LEGACY_UNIT_DEFINITION_TYPE;
}

function toCurrentForm(unit: LegacyUnit): Unit {
  const { buttonWidth, ...current } = unit;
  return { ...current, type: UNIT_DEFINITION_TYPE };
}

/* ------------------------------------- end of compatibility --------------------------------- */
