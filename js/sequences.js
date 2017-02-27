
// =================
// define layout etc
// =================

//get screen size
var w = window,
	d = document,
	e = d.documentElement,
	g = d.getElementsByTagName('body')[0],
	x = w.innerWidth || e.clientWidth || g.clientWidth,
	y = w.innerHeight|| e.clientHeight|| g.clientHeight

// Dimensions of sunburst.
var width = x;
var height = y;

// ====================
// main method
// ====================
d3.json("json/visit-sequences.json", function(datain){

	// default radius size
	var update = 0;
	// default kpi choice set to "Total"
	jsonout = filterData("Total", datain);
	// create visualization
	createVisualization(jsonout, 1.7, update);

	// return data based on user input
	d3.selectAll("#RecordType").on("change", function change() {
		// update flag
		var update = 1;
		// get attribute type
		RecordType = this.value;
		// set radius based on kpi
		var scale_sunburst = setRadius(RecordType);
		// get new data
		jsonout = filterData(RecordType, datain);
		// start from new diagram
		// create graph on selected data
		createVisualization(jsonout, scale_sunburst, update);
	});
});


// Change the explanation position
var explination_width = parseFloat(d3.select( '#explanation').style('width').replace('px','') ) 
,explination_height = parseFloat(d3.select( '#explanation').style('height').replace('px','') )  ; 

d3.select('#explanation').style( 'top' , (y/2 - explination_height/2 ) + 'px' ).style( 'left' , (x/2 - explination_width/2 ) + 'px' ) ;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
  w: 300, h: 20, s: 3, t: 10
};
// Mapping of step names to colors.

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0; 

var vis = d3.select("#chart")
	.append("svg:svg")
	.attr("width", width)
	.attr("height", height)
	.append("svg:g")
	.attr("id", "container")
	.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var arc = d3.svg.arc()
	.startAngle(function(d) { return d.x; })
	.endAngle(function(d) { return d.x + d.dx; })
	.innerRadius(function(d) { return Math.sqrt(d.y); })
	.outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

var radius;

// ====================
// define functions
// ====================

function setRadius(userInput) {
	// ==================================================
	// Added Douglas Fletcher: change radius based on kpi
	//== purpose: change scale_sunburst make dynamic
	//== based on what looks better
	//== input: success type user input
	// ===================================================
	if (userInput == "Total"){
		return 1.7;
	}
	else if (userInput == "KPI One: Count"){
		return 1.7;
	}
	else if (userInput == "KPI Two: Count"){
		return 2.6;
	}
	else if (userInput == "KPI Three: Count"){
		return 3.5;
	}
	else if (userInput == "KPI Four: Count"){
		return 2.4;
	}
	else{
		return 1.7;
	}
}


function filterData(RecordType, jsonin) {
	// =======================================================
	// Added Douglas Fletcher: filter data based on user input
	//== purpose: get relavant data
	//== input: 1) form inputs, 
	//== 		2) original json in format processed from python 
	//== 			 file
	//== output: json data for d3 sunburst
	// =======================================================

	// row data
	filtereddata = []
	var successfilter = jsonin.children.filter(function (row) {
		// take all
		if (RecordType == "Total"){
			filtereddata.push(row)
		}
		// need to filter
		else {
			// individual success types filter by input
			if (row.name == RecordType){
				filtereddata.push(row);
			}
		}
	});
	// filter 
	dataout = {"name":"root", "children": filtereddata}
	return dataout;
};

// ===============================================
// all functions below from:
// 		d3.org http://bl.ocks.org/mbostock/4063423
// ===============================================

