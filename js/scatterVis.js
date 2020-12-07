/* * * * * * * * * * * * * *
*          ScatterVis      *
* * * * * * * * * * * * * */

class ScatterVis {

    // constructor method to initialize ScatterVis object
    constructor(parentElement, companies) {
        this.parentElement = parentElement;
        this.companies = companies;

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 10, right: 30, bottom: 30, left: 60};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr("transform", "translate(" + vis.margin.left + ", " + vis.margin.top + ")")

        vis.x = d3.scaleLinear()
            .domain([0, d3.max(vis.companies, d => d.raised_amount_usd)])
            .range([vis.width * 0.10, vis.width*0.9]);
            // .range([vis.width * 0.17, vis.width * 0.9]);

        vis.y = d3.scaleLinear()
            .domain([0, d3.max(vis.companies, d => d.price_amount)*1.1])
            .range([vis.height*0.9, vis.height*0.05])

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(" + 0 + ", " + vis.height*0.9 + ")")
            .call(vis.xAxis)
            .style("stroke", "white")
            .attr("stroke-width", 0.5)
            .attr("color", "white")
            .style("font-size", "12px")
            .append("text")
            .attr("class", "scatterLabel")
            .attr("x", vis.width/2)
            .attr("y", vis.height*0.09)
            .style("text-anchor", "middle")
            .text("Funding Amount (millions USD)")
            .style("fill", "white")
            .style("font-family", '"IBM Plex Mono", monospace')
            .style("font-size", "18px")

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis")
            // .attr("transform", "translate(80, 0)")
            .attr("transform", "translate(" + vis.width * 0.10 + ", 0)")
            .call(vis.yAxis)
            .style("stroke", "white")
            .attr("stroke-width", 0.5)
            .attr("color", "white")
            .style("font-size", "12px")
            .append("text")
            .attr("class", "scatterLabel")
            .attr("transform", "translate(-80,"+vis.height/2 + ")rotate(-90)")
            .attr("dy", ".71em")
            .style("text-anchor", "middle")
            .text("Acquisition Amount (millions USD)")
            .style("fill", "white")
            .style("font-family", '"IBM Plex Mono", monospace')
            .style("font-size", "18px")

        // tooltip
        // vis.tooltip = d3.select("body").append("div")
        //     .attr("class", "tooltip")
        //     .attr("id", "scatterTooltip");

