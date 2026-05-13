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

  /* Listen for the Alt key down/up (macOS Option / Win Alt) */
  useEffect(() => {
    if (!enabled) return;
    /** @param {KeyboardEvent} e */
    const onDown = (e) => {
      if (e.key === 'Alt') keyHeldRef.current = true;
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
  }, [enabled]);

  const handleMouseMove = useCallback(
    /** @param {ReactMouseEvent} e */
    (e) => {
      if (
        !enabled ||
        !keyHeldRef.current ||
        !loupeRef.current ||
        !loupeInnerRef.current
      ) {
        return;
      }
      const svgElement = document
        .getElementById('svg-container')
        ?.querySelector('svg');
      if (!svgElement) return;

      const svgWidth = svgElement.width.baseVal.value;
      const svgHeight = svgElement?.height.baseVal.value;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const r = loupeSize / 2;

      /* Points the mouse at the center */
      loupeRef.current.style.display = 'block';
      loupeRef.current.style.left = `${x - r}px`;
      loupeRef.current.style.top = `${y - r}px`;

      /* Calculates the transformation of the SVG copy */
      const scaleX = (svgWidth ?? rect.width) / rect.width;
      const scaleY = (svgHeight ?? rect.height) / rect.height;
      const tx = r - x * scaleX * zoom;
      const ty = r - y * scaleY * zoom;

      loupeInnerRef.current.style.transform = `translate(${tx}px, ${ty}px) scale(${zoom})`;
      loupeInnerRef.current.style.width = `${svgWidth}px`;
      loupeInnerRef.current.style.height = `${svgHeight}px`;
    },
    [enabled, zoom, loupeSize],
  );

  const handleMouseLeave = useCallback(() => {
    if (!enabled) return;
    if (loupeRef.current) loupeRef.current.style.display = 'none';
  }, [enabled]);

  return {
    loupeRef,
    loupeInnerRef,
    handleMouseMove,
    handleMouseLeave,
  };
};

export default useMagnifier;
