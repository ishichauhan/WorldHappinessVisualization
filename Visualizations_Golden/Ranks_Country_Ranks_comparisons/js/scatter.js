const SCATTER_CANVAS_HEIGHT = 700;
const SCATTER_CANVAS_WIDTH = 700;
const VIZ2_LEFT_PADDING = 10;
const VIZ2_RIGHT_PADDING = 80;
const VIZ2_TOP_PADDING = 10;
const VIZ2_BOTTOM_PADDING = 10;
const VIZ2_GRID_COUNT = 8;
const RADIUS = 10;
const VIZ2_AXIS_COLOR = "black";
const VIZ2_GRIDLINE_COLOR = "gray";
const VIZ2_GRIDLINE_OFFSET = 0;

var scatter_svg,
    x_dimension,
    y_dimension,
    x_scale,
    y_scale,
    area_scale;

function xVal(d) {
    return x_dimension ? d[x_dimension] : 0;
}

function yVal(d) {
    return y_dimension ? d[y_dimension] : 0;
}

function handleMouseOver(d, i) {
    scatter_svg.append("text")
        .attr('id', "label-" + d.Happiness_Rank)
        .attr('x', () => x_scale(xVal(d)))
        .attr('y', () => (y_scale(yVal(d)) - RADIUS - 5))
        .attr("text-anchor", "middle")
        .text(() => d.Country);
}

function handleMouseOut(d, i) {
    d3.select("#label-" + d.Happiness_Rank).remove();
}

function computeCircleRadius(population) {
    var radius = Math.sqrt(area_scale(population)) + 2;
    return radius;
}

function initScatterPlot() {
    area_scale = d3.scaleLinear()
        .range([20, 1000])
        .domain(d3.extent(countryInfo, function(d) { return d.Population; }));

    var xElem = document.getElementById("scatter-x-dim");
    x_dimension = xElem.options[xElem.selectedIndex].value;

    var yElem = document.getElementById("scatter-y-dim");
    y_dimension = yElem.options[yElem.selectedIndex].value;

    // setting up for x
    var xmax = d3.max(countryInfo, xVal);
    var xmin = d3.min(countryInfo, xVal);
    var xScale = d3.scaleLinear()
        .domain([xmin, xmax])
        .range([VIZ2_LEFT_PADDING, SCATTER_CANVAS_WIDTH - VIZ2_RIGHT_PADDING]);
    x_scale = xScale;
    var xMap = function(d) { return xScale(xValue(d)); }
    var xAxis = d3.axisBottom(xScale);

    // setting up for y
    var ymax = d3.max(countryInfo, yVal);
    var ymin = d3.min(countryInfo, yVal);
    var yScale = d3.scaleLinear()
        .domain([ymin, ymax])
        .range([SCATTER_CANVAS_HEIGHT - VIZ2_BOTTOM_PADDING, VIZ2_TOP_PADDING]);
    y_scale = yScale;
    var yMap = function(d) { return yScale(yValue(d)); }
    var yAxis = d3.axisLeft(yScale);

    // force simulation
    forceSimulation();

    renderScaleAndLabel(xAxis, yAxis);

    var circ = scatter_svg.selectAll("circle")
        .data(countryInfo)
        .enter()
        .append("circle")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", (d) => computeCircleRadius(d.Population))
        .style("fill", (d) => continentToColor(d.Continent))
        .append("svg:title")
        .text((d, i) => { return d.Country; });

}

function forceSimulation() {
    var simulation = d3.forceSimulation(countryInfo)
        .force("x", d3.forceX((d) => x_scale(xVal(d))).strength(1))
        .force("y", d3.forceY((d) => y_scale(yVal(d))).strength(1))
        .force("collide", d3.forceCollide(((d) => computeCircleRadius(d.Population) + 2)))
        .stop();
    for (var i = 0; i < 200; ++i) simulation.tick();
}

