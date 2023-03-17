d3.json("samples.json").then(data => {
    console.log(data);

    // Get dropdown element and add options
    const dropdown = d3.select("#selDataset");
    dropdown.selectAll("option")
      .data(data.names)
      .enter()
      .append("option")
      .attr("value", d => d)
      .text(d => d);

    // Initialize chart with default ID
    updateChart(data.names[0]);
    displayDemographicInfo(data.names[0]);
      bubbleChart(data.names[0])

    // Update chart when dropdown selection changes
    dropdown.on("change", () => {
      const id = dropdown.property("value");
      updateChart(id);
      displayDemographicInfo(id);
      bubbleChart(id)
    });


    function displayDemographicInfo(sample) {
      // Select the panel-body div and clear its contents
      var panelBody = d3.select("#sample-metadata");
      panelBody.html("");

      // Find the metadata object for the selected sample
      var metadata = data.metadata.filter(s => s.id == sample)[0];

      // Loop through each key-value pair in the metadata object and append a p element to the panel-body div with the text of the pair
      Object.entries(metadata).forEach(([key, value]) => {
        panelBody.append("p").text(`${key}: ${value}`);
      });
    }

    function bubbleChart(id) {
        // Get sample data
        const sampleData = data.samples.find((sample) => sample.id === id);

        // Create trace for bubble chart
        const trace = {
          x: sampleData.otu_ids,
          y: sampleData.sample_values,
          text: sampleData.otu_labels,
          mode: "markers",
          marker: {
            size: sampleData.sample_values,
            color: sampleData.otu_ids,
          },
        };

        // Create data array and layout for bubble chart
        const dataBubble = [trace];
        const layoutBubble = {
          title: "OTU ID vs Sample Values",
          xaxis: { title: "OTU ID" },
          yaxis: { title: "Sample Values" },
          showlegend: false,
        };

        // Plot bubble chart
        Plotly.newPlot("bubble", dataBubble, layoutBubble);
      }


    function updateChart(id) {
      
      // Find sample with matching ID
      const sample = data.samples.find(sample => sample.id === id);

      // Sort samples by descending order of sample values
      const sortedSamples = sample.otu_ids.map((otu_id, i) => ({
        otu_id: otu_id,
        sample_value: sample.sample_values[i],
        otu_label: sample.otu_labels[i]
      }))
      .sort((a, b) => b.sample_value - a.sample_value)
      .slice(0, 10)
      .reverse();

      console.log(sortedSamples);

      // Set up chart dimensions and scales
      const margin = { top: 50, right: 20, bottom: 50, left: 200 };
      const width = 800 - margin.left - margin.right;
      const height = 500 - margin.top - margin.bottom;

      const x = d3.scaleLinear()
        .domain([0, d3.max(sortedSamples, d => d.sample_value)])
        .range([0, width]);

      const y = d3.scaleBand()
        .domain(sortedSamples.map(d => d.otu_id))
        .range([height, 0]) // Reverse the y-axis range to move x-axis to bottom
        .paddingInner(0.1);

      // Create and update chart elements
      const svg = d3.select("#bar-chart");

      svg.selectAll("*").remove(); // Clear previous chart

      svg.attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      // Add x-axis
      const xAxis = d3.axisBottom(x).ticks(5);
      g.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

      // Add y-axis
      const yAxis = d3.axisLeft(y).tickSize(0);
      g.append("g")
        .attr("class", "y axis")
        .call(yAxis);

      // Add bars
      const bars = g.selectAll(".bar")
      .data(sortedSamples)
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("x", 0)
          .attr("y", d => y(d.otu_id))
          .attr("width", d => x(d.sample_value))
          .attr("height", y.bandwidth())
          .attr("fill", "steelblue")
          
          .on("mouseover", function( event , d) {
            console.log('hello', d)
              // Show tooltip on hover
              tooltip.style("opacity", 1)
                  .html(`OTU Label: ${d.otu_label}`)
                  .style("left", `${event.pageX}px`)
                  .style("top", `${event.pageY}px`);
          })
          .on("mousemove", function(d, event) {
              // Move tooltip along with mouse
              tooltip.style("left", `${event.pageX}px`)
                  .style("top", `${event.pageY}px`);
          })
          .on("mouseout", function(d, event) {
              // Hide tooltip when not hovering
              tooltip.style("opacity", 0);
          });


      const labels = g.selectAll("text")
        .data(sortedSamples)
          .enter()
          .append("text")
          .attr("x", 3)
          .attr("y", d => y(d.otu_id) + y.bandwidth() / 2)
          .attr("dy", ".35em")
          .text(d => d.otu_id)
          .attr("font-family", "sans-serif")
          .attr("font-size", "12px")
          .attr("fill", "white");

      // Create tooltip element
      const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    }
  
  
  });