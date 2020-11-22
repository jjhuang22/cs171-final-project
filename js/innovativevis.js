/* * * * * * * * * * * * * *
*          innovativeVis          *
* * * * * * * * * * * * * */

class InnovativeVis {

    // constructor method to initialize MapVis object
    constructor(parentElement, companies) {
        this.parentElement = parentElement;
        this.companies = companies;

        this.initVis()
        console.log(companies);
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .style("background-color", 'white')
            .attr("transform", "translate(" + vis.margin.left + ", " + vis.margin.top + ")");

        let ok = d3.group(vis.companies).rollup(d => d.market);

        console.log(ok);

    }
}