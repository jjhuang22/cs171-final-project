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

        console.log(acquirers);

        vis.acquirerInfo.sort((a, b) => {
            return b.numCompanies - a.numCompanies;
        })

        vis.displayData = vis.acquirerInfo.slice(0, 10);

        // console.log(vis.displayData);
        vis.updateVis();
    }

    updateVis(){
        let vis = this;


    }
}