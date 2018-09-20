const fs = require('fs')

// Require JSDOM Class.
const JSDOM = require('jsdom').JSDOM
// Create instance of JSDOM.
const jsdom = new JSDOM('<body><div id="container"></div></body>', {runScripts: 'dangerously'})
// Get window
const window = jsdom.window

// require anychart and anychart export modules
const anychart = require('anychart')(window)
const anychartExport = require('anychart-nodejs')(anychart)

const create_column_chart = (configs) => {

    const {
      title, 
      filename, 
      data, 
      x_axis_label, 
      x_axis_start, 
      x_axis_end,
      color_series
    } = configs

    let series = Object.keys(data)

    series.sort()

    //  Get x_axis values => ["01", "02", "03", ....]
    let x_axis = []
    for (let index = x_axis_start; index <= x_axis_end; index++) {
      x_axis.push(index.toString().padStart(2, '0'))
    }
    
    
    //  Generate data sets

    let data_set = x_axis.map( x => {
      let aux_arr = [x]

      // Push values into the array that would be part of the data set
      series.forEach( serie => {

        //  Check there is a valid value for specific hour in that serie
        if(!!data[ serie ][ x ]){
          aux_arr.push(data[serie][x])  
        }else{
          aux_arr.push(0)
        }
      })

      return aux_arr
    })

    var char_data_set = anychart.data.set(data_set);

    // create a chart
    var chart = anychart.column();

    chart.yScale().stackMode("value");
    chart.legend().enabled(true);
    chart.legend().itemsLayout("horizontal-expandable");
    chart.bounds(0, 0, 800, 600);
    chart.title(title)
    chart.container('container');

    var xAxis = chart.xAxis();
    xAxis.title(x_axis_label);
    var yAxis = chart.yAxis();
    yAxis.title("Usuarios");

    // create chart series base on series array
    let chart_series = series.map( (item, index) => {

      let chart_serie = char_data_set.mapAs({x: 0, value: index + 1})
      let serie = chart.column(chart_serie)
      let color = !!color_series[series[index]] ? color_series[series[index]] : color_series.default

      serie.labels(true);
      serie.labels().position("center");
      serie.labels().anchor("center");
      serie.labels().fontColor('white');
      serie.name(series[index])
      serie.normal().fill(color)
      serie.normal().stroke(anychart.color.darken(color))

      return serie;
    })

    chart.draw();
    
    return generateJPG(filename, chart)

}

const create_pie_chart = (filename, title, data) => {
  const data_set = Object.keys(data).map( role => {
    return {
      x: role,
      value: data[role]
    }
  })

  // create a chart and set the data
  chart = anychart.pie(data_set)
  chart.title(title)
  chart.bounds(0, 0, 800, 600)
  chart.container("container")

  // initiate drawing the chart
  chart.draw()

  return generateJPG(filename, chart)
  
}

const create_bar_chart = (configs) => {
  const {filename, title, series, data, x_axis_label, color_series} = configs

  // create a chart and set the data
  var char_data_set = anychart.data.set(data);

  // create a chart
  var chart = anychart.column()

  chart.yScale().stackMode("value")
  chart.legend().enabled(true)
  chart.legend().itemsLayout("horizontal-expandable")
  chart.bounds(0, 0, 800, 600)
  chart.title(title)
  chart.container('container')

  var xAxis = chart.xAxis()
  xAxis.title(x_axis_label)
  var yAxis = chart.yAxis()
  yAxis.title("Usuarios");

  // create chart series base on series array
  let chart_series = series.map( (item, index) => {

    let chart_serie = char_data_set.mapAs({x: 0, value: index + 1})
    let serie = chart.column(chart_serie)
    let color = !!color_series[series[index]] ? color_series[series[index]] : color_series.default
    serie.labels(true);
    serie.labels().position("center");
    serie.labels().anchor("center");
    serie.labels().fontColor('white');
    serie.name(series[index])
    serie.normal().fill(color)
    serie.normal().stroke(anychart.color.darken(color, 0.2))

    return serie;
  })

  // initiate drawing the chart
  chart.draw();

  return generateJPG(filename, chart)
}


const generateJPG = (filename, chart) => {
  // generate JPG image and save it to a file
  return new Promise((resolve, reject) => {    
    anychartExport.exportTo(chart, 'jpeg').then(function(image) {
      fs.writeFile(`${filename}.jpeg`, image, function(fsWriteError) {
        if (fsWriteError) {
          reject(fsWriteError);
        } else {
          resolve('Complete');
        }
      });
      
      resolve();
    }, function(generationError) {
      reject(generationError);
    });
  })
  
}

module.exports = {
  create_column_chart,
  create_pie_chart,
  create_bar_chart
}

