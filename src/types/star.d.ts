// src/types/star.d.ts

/** The star input type. */
type StarInputType = import('./constants').StarInputType;
/** The RA/Dec input format. */
type RadecType = import('./constants').RadecType;

interface HipItem<T = number> {
  /** The star's HIP number. */
  hip: T;
  /** The star name. */
  name: string;
  /** The star name in Simplified Chinese. */
  name_zh: string;
  /** The star name in Traditional Chinese. */
  name_zh_hk: string;
  /** The star name Pinyin. */
  pinyin: string;
}

type StarItem = HipItem<string> & {
  display_name: string;
};

interface StarNameZhObj {
  /** The star name in Simplified Chinese. */
  zh: string;
  /** The star name in Traditional Chinese. */
  zhHK: string;
  /** The star name Pinyin. */
  pinyin: string;
}

/** The RA/Dec in decimal degrees. */
interface RadecObj<T = string> {
  /** The right ascension in decimal degrees (0 <= `ra` < 360). */
  ra: T;
  /** The declination in decimal degrees (-90 <= `dec` <= 90). */
  dec: T;
}

/** The right ascension in HMS (0 <= `ra` < 360). */
interface RaHmsObj {
  /** The hours component (>= 0). */
  hours: string;
  /** The minutes component (> 0). */
  minutes: string;
  /** The seconds component (> 0). */
  seconds: string;
}

interface SignedHmsObj {
  /** The sign of the hours (-1 or 1). */
  sign: number;
  /** The **absolute** hours component (>= 0, integer). */
  hours: number;
  /** The minutes component (> 0, integer). */
  minutes: number;
  /** The seconds component (> 0, integer or float). */
  seconds: number;
}

/** The declination in DMS (-90 <= `dec` <= 90). */
interface DecDmsObj {
  /** The **signed** degrees component. */
  degrees: string;
  /** The minutes component (> 0). */
  minutes: string;
  /** The seconds component (> 0). */
  seconds: string;
}

interface SignedDmsObj {
  /** The sign of the degrees (-1 or 1). */
  sign: number;
  /** The **absolute** degrees component (>= 0, integer). */
  degrees: number;
  /** The minutes component (> 0, integer). */
  minutes: number;
  /** The seconds component (> 0, integer or float). */
  seconds: number;
}

interface StarErrorObj {
  name: string;
  hip: string;
  ra: string;
  dec: string;
}

type StarNullErrorObj = StarErrorObj;

type StarInitialState = {
  /** The star/planet name. Defaults to `''`. */
  starName: string;
  /** The Chinese star name. Each value defaults to `''`. */
  starNameZh: StarNameZhObj;
  /** The star's HIP number. Defaults to `''`. */
  starHip: string;
  /** The RA/Dec in decimal degrees. */
  starRadec: RadecObj;
  /** The right ascension in HMS (0 <= `ra` < 360). */
  starRaHms: RaHmsObj;
  /** The declination in DMS (-90 <= `dec` <= 90). */
  starDecDms: DecDmsObj;
  /** The star input type. Defaults to `'name'`. */
  starInputType: StarInputType;
  /** The RA/Dec input format. Defaults to `'dms'`. */
  radecFormat: RadecType;
  /** Star name/HIP search term. Defaults to `''`. */
  searchTerm: string;
  /** Star name/HIP suggestion list. Defaults to `[]`. */
  suggestions: StarItem[];
  /** Displayed as helper text. */
  starError: StarErrorObj;
  /** Displayed as helper text. */
  starNullError: StarErrorObj;
  /** Defaults to `true`. */
  starValid: boolean;
};

type StarContextType = StarInitialState & {
  /** The HIP ident list. Initialized by `getInitialHipList`. */
  hipList: HipItem[] | null;
  /** Sets `hipList` and stores in `localStorage`. */
  setHipList: (data: HipItem[]) => void;
  /** Clears name, HIP, suggestions, RA/Dec and resets validity. */
  resetStarValues: () => void;
  starDispatch: ReactDispatch;
};