        vis.companies.sort((a, b) => {
            return a.acquired_at - b.acquired_at;
        })

    }

    startAnimation() {
        let vis = this;

        vis.svg.selectAll("circle").remove();
        vis.svg.selectAll(".regression").remove();

        vis.timer = 2006;

        var counter = setInterval(function() {
            vis.timer++;
            d3.select("#scatterYear").text("Current year: " + vis.timer).style("font-size", "18px");
            vis.drawPoints();

            if (vis.timer == 2014) {
                clearInterval(counter);
            }
        }, 2000);

    }

    drawPoints() {
        let vis = this;

        // version if want to transition circles with set delay
        vis.circle = vis.svg.selectAll("circle")
            .data(vis.companies);

        vis.circle.enter().append("circle")
            .merge(vis.circle)
            .attr("class", d => "scatterCircle " + d.company_market.replace(/\s/g, ""))
            .transition()
            .duration(1000)

            .attr("cx", d => vis.x(d.raised_amount_usd))
            .attr("cy", d => vis.y(d.price_amount))
            .style("fill", "#6572ff")
            .attr("r", function(d){
                if (d.acquired_year == vis.timer){
                    return 8;
                }
                else if (d.acquired_year < vis.timer){
                    return 5;
                }
                else {
                    return 0;
                }
            })
            .style("opacity", function(d){
                if (d.acquired_year == vis.timer){
                    return 0.8;
                }
                else if (d.acquired_year < vis.timer){
                    return 0.4;
                }
                else {
                    return 0;
                }
            })
            .attr("stroke-width", function(d){
                if (d.acquired_year == vis.timer){
                    return 1;
                }
                else if (d.acquired_year < vis.timer){
                    return 1;
                }
                else {
                    return 0;
                }
            })
            .attr("stroke", "white")

        if (vis.timer == 2014){
            setTimeout(function() {
                vis.svg.selectAll("circle")
                    .attr("r", 5)
                    .style("opacity", 0.8);

                vis.drawLine();
            }, 2000)
        }

        vis.circle.exit().remove();

        vis.svg.selectAll("circle").on("mouseover", function(event, d) {
            d3.select(this)
                .style("fill", "#ffd74c")
                .style("opacity", 1);

            d3.select("#scatter-tooltip")
                .style("opacity", 1)
                .html(`
                     <div style="margin-top: 10vh">
                         <h3>${d.company_name}<h3>
                         <h6> Industry: ${d.company_market}</h6>
                         <h6> Acquisition Amount: ${displayFunding(d.price_amount)} M</h6>
                         <h6> Funding Amount: ${displayFunding(d.raised_amount_usd)} M</h6>
                     </div>`);

        })
            .on("mouseout", function(d) {
                d3.select(this)
                    .style("fill", "#6572ff")
                    .style("opacity", d => {
                        if (d.acquired_year == vis.timer){
                            return 0.8;
                        }
                        else if (d.acquired_year < vis.timer){
                            return 0.4;
                        }
                        else {
                            return 0;
                        }
                    });

                d3.select("#scatter-tooltip")
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })

    }
    // http://duspviz.mit.edu/d3-workshop/transitions-animation/
    drawLine() {
        let vis = this;

        let lg = calcLinear(vis.companies, "raised_amount_usd", "price_amount",
            d3.min(vis.companies, function(d) { return d.raised_amount_usd}),
            d3.max(vis.companies, function(d) { return d.raised_amount_usd}));

        vis.line = d3.line()
            .x(d => vis.x(d.x))
            .y(d => vis.y(d.y))
            .curve(d3.curveLinear);

        vis.path = vis.svg.append('path')
            .attr("class", "regression")
            .attr('d', vis.line(lg))
            .attr("stroke", "white")
            .attr("stroke-width", 2.5);

        let totalLength = vis.path.node().getTotalLength();

        vis.path
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(2500)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0)
            .on("end", function(event) {
                d3.select("#animateScatter").text("Restart");
            });

        vis.svg.selectAll("circle").on("mouseover", function(event, d) {
            d3.select(this)
                .style("fill", "#ffd74c")
                .style("opacity", 1);

            vis.svg.selectAll("." + d.company_market.replace(/\s/g, ""))
                .style("fill", "#ffd74c")
                .style("opacity", 1);

            d3.select("#scatter-tooltip")
                .style("opacity", 1)
                .html(`
                     <div style="margin-top: 10vh">
                         <h6>${d.company_name}<h6>
                         <h6> Industry: ${d.company_market}</h6>
                         <h6> Acquisition Amount: ${displayFunding(d.price_amount)} M</h6>
                         <h6> Funding Amount: ${displayFunding(d.raised_amount_usd)} M</h6>                        
                     </div>`);
        })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .style("fill", "#6572ff")
                    .style("opacity", 0.8);

                vis.svg.selectAll("." + d.company_market.replace(/\s/g, ""))
                    .style("fill", "#6572ff")
                    .style("opacity", 0.8);

                d3.select("#scatter-tooltip")
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
    }
}

// https://bl.ocks.org/HarryStevens/be559bed98d662f69e68fc8a7e0ad097
function calcLinear(data, x, y, minX, maxX){
    let n = data.length;

    // Get just the points
    let pts = [];
    data.forEach(function(d) {
        let obj = {};
        obj.x = d[x];
        obj.y = d[y];
        obj.mult = obj.x*obj.y;
        pts.push(obj);
    });

    // Let a equal n times the summation of all x-values multiplied by their corresponding y-values
    // Let b equal the sum of all x-values times the sum of all y-values
    // Let c equal n times the sum of all squared x-values
    // Let d equal the squared sum of all x-values
    let sum = 0;
    let xSum = 0;
    let ySum = 0;
    let sumSq = 0;
    pts.forEach(function(pt){
        sum = sum + pt.mult;
        xSum = xSum + pt.x;
        ySum = ySum + pt.y;
        sumSq = sumSq + (pt.x * pt.x);
    });
    let a = sum * n;
    let b = xSum * ySum;
    let c = sumSq * n;
    let d = xSum * xSum;

    let m = (a - b) / (c - d);

    // Let e equal the sum of all y-values
    var e = ySum;

    // Let f equal the slope times the sum of all x-values
    var f = m * xSum;

    b = (e - f) / n;

    // return an object of two points
    return [
        // {x: minX, y: m*minX + b},
        {x: 0, y: b},
        {x: maxX, y:m*maxX + b}
    ]
}

