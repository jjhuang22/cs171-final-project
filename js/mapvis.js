/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */

class MapVis {

    // constructor method to initialize MapVis object
    constructor(parentElement, geoData, companies) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.companies = companies;
        // this.worldcities = worldcities;
        // this.displayData = [];

        // parse date method
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

        // // add title
        // vis.svg.append("g")
        //     .attr("class", "title map-title")
        //     .append("text")
        //     .text("Map")
        //     .attr("transform", "translate(" + vis.width / 2 + ", 20)")
        //     .attr("text-anchor", "middle");

        // tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .attr("id", "mapTooltip");


        // map
        vis.viewpoint = {'width': 975, 'height': 610};
        vis.zoom = vis.width / vis.viewpoint.width;

        vis.mapGroup = vis.svg.append("g")
            .attr("class", "states")
            .attr("transform", "translate(0, " + vis.height/20 + ")");


        // 11-13: circles on map
        // set projection
        vis.projection = d3.geoMercator();

        // create path variable
        vis.path = d3.geoPath()
            .projection(vis.projection);

        vis.states = topojson.feature(vis.geoData, vis.geoData.objects.states).features;

        // set projection parameters
        vis.projection
            .scale(1000)
            .center([-110, 40.5])

        // add states from topojson
        vis.svg.selectAll("path")
            .data(vis.states)
            .enter()
            .append("path")
            .attr("class", "feature")
            .style("fill", "dodgerblue")
            .attr("opacity", 0.8)
            .attr("d", vis.path)
            .attr("stroke-width", '1px')
            .attr("stroke", "black");

        // vis.svg.selectAll("circle")
        //     .data(vis.companies)
        //     .enter()
        //     .append("circle")
        //     .attr("cx", function(d) {
        //         console.log(d);
        //         return vis.projection([d.lng, d.lat])[0]
        //     })
        //     .attr("cy", d => vis.projection([d.lng, d.lat])[1])
        //     .attr("r", "8px")
        //     .attr("fill", "salmon");

        // wrangleData
        vis.wrangleData();

        // vis.updateVis();
    }

    wrangleData(){
        let vis = this;

        // filter data according to market
        let filteredData = [];

        if (selectedCategory == 'All') {
            filteredData = vis.companies;
        }
        else {
            vis.companies.forEach( row => {
                // console.log(row);
                if (selectedCategory == row.market) {
                    filteredData.push(row);
                }
            })
        }

        // console.log(filteredData);

        // group companies by city
        let companiesByCity = Array.from(d3.group(filteredData, d => d.city), ([key, value]) => ({key, value}));

        vis.cityInfo = [];

        companiesByCity.forEach( city => {
            let cityName = city.key;

            // init counters
            let numCompanies = 0;
            let totalFunding = 0;

            city.value.forEach(entry => {
                numCompanies += 1;
                totalFunding += entry['funding_total_usd'];
            })

            vis.cityInfo.push(
                {
                    name: cityName,
                    lat: city.value[0].lat,
                    lng: city.value[0].lng,
                    numCompanies: numCompanies,
                    totalFunding: (totalFunding / 1000000).toFixed(2) + " mil"// in millions
                }
            )
        })

        vis.topTenData = vis.cityInfo.slice(0, 20); // change this as needed

        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        // vis.legendScale.domain([0, vis.domainMax]);
        // vis.colorScale.domain([0, vis.domainMax]);
        //
        // vis.legendAxis.scale(vis.legendScale)
        //     .tickValues([0, vis.domainMax]);
        //
        // vis.legend.call(vis.legendAxis);

        // add circles to svg
        let circle = vis.svg.selectAll("circle")
            .data(vis.topTenData);

        circle.enter().append("circle")
            .merge(circle)
            .attr("class", "cities")
            .style("opacity", 0)
            .transition()
            .duration(1000)
            .attr("cx", d => vis.projection([d.lng, d.lat])[0])
            .attr("cy", d => vis.projection([d.lng, d.lat])[1])
            .attr("r", function(d) {
                return Math.sqrt(d.numCompanies);
            })
            .attr("fill", "salmon")
            .style("opacity", 1);
            // .attr("stroke", "black")
            // .attr("stroke-width", "1px");

        // mouseover
        vis.svg.selectAll("circle").on("mouseover", function(event, d){
            console.log(d);
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
                         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                             <h3>${d.name}<h3>
                             <h4> Number of Companies: ${d.numCompanies}</h4>
                             <h4> Total Funding: ${d.totalFunding}</h4>
                         </div>`);
        })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .attr('stroke', 'black')
                    .style("fill", "salmon")
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