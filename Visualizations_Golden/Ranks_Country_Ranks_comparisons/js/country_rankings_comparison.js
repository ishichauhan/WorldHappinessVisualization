/*****************************************************************************
 *  Viz4 functions
 */

function initViz4Plot(c1, c2) {

    // Render ranking gridlines
    var line_top = TOP_PADDING + NUMERAL_LABEL_GUTTER;
    var line_bottom = CANVAS_HEIGHT - BOTTOM_PADDING;

    for (l = 0; l < RANKING_GRIDLINES.length; l++) {
        var xCoord = xScale(RANKING_GRIDLINES[l]);
        var gridlineCoords = [
            [xCoord, line_top],
            [xCoord, line_bottom]
        ];
        var lineGenerator = d3.line();
        var pathString = lineGenerator(gridlineCoords);
        viz4_svg.append("path")
            .attr("class", "gridline")
            .attr('d', pathString);
        viz4_svg.append("text")
            .attr("class", "ranking-gridline-label in-viz-label")
            .attr("text-anchor", "middle")
            .attr("x", xCoord)
            .attr("y", TOP_PADDING)
            .style("fill", IN_VIZ_LABEL_COLOR)
            .text(RANKING_GRIDLINES[l]);
    }

    // Render dimension labels
    viz4_svg.append("text")
        .attr("class", "dimension-label in-viz-label")
        .attr("text-anchor", "end")
        .attr("x", LEFT_PADDING - TEXT_LABEL_GUTTER)
        .attr("y", TOP_PADDING)
        .style("fill", IN_VIZ_LABEL_COLOR)
        .text("Rank");

    for (d = 0; d < DIMENSIONS_RANK.length; d++) {
        var yCoord = (yScale(d) + yScale(d + 1)) / 2;
        axis_coords[d] = yCoord;
        viz4_country1_ranking_data[d] = countryInfoMap.get(c1)[DIMENSIONS_RANK[d].column_name];
        viz4_country2_ranking_data[d] = countryInfoMap.get(c2)[DIMENSIONS_RANK[d].column_name];

        viz4_svg.append("text")
            .attr("class", "dimension-label in-viz-label")
            .attr("text-anchor", "end")
            .attr("x", LEFT_PADDING - TEXT_LABEL_GUTTER)
            .attr("y", yCoord - DIMENSION_LABEL_Y_OFFSET)
            .style("fill", IN_VIZ_LABEL_COLOR)
            .text(DIMENSIONS_RANK[d].display_name);
    }

    // Render guide lines
    var guide_lines = viz4_svg.selectAll(".viz4-guideline")
        .data(viz4_country1_ranking_data)
        .enter()
        .append("line")
        .attr("class", "viz4-guideline")
        .attr("x1", (d, i) => xScale(viz4_country1_ranking_data[i]))
        .attr("y1", (d, i) => axis_coords[i])
        .attr("x2", (d, i) => xScale(viz4_country2_ranking_data[i]))
        .attr("y2", (d, i) => axis_coords[i])
        .attr("stroke-width", GRAPH_LINE_WIDTH)
        .attr("stroke", GRAPH_LINE_COLOR)
        .attr("stroke-dasharray", DASHARRAY_STYLE);

    // Render square for country 1
    var sqaure = viz4_svg.selectAll(".country1-sq")
        .data(viz4_country1_ranking_data.slice(0, 1))
        .enter()
        .append("rect")
        .attr("class", "country1-sq")
        .attr("x", (d, i) => (xScale(d) - SQ_SIDE_LENGTH / 2))
        .attr("y", (d, i) => (axis_coords[0] - SQ_SIDE_LENGTH / 2))
        .attr("height", SQ_SIDE_LENGTH)
        .attr("width", SQ_SIDE_LENGTH)
        .attr("rx", SQ_CORNER_RADIUS)
        .attr("ry", SQ_CORNER_RADIUS)
        .attr("fill", VIZ4_C1_ACCENT_COLOR)
        .attr("opacity", CIRCLE_OPACITY)
        .on("mouseover", handleViz4SquareMouseOver)
        .on("mouseout", handleViz4MouseOut);

    // Render circles for country 1
    var circ = viz4_svg.selectAll(".country1-circle")
        .data(viz4_country1_ranking_data.slice(1, DIMENSIONS_RANK.length))
        .enter()
        .append("circle")
        .attr("class", "country1-circle")
        .attr("cx", (d, i) => xScale(d))
        .attr("cy", (d, i) => axis_coords[i + 1])
        .attr("r", CIRCLE_RADIUS)
        .attr("fill", VIZ4_C1_ACCENT_COLOR)
        .attr("opacity", CIRCLE_OPACITY)
        .on("mouseover", handleViz4CircleMouseOver)
        .on("mouseout", handleViz4MouseOut);

    // Render square for country 2
    var sqaure = viz4_svg.selectAll(".country2-sq")
        .data(viz4_country2_ranking_data.slice(0, 1))
        .enter()
        .append("rect")
        .attr("class", "country2-sq")
        .attr("x", (d, i) => (xScale(d) - SQ_SIDE_LENGTH / 2))
        .attr("y", (d, i) => (axis_coords[0] - SQ_SIDE_LENGTH / 2))
        .attr("height", SQ_SIDE_LENGTH)
        .attr("width", SQ_SIDE_LENGTH)
        .attr("rx", SQ_CORNER_RADIUS)
        .attr("ry", SQ_CORNER_RADIUS)
        .attr("fill", VIZ4_C2_ACCENT_COLOR)
        .attr("opacity", CIRCLE_OPACITY)
        .on("mouseover", handleViz4SquareMouseOver)
        .on("mouseout", handleViz4MouseOut);

    // Render circles for country 2
    var circ = viz4_svg.selectAll(".country2-circle")
        .data(viz4_country2_ranking_data.slice(1, DIMENSIONS_RANK.length))
        .enter()
        .append("circle")
        .attr("class", "country2-circle")
        .attr("cx", (d, i) => xScale(d))
        .attr("cy", (d, i) => axis_coords[i + 1])
        .attr("r", CIRCLE_RADIUS)
        .attr("fill", VIZ4_C2_ACCENT_COLOR)
        .attr("opacity", CIRCLE_OPACITY)
        .on("mouseover", handleViz4CircleMouseOver)
        .on("mouseout", handleViz4MouseOut);
}

