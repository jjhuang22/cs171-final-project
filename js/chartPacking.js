/* * * * * * * * * * * * * *
*          chartPackingVis *
* * * * * * * * * * * * * */

class ChartPackingVis {

    // constructor method to initialize chartPacking object
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
        // vis.svg = d3.select("#" + vis.parentElement).append("svg")
        //     .attr("width", vis.width)
        //     .attr("height", vis.height)
        //     .attr("transform", "translate(" + vis.margin.left + ", " + vis.margin.top + ")");

        // tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .attr("id", "bubbleTooltip");

        // wrangleData
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        let bold = true;
        let black = false;
        let shadow = true;
        let multicolor = true;
        let hexcolor = "#0099cc";

        const format = d3.format(",d")

        const pack = data => d3.pack()
            .size([vis.width, vis.height])
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
                    .range(d3.schemeDark2)
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

            // if (d.depth == 0) {
            //     d3.select("#layer1").text("Currently looking at different industries that are acquiring companies.");
            //     d3.select("#layer2").text("");
            //     d3.select("#layer3").text("");
            //     d3.select("#layer4").text("");
            // }
            //
            // else if (d.depth == 1) {
            //     d3.select("#layer3").text("");
            //     d3.select("#layer4").text("");
            //     let industry = d.data.name;
            //     let companies = d.data.children;
            //     d3.select("#layer1")
            //         .text(formatLayer1(industry))
            //         .style("color", "blue");
            //
            //     d3.select("#layer2")
            //         .text(formatLayer2(industry, companies))
            //         .style("color", "blue");
            // }
            //
            // else if (d.depth == 2) {
            //     d3.select("#layer4").text("");
            //     let acquirer = d.data.name;
            //     let industries = d.data.children;
            //     d3.select("#layer3")
            //         .text(formatLayer3(acquirer, industries))
            //         .style("color", "blue");
            // }
            //
            // else if (d.depth == 3) {
            //     let parentCompany = d.parent.data.name;
            //     let industry = d.data.name;
            //     let companies = d.data.children;
            //     d3.select("#layer4")
            //         .text(formatLayer4(parentCompany, industry, companies))
            //         .style("color", "blue");
            // }


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

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `-${vis.width*8/12} -${vis.height*8/12} ${vis.width*1.3} ${vis.height*1.3}`)
            .style("display", "block")
            // .style("margin", "0 -14px")
            // .style("width", "calc(100% + 28px)")
            // .style("height", "auto")
            // .style("background", "white")
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
                    return black ? "2px 2px 0px white" : ".3px .8px 0px black";
                } else {
                    return "none";
                }
            })
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .selectAll("text")
            .data(root.descendants())
            .enter().append("text")
            .attr("class", "text-label")
            .style("fill-opacity", d => d.parent === root ? 1 : 0)
            .style("display", d => d.parent === root ? "inline" : "none")
            .style("font", d => (fontsize(d.depth)) + "px sans-serif")
            .style("font-weight", function() {
                return bold ? "bold" : "normal";
            })
            .text(d => d.data.name + "` " + formatFunding(d.data));
            // .text(d => d.data.name)

        vis.svg.selectAll(".text-label")
            .call(wrap);

        zoomTo([root.x, root.y, root.r * 2]);

        return vis.svg.node();
    }
}

function wrap(text) {
    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/([`].+)/).reverse().slice(1, 3),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1,
            y = text.attr("y"),
            dy = 0
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em").attr("font-size", "30px");

        words[0] = words[0].replace("`", "").trim();

        while (word = words.pop()) {
            if (word != "00"){
                tspan.text(word);
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").attr("font-size", "22px");
            }
        }
    });
}

function formatFunding(company){
    if (typeof company.value == "undefined") {
        company.value = company.size;
    }
    if (company.value >= 1000000000) {
        return "$" + (company.value / 1000000000).toFixed(2) + " billion";
    }
    else if (company.value >= 1000000) {
        return "$" + (company.value / 1000000).toFixed(2) + " million";
    }
}

// function formatLayer1(industry){
//     return "Currently looking at companies in the " + industry + " industry.";
// }
//
// function formatLayer2(industry, companies){
//     if (companies.length == 1){
//         return "The major acquirer in the " + industry + " industry is " + companies[0].name + ".";
//
//     }
//     else if (companies.length == 2){
//         return "The major acquirers in the " + industry + " industry are " + companies[0].name + " and " + companies[1].name + ".";
//     }
//     else {
//         let ans = "The major acquirers in the " + industry + " industry are ";
//         for (let i = 0; i < companies.length - 1; i++) {
//             ans += companies[i].name + ", ";
//         }
//         ans += "and " + companies[companies.length - 1].name + ".";
//         return ans;
//     }
// }
//
// function formatLayer3(acquirer, companies){
//     companies.sort((a, b) => {
//         return b.value - a.value;
//     })
//
//     ans = "Currently focusing on " + acquirer + ".";
//
//     if (companies.length == 1){
//         ans += "The major industry that " + acquirer + " acquires is " + companies[0].data.name + ".";
//
//     }
//     else if (companies.length == 2){
//         ans += "The major industries that " + acquirer + " acquires are " + companies[0].data.name + " and " + companies[1].data.name + ".";
//     }
//     else {
//         ans += "The major industries that " + acquirer + " acquires are ";
//         for (let i = 0; i < 2; i++) {
//             ans += companies[i].name + ", ";
//         }
//         ans += "and " + companies[companies.length - 1].name + ".";
//     }
//     return ans;
// }
//
// function formatLayer4(parentCompany, industry, companies){
//     companies.sort((a, b) => {
//         return b.value - a.value;
//     })
//
//     ans = parentCompany + " acquired several companies in the " + industry + " industry.";
//
//     if (companies.length == 1){
//         ans += "One such company is " + companies[0].name + ".";
//
//     }
//     else if (companies.length == 2){
//         ans += "Two such companies are " + companies[0].name + " and " + companies[1].name + ".";
//     }
//     else {
//         ans += "Three such companies are ";
//         for (let i = 0; i < 2; i++) {
//             ans += companies[i].name + ", ";
//         }
//         ans += "and " + companies[companies.length - 1].name + ".";
//     }
//     return ans;
// }

// test = "Test` 45 Billion";
// console.log(test.split(/([`].+)/).reverse().slice(1, 3))