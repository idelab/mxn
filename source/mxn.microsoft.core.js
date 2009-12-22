var MicrosoftSettings = function(){
		
	this.Mapstraction = {
		
		init: function(element, api) {	
			
			var me = this;
			me.onShape = null;
			if (VEMap){
				this.maps[api] = new VEMap(element.id);
		 
				
				this.maps[api].AttachEvent('onmouseover', function(event){
					var mmarker = me.maps[api].GetShapeByID(event.elementID);
					me.onShape = mmarker.mapstraction_marker;
				});
				this.maps[api].AttachEvent('onmouseout', function(event){
					me.onShape = null;
				});
				this.maps[api].AttachEvent('onclick', function(event){	
					if(me.onShape === null){
						var location;
						if(typeof(event.mapX) =="undefined"){
							location = event.latLong;
						}else{
							var x = event.mapX;
							var y = event.mapY;
						    var pixel = new VEPixel(x,y);
						    location = me.maps[api].PixelToLatLong(pixel);
						}
					    me.clickHandler(location.Latitude,location.Longitude,me);
						me.click.fire({'location': new mxn.LatLonPoint(location.Latitude, location.Longitude)});
					}else{
						me.onShape.click.fire();
						me.onShape = null;
					}
				});
				this.maps[api].AttachEvent('onendzoom', function(event){
					me.changeZoom.fire();
					
					
				});
				/*this.maps[api].AttachEvent('onendpan', function(event){
					me.endPan.fire();
					
					
				});*/
				this.maps[api].AttachEvent('onchangeview', function(event){
					me.endPan.fire();
					
					
				});
				this.maps[api].LoadMap();
				document.getElementById("MSVE_obliqueNotification").style.visibility = "hidden"; 
				//removes the bird's eye pop-up
				this.loaded[api] = true;
				me.load.fire();	
				
			}
			else{
				alert(api + ' map script not imported');
				
			}
		
		},
		applyOptions: function(){
			var map = this.maps[this.api];
			if(this.options.enableScrollWheelZoom){
				map.enableContinuousZoom();
				map.enableScrollWheelZoom();	
			
			}
			
		},
	
		resizeTo: function(width, height){	
			this.maps[this.api].Resize(width, height);
		},
	
		addControls: function( args ) {
			var map = this.maps[this.api];
	        
		if (args.pan) {
				map.SetDashboardSize(VEDashboardSize.Normal);
			}
			else {
				map.SetDashboardSize(VEDashboardSize.Tiny);
			}
	
	  	if (args.zoom == 'large') {
				map.SetDashboardSize(VEDashboardSize.Small);
			}
			else if ( args.zoom == 'small' ) {
				map.SetDashboardSize(VEDashboardSize.Tiny);
			}
			else {
				map.HideDashboard();
				map.HideScalebar();
			}
	        	
			
		},
	
		addSmallControls: function() {
			var map = this.maps[this.api];
			map.SetDashboardSize(VEDashboardSize.Tiny);
			this.addControlsArgs.pan = true;
			this.addControlsArgs.zoom = 'small';
		},
	
		addLargeControls: function() {
			var map = this.maps[this.api];
			map.SetDashboardSize(VEDashboardSize.Normal);
			this.addControlsArgs.pan=true;
			this.addControlsArgs.zoom = 'large';
		},
	
		addMapTypeControls: function() {
			var map = this.maps[this.api];
			map.addTypeControl();
		
		},
	
		dragging: function(on) {
			var map = this.maps[this.api];
			if(on){
				map.enableDragMap();
			}
			else{
				map.disableDragMap();
				
			}
		},
	
		setCenterAndZoom: function(point, zoom) { 
			var map = this.maps[this.api];
			var pt = point.toProprietary(this.api);
			var vzoom =  zoom;
			map.SetCenterAndZoom(new VELatLong(point.lat,point.lon), vzoom);
			
		},
		
		addMarker: function(marker, old) {
			var map = this.maps[this.api];
			var pin = marker.toProprietary(this.api);
		    map.AddShape(pin);
			//give onclick event
			//give on double click event
			//give on close window
			//return the marker
			
			
			return pin;
		},
	
		removeMarker: function(marker) {
			var map = this.maps[this.api];
			
			map.DeleteShape(marker.proprietary_marker);
		},
	
		removeAllMarkers: function() {
			var map = this.maps[this.api];
			
			map.DeleteAllShapes();
		},
		
		declutterMarkers: function(opts) {
			var map = this.maps[this.api];
			
			// TODO: Add provider code
		},
	
		addPolyline: function(polyline, old) {
			var map = this.maps[this.api];
			var pl = polyline.toProprietary(this.api);
			pl.HideIcon();//hide the icon VE automatically displays
			map.AddShape(pl);
			
			return pl;
		},
	
		removePolyline: function(polyline) {
			var map = this.maps[this.api];
			
			map.DeleteShape(polyline.proprietary_polyline);
		},
		
		getCenter: function() {
			var map = this.maps[this.api];
			var LL = map.GetCenter();
			var point = new mxn.LatLonPoint(LL.Latitude, LL.Longitude);
			return point;
			
		},
	 
		setCenter: function(point, options) {
			var map = this.maps[this.api];
			var pt = point.toProprietary(this.api);
			map.SetCenter(new VELatLong(point.lat, point.lon));
			
			
		},
	
		setZoom: function(zoom) {
			var map = this.maps[this.api];
			map.SetZoomLevel(zoom);
			
			
		},
		
		getZoom: function() {
			var map = this.maps[this.api];
			var zoom = map.GetZoomLevel();
			
			return zoom;
		},
	
		getZoomLevelForBoundingBox: function( bbox ) {
			var map = this.maps[this.api];
			// NE and SW points from the bounding box.
			var ne = bbox.getNorthEast();
			var sw = bbox.getSouthWest();
			var zoom;
			
			// TODO: Add provider code
			
			return zoom;
		},
	
		setMapType: function(type) {
			var map = this.maps[this.api];
			switch(type) {
				case mxn.Mapstraction.ROAD:
					map.SetMapStyle(VEMapStyle.Road);
					break;
				case mxn.Mapstraction.SATELLITE:
					map.SetMapStyle(VEMapStyle.Aerial);
					break;
				case mxn.Mapstraction.HYBRID:
					map.SetMapStyle(VEMapStyle.Hybrid);
					break;
				default:
					map.SetMapStyle(VEMapStyle.Road);
			}	 
		},
	
		getMapType: function() {
			var map = this.maps[this.api];
			var mode = map.GetMapStyle();
			switch(mode){
				case VEMapStyle.Aerial:
					return mxn.Mapstraction.SATELLITE;
				case VEMapStyle.Road:
					return mxn.Mapstraction.ROAD;
				case VEMapStyle.Hybrid:
					return mxn.Mapstraction.HYBRID;
				default:
					return null;
				
			}
		
	
		},
	
		getBounds: function () {
			var map = this.maps[this.api];
			view = map.GetMapView();
			var topleft = view.TopLeftLatLong;
			var bottomright = view.BottomRightLatLong;
			
			return new mxn.BoundingBox(bottomright.Latitude,topleft.Longitude,topleft.Latitude, bottomright.Longitude );
		},
	
		setBounds: function(bounds){
			var map = this.maps[this.api];
			var sw = bounds.getSouthWest();
			var ne = bounds.getNorthEast();
			
			var rec = new VELatLongRectangle(new VELatLong(ne.lat, ne.lon), new VELatLong(sw.lat, sw.lon));
			map.SetMapView(rec);
			
			
			
		},
	
		addImageOverlay: function(id, src, opacity, west, south, east, north, oContext) {
			var map = this.maps[this.api];
			
			// TODO: Add provider code
		},
	
		setImagePosition: function(id, oContext) {
			var map = this.maps[this.api];
			var topLeftPoint; var bottomRightPoint;
	
			// TODO: Add provider code
	
		//	oContext.pixels.top = ...;
		//	oContext.pixels.left = ...;
		//	oContext.pixels.bottom = ...;
		//	oContext.pixels.right = ...;
		},
		
		addOverlay: function(url, autoCenterAndZoom) {
		  var map = this.maps[this.api];
		  var layer = new VEShapeLayer(); 
		  var mlayerspec = new VEShapeSourceSpecification(VEDataType.GeoRSS, url, layer);
		  map.ImportShapeLayerData(mlayerspec)
		},
	
		addTileLayer: function(tile_url, opacity, copyright_text, min_zoom, max_zoom) {
			var map = this.maps[this.api];
			
			var tileSourceSpec = new VETileSourceSpecification(tile_url, tile_url);
            tileSourceSpec.Opacity = opacity;
			tileSourceSpec.MinZoom = min_zoom;
            tileSourceSpec.MaxZoom = max_zoom;
			
            this.tileLayers.push( [tile_url, tileSourceSpec.ID, true] );            
            map.AddTileLayer(tileSourceSpec, true);

		},
	
		toggleTileLayer: function(tile_url) {
			var map = this.maps[this.api];
			for (var f=0; f<this.tileLayers.length; f++) {
				if(this.tileLayers[f][0] == tile_url) {
					if(this.tileLayers[f][2]) {
						map.HideTileLayer(this.tileLayers[f][1]); 
						this.tileLayers[f][2] = false;
					}
					else {
						map.ShowTileLayer(this.tileLayers[f][1]); 
						this.tileLayers[f][2] = true;
					}
				}
			}
		},
	
		getPixelRatio: function() {
			throw 'Not implemented';
		},
		
		mousePosition: function(element) {
			throw 'Not implemented';
		}
	};
	
	this.LatLonPoint = {
		
		toProprietary: function() {
			return  new VELatLong(this.lat, this.lon);
		},
	
		fromProprietary: function(mpoint) {
			this.lat =mpoint.Latitude;
			this.lon =mpoint.Longitude;
		}
		
	};
	
	this.Marker = {
		
		toProprietary: function() {
			var mmarker = new VEShape(VEShapeType.Pushpin, this.location.toProprietary('microsoft'));
			if(this.infoBubble){mmarker.SetDescription(this.infoBubble);}
			if(this.labelText){mmarker.setTitle(this.labelText);}
			if(this.iconUrl){
				var icon = new VECustomIconSpecification();
				icon.Image = this.iconUrl;
				mmarker.SetCustomIcon(icon);
			}
			return mmarker;
			
		},
	
		openBubble: function() {		
			var mmarker = this.proprietary_marker;
			map.ClearInfoBoxStyles();
			mmarker.SetTitle(this.infoBubble);
		},
	
		hide: function() {
			this.proprietary_marker.Hide();
		},
	
		show: function() {
			this.proprietary_marker.Show();
		},
	
		update: function() {
			throw 'Not implemented';
		}
		
	};
	
	this.Polyline = {
	
		toProprietary: function() {
			var mpoints =[];
			var mpolyline;
			for(var i =0, length = this.points.length; i < length; i++)
			{
				mpoints.push(this.points[i].toProprietary('microsoft'));
			}
			if(this.closed	|| this.points[0].equals(this.points[length-1])){
				mpolyline = new VEShape(VEShapeType.Polygon, mpoints);
			}else{
				mpolyline = new VEShape(VEShapeType.Polyline, mpoints);
			}
			if(this.color){
				var color = new mxn.util.Color(this.color);
				var opacity = (typeof(this.opacity) == 'undefined' || this.opacity === null) ? 1.0 : this.opacity;
				var vecolor = new VEColor(color.red, color.green, color.blue, opacity);
				mpolyline.SetLineColor(vecolor);
			}
			if(this.fillColor){
				var color = new mxn.util.Color(this.fillColor);
				var opacity = (typeof(this.opacity) == 'undefined' || this.opacity === null) ? 0.5 : this.opacity;
				var vecolor = new VEColor(color.red, color.green, color.blue, opacity);
				mpolyline.SetFillColor(vecolor);
			}
			if(this.width){
				mpolyline.SetLineWidth(this.width);
			}
			//	TODO ability to change line width
			return mpolyline;
		},
		
		show: function() {
			this.proprietary_polyline.Show();
		},
	
		hide: function() {
			this.proprietary_polyline.Hide();
		}
		
	};

};

