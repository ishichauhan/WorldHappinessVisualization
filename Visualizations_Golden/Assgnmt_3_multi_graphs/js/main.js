/*
CSC 196V
Assignment - 3 - 
   Life satisfaction is self-reported as the answer to the following question: “Please imagine a ladder, with steps numbered
   from 0 at the bottom to 10 at the top. The top of the ladder represents the best possible life for you and the bottom of the
   ladder represents the worst possible life for you. On which step of the ladder would you say you personally feel you
   stand at this time?” 
*/



        // Object  Creation Functions
CountryLineChart = function(_parentElement, _happiness, _color){
    this.parentElement = _parentElement;
    this.happiness = _happiness ;
    this.initVis(_color);
};

CountryLineChart.prototype.initVis = function(_color){
    var vis = this;

    vis.margin = { left:45, right:30, top:50, bottom:20 };
    vis.height =310 - vis.margin.top - vis.margin.bottom;
    vis.width = 350 - vis.margin.left - vis.margin.right;

    vis.svg = d3.select(vis.parentElement)
        .append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom);
    vis.g = vis.svg.append("g")
        .attr("transform", "translate(" + vis.margin.left + 
            ", " + vis.margin.top + ")");

    vis.t = function() { return d3.transition().duration(500); }

    vis.bisectDate = d3.bisector(function(d) { return d.date; }).left;

    vis.linePath = vis.g.append("path")
        .attr("class", "line")
        .attr("fill", "")
        .attr("stroke", _color)
        .attr("stroke-width", "4px");

    vis.g.append("text")
        .attr("x", vis.width/2)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("font-family", "Verdana")
        .text(vis.happiness)
        .attr("stroke", _color)
        .attr("stroke-width", "0.5px")
        .attr("font-weight", 500);
// Labels
/*var xPlot = g.append("text")
    .attr("class", "x axisLabel")
    .attr("y", vis.height + 50)
    .attr("x", vis.width / 2)
    .attr("font-size", "10px")s
    .attr("text-anchor", "middle")
    .text("Years");

  vis.yLabel = g.append("text")
    .attr("class", "y axisLabel")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", -170)
    .attr("font-size", "10px")
    .attr("text-anchor", "middle")
    .text("Happiness_Factor")
    */
    vis.x = d3.scaleTime().range([0, vis.width]);
    vis.y = d3.scaleLinear().range([vis.height, 0]);

    vis.yAxisCall = d3.axisLeft()
    vis.xAxisCall = d3.axisBottom()
        .ticks(6);
    vis.xAxis = vis.g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + vis.height +")");
    vis.yAxis = vis.g.append("g")
        .attr("class", "y axis");

    vis.wrangleData();
};


CountryLineChart.prototype.wrangleData = function(){
    var vis = this;

    vis.yVariable = $("#attribute-select").val()

    // Filter data based on selections
    vis.sliderValues = $("#date-slider").slider("values")
    vis.dataFiltered = filteredData[vis.happiness].filter(function(d) {
        return ((d.date >= vis.sliderValues[0]) && (d.date <= vis.sliderValues[1]))
    })

    vis.updateVis();
};


