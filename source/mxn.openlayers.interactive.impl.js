var OpenLayersInteractive = function(){
	
	this.Mapstraction = {
		activateEdition:function(){
			var map = this.maps[this.api];
			var me = this;
			
			this.controls.modify.activate();
			function feature_modified(event_triggered){
				var geom = event_triggered.feature.geometry.clone();
				if(this.map.getProjection()!="EPSG:4326"){
					geom.transform(new OpenLayers.Projection("EPSG:900913"),new OpenLayers.Projection("EPSG:4326"));
				}
				switch(event_triggered.feature.geometry.CLASS_NAME.split(".")[2].toLowerCase()){
				case "point":
					if(event_triggered.feature.popup){
						me.controls.select.unselect(event_triggered.feature);
					}
					event_triggered.feature.mapstraction_marker.location = new mxn.LatLonPoint(geom.y,geom.x);
					me.markerChanged.fire({'marker': event_triggered.feature.mapstraction_marker});
				break;
				case "linestring":
					var points = [];
					for(var i in geom.components){
						points[i] = new mxn.LatLonPoint(geom.components[i].y,geom.components[i].x);
					}
					event_triggered.feature.mapstraction_polyline.points = points;
					me.polylineChanged.fire({'polyline': event_triggered.feature.mapstraction_polyline});
				break;
				case "polygon":
					var points = [];
					for(var i in geom.components[0].components){
						points[i] = new mxn.LatLonPoint(geom.components[0].components[i].y,geom.components[0].components[i].x);
					}
					event_triggered.feature.mapstraction_polyline.points = points;
					me.polylineChanged.fire({'polyline': event_triggered.feature.mapstraction_polyline});
				break;
				}
			}
			if(this.layers.features.events.listeners.featuremodified.length === 0){
				this.layers.features.events.register("featuremodified",this.layers.feature,feature_modified);	
			}
			if(this.layers.features.events.listeners.featureselected.length === 0){
				this.layers.features.events.register("featureselected",this.layers.feature,function(event_triggered){
					switch(event_triggered.feature.geometry.CLASS_NAME.split(".")[2].toLowerCase()){
					case "point":
						me.markerSelected.fire({'marker': event_triggered.feature.mapstraction_marker}); 
					break;
					case "linestring":
					case "polygon":
						me.polylineSelected.fire({'polyline': event_triggered.feature.mapstraction_polyline});
					break;
					}
				});	
				this.layers.features.events.register("featureunselected",this.layers.feature,function(event_triggered){
					switch(event_triggered.feature.geometry.CLASS_NAME.split(".")[2].toLowerCase()){
					case "point":
						me.markerUnselected.fire({'marker': event_triggered.feature.mapstraction_marker}); 
					break;
					case "linestring":
					case "polygon":
						me.polylineUnselected.fire({'polyline': event_triggered.feature.mapstraction_polyline});
					break;
					}
				});
			}
			document.onkeydown = function(e){
				vKeyCode = e.keyCode;
				if ((vKeyCode == 63272)|| vKeyCode == 46){
					var vector_to_remove = me.layers.features.selectedFeatures[0];
			    	if(typeof(vector_to_remove) != "undefined"){
				    	if(vector_to_remove.mapstraction_marker){
				    		me.removeMarker(vector_to_remove.mapstraction_marker);
				    	}else{
				    		me.removePolyline(vector_to_remove.mapstraction_polyline);
				    	}
			    	}
			    	me.controls.modify.deactivate();
			    	me.controls.modify.activate();
				}
			};
		},
		deactivateEdition:function(){
			
			this.controls.modify.deactivate();
			this.layers.features.events.remove("featureselected");
			this.layers.features.events.remove("featureunselected");
			
		},
		addFeature:function(feature,data){
			var map = this.maps[this.api];
			var me = this;
			var poly;
			
			this.controls['draw_'+feature].activate();
			function feature_added(event_triggered){
				var geom = event_triggered.feature.geometry.clone();
				if(this.map.getProjection()!= "EPSG:4326"){
					geom.transform(new OpenLayers.Projection("EPSG:900913"),new OpenLayers.Projection("EPSG:4326"));
				}
				switch(feature){
				case "point":
				 	var marker = new mxn.Marker(new mxn.LatLonPoint(geom.y,geom.x));
					me.addMarkerWithData(marker,data);
					
				break;
				case "polygon":
					var points = [];
					for(var i in geom.components[0].components){
						points[i] = new mxn.LatLonPoint(geom.components[0].components[i].y,geom.components[0].components[i].x);
					}
					poly = new mxn.Polyline(points);
					poly.setClosed(true);
					me.addPolylineWithData(poly,data);
					break;
				case "linestring":
					var points = [];
					for(var i in geom.components){
						points[i] = new mxn.LatLonPoint(geom.components[i].y,geom.components[i].x);
					}
					poly = new mxn.Polyline(points);
					me.addPolylineWithData(poly,data);
				break;
				} 
				event_triggered.feature.destroy();
				me.controls['draw_'+feature].deactivate();
				me.addingFeature = false;
			}
	
			if(this.controls['draw_'+feature].events.listeners.featureadded.length === 0){
				this.controls['draw_'+feature].events.register('featureadded',this.controls['draw_'+feature],feature_added);
			}
		}
	};
};

var openlayers = new OpenLayersInteractive();

mxn.register('openlayers',openlayers);