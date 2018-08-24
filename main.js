define([
  "luciad/model/codec/GeoJsonCodec",
  "luciad/model/store/UrlStore",
  "luciad/model/feature/Feature",
  "luciad/model/feature/FeatureModel",
  "luciad/view/LayerType",
  "luciad/view/style/PinEndPosition",
  "luciad/reference/ReferenceProvider",
  "luciad/shape/ShapeFactory",
  "luciad/model/store/MemoryStore",
  "luciad/view/feature/FeatureLayer",
  "luciad/view/feature/FeaturePainter",
  "../common/URLUtil",
  "../common/LayerConfigUtil",
  "../common/ShapePainter",
  "../common/IconFactory",
  "../template/sample",
  "loader/domReady!"
], function(GeoJsonCodec,
            UrlStore,
            Feature,
            FeatureModel,
            LayerType,
            PinEndPosition,
            ReferenceProvider,
            ShapeFactory,
            MemoryStore,
            FeatureLayer,
            FeaturePainter,
            URLUtil,
            LayerConfigUtil,
            ShapePainter,
			IconFactory,
            templateSample) {

	var map = templateSample.makeMap("map", {includeLayerControl:false});
	var CRS84 = ReferenceProvider.getReference("CRS:84");
	var fillColors = ["#ffffcc", "#c7e9b4", "#7fcdbb", "#41b6c4", "#2c7fb8", "#253494"];
	var lineColors = ["#ddddaa", "#a7c994", "#5fad9b", "#2196a4", "#0c5f98", "#051474"];
	var thematicHeights = [220, 180, 150, 100, 50, 0];

	function getColor(height, heightThresholds, colors) {
		var clampedValue = Math.min(Math.max(heightThresholds[heightThresholds.length - 1], height), heightThresholds[0]);
		for (var i = 0; i < heightThresholds.length; i++) {
		  if (clampedValue > heightThresholds[i]) {
			return colors[i];
		  }
		}
		return colors[heightThresholds.length - 1];
	}

	function createBuildingsModel() {
	var modelRef = ReferenceProvider.getHeightAboveTerrainReference("EPSG:4326");

	var delegateCodec = new GeoJsonCodec();
	// overwrite the reference with an above ground reference
	var decodeGeometryOriginal = delegateCodec.decodeGeometryObject;
	delegateCodec.decodeGeometryObject = function(geometry, reference) {
	  return decodeGeometryOriginal.call(this, geometry, modelRef);
	};
	// create a codec that converts the shapes to extruded shapes
	var extrudedCodec = {
	  _delegate: delegateCodec,
	  decode: function(object) {
		var cursor = this._delegate.decode(object);
		return {
		  hasNext: function() {
			return cursor.hasNext();
		  },
		  next: function() {
			var baseFeature = cursor.next();
			var height = baseFeature.properties.MAXHEIGHT - baseFeature.properties.MINHEIGHT;
			return new Feature(ShapeFactory.createExtrudedShape(baseFeature.shape.reference,
				baseFeature.shape,
				0.0,
				height
			), {
			  HEIGHT: height
			}, baseFeature.id);
		  }
		};
	  }
	};

	var store = new UrlStore({target: "data/buildings.json", codec: extrudedCodec});
		return new FeatureModel(store, {
		  reference: modelRef
		});
	}

	function createBuildingsLayer(buildingsModel) {
	var featurePainter = new FeaturePainter();
	featurePainter.paintBody = function(geocanvas, feature, shape, layer, map, paintState) {
	  var fillColor = getColor(feature.properties.HEIGHT, thematicHeights, fillColors);
	  var lineColor = getColor(feature.properties.HEIGHT, thematicHeights, lineColors);
	  geocanvas.drawShape(shape, {
		fill: {
		  color: (paintState.selected ? "rgba(43, 150, 33, 0.6)" : fillColor)
		},
		stroke: {
		  color: (paintState.selected ? "rgba(140, 160, 10, 0.9)" : lineColor),
		  width: 1.5
		}
	  });
	};

	return new FeatureLayer(buildingsModel, {
	  id: "Buildings",
	  selectable: true,
	  editable: false,
	  painter: featurePainter,
	  label: "San Francisco Buildings"
	});
	}

	//CustomLayerLoad Begin//
	var iconFeatureLayerDefaultHeight = 300;
	var iconFeatureLayerDefaultIconSize = 32;
	function createEventPainter(options) {
		options = options || {};
		var eventPainter = new FeaturePainter();
		eventPainter.paintBody = function(geoCanvas, feature, shape, layer, map, state) {
			shape.focusPoint.z = iconFeatureLayerDefaultHeight;
			geoCanvas.drawIcon(shape.focusPoint, {
			  width: iconFeatureLayerDefaultIconSize + "px",
			  height: iconFeatureLayerDefaultIconSize + "px",
			  url: state.selected?"themePic/eventSelect.png" : "themePic/event_" + feature.properties.TYPE + ".png"
			  //anchorX : 0 + "px"
			});
			geoCanvas.drawShape(ShapeFactory.createPolyline(shape.reference, [shape.focusPoint, ShapeFactory.createPoint(shape.reference, [shape.focusPoint.x, shape.focusPoint.y])]), {
				stroke: {
				color: "rgb(128,128,128)",
				width: 1
				}
			});
		};

		var emptyStyle = {
			offset: 20,
			pin: {
			  endPosition: PinEndPosition.MIDDLE,
			  width: 1
			}
		};
		var htmlTemplateNormal = '<div style="background-color: rgb(40,40,40); padding: 5px; border-radius: 10px; color: rgb(238,233,233)">$name, $type</div>';
		var htmlTemplateSelect = '<div style="background-color: rgb(80,10,10); padding: 5px; border-radius: 10px; color: rgb(238,233,233)">$name, $type</div>';
		eventPainter.paintLabel = function(labelCanvas, feature, shape, layer, map, state) {
			var html;
			if (state.selected || options.labelsAlwaysVisible) {
			  html = state.selected ? htmlTemplateSelect : htmlTemplateNormal;
			  html = html.replace('$name', feature.properties.NAME);
			  html = html.replace('$type', feature.properties.TYPE);
			  labelCanvas.drawLabel(html, shape, emptyStyle);
			  
			  if(state.selected)
			  {
				alert("eventSelected");
				
				removeTempCircle();
				createTempCircle(ShapeFactory.createPoint(shape.reference, [shape.focusPoint.x, shape.focusPoint.y]), 500);
			  }
			}
		};
		return eventPainter;
	};
	
	function createAlarmPainter(options) {
		options = options || {};
		var eventPainter = new FeaturePainter();
		eventPainter.paintBody = function(geoCanvas, feature, shape, layer, map, state) {
			shape.focusPoint.z = iconFeatureLayerDefaultHeight;
			geoCanvas.drawIcon(shape.focusPoint, {
			  width: iconFeatureLayerDefaultIconSize + "px",
			  height: iconFeatureLayerDefaultIconSize + "px",
			  url: state.selected?"themePic/alarmSelect.png" : "themePic/alarm.png"
			  //anchorX : 0 + "px"
			});
			geoCanvas.drawShape(ShapeFactory.createPolyline(shape.reference, [shape.focusPoint, ShapeFactory.createPoint(shape.reference, [shape.focusPoint.x, shape.focusPoint.y])]), {
				stroke: {
				color: "rgb(128,128,128)",
				width: 1
				}
			});
		};

		var emptyStyle = {
			offset: 20,
			pin: {
			  endPosition: PinEndPosition.MIDDLE,
			  width: 1
			}
		};
		var htmlTemplateNormal = '<div style="background-color: rgb(40,40,40); padding: 5px; border-radius: 10px; color: rgb(238,233,233)">$name</div>';
		var htmlTemplateSelect = '<div style="background-color: rgb(80,10,10); padding: 5px; border-radius: 10px; color: rgb(238,233,233)">$name</div>';
		eventPainter.paintLabel = function(labelCanvas, feature, shape, layer, map, state) {
			var html;
			if (state.selected || options.labelsAlwaysVisible) {
			  html = state.selected ? htmlTemplateSelect : htmlTemplateNormal;
			  html = html.replace('$name', feature.properties.NAME);
			  labelCanvas.drawLabel(html, shape, emptyStyle);
			  
			  if(state.selected)
				alert("alarmSelected");
			}
		};
		return eventPainter;
	};
	
	function createUnitPainter(options) {
		options = options || {};
		var eventPainter = new FeaturePainter();
		eventPainter.paintBody = function(geoCanvas, feature, shape, layer, map, state) {
			shape.focusPoint.z = 20;
			geoCanvas.drawIcon(shape.focusPoint, {
			  width: 64 + "px",
			  height: 64 + "px",
			  url: state.selected?"themePic/unitSelect.png" : "themePic/unit.png"
			  //anchorX : 0 + "px"
			});
		};

		var emptyStyle = {
			offset: 20,
			pin: {
			  endPosition: PinEndPosition.MIDDLE,
			  width: 1
			}
		};
		var htmlTemplateNormal = '<div style="background-color: rgb(40,40,40); padding: 5px; border-radius: 10px; color: rgb(238,233,233)">$name</div>';
		var htmlTemplateSelect = '<div style="background-color: rgb(80,10,10); padding: 5px; border-radius: 10px; color: rgb(238,233,233)">$name</div>';
		eventPainter.paintLabel = function(labelCanvas, feature, shape, layer, map, state) {
			var html;
			if (state.selected || options.labelsAlwaysVisible) {
			  html = state.selected ? htmlTemplateSelect : htmlTemplateNormal;
			  html = html.replace('$name', feature.properties.NAME);
			  labelCanvas.drawLabel(html, shape, emptyStyle);
			  
			  if(state.selected){
				alert("unitSelected");
			  }
			}
		};
		return eventPainter;
	};
	
	function createIconFeatureLayer(layerName, layerStoreURL, layerPainter) {
		/************************** Event Layer *****************************/
		var layerStore = new UrlStore({
			target: layerStoreURL
		});

		var layerModel = new FeatureModel(layerStore, {
			reference: CRS84
		});

		var featureLayer = new FeatureLayer(layerModel, {
			label: layerName,
			layerType: LayerType.STATIC,
			painter: layerPainter,
			selectable: true
			});
		map.layerTree.addChild(featureLayer);
		return featureLayer;
	}

	var eventFeatureLayer = createIconFeatureLayer("Event", "data/events.json", createEventPainter({labelsAlwaysVisible: true}));
	var alarmFeatureLayer = createIconFeatureLayer("Event", "data/alarms.json", createAlarmPainter({labelsAlwaysVisible: true}));
	var unitFeatureLayer = createIconFeatureLayer("Event", "data/units.json", createUnitPainter({labelsAlwaysVisible: true}));
	//CustomLayerLoad End//

	//tempCircleLayer Begin//
	var tempCircleFeatureLayer;
	function createTempCircle(centerPoint, Radius) {
		var reference = CRS84;

		var fillCirclePainter = new FeaturePainter();
		fillCirclePainter.paintBody = function(geoCanvas, feature, shape, map, layer, state) {
			geoCanvas.drawShape(shape, {
			  stroke: {
				color: "rgb(0,0,255)",
				width: 5,
				dash: [10, 5]
			  },
			  fill: {
				color: ("rgba(43, 150, 33, 0.3)")
			  },
			zOrder: 0
			});
		};

		tempCircleFeatureLayer = new FeatureLayer(new FeatureModel(new MemoryStore({
		  data: [
			new Feature(ShapeFactory.createCircleByCenterPoint(reference, centerPoint, Radius), {}, 1)
		  ]
		}), {
		  reference: reference
		}), {
		  label: "Lines",
		  painter: fillCirclePainter,
		  selectable: true
		});
		
		map.layerTree.addChild(tempCircleFeatureLayer);
	}
	
	function removeTempCircle(){
		if(tempCircleFeatureLayer != null)
		map.layerTree.removeChild(tempCircleFeatureLayer);
	}
	//tempCircleLayer End//
	
	var count = 0;
	var timer=window.setInterval(function(){
		count++;
		
		if(unitFeatureLayer!=null)
			map.layerTree.removeChild(unitFeatureLayer);
	
		
		unitFeatureLayer = createIconFeatureLayer("tempRedlineCircle", "json/units" + count%7 + ".json", createUnitPainter({labelsAlwaysVisible: true}));
		
	},5000);

	//Create model, layer, and add the result to the layer tree
	var buildingsModel = createBuildingsModel();
	var buildingsLayer = createBuildingsLayer(buildingsModel);
	map.layerTree.addChild(buildingsLayer, "top");

	//Fit on exact camera angle
	map.mapNavigator.lookFrom(ShapeFactory.createPoint(ReferenceProvider.getReference("EPSG:4978"), [
	-2704965.418306253,
	-4261299.032250457,
	3886789.332955691
	]), 55.78790525145676, -23.351176380543002, 0.0);

});
