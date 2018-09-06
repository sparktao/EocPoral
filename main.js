define([
  "luciad/model/codec/GeoJsonCodec",
  "luciad/model/store/UrlStore",
  "luciad/model/feature/Feature",
  "luciad/model/feature/FeatureModel",
  "luciad/view/LayerType",
  "luciad/view/style/PinEndPosition",
  "luciad/reference/ReferenceProvider",
  "luciad/shape/ExtrudedShape",
  "luciad/shape/ShapeFactory",
  "luciad/shape/ShapeType",
  "luciad/view/controller/EditController",
  "luciad/view/input/GestureEventType",
  "luciad/model/store/MemoryStore",
  "luciad/view/feature/FeatureLayer",
  "luciad/view/feature/FeaturePainter",
  "../common/URLUtil",
  "../common/LayerConfigUtil",
  "../common/ShapePainter",
  "../common/IconFactory",
  "./Luciad/js/CirclePainter",
  "../template/sample",
  "loader/domReady!"
], function(GeoJsonCodec,
            UrlStore,
            Feature,
            FeatureModel,
            LayerType,
            PinEndPosition,
            ReferenceProvider,
			ExtrudedShape,
            ShapeFactory,
            ShapeType,
			EditController,
			GestureEventType,
            MemoryStore,
            FeatureLayer,
            FeaturePainter,
            URLUtil,
            LayerConfigUtil,
            ShapePainter,
			IconFactory,
			CirclePainter,
            templateSample) {

	var map = templateSample.makeMap("map", {includeLayerControl:false, includeElevation:true, includeZoomControl:true});
	var CRS84 = ReferenceProvider.getReference("CRS:84");

	//var fillColors = ["#3949AB", "#3F51B5", "#5C6BC0", "#7986CB", "#9FA8DA", "#C5CAE9"];
	var fillColors = ["#3400c4", "#3F51B5", "#5C6BC0", "#7986CB", "#9FA8DA", "#e2dedb"];
	//var lineColors = ["#1F2D88", "#2E3F9E", "#48549A", "#6470AD", "#8891C4", "#ACB2D9"];
	var lineColors = ["#1F2D88", "#2E3F9E", "#48549A", "#6470AD", "#8891C4", "#C5CAE9"];
	//var thematicHeights = [220, 180, 150, 100, 50, 0];
	var thematicHeights = [180, 140, 100, 60, 33, 0];

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

	var store = new UrlStore({target: "Luciad/data/buildings.json", codec: extrudedCodec});
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
	  selectable: false,
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
			  url: state.selected?"Luciad/themePic/event_" + feature.properties.TYPE + "Select.png" : "Luciad/themePic/event_" + feature.properties.TYPE + ".png"
			  //anchorX : 0 + "px"
			});
			geoCanvas.drawShape(ShapeFactory.createPolyline(shape.reference, [shape.focusPoint, ShapeFactory.createPoint(shape.reference, [shape.focusPoint.x, shape.focusPoint.y])]), {
				stroke: {
				color: "rgb(253,42,9)",
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
		var htmlTemplateNormal = '<div style="background-color: rgba(253,42,9,0.8); padding: 5px; border-radius: 10px; color: rgb(238,233,233)">$name, $type</div>';
		var htmlTemplateSelect = '<div style="background-color: rgba(80,10,10,0.8); padding: 5px; border-radius: 10px; color: rgb(238,233,233)">$name, $type</div>';
		eventPainter.paintLabel = function(labelCanvas, feature, shape, layer, map, state) {
			var html;
			if (state.selected || options.labelsAlwaysVisible) {
			  html = state.selected ? htmlTemplateSelect : htmlTemplateNormal;
			  html = html.replace('$name', feature.properties.NAME);
			  html = html.replace('$type', feature.properties.TYPE);
			  labelCanvas.drawLabel(html, shape, emptyStyle);
			  
			  if(state.selected)
			  {
				//alert("eventSelected");
				if(!!eventInfoComponent) {
					eventInfoComponent.setCurrentEventInfoById(feature.properties.uid);
				}
				//removeTempCircle();
				//createTempCircle(ShapeFactory.createPoint(shape.reference, [shape.focusPoint.x, shape.focusPoint.y]), 500);
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
			  url: state.selected?"Luciad/themePic/alarmSelect.png" : "Luciad/themePic/alarm.png"
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
        var emptyStyleVideo = {
			offset: 50,
			pin: {
			  endPosition: PinEndPosition.MIDDLE,
			  width: 1
			}
		};
		var htmlTemplateNormal = '<div style="background-color: rgb(40,40,40); padding: 5px; border-radius: 10px; color: rgb(238,233,233)">$name</div>';
        var htmlTemplateSelect = '<div style="background-color: rgb(80,10,10); padding: 5px; border-radius: 10px; color: rgb(238,233,233)">$name</div>';
        var htmlTemplateVideo = '<div style="background-color: #9932CC; padding: 5px; border-radius: 10px; color: rgb(238,233,233)"><video name="leftVideoElement" class="leftVideo" id="leftVideoElement" controls="" autoplay="" src="blob:http://localhost:8072/4486bcca-351d-4e65-800b-69bf0740ddd8"> Your browser is too old which doesn\'t support HTML5 video. </video></div>';

		eventPainter.paintLabel = function(labelCanvas, feature, shape, layer, map, state) {
			var html;
			if (state.selected || options.labelsAlwaysVisible) {
			  html = state.selected ? htmlTemplateSelect : htmlTemplateNormal;
			  html = html.replace('$name', feature.properties.NAME);
			  labelCanvas.drawLabel(html, shape, emptyStyle);
			  
			  if(state.selected) {
				labelCanvas.drawLabel(htmlTemplateVideo, shape, emptyStyleVideo);
				setTimeout(function(){showVideoElement();}, 300);				
			  }
			  else{
				  hideVideoElement();
			  }
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
			  url: state.selected?"Luciad/themePic/unitSelect.png" : "Luciad/themePic/unit.png"
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

	var eventFeatureLayer = createIconFeatureLayer("Event", "Luciad/data/events.json", createEventPainter({labelsAlwaysVisible: true}));
	var alarmFeatureLayer = createIconFeatureLayer("Alarm", "Luciad/data/alarms.json", createAlarmPainter({labelsAlwaysVisible: true}));
	var unitFeatureLayer = createIconFeatureLayer("Unit", "Luciad/data/unitsSimulatior/units0.json", createUnitPainter({labelsAlwaysVisible: true}));
	//CustomLayerLoad End//

	//tempCircleLayer Begin//
	var tempCircleFeatureLayer;
	function createTempCircle(centerPoint, Radius) {
		var reference = CRS84;

		tempCircleFeatureLayer = new FeatureLayer(new FeatureModel(new MemoryStore({
		  data: [
			new Feature(ShapeFactory.createExtrudedShape(reference, ShapeFactory.createCircleByCenterPoint(reference, centerPoint, Radius), 0, 100), {}, 1)
		  ]
		}), {
		  reference: reference
		}), {
		  label: "redlineCircleLayer",
		  painter: new CirclePainter(),
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
       
              
              unitFeatureLayer = createIconFeatureLayer("tempRedlineCircle", "Luciad/data/unitsSimulatior/units" + count%7 + ".json", createUnitPainter({labelsAlwaysVisible: true}));
              
       },5000
	);


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
	
	map.on("SelectionChanged", function(e) {
		selectedFeature = null;
		if (e.selectionChanges.length > 0) {
			//Find first select feature begin
			var iFirstFindSelectIndex;
			for(iFirstFindSelectIndex=0;iFirstFindSelectIndex<e.selectionChanges.length;iFirstFindSelectIndex++){
				if(e.selectionChanges[iFirstFindSelectIndex].selected.length > 0){
					break;
				}
			}
			if(iFirstFindSelectIndex == e.selectionChanges.length)
				return;
			//Find first select feature end
			
			
		  selectedFeature = e.selectionChanges[iFirstFindSelectIndex].selected[0];
		  if(e.selectionChanges[iFirstFindSelectIndex].layer.label == 'redlineCircleLayer'){
			  map.controller = new EditController(e.selectionChanges[iFirstFindSelectIndex].layer, selectedFeature, {finishOnSingleClick: true});
			  /*map.controller.onGestureEvent = function(event) {
				  if(event.type == GestureEventType.DRAG)
				  {
					  console.log(this._editingContext._object.geometry.baseShape.radius);
				  }
				  else if(event.type == GestureEventType.DRAG_END){
					  console.log("end");
					  console.log(this._editingContext._object.geometry.baseShape.radius);
				  }
				  return EditController.prototype.onGestureEvent.apply(this, arguments);
			  };*/
			  map.controller.onDeactivate = function(map) {
			  	alert(this._editingContext._object.geometry.baseShape.radius);
				EditController.prototype.onDeactivate.apply(this, arguments);
			  }
		  }
		}
  });

    // Add an event listener
	document.addEventListener("map_addTempCircle", function(e) {
        //console.log(e.detail); // Prints "Example of an event"
        removeTempCircle();
        createTempCircle(ShapeFactory.createPoint(CRS84, e.detail), 500);
     });
     
     document.addEventListener("map_removeBuffer", function(e) {
        removeTempCircle();
     });
});
