mxn.register('google', {	

Mapstraction: {
	
	activateEdition: function(){
		var me = this;
		this.selectedFeature = null;
		if(typeof(this.handler) === "undefined"){
			this.handler = [];
			this.handler.activate = function(){
				if(me.selectedFeature !== null){
					if(me.selectedFeature.mapstraction_marker){
						me.selectedFeature.setImage(me.selectedFeature.mapstraction_marker.oldIcon);
						me.selectedFeature.mapstraction_marker.iconUrl = me.selectedFeature.mapstraction_marker.oldIcon;
						me.markerUnselected.fire({'marker': me.selectedFeature.mapstraction_marker});
					}else{
						me.selectedFeature.setStrokeStyle({"color":me.selectedFeature.mapstraction_polyline.oldColor});
						me.selectedFeature.mapstraction_polyline.color = me.selectedFeature.mapstraction_polyline.oldColor;
						me.polylineUnselected.fire({'polyline': me.selectedFeature.mapstraction_polyline});				
					}
		
				}
				me.selectedFeature = null;
			};
		}
		this.click.addHandler(this.handler.activate);
		for (var i in this.markers){
			this.invoker.go('activateMarker',[this.markers[i]]);
  		}
  		for (var j in this.polylines) {
  			this.invoker.go('activatePolyline',[this.polylines[j]]);
  		}
		
		document.onkeydown = function(e){
			vKeyCode = e.keyCode;
			if ((vKeyCode == 63272)|| vKeyCode == 46){
				if(me.selectedFeature !== null){
		  			if(me.selectedFeature.mapstraction_marker){
		  				me.removeMarker(me.selectedFeature.mapstraction_marker);
		  			}else{
		  				me.removePolyline(me.selectedFeature.mapstraction_polyline);
		  			}
	  			}
	  			me.selectedFeature = null;
			}
		};
	},
	deactivateEdition:function(){
		this.click.fire();
		this.click.removeHandler(this.handler.activate);
		for (var i = 0;i < this.markers.length; i++){
			this.markers[i].proprietary_marker.disableDragging();
			this.markers[i].click.removeHandler(this.markers[i].handler.activate);
			GEvent.clearListeners(this.markers[i].proprietary_marker, "dragend"); 
  		}
  		for (var j in this.polylines) {
  		    GEvent.clearListeners(this.polylines[j].proprietary_polyline, "mouseover"); 
	        GEvent.clearListeners(this.polylines[j].proprietary_polyline, "mouseout");
	        GEvent.clearListeners(this.polylines[j].proprietary_polyline, "lineupdated");
	        GEvent.clearListeners(this.polylines[j].proprietary_polyline, "endline");
	        GEvent.clearListeners(this.polylines[j].proprietary_polyline, "click");
  		}
	},
	addFeature:function(feature,data){
		var map = this.maps[this.api];
		var me = this; 
		switch(feature){
		case "point":
  			var listener = GEvent.addListener(map, "click", function(overlay, latlng) {	
	    		if (latlng) {
	    			GEvent.removeListener(listener);
			    	var marker = new mxn.Marker(new mxn.LatLonPoint(latlng.lat(),latlng.lng()));
	      			me.addMarkerWithData(marker,data);
	      			me.addingFeature = false;
	      			if(me.editionActive){
	      				me.invoker.go('activateMarker',[marker]);
	      			}
		    	}
  			});
  		break;

	    case "polygon":
	    case "linestring":
	   		var gpoly = new GPolyline([]);
	    	var poly = new mxn.Polyline([]);
	    	if(feature == "polygon"){
	    		poly.setClosed(true);
	    	}
	    	map.addOverlay(gpoly);
	    	gpoly.enableDrawing({});
	    	
  			GEvent.addListener(gpoly,"endline",function(){
  				var points = [];
  				me.addingFeature = false;
  				for (var i = 0;i < gpoly.getVertexCount() ; i ++){
  					var point = gpoly.getVertex(i);
  					points.push(new mxn.LatLonPoint(point.lat(),point.lng()));
  				}
  				poly.points = points;
  				me.addPolylineWithData(poly,data);
  				map.removeOverlay(gpoly);
  				me.addingFeature = false;
  				if(me.editionActive){
	  				me.invoker.go('activatePolyline',[poly]);
  				}
  			});
  		break;
	    }
	},
	activateMarker:function(marker){
		var me = this;
		marker.proprietary_marker.enableDragging();
		GEvent.addListener(marker.proprietary_marker,"dragend",function(newPoint){
			marker.location = new mxn.LatLonPoint(newPoint.lat(),newPoint.lng());
			me.markerChanged.fire({'marker': this.mapstraction_marker});
		});
		if(typeof(marker.handler === "undefined")){
			marker.handler =[];
			marker.handler.activate = function(event,marker){
				if(me.selectedFeature !== null){
					if(me.selectedFeature.mapstraction_marker){
						me.selectedFeature.setImage(me.selectedFeature.mapstraction_marker.oldIcon);
						me.selectedFeature.mapstraction_marker.iconUrl = me.selectedFeature.mapstraction_marker.oldIcon;
						me.markerUnselected.fire({'marker': me.selectedFeature.mapstraction_marker});
					}else{
						me.selectedFeature.setStrokeStyle({"color":me.selectedFeature.mapstraction_polyline.oldColor});
						me.selectedFeature.mapstraction_polyline.color = me.selectedFeature.mapstraction_polyline.oldColor;
						me.polylineUnselected.fire({'polyline': me.selectedFeature.mapstraction_polyline});
					}
	
				}
				me.selectedFeature = marker.proprietary_marker;
				me.markerSelected.fire({'marker': me.selectedFeature.mapstraction_marker});
				if(typeof(marker.iconUrl) === "undefined"){
					marker.oldIcon = "http://www.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png";
				}else{
					marker.oldIcon = marker.iconUrl;
				}
				marker.proprietary_marker.setImage("http://www.google.com/intl/en_us/mapfiles/ms/micons/green-dot.png");
				marker.iconUrl = "http://www.google.com/intl/en_us/mapfiles/ms/micons/green-dot.png";
			};
		}
		marker.click.addHandler(marker.handler.activate);
	},
	activatePolyline:function(poly){
		var me = this;
		GEvent.addListener(poly.proprietary_polyline,"mouseover",function(){this.enableEditing();});
		GEvent.addListener(poly.proprietary_polyline,"mouseout",function(){this.disableEditing();});
		GEvent.addListener(poly.proprietary_polyline,"lineupdated",function(){
			var points = [];
			var equals = true;
			for (var i = 0;i < this.getVertexCount() ; i ++){
				var point = this.getVertex(i);
				var mapstractionPoint = new mxn.LatLonPoint(point.lat(),point.lng());
				points.push(mapstractionPoint);
				if(typeof(this.mapstraction_polyline.points[i]) === "undefined" ||!this.mapstraction_polyline.points[i].equals(mapstractionPoint)){equals = false;}
			}
			if(!equals){
				this.mapstraction_polyline.points = points;
				me.polylineChanged.fire({'polyline': this.mapstraction_polyline});
			}
		});
		GEvent.addListener(poly.proprietary_polyline,"click",function(){
			
			if(me.selectedFeature !== null){
				if(me.selectedFeature.mapstraction_marker){
					me.selectedFeature.setImage(me.selectedFeature.mapstraction_marker.oldIcon);
					me.selectedFeature.mapstraction_marker.iconUrl = me.selectedFeature.mapstraction_marker.oldIcon;
					me.markerUnselected.fire({'marker': me.selectedFeature.mapstraction_marker});
				}else{
					me.selectedFeature.setStrokeStyle({"color":me.selectedFeature.mapstraction_polyline.oldColor});
					me.selectedFeature.mapstraction_polyline.color = me.selectedFeature.mapstraction_polyline.oldColor;
					me.polylineUnselected.fire({'polyline': me.selectedFeature.mapstraction_polyline});
				}

			}
			me.selectedFeature = this;
			if(typeof(me.selectedFeature.mapstraction_polyline.color) === "undefined"){
				me.selectedFeature.mapstraction_polyline.oldColor = "#0000FF";
			}else{
				me.selectedFeature.mapstraction_polyline.oldColor = me.selectedFeature.mapstraction_polyline.color;
			}
			me.selectedFeature.mapstraction_polyline.color = "#00FF00";
			me.selectedFeature.setStrokeStyle({"color":"#00FF00"});
			me.polylineSelected.fire({'polyline': me.selectedFeature.mapstraction_polyline});
		});
	}
}
});