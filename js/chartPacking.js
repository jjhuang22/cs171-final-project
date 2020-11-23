/* * * * * * * * * * * * * *
*          chartPackingVis *
* * * * * * * * * * * * * */

class ChartPackingVis {

    // constructor method to initialize MapVis object
    constructor(parentElement, nestedAcquisitions) {
        this.parentElement = parentElement;
        this.acquisitions = nestedAcquisitions;

        this.initVis();
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 10, right: 10, bottom: 100, left: 10};
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
            .attr("id", "bubbleTooltip");

        // wrangleData
        vis.updateVis();
    }

    // // wrangle Data for acquirers
    // wrangleData(){
    //     let vis = this;
    //
    //     // markets: service provider, social media, enterprise software, software, hardware + software
    //     vis.displayData = {
    //         "name": "test",
    //         "children": []
    //     }
    //
    //     vis.companies = d3.group(vis.companies, d => d.name), ([key, value]) => ({key, value});
    //
    //     // group companies by acquirer
    //     let acquirers = Array.from(d3.group(vis.acquisitions, d => d.acquirer_name), ([key, value]) => ({key, value}));
    //
    //     vis.acquirerInfo = [];
    //
    //     acquirers.forEach( company => {
    //         let companyName = company.key;
    //
    //         // init counters
    //         let numCompanies = 0;
    //         let totalPrice = 0;
    //         let acquiredCompanies = [];
    //
    //         company.value.forEach(entry => {
    //             numCompanies += 1;
    //             totalPrice += entry['price_amount'];
    //             acquiredCompanies.push(entry['company_name']);
    //         })
    //
    //         vis.acquirerInfo.push(
    //             {
    //                 name: companyName,
    //                 city: company.value[0].acquirer_city,
    //                 stateCode: company.value[0].acquirer_state_code,
    //                 market: company.value[0].acquirer_market,
    //                 numCompanies: numCompanies,
    //                 totalPrice: (totalPrice / 1000000).toFixed(2) + " mil", // in millions
    //                 acquiredCompanies: acquiredCompanies
    //             }
    //         )
    //     })
    //
    //     vis.acquirerInfo.sort((a, b) => {
    //         return b.numCompanies - a.numCompanies;
    //     })
    //
    //     // vis.displayData = { "children": vis.acquirerInfo.slice(0, 10) };
    //
    //     vis.updateVis();
    // }

    updateVis() {
        let vis = this;

        let bold = true;
        let black = false;
        let shadow = true;
        let multicolor = true;
        let hexcolor = "#0099cc";

        const format = d3.format(",d")

        const pack = data => d3.pack()
            .size([vis.width/2, vis.height/2])
            .padding(3)
            (d3.hierarchy(vis.acquisitions)
                .sum(d => d.size)
                .sort((a, b) => b.value - a.value))

        const root = pack(vis.acquisitions);
        let focus = root;
        let view;

        let fontsize = d3.scaleOrdinal()
            .domain([1,3])
            .range([24,16])

        function setColorScheme(multi){
            if (multi) {
                let color = d3.scaleOrdinal()
                    .range(d3.schemeCategory10)
                return color;
            }
        }

        let color = setColorScheme(multicolor);

        function setCircleColor(obj) {
            let depth = obj.depth;
            while (obj.depth > 1) {
                obj = obj.parent;
            }
            let newcolor = multicolor ? d3.hsl(color(obj.data.name)) : d3.hsl(hexcolor);
            newcolor.l += depth == 1 ? 0 : depth * .1;
            return newcolor;
        }

        function setStrokeColor(obj) {
            let depth = obj.depth;
            while (obj.depth > 1) {
                obj = obj.parent;
            }
            let strokecolor = multicolor ? d3.hsl(color(obj.data.name)) : d3.hsl(hexcolor);
            return strokecolor;
        }

        // const svg = d3.select(DOM.svg(vis.width, vis.height))
        //     .attr("viewBox", `-${vis.width / 2} -${vis.height / 2} ${vis.width} ${vis.height}`)
        //     .style("display", "block")
        //     .style("margin", "0 -14px")
        //     .style("width", "calc(100% + 28px)")
        //     .style("height", "auto")
        //     .style("background", "white")
        //     .style("cursor", "pointer")
        //     .on("click", () => zoom(root));

        function zoomTo(v) {
            const k = vis.width / v[2];

            view = v;

            label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k + fontsize(d.depth)/4})`);
            node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
            node.attr("r", d => d.r * k);
        }

        function zoom(d) {
            const focus0 = focus;

            focus = d;

            const transition = vis.svg.transition()
                // .duration((d, event) => {event.altKey ? 7500 : 750} )
                .duration(750)
                .tween("zoom", d => {
                    const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
                    return t => zoomTo(i(t));
                });

            label
                .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
                .transition(transition)
                .style("fill-opacity", d => d.parent === focus ? 1 : 0)
                .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
                .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
        }

        vis.svg
            .attr("viewBox", `-${vis.width / 2} -${vis.height / 2} ${vis.width} ${vis.height}`)
            .style("display", "block")
            .style("margin", "0 -14px")
            .style("width", "calc(100% + 28px)")
            .style("height", "auto")
            .style("background", "#080314")
            .style("cursor", "pointer")
            .on("click", () => zoom(root));


        const node = vis.svg.append("g")
            .selectAll("circle")
            .data(root.descendants().slice(1))
            .enter().append("circle")
            .attr("fill", setCircleColor)
            .attr("stroke", setStrokeColor)
            .attr("pointer-events", d => !d.children ? "none" : null)
            .on("mouseover", function() { d3.select(this).attr("stroke", d => d.depth == 1 ? "black" : "white"); })
            .on("mouseout", function() { d3.select(this).attr("stroke", setStrokeColor); })
            .on("click", (event, d) => focus !== d && (zoom(d), event.stopPropagation()));

        const label = vis.svg.append("g")
            .style("fill", function() {
                return black ? "black" : "white";
            })
            .style("text-shadow", function(){
                if (shadow) {
                    return black ? "2px 2px 0px white" : "2px 2px 0px black";
                } else {
                    return "none";
                }
            })
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .selectAll("text")
            .data(root.descendants())
            .enter().append("text")
            .style("fill-opacity", d => d.parent === root ? 1 : 0)
            .style("display", d => d.parent === root ? "inline" : "none")
            .style("font", d => fontsize(d.depth) + "px sans-serif")
            .style("font-weight", function() {
                return bold ? "bold" : "normal";
            })
            .text(d => d.data.name + "\n" + displayFunding(d.data.value));

        zoomTo([root.x, root.y, root.r * 2]);

        return vis.svg.node();

    }
}

function displayFunding(funding){
    if (funding >= 1000000000) {
        return (funding / 1000000000).toFixed(2) + " billion";
    }
    else if (funding >= 1000000) {
        return (funding / 1000000).toFixed(2) + " million";
    }
}