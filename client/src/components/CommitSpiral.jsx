import React, { useState, useLayoutEffect, useEffect, useRef } from "react";
import * as d3 from "d3";
import { useCommitsContext } from "./hooks/useCommits";
import { useLayoutEventContext } from "./hooks/useLayoutEventContext";

const defaults = {
  startingRadius: 40,
  spacing: 10,
  angleIncrementDeg: 5,
  barWidth: 5,
  limit: 40, // Limit the bars
};

// Below are the functions that handle actual exporting:
// getSVGString ( svgNode ) and svgString2Image( svgString, width, height, format )
function getSVGString(svgNode) {
  svgNode.setAttribute("xlink", "http://www.w3.org/1999/xlink");
  var cssStyleText = getCSSStyles(svgNode);
  appendCSS(cssStyleText, svgNode);

  var serializer = new XMLSerializer();
  var svgString = serializer.serializeToString(svgNode);
  svgString = svgString.replace(/(\w+)?:?xlink=/g, "xmlns:xlink="); // Fix root xlink without namespace
  svgString = svgString.replace(/NS\d+:href/g, "xlink:href"); // Safari NS namespace fix
  return svgString;

  function getCSSStyles(parentElement) {
    var selectorTextArr = [];

    // Add Parent element Id and Classes to the list
    selectorTextArr.push("#" + parentElement.id);
    for (var c = 0; c < parentElement.classList.length; c++)
      if (!contains("." + parentElement.classList[c], selectorTextArr))
        selectorTextArr.push("." + parentElement.classList[c]);

    // Add Children element Ids and Classes to the list
    var nodes = parentElement.getElementsByTagName("*");
    for (var i = 0; i < nodes.length; i++) {
      var id = nodes[i].id;
      if (!contains("#" + id, selectorTextArr)) selectorTextArr.push("#" + id);

      var classes = nodes[i].classList;
      for (var c = 0; c < classes.length; c++)
        if (!contains("." + classes[c], selectorTextArr))
          selectorTextArr.push("." + classes[c]);
    }

    // Extract CSS Rules
    var extractedCSSText = "";
    for (var i = 0; i < document.styleSheets.length; i++) {
      var s = document.styleSheets[i];

      try {
        if (!s.cssRules) continue;
      } catch (e) {
        if (e.name !== "SecurityError") throw e; // for Firefox
        continue;
      }

      var cssRules = s.cssRules;
      for (var r = 0; r < cssRules.length; r++) {
        if (contains(cssRules[r].selectorText, selectorTextArr))
          extractedCSSText += cssRules[r].cssText;
      }
    }

    return extractedCSSText;

    function contains(str, arr) {
      return arr.indexOf(str) === -1 ? false : true;
    }
  }

  function appendCSS(cssText, element) {
    var styleElement = document.createElement("style");
    styleElement.setAttribute("type", "text/css");
    styleElement.innerHTML = cssText;
    var refNode = element.hasChildNodes() ? element.children[0] : null;
    element.insertBefore(styleElement, refNode);
  }
}

function svgString2Image(svgString, bbox, format, callback) {
  var format = format ? format : "png";

  var imgsrc =
    "data:image/svg+xml;base64," +
    btoa(unescape(encodeURIComponent(svgString))); // Convert SVG string to data URL

  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");

  // Increase dpi to 300
  var scaleFactor = 300 / 96;
  canvas.width = Math.ceil(bbox.width * scaleFactor);
  canvas.height = Math.ceil(bbox.height * scaleFactor);
  context.scale(scaleFactor, scaleFactor);

  var image = new Image();
  const contentPromise = new Promise((resolve, reject) => {
    image.onload = function () {
      context.clearRect(0, 0, bbox.width, bbox.height);
      context.drawImage(
        image,
        bbox.x,
        bbox.y,
        bbox.width,
        bbox.height,
        0,
        0,
        bbox.width,
        bbox.height
      );
      canvas.toBlob(resolve);
    };

    image.src = imgsrc;
  });

  return contentPromise;
}

function drawSpiral(svg, { barWidth, spacing, startingRadius, limit }, counts) {
  const numPoints = Object.keys(counts).length;

  // Evenly spaced points along spiral
  const radius = (r, i) => startingRadius + Math.sqrt(i + 1) * spacing;
  const theta = (r, i) => i * Math.asin(1 / Math.sqrt(i + 2));

  // append our rects
  let countArray = Object.keys(counts)
    .sort()
    .reduce((acc, cur) => {
      acc.push({
        key: cur,
        value: counts[cur],
      });
      return acc;
    }, []);

  let spiral = d3
    .radialLine()
    .curve(d3.curveCardinal)
    .angle(theta)
    .radius(radius);

  var path = svg
    .append("path")
    .datum(countArray)
    .attr("id", "spiral")
    .attr("d", spiral)
    .style("fill", "none")
    .style("stroke", "steelblue");

  drawBars(svg, path, countArray, { limit, spacing, barWidth });
  //drawHeatBars(svg, path, countArray, { limit, spacing, barWidth });
  //drawCircles(svg, path, countArray, {limit, maxRadius: 10});
  //drawHeatCircles(svg, path, countArray, {limit, minRadius: 10, maxRadius: 10});
  drawTimeStamps(svg, path, countArray);
}

