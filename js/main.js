/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables & switches
// let myDataTable,
let myMapVis;
    // myBarVisOne,
    // myBarVisTwo,
    // myBrushVis;

// let selectedTimeRange = [];
// let selectedState = '';

let parseDate = d3.timeParse("%Y-%m-%d");
let formatDate = d3.timeFormat("%Y-%m-%d");

// load data using promises
let promises = [
    // d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"),  // not projected -> you need to do it
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json"), // already projected -> you can just scale it to ft your browser window
    d3.csv("data/companiesCities.csv")
];

Promise.all(promises)
    .then( function(data){

        data[1].forEach(function(d) {
            console.log(d);
            d.first_funding_at = parseDate(d.first_funding_at);
            d.founded_at = parseDate(d.founded_at);
            d.founded_year = +d.founded_year; // change to int, maybe keep as string?
            d.funding_rounds = +d.funding_rounds;
            d.funding_total_usd = +d.funding_total_usd;
            d.last_funding_at = parseDate(d.last_funding_at);
            d.lat = +d.lat;
            d.lng = +d.lng;
        })

        initMainPage(data)
    })
    .catch( function (err){console.log(err)} );

// initMainPage
function initMainPage(dataArray) {

    console.log(dataArray[1]);
    // init map
    myMapVis = new MapVis('mapDiv', dataArray[0], dataArray[1]);
}



