import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import * as d3 from "d3";
import { useCommitsContext } from "./hooks/useCommits";
import './commitspiral.css';

const defaults = {
    width: 400,
    height: 400,
    margin: 40,
    startingRadius: 40,
    radiusIncrement: 0.75,
    angleIncrementDeg: 5,
    barWidth: 5
}

function drawSpiral(svg, {barWidth, radiusIncrement, angleIncrementDeg, startingRadius}, counts) {
    const numPoints = Object.keys(counts).length;
    const radius = (r, i) => startingRadius + (i * radiusIncrement);      
    const theta = (r, i) => {
        return (angleIncrementDeg * Math.PI * 2 / 360) * i;
    };

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
      
    // yScale for the bar height
    let yScale = d3.scaleLinear()
        .domain([0, d3.max(countArray, (k) => k.value)])
        .range([0, (360 / angleIncrementDeg) * radiusIncrement * 0.5]); // Might be wrong - max is half the width of the spiral ring

    
    const spiralLength = path.node().getTotalLength();
    const timeScale = d3.scaleTime()
        .domain(d3.extent(countArray, d => new Date(d.key)))
        .range([0, spiralLength]);


    svg.selectAll("rect")
      .data(countArray)
      .enter()
      .append("rect")
      .attr("x", function(d,i){
        // placement calculations
        let linePer = timeScale(new Date(d.key)); // % along spiral
        let posOnLine = path.node().getPointAtLength(linePer);
        let angleOnLine = path.node().getPointAtLength(linePer - barWidth);
        d.linePer = linePer; // % distance are on the spiral
        d.x = posOnLine.x;
        d.y = posOnLine.y;
        d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180 / Math.PI) - 90;
        return d.x;
      })
      .attr("class", "bar")
      .attr("y", d => d.y)
      .attr("width", d => barWidth)
      .attr("height", d => yScale(d.value))
      .style("fill", "steelblue")
      .style("stroke", "none")
      .attr("transform", d => {
        return "rotate(" + d.a + "," + d.x  + "," + d.y + ")"; // rotate the bar
      })
      .append("title")
      .text(d => `${d.key}: ${d.value}`);


    // add date labels
    let tF = d3.timeFormat("%b %Y"),
    firstInMonth = {};
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
        .attr("startOffset", d => ((d.linePer / spiralLength) * 100) + "%");
}

const CommitSpiral = ({config, children}) => {
    const svgRef = useRef(null);
    const [counts, setCounts] = useState({});
    const { commits, setCommits } = useCommitsContext();
    
    config = {
        ...defaults,
        ...config
    } 

    const { width, height, margin } = config;
    const svgWidth = width + margin.left + margin.right;
    const svgHeight = height + margin.top + margin.bottom;

    useEffect(async () => {
        setCounts(commits.counts);

        const svgEl = d3.select(svgRef.current);
        svgEl.selectAll("*").remove(); // Clear svg content before adding new elements 
        var svg = svgEl.append("g")
                .attr("transform", "translate(" + svgWidth / 2 + "," + svgHeight / 2 + ")");

        
        drawSpiral(svg, config, commits.counts);
      }, [commits]);

      return (
        <svg ref={svgRef} 
            width={svgWidth} 
            height={svgHeight} />
      );
}

export default CommitSpiral;