/* * * * * * * * * * * * * *
*    BubbleChartVis        *
* * * * * * * * * * * * * */

class BubbleVis {

    // constructor method to initialize BubbleChart object
    constructor(parentElement, companies, acquisitions) {
        this.parentElement = parentElement;
        this.companies = companies;
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
            // .style("background", "white");

        // tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .attr("id", "bubbleTooltip");

        // wrangleData
        vis.wrangleData();
    }

    // wrangle Data for acquirers
    wrangleData(){
        let vis = this;

        vis.companies = d3.group(vis.companies, d => d.name), ([key, value]) => ({key, value});

        // group companies by acquirer
        let acquirers = Array.from(d3.group(vis.acquisitions, d => d.acquirer_name), ([key, value]) => ({key, value}));

        vis.acquirerInfo = [];

        acquirers.forEach( company => {
            let companyName = company.key;

            // init counters
            let numCompanies = 0;
            let totalPrice = 0;
            let acquiredCompanies = [];

            company.value.forEach(entry => {
                numCompanies += 1;
                totalPrice += entry['price_amount'];
                acquiredCompanies.push(entry['company_name']);
            })

            vis.acquirerInfo.push(
                {
                    name: companyName,
                    city: company.value[0].acquirer_city,
                    stateCode: company.value[0].acquirer_state_code,
                    market: company.value[0].acquirer_market,
                    numCompanies: numCompanies,
                    totalPrice: (totalPrice / 1000000).toFixed(2) + " mil", // in millions
                    acquiredCompanies: acquiredCompanies
                }
            )
        })

        vis.acquirerInfo.sort((a, b) => {
            return b.numCompanies - a.numCompanies;
        })

        vis.displayData = { "children": vis.acquirerInfo.slice(0, 10) };

        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        vis.color = ["#4a2ded", "#4a2ded", "#9D0191", "#4a2ded", "#FD3A69",
            "#fea71a", "#9D0191", "#fea71a", "#00BCD1", "#9D0191"];

        vis.bubble = d3.pack(vis.displayData)
            .size([vis.width, vis.height])
            .padding(1.5);

        vis.nodes = d3.hierarchy(vis.displayData)
            .sum(function(d) { return d.numCompanies; });

        vis.node = vis.svg.selectAll(".node")
            .data(vis.bubble(vis.nodes).descendants())
            .enter()
            .filter(function(d){
                return  !d.children
            })
            .append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        vis.node.append("circle")
            .attr("r", function(d) {
                return d.r;
            })
            .style("fill", function(d,i) {
                return vis.color[i];
            })
            .style("stroke", "white")
            .style("stroke-width", 2);

        vis.node.append("title")
            .text(function(d) {
                return d.name + ": " + d.numCompanies;
            });

        vis.node.append("text")
            .attr("dy", "-0.5em")
            .style("text-anchor", "middle")
            .text(function(d) {

                if (d.data.name == 'Oracle Corporation'){
                    return 'Oracle Corp.'
                } else {
                    return d.data.name;
                }
            })
            .attr("font-family", '"IBM Plex Mono", monospace')
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "white");

        vis.node.append("text")
            .attr("dy", "0.6em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.numCompanies + ' acquired';
            })
            .attr("font-family", '"IBM Plex Mono", monospace')
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "white");

        vis.node.append("text")
            .attr("dy", "2.5em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.city;
            })
            .attr("font-family", '"IBM Plex Mono", monospace')
            .attr("font-size", function(d){
                return d.r/8;
            })
            .attr("fill", "white");

        d3.select(self.frameElement)
            .style("height", 600 + "px");

        // vis.svg.selectAll("circle").on("mouseover", function(event, d){
        //     d3.select(this)
        //         .attr('stroke-width', '3px')
        //         .attr('stroke', 'white');
        //
        //     vis.tooltip
        //         .style("opacity", 1)
        //         .style("left", event.pageX + 20 + "px")
        //         .style("top", event.pageY + "px")
        //         .html(`
        //                  <div style="border: thin solid white; border-radius: 0px; background: -webkit-linear-gradient(90deg, #94bbe9, #eeaeca); padding: 20px">
        //                      <h3> ${d.data.name}<h3>
        //                      <h6> ${d.data.city}, ${d.data.stateCode}</h6>
        //                      <h6> ${d.data.market}</h6>
        //                  </div>`);
        // })
        //     .on('mouseout', function(event,   d){
        //         d3.select(this)
        //             .attr('stroke-width', '0px')
        //             .attr('stroke', 'black');
        //
        //         vis.tooltip
        //             .style("opacity", 0)
        //             .style("left", 0)
        //             .style("top", 0)
        //             .html(``);
        //     });
    }
}