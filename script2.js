function makeplot() {
  Plotly.d3.csv("time_series_19-covid-Confirmed.csv", function(data){ processData(data) } );

};

function removeRepeats(array) {
  return [...new Set(array)];
}
function processData(data) {

  let countriesToLeaveOut = [];

  let countries = data.map(e => e["Country/Region"]);
  countries = removeRepeats(countries);

  let dates = Object.keys(data[0]).slice(4);
  let mostRecentDate = dates[dates.length - 1];

  let myData = [];
  for (let country of countries){
    let countryData = data.filter(e => e["Country/Region"] == country);
    let arr = [];

    for (let date of dates) {
      let sum = countryData.map(e => parseInt(e[date])).reduce((a,b) => a+b);
      arr.push(sum);
    }

    if (arr[arr.length - 1] >= 1000 && !countriesToLeaveOut.includes(country)) {
      myData.push({
        country: country,
        data: arr.map((e,i,a) => (e - a[i - 7]))
      });
    }
  }

  makePlotly(myData, dates);

}

function smoothedFunction(a, i) {
  return (-3 * a[i-2] + 12 * a[i-1] + 17 * a[i] + 12 * a[i+1] - 3*a[i+2])/35;
}

function smoothedDerivative(a, i) {
  return (a[i+2] - a[i-2])/4;
}

function makePlotly(arr, dates) {
  var plotDiv = document.getElementById("plot");


  let traces = arr//.filter(e => countries.includes(e.country))
    .map(e => ({
      x: dates.slice(7),
      y: e.data.slice(7),
      name: e.country,
      mode: 'lines'
    })
  );


  let layout = {
    title: 'COVID-19 Derivative of Cases',
    xaxis: {
    },
    yaxis: {
        type: 'log',
        range: [2, 5]
      }

  };

  Plotly.newPlot('myDiv', traces, layout);
};

 makeplot();