CountryLineChart.prototype.updateVis = function(){
    var vis = this;

    // Update scales
    vis.x.domain(d3.extent(vis.dataFiltered, function(d) { return d.date; }));
    vis.y.domain([d3.min(vis.dataFiltered, function(d) { return d[vis.yVariable]; }) / 1.005, 
        d3.max(vis.dataFiltered, function(d) { return d[vis.yVariable]; }) * 1.005]);

    // Fix for y-axis format values
    var formatSi = d3.format(".4s");
    function formatAbbreviation(x) {
      var s = formatSi(x);
      switch (s[s.length - 1]) {
        case "G": return s.slice(0, -1) + "B";
        case "k": return s.slice(0, -1) + "K";
        case "m": return s.slice(0, -1) /10 + " %";
      }
      return s;
    }

    // Update axes
    vis.xAxisCall.scale(vis.x);
    vis.xAxis.transition(vis.t()).call(vis.xAxisCall);
    vis.yAxisCall.scale(vis.y);
    vis.yAxis.transition(vis.t()).call(vis.yAxisCall.tickFormat(formatAbbreviation));

    // Discard old tooltip elements
    d3.select(".focus."+vis.happiness).remove();
    d3.select(".overlay."+vis.happiness).remove();

    var focus = vis.g.append("g")
        .attr("class", "focus " + vis.happiness)
        .style("display", "none");

    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", vis.height);

    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", 0)
        .attr("x2", vis.width);

    focus.append("circle")
        .attr("r", 5);

    focus.append("text")
        .attr("x", 15)
        .attr("dy", ".31em");

    vis.svg.append("rect")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
        .attr("class", "overlay " + vis.happiness)
        .attr("width", vis.width)
        .attr("height", vis.height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
        var x0 = vis.x.invert(d3.mouse(this)[0]),
            i = vis.bisectDate(vis.dataFiltered, x0, 1),
            d0 = vis.dataFiltered[i - 1],
            d1 = vis.dataFiltered[i],
            d = (d1 && d0) ? (x0 - d0.date > d1.date - x0 ? d1 : d0) : 0;
        focus.attr("transform", "translate(" + vis.x(d.date) + "," + vis.y(d[vis.yVariable]) + ")");
        focus.select("text").text(function() { return d3.format(",")(d[vis.yVariable].toFixed(2)); });
        focus.select(".x-hover-line").attr("y2", vis.height - vis.y(d[vis.yVariable]));
        focus.select(".y-hover-line").attr("x2", -vis.x(d.date));
    }

    var line = d3.line()
        .x(function(d) { return vis.x(d.date); })
        .y(function(d) { return vis.y(d[vis.yVariable]); });

    vis.g.select(".line")
        .transition(vis.t)
        .attr("d", line(vis.dataFiltered));

    /*var newText = (vis.yValue == "life_ladder") ? "Happiness Factor (1 - 10)" :
        (vis.yValue == "GDP") ?  "GDP per Capita" : 
        (vis.yValue == "social_support") ? "Social Support ":
        (vis.yValue == "freedom") ? "Freedom to make life choices " : 
        ((vis.yValue == "confidence_in_gov") ? "Confidence in Government " :"Healthy Life Expectancy Years")
        vis.yLabel.text(newText);
*/
};
//################################### main ##################################
var filteredData;
var CountrylineChart_obj1,
    CountrylineChart_obj2,
    CountrylineChart_obj3,
    CountrylineChart_obj4,
    CountrylineChart_obj5,
    CountrylineChart_obj6; 

var parseTime = d3.timeParse("%d/%m/%Y");
var formatTime = d3.timeFormat("%d/%m/%Y");

// Event listeners
$("#happiness-select").on("change", updateCharts)
$("#attribute-select").on("change", updateCharts)

// Add jQuery UI slider
$("#date-slider").slider({
    range: true,
    max: parseTime("01/01/2016").getTime(),
    min: parseTime("01/01/2006").getTime(),
    step: 30, // One day
    values: [parseTime("01/01/2006").getTime(), parseTime("01/01/2016").getTime()],
    slide: function(event, ui){
        $("#dateLabel1").text(formatTime(new Date(ui.values[0])));
        $("#dateLabel2").text(formatTime(new Date(ui.values[1])));
        updateCharts();
    }
});

d3.json("data/happiness.json").then(function(data){

    // Prepare and clean data
    filteredData = {};
    for (var happiness in data) {
        if (!data.hasOwnProperty(happiness)) {
            continue;
        }
        filteredData[happiness] = data[happiness].filter(function(d){
            return !(d["life_ladder"] == null)
        })
        filteredData[happiness].forEach(function(d){
            d["life_ladder"] = +d["life_ladder"];
            d["date"] = parseTime(d["date"]);
            d["GDP"] = +d["GDP"];
            d["social_support"] = +d["social_support"];
            d["life_expectancy"] = +d["life_expectancy"]; 
            d["freedom"] = +d["freedom"]; 
            d["confidence_in_gov"] = +d["confidence_in_gov"]
        });
    };

    CountrylineChart_obj1 = new CountryLineChart("#chart-area1", "Central-African-Republic", "red");
    CountrylineChart_obj2 = new CountryLineChart("#chart-area2", "China", "black");
    CountrylineChart_obj3 = new CountryLineChart("#chart-area3", "India", "purple");
    CountrylineChart_obj4 = new CountryLineChart("#chart-area1", "Norway", "green");
    CountrylineChart_obj5 = new CountryLineChart("#chart-area2", "USA", "blue");
    CountrylineChart_obj6 = new CountryLineChart("#chart-area3", "Japan", "magenta");

});

function updateCharts(){
    CountrylineChart_obj1.wrangleData()
    CountrylineChart_obj2.wrangleData()
    CountrylineChart_obj3.wrangleData()
    CountrylineChart_obj4.wrangleData()
    CountrylineChart_obj5.wrangleData()
    CountrylineChart_obj6.wrangleData()
}


