var bubbleChart = d3.select('#bubbleChart');


var chart1 = d3.select('#chart1');
var chart2 = d3.select('#chart2');

var bounds = chart1.node().getBoundingClientRect();
var svgWidth = bounds.width;
var svgHeight = bounds.height;

var filtered;

var xAttr1 = "Admission Rate";
var yAttr1 = "ACT Median";

var xAttr2 = "SAT Average";
var yAttr2 = "Average Cost";


var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

var padding = { t: 40, r: 80, b: 50, l: 80 };

var chartWidth = svgWidth - padding.r - padding.l;
var chartHeight = svgHeight - padding.t - padding.b;

var xScale1 = d3.scaleLinear().range([0, chartWidth]);
var yScale1 = d3.scaleLinear().range([chartHeight, 0]);

var xScale2 = d3.scaleLinear().range([0, chartWidth]);
var yScale2 = d3.scaleLinear().range([chartHeight, 0]);


var xAxis1 = d3.axisBottom(xScale1).ticks(6);
var yAxis1 = d3.axisLeft(yScale1).ticks(6);

var xAxis2 = d3.axisBottom(xScale2).ticks(6);
var yAxis2 = d3.axisLeft(yScale2).ticks(6);


var dataAttributes = ["Admission Rate", "ACT Median", "SAT Average","Undergrad Population",
     "% White", "% Black", "% Hispanic", "% Asian", "% American Indian", "% Pacific Islander",
      "% Biracial", "Avwerage Cost", "Expenditure Per Student", "Completion Rate 150% time",
       "Retention Rate", "Median Debt on Graduation", "Median Earnings 8 years After Entry" ];



const regionCenters = {
    "Southeast": { x: 150, y: 200 },
    "Mid-Atlantic": { x: 330, y: 110 },
    "Great Lakes": { x: 365, y: 325 },
    "Southwest": { x: 282, y: 230 },
    "Far West": { x: 200, y: 70 },
    "Great Plains": { x: 455, y: 160 },
    "New England": { x: 235, y: 335 },
    "Rocky Mountains": { x: 135, y: 325 },
    "Outlying Areas": { x: 375, y: 217 }
  };



document.getElementById("pageTwo").style.display = "none";

