var OpenLayersSettings = function(){	

	this.Mapstraction = {
		
		init: function(element, api) {		
			var me = this;
			
			this.maps[api] = new OpenLayers.Map(
		        element.id, 
		        {
		          maxExtent: new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34), 
		          maxResolution:156543, numZoomLevels:18, units:'meters', projection: "EPSG:41001",
		          eventListeners: {
	                "moveend": function(e) {me.endPan.fire();},
	                "zoomend": function(e) {me.changeZoom.fire();},
	                "click" : function(e) {
						var lonlat=this.getLonLatFromViewPortPx(e.xy); 
						me.clickHandler(lonlat.lat, lonlat.lon, me); }
	              }
		        }
		      );
		      
		      var map = this.maps[api];
		      
		      this.layers.osmmapnik = new OpenLayers.Layer.TMS(
		        'OSM Mapnik', 
		        [    
		            "http://a.tile.openstreetmap.org/",
		            "http://b.tile.openstreetmap.org/",
		            "http://c.tile.openstreetmap.org/"
		        ], 
		        {
		          type:'png', 
		          getURL: function (bounds) {
		            var res = this.map.getResolution();
		            var x = Math.round ((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
		            var y = Math.round ((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
		            var z = this.map.getZoom();
		            var limit = Math.pow(2, z);    
		            if (y < 0 || y >= limit) {
		              return null;
		            } else {
		              x = ((x % limit) + limit) % limit;
		              var path = z + "/" + x + "/" + y + "." + this.type; 
		              var url = this.url;
		              if (url instanceof Array) {
		                url = this.selectUrl(path, url);
		              }
		              return url + path;
		            }
		           }, 
		           displayOutsideMaxExtent: true
		         }
		       );
		       
		      this.layers.osm = new OpenLayers.Layer.TMS(
		        'OSM', 
		        [    
		            "http://a.tah.openstreetmap.org/Tiles/tile.php/",
		            "http://b.tah.openstreetmap.org/Tiles/tile.php/",
		            "http://c.tah.openstreetmap.org/Tiles/tile.php/"
		        ], 
		        {
		          type:'png', 
		          getURL: function (bounds) {
		            var res = this.map.getResolution();
		            var x = Math.round ((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
		            var y = Math.round ((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
		            var z = this.map.getZoom();
		            var limit = Math.pow(2, z);    
		            if (y < 0 || y >= limit) {
		              return null;
		            } else {
		              x = ((x % limit) + limit) % limit;
		              var path = z + "/" + x + "/" + y + "." + this.type; 
		              var url = this.url;
		              if (url instanceof Array) {
		                url = this.selectUrl(path, url);
		              }
		              return url + path;
		            }
		           }, 
		           displayOutsideMaxExtent: true
		         }
		       );
			var myStyles = new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({
                    pointRadius: 5, // sized according to type attribute
                    fillColor: "#ffcc66",
                    strokeColor: "#ff9933",
                    strokeWidth: 4,
                    fillOpacity:0.5
                }),
                "select": new OpenLayers.Style({
                    fillColor: "#66ccff",
                    strokeColor: "#3399ff"
                })
			});
	       	var onPopupClose = function(evt){
	       		me.controls.select.unselect(this.feature);
	       	};
	       	var onMarkerSelect = function(feature) {
	           if(typeof(feature.mapstraction_marker) === "undefined" ||!feature.mapstraction_marker.infoBubble ){return;}
	           popup = new OpenLayers.Popup.FramedCloud("chicken", 
	                                    feature.geometry.getBounds().getCenterLonLat(),
	                                    null,
	                                    "<div style='font-size:.8em'>"+feature.mapstraction_marker.infoBubble+"</div>",
	                                    null, true, onPopupClose);
	           feature.popup = popup;
	           popup.feature = feature;
	           map.addPopup(popup);
	        };
	        
	        var onMarkerUnselect = function(feature){
	        	if(typeof(feature.mapstraction_marker) === "undefined" ||!feature.mapstraction_marker.infoBubble ){return;}
	        	map.removePopup(feature.popup);
	        	feature.popup.destroy();
	        	feature.popup = null;
	        };

		      this.maps[api].addLayer(this.layers.osmmapnik); 
		      this.maps[api].addLayer(this.layers.osm);   
		      this.layers.features = new OpenLayers.Layer.Vector('features');
	        	this.maps[api].addLayer(this.layers.features,{"styleMap":myStyles});
				this.controls = [];
	        	this.controls.draw_point = new OpenLayers.Control.DrawFeature(this.layers.features, OpenLayers.Handler.Point);
	        	this.maps[api].addControl(this.controls.draw_point);
	        	this.controls.draw_point.deactivate();
	        	this.controls.draw_linestring = new OpenLayers.Control.DrawFeature(this.layers.features, OpenLayers.Handler.Path);
	        	this.maps[api].addControl(this.controls.draw_linestring);
	        	this.controls.draw_linestring.deactivate();
	        	this.controls.draw_polygon = new OpenLayers.Control.DrawFeature(this.layers.features, OpenLayers.Handler.Polygon);
	        	this.maps[api].addControl(this.controls.draw_polygon);
	        	this.controls.draw_polygon.deactivate();
	        	this.controls.modify = new OpenLayers.Control.ModifyFeature(this.layers.features);
	        	this.maps[api].addControl(this.controls.modify);
	        	this.controls.modify.deactivate();
	        	this.controls.select = new OpenLayers.Control.SelectFeature(this.layers.features,
	        		{onSelect:onMarkerSelect, onUnselect:onMarkerUnselect}); 
				this.maps[api].addControl(this.controls.select);
				this.controls.select.activate();
		      this.loaded[api] = true;
	
		},
		
		applyOptions: function(){
			var map = this.maps[this.api];
			if(this.options.enableScrollWheelZoom){
				map.enableContinuousZoom();
				map.enableScrollWheelZoom();
			}
		},
	
		resizeTo: function(width, height){	
			this.currentElement.style.width = width;
	      	this.currentElement.style.height = height;
	      	this.maps[this.api].updateSize();
		},
	
		addControls: function( args ) {
			var map = this.maps[this.api];
		
			// FIXME: OpenLayers has a bug removing all the controls says crschmidt
			//Possible fix by chiru---->remove only controls which you can add below
	            for (var i = 0;i < map.controls.length; i++) {
	            	if (map.controls[i].displayClass.indexOf("Pan")>0||
	            		map.controls[i].displayClass.indexOf("Zoom")>0||
	            		map.controls[i].displayClass.indexOf("Overview")>0||
	            		map.controls[i].displayClass.indexOf("LayerSwitcher")>0){
	            		map.controls[i].deactivate();
	                	map.removeControl(map.controls[i]);
	            	}
	            }
	            
	            if (args.zoom ||args.pan)  {
					if (args.zoom == 'large') {
						map.addControl(new OpenLayers.Control.PanZoomBar());
					} else {
						if(args.zoom){map.addControl(new OpenLayers.Control.ZoomPanel());}
						if(args.pan){
							map.addControl(new OpenLayers.Control.PanPanel());
						}
					}
				}
	            if ( args.overview ) {
	                map.addControl(new OpenLayers.Control.OverviewMap());
	            }
	            if ( args.map_type ) {
	                map.addControl(new OpenLayers.Control.LayerSwitcher());
	            }
	
		},
	
		addSmallControls: function() {
			var map = this.maps[this.api];
			for (var i = 0;i < map.controls.length; i++) {
            	if (map.controls[i].displayClass.indexOf("Pan")>0||
            		map.controls[i].displayClass.indexOf("Zoom")>0||
	            	map.controls[i].displayClass.indexOf("LayerSwitcher")>0){
            		map.controls[i].deactivate();
                	map.removeControl(map.controls[i]);
            	}
            }
			map.addControl(new OpenLayers.Control.PanPanel());
	      	map.addControl(new OpenLayers.Control.ZoomPanel());
	      	this.addControlsArgs.pan = true;
	      	this.addControlsArgs.zoom = 'small';
		},
	
		addLargeControls: function() {
			var map = this.maps[this.api];
			for (var i = 0;i < map.controls.length; i++) {
            	if (map.controls[i].displayClass.indexOf("Pan")>0||
            		map.controls[i].displayClass.indexOf("Zoom")>0||
	            	map.controls[i].displayClass.indexOf("LayerSwitcher")>0){
            		map.controls[i].deactivate();
                	map.removeControl(map.controls[i]);
            	}
            }
			map.addControl(new OpenLayers.Control.PanZoomBar());
			this.addControlsArgs.zoom = 'large';
		},
	
		addMapTypeControls: function() {
			var map = this.maps[this.api];
			map.addControl( new OpenLayers.Control.LayerSwitcher({'ascending':false}) );
		},
	
		dragging: function(on) {
			throw 'Not implemented';
		},
	
		setCenterAndZoom: function(point, zoom) { 
			var map = this.maps[this.api];
			var pt = point.toProprietary(this.api);
			
			map.setCenter(pt, zoom);
		},
		
		addMarker: function(marker, old) {
			var map = this.maps[this.api];
			var pin = marker.toProprietary(this.api);
	
	     	marker.setChild(pin);
					
	     	this.layers.features.addFeatures(pin);
	     	
			return pin;
		},
	
		removeMarker: function(marker) {
			var map = this.maps[this.api];
	
			this.layers.features.removeFeatures([marker.proprietary_marker]);
		},
	
		removeAllMarkers: function() {
			var map = this.maps[this.api];
			
			this.layers.markers.clearMarkers();
		},
		
		declutterMarkers: function(opts) {
			var map = this.maps[this.api];
			
			// TODO: Add provider code
		},
	
		addPolyline: function(polyline, old) {
			var map = this.maps[this.api];
			var pl = polyline.toProprietary(this.api);
			
	      	polyline.setChild(pl);
	      	
	      	this.layers.features.addFeatures([pl]);
			
			return pl;
		},
	
		removePolyline: function(polyline) {
			var map = this.maps[this.api];
			
			this.layers.features.removeFeatures([polyline.proprietary_polyline]);
		},
		
		getCenter: function() {
			var point;
			var map = this.maps[this.api];
			
			var pt = map.getCenter();
			if(map.getProjection()!="EPSG:4326"){
				pt.transform(new OpenLayers.Projection("EPSG:900913"),new OpenLayers.Projection("EPSG:4326"));
			}
	      	point = new mxn.LatLonPoint(pt.lat, pt.lon);
			
			return point;
		},
	
		setCenter: function(point, options) {
			var map = this.maps[this.api];
			var pt = point.toProprietary(this.api);
			if(options && options.pan) { 
				map.panTo(pt);
			}
			else { 
				map.setCenter(pt);
			}
		},
	
		setZoom: function(zoom) {
			var map = this.maps[this.api];
			
			map.zoomTo(zoom);
			
		},
		
		getZoom: function() {
			var map = this.maps[this.api];
			
			return map.zoom;
		},
	
		getZoomLevelForBoundingBox: function( bbox ) {
			var map = this.maps[this.api];
			var olbox = bbox.toProprietary(this.api);
			var zoom = map.getZoomForExtent(olbox);
			
			return zoom;
		},
	
		setMapType: function(type) {
			throw 'Not implemented'; 
		},
	
		getMapType: function() {
			throw 'Not implemented';
	
		},
	
		getBounds: function () {
			var map = this.maps[this.api];
			var olbox = map.calculateBounds();
	      	if(map.getProjection()!="EPSG:4326"){
				olbox.transform(new OpenLayers.Projection("EPSG:900913"),new OpenLayers.Projection("EPSG:4326"));
	      	}
	      	return new mxn.BoundingBox(olbox.bottom, olbox.left, olbox.top, olbox.right);
		},
	
		setBounds: function(bounds){
			var map = this.maps[this.api];
			var sw = bounds.getSouthWest();
			var ne = bounds.getNorthEast();
			
			var obounds = new OpenLayers.Bounds();
	      	obounds.extend(new mxn.LatLonPoint(sw.lat,sw.lon).toProprietary(this.api));
	      	obounds.extend(new mxn.LatLonPoint(ne.lat,ne.lon).toProprietary(this.api));
	      	map.zoomToExtent(obounds);
			
		},
	
		addImageOverlay: function(id, src, opacity, west, south, east, north, oContext) {
			throw 'Not implemented';
		},
	
		setImagePosition: function(id, oContext) {
			throw 'Not implemented';
		},
		
		addOverlay: function(url, autoCenterAndZoom) {
			var map = this.maps[this.api];
			
			map.addLayer(new OpenLayers.Layer.GeoRSS("GeoRSS Layer", url));
		},
	
		addTileLayer: function(tile_url, opacity, copyright_text, min_zoom, max_zoom) {
			throw 'Not implemented';
		},
	
		toggleTileLayer: function(tile_url) {
			throw 'Not implemented';
		},
	
		getPixelRatio: function() {
			throw 'Not implemented';
		},
		
		mousePosition: function(element) {
			var map = this.maps[this.api];
			var locDisp = document.getElementById(element);
			
			if (locDisp !== null) {
				try {
		            map.events.register('mousemove', map, function (e) {
		                var lonLat = map.getLonLatFromViewPortPx(e.xy);
		                var lon = lonLat.lon * (180.0 / 20037508.34);
		                var lat = lonLat.lat * (180.0 / 20037508.34);
		                lat = (180/Math.PI)*(2*Math.atan(Math.exp(lat*Math.PI/180))-(Math.PI/2));
		                var loc = numFormatFloat(lat,4) + ' / ' + numFormatFloat(lon,4);
		                // numFormatFloat(X,4) simply formats floating point 'X' to 4 dec places
		                locDisp.innerHTML = loc;
		            });
		            locDisp.innerHTML = '0.0000 / 0.0000';
		        } catch (x) {
		        alert("Error: " + e);
		        }
	
			}
		}
	};
	
	this.LatLonPoint = {
		
		toProprietary: function() {
			var ollon = this.lon * 20037508.34 / 180;
	   		var ollat = Math.log(Math.tan((90 + this.lat) * Math.PI / 360)) / (Math.PI / 180);
	   
	   		ollat = ollat * 20037508.34 / 180;
	   //console.log("COORD: " + this.lat + ', ' + this.lon + " OL: " + ollat + ', ' +ollon);
	   		return new OpenLayers.LonLat(ollon, ollat);
	
		},
	
		fromProprietary: function(googlePoint) {
			var lon = (this.lon / 20037508.34) * 180;
	   		var lat = (this.lat / 20037508.34) * 180;
	
	  		 lat = 180/Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180)) - Math.PI / 2);
	
	   		this.lon = lon;
	   		this.lat = lat;
	
		}
		
	};
	
	this.Marker = {
		
		toProprietary: function() {
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
	    var marker = new OpenLayers.Feature.Vector( new OpenLayers.Geometry.Point(this.location.toProprietary(this.api).lon, this.location.toProprietary(this.api).lat)); 
		marker.style =  {
	 		externalGraphic: icon,
	 		graphicHeight: size[1],
	 		graphicWidth: size[0],
	 		graphicXOffset: anchor[0],
			graphicYOffset: anchor[1]
	 	}; 
		
		if(this.hoverIconUrl) {
	    // TODO
	    }
	
	    if(this.infoDiv){
	    // TODO
	    }
	
	
	    return marker;
		},
	
		openBubble: function() {		
			this.mapstraction.controls.select.select(this.proprietary_marker);
		},
	
		hide: function() {
			this.proprietary_marker.display(false);
		},
	
		show: function() {
			this.proprietary_marker.display(true);
	
		},
	
		update: function() {
			throw 'Not implemented';
		}
		
	};
	
	this.Polyline = {
	
		toProprietary: function() {
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
		        olpoint = this.points[i].toProprietary(this.api);
		        olpoints.push(new OpenLayers.Geometry.Point(olpoint.lon, olpoint.lat));
		    }
		
		    if (this.closed|| olpoints[0].equals(olpoints[length-1])) {
		        // a closed polygon
		        ring = new OpenLayers.Geometry.LinearRing(olpoints);
		        ring = new OpenLayers.Geometry.Polygon(ring);
		    } else {
		        // a line
		        ring = new OpenLayers.Geometry.LineString(olpoints);
		    }
		
		    olpolyline = new OpenLayers.Feature.Vector(ring, null, style);
		
		    return olpolyline;
	
		},
		
		show: function() {
			this.proprietary_polyline.display(true);
		},
	
		hide: function() {
			this.proprietary_polyline.display(false);
		}
		
	};
};

var openLayers = new OpenLayersSettings();
mxn.register('openlayers',openLayers);