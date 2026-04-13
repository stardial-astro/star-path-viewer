// src/types/output.d.ts

type PtLabel = import('./constants').PtLabel;

type LineStyle = import('./constants').LineStyle;

/** The annotation item returned from server and for display. */
interface AnnoItem {
  /** The label of the point. */
  name: PtLabel;
  /** Display this item or not. */
  is_displayed: boolean;
  /** The altitude of this star at this time. */
  alt: number;
  /** The azimuth of this star at this time. */
  az: number;
  /** The Standard Time in Gregorian calendar. */
  time_standard: number[];
  /** The Standard Time in Julian calendar. */
  time_standard_julian: number[];
  /** The Local Mean Time (LMT) in Gregorian calendar. */
  time_local_mean: number[];
  /** The Local Mean Time (LMT) in Julian calendar. */
  time_local_mean_julian: number[];
  /** The Universal Time (UT1) in Gregorian calendar. */
  time_ut1: number[];
  /** The Universal Time (UT1) in Julian calendar. */
  time_ut1_julian: number[];
  /** The Standard Time offset in decimal hours. */
  time_zone: number;
}

interface PtDetail {
  [key: string]: object;
}

/** The information for display. */
type InfoObj = Omit<LocationObj<number>, 'id'> &
  InfoProps & {
    /** The Gregorian date for Display. */
    dateG: DateObj<number>;
    /** The Julian date for Display. */
    dateJ: DateObj<number>;
    /** The Chinese star names for Display. */
    nameZh?: StarNameZhObj;
    [key: string]: unknown;
  };

/** The diagram object for display. */
interface DiagramObj {
  /** The diagram ID for display. */
  diagramId: string;
  /** The information for display. */
  info: InfoObj;
  /** The sanitized SVG data for display. */
  svgData: string;
  /** The diagram annotation list for display. */
  anno: AnnoItem[];
}
