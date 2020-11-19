/* * * * * * * * * * * * * *
*     class BrushVis       *
* * * * * * * * * * * * * */

BrushVis = function(_parentElement, companies) {
    this.parentElement = _parentElement;
    this.companies = companies;
    this.displayData = [];

    this.parseDate = d3.timeParse("%m/%d/%Y");
    this.formatDate = d3.timeFormat("%m/%d/%Y");

    this.initVis();
};

// init brushVis
BrushVis.prototype.initVis = function() {
    let vis = this;

    vis.margin = {top: 20, right: 50, bottom: 20, left: 50};
    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // clip path
    vis.svg.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);

    // add title
    vis.svg.append('g')
        .attr('class', 'title')
        .append('text')
        .text('Timeline')
        .attr('transform', `translate(${vis.width/2}, 20)`)
        .attr('text-anchor', 'middle')
        .style("fill", "blue")

    // init scales
    vis.x = d3.scaleTime().range([0, vis.width]);
    vis.y = d3.scaleLinear().range([vis.height, 0]);

    // init x & y axis
    vis.xAxis = vis.svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.yAxis = vis.svg.append("g")
        .attr("class", "axis axis--y");

    // init pathGroup
    vis.pathGroup = vis.svg.append('g').attr('class','pathGroup');

    // init path one (average)
    vis.pathOne = vis.pathGroup
        .append('path')
        .attr("class", "pathOne");

    // init path generator
    vis.area = d3.area()
        .curve(d3.curveMonotoneX)
        .x(function(d) { return vis.x(d.date); })
        .y0(vis.y(0))
        .y1(function(d) { return vis.y(d.numCompanies); });

    // init brushGroup:
    vis.brushGroup = vis.svg.append("g")
        .attr("class", "brush");

    // init brush
    vis.brush = d3.brushX()
        .extent([[0, 0], [vis.width, vis.height]])
        .on("brush end", function(event){
            selectedTimeRange = [vis.x.invert(event.selection[0]), vis.x.invert(event.selection[1])];
            myMapVis.wrangleData();

        });

    // init basic data processing
    this.wrangleData();
};

// init basic data processing - prepares data for brush - done only once
BrushVis.prototype.wrangleData = function() {
    let vis = this;

    // convert date to string for grouping
    vis.companies.forEach(function(d) {
        d.founded_at = vis.formatDate(d.founded_at);
    })

    // rearrange data structure and group by date
    let dataByDate = Array.from(d3.group(vis.companies, d => d.founded_at), ([key, value]) => ({key, value}))

    vis.preProcessedData = [];

    // iterate over each date
    dataByDate.forEach( day => {
        let numCompanies = 0;

        day.value.forEach( entry => {
            numCompanies += 1;
        });

        vis.preProcessedData.push (
            {date: vis.parseDate(day.key), numCompanies: numCompanies}
        )
    });

    this.updateVis();
};


// updateVis
BrushVis.prototype.updateVis = function() {
    let vis = this;

    // update domains
    vis.x.domain( d3.extent(vis.preProcessedData, function(d) { return d.date }) );
    vis.y.domain( d3.extent(vis.preProcessedData, function(d) { return d.numCompanies }) );

    // draw x & y axis
    vis.xAxis.transition()
        .duration(400)
        .call(d3.axisBottom(vis.x))
        .attr("stroke", "blue")
        .attr("stroke-width", "0.5px");

    vis.yAxis.transition()
        .duration(400)
        .call(d3.axisLeft(vis.y).ticks(5))
        .attr("stroke", "blue")
        .attr("stroke-width", "0.5px");

    // draw pathOne
    vis.pathOne.datum(vis.preProcessedData)
        .transition().duration(400)
        .attr("d", vis.area)
        .attr("fill", "#428A8D")
        .attr("stroke", "#136D70")
        .attr("clip-path", "url(#clip)");

    vis.brushGroup
        .call(vis.brush);
};