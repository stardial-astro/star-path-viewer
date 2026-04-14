// src/types/date.d.ts

/** The equinox/solstice flag. */
type Flag = import('./constants').Flag;
/** The calendar (`''`: Gregorian, `'j'`: Julian). */
type Cal = import('./constants').Cal;

interface DateObj<T = string> {
  /** Year. 0 is 1 BCE. */
  year: T;
  /** Month. Starts from 1 (January). */
  month: T;
  /** Day of the month. */
  day: T;
}

type DateParamObj = DateObj & {
  /** The calendar (`''`: Gregorian, `'j'`: Julian). */
  cal: Cal;
  /** (Unused) The equinox/solstice flag. */
  flag: Flag;
};

type DatetimeObj = DateObj<number> & {
  /** Hours in 24-hour format. */
  hour?: number;
  /** Minutes. */
  minute?: number;
  /** Seconds (integer or float). */
  second?: number;
};

interface DatetimeStrObj {
  /** The formatted date containing year, month, and day of the month components. */
  date: string;
  /** The formatted time containing hour, minute, and second components. */
  time: string;
  /** The year in the format `'YYYY CE/BCE'`. */
  year?: string;
}

interface DateErrorObj {
  general: string;
  year: string;
  month: string;
  day: string;
}

type DateNullErrorObj = Omit<DateErrorObj, 'general'>;

interface DateParams {
  /** The first available month. Defaults to 1. */
  monthMin: number;
  /** The last available month. Defaults to 12. */
  monthMax: number;
  /** The first available day of the month. Defaults to 1. */
  dayMin: number;
  /** The last available day of the month. Defaults to 31. */
  dayMax: number;
}

interface DateInitialState {
  date: DateObj;
  /** The equinox/solstice flag. Defaults to `''`. */
  flag: Flag;
  /** The calendar (`''`: Gregorian, `'j'`: Julian). Defaults to `''`. */
  cal: Cal;
  /** Defaults to `false`. */
  dateFetching: boolean;
  /** Displayed as helper text. */
  dateError: DateErrorObj;
  /** Displayed as helper text. */
  dateNullError: DateNullErrorObj;
  /** Defaults to `true`. */
  dateValid: boolean;
}

type DateContextType = DateInitialState & {
  /** Defaults to `''`. */
  flagRef: ReactRef<Flag>;
  dateDispatch: ReactDispatch;
};
