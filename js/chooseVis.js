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

        var formatTime = d3.timeFormat("%B %d, %Y");

        let randomX = d3.randomUniform(vis.margin.left * 8, vis.width - vis.margin.right * 8);
        let randomY = d3.randomUniform(vis.margin.top * 12, vis.height - vis.margin.bottom * 10);
        let randomSize = d3.randomNormal(11, 30);
        let randomOpacity = d3.randomUniform(.4, .9);
        let randomTime= d3.randomUniform(0, 2000);
        let randomBinary = d3.randomInt(2);
        let randomTrinary = d3.randomInt(4);
        let failure1 = d3.randomInt(5);
        let failure7 = d3.randomInt(3);


        const seed = 0.000171; // any number in [0, 1)
        let randomUnif = d3.randomUniform.source(d3.randomLcg(seed))(0, 1);
        let randomClosed = d3.randomInt.source(d3.randomLcg(seed))(0, 500);
        let randomOpen = d3.randomInt.source(d3.randomLcg(seed))(0, 7000);

        vis.groupedByMarket = d3.groups(vis.companies, d => d.country_code, d => d.status);


        let xyS3 = [];
        let companiesS3 = [];
        let colS3 = (vis.width - vis.margin.left * 3) / 6;
        let rowS3 = (vis.height - vis.margin.left * 3) / 5;
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 6; j++) {
                xyS3.push([colS3 * (j+ 1/2), rowS3 * (i + 1/2) + 20])
                if (randomUnif() > .8) {
                    companiesS3.push(vis.groupedByMarket[0][1][0][1][randomOpen()])
                }
                else {
                    companiesS3.push(vis.groupedByMarket[0][1][1][1][randomClosed()])
                }
            }
        }


        let circles = [];
        for (let i = 0; i < 30; i++) {
            circles.push([[randomX(), randomX(), randomX()], [randomY(), randomY(), randomY()],
            Math.abs(randomSize()),randomOpacity(), randomBinary(), Math.round(randomTrinary()),
            [failure1(), randomBinary(), failure7()], randomTime(), xyS3[i], companiesS3[i]]);
        }

        let colors = ['dodgerblue', 'salmon', 'lightgreen', '#F0F5BB'];





        // BUTTONS

        let slide = 0;

        d3.select("#chooseStart").on("click", function(){
            slide += 1;
            vis.svg.selectAll('circle').transition().duration(1000).attr("opacity", 0).remove();
            vis.svg.selectAll('text').transition().duration(1000).attr("opacity", 0).remove();
            doh(slide);
        });
        d3.select("#chooseBack").on("click", function(){
            slide -= 1;
            vis.svg.selectAll('circle').transition().duration(1000).attr("opacity", 0).remove();
            vis.svg.selectAll('text').transition().duration(1000).attr("opacity", 0).remove();
            doh(slide);
        });
        d3.select("#chooseReplay").on("click", function(){
            vis.svg.selectAll('circle').transition().duration(1000).attr("opacity", 0).remove();
            vis.svg.selectAll('text').transition().duration(1000).attr("opacity", 0).remove();
            doh(slide);
        });
        d3.select("#chooseReset").on("click", function(){
            slide = 0;
            vis.svg.selectAll('circle').transition().duration(1000).attr("opacity", 0).remove();
            vis.svg.selectAll('text').transition().duration(1000).attr("opacity", 0).remove();
            doh(slide);
        });

        // ADD ONCLICK FUNCTIONALITY TO CIRCLES
        function onclickS3(){
            if (slide == 3) {
                d3.select("#" + vis.secondElement)
                    .transition()
                    .duration(500)
                    .style('color', '#080314')
                    .transition()
                    .text("But remember, patience is a virtue: a company’s age seems to have no relationship to " +
                        "whether it will eventually be acquired or taken public, or the amount that it exits at.")
                    .transition()
                    .duration(1000)
                    .style('color', 'white')
                let ok = vis.svg.selectAll('.circle')
                    .data(circles);
                ok
                    .enter()
                    .merge(ok)
                    .transition()
                    .duration(2000)
                    .attr("cy", function(d) {
                        if (d[9].status == "closed") {
                            return (vis.height + vis.margin.bottom * 16);
                        }
                        else {
                            return (d[8][1]);
                        }
                    });
            }}



        vis.tooltip = d3.select("#chooseTooltip");


        let title = vis.svg.append('text')
            .attr("text-anchor", "middle")
            .attr('x', vis.width / 2)
            .attr('y', vis.margin.top * 2)
            .attr('fill', 'white')
            .attr("opacity", 1)
            .text('')
            .style("font-family", '"IBM Plex Mono", monospace');

        let instructions = d3.select("#" + vis.secondElement)
            .text('')
            .style("font-family", '"IBM Plex Mono", monospace')
            .style('color', '#080314');

        STAGE0();


        function STAGE0(){
            title.transition().duration(500).attr("opacity", 0)
                .transition().text('STAGE0: Key')
                .transition().duration(500).attr("opacity", 1);

            instructions.transition().duration(500).style('color', '#080314')
                .transition().text('We’ve followed the startup’s journey from conception to growth to maturation. But what about the ones that don’t make it? In this visualization, we take a step back and look at the big picture of what influences a startup’s eventual success or failure.')
                .transition().duration(500).style('color', 'white');

            // CIRCLES
            vis.svg.append("circle")
                .attr("class", "tutorial")
                .attr("cx", vis.width / 2)
                .attr("cy", vis.height / 2)
                .attr("r", 90)
                .attr("opacity", 0)
                .attr("fill", "white")
                .transition().duration(1000).attr("opacity", 1)

            vis.svg.append("text")
                .attr("class", "tutorial")
                .attr("text-anchor", "middle")
                .attr("x", vis.width / 4)
                .attr("y", vis.height / 4)
                .text("Circles represent COMPANIES")
                .attr("opacity", 0)
                .attr("fill", "white")
                .transition().duration(1000).attr("opacity", 1)

            // COLORS
            vis.svg.append("text")
                .attr("class", "tutorial")
                .attr("text-anchor", "middle")
                .attr("x", 140)
                .attr("y", vis.height / 5 * 4 + 40)
                .text("Colors represent MARKETS")
                .attr("opacity", 0)
                .attr("fill", "white")
                .transition().duration(1000).attr("opacity", 1)

            vis.svg.selectAll(".colors")
                .data(colors)
                .enter()
                .append("circle")
                .attr("class", "colors tutorial")
                .attr("cy", vis.height / 5 * 4)
                .attr("cx", (d,i) => 80 + 40*i)
                .attr("fill", d => d)
                .attr("opacity", 0)
                .attr("r", 15)
                .transition().duration(1000).attr("opacity", 1);


            // SIZES
            vis.svg.append("text")
                .attr("class", "tutorial")
                .attr("text-anchor", "middle")
                .attr("x", vis.width / 4 * 3)
                .attr("y", vis.height / 4 * 3)
                .text("Sizes represent VALUATION")
                .attr("opacity", 0)
                .attr("fill", "white")
                .transition().duration(1000).attr("opacity", 1)

            vis.svg.selectAll(".sizes")
                .data([[vis.width/2 + 120, vis.height/2 - 120, 50],[vis.width/2 + 180, vis.height/2, 70]])
                .enter()
                .append("circle")
                .attr("class", "sizes tutorial")
                .attr("cy", d => d[1])
                .attr("cx", d => d[0])
                .attr("fill", "white")
                .attr("opacity", 0)
                .attr("r", d => d[2])
                .transition().duration(1000).attr("opacity", 1);

        }

        let uniquemarkets = ['Digital Media', 'Finance', 'Apps', 'Software','Wine And Spirits','Health','Clean Technology','Location Based Services','Diagnostics','Social Media','Search','E-Commerce','Biotechnology','Curated Web','Security','Sports','Internet']

        var color = d3.scaleOrdinal().domain(uniquemarkets)
            .range(d3.schemeSet3);

        console.log(color('Apps'));


        function STAGE1(){
            title.transition().duration(500).attr("opacity", 0)
                .transition().text("Disruptive Innovation")
                .transition().duration(500).attr("opacity", 1);

            instructions.transition().duration(500).style('color', '#080314')
                .transition().text("You’ve probably heard of a “disruptor”--a company that shakes up the status quo. Think Netflix versus Blockbuster, or Uber versus taxis. When companies innovate, whole markets can become obsolete, with new ones taking their place.")
                .transition().duration(500).style('color', 'white');

            d3.selectAll(".tutorial").transition().duration(1000).attr("opacity", 0).remove();

            let circleEnter = vis.svg.selectAll('.circle')
                .data(circles);

            circleEnter
                .enter()
                .append('circle')
                .attr("class", "circle")
                .attr("cx", d => d[0][0])
                .attr("cy", d => d[1][0])
                .attr("r", d => d[2])
                .attr("opacity", 0)
                .attr("fill", d => colors[d[5]%4])
                .on("click", function(event, d){
                    onclickS3();
                })
                .on("mouseover", function(event, d){
                    if (slide == 3){
                        d3.select(this)
                            .style("fill", "#ffd74c")
                            .style("opacity", 1);
                        vis.tooltip
                            .html(`
                             <h6><strong><em>${d[9].name}</em></strong><br>
                             Location: ${d[9].cityMap} <br>
                             Market: ${d[9].market} <br>
                             Year Founded: ${formatTime(d[9].founded_at)}</h6>`);
                    }
                })
                .on("mouseout", function(event, d){
                    if (slide == 3){
                        d3.select(this)
                            .style("fill", d => color(d[9].market))
                            .style("opacity", 1);
                        vis.tooltip
                            .html(`<h3></h3><br/>
                                <h6></h6><br/>
                                <h6></h6><br/>
                                <h6></h6><br/>
                                <h6></h6>`);
                    }
                })
                .merge(circleEnter)
                .transition()
                .delay(d => d[7])
                .duration(3000)
                .attr("cx", d => d[0][1])
                .attr("cy", d => d[1][1])
                .attr("opacity", d => d[3])
                .attr("fill", d => colors[d[5]%4])
                .transition()
                .delay(400)
                .duration(2000)
                .attr("cx", d => d[0][2])
                .attr("cy", d => d[1][2])
                .attr("fill", "salmon")
                .transition()
                .duration(2000)
                .attr("cx", d => d[0][1])
                .attr("cy", d => d[1][0])
                .attr("fill", "salmon")
                .transition()
                .duration(2000)
                .attr("cx", d => d[0][0])
                .attr("cy", d => d[1][0])
                .attr("fill", "dodgerblue")
                // .transition()
                // .duration(1000)
                // .attr("cx", d => d[0][0])
                // .attr("cy", d => d[1][0])
                // .attr("fill", d => colors[(d[5]+2)%4]);

            let red = vis.svg.append('circle')
                .attr("cx", -100)
                .attr("cy", -100)
                .attr("r", 12)
                .attr("opacity", 1)
                .attr("fill", "salmon");

            red
                .transition()
                .delay(2500)
                .duration(2000)
                .attr("cx", 80)
                .attr("cy", 80)
                .attr("opacity", 1)
                .attr("fill", "salmon")
                .transition()
                .delay(3300)
                .duration(2000)
                .attr("fill", "dodgerblue");


            let green = vis.svg.append('circle')
                .attr("cx", 10000)
                .attr("cy", 10000)
                .attr("r", 21)
                .attr("opacity", 1)
                .attr("fill", "dodgerblue");

            green
                .transition()
                .delay(6000)
                .duration(2700)
                .attr("cx", 700)
                .attr("cy", 400)
                .attr("opacity", 1)
                .attr("fill", "dodgerblue");


        }



        function STAGE2(){
            let textS2 = vis.svg.append("text")
                .attr("text-anchor", "middle")
                .attr("x", vis.width/2)
                .attr("y", vis.height/12 * 11)
                .attr("fill", "white")
                .attr("opacity", 1)
                .text('');

            title.transition().duration(500).attr("opacity", 0)
                .transition().text('Survival of the Fittest')
                .transition().duration(500).attr("opacity", 1);

            instructions.transition().duration(500).style('color', '#080314')
                .transition().text('Research tells us that 21.5% of startups fail in the first year; 50% by the fifth; and 70% by the tenth. Sometimes you run out of time and money. Maybe you’re in the wrong market, or your product isn’t as game-changing as you thought it would be, or there is simply too much competition.')
                .transition().duration(500).style('color', 'white');

            textS2.transition().duration(500).attr("opacity", 0)
                .transition().text('FOUNDING')
                .transition().duration(500).attr("opacity", 1)
                .transition().duration(1000).attr("opacity", 0)

                .transition().text('After ONE Year')
                .transition().duration(500).attr("opacity", 1)
                .transition().delay(2000).duration(500).attr("opacity", 0)

                .transition().text('After FIVE Years')
                .transition().delay(1000).duration(500).attr("opacity", 1)
                .transition().delay(2000).duration(500).attr("opacity", 0)

                .transition().text('After TEN Years')
                .transition().delay(1000).duration(500).attr("opacity", 1)
                .transition().delay(2000).duration(500).attr("opacity", 0);

            let circleEnter = vis.svg.selectAll('.circle')
                .data(circles);

            circleEnter
                .enter()
                .append('circle')
                .attr("class", "circle")
                .attr("cx", d => d[0][0])
                .attr("cy", d => d[1][0])
                .attr("r", d => d[2])
                .attr("opacity", 0)
                .attr("fill", d => colors[d[5]%4])
                .on("click", function(event, d){
                    onclickS3();
                })
                .on("mouseover", function(event, d){
                    if (slide == 3){
                        d3.select(this)
                            .style("fill", "#ffd74c")
                            .style("opacity", 1);
                        vis.tooltip
                            .html(`
                             <h3>${d[9].name}</h3>
                             <h6>Location: ${d[9].cityMap} <br>
                             Market: ${d[9].market} <br>
                             Year Founded: ${formatTime(d[9].founded_at)}</h6>`);
                    }
                })
                .on("mouseout", function(event, d){
                    if (slide == 3){
                        d3.select(this)
                            .style("fill", d => color(d[9].market))
                            .style("opacity", 1);
                        vis.tooltip
                            .html(`<h3></h3><br/>
                                <h6></h6><br/>
                                <h6></h6><br/>
                                <h6></h6><br/>
                                <h6></h6>`);
                    }
                })
                .merge(circleEnter)
                .transition()
                .duration(2000)
                .attr("cx", d => d[0][2])
                .attr("cy", d => d[1][0])
                .attr("opacity", d => d[3])
                .attr("fill", d => colors[d[5]%4])
                .transition()
                .duration(2000)
                .attr("r", function(d){
                    if (d[6][0] != 0) {
                        return d[2] + 10;
                    }
                    else {
                        return 0;
                    }
                })
                .attr("opacity", function(d){
                    if (d[6][0] != 0) {
                        return d[3];
                    }
                    else {
                        return 0;
                    }
                })

                .transition()
                .duration(2000)
                .attr("cx", d => d[0][0])
                .attr("cy", d => d[1][1])
                .transition()
                .duration(2000)
                .attr("r", function(d){
                    if ((d[6][1] == 0) && (d[6][0] != 0)) {
                        return d[2] + 30;
                    }
                    else {
                        return 0;
                    }
                })
                .attr("opacity", function(d){
                    if ((d[6][1] == 0) && (d[6][0] != 0)) {
                        return d[3];
                    }
                    else {
                        return 0;
                    }
                })

                .transition()
                .duration(2000)
                .attr("cx", d => d[0][1])
                .attr("cy", d => d[1][0])
                .transition()
                .duration(2000)
                .attr("r", function(d){
                    if ((d[6][2] == 0) && (d[6][1] == 0) && (d[6][0] != 0)) {
                        return d[2] + 50;
                    }
                    else {
                        return 0;
                    }
                })
                .attr("opacity", function(d){
                    if ((d[6][2] == 0) && (d[6][1] == 0) && (d[6][0] != 0)) {
                        return d[3];
                    }
                    else {
                        return 0;
                    }
                })
        }


        var bubbleScaleS3 = d3.scaleLinear()
            .range([8, 40])
            .domain([d3.least(companiesS3, d => d.funding_total_usd).funding_total_usd, d3.greatest(companiesS3, d => d.funding_total_usd).funding_total_usd]);

        // console.log(bubbleScaleS3(circles[0][9]));

        function STAGE3(){
            title.transition().duration(500).attr("opacity", 0)
                .transition().text('Skill or Luck?')
                .transition().duration(500).attr("opacity", 1);

            instructions.transition().duration(500).style('color', '#080314')
                .transition().text('Here are 30 companies founded between 2000 and 2014. Hover to find out more about the company’s idea, and then click on one that you believe made it to 2014.')
                .transition().duration(500).style('color', 'white');

            let circleEnter = vis.svg.selectAll('.circle')
                .data(circles);

            circleEnter
                .enter()
                .append('circle')
                .attr("class", "circle")
                .attr("cx", d => d[8][0])
                .attr("cy", d => d[8][1])
                .attr("r", 23)
                .attr("opacity", 0)
                .attr("fill", d => color(d[9].market))
                .on("click", function(event, d){
                    onclickS3();
                })
                .on("mouseover", function(event, d){
                    if (slide == 3){
                        d3.select(this)
                            .style("fill", "#ffd74c")
                            .style("opacity", 1);
                        vis.tooltip
                            .html(`
                             <h3>${d[9].name}</h3>
                             <h6>Location: ${d[9].cityMap} <br>
                             Market: ${d[9].market} <br>
                             Year Founded: ${formatTime(d[9].founded_at)}</h6>`);
                    }
                })
                .on("mouseout", function(event, d){
                    if (slide == 3){
                        d3.select(this)
                            .style("fill", d => color(d[9].market))
                            .style("opacity", 1);
                        vis.tooltip
                            .html(`<h3></h3><br/>
                                <h6></h6><br/>
                                <h6></h6><br/>
                                <h6></h6><br/>
                                <h6></h6>`);
                    }
                })
                .merge(circleEnter)
                .transition()
                .duration(2000)
                .attr("cx", d => d[8][0])
                .attr("cy", d => d[8][1])
                .attr("fill", d => color(d[9].market))
                .attr("r", 23)
                .attr("opacity", function(d){
                    if (d[8][0] != 0){
                        return 1;
                    }
                    else {
                        return 0;
                    }});
        }



        function doh(code) {
            switch (code) {
                case 0: STAGE0(); break;
                case 1: STAGE1(); break;
                case 2: STAGE2(); break;
                case 3: STAGE3(); break;
                // case 4: STAGE4(); break;
                default : slide=0; STAGE0(); break;
            }
        }

    }
}