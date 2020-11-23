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


        let ok = d3.rollup(vis.companies, v => d3.sum(v, d=> d.raised_amount_usd) / v.length , d => d.company_region);
            console.log(ok);

        let huh = d3.groups(vis.companies, d => d.company_region, d => d.company_name);
        console.log('huh');
        console.log(huh);


        // founded=>Seed / Seed=>A / A=>B / B=>C+
        let sum = [0,0,0,0,0,0,0,0];
        let store_int;
        let matrix = [...Array(4)].map(x=>Array(5).fill(0));



        for (const [v, company] of huh.slice(0,4).entries()) {

            console.log(company,v);
            console.log('huh');
            for (var round of company[1]) {
                switch (round[1][0]['funding_round_code']) {
                    case '0': store_int = 0; break;
                    case 'A': store_int = 1; break;
                    case 'B': store_int = 2; break;
                    default: store_int = 3; break;
                }
                for (let i = 0; i < round[1].length-1; i++) {
                    matrix[v][store_int+i] += d3.timeMonth.count(round[1][i].funded_at, round[1][i+1].funded_at)
                }
            }
        }
        console.log(matrix);

        console.log(d3.timeMonth.count(vis.companies[0].funded_at, vis.companies[1].funded_at));

        // let markers = vis.svg.selectAll('.marker')

        let circleEnter = vis.svg.selectAll('circle')
            .data(ok);

        circleEnter
            .enter()
            .append('circle')
            .attr("cx", 20)
            .attr("cy", (d,i) => 80 + i*30)
            .attr("r", 10)
            .attr("opacity", 1)
            .attr("fill", 'salmon')

    }
}