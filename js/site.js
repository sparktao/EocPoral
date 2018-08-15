// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

var rescueRes = [
				{value:32, name:'交警'},
				{value:66, name:'公安'},
				{value:22, name:'消防'},
				{value:24, name:'安监'},
				{value:24, name:'街道'}
			];

function buildChart()
{
	// 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('main'));

        // 指定图表的配置项和数据
        var option = {
			legend: {
				x : 'center',
				//y : 'bottom',
				bottom:5,
                itemGap:30,
                itemWidth:10,
				formatter:  function(name){
					var total = 0;
					var target;
					for (var i = 0, l = rescueRes.length; i < l; i++) {
						if (rescueRes[i].name == name) {
							target = rescueRes[i].value;
						}
					}
					var arr = [
                        '{a|'+name+'}',
                        '{b|'+target+'}',
                    ]
                    return arr.join('\n')
				},
				textStyle: {
					rich:{
                        a:{
                            fontSize:20,
							color:'#fff',
                            verticalAlign:'top',
                            align:'center',
                            padding:[0,0,28,0]
                        },
                        b:{
                            fontSize:14,
							color:'#fff',
                            align:'center',
                            padding:[0,10,0,0],
                            lineHeight:25
                        }
                    }
				},
				data:[{name:'交警', icon:'circle'},
						{name:'公安', icon:'circle'},
						{name:'消防', icon:'circle'},
						{name:'安监', icon:'circle'},
						{name:'街道', icon:'circle'}]
			},
			tooltip : {
				trigger: 'item',
				formatter: "{a} <br/>{b} : {c} ({d}%)"
			},	
			calculable : true,			
            series : [
				{
					name: '访问来源',
					type: 'pie',
					radius : [30, 80],
					center : '50%',
					roseType:'area',
					label: {
                        normal: {
                            show: false
                        },
                        emphasis: {
                            show: false
                        }
                    },
					data:rescueRes
				}
			]
        };

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);	
}



$(function() {// 初始化内容
    
	buildChart();
});  