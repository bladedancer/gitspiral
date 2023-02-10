import React, { useCallback, useEffect, useRef } from "react";

import { FiMaximize, FiBarChart2, FiGitCommit, FiThermometer, FiZoomIn, FiZoomOut } from "react-icons/fi";
import { useLayoutEventContext } from "../hooks/useLayoutEventContext";

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
  const { layoutEvent, setLayoutEvent } = useLayoutEventContext();
  const layout = useRef(layoutEvent);

  // Common html props for the div wrapper
  const htmlProps = {
    style,
    className: `react-control ${className || ""}`,
  };

  // Window resize events
  useEffect(() => {
    layout.current = layoutEvent;
  }, [layoutEvent]);

  // Window resize events
  useEffect(() => {
    function handleResize() {
      const { innerWidth: width, innerHeight: height } = window;
      layout.current && layout.current.resize(width, height);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setLayoutEvent]);

  
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

        layout.current && layout.current.move(delta.x, delta.y);
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
        <button onClick={()=>{}} title="Bar Chart">
          {children ? children[0] : <FiBarChart2 style={{ width: "1em" }} />}
        </button>
      </div>
      <div {...htmlProps}>
        <button onClick={()=>{}} title="Circle Chart">
          {children ? children[0] : <FiGitCommit style={{ width: "1em" }} />}
        </button>
      </div>
      <div {...htmlProps}>
        <button onClick={()=>{}} title="Heat map">
          {children ? children[0] : <FiThermometer style={{ width: "1em" }} />}
        </button>
      </div>
      <div {...htmlProps}>
        <button onClick={layout.current && layout.current.zoomIn} title="Zoom In">
          {children ? children[0] : <FiZoomIn style={{ width: "1em" }} />}
        </button>
      </div> 
      <div {...htmlProps}>
        <button onClick={layout.current && layout.current.zoomOut} title="Zoom Out">
          {children ? children[1] : <FiZoomOut style={{ width: "1em" }} />}
        </button>
      </div>
      <div {...htmlProps}>
        <button onClick={layout.current && layout.current.fit} title="See whole graph">
          {children ? children[4] : <FiMaximize style={{ width: "1em" }} />}
        </button>
      </div>
    </>
  );
};

export default LayoutControl;
