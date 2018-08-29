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

function buildAccidentTrendChart()
{
	var myChartAccidentTrend = echarts.init(document.getElementById('accidentTrend'));
	
	var option = {
                backgroundColor:'',//背景颜色透明
                tooltip: {
                    trigger: 'axis',//鼠标经过提示
                },
                grid: {
                    left: 0,
                    top :'5%',
                    left: 0,
                    bottom: '5%',
                    containLabel:true
                },
                xAxis: {
                    type: 'category',
                    data: ['09:30:00','09:35:00','09:40:00','09:45:00','09:50:00','09:55:00','10:00:00'],
                    show: true
                },
                yAxis: {
                    type: 'value',
                    splitLine:{show: true},
                    show: true
                },
                color: ['#1DB0B8', '#37C6C0', '#D0E9FF', '#c7353a', '#f5b91e'],
                series: [
                    {
                        name:'',
                        type:'line',
                        itemStyle: {  
                            normal: {  
                                color: 'red',  
                                lineStyle: {        // 系列级个性化折线样式  
                                    width: 8,  
                                    type: 'solid',  
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{  
                                        offset: 0,  
                                        color: 'red'  
                                    }, {  
                                        offset: 1,  
                                        color: 'green'  
                                    }]),//线条渐变色  
                                }  
                            }/*,  
                            emphasis: {  
                                color: 'red',  
                                lineStyle: {        // 系列级个性化折线样式  
                                    width: 8,  
                                    type: 'dotted',  
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{  
                                        offset: 0,  
                                        color: 'red'  
                                    }, {  
                                        offset: 1,  
                                        color: 'green'  
                                    }])  
                                }  
                            }*/  
                        },//线条样式  
                        data:[25, 10, 30, 65, 40, 60, 50]
                    }                                     
                ]
            };

		
		myChartAccidentTrend.setOption(option);		
	
}

/***************************************Stepper ******************************/
var eventDetailList = [];

function InitSteppers()
{
	$.getJSON( "json/data3.json", function( data ) {
    var tcount = data.length;
	$.each( data, function( i, item ) {	
			if(i == tcount-1)
			{
				eventDetailList.push( '<div class="step">' 
								+			'<div>'
								+				'<div class="circle">' + item.id + '</div>'
								+				'<div class="line"></div>'
								+			'</div>'
								+			 '<div>'
								+				'<div class="title yellow">' + item.title + '</div>'
								+				'<div class="row">'							
								+					'<div class="col-md-10 yellow"><p>' + item.description + '</p> </div>'
								+					'<div class="col-md-2"><span class="fa fa-check-circle" ></span></div>  ' 								
								+				'</div>'
								+			'</div>'
								+       '</div>' );
			}
			else
			{
				eventDetailList.push( '<div class="step">' 
								+			'<div>'
								+				'<div class="circle">' + item.id + '</div>'
								+				'<div class="line"></div>'
								+			'</div>'
								+			 '<div>'
								+				'<div class="title">' + item.title + '</div>'
								+				'<div class="row">'							
								+					'<div class="col-md-10"><p>' + item.description + '</p> </div>'
								+					'<div class="col-md-2"><span class="fa fa-check-circle" ></span></div>  ' 								
								+				'</div>'
								+			'</div>'
								+       '</div>' );
			}
		  });
		  for(var i=0; i<4; i++) {
			$( "#eventdetailsbody" ).append(eventDetailList[i]);
		  }
		  resetEventDetailStyle();
	});	
}

function resetEventDetailStyle()
{
	for(var i=1; i<5; i++) {
		$('#eventdetailsbody > :nth-child(' + i +')').fadeTo(250 * i, 0.25 * i);
	}
}

function loopSteppers()
 {
	var count = 0;
	var timer=window.setInterval(function(){	
		count++;	
		$('#eventdetailsbody').find('div').first().remove();
		
		$( "#eventdetailsbody" ).append(eventDetailList[(count+3)%eventDetailList.length]);
		
		resetEventDetailStyle();
		
	},5000);
 }

 function InitStepperModal()
 {
	 $('#eventChronologyModal').on('show.bs.modal', function (e) {
	   for(var i=eventDetailList.length-1; i> -1; i--)
	   {
		   $("#eventChronologyBody").append(eventDetailList[i]);
	   }
	});
	
	 $('#eventChronologyModal').on('hidden.bs.modal', function (e) {
	   $("#eventChronologyBody").empty();
	});
	 
 }


/***************************************Stepper ******************************/

$(function() {// 初始化内容
    
	buildChart();
	InitSteppers();
	loopSteppers();
	InitStepperModal();
	buildAccidentTrendChart();	
});  