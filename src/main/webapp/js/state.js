var polygons = new Array();
var sunburstGraph = new Object();
var years = new Array("2001", "2002", "2003", "2004", "2005", "2006", "2007",
		"2008", "2009", "2010", "2011", "2012");

function initStates() {
	var mapOptions = {
		zoom : 5,
		maxZoom : 13,
		center : new google.maps.LatLng(23.29004039, 78.44355469),
		mapTypeId : google.maps.MapTypeId.ROAD,
		scrollwheel : false,
		scaleControl : false,
		zoomControl : false,
		draggable : false,
		disableDoubleClickZoom : true,
		streetViewControl : false
	};

	var map = new google.maps.Map(document.getElementById('map-india-canvas'),
			mapOptions);

	for ( var state in states) {
		var coords = [];
		$.ajax({
			url : "Data/states/" + state.toLowerCase(),
			success : function(data) {
				$.each(data, function(c, s) {
					coords.push(new google.maps.LatLng(s.lat, s.lon));
				});
			},
			async : false,
			type : "GET",
			dataType : 'json'
		});

		polygon = new google.maps.Polygon({
			paths : coords,
			strokeColor : "white",
			strokeOpacity : 1.5,
			strokeWeight : 1,
			fillColor : "black",
			fillOpacity : 1.0
		});
		polygon.state = state.toUpperCase();
		var polyContainer = new Object();
		polyContainer.state = state.toUpperCase();
		polyContainer.polygon = polygon;
		polygons.push(polyContainer);

		attachInfoWindow(polygon, map, polygon.state);

		polygon.setMap(map);

	}

	styles = [ {
		"featureType" : "water",
		"elementType" : "geometry",
		"stylers" : [ {
			visibility : "on"
		}, {
			hue : "#1b66d8"
		}, {
			saturation : 100
		}, {
			lightness : -10
		}, ]
	}, {
		"featureType" : "landscape",
		"elementType" : "geometry",
		"stylers" : [ {
			"color" : "#000000"
		}, {
			"lightness" : 20
		} ]
	}, {
		"featureType" : "road.highway",
		"elementType" : "geometry.fill",
		"stylers" : [ {
			"color" : "#000000"
		}, {
			"lightness" : 17
		} ]
	}, {
		"featureType" : "road.highway",
		"elementType" : "geometry.stroke",
		"stylers" : [ {
			"color" : "#000000"
		}, {
			"lightness" : 29
		}, {
			"weight" : 0.2
		}, {
			"visibility" : "off"
		} ]
	}, {
		"featureType" : "road.arterial",
		"elementType" : "geometry",
		"stylers" : [ {
			"color" : "#000000"
		}, {
			"lightness" : 18
		}, {
			"visibility" : "off"
		} ]
	}, {
		"featureType" : "road.local",
		"elementType" : "geometry",
		"stylers" : [ {
			"color" : "#000000"
		}, {
			"lightness" : 16
		}, {
			"visibility" : "off"
		} ]
	}, {
		"featureType" : "poi",
		"elementType" : "geometry",
		"stylers" : [ {
			"color" : "#000000"
		}, {
			"lightness" : 21
		} ]
	}, {
		"elementType" : "labels.text.stroke",
		"stylers" : [ {
			"visibility" : "off"
		}, {
			"color" : "#000000"
		}, {
			"lightness" : 16
		} ]
	}, {
		"elementType" : "labels.text.fill",
		"stylers" : [ {
			"saturation" : 36
		}, {
			"color" : "#000000"
		}, {
			"lightness" : 40
		}, {
			"visibility" : "off"
		} ]
	}, {
		"elementType" : "labels.icon",
		"stylers" : [ {
			"visibility" : "off"
		} ]
	}, {
		"featureType" : "transit",
		"elementType" : "geometry",
		"stylers" : [ {
			"color" : "#000000"
		}, {
			"lightness" : 19
		} ]
	}, {
		"featureType" : "administrative",
		"elementType" : "geometry.fill",
		"stylers" : [ {
			"color" : "#000000"
		}, {
			"lightness" : 20
		} ]
	}, {
		"featureType" : "administrative",
		"elementType" : "geometry.stroke",
		"stylers" : [ {
			"color" : "#000000"
		}, {
			"lightness" : 17
		}, {
			"weight" : 1.2
		} ]
	} ]

	map.setOptions({
		styles : styles
	});

	updateVisual();

}