function drawCircles(svg, path, countArray, { limit, maxRadius }) {
  // yScale for the circle size
  let yScale = d3
    .scaleLinear()
    .domain([0, d3.max(countArray, (k) => Math.min(k.value, limit))])
    .range([0, maxRadius]);

  const spiralLength = path.node().getTotalLength();
  const timeScale = d3
    .scaleTime()
    .domain(d3.extent(countArray, (d) => new Date(d.key)))
    .range([0, spiralLength]);

  svg
    .selectAll("rect")
    .data(countArray)
    .enter()
    .append("circle")
    .attr("cx", function (d, i) {
      // placement calculations
      let distAlongSpiral = timeScale(new Date(d.key)); // distance along the spiral
      let posOnLine = path.node().getPointAtLength(distAlongSpiral);
      d.distAlongSpiral = distAlongSpiral;
      d.x = posOnLine.x;
      d.y = posOnLine.y;
      return d.x;
    })
    .attr("cy", (d) => d.y)
    .attr("class", "circle")
    .attr("r", (d) => yScale(Math.min(d.value, limit)))
    .style("fill", "steelblue")
    .style("stroke", "none")
    .append("title")
    .text((d) => `${d.key}: ${d.value}`);
}

function drawHeatCircles(
  svg,
  path,
  countArray,
  { limit, minRadius, maxRadius }
) {
  // scale for the circle heat
  let heatScale = d3
    .scaleSequential()
    .interpolator(d3.interpolateTurbo)
    .domain([0, d3.max(countArray, (k) => Math.min(k.value, limit))]);

  // yScale for the circle size
  let yScale = d3
    .scaleLinear()
    .domain([0, d3.max(countArray, (k) => Math.min(k.value, limit))])
    .range([minRadius, maxRadius]);

  const spiralLength = path.node().getTotalLength();
  const timeScale = d3
    .scaleTime()
    .domain(d3.extent(countArray, (d) => new Date(d.key)))
    .range([0, spiralLength]);

  svg
    .selectAll("rect")
    .data(countArray)
    .enter()
    .append("circle")
    .attr("cx", function (d, i) {
      // placement calculations
      let distAlongSpiral = timeScale(new Date(d.key)); // distance along the spiral
      let posOnLine = path.node().getPointAtLength(distAlongSpiral);
      d.distAlongSpiral = distAlongSpiral;
      d.x = posOnLine.x;
      d.y = posOnLine.y;
      return d.x;
    })
    .attr("cy", (d) => d.y)
    .attr("class", "circle")
    .attr("r", (d) => yScale(Math.min(d.value, limit)))
    .style("fill", (d) => heatScale(Math.min(d.value, limit)))
    .style("stroke", "none")
    .append("title")
    .text((d) => `${d.key}: ${d.value}`);
}

function drawBars(svg, path, countArray, { limit, spacing, barWidth }) {
  // yScale for the bar height
  let yScale = d3
    .scaleLinear()
    .domain([0, d3.max(countArray, (k) => Math.min(k.value, limit))])
    .range([0, spacing * 5]); // TODO: Figure out spiral spacing.

  const spiralLength = path.node().getTotalLength();
  const timeScale = d3
    .scaleTime()
    .domain(d3.extent(countArray, (d) => new Date(d.key)))
    .range([0, spiralLength]);

  svg
    .selectAll("rect")
    .data(countArray)
    .enter()
    .append("rect")
    .attr("x", function (d, i) {
      // placement calculations
      let distAlongSpiral = timeScale(new Date(d.key)); // distance along the spiral
      let posOnLine = path.node().getPointAtLength(distAlongSpiral);
      let angleOnLine = path
        .node()
        .getPointAtLength(distAlongSpiral - barWidth);
      d.distAlongSpiral = distAlongSpiral; // % distance are on the spiral
      d.x = posOnLine.x;
      d.y = posOnLine.y;
      d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180) / Math.PI - 90;
      return d.x;
    })
    .attr("class", "bar")
    .attr("y", (d) => d.y)
    .attr("width", (d) => barWidth)
    .attr("height", (d) => yScale(Math.min(d.value, limit)))
    .style("fill", "steelblue")
    .style("stroke", "none")
    .attr("transform", (d) => {
      return "rotate(" + d.a + "," + d.x + "," + d.y + ")"; // rotate the bar
    })
    .append("title")
    .text((d) => `${d.key}: ${d.value}`);
}

