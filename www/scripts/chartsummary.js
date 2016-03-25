// PREP THE GRAPHS
var chart;
$(function () {
    var categories = [];
    var data = [];
    
    // THIS TO ADDED TO HANDLE SIZE BASED ON 
    // THIS FIDDLE: http://jsfiddle.net/Behseini/qheh4w0n/
    //
    //var newh = $("#chart-wrapper").height();
    
    //$('#pageStats').on('pageshow', function (){
          ///console.log("RESIZE"); 
          //newh = $("#chart-wrapper").height();
          //chart.redraw();
          //chart.reflow();
    //});
    
   // Get the data from RHMAP 
   $fh.cloud(
        {
            path: 'rollupscores',
            data: {
            region: 'all'
            }
        },
        function (res) {
            console.log(JSON.stringify(res));
            categories = Object.getOwnPropertyNames(res);
            for (count=0; count<categories.length; count++){
                var foo = res[categories[count]].avg;
                data.push ( foo );
                plotGraph(categories, data);
            }    
            return;
        },
        function (code, errorprops, params) {
            alert('An error occured: ' + code + ' : ' + errorprops);
        }
    );        
})

function plotGraph(categories, data) {
    chart = $('#container').highcharts({
        chart: {
            type: 'column',
            reflow: true
        },
        legend: {
            enabled: false
            //align: 'right',
            //verticalAlign: 'middle'
        },        
        title: {
            text: 'Results'
        },
        subtitle: {
            text: 'by region'
        },
        xAxis: {
            categories: categories,
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Average Score %'
            }
        },
        // tooltip: {
        //     headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        //     pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' + '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
        //     footerFormat: '</table>',
        //     shared: true,
        //     useHTML: true
        // },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0"></td>' + '<td style="padding:0"><b>{point.y:.1f}%</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: [{
            name: 'Sector',
            data: data
        }]
    });
    chart.redraw();
    //chart.reflow();

    //chart.options.legend.enabled = false;
    
}