// src/types/input.d.ts

/** The query parameters. */
type ParamObj = Omit<LocationObj, 'id' | 'tz'> &
  DateObj & {
    /** The time zone ID. */
    tz?: string;
    /** The calendar (`''`: Gregorian, `'j'`: Julian). */
    cal: Cal;
    /** (Unused) The equinox/solstice flag. */
    flag: Flag;
    /** The planet name in lowercase. */
    name?: string;
    /** The star's HIP number. */
    hip?: string;
    /** The right ascension in decimal degrees (0 <= `ra` < 360). */
    ra?: string;
    /** The declination in decimal degrees (-90 <= `dec` <= 90). */
    dec?: string;
  };
