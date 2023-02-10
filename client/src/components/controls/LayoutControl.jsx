import React, { useState, useEffect, useRef, useCallback } from "react";

import { FiMaximize, FiBarChart2, FiGitCommit, FiThermometer, FiZoomIn, FiZoomOut } from "react-icons/fi";
import { useCommitsContext } from "../hooks/useCommits";
import { useLayoutEventContext } from "../hooks/useLayoutEventContext";
import "./layoutcontrol.css"

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
  const { commits, setCommits } = useCommitsContext();
  const commitsRef = useRef(commits);

  const { layoutEvent, setLayoutEvent } = useLayoutEventContext();
  const layout = useRef(layoutEvent);
  const [heat, setHeat] = useState(false);

  // Common html props for the div wrapper
  const htmlProps = {
    style,
    className: `react-control ${className || ""}`,
  };

  // Window resize events
  useEffect(() => {
    layout.current = layoutEvent;
  }, [layoutEvent]);

  useEffect(() => {
    commitsRef.current = commits;
  }, [commits]);

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

  const setChart = useCallback((heat, type) => {
    let chart = {
      startingRadius: 40,
      spacing: 10,
      limit: 40
    };

    if (type === "circle") {
      chart = {
        ...chart,
        type: heat ? "heatcircle" : "circle", 
        maxRadius: 10,
        minRadius: heat ? 10 : 0,
        heat
      };
    } else {
      chart = {
        ...chart,
        type: heat ? "heatbar" : "bar", 
        barWidth: 5,
        heat
      };
    } 

    setCommits({
      ...commits,
      chart
    });
  }, [commits]);

  useEffect(() => {
    setChart(heat, commits.chart.type);
  }, [heat]);

  return (
    <>
      <div {...htmlProps}>
        <button onClick={()=>{setChart(heat, "bar")}} title="Bar Chart">
          {children ? children[0] : <FiBarChart2 style={{ width: "1em" }} />}
        </button>
      </div>
      <div {...htmlProps}>
        <button onClick={()=>{setChart(heat, "circle")}} title="Circle Chart">
          {children ? children[0] : <FiGitCommit style={{ width: "1em" }} />}
        </button>
      </div>
      <div {...htmlProps}>
        <button onClick={()=>{setHeat(!heat)}} title="Heat map" className={`heat ${heat ? "checked" : ""}`}>
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
