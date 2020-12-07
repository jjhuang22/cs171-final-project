/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

let selectedTimeRange = [];
let selectedCategory = $('#categorySelector').val();
let sortByCategory = 'numCompanies';
let compareCategory = $('#compare-by').val();
let selectedCompany = '';
let alreadyExploredScatter = 0;
let innovativeInProgress = 0;
let stepCounter = 0;

let parseDate = d3.timeParse("%Y-%m-%d");
let formatDate = d3.timeFormat("%Y-%m-%d");
function getStage(code) {
    switch (code) {
        case '0': return 0;
        case 'A': return 1;
        case 'B': return 2;
        case 'C': return 3;
    }
}

// load data using promises
let promises = [
    d3.json("data/clean/states.json"),
    d3.csv("data/clean/companies_final.csv"),
    d3.csv("data/clean/acquisitions_final.csv"),
    d3.csv("data/clean/rounds_final.csv"),
    d3.json("data/clean/chartPacking.json"),
    d3.csv("data/clean/scatterplot_cleanMarket.csv")
];

Promise.all(promises)
    .then( function(data){

        data[1].forEach(function(d) {
            d.first_funding_at = parseDate(d.first_funding_at);
            d.founded_at = parseDate(d.founded_at);
            d.founded_year = +d.founded_year; // change to int, maybe keep as string?
            d.funding_rounds = +d.funding_rounds;
            d.funding_total_usd = +d.funding_total_usd;
            d.last_funding_at = parseDate(d.last_funding_at);
            d.lat = +d.lat;
            d.lng = +d.lng;
        })

        data[2].forEach(function(d) {
            d.acquired_at = parseDate(d.acquired_at);
            d.acquired_year = +d.acquired_year; // may not need
            d.price_amount = +d.price_amount;
        })

        data[3].forEach(function(d) {
            d.funded_at = parseDate(d.funded_at);
            d.founded_at = parseDate(d.founded_at);
            d.raised_amount_usd  = +d.raised_amount_usd;
            d.funding_round_code = getStage(d.funding_round_code);
        })

        data[5].forEach(function(d) {
            d.raised_amount_usd  = +d.raised_amount_usd;
            d.price_amount = +d.price_amount;
            d.acquired_at = parseDate(d.acquired_at);
            d.acquired_year = +d.acquired_year;
        })

        initMainPage(data)
    })
    .catch( function (err){console.log(err)} );



// init global variables & switches
let myMapVis,
    myBubbleVis,
    myBarVis,
    myChooseVis,
    myInnovativeVis,
    myChartPackingVis,
    myScatterVis;


// initMainPage
function initMainPage(dataArray) {
    myMapVis = new MapVis('mapDiv', dataArray[0], dataArray[1]);
    myBubbleVis = new BubbleVis('bubbleDiv', dataArray[1], dataArray[2]);
    myBarVis = new BarVis('barDiv', dataArray[1]);
    myChartPackingVis = new ChartPackingVis('chartPackingDiv', dataArray[4], 0);
    myScatterVis = new ScatterVis('scatterDiv', dataArray[5]);
    myInnovativeVis = new InnovativeVis('innovativeDiv', dataArray[3]);
    myChartPackingLegend = new Legend('chartPackingLegend');
    myBubbleLegend = new Legend('bubbleLegend');
    myChartPackingVis1 = new ChartPackingVis('chartPacking1', dataArray[4], 1);
    myChartPackingVis2 = new ChartPackingVis('chartPacking2', dataArray[4], 2);
    myChartPackingVis3 = new ChartPackingVis('chartPacking3', dataArray[4], 3);


    myChooseVis = new ChooseVis('chooseDiv', dataArray[1], 'chooseDivText');


    // var inno_waypoint = new Waypoint({
    //     element: document.getElementById('innovativeDivWaypoint'),
    //     handler: function() {
    //         myInnovativeVis = new InnovativeVis('innovativeDiv', dataArray[3]);
    //
    //         this.destroy();
    //     },
    //     offset: 40
    // })
}

function categoryChange() {
    selectedCategory = $('#categorySelector').val();
    myMapVis.wrangleData();
    myBarVis.wrangleData();
}

function animateScatter() {
    if (!alreadyExploredScatter) {
        alreadyExploredScatter = 1;
        myScatterVis.startAnimation();
    }
    else if (alreadyExploredScatter && document.getElementById('animateScatter').innerText == 'RESTART'){
        document.getElementById('animateScatter').innerHTML = 'EXPLORE';
        d3.select("#scatterYear").text("Current year: ");
        myScatterVis.startAnimation();
    }
}

function applyRegion() {
    if (compareCategory == 'company_region'){
        selectedRegions = $('#select-region').val();
    } else if (compareCategory == 'company_market'){
        selectedRegions = $('#select-market').val();
    }
    console.log(selectedRegions);

    // if ((selectedRegions.length != 4) || selectedRegions == null){
    //     let rect = d3.select("#compare-by-button").node().getBoundingClientRect();
    //     let x = rect.width + rect.x;
    //     let y = rect.y;
    //     d3.select("#innovativeTooltip")
    //         .style("opacity", 1)
    //         .style("left", Math.round(x) + "px")
    //         .style("top", event.pageY + "px")
    //         .html(`
    //              <div style="border: thin solid white; border-radius: 0px; background: -webkit-linear-gradient(90deg, #94bbe9, #eeaeca); padding: 20px">
    //                  <h6> Make sure to select exactly 4 options!</h6>
    //              </div>`);
    //
    //     setTimeout(function() {
    //         d3.select("#innovativeTooltip")
    //             .style("opacity", 0)
    //             .style("left", 0)
    //             .style("top", 0)
    //             .html(``);
    //     }, 2000);
    // }
    if (selectedRegions.length == 4 && innovativeInProgress == 0){

        myInnovativeVis.wrangleData();
        innovativeInProgress = 1;
    }
}

function chooseCategory() {
    compareCategory = $('#compare-by').val();
    d3.select("#compare-by-button").style("display", "block");
    if (compareCategory == "company_market") {
        d3.select("#select-market-div").style("display", "block");
        d3.select("#select-region-div").style("display", "none");
    }
    else if (compareCategory == "company_region") {
        d3.select("#select-region-div").style("display", "block");
        d3.select("#select-market-div").style("display", "none");
    }

    myInnovativeVis.setCategory();
}

function animateChartPacking() {
    // add 1 to step counter mod 4
    stepCounter = (stepCounter + 1)%4;
    console.log(stepCounter);

    if (stepCounter == 0){
        d3.select("#chartPackingDiv").style("display", "block");
        d3.select("#chartPacking3").style("display", "none");
        d3.select("#layer1").style("display", "block");
        d3.select("#stage3").style("display", "none");
        d3.select("#instructions").style("display", "block")
    } else if (stepCounter == 1){
        d3.select("#chartPackingDiv").style("display", "none");
        d3.select("#chartPacking1").style("display", "block");
        d3.select("#layer1").style("display", "none");
        d3.select("#stage1").style("display", "block");
        d3.select("#instructions").style("display", "none")
    } else if (stepCounter == 2){
        d3.select("#chartPacking1").style("display", "none");
        d3.select("#chartPacking2").style("display", "block");
        d3.select("#stage1").style("display", "none");
        d3.select("#stage2").style("display", "block");
    } else if (stepCounter == 3){
        d3.select("#chartPacking2").style("display", "none");
        d3.select("#chartPacking3").style("display", "block");
        d3.select("#stage2").style("display", "none");
        d3.select("#stage3").style("display", "block");
    }
}

