/* * * * * * * * * * * * * *
*          BubbleChartVis          *
* * * * * * * * * * * * * */

class BubbleVis {

    // constructor method to initialize MapVis object
    constructor(parentElement, acquisitions) {
        this.parentElement = parentElement;
        this.acquisitions = acquisitions;

        this.initVis();
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr("transform", "translate(" + vis.margin.left + ", " + vis.margin.top + ")");

        // tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .attr("id", "mapTooltip");

        // wrangleData
        vis.wrangleData();
    }

    wrangleData(){
        let vis = this;

        // group companies by acquirer
        let acquirers = Array.from(d3.group(vis.acquisitions, d => d.acquirer_name), ([key, value]) => ({key, value}));

        vis.acquirerInfo = [];

        acquirers.forEach( company => {
            let companyName = company.key;

            // init counters
            let numCompanies = 0;
            let totalPrice = 0;

            company.value.forEach(entry => {
                numCompanies += 1;
                totalPrice += entry['price_amount'];
            })

            vis.acquirerInfo.push(
                {
                    name: companyName,
                    numCompanies: numCompanies,
                    totalPrice: (totalPrice / 1000000).toFixed(2) + " mil"// in millions
                }
            )
        })

        // console.log(vis.acquirerInfo);
        vis.acquirerInfo.sort((a, b) => {
            return b.numCompanies - a.numCompanies;
        })

        vis.displayData = vis.acquirerInfo.slice(0, 10);
        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        // let diameter = 600;
        // vis.color = d3.scaleOrdinal(d3.schemeCategory10);
        // vis.bubble = d3.pack(vis.displayData)
        //     .size([diameter, diameter])
        //     .padding(1.5);
        //
        // vis.nodes = d3.hierarchy(vis.displayData)
        //     .sum(function(d) { return d.numCompanies; });
        //
        // console.log(vis.bubble(vis.nodes).data);
        //
        // vis.node = vis.svg.selectAll(".node")
        //     .data(vis.bubble(vis.nodes).data)
        //     .enter()
        //     .filter(function(d) {
        //         return !d.data;
        //     })
        //     .append("g")
        //     .attr("class", "node")
        //     .attr("transform", function(d) {
        //         console.log(d);
        //         // return "translate(" + d.x + "," + d.y + ")";
        //     })
        //
        // vis.node.append("circle")
        //     .attr("r", function(d) {
        //         console.log(d);
        //         return d.r;
        //     })
        //     .style("fill", function(d,i) {
        //         return vis.color(i);
        //     });

        // vis.simulation = d3.forceSimulation(vis.acquirerInfo)
        //     .force("charge", d3.forceManyBody().strength(0))
        //     .force("x", d3.forceX())
        //     .force("y", d3.forceY())
        //     .on("tick", ticked);
        //
        // function ticked(e) {
        //     vis.circles = vis.svg.selectAll("circle")
        //         .data(vis.acquirerInfo);
        //
        //     vis.circles.enter()
        //         .append("circle")
        //         .attr("class", "circle")
        //         .attr("r", d => d.numCompanies)
        //         .attr("cx", d => d.x)
        //         .attr("cy", d => d.y);
        // }


        // // mouseover
        // vis.svg.selectAll("circle").on("mouseover", function(event, d){
        //     console.log(d);
        //     d3.select(this)
        //         .attr('stroke-width', '1px')
        //         .attr('stroke', 'black')
        //         .style("fill", "red")
        //         .style("opacity", 1);
        //
        //     vis.tooltip
        //         .style("opacity", 1)
        //         .style("left", event.pageX + 20 + "px")
        //         .style("top", event.pageY + "px")
        //         .html(`
        //                  <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
        //                      <h3>${d.name}<h3>
        //                      <h4> Number of Companies: ${d.numCompanies}</h4>
        //                      <h4> Total Funding: ${d.totalFunding}</h4>
        //                  </div>`);
        // })
        //     .on('mouseout', function(event, d){
        //         d3.select(this)
        //             .attr('stroke-width', '0px')
        //             .attr('stroke', 'black')
        //             .style("fill", "salmon")
        //             .style("opacity", 1);
        //
        //         vis.tooltip
        //             .style("opacity", 0)
        //             .style("left", 0)
        //             .style("top", 0)
        //             .html(``);
        //     });
        //
        // circle.exit().remove();
    }
}