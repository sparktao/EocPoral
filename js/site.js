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
	var textStyle1 = {
					rich:{
                        a:{
                            fontSize:20,
							color:'#fff',
                            verticalAlign:'top',
                            align:'center',
                            padding:[0,0,0,0]
                        },
                        b:{
                            fontSize:14,
							color:'#fff',
                            align:'center',
                            padding:[0,10,-5,0],
                            lineHeight:25
                        }
                    }
				};
	if(document.body.clientWidth <1300) {
		textStyle1 = {
					rich:{
                        a:{
                            fontSize:12,
							color:'#fff',
                            verticalAlign:'top',
                            align:'center',
                            padding:[0,0,0,0]
                        },
                        b:{
                            fontSize:12,
							color:'#fff',
                            align:'center',
                            padding:[0,10,-10,0],
                            lineHeight:25
                        }
                    }
				};
	}
	// 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('main'));

        // 指定图表的配置项和数据
        var option = {
			legend: {
				x : 'center',
				y : 'top',
				bottom:15,
                itemGap:20,
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
				textStyle: textStyle1,
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
	
	$('#eventdetailsbody .yellow').removeClass('yellow')
	//设置最后一个元素为黄色
	$('#eventdetailsbody > div:last  .col-md-10').addClass('yellow');
	
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
	this.currentEventInfo= {id:"1111", name:"危险化学品生产安全事故应急演练", happenedtime:new Date("2018-09-5 09:32:21"), coordinates:[]};
	
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
		
		try {
			// For modern browsers except IE:
			var event = new CustomEvent('map_addTempCircle', {detail:_self.currentEventInfo.coordinates});
		} catch(err) {
		  // If IE 11 (or 10 or 9...?) do it this way:
			// Create the event.
			var event = document.createEvent('Event');
			// Define that the event name is 'build'.
			event.initEvent('map_addTempCircle', true, true);
			event.detail = _self.currentEventInfo.coordinates;
		}

		// Dispatch/Trigger/Fire the event
		document.dispatchEvent(event);

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
	
	this.removeBuffer = function()
	{
		try {
			// For modern browsers except IE:
			var event = new CustomEvent('map_removeBuffer', {detail:""});
		} catch(err) {
		  // If IE 11 (or 10 or 9...?) do it this way:
			// Create the event.
			var event = document.createEvent('Event');
			// Define that the event name is 'build'.
			event.initEvent('map_removeBuffer', true, true);
			event.detail = "";
		}

		// Dispatch/Trigger/Fire the event
		document.dispatchEvent(event);		
	}
}

var eventSearchListComponent = new EventSearchListComponent();

function VideoComponent()
{
	var _self = this;
	
	this.show = function()
	{
		if(!!$("#videopanel")) {
			$("#videopanel").show();
		}		
	}
	
	this.hide = function()
	{
		if(!!$("#videopanel")) {
			$("#videopanel").hide();	
		}		
	}	
}

var videoComponent = new VideoComponent();

/***************************************EventInfo End******************************/

/*****************************************Wechat Start ****************************/

function sendWeChatMessage()
{
	var titleValue = $("#formTitle").val();
	if(titleValue == undefined || titleValue == "")
	{
		titleValue = $("#formTitle").attr("placeholder");
	}
	
	var descValue = $("#InputDesc").val();
	if(descValue == undefined || descValue == "")
	{
		descValue = $("#InputDesc").attr("placeholder");
	}
	
	var timeValue = $("#InputTime").val();
	if(timeValue == undefined || timeValue == "")
	{
		timeValue = $("#InputTime").attr("placeholder");
	}
	var nowdate = new Date().Format("yyyy-MM-ddTHH:mm:ss");
	var msgStr = '{"ID":"962c701a-556c-4f7b-967b-a8d9f492271d","SourceType":"IPR","SubsourceType":"Task","SourceNode":"","SyncTime":"2018-09-04T09:10:54.3719555+08:00",'
	+'"Content":{"ID":"'+guid()+'","OPERATION":"危险化学品生产安全事故应急演练","REPORTTIME":"'+nowdate+'","REPORTER":"公安分局","DEADLINETIME":"'+timeValue+'",'
	+'"ABSTRACT":"'+ titleValue +'","DESCRIPTION":"'+descValue+'","ACTIONS":"感谢您的体验","BEGINTIME":"'+nowdate+'","ENDTIME":"1970-01-01T00:00:00","CREATIONTIME":"'+nowdate+'","CREATEDBY":"2018用户大会","RECIPIENT":"大会来宾"}}';
	var msg = JSON.parse(msgStr);
	var msglst = [];
	msglst.push(msg);	
	
	window.setTimeout(function () {
		$.ajax({
			type: 'POST',
			url: "http://www.hexagonsi-ps.com/WeChatIntegration/Home/SentInfo",			
			data: JSON.stringify(msglst),
			dataType: "json",
			async: true,
			success: function (data) {
				
			},
			complete: function() {
			//请求完成的处理
				alert("发送wechat消息成功!");
			},
			error: function (data) {
				alert('data');
			}
		});
	}, 200);
	
}

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

Date.prototype.Format = function(fmt) { 
  var o = {   
	"M+" : this.getMonth()+1,                 //月份   
	"d+" : this.getDate(),                    //日   
	"h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时           
	"H+" : this.getHours(), //小时
	"m+" : this.getMinutes(),                 //分   
	"s+" : this.getSeconds(),                 //秒   
	"q+" : Math.floor((this.getMonth()+3)/3), //季度   
	"S"  : this.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
	fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
	if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;   
} 

/*****************************************Wechat End ****************************/

$(function() {// 初始化内容
    
	buildChart();
	InitSteppers();
	loopSteppers();
	InitStepperModal();
	eventInfoComponent = new EventInfoComponent();
	eventInfoComponent.Load();	
	
	eventSearchListComponent.hide();
	videoComponent.hide();
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