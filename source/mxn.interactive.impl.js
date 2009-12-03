(function(){
	
function extend(subclass, superclass) {
   	function Dummy() {}
   	Dummy.prototype = superclass.prototype;
   	subclass.prototype = new Dummy();
   	subclass.prototype.constructor = subclass;
   	subclass.superclass = superclass;
   	subclass.superproto = superclass.prototype;
}

/**
 * MapstractionInteractive instantiates an interactive map with some API choice into the HTML element given
 * @param {String} element The HTML element to replace with an interactive map
 * @param {String} api The API to use, one of 'google', 'yahoo', 'microsoft', 'openstreetmap', 'multimap', 'map24', 'openlayers', 'mapquest'. If omitted, first loaded provider implementation is used.
 * @param {Bool} debug optional parameter to turn on debug support - this uses alert panels for unsupported actions
 * @extends mxn.Mapstraction
 * @constructor
 */


mxn.MapstractionInteractive = function (element, api,debug){
	mxn.MapstractionInteractive.superclass.call(this, element,api,debug);
	mxn.addEvents(this, [
		'markerChanged',	// Marker is changed {marker: Marker}
		'polylineChanged',	// Polyline is changed {polyline: Polyline}
		'markerSelected',	// Marker is selected
		'polylineSelected',	// Polyline is selected
		'markerUnselected', // Marker is unselected
		'polylineUnselected'// Polyline is unselected
	]);

	var scripts = document.getElementsByTagName('script');
	for (var i = 0; i < scripts.length; i++) {
		var match = scripts[i].src.replace(/%20/g , '').match(/^(.*?)(mxn|idelabmapstraction)\.js/);
		if (match !== null) {
			this.src = match[1];
			break;
	   }
	}
	/**
	 * POINT FEATURE
	 */
	this.POINT = "point";
	/**
	 * LINESTRING FEATURE
	 */
	this.LINESTRING = "linestring";
	/**
	 *POLYGON FEATURE
	 */
	this.POLYGON = "polygon";
	/**
	 * ALLOWED FEATURES ARRAY
	 */
	this.ALLOWED_FEATURES = [this.POINT,this.LINESTRING,this.POLYGON];
};
var Interactive = mxn.MapstractionInteractive; 
extend(mxn.MapstractionInteractive,mxn.Mapstraction);
	
	
mxn.addProxyMethods(mxn.MapstractionInteractive, [ 
	'activateEdition','activateDelete','activateMarker','addFeature',
	'deactivateEdition',
	'iconURL',
	'activatePolyline'
]);
/**
 * Put features in a map from a WKT values Array
 * @param {Array} features WKT values Array
 */
mxn.MapstractionInteractive.prototype.addWKTArray = function(features) {
	var polygon;
	var wkt;
	for (var i = 0; i < features.length; i ++){
		  polygon = false;
		  switch(trim(features[i].substr(0,features[i].indexOf("("))).toLowerCase()){
		  case "point":
			wkt = features[i].substr((features[i].indexOf("("))+1,(features[i].length-2-features[i].indexOf("("))).split(" ");
		    var point = [];
		    point.lat = parseFloat(wkt[1]);
		    pointlon = parseFloat(wkt[0]);
		    if(typeof(point.lat)=="undefined"||typeof(point.lat)=="undefined") {continue;}
		    else {this.addMarker(new Marker(new LatLonPoint(point.lat,point.lon)));}
		  break;
		  case "polygon":
		  	polygon = true;
		  case "linestring":
		    var points = [];
		    wkt = features[i].substr((features[i].indexOf("("))+2,(features[i].length-2-features[i].indexOf("("))).split(",");
		    for (var j = 0; j < wkt.length;i++){
		      var aux = trim(wkt[j]).split(" ");
		      var point = [];
		      point.lat = parseFloat(aux[1]);
		      point.lon = parseFloat(aux[0]);
		      if(typeof(point.lat)=="undefined"||typeof(point.lat)=="undefined") {continue;}
		      else {points.push(new LatLonPoint(point.lat,point.lon));}
		    }
		    var poly = new Polyline(features[i]);
      		if(polygon)		{poly.setClosed(true);}
      		else 			{poly.setClosed(false);}
      		this.addPolyline(poly);
      	  break;
		  default:
		    return null;
  		}
	}
};
/**
 * Put features in a map from a GEOJSON Object
 * @param json GEOJSON Object containing map features
 */
mxn.MapstractionInteractive.prototype.addJSON = function(json) {
	var features;
	if (typeof(json) == "string") {
		features = eval('(' + json + ')');
	} else {
		features = json;
	}
	features = features.features;
	var map = this.maps[this.api];
	var polyline;
	var marker;
	var markers = [];
	var polygon = null;

	if(features.type == "FeatureCollection") {
		this.addJSON(features.features);
	}

	for (var i = 0; i < features.length; i++) {
		item = features[i];
		polygon = false;
		switch(item.geometry.type) {
			case "Point":
				marker = new mxn.Marker(new mxn.LatLonPoint(item.geometry.coordinates[1],item.geometry.coordinates[0]));
				markers.push(marker);
				this.addMarkerWithData(marker,item.properties);
				break;
			case "Polygon":
				polygon = true;
				var points = item.geometry.coordinates[0];
			case "LineString":
				if(item.geometry.type == "LineString") {points = item.geometry.coordinates;}
				var latlon = [];
				for (var j =0; j< points.length; j ++ ){
					latlon.push(new mxn.LatLonPoint(points[j][1],points[j][0]));
				} 
				polyline = new mxn.Polyline(latlon);
				if (polygon) {polyline.setClosed(true);}
				mapstraction.addPolylineWithData(polyline,item.properties);
				markers.push(polyline);
				break;
			default:
		// console.log("Geometry: " + features.items[i].geometry.type);
		}
	}
	return markers;
};

/**
 * Return a GEOJSON Object containing map features
 * @return GEOJSON Object containing map features 
 */
mxn.MapstractionInteractive.prototype.getJSON = function() {
	var json = {};
	var aux,aux2,aux3;
	json.type = "FeatureCollection";
	json.features =[];
	var marker_attributes =["label","infoBubble","icon","iconShadow","infoDiv","draggable","hover","hoverIcon","openBubble","groupName"];
	for (var i = 0;i < this.markers.length;i ++){
		aux = {};
		aux.type = "Feature";
		aux2 = {};
		aux2.type = "Point";
		aux2.coordinates = [this.markers[i].location.lon, this.markers[i].location.lat];
		aux.geometry = aux2;
		aux.properties = this.markers[i].attributes; 
		json.features.push(aux);
	}
	for (i = 0;i < this.polylines.length;i ++){
		aux = {};
		aux.type = "Feature";
		aux2 = {};
		aux2.type = this.polylines[i].closed? "Polygon": "LineString";
		aux2.coordinates = [];
		aux3 = []; 
		for (var j = 0;j<this.polylines[i].points.length;j ++){
			aux3.push([this.polylines[i].points[j].lon, this.polylines[i].points[j].lat]);
		}
		if(this.polylines[i].closed){
			aux2.coordinates[0] = {};
			aux2.coordinates[0] =aux3;
		}else {aux2.coordinates = aux3;}
		aux.geometry = aux2;
		aux.properties = this.polylines[i].attributes; 
		json.features.push(aux);
	}
	/*json.crs = new Object();
	json.crs.type = "OGC";
	json.crs.properties.urn = "urn:ogc:def:crs:OGC:1.3:CRS84";*/
	
	return json;
};

/**
 * Add a feature to map
 * @param feature Feature type to add. It must be in the ALLOWED_FEATURES Array
 */
mxn.MapstractionInteractive.prototype.addFeature = function(feature,data){
	var allowed = false;
	for (var i in this.ALLOWED_FEATURES){
		if(this.ALLOWED_FEATURES[i] === feature){
			allowed = true;
			break;
		} 
	}
	
	if(!allowed){
		alert('This Feature is not Allowed');
		return;
	}
	
	if(this.addingFeature) {return alert("You can't add 2 features at same time!!!");}
	this.addingFeature = true;

	this.invoker.go('addFeature',arguments);
};

/**
 * Activates the edition mode
 */
mxn.MapstractionInteractive.prototype.activateEdition = function(){
	if(this.editionActive === true) {return;}
	this.editionActive = true;
	this.invoker.go('activateEdition',arguments);
	
};

/**
 * Deactivates the edition mode
 */
mxn.MapstractionInteractive.prototype.deactivateEdition = function(){
	if(this.editionActive === false) {return;}
	this.editionActive = false;
	this.invoker.go('deactivateEdition',arguments);
};

/**
 * Adds a marker pin to the map
 * @param {Marker} marker The marker to add
 * @param {Boolean} old If true, doesn't add this marker to the markers array. Used by the "swap" method
 * @param {Boolean} update If true, doesn't fire the markerAdded event. Used by "updateProprietary" method
 */
mxn.MapstractionInteractive.prototype.addMarker = function(marker, old,update) {
	marker.mapstraction = this;
	marker.api = this.api;
	marker.location.api = this.api;
	marker.map = this.maps[this.api]; 
	var propMarker = this.invoker.go('addMarker', arguments);
	marker.setChild(propMarker);
	if (!old) {
		this.markers.push(marker);
	}
	if(!update) {this.markerAdded.fire({'marker': marker});}
};

/**
 * Removes a Marker from the map
 * @param {Marker} marker The marker to remove.
 * @param {Boolean} update If true, doesn't fire the markerRemoved event. Used by "updateProprietary" method
 */

mxn.MapstractionInteractive.prototype.removeMarker = function(marker,update) {	
	var current_marker;
	for(var i = 0; i < this.markers.length; i++){
		current_marker = this.markers[i];
		if(marker == current_marker) {
			this.invoker.go('removeMarker', arguments);
			marker.onmap = false;
			this.markers.splice(i, 1);
			if(!update){this.markerRemoved.fire({'marker': marker});}
			break;
		}
	}
};

/**
 * Updates the proprietary marker
 */
mxn.Marker.prototype.updateProprietary = function(){
	this.mapstraction.removeMarker(this,true);
	this.mapstraction.addMarker(this,false,true);
};

/**
 * Adds a polyline to the map
 * @param {Polyline} polyline The Polyline to add to the map
 * @param {Boolean} old If true replaces an existing Polyline.
 * @param {Boolean} update If true, doesn't fire the polylineAdded event. Used by "updateProprietary" method
 */

mxn.MapstractionInteractive.prototype.addPolyline = function(polyline, old, update) {
	polyline.mapstraction = this;
	polyline.api = this.api;
	polyline.map = this.maps[this.api];
	var propPoly = this.invoker.go('addPolyline', arguments);
	polyline.setChild(propPoly);
	if(!old) {
		this.polylines.push(polyline);
	}
	if(!update) {this.polylineAdded.fire({'polyline': polyline});}
};

/**
 * Removes a Polyline from the map
 * @param {Polyline} polyline The polyline to remove.
 * @param {Boolean} update If true, doesn't fire the polylineRemoved event. Used by "updateProprietary" method
 */

mxn.MapstractionInteractive.prototype.removePolyline = function(polyline,update) {
	var current_polyline;
	for(var i = 0; i < this.polylines.length; i++){
		current_polyline = this.polylines[i];
		if(polyline == current_polyline) {
			this.polylines.splice(i, 1);
			this.invoker.go('removePolyline', arguments);
			polyline.onmap = false;
			if(!update) {this.polylineRemoved.fire({'polyline': polyline});}
			break;
		}
	}
};

/**
 * Updates the proprietary polyline
 */
mxn.Polyline.prototype.updateProprietary = function(){
	this.mapstraction.removePolyline(this,true);
	this.mapstraction.addPolyline(this,false,true);
};	
})();

