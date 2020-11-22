/* * * * * * * * * * * * * *
*      class BarVis        *
* * * * * * * * * * * * * */

// TODO
// divide by population for barchart?

class BarVis {

    constructor(parentElement, companies) {
        this.parentElement = parentElement;
        this.companies = companies;

        this.parseDate = d3.timeParse("%m/%d/%Y");

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 60, right: 20, bottom: 120, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.x = d3.scaleBand()
            .rangeRound([25, vis.width + vis.margin.right - 5])
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
            .attr("transform", "translate(25, 0)");

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
                    cityname: cityState.value[0].cityMap,
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

        vis.displayData = vis.cityInfo.slice(0, 10);

        vis.updateVis();
    }


    updateVis() {
        let vis = this;

        // create color scale
        vis.colorScale = d3.scaleLinear()
            .range(["#fbc4ff", "#f029ff"]);

        // get correct range
        let domain_vals = [];
        Object.keys(vis.cityInfo).forEach( key => domain_vals.push(vis.cityInfo[key].numCompanies));
        vis.colorScale.domain([0, d3.max(domain_vals)]);
        // console.log(domain_vals);

        vis.x.domain(vis.displayData.map(d => d.cityname));
        vis.y.domain([0, d3.max(vis.displayData, d => d.numCompanies)]);
        // vis.colorScale.domain([0, d3.max(vis.stateInfo, d => d[selectedCategory])]);

        vis.xAxisGroup.transition()
            .duration(1000)
            .call(vis.xAxis)
            .style("stroke", "white")
            .attr("stroke-width", 0.5)
            .attr("color", "white")
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)")

        vis.yAxisGroup.transition()
            .duration(1000)
            .call(vis.yAxis)
            .style("stroke", "white")
            .attr("stroke-width", 0.5)
            .attr("color", "white");

        let rect = vis.svg.selectAll("rect")
            .data(vis.displayData);

        rect.enter().append("rect")
            .merge(rect)
            .attr("class", d => "state bar " + d.cityname.replace(" ", ""))
            .transition()
            .duration(1000)
            .attr("x", d => vis.x(d.cityname))
            .attr("y", d => vis.y(d.numCompanies))
            .attr("width", vis.x.bandwidth())
            .attr("height", d => vis.height - vis.y(d.numCompanies))
            .style("fill", d => vis.colorScale(d.numCompanies))
            .style("opacity", 1);

        vis.svg.selectAll("rect").on("mouseover", function(event, d){
            d3.select(this)
                .attr('stroke-width', '2px')
                .attr('stroke', 'black')
                .style("fill", "red");

            d3.selectAll("circle")
                .style("opacity", 0.3);

            // if (d.cityname == 'Mountain View') {
            //     d3.selectAll("." + d.cityname.replace(" ", ""))
            //         .raise();
            // }

            d3.selectAll("." + d.cityname.replace(" ", ""))
                .attr('stroke-width', '2px')
                .attr('stroke', 'black')
                .style("fill", "red")
                .style("opacity", 1);
            })
            .on("mouseout", function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0.5px')
                    .attr('stroke', 'black')
                    .style("fill", d => vis.colorScale(d.numCompanies));

                d3.selectAll("circle")
                    .style("opacity", 1)
                    .attr('stroke-width', '0.5px')
                    .attr('stroke', 'black');
                //
                // if (d.cityname == 'Mountain View') {
                //     d3.selectAll("." + d.cityname.replace(" ", ""))
                //         .lower();
                // }

                d3.selectAll("." + d.cityname.replace(" ", ""))
                    .style("fill", d => vis.colorScale(d.numCompanies));
            });

        rect.exit().remove();
    }
}