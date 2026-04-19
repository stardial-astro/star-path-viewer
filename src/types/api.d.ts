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

interface TiandituReverseSchema {
  formatted_address: string;
  location: { lon: number; lat: number };
  addressComponent: { town_code: string; [key: string]: unknown };
  [key: string]: unknown;
}

/** The equinox/solstice object returned from server. */
interface EqxSolSchema {
  /** Year. 0 is 1 BCE. */
  year: number;
  /** The time zone ID returned from server. */
  tz: string;
  /** The time zone name returned from server. */
  tzname?: string;
  /** `[year, month, day, hours, minutes, seconds]` */
  results: number[];
}

interface DateCCItemSchema {
  reign: string;
  date: string;
  sexagenary: {
    year: string;
    month: string;
    day: string;
  };
  meta: {
    period: string | null;
    chinese_calendar: string | null;
    western_calendar: string | null;
    /** Julian day number (JDN) */
    jdn: number | null;
    shengxiao: string | null;
  };
  formatted: string;
}

/** The Chinese calendar date object returned from server. */
interface DateCCSchema {
  /** The date object in Simplified Chinese. */
  zh: DateCCItemSchema | null;
  /** The date object in Traditional Chinese. */
  zhHK: DateCCItemSchema | null;
}

/** The information returned from server when querying diagram. */
type InfoProps = RadecObj<number | null> & {
  /** The time zone name. */
  tzname?: string;
  /** The Standard Time offset in decimal hours. */
  offset: number;
  /** (Unused) The equinox/solstice flag. */
  flag: Flag;
  /** The other calendar that differs from the query (`''`: Gregorian, `'j'`: Julian). */
  cal: '' | 'j';
  /** The star name in lowercase. */
  name: string | null;
  /** The star's HIP number. */
  hip: string | null;
  /** (Unused) The equinox/solstice times. */
  eqxSolTime: number[];
  /** The Chinese calendar date object. */
  date_cc?: DateCCSchema;
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
  };
