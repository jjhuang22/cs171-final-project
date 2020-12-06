class Legend {

    // constructor method to initialize MapVis object
    constructor(parentElement) {
        this.parentElement = parentElement;
        this.data = ['Enterprise Software', 'Hardware', 'Software', 'Service Provider', 'Social Media'];

        console.log('legend is running')
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.width = $("#" + vis.parentElement).width();
        vis.height = $("#" + vis.parentElement).height();

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height);

        vis.colors = ["#120078", "#9D0191", "#FD3A69", "#fea71a", "#00BCD1"];

        let legendEnter = vis.svg.selectAll('.legend')
            .data(vis.data);
        legendEnter
            .enter()
            .append('rect')
            .attr('class', 'legend')
            .attr('x', (d,i) => vis.width/3*(i%3) + vis.width/8)
            .attr('y', (d,i) => vis.height/3*(i%2) + vis.height/4)
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", (d, i) => vis.colors[i])
            .style("opacity", 1)
            .attr("stroke", "white")
            .attr("stroke-width", 1)

        let labelEnter = vis.svg.selectAll('.label')
            .data(vis.data);
        labelEnter
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', (d,i) => vis.width/3*(i%3) + vis.width/6)
            .attr('y', (d,i) => vis.height/3*(i%2) + vis.height/4 + 14)
            .text(d => d)
            .style("font-family", '"IBM Plex Mono", monospace')
            .style("font-size", '12px')
            .style("fill", "white");
    }
}

