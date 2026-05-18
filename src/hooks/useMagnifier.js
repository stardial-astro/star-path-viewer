// src/hooks/useMagnifier.js
import { useEffect, useCallback, useRef } from 'react';

/**
 * Listens for the `Alt` key down/up. Calculates the image size and sets the loupe style.
 * @param {object} params
 * @param {boolean} [params.enabled=true] - Defaults to `true`.
 * @param {number} [params.zoom=3] - Magnification. Defaults to 3.
 * @param {number} [params.loupeSize=300] - Diameter (px). Defaults to 300.
 */
const useMagnifier = ({ enabled = true, zoom = 3, loupeSize = 300 }) => {
  /** @type {ReactRef<HTMLDivElement | null>} */
  const loupeRef = useRef(null);
  /** @type {ReactRef<HTMLDivElement | null>} */
  const loupeInnerRef = useRef(null);
  const keyHeldRef = useRef(false);
  /** @type {ReactRef<{ x: number, y: number, rect: DOMRect | null }>} */
  const lastMousePosRef = useRef({ x: 0, y: 0, rect: null });

  /** @type {(x: number, y: number, rect: DOMRect) => void} */
  const renderLoupe = useCallback(
    (x, y, rect) => {
      if (!loupeRef.current || !loupeInnerRef.current) return;

      const svgElement = document
        .getElementById('svg-container')
        ?.querySelector('svg');
      if (!svgElement) return;

      const svgWidth = svgElement.width.baseVal.value;
      const svgHeight = svgElement.height.baseVal.value;
      const r = loupeSize / 2;

      /* Points the mouse at the center */
      loupeRef.current.style.display = 'block';
      loupeRef.current.style.left = `${x - r}px`;
      loupeRef.current.style.top = `${y - r}px`;

      /* Calculates the transformation of the SVG copy */
      const scaleX = svgWidth / rect.width;
      const scaleY = svgHeight / rect.height;
      const tx = r - x * scaleX * zoom;
      const ty = r - y * scaleY * zoom;

      loupeInnerRef.current.style.transform = `translate(${tx}px, ${ty}px) scale(${zoom})`;
      loupeInnerRef.current.style.width = `${svgWidth}px`;
      loupeInnerRef.current.style.height = `${svgHeight}px`;
    },
    [zoom, loupeSize],
  );

  /* Listen for the Alt key down/up (macOS Option / Win Alt) */
  useEffect(() => {
    if (!enabled) return;
    /* Render the loupe immediately */
    /** @param {KeyboardEvent} e */
    const onDown = (e) => {
      if (e.key === 'Alt') {
        keyHeldRef.current = true;
        const { x, y, rect } = lastMousePosRef.current;
        if (rect) renderLoupe(x, y, rect);
      }
    };
    /** @param {KeyboardEvent} e */
    const onUp = (e) => {
      if (e.key === 'Alt') {
        keyHeldRef.current = false;
        if (loupeRef.current) loupeRef.current.style.display = 'none';
      }
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [enabled, renderLoupe]);

  const handleMouseMove = useCallback(
    /** @param {ReactMouseEvent} e */
    (e) => {
      if (!enabled) return;
      /* Update mouse position */
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      lastMousePosRef.current = { x, y, rect };

      if (!e.altKey) {
        /* Reset to false in case not resetting in onUp() due to lost 'keyup' */
        keyHeldRef.current = false;
        if (loupeRef.current) loupeRef.current.style.display = 'none';
        return;
      }

      /* Even 'keydown' is blocked, e.altKey will be true if Alt is held down */
      renderLoupe(x, y, rect);
    },
    [enabled, renderLoupe],
  );

  const handleMouseLeave = useCallback(() => {
    if (!enabled) return;
    if (loupeRef.current) loupeRef.current.style.display = 'none';
    /* Clear mouse position */
    lastMousePosRef.current = { x: 0, y: 0, rect: null };
  }, [enabled]);

  return {
    loupeRef,
    loupeInnerRef,
    handleMouseMove,
    handleMouseLeave,
  };
};

export default useMagnifier;
