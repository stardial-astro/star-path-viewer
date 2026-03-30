// src/types/home.d.ts

interface ErrorObj {
  server?: string;
  location?: string;
  date?: string;
  star?: string;
  draw?: string;
  download?: string;
}

interface OfflineStateObj {
  /** `true` means the offline dialog is open. */
  dialogOpen: boolean;
  /** `true` means the offline dialog was open but dismissed. */
  dismissed: boolean;
}

interface HomeContextType {
  /** For queries */
  isDelayedOnline: boolean;
  setIsDelayedOnline: ReactSetState<boolean>;
  /** For the offline dialog */
  offlineState: OfflineStateObj;
  setOfflineState: ReactSetState<OfflineStateObj>;
  /** Plot status. Defaults to `false`. */
  success: boolean;
  setSuccess: ReactSetState<boolean>;
  /** Displayed under a section. Defaults to `{}`. */
  errorMessage: ErrorObj;
  setErrorMessage: ReactSetState<ErrorObj>;
  /** The diagram ID for display. Defaults to `''`. */
  diagramId: string;
  setDiagramId: ReactSetState<string>;
  /** The sanitized SVG data for display. Defaults to `''`. */
  svgData: string;
  setSvgData: ReactSetState<string>;
  /** The diagram annotation list for display. Defaults to `[]`. */
  anno: AnnoItem[];
  setAnno: ReactSetState<AnnoItem[]>;
  /** The information for display. Defaults to `{}`. */
  info: InfoObj;
  setInfo: ReactSetState<InfoObj>;
  /** Clears `diagramId`, `svgData`, `anno`, and `info`. */
  clearImage: () => void;
}
