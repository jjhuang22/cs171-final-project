/* * * * * * * * * * * * * *
*          innovativeVis          *
* * * * * * * * * * * * * */

// TODO check Alexandra, for example; weird behavior

class InnovativeVis {

    // constructor method to initialize MapVis object
    constructor(parentElement, companies) {
        this.parentElement = parentElement;
        this.companies = companies;

        // group companies by region
        this.groupedData = d3.groups(this.companies, d => d.company_region, d => d.company_name);

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;
        vis.offset = vis.width/6;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            // .style("background-color", "red")
            .attr("transform", "translate(" + vis.margin.left + ", " + vis.margin.top + ")");

        // get names of regions
        let regions = [];
        vis.groupedData.forEach(d => {
            regions.push(d[0]);
        })

        // add regions to selection menu
        let selectMenu = d3.select("#select-region");
        regions.forEach(d => {
            selectMenu.append("option")
                .text(d);
        });
        //
        // // set default values of button
        // function selectElement(id, valueToSelect) {
        //     let element = document.getElementById(id);
        //     element.value = valueToSelect;
        // }
        // selectElement('select-region', ['Boston', 'SF Bay Area', 'New York City', "Atlanta"])

        // instantiate button
        var multipleCancelButton = new Choices('#select-region', {
            removeItemButton: true,
            maxItemCount:4
        });

        // TIME COUNTER
        vis.timer = vis.svg.append("text")
            .attr("transform",
                `translate(${vis.width/2},50)`)
            .style("text-anchor", "middle")
            .style("font-family", '"IBM Plex Mono", monospace')
            .style("font-size", "16px")
            .style("fill", "white");
    }

    wrangleData() {

        let vis = this;

        // subset to selected regions
        let regionSub = vis.groupedData.filter(d => selectedRegions.includes(d[0]));

        // create array of labels based on selected regions
        vis.labels = [];
        for (let i = 0; i<4; i++) {
            vis.labels.push(regionSub[i][0])
        }

        // create empty array to store durations (1 row per region, 1 column per milestone + 1 column for tracking denominator)
        vis.durations = [...Array(4)].map(x => Array(5).fill(0));
        for (let i = 0; i < 4; i++) {
            vis.durations[i][4] = [0,0,0,0];
        }

        // iterate over each region
        for (const [v, company] of regionSub.entries()) {
            // iterate over each company
            for (var rounds of company[1]) {
                // iterate over each round
                for (let i = 0; i < rounds[1].length; i++) {
                    let stage = rounds[1][i]['funding_round_code'];
                    vis.durations[v][stage] += d3.timeMonth.count(rounds[1][i].founded_at, rounds[1][i].funded_at);
                    vis.durations[v][4][stage] += 1; // record number of companies that have been tallied so far
                }
            }
        }

        // TODO Fix if a region misses out on milestones (average it out over the last two--Alexandria, Houston)
        // for each region and round, get average duration
        for (var region of vis.durations) {
            for (let i = 3; i >= 0; i--) {
                if (i === 0){
                    region[i] /= region[4][i];
                } else {
                    region[i] = region[i]/region[4][i] - region[i-1]/region[4][i-1];
                }
            }
        }
        console.log(vis.durations);

        vis.updateVis();
    }

    updateVis() {

        let vis = this;

        // LEGEND (milestone markers)
        let legend = ['Founded', 'Seed/Angel', 'A', 'B', 'C+'];
        let legendEnter = vis.svg.selectAll('.legend')
            .data(legend);
        legendEnter
            .enter()
            .append('text')
            .attr('class', 'legend')
            .attr('x', (d,i) => vis.offset/2 + vis.offset*(i+1) + vis.margin.left)
            .attr('y', 150)
            .attr('text-anchor', 'middle')
            .style('fill', 'white')
            .style("font-family", '"IBM Plex Mono", monospace')
            .text(d => d)
            .style('opacity', 0)
            .transition()
            .duration(800)
            .style('opacity', 1);

        // LABELS (region labels)
        let labelEnter = vis.svg.selectAll('.label')
            .data(vis.labels);
        labelEnter
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', vis.offset/2 + vis.margin.left)
            .attr('y', (d,i) => 220 + i*70)
            .attr('text-anchor', 'middle')
            .style('fill', 'white')
            .style("font-family", '"IBM Plex Mono", monospace')
            .merge(labelEnter)
            .text(d => d)
            .style('opacity', 0)
            .transition()
            .duration(800)
            .style('opacity', 1);

        labelEnter.exit().remove();

        // CIRCLES
        let colors = ['dodgerblue', 'salmon', 'lightgreen', 'lemonchiffon'];

        let circleEnter = vis.svg.selectAll('circle')
            .data(vis.durations);

        circleEnter
            .enter()
            .append('circle')
            .merge(circleEnter)
            .attr("cx", vis.offset/2 + vis.offset + vis.margin.left)
            .attr("cy", (d,i) => 220 + i*70)
            .attr("r", 12)
            .attr("opacity", 0)
            .attr("fill", (d,i) => colors[i%4])
            // .merge(circleEnter)
            .transition()
            // .delay(2000)
            .duration(d => d[0] * 150)
            .style('opacity', 1)
            .attr("cx", vis.offset/2 + vis.offset*2 + vis.margin.left)
            .transition()
            .duration(d => d[1] * 150)
            .attr("cx", vis.offset/2 + vis.offset*3 + vis.margin.left)
            .transition()
            .duration(d => d[2] * 150)
            .attr("cx", vis.offset/2 + vis.offset*4 + vis.margin.left)
            .transition()
            .duration(d => d[3] * 150)
            .attr("cx", vis.offset/2 + vis.offset*5 + vis.margin.left)
            .transition()
            .duration(600)
            .attr("opacity", 0)
        // literally why does this opacity thing not work smh
        // also if you click choose in the middle it resets to seed A instead of removing the circles

        circleEnter.exit().remove();

        // TIMER TODO make the timer ending line up exactly with last dot
        let totalTime = [];
        vis.durations.forEach(d => {
            totalTime.push(d3.sum(d));
        })
        // vis.durations[i]
        let endMonths = d3.max(totalTime);
        console.log(endMonths);
        //
        // vis.timer
        //     .text()

        // if (start === end) return;
        var range = Math.ceil(endMonths);
        var current = 0;
        var increment = 1;
        var duration = endMonths * 150 + 100;
        var stepTime = Math.abs(Math.floor(duration / range));
        // var obj = document.getElementById(id);
        var counter = setInterval(function() {
            current += increment;
            vis.timer.text(current + ' months since founding');
            if (current == range) {
                clearInterval(counter);
            }
        }, stepTime);

    }
}