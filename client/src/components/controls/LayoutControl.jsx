import React, { useCallback, useEffect, useRef } from "react";

import { FiZoomIn, FiZoomOut } from "react-icons/fi";
import { useLayoutContext } from "../hooks/useLayout";

/**
 * The `LayoutControl` create  UI buttons that allows the user to
 * - zoom in
 * - zoom out
 *
 * ```jsx
 * <App>
 *   <ControlsContainer>
 *     <LayoutControl />
 *   </ControlsContainer>
 * </App>
 * ```
 *
 * @category Component
 */
const LayoutControl = ({
  className,
  style,
  children,
}) => {
  const { layout, setLayout } = useLayoutContext();
  const layoutRef = useRef(layout)


  // Common html props for the div wrapper
  const htmlProps = {
    style,
    className: `react-control ${className || ""}`,
  };

  const zoomOut = useCallback(() => {
    const zoom = Math.min(layout.zoom + 0.1, 2);
    setLayout({
      ...layout,
      zoom
    });
  }, [layout]);

  const zoomIn = useCallback(() => {
    const zoom = Math.max(layout.zoom - 0.1, 0.1);
    setLayout({
      ...layout,
      zoom
    });
  }, [layout]);



  // Update layout ref for the events.
  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  // Window resize events
  useEffect(() => {
    function handleResize() {
      const { innerWidth: width, innerHeight: height } = window;
      setLayout({
        ...layoutRef.current,
        width,
        height
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  
  // Mouse events for canvas dragging
  useEffect(() => {
    let drag = null;
    
    function onMouseDown(e) {
      drag = {
        x: e.screenX,
        y: e.screenY
      };
    }
    
    function onMouseMove(e) {
      if (drag) {
        const delta = {
          x: e.screenX - drag.x,
          y: e.screenY - drag.y,
        };

        drag = {
          x: e.screenX,
          y: e.screenY
        }

        setLayout({
          ...layoutRef.current,
          center: {
            x: layoutRef.current.center.x + delta.x,
            y: layoutRef.current.center.y + delta.y,
          }
        })
      }
    }

    function onMouseUp(e) {
      drag = null
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mouseup', onMouseUp);
    };
  }, []);


  return (
    <>
      <div {...htmlProps}>
        <button onClick={zoomIn} title="Zoom In">
          {children ? children[0] : <FiZoomIn style={{ width: "1em" }} />}
        </button>
      </div>
      <div {...htmlProps}>
        <button onClick={zoomOut} title="Zoom Out">
          {children ? children[1] : <FiZoomOut style={{ width: "1em" }} />}
        </button>
      </div>
    </>
  );
};

export default LayoutControl;
