/* * * * * * * * * * * * * *
*          innovativeVis   *
* * * * * * * * * * * * * */

class InnovativeVis {

    // constructor method to initialize InnovativeVis object
    constructor(parentElement, companies) {
        this.parentElement = parentElement;
        this.companies = companies;
        this.groupedByMarket = d3.groups(this.companies, d => d.company_market, d => d.company_name);
        this.groupedByRegion = d3.groups(this.companies, d => d.company_region, d => d.company_name);
        // console.log(this.groupedByRegion);

        this.initVis()
    }

    setCategory() {
        let vis = this;

        // set vis.groupedData based on compareCategory
        if (compareCategory == 'company_market'){
            vis.groupedData = vis.groupedByMarket;
        } else if (compareCategory == 'company_region'){
            vis.groupedData = vis.groupedByRegion;
        }
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
            .attr("transform", "translate(" + vis.margin.left + ", " + vis.margin.top + ")");

        // TIME COUNTER
        vis.timer = vis.svg.append("text")
            .attr("transform",
                `translate(${vis.width/2},55)`)
            .style("text-anchor", "middle")
            .style("font-family", '"IBM Plex Mono", monospace')
            .style("font-size", "36px")
            .style("fill", "#ffd74c");
        vis.timerCaption = vis.svg.append("text")
            .attr("transform",
                `translate(${vis.width/2},80)`)
            .style("text-anchor", "middle")
            .style("font-family", '"IBM Plex Mono", monospace')
            .style("font-size", "16px")
            .style("fill", "#ffd74c");

        // tooltip for invalid selection
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .attr("id", "innovativeTooltip");
    }

    wrangleData() {
        let vis = this;

        // subset to selected regions
        let regionSub = vis.groupedData.filter(d => selectedRegions.includes(d[0]));
        console.log(regionSub);

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

        // make a copy of vis.durations and get averages
        vis.timeFromFounding = [...Array(4)].map(x => Array(5).fill(0));
        for (let i = 0; i < 4; i++) {
            vis.timeFromFounding[i][4] = [0,0,0,0];
        }
        // iterate over each region
        for (const [v, company] of regionSub.entries()) {
            // iterate over each company
            for (var rounds of company[1]) {
                // iterate over each round
                for (let i = 0; i < rounds[1].length; i++) {
                    let stage = rounds[1][i]['funding_round_code'];
                    vis.timeFromFounding[v][stage] += d3.timeMonth.count(rounds[1][i].founded_at, rounds[1][i].funded_at);
                    vis.timeFromFounding[v][4][stage] += 1; // record number of companies that have been tallied so far
                }
            }
        }
        for (var region of vis.timeFromFounding) {
            for (let i = 0; i < 4; i++) {
                region[i] /= region[4][i];
            }
        }

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

        // clear previous stuff
        vis.svg.selectAll("circle").remove();
        vis.svg.selectAll(".seedMonths").remove();
        vis.svg.selectAll(".aMonths").remove();
        vis.svg.selectAll(".bMonths").remove();
        vis.svg.selectAll(".cMonths").remove();
        vis.current = 0;
        vis.timer.text(vis.current);

        vis.drawOpaque();
        vis.updateVis();
    }

