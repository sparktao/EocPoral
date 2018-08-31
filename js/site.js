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

/***************************************Stepper Start******************************/
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


/***************************************Stepper End******************************/

/***************************************EventInfo Start******************************/

var eventInfoComponent = null;
function EventInfoComponent(){
	var _self = this;
	this.eventInfoList=[];
	this.currentEventInfo= {id:"1111", name:"某广场聚众闹事，疑似多人聚集", happenedtime:new Date("2018-08-30 09:32:21"), coordinates:[]};
	
	this.Load = function() {
		$.getJSON( "Luciad/data/events.json", function( data ) {
			$.each( data.features, function( i, item ) {
				var ev = {};
				ev.id = item.properties.uid;
				ev.name = item.properties.NAME;
				ev.happenedtime = new Date("2018-08-30 09:32:21");
				ev.coordinates = item.geometry.coordinates;
				_self.eventInfoList.push(ev);
			});
		});
	};
	
	this.setCurrentEventInfoById = function(uid) {
		$.each( _self.eventInfoList, function( i, item ) {	
			if(item.id == uid) {
				_self.SetCurrentEventInfo(item);
			}
		});
	};
	
	this.SetCurrentEventInfo = function(eventinfo) {
		_self.currentEventInfo = eventinfo;
		$("#eventInfoNameDiv").html("事件名称：" + _self.currentEventInfo.name);
	}
	
	this.search = function(){
		if(!!eventSearchListComponent)
		{
			eventSearchListComponent.show();
		}
		//显示缓冲区
		//removeTempCircle();
		//createTempCircle(ShapeFactory.createPoint("", _self.currentEventInfo.coordinates), 500);
	}
}


function EventSearchListComponent()
{
	var _self = this;
	
	this.show = function()
	{
		$("#searchpanel").show();		
	}
	
	this.hide = function()
	{
		$("#searchpanel").hide();			
	}	
}

var eventSearchListComponent = new EventSearchListComponent();

/***************************************EventInfo Start******************************/

$(function() {// 初始化内容
    
	buildChart();
	InitSteppers();
	loopSteppers();
	InitStepperModal();
	eventInfoComponent = new EventInfoComponent();
	eventInfoComponent.Load();	
	
	eventSearchListComponent.hide();
	//定时器
	setInterval(function(){
		var nowdate=new Date();
		var s1 = nowdate.getTime();
		var s2 = eventInfoComponent.currentEventInfo.happenedtime.getTime();
		var total = (s1 - s2)/1000;
		var day = parseInt(total / (24*60*60));//计算整数天数
		var afterDay = total - day*24*60*60;//取得算出天数后剩余的秒数
		var hour = parseInt(afterDay/(60*60));//计算整数小时数
		var afterHour = total - day*24*60*60 - hour*60*60;//取得算出小时数后剩余的秒数
		var min = parseInt(afterHour/60);//计算整数分
		var afterMin = parseInt(total - day*24*60*60 - hour*60*60 - min*60);//取得算出分后剩余的秒数
		hour = day *24 + hour;
		if(hour<10) hour="0"+hour;
		if(min<10) min="0"+min;
		if(afterMin<10) afterMin="0"+afterMin;
		$("#eventInfoDuraDiv").html(hour + ":" + min +":" + afterMin);
	} ,1000);

	
	
	buildAccidentTrendChart();	
});  