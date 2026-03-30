// src/types/constants.d.ts
import {
  SERVICES,
  CALS,
  LOC_INPUT_TYPES,
  STAR_INPUT_TYPES,
  RADEC_TYPES,
  EQX_SOL_NAMES,
  PT_DETAIL,
  LINE_DETAIL,
} from '@utils/constants';

export type GeoService = (typeof SERVICES)[keyof typeof SERVICES];

export type LocInputType =
  (typeof LOC_INPUT_TYPES)[keyof typeof LOC_INPUT_TYPES];

export type StarInputType =
  (typeof STAR_INPUT_TYPES)[keyof typeof STAR_INPUT_TYPES];

export type RadecType = (typeof RADEC_TYPES)[keyof typeof RADEC_TYPES];

export type Flag = '' | keyof typeof EQX_SOL_NAMES;

export type Cal = (typeof CALS)[keyof typeof CALS];

export type PtLabel = keyof typeof PT_DETAIL;

export type LineType = keyof typeof LINE_DETAIL;