    drawOpaque() {
        let vis = this;

        vis.foundCircles = vis.svg.selectAll('.foundCircle')
            .data(vis.timeFromFounding);
        vis.foundCircles
            .enter()
            .append('circle')
            .attr("class", "foundCircle")
            .merge(vis.foundCircles)
            .attr("cx", vis.offset/2 + vis.offset*1 + vis.margin.left)
            .attr("cy", (d, i) => 220 + i*70)
            .attr("r", 12)
            .attr("fill", "#ffd74c")
            .attr("opacity", 1);

        vis.seedCircles = vis.svg.selectAll('.seedCircle')
            .data(vis.timeFromFounding);
        vis.seedCircles
            .enter()
            .append('circle')
            .attr("class", "seedCircle")
            .merge(vis.seedCircles)
            .attr("cx", vis.offset/2 + vis.offset*2 + vis.margin.left)
            .attr("cy", (d, i) => 220 + i*70)
            .attr("r", 12)
            .attr("opacity", (d) => {
                if (vis.current >= d[0]){
                    return 1;
                } else{
                    return 0.2;
                }
            })
            .attr("fill", "#dbd6ff");

        vis.seedMonths = vis.svg.selectAll('.seedMonths')
            .data(vis.timeFromFounding);
        vis.seedMonths
            .enter()
            .append('text')
            .attr("class", "seedMonths")
            .style("opacity", 0)
            .merge(vis.seedMonths)
            .attr("transform", (d, i) => {
                let x = vis.offset/2 + vis.offset*2 + vis.margin.left;
                let y = 220 + i*70 - 19;
                return "translate(" + x + "," + y + ")";
            })
            .style("text-anchor", "middle")
            .transition()
            .delay(500)
            .style("opacity", (d) => {
                if (vis.current >= d[0]){
                    return 1;
                } else{
                    return 0;
                }
            })
            .text(d => Math.ceil(d[0]) + " mo.")
            .attr("fill", "white")

        vis.aCircles = vis.svg.selectAll('.aCircle')
            .data(vis.timeFromFounding);
        vis.aCircles
            .enter()
            .append('circle')
            .attr("class", "aCircle")
            .merge(vis.aCircles)
            .attr("cx", vis.offset/2 + vis.offset*3 + vis.margin.left)
            .attr("cy", (d, i) => 220 + i*70)
            .attr("r", 12)
            .attr("opacity", (d) => {
                if (vis.current >= d[1]){
                    return 1;
                } else{
                    return 0.2;
                }
            })
            .attr("fill", "#9f92fc");

        vis.aMonths = vis.svg.selectAll('.aMonths')
            .data(vis.timeFromFounding);
        vis.aMonths
            .enter()
            .append('text')
            .attr("class", "aMonths")
            .style("opacity", 0)
            .merge(vis.aMonths)
            .attr("transform", (d, i) => {
                let x = vis.offset/2 + vis.offset*3 + vis.margin.left;
                let y = 220 + i*70 - 19;
                return "translate(" + x + "," + y + ")";
            })
            .style("text-anchor", "middle")
            .text(d => Math.ceil(d[1]) + " mo.")
            .attr("fill", "white")
            .transition()
            .delay(500)
            .style("opacity", (d) => {
                if (vis.current >= d[1]){
                    return 1;
                } else{
                    return 0;
                }
            });

        vis.bCircles = vis.svg.selectAll('.bCircle')
            .data(vis.timeFromFounding);
        vis.bCircles
            .enter()
            .append('circle')
            .attr("class", "bCircle")
            .merge(vis.bCircles)
            .attr("cx", vis.offset/2 + vis.offset*4 + vis.margin.left)
            .attr("cy", (d, i) => 220 + i*70)
            .attr("r", 12)
            .attr("opacity", (d) => {
                if (vis.current >= d[2]){
                    return 1;
                } else{
                    return 0.2;
                }
            })
            .attr("fill", "#6955f8");


        vis.bMonths = vis.svg.selectAll('.bMonths')
            .data(vis.timeFromFounding);
        vis.bMonths
            .enter()
            .append('text')
            .attr("class", "bMonths")
            .style("opacity", 0)
            .merge(vis.bMonths)
            .attr("transform", (d, i) => {
                let x = vis.offset/2 + vis.offset*4 + vis.margin.left;
                let y = 220 + i*70 - 19;
                return "translate(" + x + "," + y + ")";
            })
            .style("text-anchor", "middle")
            .text(d => Math.ceil(d[2]) + " mo.")
            .attr("fill", "white")
            .transition()
            .delay(500)
            .style("opacity", (d) => {
                if (vis.current >= d[2]){
                    return 1;
                } else{
                    return 0;
                }
            });

        vis.cCircles = vis.svg.selectAll('.cCircle')
            .data(vis.timeFromFounding);
        vis.cCircles
            .enter()
            .append('circle')
            .attr("class", "cCircle")
            .merge(vis.cCircles)
            .attr("cx", vis.offset/2 + vis.offset*5 + vis.margin.left)
            .attr("cy", (d, i) => 220 + i*70)
            .attr("r", 12)
            .attr("opacity", (d) => {
                if (vis.current >= d[3]){
                    return 1;
                } else{
                    return 0.2;
                }
            })
            .attr("fill", "#3318ff");

        vis.cMonths = vis.svg.selectAll('.cMonths')
            .data(vis.timeFromFounding);
        vis.cMonths
            .enter()
            .append('text')
            .attr("class", "cMonths")
            .style("opacity", 0)
            .merge(vis.cMonths)
            .attr("transform", (d, i) => {
                let x = vis.offset/2 + vis.offset*5 + vis.margin.left;
                let y = 220 + i*70 - 19;
                return "translate(" + x + "," + y + ")";
            })
            .style("text-anchor", "middle")
            .text(d => Math.ceil(d[3]) + " mo.")
            .attr("fill", "white")
            .transition()
            .delay(500)
            .style("opacity", (d) => {
                if (vis.current >= d[3]){
                    return 1;
                } else{
                    return 0;
                }
            });
    }