function attachInfoWindow(poly, map, html) {
	google.maps.event.addListener(poly, 'mouseover', function(e) {
		var infoWindow = new google.maps.InfoWindow();
		infoWindow.setContent(getHTMLForPloygonInfo(poly.state));
		var latLng = e.latLng;
		infoWindow.setPosition(latLng);
		infoWindow.open(map);
		poly.infoWindow = infoWindow;
	});

	google.maps.event.addListener(poly, 'mouseout', function() {
		poly.infoWindow.close(map);
	});
}

function getHTMLForPloygonInfo(state) {
	perstate = (((crimesData[state])[$("#crime").val()])[$("#years").val()]);
	var html = "<div  style='width:200px'><h4>" + state + "</h4><br/>"
			+ "<b>Number of Incidents</b> : " + perstate + "<br/>"
			+ "<b> Country Average </b> : " + Math.round(crimeAvgPerState)
			+ "<br/>" + "<b> Country Highest </b> : " + crimeMaxPerState
			+ "<br/>" + "<b> Country Lowest </b> : " + crimeMinPerState
			+ "<br/>" + "</div>";
	return html;
}

var crimesData = new Object();
var iCrimes = new Object();
var crimesList = new Array();
var iStates = new Object();
var states = new Object();
var statesList = new Array();
var crimeAvgPerState;
var crimeMaxPerState;
var crimeMinPerState;

$.ajax({
	url : "Data/crimes/crimes.txt",
	success : function(response) {
		$.each(response.data, function(k, s) {
			var year = new Object();
			for (i = 0; i < 12; i++) {
				year[2001 + i] = s[2 + i];
			}
			var crime = new Object();
			if (crimesData[s[0]] == null) {
				var crimes = Object();
				crimes[s[1]] = year;
				crimesData[s[0]] = crimes;
			} else {
				crimes = crimesData[s[0]];
				crimes[s[1]] = year;
			}

			iCrimes[s[1]] = s[1];
			iStates[s[0]] = s[0];
		});

		createStatesSubList();
		createCrimeSubList();
		initDropDowns();
		initStates();

	},
	async : false,
	type : "GET",
	dataType : 'json'
});

function createStatesSubList() {
	for ( var m in iStates) {
		if (m == "TOTAL (STATES)" || m == "LAKSHADWEEP" || m == "PUDUCHERRY"
				|| m == "TOTAL (UTs)" || m == "TOTAL (ALL-INDIA)"
				|| m == "CHANDIGARH" || m == "D & N HAVELI"
				|| m == "DAMAN & DIU" || m == "A & N ISLANDS") {

		} else {
			states[m] = m;
			statesList.push(m);
		}
		// states["TELANGANA"]="TELANGANA";
	}
}

function createCrimeSubList() {
	for ( var m in iCrimes) {
		if (m == "TOTAL CRIMES AGAINST WOMEN") {

		} else {
			crimesList.push(m);
		}
		// states["TELANGANA"]="TELANGANA";
	}
}

function initDropDowns() {
	/*
	 * for (var hi in states) { var o = new Option(states[hi], states[hi]);
	 * $(o).html(states[hi]); $("#slist").append(o); }
	 */

	for ( var hi in iCrimes) {
		var o = new Option(iCrimes[hi], iCrimes[hi]);
		$(o).html(iCrimes[hi]);
		$("#crime").append(o);
	}

	years.sort(function(a, b) {
		return b - a;
	})

	for (var y = 0; y < years.length; y++) {
		var o = new Option(years[y], years[y]);
		$(o).html(years[y]);
		$("#years").append(o);
	}
}

