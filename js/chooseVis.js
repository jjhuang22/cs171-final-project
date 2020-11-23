/* * * * * * * * * * * * * *
*          chooseVis          *
* * * * * * * * * * * * * */

class ChooseVis {

    // constructor method to initialize MapVis object
    constructor(parentElement, companies, secondElement) {
        this.parentElement = parentElement;
        this.companies = companies;
        this.secondElement = secondElement;

        this.initVis()
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

        let randomX = d3.randomUniform(vis.margin.left * 5, vis.width - vis.margin.right * 5);
        let randomY = d3.randomUniform(vis.margin.top * 8, vis.height - vis.margin.bottom * 5);
        let randomSize = d3.randomNormal(4, 17);
        let randomOpacity = d3.randomUniform(.4, .9);
        let randomTime= d3.randomUniform(0, 2000);
        let randomBinary = d3.randomInt(2);

        let circles = [];
        for (let i = 0; i < 70; i++) {
            circles.push([[randomX(), randomX(), randomX()], [randomY(), randomY(), randomY()], Math.abs(randomSize()),randomOpacity(), randomBinary()]);
        }

        let colors = ['dodgerblue', 'salmon', 'lightgreen', 'lemonchiffon'];

        let blues = ['lightskyblue', 'paleturquoise', 'dodgerblue'];
        let reds = ['salmon', 'pink', 'indianred'];
        let greens = ['palegreen', 'lightgreen', 'darkseagreen'];

        let blue1 = ['#0390B8', '#62D4F4', '#04C8FF'];
        let red1 = ['#FB5F9E', '#FF0067', '#E4005C'];
        let yellow1 = ['#FFEA61', '#FFDD00', '#FFDD00'];

        // colors = [blue1, red1, yellow1];

        let instructions = vis.svg.append('text')
            .attr("text-anchor", "middle")
            .attr('x', vis.width / 2)
            .attr('y', vis.margin.top * 2)
            .attr('fill', 'black')
            .text('Click on a company!')
            .style("font-family", '"IBM Plex Mono", monospace')
            .transition()
            .delay(7000)
            .duration(1000)
            .attr('fill', 'white');

        let instructions2 = d3.select("#" + vis.secondElement)
            .style('color', 'black')
            .text('Research tells us that 21.5% of startups fail in the first year; 50% by the fifth; and 70% by the tenth.')
            .style("font-family", '"IBM Plex Mono", monospace')
            .transition()
            .delay(800)
            .duration(1000)
            .style('color', 'white')

            .transition()
            .delay(3000)
            .duration(1000)
            .style('color', 'black')

            .transition()
            .text("Sometimes you run out of time and money. Maybe you're in the wrong market, or your product isn't" +
                " as game-changing as you thought it would be, or there is simply too much competition.")
            .style("font-family", '"IBM Plex Mono", monospace')

            .transition()
            .delay(800)
            .duration(1000)
            .style('color', 'white');

        let circleEnter = vis.svg.selectAll('circle')
            .data(circles);

        circleEnter
            .enter()
            .append('circle')
            .attr("cx", d => d[0][0])
            .attr("cy", d => d[1][0])
            .attr("r", d => d[2])
            .attr("opacity", 0)
            .attr("fill", (d, i) => colors[i%3])
            // .attr("fill", (d, i) => colors[i%3][i%3])
            .on("click", function(event, d){

                d3.select("#" + vis.secondElement)
                    .style('color', 'white')
                    .text("But remember, patience is a virtue: a company’s age seems to have no relationship to " +
                        "whether it will eventually be acquired or taken public, or the amount that it exits at.")
                    .style("font-family", '"IBM Plex Mono", monospace')
                    .transition()
                    .delay(800)
                    .duration(1000)
                    .style('color', 'white')

                let ok = vis.svg.selectAll('circle')
                    .data(circles);

                ok
                    .enter()
                    .merge(ok)
                    .transition()
                    .duration(2000)
                    .attr("fill", function(d, i) {
                        if (d[4] == 0) {
                            return '#282828';
                        }
                        else {
                            return colors[(i+2)%3];
                        }
                    })
                    .attr("cy", function(d) {
                        if (d[4] == 0) {
                            return (vis.height + vis.margin.bottom * 16);
                        }
                        else {
                            return (d[1][0]);
                        }
                    });

            })

            .transition()
            .delay((d, i) => randomTime(i))
            .duration(3000)
            .attr("cx", d => d[0][1])
            .attr("cy", d => d[1][1])
            .attr("opacity", d => d[3])
            .attr("fill", (d, i) => colors[i%3])
            // .attr("fill", (d, i) => colors[i%3][i%3])
            .transition()
            .duration(2000)
            .attr("cx", d => d[0][2])
            .attr("cy", d => d[1][2])
            .attr("fill", (d, i) => colors[(i+1)%3])
            // .attr("fill", (d, i) => colors[i%3][(i+1)%3])
            .transition()
            .duration(2000)
            .attr("cx", d => d[0][0])
            .attr("cy", d => d[1][0])
            .attr("fill", (d, i) => colors[(i+2)%3]);
            // .attr("fill", (d, i) => colors[i%3][(i+2)%3]);


    }
}