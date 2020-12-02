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
        let randomTrinary = d3.randomNormal(3, .6);
        let failure1 = d3.randomInt(5);
        let failure7 = d3.randomInt(3);

        let circles = [];
        for (let i = 0; i < 70; i++) {
            circles.push([[randomX(), randomX(), randomX()], [randomY(), randomY(), randomY()],
            Math.abs(randomSize()),randomOpacity(), randomBinary(), Math.round(randomTrinary()),
            [failure1(), randomBinary(), failure7()], randomTime()]);
        }

        let colors = ['dodgerblue', 'salmon', 'lightgreen', '#F0F5BB'];

        // let blues = ['lightskyblue', 'paleturquoise', 'dodgerblue'];
        // let reds = ['salmon', 'pink', 'indianred'];
        // let greens = ['palegreen', 'lightgreen', 'darkseagreen'];
        //
        // let blue1 = ['#0390B8', '#62D4F4', '#04C8FF'];
        // let red1 = ['#FB5F9E', '#FF0067', '#E4005C'];
        // let yellow1 = ['#FFEA61', '#FFDD00', '#FFDD00'];
        //
        // colors = [blue1, red1, yellow1];



        // let instructions = vis.svg.append('text')
        //     .attr("text-anchor", "middle")
        //     .attr('x', vis.width / 2)
        //     .attr('y', vis.margin.top * 2)
        //     .attr('fill', 'black')
        //     .text('Click on a company!')
        //     .style("font-family", '"IBM Plex Mono", monospace')
        //     .transition()
        //     .delay(7000)
        //     .duration(1000)
        //     .attr('fill', 'white');






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
                        if (d[4] == 0) {
                            return (vis.height + vis.margin.bottom * 16);
                        }
                        else {
                            return (d[1][0]);
                        }
                    });
            }}


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
                .transition().text('WOKSANDOKAND SAOKDN OINEIOFGENDFONASDIONAS DION FIONAIOFNIOASDNIOS ANDO ISANDOI')
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



        function STAGE1(){
            title.transition().duration(500).attr("opacity", 0)
                .transition().text('STAGE1: Ever-Changing Markets')
                .transition().duration(500).attr("opacity", 1);

            instructions.transition().duration(500).style('color', '#080314')
                .transition().text('The startup scene is always changing --- one moment software companies might be the hottest thing, and then in a flash it\'s all about wearable tech;')
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
                .merge(circleEnter)
                .transition()
                .delay(d => d[7])
                .duration(3000)
                .attr("cx", d => d[0][1])
                .attr("cy", d => d[1][1])
                .attr("opacity", d => d[3])
                .attr("fill", d => colors[d[5]%4])
                .transition()
                .duration(2000)
                .attr("cx", d => d[0][2])
                .attr("cy", d => d[1][2])
                .attr("fill", d => colors[(d[5]+1)%4])
                .transition()
                .duration(2000)
                .attr("cx", d => d[0][0])
                .attr("cy", d => d[1][0])
                .attr("fill", d => colors[(d[5]+2)%4])
                .transition()
                .duration(1000)
                .attr("cx", d => d[0][0])
                .attr("cy", d => d[1][0])
                .attr("fill", d => colors[(d[5]+2)%4])

                // BREAK

                .transition()
                .delay(d => 2000 - d[7])
                .duration(700)
                .attr("cx", d => d[0][0])
                .attr("cy", d => d[1][0])
                .attr("opacity", 0)
                .on("end", function(d){
                    vis.svg.selectAll('.circle').remove()
                });
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
                .transition().text('STAGE2: Survival of the Fittest')
                .transition().duration(500).attr("opacity", 1);

            instructions.transition().duration(500).style('color', '#080314')
                .transition().text('Research tells us that 21.5% of startups fail in the first year; 50% by the fifth; and 70% by the tenth.')
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
                .merge(circleEnter)
                .transition()
                .duration(2000)
                .attr("cx", d => d[0][2])
                .attr("cy", d => d[1][0])
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

                // BREAK

                .transition()
                .delay(4000)
                .duration(1500)
                .attr("cx", d => d[0][0])
                .attr("cy", d => d[1][0])
                .attr("opacity", 0)
                .on("end", function(d){
                    vis.svg.selectAll('.circle').remove()
                });
        }

        function STAGE3(){
            title.transition().duration(500).attr("opacity", 0)
                .transition().text('STAGE3: Choose Vis')
                .transition().duration(500).attr("opacity", 1);

            instructions.transition().duration(500).style('color', '#080314')
                .transition().text('Sometimes you run out of time and money. Maybe you\'re in the wrong market, or your product isn\'t" +\n' +
                '        " as game-changing as you thought it would be, or there is simply too much competition. \n Choose a company you think will succeed!')
                .transition().duration(500).style('color', 'white');

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
                .merge(circleEnter)
                .transition()
                .duration(2000)
                .attr("cx", d => d[0][2])
                .attr("cy", d => d[1][1])
                .attr("fill", d => colors[(d[5]+1)%4])
                .attr("opacity", d => d[3]);
        }


        function doh(code) {
            switch (code) {
                case 0: STAGE0(); break;
                case 1: STAGE1(); break;
                case 2: STAGE2(); break;
                case 3: STAGE3(); break;
                default : slide=0; STAGE0(); break;
            }
        }

    }
}