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
            .attr("transform", "translate(" + vis.margin.left + ", " + vis.margin.top + ")");


        // let ok = d3.rollup(vis.companies, v => d3.sum(v, d=> d.raised_amount_usd) / v.length , d => d.company_region);
        //     console.log(ok);

        let huh = d3.groups(vis.companies, d => d.company_region, d => d.company_name);

        //            0     1   2   3
        // founded=> Seed / A / B / C+
        let matrix = [...Array(4)].map(x=>Array(5).fill(0));

        for (let i = 0; i < 4; i++) {
            matrix[i][4] = [0,0,0,0];
        }

        function gah(code) {
            switch (code) {
                case '0': return 0;
                case 'A': return 1;
                case 'B': return 2;
                case 'C': return 3;
            }
        }

        for (const [v, company] of huh.slice(0,4).entries()) {
            // console.log(company,v);
            for (var rounds of company[1]) {
                for (let i = 0; i < rounds[1].length; i++) {
                    matrix[v][gah(rounds[1][i]['funding_round_code'])] += d3.timeMonth.count(rounds[1][i].founded_at, rounds[1][i].funded_at);
                    matrix[v][4][gah(rounds[1][i]['funding_round_code'])] += 1;
                }
            }
        }

        for (var rows of matrix) {
            for (let i = 0; i < 4; i++) {
                rows[i] /= rows[4][i];
            }
        }
        console.log(matrix);

        // console.log(d3.timeMonth.count(vis.companies[0].funded_at, vis.companies[1].funded_at));

        // let markers = vis.svg.selectAll('.marker')

        let legend = ['Founded', 'Seed/Angel', 'A', 'B', 'C+'];

        let labels = [];
        for (let i = 0; i<4; i++) {
            labels.push(huh.slice(0,4)[i][0])
        }

        let offset = vis.width/6;

        // LABELS
        let labelEnter = vis.svg.selectAll('.label')
            .data(labels);
        labelEnter
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', offset/2 + vis.margin.left)
            .attr('y', (d,i) => 220 + i*70)
            .attr('text-anchor', 'middle')
            .style('fill', 'white')
            .text(d => d)

        // LEGEND
        let legendEnter = vis.svg.selectAll('.legend')
            .data(legend);
        legendEnter
            .enter()
            .append('text')
            .attr('class', 'legend')
            .attr('x', (d,i) => offset/2 + offset*(i+1) + vis.margin.left)
            .attr('y', 150)
            .attr('text-anchor', 'middle')
            .style('fill', 'white')
            .text(d => d)

        // CIRCLES
        let circleEnter = vis.svg.selectAll('circle')
            .data(matrix);
        circleEnter
            .enter()
            .append('circle')
            .attr("cx", offset/2 + offset + vis.margin.left)
            .attr("cy", (d,i) => 220 + i*70)
            .attr("r", 20)
            .attr("opacity", 1)
            .attr("fill", 'salmon')
            .merge(circleEnter)
            .transition()
            .delay(2000)
            .duration(d => d[0] * 100)
            .attr("cx", offset/2 + offset*2 + vis.margin.left)
            .transition()
            .duration(d => d[1] * 100)
            .attr("cx", offset/2 + offset*3 + vis.margin.left)
            .transition()
            .duration(d => d[2] * 100)
            .attr("cx", offset/2 + offset*4 + vis.margin.left)
            .transition()
            .duration(d => d[3] * 100)
            .attr("cx", offset/2 + offset*5 + vis.margin.left)



    }
}