function renderScaleAndLabel(xAxis, yAxis) {
    var block_width = (SCATTER_CANVAS_WIDTH - VIZ2_RIGHT_PADDING - VIZ2_LEFT_PADDING) / VIZ2_GRID_COUNT;
    var block_height = (SCATTER_CANVAS_HEIGHT - VIZ2_TOP_PADDING - VIZ2_BOTTOM_PADDING) / VIZ2_GRID_COUNT;

    // grid lines
    for (var i = 0; i < VIZ2_GRID_COUNT; i++) {
        scatter_svg.append("line")
            .attr("class", "gridline")
            .attr("x1", VIZ2_LEFT_PADDING)
            .attr("y1", SCATTER_CANVAS_HEIGHT - VIZ2_BOTTOM_PADDING - i * block_height)
            .attr("x2", SCATTER_CANVAS_WIDTH - VIZ2_RIGHT_PADDING - VIZ2_GRIDLINE_OFFSET)
            .attr("y2", SCATTER_CANVAS_HEIGHT - VIZ2_BOTTOM_PADDING - i * block_height);

        scatter_svg.append("line")
            .attr("class", "gridline")
            .attr("x1", VIZ2_LEFT_PADDING + i * block_width)
            .attr("y1", SCATTER_CANVAS_HEIGHT - VIZ2_BOTTOM_PADDING)
            .attr("x2", VIZ2_LEFT_PADDING + i * block_width)
            .attr("y2", VIZ2_TOP_PADDING - VIZ2_GRIDLINE_OFFSET);
    }

    // x axis
    scatter_svg.append("line")
        .attr("class", "axis")
        .attr("id", "x-axis")
        .attr("x1", VIZ2_LEFT_PADDING)
        .attr("y1", SCATTER_CANVAS_HEIGHT - VIZ2_BOTTOM_PADDING)
        .attr("x2", SCATTER_CANVAS_WIDTH - VIZ2_RIGHT_PADDING)
        .attr("y2", SCATTER_CANVAS_HEIGHT - VIZ2_BOTTOM_PADDING)
        .attr("stroke-width", GRAPH_LINE_WIDTH)
        .attr("stroke", VIZ2_AXIS_COLOR);

    // y axis
    scatter_svg.append("line")
        .attr("class", "axis")
        .attr("id", "y-axis")
        .attr("x1", VIZ2_LEFT_PADDING)
        .attr("y1", SCATTER_CANVAS_HEIGHT - VIZ2_BOTTOM_PADDING)
        .attr("x2", VIZ2_LEFT_PADDING)
        .attr("y2", VIZ2_TOP_PADDING)
        .attr("stroke-width", GRAPH_LINE_WIDTH)
        .attr("stroke", VIZ2_AXIS_COLOR);

}

function clearScaleAndLabel() {
    scatter_svg.select("#x-axis").remove();
    scatter_svg.select("#x-axis-label").remove();
    scatter_svg.select("#y-axis").remove();
    scatter_svg.select("#y-axis-label").remove();
}

function updateScatterPlot() {

    // setting up for x
    var xmax = d3.max(countryInfo, xVal);
    var xmin = d3.min(countryInfo, xVal);
    var xScale = d3.scaleLinear()
        .domain([xmin, xmax])
        .range([VIZ2_LEFT_PADDING, SCATTER_CANVAS_WIDTH - VIZ2_RIGHT_PADDING]);
    x_scale = xScale;
    var xMap = function(d) { return xScale(xValue(d)); }
    var xAxis = d3.axisBottom(x_scale);

    // setting up for y
    var ymax = d3.max(countryInfo, yVal);
    var ymin = d3.min(countryInfo, yVal);
    var yScale = d3.scaleLinear()
        .domain([ymin, ymax])
        .range([SCATTER_CANVAS_HEIGHT - VIZ2_BOTTOM_PADDING, VIZ2_TOP_PADDING]);
    y_scale = yScale;
    var yMap = function(d) { return yScale(yValue(d)); }
    var yAxis = d3.axisLeft(y_scale);

    forceSimulation();

    // rendering scatter plot
    var circ = scatter_svg.selectAll("circle")
        .data(countryInfo)
        .transition()
        .duration(1000)
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);

    // clearScaleAndLabel();
    // renderScaleAndLabel(xAxis, yAxis);
}

function handleDimensionChange(xDim, yDim) {
    if (xDim) {
        x_dimension = xDim;
    }

    if (yDim) {
        y_dimension = yDim;
    }

    updateScatterPlot();
}