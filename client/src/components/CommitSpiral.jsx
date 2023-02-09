import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import * as d3 from "d3";
import { useCommitsContext } from "./hooks/useCommits";
import { useLayoutContext } from './hooks/useLayout';

const defaults = {
  width: 400,
  height: 400,
  margin: 40,
  startingRadius: 40,
  spacing: 10,
  angleIncrementDeg: 5,
  barWidth: 5,
  limit: 40 // Limit the bars 
}

function drawSpiral(svg, { barWidth, spacing, startingRadius, limit }, counts) {
  const numPoints = Object.keys(counts).length;

  // Evenly spaced points along spiral
  const radius = (r, i) => startingRadius + (Math.sqrt(i + 1) * spacing);
  const theta = (r, i) => i * Math.asin(1 / Math.sqrt(i + 2));

  // append our rects
  let countArray = Object.keys(counts).sort().reduce((acc, cur) => {
    acc.push({
      key: cur,
      value: counts[cur]
    });
    return acc;
  }, []);

  let spiral = d3.radialLine()
    .curve(d3.curveCardinal)
    .angle(theta)
    .radius(radius);

  var path = svg.append("path")
    .datum(countArray)
    .attr("id", "spiral")
    .attr("d", spiral)
    .style("fill", "none")
    .style("stroke", "steelblue");


  drawBars(svg, path, countArray, {limit, spacing, barWidth});
  //drawHeatBars(svg, path, countArray, { limit, spacing, barWidth });
  //drawCircles(svg, path, countArray, {limit, maxRadius: 10});
  //drawHeatCircles(svg, path, countArray, {limit, minRadius: 10, maxRadius: 10});
  drawTimeStamps(svg, path, countArray);
}

function drawCircles(svg, path, countArray, { limit, maxRadius }) {
  // yScale for the circle size
  let yScale = d3.scaleLinear()
    .domain([0, d3.max(countArray, (k) => Math.min(k.value, limit))])
    .range([0, maxRadius]);

  const spiralLength = path.node().getTotalLength();
  const timeScale = d3.scaleTime()
    .domain(d3.extent(countArray, d => new Date(d.key)))
    .range([0, spiralLength]);


  svg.selectAll("rect")
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
    .attr("cy", d => d.y)
    .attr("class", "circle")
    .attr("r", d => yScale(Math.min(d.value, limit)))
    .style("fill", "steelblue")
    .style("stroke", "none")
    .append("title")
    .text(d => `${d.key}: ${d.value}`);
}

function drawHeatCircles(svg, path, countArray, { limit, minRadius, maxRadius }) {
  // scale for the circle heat
  let heatScale = d3.scaleSequential()
    .interpolator( d3.interpolateTurbo)
    .domain([0, d3.max(countArray, (k) => Math.min(k.value, limit))]);

  // yScale for the circle size
  let yScale = d3.scaleLinear()
    .domain([0, d3.max(countArray, (k) => Math.min(k.value, limit))])
    .range([minRadius, maxRadius]);

  const spiralLength = path.node().getTotalLength();
  const timeScale = d3.scaleTime()
    .domain(d3.extent(countArray, d => new Date(d.key)))
    .range([0, spiralLength]);


  svg.selectAll("rect")
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
    .attr("cy", d => d.y)
    .attr("class", "circle")
    .attr("r", d => yScale(Math.min(d.value, limit)))
    .style("fill", d => heatScale(Math.min(d.value, limit)))
    .style("stroke", "none")
    .append("title")
    .text(d => `${d.key}: ${d.value}`);
}