d3.csv("colleges.csv").then(function (data) {
    var colleges = data;
    filtered = data;
    
    const regionCounts = d3.rollup(data, v => v.length, d => d.Region);
    const regionData = Array.from(regionCounts, ([region, count]) => ({
    region: region,
    count: count
    }));

    // dropdown menu init
    xAttr1 = "Admission Rate";
    yAttr1 = "ACT Median";

    xAttr2 = "SAT Average";
    yAttr2 = "Average Cost";

    d3.select('#XAxis1Menu').property('value', xAttr1);
    d3.select('#YAxis1Menu').property('value', yAttr1);
    d3.select('#XAxis2Menu').property('value', xAttr2);
    d3.select('#YAxis2Menu').property('value', yAttr2);

    // Dropdown event listeners
    d3.select('#XAxis1Menu').on('change', function () {
        xAttr1 = this.value;
        updateChart1(xAttr1, yAttr1, filtered);
    });

    d3.select('#YAxis1Menu').on('change', function () {
        yAttr1 = this.value;
        updateChart1(xAttr1, yAttr1, filtered);
    });

    d3.select('#XAxis2Menu').on('change', function () {
        xAttr2 = this.value;
        updateChart2(xAttr2, yAttr2, filtered);
    });

    d3.select('#YAxis2Menu').on('change', function () {
        yAttr2 = this.value;
        updateChart2(xAttr2, yAttr2, filtered);
    });

    // Add a radius for each region
    const radiusScale = d3.scaleSqrt()
    .domain([0, d3.max(regionData, d => d.count)])
    .range([20, 80]);

    regionData.forEach(d => {
    d.r = radiusScale(d.count);
    const center = regionCenters[d.region];
    d.fx = center?.x; 
    d.fy = center?.y;
    });

    // Create node groups
    const node = bubbleChart.selectAll("g")
    .data(regionData)
    .enter()
    .append("g");

    node.append("circle")
    .attr("r", d => d.r)
    .attr("fill", (d, i) => d3.schemeCategory10[i % 10]);

    node.append("text")
    .text(d => d.region)
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .attr("fill", "white")
    .style("pointer-events", "none")
    .style("font-size", 11);

    // Force simulation
    d3.forceSimulation(regionData)
    .force("x", d3.forceX().strength(0.1).x(d => regionCenters[d.region]?.x || width / 2))
    .force("y", d3.forceY().strength(0.1).y(d => regionCenters[d.region]?.y || height / 2))
    .force("collide", d3.forceCollide(d => d.r + 2))
    .on("tick", () => {
        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    //tooltip
    const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("opacity", 0);
    
    node.select("circle")
    .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`${d.region}: ${d.count} schools`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0);
    })
    .on("click", (event, d) => {
        document.getElementById("pageOne").style.display = "none";
        document.getElementById("pageTwo").style.display = "block";
        
        console.log(d);
        var selectedRegion = d.region;

        filtered = colleges.filter(college => college.Region === selectedRegion);
        document.getElementById("regionTitle").textContent = `Region: ${selectedRegion} `;

        console.log("Clicked region:", selectedRegion);
        //console.log("Filtered colleges:", filtered);

        updateChart1(xAttr1, yAttr1, filtered);
        updateChart2(xAttr2, yAttr2, filtered);
    });

    //page 2 stuff

    //init
    updateChart1(xAttr1, yAttr1, filtered);
    updateChart2(xAttr2, yAttr2, filtered);

    //chart 1 attr
    var xAttr1 = "Admission Rate";
    var yAttr1 = "ACT Median";

    //chart 2 attr
    var xAttr2 = "SAT Average";
    var yAttr2 = "Average Cost";
    

    function updateChart1(xAttr1, yAttr1, filtered) {
        filtered.forEach(d => {
            d[xAttr1] = +d[xAttr1];
            d[yAttr1] = +d[yAttr1];
          });
        
        
        xScale1.domain(d3.extent(filtered, d => +d[xAttr1])).nice();
        yScale1.domain(d3.extent(filtered, d => +d[yAttr1])).nice();

        chart1.selectAll('*').remove();
        
        //axes
        chart1.append('g').attr('transform', `translate(50,${chartHeight + 50})`).call(xAxis1);
        chart1.append('g').attr('transform', `translate(50,50)`).call(yAxis1);

        const brush1 = d3.brush()
        .extent([[50, 50], [chartWidth + 50, chartHeight + 50]])
        .on("start", brushstart1)
        .on("brush", function(event) {
            if (!event.selection) return;
            const [[x0, y0], [x1, y1]] = event.selection;

            chart1.selectAll('.dot')
                .classed('highlighted', function(d) {
                    const cx = xScale1(+d[xAttr1]) + 50;
                    const cy = yScale1(+d[yAttr1]) + 50;
                    return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
                });

            const selectedColleges = new Set(
                chart1.selectAll('.dot.highlighted').data().map(d => d.Name)
            );

            chart2.selectAll('.dot')
                .classed('highlighted', d => selectedColleges.has(d.Name));
        })
        .on("end", brushend1);

        chart1.append('g')
            .attr('class', 'brush')
            .call(brush1)
            .call(brush1.move, null);
        



        // create dots
        chart1.selectAll('.dot')
            .data(filtered)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => xScale1(+d[xAttr1]) + 50)
            .attr('cy', d => yScale1(+d[yAttr1]) + 50)
            .attr('r', 4)
            .style('fill', d => d.Control === "Public" ? "green" : "red")
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`${d.Name}<br>Control: ${d.Control}<br>Locale: ${d.Locale}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition().duration(200).style("opacity", 0);
            })
            .on('click', function(event, d) {
                const name = d.Name;
                chart1.selectAll('.dot').classed('highlighted', dot => dot.Name === name);
                chart2.selectAll('.dot').classed('highlighted', dot => dot.Name === name);
            });
        

        // axis labels
        chart1.append('text')
            .attr('class', 'axis-label')
            .attr('x', chartWidth / 2 + 50)
            .attr('y', chartHeight + 80)
            .style('text-anchor', 'middle')
            .text(xAttr1);

        chart1.append('text')
            .attr('class', 'axis-label')
            .attr('transform', `rotate(-90)`)
            .attr('x', -chartHeight/ 2) 
            .attr('y', 10)
            .style('text-anchor', 'middle')
            .text(yAttr1);

        
    }

    function updateChart2(xAttr2, yAttr2, filtered) {
        filtered.forEach(d => {
            d[xAttr2] = +d[xAttr2];
            d[yAttr2] = +d[yAttr2];
          });
        

        xScale2.domain(d3.extent(filtered, d => +d[xAttr2])).nice();
        yScale2.domain(d3.extent(filtered, d => +d[yAttr2])).nice();

        chart2.selectAll('*').remove();
        
        //axes
        chart2.append('g').attr('transform', `translate(50,${chartHeight + 50})`).call(xAxis2);
        chart2.append('g').attr('transform', `translate(50,50)`).call(yAxis2);

        const brush2 = d3.brush()
        .extent([[50, 50], [chartWidth + 50, chartHeight + 50]])
        .on("start", brushstart2)
        .on("brush", function(event) {
            if (!event.selection) return;
            const [[x0, y0], [x1, y1]] = event.selection;

            chart2.selectAll('.dot')
                .classed('highlighted', function(d) {
                    const cx = xScale2(+d[xAttr2]) + 50;
                    const cy = yScale2(+d[yAttr2]) + 50;
                    return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
                });

            const selectedColleges = new Set(
                chart2.selectAll('.dot.highlighted').data().map(d => d.Name)
            );

            chart1.selectAll('.dot')
                .classed('highlighted', d => selectedColleges.has(d.Name));
        })
        .on("end", brushend2);
        
        chart2.append('g')
            .attr('class', 'brush')
            .call(brush2)
            .call(brush2.move, null);
    
    
        // create dots
        chart2.selectAll('.dot')
            .data(filtered)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => xScale2(+d[xAttr2]) + 50)
            .attr('cy', d => yScale2(+d[yAttr2]) + 50 )
            .attr('r', 4)
            .style('fill', d => d.Control === "Public" ? "green" : "red")
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`
                    <div style="text-align: left;">
                        <div style="font-size: 13px; font-weight: bold; margin-bottom: 5px;">
                            ${d.Name}
                        </div>
                        <div>Control: ${d.Control}</div>
                        <div>Locale: ${d.Locale}</div>
                    </div>
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            
            .on("mouseout", () => {
                tooltip.transition().duration(200).style("opacity", 0);
            })
            .on('click', function(event, d) {
                // Highlight clicked dot in both charts
                const name = d.Name;
                chart1.selectAll('.dot').classed('highlighted', dot => dot.Name === name);
                chart2.selectAll('.dot').classed('highlighted', dot => dot.Name === name);
        
            });

        // axis labels
        chart2.append('text')
            .attr('class', 'axis-label')
            .attr('x', chartWidth / 2 + 50)
            .attr('y', chartHeight + 80)
            .style('text-anchor', 'middle')
            .text(xAttr2);

        chart2.append('text')
            .attr('class', 'axis-label')
            .attr('transform', `rotate(-90)`)
            .attr('x', -chartHeight/ 2) 
            .attr('y', 10)
            .style('text-anchor', 'middle')
            .text(yAttr2);
        


    }



  });

