// src/context/HomeContext.jsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useCallback, use } from 'react';

/** @type {React.Context<*>} */
const HomeContext = createContext(null);

/**
 * Provides the home context to its children components.
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
export const HomeProvider = ({ children }) => {
  const [isDelayedOnline, setIsDelayedOnline] = useState(navigator.onLine);
  const [offlineState, setOfflineState] = useState({
    dialogOpen: !navigator.onLine,
    dismissed: false,
  });
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState({});
  const [diagramId, setDiagramId] = useState('');
  const [svgData, setSvgData] = useState('');
  const [anno, setAnno] = useState([]);
  const [info, setInfo] = useState({});

  /**
   * Clears `diagramId`, `svgData`, `anno`, and `info`.
   * @type {() => void}
   */
  const clearImage = useCallback(() => {
    setDiagramId('');
    setSvgData('');
    setAnno([]);
    setInfo({});
  }, []);

  return (
    <HomeContext
      value={{
        isDelayedOnline,
        setIsDelayedOnline,
        offlineState,
        setOfflineState,
        success,
        setSuccess,
        errorMessage,
        setErrorMessage,
        diagramId,
        setDiagramId,
        svgData,
        setSvgData,
        anno,
        setAnno,
        info,
        setInfo,
        clearImage,
      }}
    >
      {children}
    </HomeContext>
  );
};

/**
 * Custom hook to use the HomeContext.
 * Ensures the hook is used within an HomeProvider.
 * @returns {HomeContextType} The home context value.
 * @throws {Error} If used outside of an HomeProvider.
 */
export const useHome = () => {
  const context = use(HomeContext);
  if (!context) {
    throw new Error('useHome must be used within an HomeProvider');
  }
  return context;
};
