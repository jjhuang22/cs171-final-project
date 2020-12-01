/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

let selectedTimeRange = [];
let selectedCategory = $('#categorySelector').val();
let sortByCategory = 'numCompanies';
let selectedRegions = $('#example-getting-started').val();
let selectedCompany = '';
let selectedLat = Number.NaN;
let selectedLong = Number.NaN;

let parseDate = d3.timeParse("%Y-%m-%d");
let formatDate = d3.timeFormat("%Y-%m-%d");

// load data using promises
let promises = [
    d3.json("data/states.json"),
    d3.csv("data/companies_final.csv"),
    d3.csv("data/acquisitions_final.csv"),
    d3.csv("data/rounds_final.csv"),
    d3.json("data/chartPacking.json"),
    d3.csv("data/scatterplot.csv")
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
    // init map
    myMapVis = new MapVis('mapDiv', dataArray[0], dataArray[1]);
    myBubbleVis = new BubbleVis('bubbleDiv', dataArray[1], dataArray[2]);
    myBarVis = new BarVis('barDiv', dataArray[1]);
    myChartPackingVis = new ChartPackingVis('chartPackingDiv', dataArray[4]);
    myScatterVis = new ScatterVis('scatterDiv', dataArray[5]);

    var choose_waypoint = new Waypoint({
        element: document.getElementById('chooseDivWaypoint'),
        handler: function() {
            myChooseVis = new ChooseVis('chooseDiv', dataArray[1].slice(0,70), 'chooseDivText');

            this.destroy();
        },
        offset: 40
    })

    var inno_waypoint = new Waypoint({
        element: document.getElementById('innovativeDivWaypoint'),
        handler: function() {
            myInnovativeVis = new InnovativeVis('innovativeDiv', dataArray[3]);

            this.destroy();
        },
        offset: 40
    })
    // myInnovativeVis = new InnovativeVis('innovativeDiv', dataArray[3]);

    // myInnovativeVis = new InnovativeVis('innovativeDiv', dataArray[3].slice(0,70));
}

function categoryChange() {
    selectedCategory = $('#categorySelector').val();
    myMapVis.wrangleData();
    myBarVis.wrangleData();
}

function regionChange() {
    selectedRegions = $('#example-getting-started').val();
    myInnovativeVis.initVis();
}

// function selectUber() {
//     selectedCompany = 'Uber';
//     selectedLat = 37.7562;
//     selectedLong = -122.443;
//     myMapVis.wrangleData();
// }
//
// function selectAirbnb() {
//     selectedCompany = 'Airbnb';
//     selectedLat = 37.7562;
//     selectedLong = -122.443;
//     myMapVis.wrangleData();
// }
//
// function selectLyft() {
//     selectedCompany = 'Lyft';
//     selectedLat = 37.7562;
//     selectedLong = -122.443;
//     myMapVis.wrangleData();
// }

var image = document.getElementsByClassName('thumbnail');
new simpleParallax(image, {
    scale:1.5,
    overflow: true
});