function drawBars(svg, path, countArray, { limit, spacing, barWidth }) {
  // yScale for the bar height
  let yScale = d3.scaleLinear()
    .domain([0, d3.max(countArray, (k) => Math.min(k.value, limit))])
    .range([0, spacing * 5]); // TODO: Figure out spiral spacing.


  const spiralLength = path.node().getTotalLength();
  const timeScale = d3.scaleTime()
    .domain(d3.extent(countArray, d => new Date(d.key)))
    .range([0, spiralLength]);


  svg.selectAll("rect")
    .data(countArray)
    .enter()
    .append("rect")
    .attr("x", function (d, i) {
      // placement calculations
      let distAlongSpiral = timeScale(new Date(d.key)); // distance along the spiral
      let posOnLine = path.node().getPointAtLength(distAlongSpiral);
      let angleOnLine = path.node().getPointAtLength(distAlongSpiral - barWidth);
      d.distAlongSpiral = distAlongSpiral; // % distance are on the spiral
      d.x = posOnLine.x;
      d.y = posOnLine.y;
      d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180 / Math.PI) - 90;
      return d.x;
    })
    .attr("class", "bar")
    .attr("y", d => d.y)
    .attr("width", d => barWidth)
    .attr("height", d => yScale(Math.min(d.value, limit)))
    .style("fill", "steelblue")
    .style("stroke", "none")
    .attr("transform", d => {
      return "rotate(" + d.a + "," + d.x + "," + d.y + ")"; // rotate the bar
    })
    .append("title")
    .text(d => `${d.key}: ${d.value}`);
}

function drawHeatBars(svg, path, countArray, { limit, spacing, barWidth }) {
  // scale for the bar heat
  let heatScale = d3.scaleSequential()
    .interpolator( d3.interpolateTurbo)
    .domain([0, d3.max(countArray, (k) => Math.min(k.value, limit))]);

  const spiralLength = path.node().getTotalLength();
  const timeScale = d3.scaleTime()
    .domain(d3.extent(countArray, d => new Date(d.key)))
    .range([0, spiralLength]);


  svg.selectAll("rect")
    .data(countArray)
    .enter()
    .append("rect")
    .attr("x", function (d, i) {
      // placement calculations
      let distAlongSpiral = timeScale(new Date(d.key)); // distance along the spiral
      let posOnLine = path.node().getPointAtLength(distAlongSpiral);
      let angleOnLine = path.node().getPointAtLength(distAlongSpiral - barWidth);
      d.distAlongSpiral = distAlongSpiral; // % distance are on the spiral
      d.x = posOnLine.x;
      d.y = posOnLine.y;
      d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180 / Math.PI) - 90;
      return d.x;
    })
    .attr("class", "bar")
    .attr("y", d => d.y)
    .attr("width", d => barWidth)
    .attr("height", spacing * 4)
    .style("fill", d => heatScale(Math.min(d.value, limit)))
    .style("stroke", "none")
    .attr("transform", d => {
      return "rotate(" + d.a + "," + d.x + "," + d.y + ")"; // rotate the bar
    })
    .append("title")
    .text(d => `${d.key}: ${d.value}`);
}

function drawTimeStamps(svg, path, countArray) {
  let tF = d3.timeFormat("%b %Y");
  let firstInMonth = {};

  const spiralLength = path.node().getTotalLength();

  svg.selectAll("text")
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
    .text(d => tF(new Date(d.key)))
    // place text along spiral
    .attr("xlink:href", "#spiral")
    .style("fill", "grey")
    .attr("startOffset", d => ((d.distAlongSpiral / spiralLength) * 100) + "%");
}

const CommitSpiral = ({ config, children }) => {
  const svgRef = useRef(null);
  const { commits, setCommits } = useCommitsContext();
  const { layout, setLayout } = useLayoutContext();

  config = {
    ...defaults,
    ...config
  }

  useEffect(async () => {
    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll("*").remove(); // Clear svg content before adding new elements 
    var svg = svgEl.append("g")
      .attr("transform", "translate(" + layout.center.x + "," + layout.center.y + ")");


    drawSpiral(svg, config, commits.counts);
  }, [commits]);

  useEffect(async () => {
    console.log(layout);
    const svgEl = d3.select(svgRef.current);

    const scaledWidth = layout.width * layout.zoom;
    const scaledHeight = layout.height * layout.zoom;
    const offsetX = ((layout.width - scaledWidth) / 2);
    const offsetY = ((layout.height - scaledHeight) / 2);

    svgEl.attr("width", layout.width)
        .attr("height", layout.height)
        .attr("viewBox", `${offsetX} ${offsetY} ${scaledWidth} ${scaledHeight}`);
    
    svgEl.select("g")
      .attr("transform", "translate(" + layout.center.x + "," + layout.center.y + ")");
  }, [layout]);

  return (
    <svg ref={svgRef}
      className="spiral"
      viewBox={`${0} ${0} ${layout.width} ${layout.height}`}
      width={layout.width}
      height={layout.height} />
  );
}

export default CommitSpiral;