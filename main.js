define([
  "luciad/model/codec/GeoJsonCodec",
  "luciad/model/store/UrlStore",
  "luciad/model/feature/Feature",
  "luciad/model/feature/FeatureModel",
  "luciad/view/LayerType",
  "luciad/view/style/PinEndPosition",
  "luciad/reference/ReferenceProvider",
  "luciad/shape/ShapeFactory",
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
  
	function createEventPainter(options) {
		options = options || {};
		//#snippet memoization
		var eventPainter = new FeaturePainter();
		eventPainter.cache = {};
		eventPainter.paintBody = function(geoCanvas, feature, shape, layer, map, state) {
			var dimension = this.getIconSize(feature);
			var icon = this.cache[dimension];
			if (!icon || state.selected) {
			  icon = IconFactory.circle({
				stroke: state.selected ? "rgba(0,0,255,1.0)" : "rgba(255,255,255,1.0)",
				fill: state.selected ? "rgba(255,0,255,0.7)" : "rgba(255,0,0,0.5)",
				strokeWidth: state.selected ? 3 : 2,
				width: dimension,
				height: dimension
			  });
			  if (!state.selected) {
				this.cache[dimension] = icon;
			  }
			}
			//#endsnippet memoization
			shape.focusPoint.z = 300;
			geoCanvas.drawIcon(shape.focusPoint, {
			  width: dimension + "px",
			  height: dimension + "px",
			  image: icon
			});
			//#snippet memoization
		};
		//#endsnippet memoization

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
			alert(feature.properties.NAME);
		}
	};

	eventPainter.getIconSize = function(feature) {
		//return Math.round(Math.sqrt(Math.round(feature.properties.TOT_POP / 10000) * 10000 / Math.PI) / 28);
		return 20;
	};
	return eventPainter;
	};
	
	function createEventLayer() {
	  /************************** Event Layer *****************************/
	  var eventStore = new UrlStore({
		target: "data/events.json"
	  });

	  var eventModel = new FeatureModel(eventStore, {
		reference: CRS84
	  });

	  var eventPainter = createEventPainter({labelsAlwaysVisible: true});

	  var eventLayer = new FeatureLayer(eventModel, {
		label: "Event",
		layerType: LayerType.STATIC,
		painter: eventPainter,
		selectable: true
	  });
	  map.layerTree.addChild(eventLayer);
	}


	//Create model, layer, and add the result to the layer tree
	var buildingsModel = createBuildingsModel();
	var buildingsLayer = createBuildingsLayer(buildingsModel);
	map.layerTree.addChild(buildingsLayer, "top");

	createEventLayer();

	//Fit on exact camera angle
	map.mapNavigator.lookFrom(ShapeFactory.createPoint(ReferenceProvider.getReference("EPSG:4978"), [
	-2704965.418306253,
	-4261299.032250457,
	3886789.332955691
	]), 55.78790525145676, -23.351176380543002, 0.0);

});