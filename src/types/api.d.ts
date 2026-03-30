// src/types/api.d.ts

interface NominatimSchema {
  osm_id: number;
  lat: string;
  lon: string;
  addresstype: string;
  display_name: string;
  [key: string]: unknown;
}

interface BaiduReverseSchema {
  location: { lng: number; lat: number };
  formatted_address: string;
  addressComponent: { adcode: string; [key: string]: unknown };
  [key: string]: unknown;
}

interface BaiduSearchSchema {
  name: string;
  location: { lat: number; lng: number };
  uid: string;
  tag: string;
  address: string;
  [key: string]: unknown;
}

/** The equinox/solstice object returned from server. */
interface EqxSolSchema {
  /** Year. 0 is 1 BCE. */
  year: number;
  /** The time zone ID returned from server. */
  tz: string;
  /** `[year, month, day, hours, minutes, seconds]` */
  results: number[];
}

/** The information returned from server when querying diagram. */
type InfoProps = RadecObj<number | null> & {
  /** (Unused) The standard offset from UT1 in decimal hours. */
  offset: number;
  /** (Unused) The equinox/solstice flag. */
  flag: Flag;
  /** The other calendar that differs from the query (`''`: Gregorian, `'j'`: Julian). */
  cal: '' | 'j';
  /** The star name. */
  name: string | null;
  /** The star's HIP number. */
  hip: string | null;
  /** (Unused) The equinox/solstice times. */
  eqxSolTime: number[];
};

/** The diagram object returned from server. */
type DiagramSchema = Omit<LocationObj<number>, 'id'> &
  DateObj<number> &
  InfoProps & {
    /** The diagram ID returned from server. */
    diagramId: string;
    /** The Base64 encoded SVG data returned from server. */
    svgData: string;
    /** The diagram annotation list returned from server. */
    annotations: AnnoItem[];
    [key: string]: unknown;
  }; // TODO: check types