    updateVis() {

        let vis = this;

        // LEGEND (milestone markers)
        let legend = ['Founded', 'Seed/Angel', 'Round A', 'Round B', 'Round C+'];
        let legendEnter = vis.svg.selectAll('.legend')
            .data(legend);
        legendEnter
            .enter()
            .append('text')
            .attr('class', 'legend')
            .attr('x', (d,i) => vis.offset/2 + vis.offset*(i+1) + vis.margin.left)
            .attr('y', 150)
            .attr('text-anchor', 'middle')
            .style('fill', '#dbd6ff')
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
            .attr('x', vis.margin.left)
            .attr('y', (d,i) => 220 + i*70)
            .attr('text-anchor', 'left')
            .style('fill', '#dbd6ff')
            .style("font-family", '"IBM Plex Mono", monospace')
            .merge(labelEnter)
            .text(d => d)
            .style('opacity', 0)
            .transition()
            .duration(800)
            .style('opacity', 1);

        labelEnter.exit().remove();

        // CAPTION
        d3.select("#funding-caption")
            .text("Seed funding and/or angel investing: still developing the idea and prototype, but shows potential. " +
                "Series A: scaling operations and building machinery. Series B: well-established and expanding. " +
                "Series C and beyond: solid record of success and (soon-to-be) profitable.")

        // CIRCLES
        let colors = ['#ffd74c', '#ffd74c', '#ffd74c', '#ffd74c'];

        let circleEnter = vis.svg.selectAll('.moveCircle')
            .data(vis.durations);

        circleEnter
            .enter()
            .append('circle')
            .attr("class", "moveCircle")
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
        // source: https://stackoverflow.com/questions/16994662/count-animation-from-number-a-to-b
        let totalTime = [];
        vis.durations.forEach(d => {
            totalTime.push(d3.sum(d));
        })
        let endMonths = d3.max(totalTime);

        // if (start === end) return;
        var range = Math.ceil(endMonths);
        vis.current = 0;
        var increment = 1;
        var duration = endMonths * 150 + 90;
        var stepTime = Math.abs(Math.floor(duration / range));
        // var obj = document.getElementById(id);
        var counter = setInterval(function() {
            vis.current += increment;

            // add an opaque circle first time that current > the milestone
            vis.drawOpaque();

            vis.timer.text(vis.current);
            vis.timerCaption.text("months since founding")
            if (vis.current == range) {
                clearInterval(counter);
                innovativeInProgress = 0;
            }
        }, stepTime);

    }
}