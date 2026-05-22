// src/hooks/useMagnifier.js
import { useEffect, useCallback, useRef } from 'react';

const borderWidth = 2;

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
  /** @type {ReactRef<{ svgEl: SVGSVGElement | null, svgWidth: number, svgHeight: number, scale: number }>} */
  const svgMetaRef = useRef({
    svgEl: null,
    svgWidth: 0,
    svgHeight: 0,
    scale: 1,
  });
  /** @type {ReactRef<{ x: number, y: number, svgX: number, svgY: number } | null>} */
  const lastMousePosRef = useRef(null);
  /** @type {ReactRef<{ clientX: number, clientY: number } | null>} */
  const globalMouseRef = useRef(null);

  const updateSvgMeta = useCallback(() => {
    if (!enabled) return;
    const svgEl = document
      .getElementById('svg-container')
      ?.querySelector('svg');
    if (!svgEl) return;
    const svgRect = svgEl.getBoundingClientRect();
    const svgWidth = svgEl.width.baseVal.value;
    const svgHeight = svgEl.height.baseVal.value;
    const scale = svgWidth / svgRect.width;
    svgMetaRef.current = { svgEl, svgWidth, svgHeight, scale };
  }, [enabled]);

  /** @type {(x: number, y: number, svgX: number, svgY: number) => void} */
  const renderLoupe = useCallback(
    (x, y, svgX, svgY) => {
      if (!loupeRef.current || !loupeInnerRef.current) return;
      const { svgEl, svgWidth, svgHeight, scale } = svgMetaRef.current;
      if (!svgEl) return;
      /* Points the mouse at the center */
      const r = loupeSize / 2;
      loupeRef.current.style.display = 'block';
      loupeRef.current.style.left = `${x - r - borderWidth}px`;
      loupeRef.current.style.top = `${y - r - borderWidth}px`;
      /* Calculates the transformation of the SVG copy */
      const tx = r - svgX * scale * zoom;
      const ty = r - svgY * scale * zoom;
      loupeInnerRef.current.style.transform = `translate(${tx}px, ${ty}px) scale(${zoom})`;
      loupeInnerRef.current.style.width = `${svgWidth}px`;
      loupeInnerRef.current.style.height = `${svgHeight}px`;
    },
    [zoom, loupeSize],
  );

  useEffect(() => {
    if (!enabled) return;
    /** @type {number} */
    let rafId;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateSvgMeta);
    });
    const svgEl = document
      .getElementById('svg-container')
      ?.querySelector('svg');
    if (svgEl) observer.observe(svgEl);
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [enabled, updateSvgMeta]);

  /* Listen for the mouse move and scroll */
  useEffect(() => {
    if (!enabled) return;
    /** @type {number} */
    let rafId;

    /**
     * Only updates the absolute global mouse position.
     * @param {PointerEvent} e
     */
    const onPointerMove = (e) => {
      globalMouseRef.current = { clientX: e.clientX, clientY: e.clientY };
    };

    /**
     * Updates the relative mouse position. Renders the loupe if `Alt` is held down.
     */
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!globalMouseRef.current) return;
        const { clientX, clientY } = globalMouseRef.current;
        const containerEl = loupeRef.current?.parentElement;
        if (!containerEl || !svgMetaRef.current.svgEl) return;
        const containerRect = containerEl.getBoundingClientRect();
        /* Hide loupe and clear relative position if the cursor is outside the container */
        if (
          clientX < containerRect.left ||
          clientX > containerRect.right ||
          clientY < containerRect.top ||
          clientY > containerRect.bottom
        ) {
          if (loupeRef.current) loupeRef.current.style.display = 'none';
          lastMousePosRef.current = null;
          return;
        }
        /* Update relative pos */
        const svgRect = svgMetaRef.current.svgEl.getBoundingClientRect();
        const x = clientX - containerRect.left;
        const y = clientY - containerRect.top;
        const svgX = clientX - svgRect.left;
        const svgY = clientY - svgRect.top;
        lastMousePosRef.current = { x, y, svgX, svgY };
        /* Render if Alt is held down */
        if (keyHeldRef.current) renderLoupe(x, y, svgX, svgY);
      });
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, [enabled, renderLoupe]);

  /* Listen for the Alt down/up (macOS Option / Win Alt) */
  useEffect(() => {
    if (!enabled) return;
    /* Render the loupe immediately */
    /**
     * Renders the loupe.
     * @param {KeyboardEvent} e
     */
    const onDown = (e) => {
      if (e.key === 'Alt') {
        keyHeldRef.current = true;
        /* Ensure SVG meta exists */
        if (!svgMetaRef.current.svgEl) updateSvgMeta();
        const containerEl = loupeRef.current?.parentElement;
        if (!containerEl || !svgMetaRef.current.svgEl) return;

        let pos = lastMousePosRef.current;
        /* If no relative pos, calculate using the global values */
        if (!pos) {
          if (!globalMouseRef.current) return;
          const { clientX, clientY } = globalMouseRef.current;
          const containerRect = containerEl.getBoundingClientRect();
          const svgRect = svgMetaRef.current.svgEl.getBoundingClientRect();
          /* Return if the cursor is outside the container (no need to clear here) */
          if (
            clientX < containerRect.left ||
            clientX > containerRect.right ||
            clientY < containerRect.top ||
            clientY > containerRect.bottom
          ) {
            return;
          }
          /* Calculate and update relative pos */
          const x = clientX - containerRect.left;
          const y = clientY - containerRect.top;
          const svgX = clientX - svgRect.left;
          const svgY = clientY - svgRect.top;
          pos = { x, y, svgX, svgY };
          lastMousePosRef.current = pos;
        }
        renderLoupe(pos.x, pos.y, pos.svgX, pos.svgY);
      }
    };
    /**
     * Resets key and hides the loupe if Alt is released.
     * @param {KeyboardEvent} e
     */
    const onUp = (e) => {
      if (e.key === 'Alt') {
        keyHeldRef.current = false;
        if (loupeRef.current) loupeRef.current.style.display = 'none';
      }
    };
    /** Resets key and hide the loupe on blur. */
    const onBlur = () => {
      keyHeldRef.current = false;
      if (loupeRef.current) loupeRef.current.style.display = 'none';
    };

    window.addEventListener('blur', onBlur);
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);

    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [enabled, updateSvgMeta, renderLoupe]);

  const handlePointerMove = useCallback(
    /** @param {React.PointerEvent<HTMLDivElement>} e */
    (e) => {
      if (!enabled) return;
      /* This helps initializing the absolute pos */
      globalMouseRef.current = { clientX: e.clientX, clientY: e.clientY };

      if (!svgMetaRef.current.svgEl) updateSvgMeta();
      if (!svgMetaRef.current.svgEl) return;

      const containerRect = e.currentTarget.getBoundingClientRect();
      const svgRect = svgMetaRef.current.svgEl.getBoundingClientRect();
      /* Update relative pos */
      const x = e.clientX - containerRect.left;
      const y = e.clientY - containerRect.top;
      const svgX = e.clientX - svgRect.left;
      const svgY = e.clientY - svgRect.top;
      lastMousePosRef.current = { x, y, svgX, svgY };

      /* Even when 'keydown' is blocked, e.altKey will always be true if Alt is held down */
      if (e.altKey) keyHeldRef.current = true;
      if (!keyHeldRef.current) {
        /* Hide loupe if Alt is released */
        if (loupeRef.current) loupeRef.current.style.display = 'none';
        return;
      }

      renderLoupe(x, y, svgX, svgY);
    },
    [enabled, updateSvgMeta, renderLoupe],
  );

  const handlePointerLeave = useCallback(() => {
    if (!enabled) return;
    /* Hide loupe and clear relative position if the cursor leaves the container */
    if (loupeRef.current) loupeRef.current.style.display = 'none';
    lastMousePosRef.current = null;
  }, [enabled]);

  return {
    loupeRef,
    loupeInnerRef,
    handlePointerMove,
    handlePointerLeave,
  };
};

export default useMagnifier;