// Main function to draw and set up the visualization, once we have the data.
function createVisualization(json, scale_sunburst, update) {

	// douglas add: if updating need to start from clean slate
	if (update == 1){
		d3.select("#container").selectAll("*").remove();
		d3.select("#endlabel").selectAll("*").remove();
		d3.select("#sequence").selectAll("*").remove();
	}

	// make radius dynamic : douglas
	radius = Math.min(width, height) / scale_sunburst;

	var partition = d3.layout.partition()
		.size([2 * Math.PI, radius * radius])
		.value(function(d) { return d.size; });

	// Basic setup of page elements.
	initializeBreadcrumbTrail();

	// == Douglas: update data in legend var colors comes from sequences_colors.js
	drawLegend(colors);
	d3.select("#togglelegend").on("click", toggleLegend);

	// Bounding circle underneath the sunburst, to make it easier to detect
	// when the mouse leaves the parent g.
	vis.append("svg:circle")
		.attr("r", radius)
		.style("opacity", 0);

	// For efficiency, filter nodes to keep only those large enough to see.
	var nodes = partition.nodes(json)
		.filter(function(d) {
		return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
		});

	var path = vis.data([json]).selectAll("path")
		.data(nodes)
		.enter().append("svg:path")
		.attr("display", function(d) { return d.depth ? null : "none"; })
		.attr("d", arc)
		.attr("fill-rule", "evenodd")
		.style("fill", function(d) { return colors[d.name]; })
		.style("opacity", 1)
		.on("mouseover", mouseover);

	// Add the mouseleave handler to the bounding circle.
	d3.select("#container").on("mouseleave", mouseleave);

	// Get total size of the tree = value of root node from partition.
	totalSize = path.node().__data__.value;
};

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {

	var percentage = (100 * d.value / totalSize).toPrecision(3);
	var percentageString = percentage + "%";
	if (percentage < 0.1) {
		percentageString = "< 0.1%";
	}

	d3.select("#percentage")
		.text(percentageString);

	d3.select("#explanation")
		.style("visibility", "");

	var sequenceArray = getAncestors(d);
	updateBreadcrumbs(sequenceArray, percentageString);

	// Fade all the segments.
	d3.selectAll("path")
		.style("opacity", 0.3);

	// Then highlight only those that are an ancestor of the current segment.
	vis.selectAll("path")
		.filter(function(node) {
				return (sequenceArray.indexOf(node) >= 0);
			})
		.style("opacity", 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {

	// Hide the breadcrumb trail
	d3.select("#trail")
		.style("visibility", "hidden");

	// Deactivate all segments during transition.
	d3.selectAll("path").on("mouseover", null);

	// Transition each segment to full opacity and then reactivate it.
	d3.selectAll("path")
		.transition()
		.duration(1000)
		.style("opacity", 1)
		.each("end", function() {
			d3.select(this).on("mouseover", mouseover);
		});

	d3.select("#explanation")
		.style("visibility", "hidden");
}

// Given a node in a partition layout, return an array of all of its ancestor
// nodes, highest first, but excluding the root.
function getAncestors(node) {
	var path = [];
	var current = node;
	while (current.parent) {
		path.unshift(current);
		current = current.parent;
	}
	return path;
}

function initializeBreadcrumbTrail() {
	
	// Add the svg area.
	var trail = d3.select("#sequence").append("svg:svg")
		.attr("width", width)
		.attr("height", height)
		.attr("id", "trail");
	// Add the label at the end, for the percentage.
	trail.append("svg:text")
		.attr("id", "endlabel")
		.style("fill", "#000");
}

// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumbPoints(d, i) {
	var points = [];
	points.push("0,0");
	points.push(b.w + ",0");
	points.push(b.w + b.t + "," + (b.h / 2));
	points.push(b.w + "," + b.h);
	points.push("0," + b.h);

	return points.join(" ");
}

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, percentageString) {

	// Data join; key function combines name and depth (= position in sequence).
	var g = d3.select("#trail")
		.selectAll("g").style( 'height', '100%')
		.data(nodeArray, function(d) { return d.name + d.depth; });

	// Add breadcrumb and label for entering nodes.
	var entering = g.enter().append("svg:g");

	entering.append("svg:polygon")
		.attr("points", breadcrumbPoints)
		.style("fill", function(d) { return colors[d.name]; });

	entering.append("svg:text")
		.attr("x", (b.w + b.t) / 2)
		.attr("y", b.h / 2)
		.attr("dy", "0.35em")
		.attr("text-anchor", "middle")
		.text(function(d) { return d.name; });

	// Set position for entering and updating nodes.
	g.attr("transform", function(d, i) {
	  return "translate(0," + i * (b.h + b.s) + ")";
	});

	// Remove exiting nodes.
	g.exit().remove();

	// Now move and update the percentage at the end.


	// Make the breadcrumb trail visible, if it's hidden.
	d3.select("#trail")
		.style("visibility", "");

}

function drawLegend(colors) {

	// Dimensions of legend item: width, height, spacing, radius of rounded rect.
	var li = {
		w: 250, h: 20, s: 3, r: 3
	};

	var legend = d3.select("#legend").append("svg:svg")
		.attr("width", li.w)
		.attr("height", d3.keys(colors).length * (li.h + li.s));

	var g = vis.selectAll("g")
		.data(d3.entries(colors))
		.enter().append("svg:g")
		.attr("transform", function(d, i) {
			return "translate(0," + i * (li.h + li.s) + ")";
		});

	g.append("svg:rect")
		.attr("rx", li.r).attr("x", width/2 - li.w*1- width*0.04  )
		.attr("ry", li.r).attr("y",  -height/2 - li.h  + height*0.1 )
		.attr("width", li.w)
		.attr("height", li.h)
		.style("fill", function(d) { return d.value; });

	g.append("svg:text")
		.attr("x",  width/2 - li.w*0.5 - width*0.04)
		.attr("y",  -height/2  - li.h/2  + height*0.1  )
		.attr("dy", "0.35em")
		.attr("text-anchor", "middle")
		.attr("fill", "#fff")
		.attr("font-size", "13px")
		.attr("font-weight", "600")
		.attr("font-weight", "600")
		.text(function(d) { return d.key; });
}

function toggleLegend() {
	var legend = d3.select("#legend");
	if (legend.style("visibility") == "hidden") {
		legend.style("visibility", "");
	} else {
		legend.style("visibility", "hidden");
	}
}

