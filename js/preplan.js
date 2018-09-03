
function setCursor() {
	this.style.cursor = 'hand';
}

function onClickGoto2() {

	$("#svgDiv").empty();

	d3.xml("/web/samples/EocPortal/diagram/s2.svg").mimeType("image/svg+xml").get(function (error, xml) {
		if (error) {
			alert("加载预案失败！");
			throw error;
		}

		d3.selectAll(".popover").each(function () {
			$(this).popover('hide');
		});

		var svgDiv = document.getElementById("svgDiv");

		svgDiv.appendChild(xml.documentElement);

		d3.select("#arrow-left").on("mouseover", setCursor);

		d3.selectAll("#info-circle").on("mouseover", setCursor);
		d3.selectAll("#message").on("mouseover", setCursor);

		d3.selectAll("#info-circle").each(function () {
			$(this).popover({
				title: null,
				html: true,
				content: "<p style='color:black'>P203, 09:37AM 已派遣.</p><p style='color:black'>P203, 09:39AM 已到达现场.</p><p style='color:black'>F104, 09:38AM 正在赶往现场.</p>",
				container: 'body'
			});
		});

		d3.selectAll("#message").each(function () {
			$(this).popover({
				title: null,
				html: true,
				content: "<div style='text-align:center'><table border='0' style='width:120px;margin:auto'><tr>" +
				"<td><a class='sms' data-id='' onclick='onClickCall(this)' href='#'><img src='images/Sms.png'/></a></td>" +
				"<td><a class='phone' data-id='' onclick='onClickCall(this)' href='#'><img src='images/Phone.png'/></a></td>" +
				"<td><a class='wechat' data-id='0000' onclick='onClickWechat(this)' href='#'><img src='images/Wechat.png'/></a></td>" +
				"</tr></table></div>",
				container: 'body'
			});
		});

	});

}

$(function () {

	$('#planModal').on('show.bs.modal', function () {

		$("#svgDiv").empty();

		d3.xml("/web/samples/EocPortal/diagram/s1.svg").mimeType("image/svg+xml").get(function (error, xml) {
			if (error) {
				alert("加载预案失败！");
				throw error;
			}

			d3.selectAll(".popover").each(function () {
				$(this).popover('hide');
			});

			var svgDiv = document.getElementById("svgDiv");

			svgDiv.appendChild(xml.documentElement);

			d3.select("#arrow-left").on("mouseover", setCursor);
			d3.select("#arrow-left").on("click", onClickGoto2);

			d3.selectAll("#info-circle").on("mouseover", setCursor);
			d3.selectAll("#message").on("mouseover", setCursor);

			d3.selectAll("#info-circle").each(function () {
				$(this).popover({
					title: null,
					html: true,
					content: "<p style='color:black'>P203, 09:37AM 已派遣.</p><p style='color:black'>P203, 09:39AM 已到达现场.</p><p style='color:black'>F104, 09:38AM 正在赶往现场.</p>",
					container: 'body'
				});
			});

			d3.selectAll("#message").each(function () {
				$(this).popover({
					title: null,
					html: true,
					content: "<div style='text-align:center'><table border='0' style='width:120px;margin:auto'><tr>" +
					"<td><a class='sms' data-id='234' onclick='onClickSms(this)' href='#'><img src='images/Sms.png'/></a></td>" +
					"<td><a class='phone' data-id='123456' onclick='onClickCall(this)' href='#'><img src='images/Phone.png'/></a></td>" +
					"<td><a class='wechat' data-id='0000' onclick='onClickWechat(this)' href='#'><img src='images/Wechat.png'/></a></td>" +
					"</tr></table></div>",
					container: 'body'
				});
			});

		});
	}).on('hide.bs.modal', function () {
		d3.selectAll(".popover").each(function () {
			$(this).popover('hide');
		});
	})
});

function onClickSms(e) {
	var id = e.getAttribute("data-id");
	//var name = e.getAttribute("data-name");
	//alert("Id: " + id + " ; Name: " + name);

	alert("sms: " + id);
}

function onClickCall(e) {
	var id = e.getAttribute("data-id");
	//var name = e.getAttribute("data-name");
	//alert("Id: " + id + " ; Name: " + name);

	alert("phone: " + id);
}

function onClickWechat(e) {
	var id = e.getAttribute("data-id");
	//var name = e.getAttribute("data-name");
	//alert("Id: " + id + " ; Name: " + name);

	alert("Id: " + id);
}

$(function () {

	$('[data-toggle="popover"]').popover({
		html: true,
		content: '<div id="contentTable" style="background:#2D3555; color:#FFF"><table id="myTable" border=“0”></table></div>'
	}).on('shown.bs.popover', function () {
		$('#myTable').bootstrapTable({
			url: 'json/resource.json',

			pagination: true, //是否开启分页（*）
			pageNumber: 1, //初始化加载第一页，默认第一页
			pageSize: 3, //每页的记录行数（*）
			//pageList: [2, 3, 4], //可供选择的每页的行数（*）
			sidePagination: "client", //分页方式：client客户端分页，server服务端分页（*）

			columns: [{
					field: 'name',
					title: '姓名',
					width: '100px',
					align: 'center'
				}, {
					field: null,
					title: '电话',
					align: 'center',
					formatter: function (value, row, index) {
						var element =
							"<a class='phone0' data-id='" + row.phone + "' onclick='onClickCall(this)' href='#'><i class='fa fa-phone'></i></a>";
						return element;
					}
				}, {
					field: null,
					title: '微信',
					align: 'center',
					formatter: function (value, row, index) {
						var element =
							"<a class='wechat' data-id='" + row.id + "' onclick='onClickWechat(this)' href='#'><i class='fa fa-weixin'></i></a> ";
						return element;
					}
				}
			]
		});
	});
});