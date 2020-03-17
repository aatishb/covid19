function makeplot() {
 	Plotly.d3.csv("time_series_19-covid-Confirmed.csv", function(data){ processData(data) } );

};

function removeRepeats(array) {
	return [...new Set(array)];
}

function processData(data) {

	let countriesToLeaveOut = ['China', 'Cruise Ship'];

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

		if (!countriesToLeaveOut.includes(country)) {

			let slope = arr.map((e,i,a) => e - a[i - 7]);
			let startIndex = slope.findIndex(e => e >= 100);
			let maxCases = arr[arr.length - 1];

			if (startIndex > 0) {
				myData.push({
					country: country,
					dates: dates.slice(startIndex),
					data: slope.slice(startIndex),
					cases: maxCases
				});
			}
		}
	}

	myData = myData.sort((a,b) => a.cases < b.cases);

  makePlotly(myData);

}

function smoothedFunction(a, i) {
	return (-3 * a[i-2] + 12 * a[i-1] + 17 * a[i] + 12 * a[i+1] - 3*a[i+2])/35;
}

function smoothedDerivative(a, i) {
	return (a[i+2] - a[i-2])/4;
}

function makePlotly(arr) {
	var myDiv = document.getElementById("myDiv");


	let traces = arr//.filter(e => countries.includes(e.country))
		.map(e => ({
			y: e.data,
			name: e.country,
			mode: 'lines',
			line: {
				color: 'rgba(0,0,0,0.15)'
			},
			text: e.country + '<br>'+e.dates[e.dates.length - 1]+'<br>Current Weekly Cases: '+e.data[e.data.length - 1]+'<br>Peak weekly cases: '+e.data.reduce((a,b) => a > b ? a : b),
			//hoverinfo: 'text'
		})
	);

	let layout = {
		title: 'COVID-19 New Weekly Cases',
	  xaxis: {
	  },
		yaxis: {
			type: 'log'
		},
		hovermode: 'closest',
	};

	let config = {responsive: false}

	let myPlot = Plotly.newPlot('myDiv', traces, layout, config);

	myDiv.on('plotly_hover', function(data){
		//console.log('hover on', data);

		let curveNumber = data.points[0].curveNumber;
	  let update = {'line':{color: 'rgba(255,40,40,1)'}};
  	Plotly.restyle('myDiv', update, [curveNumber]);
	})
	 .on('plotly_unhover', function(data){
		//console.log('hover off', data);

		let curveNumber = data.points[0].curveNumber;
	  let update = {'line':{color: 'rgba(0,0,0,0.15)'}};
  	Plotly.restyle('myDiv', update, [curveNumber]);
	});


};

 makeplot();