//button stuff
function goBack() {
    document.getElementById("pageOne").style.display = "block";
    document.getElementById("pageTwo").style.display = "none";
};

var brush1 = d3.brush()
  .extent([[50, 50], [chartWidth + 50, chartHeight + 50]])
  .on("start", brushstart1)
  .on("brush", brushmove1)
  .on("end", brushend1);

var brush2 = d3.brush()
  .extent([[50, 50], [chartWidth + 50, chartHeight + 50]])
  .on("start", brushstart2)
  .on("brush", brushmove2)
  .on("end", brushend2);


let brushCell = null;



function brushstart1(event) {
    if (brushCell !== this) {
        chart1.selectAll('.brush').call(brush1.move, null);
        chart2.selectAll('.brush').call(brush2.move, null); 
        brushCell = this;
    }
    chart1.selectAll('.dot').classed('highlighted', false);
    chart2.selectAll('.dot').classed('highlighted', false);
}

function brushmove1(event) {

    if (!event.selection) return;

    filtered.forEach(d => {
        d[xAttr1] = +d[xAttr1];
        d[yAttr1] = +d[yAttr1];
    });

    filtered.forEach(d => {
        d[xAttr2] = +d[xAttr2];
        d[yAttr2] = +d[yAttr2];
    });

    const [[x0, y0], [x1, y1]] = event.selection;

    chart1.selectAll('.dot')
        .classed('highlighted', function(d) {
            const cx = xScale1(+d[xAttr1]) + 50;
            const cy = yScale1(+d[yAttr1]) + 50;
            return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
        });


    // Find selected dots
    const selectedColleges = new Set(
        chart1.selectAll('.dot.highlighted').data().map(d => d.Name)
    );

    chart2.selectAll('.dot')
        .classed('highlighted', d => selectedColleges.has(d.Name));
}


function brushend1(event) {
    if (!event.selection) {
        chart1.selectAll('.dot')
            .classed('highlighted', false);

        chart2.selectAll('.dot')
            .classed('highlighted', false);
    }
}


function brushstart2(event) {
    if (brushCell !== this) {
        chart1.selectAll('.brush').call(brush1.move, null);
        chart2.selectAll('.brush').call(brush2.move, null); 
        brushCell = this;
    }
    chart1.selectAll('.dot').classed('highlighted', false);
    chart2.selectAll('.dot').classed('highlighted', false);
}

function brushmove2(event) {

    if (!event.selection) return;

    filtered.forEach(d => {
        d[xAttr1] = +d[xAttr1];
        d[yAttr1] = +d[yAttr1];
    });

    filtered.forEach(d => {
        d[xAttr2] = +d[xAttr2];
        d[yAttr2] = +d[yAttr2];
    });

    const [[x0, y0], [x1, y1]] = event.selection;

    chart2.selectAll('.dot')
        .classed('highlighted', function(d) {
            const cx = xScale2(+d[xAttr2]) + 50;
            const cy = yScale2(+d[yAttr2]) + 50;
            return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
        });


    // Find selected dots
    const selectedColleges = new Set(
        chart2.selectAll('.dot.highlighted').data().map(d => d.Name)
    );

    chart1.selectAll('.dot')
        .classed('highlighted', d => selectedColleges.has(d.Name));
}


function brushend2(event) {
    if (!event.selection) {
        chart2.selectAll('.dot')
            .classed('highlighted', false);

        chart1.selectAll('.dot')
            .classed('highlighted', false);
    }
}
        
            




