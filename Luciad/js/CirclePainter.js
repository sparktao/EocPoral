define([
  "luciad/view/feature/FeaturePainter",
  "luciad/shape/ShapeFactory",
  "luciad/view/style/PinEndPosition"
], function(FeaturePainter,
            ShapeFactory,
			PinEndPosition) {

  var minRadius = 1000;
  var maxRadius = 50000;

  function CirclePainter() {
    FeaturePainter.call(this);
  }

  CirclePainter.prototype = Object.create(FeaturePainter.prototype);
  CirclePainter.prototype.constructor = CirclePainter;

  CirclePainter.prototype.paintLabel = null; /*function(labelCanvas, feature, shape, layer, map, state) {
		var emptyStyle = {
			offset: 20,
			pin: {
			  endPosition: PinEndPosition.MIDDLE,
			  width: 1
			}
		};	  
	  var htmlNormal = '半径:$R';
	  var htmlNormal = '<div style="background-color: rgb(40,40,40); padding: 5px; border-radius: 10px; color: rgb(255, 187, 0)">半径: $R</div>';
	  htmlNormal = htmlNormal.replace('$R', Math.floor(shape.radius).toString());
	  labelCanvas.drawLabel(htmlNormal, shape.focusPoint, emptyStyle);
  };*/

  CirclePainter.prototype.paintBody = function(geoCanvas, feature, shape, layer, map, paintState) {
    geoCanvas.drawShape(shape, {
      fill: {
        color: "rgba(255, 187, 0, 0.4)"
      },
      stroke: {
        color: paintState.selected ? "rgba(255, 0, 0, 0.4)" : "rgb(255, 187, 0)",
        width: paintState.selected ? 1 : 2
      }
    });
    /*geoCanvas.drawIcon(ShapeFactory.createPoint(shape.reference, [shape.center.x, shape.center.y, 10]), {
      url: "../Pic/eye_small.png",
      draped: true
    });*/
  };

  return CirclePainter;
});