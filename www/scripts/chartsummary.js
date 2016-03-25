// PREP THE GRAPHS
$('#pageStats').on('pageshow', function (){
    var categories = [];
    var data = [];
    
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
    var chart = $('#container').highcharts({
        chart: {
            type: 'column',
        },
        legend: {
            enabled: false
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
}