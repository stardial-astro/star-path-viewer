/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
// src/types/global.d.ts

// declare module "@fontsource/*" {}
// declare module "@fontsource-variable/*" {}
// declare module "*.css";

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
  /* Google Analytics */
  dataLayer: any[];
  gtag: (...args: any[]) => void;
}

type ColorMode = 'light' | 'dark' | 'system';
type LangCode =
  | 'en'
  | 'en-US'
  | 'en-GB'
  | 'en-CA'
  | 'zh'
  | 'zh-CN'
  | 'zh-Hans'
  | 'zh-HK'
  | 'zh-TW'
  | 'zh-Hant';

interface LangObj {
  code: LangCode;
  label: string;
}

type ReactSetState<T = any> = React.Dispatch<React.SetStateAction<T>>;
type ReactDispatch<T = any> = React.Dispatch<Action<T>>;
type ReactRef<T = any> = React.RefObject<T>;
type ReactChangeEvent<T = HTMLInputElement, E = Element> = React.ChangeEvent<
  T,
  E
>;
type ReactSyntheticEvent<T = Element, E = Event> = React.SyntheticEvent<T, E>;
type ReactMouseEvent<T = HTMLElement, E = MouseEvent> = React.MouseEvent<T, E>;

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