mxn.LatLonPoint.prototype.toOpenLayers = function() {
	var ollon = this.lon * 20037508.34 / 180;
	var ollat = Math.log(Math.tan((90 + this.lat) * Math.PI / 360)) / (Math.PI / 180);
   
   		ollat = ollat * 20037508.34 / 180;
   //console.log("COORD: " + this.lat + ', ' + this.lon + " OL: " + ollat + ', ' +ollon);
	return new OpenLayers.LonLat(ollon, ollat);

};

mxn.Marker.prototype.toOpenLayers = function() {
	var size, anchor, icon, selected;
    if(this.iconSize) {
        size = [this.iconSize[0].intValue(), this.iconSize[1].intValue()];
    }
    else {
        size = [21,25];
    }

    if(this.iconAnchor) {
        anchor = [this.iconAnchor[0], this.iconAnchor[1]];
    }
    else {
        // FIXME: hard-coding the anchor point
        anchor = [-(size[0]/2), -size[1]];
    }

    if(this.iconUrl) {
        icon = this.iconUrl;
    }
    else {
        icon = "http://openlayers.org/dev/img/marker-gold.png";
    }
    //var marker = new OpenLayers.Marker(this.location.toProprietary(this.api), icon);
    var marker = new OpenLayers.Feature.Vector( new OpenLayers.Geometry.Point(this.location.toOpenLayers().lon, this.location.toOpenLayers().lat)); 
	marker.style =  {
 		externalGraphic: icon,
 		graphicHeight: size[1],
 		graphicWidth: size[0],
 		graphicXOffset: anchor[0],
		graphicYOffset: anchor[1]
 	} ;
	
	
	if(this.infoBubble) {
        var popup = new OpenLayers.Popup.Framed(null,
            this.location.toOpenLayers(),
            new OpenLayers.Size(100,100),
            this.infoBubble,
            true);
        popup = new OpenLayers.Popup.FramedCloud(null,
			this.location.toOpenLayers(),
			null,
			this.infoBubble,
			null, false);
        popup.autoSize = true;
        var theMap = this.map;
        theMap.addPopup(popup);
        popup.hide();
        marker.popup = popup;
        marker.hover = this.hover;

    }
		


    if(this.hoverIconUrl) {
    // TODO
    }

    if(this.infoDiv){
    // TODO
    }


    return marker;
};
		
mxn.Polyline.prototype.toOpenLayers = function() {
			var olpolyline;
		    var olpoints = [];
		    var ring;
		    var style = {
		        strokeColor: this.color || "#000000",
		        strokeOpacity: this.opacity || 1,
		        strokeWidth: this.width || 3,
		        fillColor: this.fillColor || "#000000",
		        fillOpacity: this.getAttribute('fillOpacity') || 0.2
		    };
		
		    //TODO Handle closed attribute
		
		    for (var i = 0, length = this.points.length ; i< length; i++){
		        olpoint = this.points[i].toOpenLayers();
		        olpoints.push(new OpenLayers.Geometry.Point(olpoint.lon, olpoint.lat));
		    }
		
		    if (this.closed) {
		        // a closed polygon
		        ring = new OpenLayers.Geometry.LinearRing(olpoints);
		        ring = new OpenLayers.Geometry.Polygon(ring);
		    } else {
		        // a line
		        ring = new OpenLayers.Geometry.LineString(olpoints);
		    }
		
		    olpolyline = new OpenLayers.Feature.Vector(ring, null, style);
		
		    return olpolyline;
	
		};

