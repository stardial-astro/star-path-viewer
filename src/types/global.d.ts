/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
// src/types/global.d.ts

declare const __APP_NAME__: string;
declare const __APP_DESCRIPTION__: string;

interface Window {
  /* public/js/geotz.js */
  GeoTZ: {
    find: (lat: any, lon: any) => Promise<any>;
    init: (
      geoDataSource?: string,
      tzDataSource?: string,
    ) => {
      find: (lat: any, lon: any) => Promise<any>;
    };
  };
}

type ColorMode = 'light' | 'dark' | 'system';

type ReactSetState<T = any> = React.Dispatch<React.SetStateAction<T>>;
type ReactDispatch<T = any> = React.Dispatch<Action<T>>;
type ReactRef<T = any> = React.RefObject<T>;
type ReactChangeEvent = React.ChangeEvent<any>;
type ReactSyntheticEvent = React.SyntheticEvent<Element, Event>;
type ReactMouseEvent = React.MouseEvent<HTMLElement, MouseEvent>;

// type Action<T = never> = T extends never
//   ? { type: string }
//   : { type: string; payload: T };

interface Action<T = any> {
  type: string;
  payload?: T;
}

type NumberEventDetails =
  import('@base-ui/react/number-field').NumberField.Root.ChangeEventDetails;

interface ChangeEvent {
  target: {
    name: string;
    value: string;
  };
}
