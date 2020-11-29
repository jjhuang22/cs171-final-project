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
        console.log(huh);
        //            0     1   2   3
        // founded=> Seed / A / B / C+
        let durations = [...Array(4)].map(x=>Array(5).fill(0));
        for (let i = 0; i < 4; i++) {
            durations[i][4] = [0,0,0,0];
        }
        console.log(durations);

        function gah(code) {
            switch (code) {
                case '0': return 0;
                case 'A': return 1;
                case 'B': return 2;
                case 'C': return 3;
            }
        }

        // TODO
        // take user-selected cities and filter huh to only contain those cities
        // store durations
        console.log(selectedRegions);
        // let cities = ["SF Bay Area", "Boston", "San Diego"];
        let huh_sub = huh.filter(d => selectedRegions.includes(d[0]));
        console.log(huh_sub);

        // store durations
        for (const [v, company] of huh_sub.entries()) {
            // console.log(company,v);
            for (var rounds of company[1]) {
                for (let i = 0; i < rounds[1].length; i++) {
                    durations[v][gah(rounds[1][i]['funding_round_code'])] += d3.timeMonth.count(rounds[1][i].founded_at, rounds[1][i].funded_at);
                    durations[v][4][gah(rounds[1][i]['funding_round_code'])] += 1;
                }
            }
        }

        for (var rows of durations) {
            for (let i = 0; i < 4; i++) {
                rows[i] /= rows[4][i];
            }
        }
        console.log(durations);

        // console.log(d3.timeMonth.count(vis.companies[0].funded_at, vis.companies[1].funded_at));

        // let markers = vis.svg.selectAll('.marker')

        let legend = ['Founded', 'Seed/Angel', 'A', 'B', 'C+'];

        let labels = [];
        for (let i = 0; i<4; i++) {
            labels.push(huh_sub[i][0])
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
            .style('opacity', 0)
            .transition()
            .duration(800)
            .style('opacity', 1);

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
            .style('opacity', 0)
            .transition()
            .duration(800)
            .style('opacity', 1);



        // CIRCLES
        let colors = ['dodgerblue', 'salmon', 'lightgreen', 'lemonchiffon'];

        let circleEnter = vis.svg.selectAll('circle')
            .data(durations);
        circleEnter
            .enter()
            .append('circle')
            .attr("cx", offset/2 + offset + vis.margin.left)
            .attr("cy", (d,i) => 220 + i*70)
            .attr("r", 12)
            .attr("opacity", 0)
            .attr("fill", (d,i) => colors[i%4])
            .merge(circleEnter)
            .transition()
            .delay(2000)
            .duration(d => d[0] * 100)
            .style('opacity', 1)
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