var microsoft2D = new MicrosoftSettings();
mxn.register('microsoft',microsoft2D);

var microsoft3D = new MicrosoftSettings();

microsoft3D.Mapstraction.init = function(element, api) {	
	var me = this;
	me.onShape = null; 
	if (VEMap){
		this.maps[api] = new VEMap(element.id);
 
		
		this.maps[api].AttachEvent('onmouseover', function(event){
			var mmarker = me.maps[api].GetShapeByID(event.elementID);
			me.onShape = mmarker.mapstraction_marker;
		});
		this.maps[api].AttachEvent('onmouseout', function(event){
			me.onShape = null;
		});
		this.maps[api].AttachEvent('onclick', function(event){	
			
			if(me.onShape === null){
				var location;
				if(typeof(event.mapX) =="undefined"){
					location = event.latLong;
				}else{
					var x = event.mapX;
					var y = event.mapY;
				    var pixel = new VEPixel(x,y);
				    location = me.maps[api].PixelToLatLong(pixel);
				}
			    me.clickHandler(location.Latitude,location.Longitude,me);
				me.click.fire({'location': new mxn.LatLonPoint(location.Latitude, location.Longitude)});
			}else{
				me.onShape.click.fire();
				me.onShape = null;
			}
		});
		this.maps[api].AttachEvent('onendzoom', function(event){
			me.moveendHandler(me);
			me.changeZoom.fire();
			
			
		});
		/*this.maps[api].AttachEvent('onendpan', function(event){
			me.moveendHandler(me);
			me.endPan.fire();
			
			
		});*/
		this.maps[api].AttachEvent('onchangeview', function(event){
			me.endPan.fire();
			
			
		});
		this.maps[api].LoadMap();
		this.maps[api].SetMapMode(VEMapMode.Mode3D);
		document.getElementById("MSVE_obliqueNotification").style.visibility = "hidden"; 
	
		//removes the bird's eye pop-up
		this.loaded[api] = true;
		me.load.fire();	
	}
	else{
		alert(api + ' map script not imported');
		
	}

};

mxn.register('microsoft3D',microsoft3D);