function updateViz4Plot(c1, c2) {
    if (c1) {
        for (d = 0; d < DIMENSIONS_RANK.length; d++) {
            viz4_country1_ranking_data[d] = countryInfoMap.get(c1)[DIMENSIONS_RANK[d].column_name];
        }

        var guide_lines = viz4_svg.selectAll(".viz4-guideline")
            .data(viz4_country1_ranking_data)
            .transition()
            .duration(TRANSITION_DURATION)
            .attr("x1", (d, i) => xScale(d));

        var sq = viz4_svg.selectAll(".country1-sq")
            .data(viz4_country1_ranking_data.slice(0, 1))
            .transition()
            .duration(TRANSITION_DURATION)
            .attr("x", (d, i) => (xScale(d) - SQ_SIDE_LENGTH / 2));

        var circ = viz4_svg.selectAll(".country1-circle")
            .data(viz4_country1_ranking_data.slice(1, DIMENSIONS_RANK.length))
            .transition()
            .duration(TRANSITION_DURATION)
            .attr("cx", (d, i) => xScale(d));
    }

    if (c2) {
        for (d = 0; d < DIMENSIONS_RANK.length; d++) {
            viz4_country2_ranking_data[d] = countryInfoMap.get(c2)[DIMENSIONS_RANK[d].column_name];
        }

        var guide_lines = viz4_svg.selectAll(".viz4-guideline")
            .data(viz4_country2_ranking_data)
            .transition()
            .duration(TRANSITION_DURATION)
            .attr("x2", (d, i) => xScale(d));

        var sq = viz4_svg.selectAll(".country2-sq")
            .data(viz4_country2_ranking_data.slice(0, 1))
            .transition()
            .duration(TRANSITION_DURATION)
            .attr("x", (d, i) => (xScale(d) - SQ_SIDE_LENGTH / 2));

        var circ = viz4_svg.selectAll(".country2-circle")
            .data(viz4_country2_ranking_data.slice(1, DIMENSIONS_RANK.length))
            .transition()
            .duration(TRANSITION_DURATION)
            .attr("cx", (d, i) => xScale(d));
    }
}

function handleViz4CountryChange(c1, c2) {
    updateViz4Plot(c1, c2);
}


function handleViz4CircleMouseOver(d, i) {
    viz4_svg.append("text")
        .attr('id', "viz4-label-" + d.Happiness_Rank)
        .attr('x', () => xScale(d))
        .attr('y', () => (axis_coords[i + 1] - CIRCLE_RADIUS - 5))
        .attr("text-anchor", "middle")
        .text(d);
}

function handleViz4SquareMouseOver(d, i) {
    viz4_svg.append("text")
        .attr('id', "viz4-label-" + d.Happiness_Rank)
        .attr('x', () => xScale(d))
        .attr('y', () => (axis_coords[i] - CIRCLE_RADIUS - 5))
        .attr("text-anchor", "middle")
        .text(d);
}

function handleViz4MouseOut(d, i) {
    d3.select("#viz4-label-" + d.Happiness_Rank).remove();
}