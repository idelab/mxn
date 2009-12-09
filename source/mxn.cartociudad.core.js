var cartociudad = new OpenLayersSettings();
cartociudad.Mapstraction.init = function(element, api) {		
	var me = this;
	var layers = this.layers;
	var controls;
	var map;
	
	this.maps[api] = new OpenLayers.Map(
    element.id, 
    {
        maxResolution:0.02197265625,
        numZoomLevels:15,
        projection: 'EPSG:4326',
        units: 'dd',
		eventListeners: {
            "moveend": function(e) {me.endPan.fire();},
            "zoomend": function(e) {me.changeZoom.fire();},
            "click" : function(e) {
				var lonlat=this.getLonLatFromViewPortPx(e.xy); 
				me.clickHandler(lonlat.lat, lonlat.lon, me); }
        }
    }
  	);
  	map = this.maps[api];
      
    layers.cartociudad = new OpenLayers.Layer.WMS(
        'Cartociudad IDEE',
        'http://www.cartociudad.es/wms-c/CARTOCIUDAD/CARTOCIUDAD?',
        {
            layers: 'Todas', 
            format: 'image/png'
        }
    );
        
    layers.pnoa = new OpenLayers.Layer.WMS(
        'PNOA',
        'http://www.idee.es/wms/PNOA/PNOA?',
        {
            layers: 'pnoa', 
            format: 'image/jpeg'
        }
    );
                  
  	map.addLayer(layers.cartociudad);
 	map.addLayer(layers.pnoa);

  	if (!map.setCenter()) {map.setCenter(new OpenLayers.LonLat(-3.251,40), 0);}

  	layers.features = new OpenLayers.Layer.Vector('features');
  	map.addLayer(layers.features);
  	controls = [];
 	controls.draw_point = new OpenLayers.Control.DrawFeature(layers.features, OpenLayers.Handler.Point);
 	map.addControl(controls.draw_point);
  	controls.draw_point.deactivate();
  	controls.draw_linestring = new OpenLayers.Control.DrawFeature(layers.features, OpenLayers.Handler.Path);
 	map.addControl(controls.draw_linestring);
 	controls.draw_linestring.deactivate();
	controls.draw_polygon = new OpenLayers.Control.DrawFeature(layers.features, OpenLayers.Handler.Polygon);
	map.addControl(controls.draw_polygon);
	controls.draw_polygon.deactivate();
	controls.modify = new OpenLayers.Control.ModifyFeature(layers.features);
	map.addControl(controls.modify);
	controls.modify.deactivate();
	this.controls = controls;
	this.loaded[api] = true;

};
	
cartociudad.Mapstraction.setCenterAndZoom = function(point, zoom) { 
	var map = this.maps[this.api];
	var pt = point.toProprietary(this.api);
	var cartzoom = zoom -5 ;
     
	map.setCenter(pt, cartzoom);
};

cartociudad.Mapstraction.getZoom = function(point, zoom) { 
	var map = this.maps[this.api];
			
	return (map.zoom+5);
};
cartociudad.Mapstraction.setZoom = function(zoom) {
	var map = this.maps[this.api];
			
	map.zoomTo(zoom-5);
			
};

cartociudad.LatLonPoint.toProprietary = function() {
	var calon =this.lon;
	var calat = this.lat;
   
	return new OpenLayers.LonLat(calon, calat);

};

cartociudad.LatLonPoint.fromProprietary = function(googlePoint) {
	var mlon = this.lon;
   	var mlat = this.lat;
   
   	return new LatLonPoint (mlat, mlon);

};

mxn.register('cartociudad', cartociudad);