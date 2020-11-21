/* * * * * * * * * * * * * *
*      class BarVis        *
* * * * * * * * * * * * * */


class BarVis {

    constructor(parentElement, companies) {
        this.parentElement = parentElement;
        this.companies = companies;

        this.parseDate = d3.timeParse("%m/%d/%Y");

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.x = d3.scaleBand()
            .rangeRound([30, vis.width + vis.margin.right - 5])
            .paddingInner(0.15);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0, " + vis.height + ")");

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis")
            .attr("transform", "translate(30, 0)");

        vis.colorScale = d3.scaleLinear()
            .range(["white", "darkcyan"]);

        // tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .attr("id", "mapTooltip");

        vis.wrangleData();
    }

    wrangleData(){
        let vis = this;

        // filter data according to market
        let filteredData0 = [];

        if (selectedCategory == 'All') {
            filteredData0 = vis.companies;
        }
        else {
            vis.companies.forEach( row => {
                if (selectedCategory == row.market) {
                    filteredData0.push(row);
                }
            })
        }

        let filteredData = [];

        // if there is a region selected
        if (selectedTimeRange.length !== 0) {

            // iterate over all rows
            filteredData0.forEach(row => {
                // and push rows with proper dates into filteredData
                if (selectedTimeRange[0].getTime() <= vis.parseDate(row.founded_at).getTime() && vis.parseDate(row.founded_at).getTime() <= selectedTimeRange[1].getTime()) {
                    filteredData.push(row);
                }
            });
        } else {
            filteredData = filteredData0;
        }

        // group companies by city
        let companiesByCity = Array.from(d3.group(filteredData, d => d.cityState), ([key, value]) => ({key, value}));

        vis.cityInfo = [];

        companiesByCity.forEach( cityState => {
            let cityStatename = cityState.key;

            // init counters
            let numCompanies = 0;
            let totalFunding = 0;

            cityState.value.forEach(entry => {
                numCompanies += 1;
                totalFunding += entry['funding_total_usd'];
            })

            vis.cityInfo.push(
                {
                    cityname: cityState.value[0].city,
                    state: cityState.value[0].state,
                    stateCode: cityState.value[0].state_code,
                    lat: cityState.value[0].lat,
                    lng: cityState.value[0].lng,
                    marketMode: cityState.value[0].marketMode,
                    numCompanies: numCompanies,
                    totalFunding: (totalFunding / 1000000).toFixed(2)// in millions
                }
            )
        })

        vis.cityInfo.sort((a, b) => {
            return b.numCompanies - a.numCompanies;
        })

        // add rank of city based on chosen industry
        for (let i = 0; i < vis.cityInfo.length; i++) {
            vis.cityInfo[i].rank = i + 1;
        }

        vis.displayData = vis.cityInfo.slice(0, 12);

        console.log(vis.displayData[0].numCompanies);

        vis.updateVis();
    }


    updateVis() {
        let vis = this;

        vis.x.domain(vis.displayData.map(d => d.cityname));
        vis.y.domain([0, d3.max(vis.displayData, d => d.numCompanies)]);
        // vis.colorScale.domain([0, d3.max(vis.stateInfo, d => d[selectedCategory])]);

        vis.xAxisGroup.transition()
            .duration(1000)
            .call(vis.xAxis);

        vis.yAxisGroup.transition()
            .duration(1000)
            .call(vis.yAxis);

        let rect = vis.svg.selectAll("rect")
            .data(vis.displayData);

        rect.enter().append("rect")
            .merge(rect)
            // .attr("class", d => "state bar " + d.name.replace(" ", ""))
            .transition()
            .duration(1000)
            .attr("x", d => vis.x(d.cityname))
            .attr("y", d => vis.y(d.numCompanies))
            .attr("width", vis.x.bandwidth())
            .attr("height", d => vis.height - vis.y(d.numCompanies))
            // .style("fill", d => vis.colorScale(d.numCompanies))
            .style("fill", "blue")
            .style("opacity", 1);

        // vis.svg.selectAll("rect").on("mouseover", function(event, d){
        //     d3.select(this)
        //         .attr('stroke-width', '2px')
        //         .attr('stroke', 'black')
        //         .style("fill", "red")
        //         .style("opacity", 0.8);
        //
        //     d3.selectAll("." + d.name.replace(" ", ""))
        //         .attr('stroke-width', '2px')
        //         .attr('stroke', 'black')
        //         .style("fill", "red")
        //         .style("opacity", 0.8);
        //
        //     vis.tooltip
        //         .style("opacity", 1)
        //         .style("left", event.pageX + 20 + "px")
        //         .style("top", event.pageY + "px")
        //         .html(`
        //                  <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
        //                      <h3> ${d.name}<h3>
        //                      <h4> Population: ${d.population}</h4>
        //                      <h4> Cases (absolute): ${d.absCases}</h4>
        //                      <h4> Deaths (absolute): ${d.absDeaths}</h4>
        //                      <h4> Cases (relative): ${d.relCases.toFixed(2) + "%"}</h4>
        //                      <h4> Deaths (relative): ${d.relDeaths.toFixed(2) + "%"}</h4>
        //                  </div>`);
        // })
        //     .on('mouseout', function(event, d){
        //         d3.selectAll("." + d.name.replace(" ", ""))
        //             .attr('stroke-width', '1px')
        //             .style("fill", vis.colorScale(d[selectedCategory]))
        //             .style("opacity", 1);
        //
        //         d3.select(this)
        //             .attr('stroke-width', '0px')
        //             .style("fill", d => vis.colorScale(d[selectedCategory]))
        //             .style("opacity", 1);
        //
        //         vis.tooltip
        //             .style("opacity", 0)
        //             .style("left", 0)
        //             .style("top", 0)
        //             .html(``);
        //     });

        rect.exit().remove();
    }
}