/* * * * * * * * * * * * * *
*          chooseVis          *
* * * * * * * * * * * * * */

class ChooseVis {

    // constructor method to initialize MapVis object
    constructor(parentElement) {
        this.parentElement = parentElement;

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


        vis.x = d3.scaleLinear()
            .range([vis.margin.left, vis.width - vis.margin.right]);

        let randomX = d3.randomUniform(vis.margin.left * 3, vis.width - vis.margin.right * 3);
        let randomY = d3.randomUniform(vis.margin.top * 3, vis.height - vis.margin.bottom * 3);
        let randomSize = d3.randomNormal(4, 17);
        let randomOpacity = d3.randomUniform(.4, .9);
        let randomTime= d3.randomUniform(0, 2000);
        let randomBinary = d3.randomInt(2);

        let circles = [];
        for (let i = 0; i < 70; i++) {
            circles.push([randomX(), randomY(), Math.abs(randomSize()),randomOpacity(), randomBinary()]);
        }

        console.log(circles);

        let circleEnter = vis.svg.selectAll('circle')
            .data(circles);

        let colors = ['dodgerblue', 'salmon', 'lightgreen', 'lemonchiffon'];

        let blues = ['lightskyblue', 'paleturquoise', 'dodgerblue'];
        let reds = ['salmon', 'pink', 'indianred'];
        let greens = ['palegreen', 'lightgreen', 'darkseagreen'];

        // colors = [blues, reds, greens];

        circleEnter
            .enter()
            .append('circle')
            .attr("cx", d => d[0])
            .attr("cy", d => d[1])
            .attr("r", d => d[2])
            .attr("opacity", 0)
            // .attr("fill", (d, i) => colors[i%3][i%3])
            .attr("fill", (d, i) => colors[i%3])
            .merge(circleEnter)
            .transition()
            // .delay(function(d, i) { return i * 50; })
            .delay(i => randomTime(i))
            .duration(2000)
            .attr("cx", d => d[0])
            .attr("cy", d => d[1])
            .attr("r", d => d[2])
            .attr("opacity", d => d[3])
            // .attr("fill", (d, i) => colors[i%3][i%3])
            .attr("fill", (d, i) => colors[i%3])
            .transition()
            .duration(2000)
            .attr("cx", d => d[0])
            .attr("cy", d => d[1])
            .attr("r", d => d[2])
            .attr("opacity", d => d[3])
            // .attr("fill", (d, i) => colors[i%3][(i+1)%3])
            .attr("fill", (d, i) => colors[(i+1)%3])
            .transition()
            .duration(2000)
            .attr("cx", d => d[0])
            .attr("cy", d => d[1])
            .attr("r", d => d[2])
            .attr("opacity", d => d[3])
            // .attr("fill", (d, i) => colors[i%3][(i+2)%3]);
            .attr("fill", (d, i) => colors[(i+2)%3]);



    }
}