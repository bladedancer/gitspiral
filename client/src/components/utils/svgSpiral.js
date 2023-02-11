import * as d3 from 'd3';

export const drawSpiral = (svg, commits) => {
    const numPoints = Object.keys(commits.counts).length;

    // Evenly spaced points along spiral
    const radius = (r, i) =>
        commits.chart.startingRadius + Math.sqrt(i + 1) * commits.chart.spacing;
    const theta = (r, i) => i * Math.asin(1 / Math.sqrt(i + 2));

    // append our rects
    let countArray = Object.keys(commits.counts)
        .sort()
        .reduce((acc, cur) => {
            acc.push({
                key: cur,
                value: commits.counts[cur],
            });
            return acc;
        }, []);

    let spiral = d3
        .radialLine()
        .curve(d3.curveCardinal)
        .angle(theta)
        .radius(radius);

    var path = svg
        .append('path')
        .datum(countArray)
        .attr('id', 'spiral')
        .attr('d', spiral)
        .style('fill', 'none')
        .style('stroke', 'steelblue');

    if (commits.chart.type === 'bar') {
        drawBars(svg, path, countArray, commits.chart);
    } else if (commits.chart.type === 'heatbar') {
        drawHeatBars(svg, path, countArray, commits.chart);
    } else if (commits.chart.type === 'circle') {
        drawCircles(svg, path, countArray, commits.chart);
    } else if (commits.chart.type === 'heatcircle') {
        drawHeatCircles(svg, path, countArray, commits.chart);
    }
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

    svg.selectAll('rect')
        .data(countArray)
        .enter()
        .append('circle')
        .attr('cx', function (d, i) {
            // placement calculations
            let distAlongSpiral = timeScale(new Date(d.key)); // distance along the spiral
            let posOnLine = path.node().getPointAtLength(distAlongSpiral);
            d.distAlongSpiral = distAlongSpiral;
            d.x = posOnLine.x;
            d.y = posOnLine.y;
            return d.x;
        })
        .attr('cy', (d) => d.y)
        .attr('class', 'circle')
        .attr('r', (d) => yScale(Math.min(d.value, limit)))
        .style('fill', 'steelblue')
        .style('stroke', 'none')
        .append('title')
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

    svg.selectAll('rect')
        .data(countArray)
        .enter()
        .append('circle')
        .attr('cx', function (d, i) {
            // placement calculations
            let distAlongSpiral = timeScale(new Date(d.key)); // distance along the spiral
            let posOnLine = path.node().getPointAtLength(distAlongSpiral);
            d.distAlongSpiral = distAlongSpiral;
            d.x = posOnLine.x;
            d.y = posOnLine.y;
            return d.x;
        })
        .attr('cy', (d) => d.y)
        .attr('class', 'circle')
        .attr('r', (d) => yScale(Math.min(d.value, limit)))
        .style('fill', (d) => heatScale(Math.min(d.value, limit)))
        .style('stroke', 'none')
        .append('title')
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

    svg.selectAll('rect')
        .data(countArray)
        .enter()
        .append('rect')
        .attr('x', function (d, i) {
            // placement calculations
            let distAlongSpiral = timeScale(new Date(d.key)); // distance along the spiral
            let posOnLine = path.node().getPointAtLength(distAlongSpiral);
            let angleOnLine = path
                .node()
                .getPointAtLength(distAlongSpiral - barWidth);
            d.distAlongSpiral = distAlongSpiral; // % distance are on the spiral
            d.x = posOnLine.x;
            d.y = posOnLine.y;
            d.a =
                (Math.atan2(angleOnLine.y, angleOnLine.x) * 180) / Math.PI - 90;
            return d.x;
        })
        .attr('class', 'bar')
        .attr('y', (d) => d.y)
        .attr('width', (d) => barWidth)
        .attr('height', (d) => yScale(Math.min(d.value, limit)))
        .style('fill', 'steelblue')
        .style('stroke', 'none')
        .attr('transform', (d) => {
            return 'rotate(' + d.a + ',' + d.x + ',' + d.y + ')'; // rotate the bar
        })
        .append('title')
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

    svg.selectAll('rect')
        .data(countArray)
        .enter()
        .append('rect')
        .attr('x', function (d, i) {
            // placement calculations
            let distAlongSpiral = timeScale(new Date(d.key)); // distance along the spiral
            let posOnLine = path.node().getPointAtLength(distAlongSpiral);
            let angleOnLine = path
                .node()
                .getPointAtLength(distAlongSpiral - barWidth);
            d.distAlongSpiral = distAlongSpiral; // % distance are on the spiral
            d.x = posOnLine.x;
            d.y = posOnLine.y;
            d.a =
                (Math.atan2(angleOnLine.y, angleOnLine.x) * 180) / Math.PI - 90;
            return d.x;
        })
        .attr('class', 'bar')
        .attr('y', (d) => d.y)
        .attr('width', (d) => barWidth)
        .attr('height', spacing * 4)
        .style('fill', (d) => heatScale(Math.min(d.value, limit)))
        .style('stroke', 'none')
        .attr('transform', (d) => {
            return 'rotate(' + d.a + ',' + d.x + ',' + d.y + ')'; // rotate the bar
        })
        .append('title')
        .text((d) => `${d.key}: ${d.value}`);
}

function drawTimeStamps(svg, path, countArray) {
    let tF = d3.timeFormat('%b %Y');
    let firstInMonth = {};

    const spiralLength = path.node().getTotalLength();

    svg.selectAll('text')
        .data(countArray)
        .enter()
        .append('text')
        .attr('dy', 10)
        .style('text-anchor', 'start')
        .style('font', '10px arial')
        .append('textPath')
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
        .attr('xlink:href', '#spiral')
        .style('fill', 'grey')
        .attr(
            'startOffset',
            (d) => (d.distAlongSpiral / spiralLength) * 100 + '%'
        );
}
