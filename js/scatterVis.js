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
            .domain([0, d3.max(vis.companies, d => d.raised_amount_usd)*1.2])
            .range([90, vis.width*0.9]);

        vis.y = d3.scaleLinear()
            .domain([0, d3.max(vis.companies, d => d.price_amount)*1.2])
            .range([vis.height*0.9, vis.height*0.1])

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0, " + vis.height*0.9 + ")")
            .call(vis.xAxis)
            .style("stroke", "white")
            .attr("stroke-width", 0.5)
            .attr("color", "white")
            .append("text")
            .attr("class", "scatterLabel")
            .attr("x", vis.width/2)
            .attr("y", vis.height*0.07)
            .style("text-anchor", "end")
            .text("Funding Amount")
            .style("fill", "white");

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis")
            .attr("transform", "translate(90, 0)")
            .call(vis.yAxis)
            .style("stroke", "white")
            .attr("stroke-width", 0.5)
            .attr("color", "white")
            .append("text")
            .attr("class", "scatterLabel")
            .attr("transform", "translate(-90,"+vis.height/2 + ")rotate(-90)")
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Exit Amount")
            .style("fill", "white");

        // tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .attr("id", "scatterTooltip");

        vis.svg.append("g")
            .selectAll("circle")
            .data(vis.companies)
            .enter()
            .append("circle")
            .attr("class", "scatterCircle")
            .attr("cx", d => vis.x(d.raised_amount_usd))
            .attr("cy", d => vis.y(d.price_amount))
            .attr("r", 5)
            .style("fill", "#f029ff")
            .style("opacity", 0.8);

        vis.svg.selectAll("circle").on("mouseover", function(event, d) {
            d3.select(this)
                .style("fill", "#ffd74c")
                .style("opacity", 1);

            vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
                .html(`
                     <div style="border: thin solid white; border-radius: 0px; background: -webkit-linear-gradient(90deg, #94bbe9, #eeaeca); padding: 20px">
                         <h3>${d.company_name}<h3>
                         <h6> Funding Amount: ${displayFunding(d.raised_amount_usd)}</h6>
                         <h6> Acquisition Amount: ${displayFunding(d.price_amount)}</h6>
                     </div>`);
            })
            .on("mouseout", function(d) {
                d3.select(this)
                    .style("fill", "#f029ff")
                    .style("opacity", 1);

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })


    }
}

