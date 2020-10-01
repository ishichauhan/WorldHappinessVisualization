/*CSC 196V
Assignment - 3 - 
   Life satisfaction is self-reported as the answer to the following question: “Please imagine a ladder, with steps numbered
   from 0 at the bottom to 10 at the top. The top of the ladder represents the best possible life for you and the bottom of the
   ladder represents the worst possible life for you. On which step of the ladder would you say you personally feel you
   stand at this time?” 
*/

var margin = { left:80, right:100, top:50, bottom:100 },
    height = 500 - margin.top - margin.bottom, 
    width = 800 - margin.left - margin.right;



var svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)


var t = function(){ return d3.transition().duration(500); }


var g = svg.append("g")
       //.attr("d", area)
       .attr("transform", "translate(" + margin.left + 
            ", " + margin.top + ")");


var time_parse = d3.timeParse("%d/%m/%Y");
var time_format = d3.timeFormat("%d/%m/%Y");
var date_bisect = d3.bisector(function(d) { return d.date; }).left;

// Add the line for the first time
g.append("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("stroke-width", "3px");


// Labels
var xPlot = g.append("text")
    .attr("class", "x axisLabel")
    .attr("y", height + 50)
    .attr("x", width / 2)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Years");
var yLabel = g.append("text")
    .attr("class", "y axisLabel")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", -170)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Happiness_Factor")

// Scales
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// X-axis
var x_axisbottom = d3.axisBottom()
    .ticks(10);
var x_axis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height +")");

// Y-axis
var y_axisleft = d3.axisLeft()
var y_axis = g.append("g")
    .attr("class", "y axis");

// Event listeners
$("#happy-select").on("change", update)
$("#var-select").on("change", update)

// Add jQuery UI slider
$("#date-slider").slider({
    range: true,
    max: time_parse("31/12/2016").getTime(),
    min: time_parse("01/01/2006").getTime(),
    step: 30, // One day
    values: [time_parse("01/01/2006").getTime(), time_parse("31/12/2016").getTime()],
    slide: function(event, ui){
        $("#dateLabel1").text(time_format(new Date(ui.values[0])));
        $("#dateLabel2").text(time_format(new Date(ui.values[1])));
        update();
    }
});

d3.json("data/happiness.json").then(function(data){
    // console.log(data);

    // Prepare and clean data
    Cleaned_Data = {};
    for (var happy in data) {
        if (!data.hasOwnProperty(happy)) {
            continue;
        }
        Cleaned_Data[happy] = data[happy].filter(function(d){
            return !((d["life_ladder"] == null ))
        })
        Cleaned_Data[happy].forEach(function(d){
            d["life_ladder"] = +d["life_ladder"];
            d["date"] = time_parse(d["date"]);
            d["GDP"] = +d["GDP"];
            d["social_support"] = +d["social_support"];
            d["life_expectancy"] = +d["life_expectancy"]; 
            d["freedom"] = +d["freedom"]; 
            d["confidence_in_gov"] = +d["confidence_in_gov"]
        });
    }

    // Run the visualization for the first time
    update();
})

function update() {
    // Filter data based on selections
    var happy = $("#happy-select").val(),
        yValue = $("#var-select").val(),
        sliderValues = $("#date-slider").slider("values");
    var dataTimeFiltered = Cleaned_Data[happy].filter(function(d){
        return ((d.date >= sliderValues[0]) && (d.date <= sliderValues[1]))
    });

    // Update scales
    x.domain(d3.extent(dataTimeFiltered, function(d){ return d.date; }));
    y.domain([d3.min(dataTimeFiltered, function(d){ return d[yValue]; }) / 1.005, 
        d3.max(dataTimeFiltered, function(d){ return d[yValue]; }) * 1.005]);

    // Fix for format values
   var formatSi = d3.format(".5s");
    function formatAbbreviation(x) {
      var s = formatSi(x);
     switch (s[s.length - 1]) {
        case "G": return s.slice(0, -1) + "B";
        case "k": return s.slice(0, -1) + "K";
        case "m": return s.slice(0, -1) / 10 + " % ";
      } 
      return s;
    }
    // Update axes
    x_axisbottom.scale(x);
    x_axis.transition(t()).call(x_axisbottom);
    y_axisleft.scale(y);
    y_axis.transition(t()).call(y_axisleft.tickFormat(formatAbbreviation));

    // Clear old tooltips
    d3.select(".focus").remove();
    d3.select(".overlay").remove();

    // Tooltip code
    var focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");
    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", height);
    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", 0)
        .attr("x2", width);
    focus.append("circle")
        .attr("r", 5);
    focus.append("text")
        .attr("x", 15)
        .attr("dy", ".71em");
    svg.append("rect")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);
        
    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = date_bisect(dataTimeFiltered, x0, 1),
            d0 = dataTimeFiltered[i - 1],
            d1 = dataTimeFiltered[i],
            d = (d1 && d0) ? (x0 - d0.date > d1.date - x0 ? d1 : d0) : 0;
        focus.attr("transform", "translate(" + x(d.date) + "," + y(d[yValue]) + ")");
        focus.select("text").text(function() { return d3.format(",")(d[yValue].toFixed(4)); });
        focus.select(".x-hover-line").attr("y2", height - y(d[yValue]));
        focus.select(".y-hover-line").attr("x2", -x(d.date));
    }

    // Path generator
    line = d3.line()
        .x(function(d){ return x(d.date); })
        .y(function(d){ return y(d[yValue]); });

    var area = d3.area()
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d[yValue]); });

    // Update our line path
    g.select(".line")
        .transition(t)
        .attr("d", line(dataTimeFiltered));

    // Update y-axis label
    var newText = (yValue == "life_ladder") ? "Happiness Factor (1 - 10)" :
        (yValue == "GDP") ?  "GDP per Capita" : 
        (yValue == "social_support") ? "Social Support ":
        (yValue == "freedom") ? "Freedom to make life choices " : 
        ((yValue == "confidence_in_gov") ? "Confidence in Government " :"Healthy Life Expectancy Years")
    yLabel.text(newText);
}
