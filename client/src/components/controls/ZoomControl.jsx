import React, { useCallback } from "react";

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
    // cy.animate({
    //   zoom: {
    //     level: cy.zoom() * 1.2,
    //     renderedPosition: {
    //       x: window.innerWidth / 2,
    //       y: window.innerHeight / 2,
    //     }
    //   }
    // }, {
    //   duration
    // });
  }, []);

  const zoomOut = useCallback(() => {
    // cy.animate({
    //   zoom: {
    //     level: cy.zoom() * 0.8,
    //     renderedPosition: {
    //       x: window.innerWidth / 2,
    //       y: window.innerHeight / 2,
    //     }
    //   }
    // }, {
    //   duration
    // });
  }, []);

  const fit = useCallback(() => {
    // cy.animate({
    //   fit: {
    //     eles: cy.nodes()
    //   }
    // }, {
    //   duration
    // });
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