function updateVisual() {
	var avg = (((crimesData["TOTAL (ALL-INDIA)"])[$("#crime").val()])[$(
			"#years").val()]) / 30;
	var crimeSortList = new Array();

	for (var index = 0; index < polygons.length; index++) {
		var stateCrimeRate = (((crimesData[polygons[index].state])[$("#crime")
				.val()])[$("#years").val()])
		var stateCrimePercentage = ((avg - stateCrimeRate) / avg) * 100;

		var temp = new Object();
		temp.stateCrimeRate = stateCrimeRate;
		temp.state = polygons[index].state;
		temp.index = index;
		crimeSortList.push(temp);

		if (stateCrimePercentage > 50) {
			polygons[index].polygon.setOptions({
				strokeWeight : 1.0,
				fillColor : "#69a92f"
			}); // Greenest
		}

		if ((stateCrimePercentage > 0) && (stateCrimePercentage < 50)) {
			polygons[index].polygon.setOptions({
				strokeWeight : 1.0,
				fillColor : "#81c04c"
			}); // Green
		}

		if ((stateCrimePercentage < 0) && (stateCrimePercentage > -50)) {
			polygons[index].polygon.setOptions({
				strokeWeight : 1.0,
				fillColor : "#de293c"
			}); // Red
		}
		if (stateCrimePercentage < -50) {
			polygons[index].polygon.setOptions({
				strokeWeight : 1.0,
				fillColor : "#bf1e2e"
			}); // Reder
		}

	}

	crimeSortList.sort(function(a, b) {
		return a.stateCrimeRate - b.stateCrimeRate;
	});

	polygons[crimeSortList[0].index].polygon.setOptions({
		strokeWeight : 2.0,
		fillColor : "#548f17"
	});

	polygons[crimeSortList[crimeSortList.length - 1].index].polygon
			.setOptions({
				strokeWeight : 2.0,
				fillColor : "#981421"
			});

	crimeAvgPerState = avg;
	crimeMinPerState = crimeSortList[0].stateCrimeRate;
	crimeMaxPerState = crimeSortList[crimeSortList.length - 1].stateCrimeRate;

	updateLineChart();
	updateSunBurst();
}

function updateSunBurst() {
	sunburstGraph.name = "Stats";

	var stateChildrens = new Array();

	for ( var j in statesList) {
		var state = new Object();
		state.name = statesList[j];

		var crimeChildrens = new Array();
		for ( var m in crimesList) {
			var crime = new Object();
			crime.name = crimesList[m].substring(0, 10);

			var yearChildrens = new Array();
			var year = new Object();
			year.name = $("#years").val();
			year.size = crimesData[statesList[j]][crimesList[m]][year.name];
			yearChildrens.push(year);

			crime.size = crimesData[statesList[j]][crimesList[m]][year.name];
			// crime.children=yearChildrens;
			crimeChildrens.push(crime);
		}

		state.children = crimeChildrens;
		stateChildrens.push(state);
	}

	sunburstGraph.children = stateChildrens;
	initburst(sunburstGraph);
}

function updateLineChart() {
	var xAxis = new Array();
	xAxis.push("x")
	xAxis.push('2002-01-01');
	xAxis.push('2003-01-01');
	xAxis.push('2004-01-01');
	xAxis.push('2005-01-01');
	xAxis.push('2006-01-01');
	xAxis.push('2007-01-01');
	xAxis.push('2008-01-01');
	xAxis.push('2009-01-01');
	xAxis.push('2010-01-01');
	xAxis.push('2011-01-01');
	xAxis.push('2012-01-01');
	xAxis.push('2013-01-01');

	lineGraph = new Array();

	for (var index = 0; index < polygons.length; index++) {
		stateContainer = new Array();
		stateContainer.push(polygons[index].state);

		for (var year = 2001; year < 2013; year++) {
			stateCrimeRate = (((crimesData[polygons[index].state])[$("#crime")
					.val()])[year])
			stateContainer.push(stateCrimeRate);
		}

		lineGraph.push(stateContainer);
	}

	lineGraph.unshift(xAxis);
	var chart = c3.generate({
		data : {
			x : 'x',
			// xFormat: '%YYYY', // 'xFormat' can be used as custom format of
			// 'x'
			columns : [ xAxis, lineGraph[1], lineGraph[2], lineGraph[3],
					lineGraph[4], lineGraph[5] ]
		},
		axis : {
			x : {
				type : 'timeseries',
				tick : {
					format : '%Y-%m-%d'
				}
			}
		}
	});

	setTimeout(function() {
		chart.load({
			columns : [ lineGraph[6], lineGraph[7], lineGraph[8], lineGraph[9],
					lineGraph[10] ]

		});
	}, 1000);
	setTimeout(function() {
		chart.load({
			columns : [ lineGraph[11], lineGraph[12], lineGraph[13],
					lineGraph[14] ]

		});
	}, 1500);
	setTimeout(function() {
		chart.load({
			columns : [ lineGraph[15], lineGraph[16], lineGraph[17],
					lineGraph[18], lineGraph[19], lineGraph[20] ]

		});
	}, 2000);
	setTimeout(function() {
		chart.load({
			columns : [ lineGraph[21], lineGraph[22], lineGraph[23],
					lineGraph[24], lineGraph[25], lineGraph[26] ]

		});
	}, 2500);

	setTimeout(function() {
		chart.load({
			columns : [ lineGraph[27], lineGraph[28], lineGraph[29] ]

		});
	}, 3000);

}