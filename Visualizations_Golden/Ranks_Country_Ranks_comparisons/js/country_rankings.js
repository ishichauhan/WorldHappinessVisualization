/*****************************************************************************
 *  Viz3 functions
 */

function initViz3Plot(country) {

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
        viz3_svg.append("path")
            .attr("class", "gridline")
            .attr('d', pathString);
        viz3_svg.append("text")
            .attr("class", "ranking-gridline-label in-viz-label")
            .attr("text-anchor", "middle")
            .attr("x", xCoord)
            .attr("y", TOP_PADDING)
            .style("fill", IN_VIZ_LABEL_COLOR)
            .text(RANKING_GRIDLINES[l]);
    }

    // Render dimension labels
    viz3_svg.append("text")
        .attr("class", "dimension-label in-viz-label")
        .attr("text-anchor", "end")
        .attr("x", LEFT_PADDING - TEXT_LABEL_GUTTER)
        .attr("y", TOP_PADDING)
        .style("fill", IN_VIZ_LABEL_COLOR)
        .text("Rank");

    for (d = 0; d < DIMENSIONS_RANK.length; d++) {
        var yCoord = (yScale(d) + yScale(d + 1)) / 2;
        axis_coords[d] = yCoord;
        viz3_ranking_data[d] = countryInfoMap.get(country)[DIMENSIONS_RANK[d].column_name];
        viz3_svg.append("text")
            .attr("class", "dimension-label in-viz-label")
            .attr("text-anchor", "end")
            .attr("x", LEFT_PADDING - TEXT_LABEL_GUTTER)
            .attr("y", yCoord - DIMENSION_LABEL_Y_OFFSET)
            .style("fill", IN_VIZ_LABEL_COLOR)
            .text(DIMENSIONS_RANK[d].display_name);
    }

    // Render graph lines
    var ref_line = viz3_svg.append("line")
        .attr("class", "viz3-refline")
        .attr("x1", xScale(viz3_ranking_data[0]))
        .attr("y1", axis_coords[0])
        .attr("x2", xScale(viz3_ranking_data[0]))
        .attr("y2", line_bottom)
        .attr("stroke-width", GRAPH_LINE_WIDTH)
        .attr("stroke", GRAPH_LINE_COLOR);

    // all guide lines has (x1, y1) on ref_line, and (x2, y2) at center of circle
    var guide_lines = viz3_svg.selectAll(".viz3_guideline")
        .data(viz3_ranking_data.slice(1, DIMENSIONS_RANK.length))
        .enter()
        .append("line")
        .attr("class", "viz3-guideline")
        .attr("x1", (d, i) => xScale(viz3_ranking_data[0]))
        .attr("y1", (d, i) => axis_coords[i + 1])
        .attr("x2", (d, i) => xScale(d))
        .attr("y2", (d, i) => axis_coords[i + 1])
        .attr("stroke-width", GRAPH_LINE_WIDTH)
        .attr("stroke", GRAPH_LINE_COLOR)
        .attr("stroke-dasharray", DASHARRAY_STYLE);

    // Render happiness square
    var sqaure = viz3_svg.selectAll("rect")
        .data(viz3_ranking_data.slice(0, 1))
        .enter()
        .append("rect")
        .attr("class", "happiness-ranking-sq")
        .attr("x", (d, i) => (xScale(d) - SQ_SIDE_LENGTH / 2))
        .attr("y", (d, i) => (axis_coords[0] - SQ_SIDE_LENGTH / 2))
        .attr("height", SQ_SIDE_LENGTH)
        .attr("width", SQ_SIDE_LENGTH)
        .attr("rx", SQ_CORNER_RADIUS)
        .attr("ry", SQ_CORNER_RADIUS)
        .attr("fill", VIZ3_ACCENT_COLOR)
        .attr("opacity", CIRCLE_OPACITY)
        .on("mouseover", handleViz3SquareMouseOver)
        .on("mouseout", handleViz3MouseOut);

    // Render circles
    var circ = viz3_svg.selectAll("circle")
        .data(viz3_ranking_data.slice(1, DIMENSIONS_RANK.length))
        .enter()
        .append("circle")
        .attr("class", "dimension-ranking-circle")
        .attr("cx", (d, i) => xScale(d))
        .attr("cy", (d, i) => axis_coords[i + 1])
        .attr("r", CIRCLE_RADIUS)
        .attr("fill", VIZ3_ACCENT_COLOR)
        .attr("opacity", CIRCLE_OPACITY)
        .on("mouseover", handleViz3CircleMouseOver)
        .on("mouseout", handleViz3MouseOut);
}

function updateViz3Plot(country) {
    for (d = 0; d < DIMENSIONS_RANK.length; d++) {
        viz3_ranking_data[d] = countryInfoMap.get(country)[DIMENSIONS_RANK[d].column_name];
    }

    var ref_line = viz3_svg.select(".viz3-refline")
        .transition()
        .duration(TRANSITION_DURATION)
        .attr("x1", xScale(viz3_ranking_data[0]))
        .attr("x2", xScale(viz3_ranking_data[0]))

    var guide_lines = viz3_svg.selectAll(".viz3-guideline")
        .data(viz3_ranking_data.slice(1, DIMENSIONS_RANK.length))
        .transition()
        .duration(TRANSITION_DURATION)
        .attr("x1", xScale(viz3_ranking_data[0]))
        .attr("x2", (d, i) => xScale(d));


    var sq = viz3_svg.selectAll(".happiness-ranking-sq")
        .data(viz3_ranking_data.slice(0, 1))
        .transition()
        .duration(TRANSITION_DURATION)
        .attr("x", (d, i) => (xScale(d) - SQ_SIDE_LENGTH / 2));

    var circ = viz3_svg.selectAll(".dimension-ranking-circle")
        .data(viz3_ranking_data.slice(1, DIMENSIONS_RANK.length))
        .transition()
        .duration(TRANSITION_DURATION)
        .attr("cx", (d, i) => xScale(d));

}

function handleViz3CircleMouseOver(d, i) {
    viz3_svg.append("text")
        .attr('id', "viz3-label-" + d.Happiness_Rank)
        .attr('x', () => xScale(d))
        .attr('y', () => (axis_coords[i + 1] - CIRCLE_RADIUS - 5))
        .attr("text-anchor", "middle")
        .text(d);
}

function handleViz3SquareMouseOver(d, i) {
    viz3_svg.append("text")
        .attr('id', "viz3-label-" + d.Happiness_Rank)
        .attr('x', () => xScale(d))
        .attr('y', () => (axis_coords[i] - CIRCLE_RADIUS - 5))
        .attr("text-anchor", "middle")
        .text(d);
}

function handleViz3MouseOut(d, i) {
    d3.select("#viz3-label-" + d.Happiness_Rank).remove();
}

function handleViz3CountryChange(country) {
    updateViz3Plot(country);
}