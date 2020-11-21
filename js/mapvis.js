/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */

class MapVis {

    // constructor method to initialize MapVis object
    constructor(parentElement, geoData, companies) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.companies = companies;

        this.parseDate = d3.timeParse("%m/%d/%Y");

        this.initVis()
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
        
        // set projection
        vis.projection = d3.geoMercator()
            .scale(vis.width / 1.5)
            .center([-100, 40.5]);

        // create path variable
        vis.path = d3.geoPath()
            .projection(vis.projection);

        vis.states = topojson.feature(vis.geoData, vis.geoData.objects.states).features;

        // add states from topojson
        vis.svg.selectAll("path")
            .data(vis.states)
            .enter()
            .append("path")
            .attr("class", "feature")
            .style("fill", "#3b3933")
            .attr("opacity", 0.8)
            .attr("d", vis.path)
            .attr("stroke-width", '1.5px')
            .attr("stroke", "white");

        // wrangleData
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

        vis.displayData = vis.cityInfo.slice(0, 12); // change this as needed

        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        // vis.legendScale.domain([0, vis.domainMax]);
        // vis.colorScale.domain([0, vis.domainMax]);

        // vis.legendAxis.scale(vis.legendScale)
        //     .tickValues([0, vis.domainMax]);
        //
        // vis.legend.call(vis.legendAxis);

        // create color scale
        vis.colorScale = d3.scaleLinear()
            .range(["#fbc4ff", "#f029ff"]);

        // get correct range
        let domain_vals = [];
        Object.keys(vis.cityInfo).forEach( key => domain_vals.push(vis.cityInfo[key].numCompanies));
        vis.colorScale.domain([0, d3.max(domain_vals)]);
        // console.log(domain_vals);

        // add circles to svg
        let circle = vis.svg.selectAll("circle")
            .data(vis.displayData);

        circle.enter().append("circle")
            .merge(circle)
            .attr("class", "cities")
            .style("opacity", 0)
            .transition()
            .duration(1000)
            .attr("cx", d => vis.projection([d.lng, d.lat])[0])
            .attr("cy", d => vis.projection([d.lng, d.lat])[1])
            .attr("r", 15)
            .attr("fill", function(d) {
                return vis.colorScale(d.numCompanies);
                // return color;
                // if (selectedCategory == "All") {
                //     // return "salmon";
                //     let color = vis.colorScale(d.numCompanies);
                //     return color;
                // }
                // else {
                //     return d3.schemeCategory10[$("#categorySelector option:selected").index() - 1];
                // }
            })
            .style("opacity", 1)
            .attr("stroke", "black")
            .attr("stroke-width", "0.5px");

        // mouseover
        vis.svg.selectAll("circle").on("mouseover", function(event, d){
            d3.select(this)
                .attr('stroke-width', '1px')
                .attr('stroke', 'black')
                .style("fill", "red")
                .style("opacity", 1);

            vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
                .html(`
                         <div style="border: thin solid white; border-radius: 0px; background: -webkit-linear-gradient(90deg, #94bbe9, #eeaeca); padding: 20px">
                             <h3>${d.cityname}, ${d.stateCode}<h3>
                             <h6> Rank: ${d.rank}</h6>
                             <h6> Most popular industry: ${d.marketMode}</h6>
                             <h6> Number of Companies: ${Number(d.numCompanies).toLocaleString()}</h6>
                             <h6> Total Funding (mil): ${parseFloat(d.totalFunding).toLocaleString('en')}</h6>
                         </div>`);
        })
            .on('mouseout', function(event,   d){
                d3.select(this)
                    .attr('stroke-width', '0.5px')
                    .attr('stroke', 'black')
                    .style("fill", function(d) {
                        let color = vis.colorScale(d.numCompanies);
                        return color;
                        // if (selectedCategory == "All") {
                        //     let color = vis.colorScale(d.numCompanies);
                        //     return color;
                        // }
                        // else {
                        //     return d3.schemeCategory10[$("#categorySelector option:selected").index() - 1];
                        // }
                    })
                    .style("opacity", 1);

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

        circle.exit().remove();
    }
}