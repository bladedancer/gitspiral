import React, { useCallback } from "react";
import * as d3 from "d3";

import { FiZoomIn, FiZoomOut, FiMaximize } from "react-icons/fi";

/**
 * The `ZoomControl` create three UI buttons that allows the user to
 * - zoom in
 * - zoom out
 * - reset zoom (ie. see the whole spiral)
 *
 * ```jsx
 * <App>
 *   <ControlsContainer>
 *     <ZoomControl />
 *   </ControlsContainer>
 * </App>
 * ```
 *
 * @category Component
 */
const ZoomControl = ({
  className,
  style,
  duration,
  children,
}) => {
  duration = duration || 200;

  // Common html props for the div wrapper
  const htmlProps = {
    style,
    className: `react-control ${className || ""}`,
  };

  const zoomIn = useCallback(() => {
    const svgEl = d3.select("svg.spiral").node();
    const bbox = svgEl.getBBox();

    const {x, y, width, height} = svgEl.viewBox.baseVal;
    const scaledWidth = width * 0.9;
    const scaledHeight = height * 0.9;
    const offsetX = x + ((width - scaledWidth) / 2);
    const offsetY = y + ((height - scaledHeight) / 2);

    svgEl.setAttribute("viewBox", `${offsetX} ${offsetY} ${scaledWidth} ${scaledHeight}`);
  }, []);

  const zoomOut = useCallback(() => {
    const svgEl = d3.select("svg.spiral").node();
    const bbox = svgEl.getBBox();

    const {x, y, width, height} = svgEl.viewBox.baseVal;
    const scaledWidth = width * 1.111;
    const scaledHeight = height * 1.111;
    const offsetX = x + ((width - scaledWidth) / 2);
    const offsetY = y + ((height - scaledHeight) / 2);

    svgEl.setAttribute("viewBox", `${offsetX} ${offsetY} ${scaledWidth} ${scaledHeight}`);
  }, []);

  const fit = useCallback(() => {

    d3.select("svg.spiral");
        const svgEl = d3.select("svg.spiral").node();
        const bbox = svgEl.getBBox();
        svgEl.setAttribute("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
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
      <div {...htmlProps}>
        <button onClick={fit} title="See whole spiral">
          {children ? children[4] : <FiMaximize style={{ width: "1em" }} />}
        </button>
      </div>
    </>
  );
};

export default ZoomControl;