function drawHeatBars(svg, path, countArray, { limit, spacing, barWidth }) {
  // scale for the bar heat
  let heatScale = d3
    .scaleSequential()
    .interpolator(d3.interpolateTurbo)
    .domain([0, d3.max(countArray, (k) => Math.min(k.value, limit))]);

  const spiralLength = path.node().getTotalLength();
  const timeScale = d3
    .scaleTime()
    .domain(d3.extent(countArray, (d) => new Date(d.key)))
    .range([0, spiralLength]);

  svg
    .selectAll("rect")
    .data(countArray)
    .enter()
    .append("rect")
    .attr("x", function (d, i) {
      // placement calculations
      let distAlongSpiral = timeScale(new Date(d.key)); // distance along the spiral
      let posOnLine = path.node().getPointAtLength(distAlongSpiral);
      let angleOnLine = path
        .node()
        .getPointAtLength(distAlongSpiral - barWidth);
      d.distAlongSpiral = distAlongSpiral; // % distance are on the spiral
      d.x = posOnLine.x;
      d.y = posOnLine.y;
      d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180) / Math.PI - 90;
      return d.x;
    })
    .attr("class", "bar")
    .attr("y", (d) => d.y)
    .attr("width", (d) => barWidth)
    .attr("height", spacing * 4)
    .style("fill", (d) => heatScale(Math.min(d.value, limit)))
    .style("stroke", "none")
    .attr("transform", (d) => {
      return "rotate(" + d.a + "," + d.x + "," + d.y + ")"; // rotate the bar
    })
    .append("title")
    .text((d) => `${d.key}: ${d.value}`);
}

function drawTimeStamps(svg, path, countArray) {
  let tF = d3.timeFormat("%b %Y");
  let firstInMonth = {};

  const spiralLength = path.node().getTotalLength();

  svg
    .selectAll("text")
    .data(countArray)
    .enter()
    .append("text")
    .attr("dy", 10)
    .style("text-anchor", "start")
    .style("font", "10px arial")
    .append("textPath")
    // only add for the first of each month
    .filter((d) => {
      let sd = tF(new Date(d.key));
      if (!firstInMonth[sd]) {
        firstInMonth[sd] = true;
        return true;
      }
      return false;
    })
    .text((d) => tF(new Date(d.key)))
    // place text along spiral
    .attr("xlink:href", "#spiral")
    .style("fill", "grey")
    .attr("startOffset", (d) => (d.distAlongSpiral / spiralLength) * 100 + "%");
}

const CommitSpiral = ({ config, children }) => {
  const svgRef = useRef(null);
  const { commits, setCommits } = useCommitsContext();
  const { innerWidth: width, innerHeight: height } = window;
  const [layout, setLayout] = useState({
    width,
    height,
    center: {
      x: width / 2,
      y: height / 2,
    },
    zoom: 1,
  });
  const layoutRef = useRef(layout);
  const { layoutEvent, setLayoutEvent } = useLayoutEventContext();

  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  // Bind the layout events
  useEffect(async () => {
    setLayoutEvent({
      move: (x, y) => {
        setLayout({
          ...layoutRef.current,
          center: {
            x: layoutRef.current.center.x + x,
            y: layoutRef.current.center.y + y,
          },
        });
      },
      resize: (width, height) => {
        setLayout({ ...layoutRef.current, width, height });
      },
      zoomIn: () => {
        const zoom = Math.max(layoutRef.current.zoom - 0.1, 0.1);
        setLayout({
          ...layoutRef.current,
          zoom,
        });
      },
      zoomOut: () => {
        const zoom = Math.min(layoutRef.current.zoom + 0.1, 2);
        setLayout({
          ...layoutRef.current,
          zoom,
        });
      },
      fit: () => {
        const svg = d3.select(svgRef.current).node();
        const bbox = svg.getBBox();

        setLayout({
          ...layoutRef.current,
          center: {
            x: layoutRef.current.width / 2,
            y: layoutRef.current.height / 2,
          },
          zoom: Math.max(
            bbox.width / layoutRef.current.width,
            bbox.height / layoutRef.current.height
          ),
        });
      },
      toImage: async () => {
        const svg = d3.select(svgRef.current).node();
        var svgString = getSVGString(svg);
        const bbox = svg.getBBox();
        return svgString2Image(svgString, bbox, "png");
      },
    });
  }, [svgRef]);

  config = {
    ...defaults,
    ...config,
  };

  // Draw the spiral
  useEffect(async () => {
    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll("*").remove(); // Clear svg content before adding new elements
    var svg = svgEl
      .append("g")
      .attr(
        "transform",
        "translate(" + layout.center.x + "," + layout.center.y + ")"
      );

    if (Object.keys(commits.counts).length) {
      drawSpiral(svg, config, commits.counts);
    }
  }, [commits]);

  // Update layout
  useEffect(async () => {
    const svgEl = d3.select(svgRef.current);

    const scaledWidth = layout.width * layout.zoom;
    const scaledHeight = layout.height * layout.zoom;
    const offsetX = (layout.width - scaledWidth) / 2;
    const offsetY = (layout.height - scaledHeight) / 2;

    svgEl
      .attr("width", layout.width)
      .attr("height", layout.height)
      .attr("viewBox", `${offsetX} ${offsetY} ${scaledWidth} ${scaledHeight}`);

    svgEl
      .select("g")
      .attr(
        "transform",
        "translate(" + layout.center.x + "," + layout.center.y + ")"
      );
  }, [layout]);

  return (
    <svg
      ref={svgRef}
      className="spiral"
      viewBox={`${0} ${0} ${layout.width} ${layout.height}`}
      width={layout.width}
      height={layout.height}
    />
  );
};

export default CommitSpiral;
