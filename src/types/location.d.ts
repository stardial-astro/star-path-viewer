// src/types/location.d.ts

/** The geocoding service name. */
type GeoService = import('./constants').GeoService;
/** The location input type. */
type LocInputType = import('./constants').LocInputType;

/** The coordinates of a geographic position. */
interface CoordObj {
  latitude: number;
  longitude: number;
}

interface LocationObj<T = string> {
  /** Latitude (-90 <= `lat` <= 90). */
  lat: T;
  /** Longitude (-180 <= `lng` <= 180). */
  lng: T;
  /** Address ID (`''`: not found/no service; `'unknown-id'`: reverse geocoding failed). */
  id: string;
  /** The time zone ID. */
  tz: string;
}

type LocationCoordObj = Omit<LocationObj, 'id' | 'tz'>;

type LocationParamObj = LocationCoordObj & {
  /** The time zone ID. */
  tz?: string;
};

interface AddressItem {
  /** Latitude (-90 <= `lat` <= 90). */
  lat: string;
  /** Longitude (-180 <= `lng` <= 180). */
  lng: string;
  display_name: string;
  /** Address ID (`''`: not found/no service; `'unknown-id'`: reverse geocoding failed). */
  id: string;
  addresstype: string;
}

interface LocationErrorObj {
  address: string;
  lat: string;
  lng: string;
}

type LocationNullErrorObj = LocationErrorObj;

interface LocationInitialState {
  location: LocationObj;
  /** The location input type. Defaults to `'address'`. */
  locationInputType: LocInputType;
  /** Address search term. Defaults to `''`. */
  searchTerm: string;
  /** Address suggestion list. Defaults to `[]`. */
  suggestions: AddressItem[];
  /** Defaults to `false`. */
  serviceChecking: boolean;
  /** Defaults to `false`. */
  gpsLoading: boolean;
  /** Defaults to `false`. */
  suggestionsLoading: boolean;
  /** Displayed as helper text. */
  locationError: LocationErrorObj;
  /** Displayed as helper text. */
  locationNullError: LocationErrorObj;
  /** Defaults to `true`. */
  locationValid: boolean;
}

type LocationContextType = LocationInitialState & {
  /** The primary geocoding service name. Initialized by `getInitialService`. */
  geoService: GeoService | null;
  /**
   * Sets `geoService` and stores in `localStorage`.
   * - If `noLocal`, do not save to `localStorage` and clear existing value
   *   (defaults to `false`)
   */
  setGeoService: (service: GeoService | null, noLocal?: boolean) => void;
  /**
   * The CN reverse geocoding service name.
   * Initially sets to `'Tianditu'` or from `VITE_REVERSE_SERVICE_CN`.
   */
  reverseGeoServiceCn: GeoService;
  setReverseGeoServiceCn: ReactSetState<GeoService>;
  /** If `true`, skips fetching tz using API. Defaults to `false`. */
  skipTz: boolean;
  setSkipTz: ReactSetState<boolean>;
  locationInputTypeRef: ReactRef<LocInputType>;
  /** Clears location and suggestions. */
  resetLocationValues: () => void;
  locationDispatch: ReactDispatch;
};
