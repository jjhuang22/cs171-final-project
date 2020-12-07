/* * * * * * * * * * * * * *
*          chartPackingVis *
* * * * * * * * * * * * * */

class ChartPackingVis {

    // constructor method to initialize chartPacking object
    constructor(parentElement, nestedAcquisitions, stage) {
        this.parentElement = parentElement;
        this.data = nestedAcquisitions;
        this.stage = stage;
        this.colorPal = ["#fea71a", "#9D0191", "#4a2ded", "#00BCD1",
            "#9D0191", "#4a2ded", "#FD3A69", "#4a2ded",
            "#fea71a", "#9D0191"];

        // console.log(this.data);

        this.initVis();
    }

    initVis(){
        let vis = this;

        vis.acquisitions = vis.data;

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

        vis.tooltiptext = {
            "Google": "Google is a service provider founded in 1998 by Larry Page and Sergey Brin. Google.com is currently the world’s visited website. In addition to its search engine, Google is also well known for its Android and Chrome OS operating systems, the Google Chrome browser, Google Maps, and its work and productivity services (Gmail, Google Drive, Google Calendar).",
            "Yahoo": "Yahoo! is a service provider founded in 1994 by Jerry Yang and David Filo. that is famous for its email and search services. During its peak, it was one of the most visited sites worldwide with over 7 billion views per month. Microsoft unsuccessfully tried to acquire Yahoo! in 2008.",
            "Cisco": "Cisco is an enterprise software company founded in 1984 by husband-and-wife team Leonard Bosack and Sandy Lerner, who were both in charge of computer facilities at Stanford at the time. Through its many acquisitions, it has come to dominate tech markets like the Internet of Things and energy management.",
            "AOL": "AOL is a service provider founded in 1983. Although it was still a power player in terms of acquisitions from 2007 to 2014, it itself was acquired by Verizon for $4.4 billion in 2015, shortly after out data set ends. AOL is commonly thought to have declined after the early 2000s due to the replacement of dial-up with broadband.",
            "Oracle Corporation": "Oracle is an enterprise software company founded in 1977 known primarily for its database management products. Oracle's price per share increased steadily from 2007 to 2014 and beyond; in fact, in 2019, Oracle was the second-largest software company by revenue and market cap.",
            "Microsoft": "Microsoft is a software company founded in 1975 by Bill Gates and Paul Allen. It is one of three U.S. public companies with a valuation over $1 trillion, the other two being Apple and Amazon. It has acquired companies including LinkedIn, Skype Technologies, and GitHub.",
            "Salesforce": "Salesforce is an enterprise software company founded in 1999 by former Oracle executive Marc Benioff, Parker Harris, Dave Moellenhoff, and Frank Dominguez that currently employs 20,000+ employees and recently announced plans to acquire Slack.",
            "Facebook": "Facebook is a social media company founded in 2007 by Mark Zuckerberg with his classmates at Harvard. It is one of the world’s most valuable companies, and has acquired Instagram, WhatsApp, and Oculus VR.",
            "Hewlett-Packard": "Hewlett-Packard is a hardware company founded in 1939 by Bill Hewlett and David Packard that specializes in laptops, desktops, printers, and accessories. The HP Garage, a museum where the company was founded, is considered the “Birthplace of Silicon Valley” and is designated an official California Historical Landmark.",
            "Apple": "Apple is a hardware and software company founded in 1976 by Steve Jobs, Steve Wozniak, and Ronald Wayne. Apple acquired Beats Electronics in 2014. It is one of three U.S. public companies with a valuation over $1 trillion, the other two being Microsoft and Amazon."
        };

        // wrangleData
        vis.chooseStage();
        // vis.updateVis();
    }

    chooseStage() {
        // if step counter == 0, then don't filter anything out
        // if step counter == 1, then only HP, Oracle, and Salesforce
        // if step counter == 2, then only Apple and Facebook
        // if step counter == 3, then everything else

        let vis = this;

        console.log(vis.stage)

        if (vis.stage == 0){
            vis.acquisitions = vis.data;
            vis.colorPalUse = vis.colorPal;
        } else if (vis.stage == 1){
            // vis.acquisitions = vis.data.filter()
            vis.acquisitions = {
                "children": [vis.data.children[5], vis.data.children[6], vis.data.children[9]],
                "name": "acquisitions"
            };
            vis.colorPalUse = ["#fea71a", "#9D0191", "#9D0191"];
        } else if (vis.stage == 2){
            vis.acquisitions = {
                "children": [vis.data.children[7], vis.data.children[8]],
                "name": "acquisitions"
            };
            vis.colorPalUse = ["#00BCD1", "#fea71a"]
        } else if (vis.stage == 3){
            vis.acquisitions = {
                "children": [vis.data.children[0], vis.data.children[1], vis.data.children[2], vis.data.children[3], vis.data.children[4]],
                "name": "acquisitions"
            };
            vis.colorPalUse = ["#4a2ded", "#9D0191", "#4a2ded", "#FD3A69", "#4a2ded"]
        }

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
                    .range(vis.colorPalUse);
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

            if (d.depth == 0 & vis.stage == 0){
                d3.select("#instructions").style("display", "block");
                d3.select("#layer1").text("Click on a circle to learn more, or on the background to zoom out! When you're ready, click next to explore some patterns.").style("color", "white");
            }

            else if (d.depth >= 1 & vis.stage == 0){
                let obj = d;
                while (obj.depth != 1) {
                    obj = obj.parent;
                }
                d3.select("#layer1").text(vis.tooltiptext[obj.data.name]);
                d3.select("#instructions").style("display", "none");

            }

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
            .attr("class", d => d.data.name.replace(/\s/g, ""))
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
        return "$" + (company.value / 1000000000).toFixed(2) + " B";
    }
    else if (company.value >= 1000000) {
        return "$" + (company.value / 1000000).toFixed(2) + " M";
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