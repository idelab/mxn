/**
 * Provides the generic interactivity using only Mapstraction built-in methods
 */
var GenericInteractivity = function(){

	this.Mapstraction = {
		activateEdition: function(){
			var map = this.maps[this.api];
			var me = this;
			
			this.selectedMarker = null;
			if(typeof(this.handler) === "undefined"){
				this.handler = [];
				this.handler.activate = function(event,map,point){
					if(map.selectedMarker === null) {return;}
					map.selectedMarker.location = point.location;
			
					if (map.selectedMarker.attributes.polyline){
						map.selectedMarker.attributes.polyline.points.splice(map.selectedMarker.attributes.point,map.selectedMarker.attributes.splice,point.location);
						map.selectedMarker.attributes.polyline.updateProprietary();
						map.invoker.go('activatePolyline',[map.selectedMarker.attributes.polyline]);
						map.polylineChanged.fire({'polyline': map.selectedMarker.attributes.polyline});
						map.polylineUnselected.fire({'polyline': map.selectedMarker.attributes.polyline});
					}else{
						map.selectedMarker.setIcon(map.selectedMarker.oldIcon);
						map.selectedMarker.updateProprietary();
						map.markerChanged.fire({'marker': map.selectedMarker});
						map.markerUnselected.fire({'marker': map.selectedMarker});
					}
					
					map.selectedMarker = null;
				};
			}
			me.click.addHandler(this.handler.activate);
			for (var i in this.markers){
				this.invoker.go('activateMarker',[this.markers[i]]);
	  		}
			
			for ( i in this.polylines){
				this.invoker.go('activatePolyline',[this.polylines[i]]);
			}
			document.onkeydown = function(e){
				vKeyCode = e.keyCode;
				if ((vKeyCode == 63272)|| vKeyCode == 46){
					if(me.selectedMarker !== null){
		  				if(me.selectedMarker.attributes.polyline){
		  					for (var i in me.selectedMarker.attributes.polyline.markers){
		  						me.removeMarker(me.selectedMarker.attributes.polyline.markers[i]);
		  					}
		  					me.removePolyline(me.selectedMarker.attributes.polyline);
		  					
		  				}else{
		  					me.removeMarker(me.selectedMarker);
		  				}
		  				me.selectedMarker = null;
		  			}
				}
				if (vKeyCode == 27 && me.selectedMarker !== null){
		  			if(me.selectedMarker.attributes.polyline){
						me.selectedMarker.setIcon(me.selectedMarker.oldIcon);
						me.polylineUnselected.fire({'polyline': me.selectedMarker.attributes.polyline});
		  			}else{ 
						me.selectedMarker.setIcon(me.selectedMarker.oldIcon);
						me.markerUnselected.fire({'marker': me.selectedMarker});
		  			}
		  			me.selectedMarker.updateProprietary();
					me.selectedMarker = null;
				}
			};
		
		},
		activatePolyline:function (polyline){
				var me = this;
				var lat, lon;
				for (var i in polyline.markers){
					me.removeMarker(polyline.markers[i]);
				}
				polyline.markers = [];
				for (var j in polyline.points){
					
					var mark = new mxn.Marker(new mxn.LatLonPoint(polyline.points[j].lat,polyline.points[j].lon));
					mark.attributes.polyline = polyline;
					mark.attributes.point = j;
					mark.attributes.splice = 1;
					mark.setIcon(this.iconURL("edit-vertex"));
					mark.click.addHandler(function(event,marker){
						if(me.selectedMarker !== null){
							if(me.selectedMarker.attributes.polyline){
								me.selectedMarker.setIcon(me.iconURL("edit-vertex"));
							}else{ 
								me.selectedMarker.setIcon(null);
							}						
							me.selectedMarker.updateProprietary();
							me.selectedMarker = null;
						} 
						marker.oldIcon = marker.iconUrl;
						marker.setIcon(me.iconURL("select"));
						marker.updateProprietary();
						me.selectedMarker = marker;
					});
					me.addMarker(mark,false,true);
					polyline.markers.push(mark);
					if(j>0){
						lat = (polyline.points[j].lat + polyline.points[j-1].lat)/2;
						lon = (polyline.points[j].lon + polyline.points[j-1].lon)/2;
						middleMark = new mxn.Marker(new mxn.LatLonPoint(lat,lon));
						middleMark.attributes.polyline = polyline;
						middleMark.attributes.point = j;
						middleMark.attributes.splice = 0;
						middleMark.setIcon(this.iconURL("add-vertex"));
						middleMark.click.addHandler(function(event,marker){
							if(me.selectedMarker !== null){
								if(me.selectedMarker.attributes.polyline){
									me.selectedMarker.setIcon(me.iconURL("edit-vertex"));
									me.polylineUnselected.fire({'polyline': me.selectedMarker.attributes.polyline});
								}else{ 
									me.selectedMarker.setIcon(null);
									me.markerUnselected.fire({'marker': me.selectedMarker});
								}
								me.selectedMarker.updateProprietary();
								me.selectedMarker = null;
							}
							marker.oldIcon = marker.iconUrl;
							marker.setIcon(me.iconURL("select"));
							marker.updateProprietary();
							me.selectedMarker = marker;
							me.polylineSelected.fire({'polyline': me.selectedMarker.attributes.polyline});
						});
						me.addMarker(middleMark,false,true);
						polyline.markers.push(middleMark);
					}
					if (j == polyline.points.length - 1 &&polyline.closed  === true){
						lat = (polyline.points[j].lat + polyline.points[0].lat)/2;
						lon = (polyline.points[j].lon + polyline.points[0].lon)/2;
						middleMark = new mxn.Marker(new mxn.LatLonPoint(lat,lon));
						middleMark.attributes.polyline = polyline;
						middleMark.attributes.point = j+1;
						middleMark.attributes.splice = 0;
						middleMark.setIcon(this.iconURL("add-vertex"));
						middleMark.click.addHandler(function(event,marker){
							if(me.selectedMarker !== null){
								if(me.selectedMarker.attributes.polyline){
									me.selectedMarker.setIcon(me.iconURL("edit-vertex"));
									me.polylineUnselected.fire({'polyline': me.selectedMarker.attributes.polyline});
								}else{ 
									me.selectedMarker.setIcon(me.selectedMarker.oldIcon);
									me.markerUnselected.fire({'marker': me.selectedMarker});
								}
								me.selectedMarker.updateProprietary();
								me.selectedMarker = null;
							} 
							marker.oldIcon = marker.iconUrl;
							marker.setIcon(me.iconURL("select"));
							marker.updateProprietary();
							me.selectedMarker = marker;
							me.polylineSelected.fire({'polyline': me.selectedMarker.attributes.polyline});
						});
						me.addMarker(middleMark,false,true);
						polyline.markers.push(middleMark);
					}
					
				}
			}
			
		,activateMarker: function(activeMarker){
			if(typeof(activeMarker.handler) === "undefined"){
				activeMarker.handler = [];
				activeMarker.handler.activate = function(event,marker){
					var map = marker.mapstraction;
					if(map.selectedMarker !== null){
						if(map.selectedMarker.attributes.polyline){
							map.selectedMarker.setIcon(map.iconURL("edit-vertex"));
							map.polylineUnselected.fire({'polyline': map.selectedMarker.attributes.polyline});
						}else{ 
							map.selectedMarker.setIcon(map.selectedMarker.oldIcon);
							map.markerUnselected.fire({'marker': map.selectedMarker});
						}
						map.selectedMarker.updateProprietary();
						map.selectedMarker = null;
					} 
					marker.oldIcon = marker.iconUrl;
					marker.setIcon(map.iconURL("select"));
					marker.updateProprietary();
					map.selectedMarker = marker;
					map.markerSelected.fire({'marker': map.selectedMarker});
				};
			}
			activeMarker.click.addHandler(activeMarker.handler.activate);
		},
		deactivateEdition: function(){
			this.click.removeHandler(this.handler.activate);
			if(this.selectedMarker!== null &&this.selectedMarker.attributes.polyline === null){
				this.selectedMarker.setIcon(null);
				this.selectedMarker.updateProprietary();
			}
			for (var i in this.polylines){
				for (var j in this.polylines[i].markers){
					this.removeMarker(this.polylines[i].markers[j]);
				}
			}
			for (var i in this.markers){
				this.markers[i].click.removeHandler(this.markers[i].handler.activate);
			}
		},
		addFeature: function(feature,data){
			var me = this;
			switch(feature){
			case "point":
				var addMarker = function (event,map,point){
						var mymarker = new mxn.Marker(point.location);
						map.addMarkerWithData(mymarker,data);
						map.click.removeHandler(addMarker);
						me.addingFeature = false;
						if(me.editionActive){
							me.invoker.go('activateMarker',[mymarker]);
						}
					};
					me.click.addHandler(addMarker);
			break;
			case "linestring":
			case "polygon":
			var points = [];
			var markers = [];
			var poly = null;
			
			
			var addPoint = function(event,map,point){
				
				var marker = new mxn.Marker(point.location);
				markers.push(marker);
				marker.setIcon(me.iconURL("create"));
				marker.click.addHandler(function(event,map){
					for (var i in markers){
						me.removeMarker(markers[i]);
					}
					me.click.removeHandler(addPoint);
					me.addingFeature = false;
					me.polylineAdded.fire({"polyline":poly});
					if(me.editionActive){
						if(me.handler){me.click.addHandler(me.handler.activate);}
						me.invoker.go('activatePolyline',[poly]);
					}
				});
				map.addMarker(marker,false,true);
				
				
				points.push(point.location);
	
		        if(poly === null &&points.length > 1){ 
		        	poly = new mxn.Polyline(points);
		        	poly.addData(data);
		        	me.addPolyline(poly,false,true);
		        }
		        if(feature =="polygon" && points.length > 2){poly.setClosed(true);}
		        if(poly !== null){
		        	poly.points = points;
		        	poly.updateProprietary();
		        }
			};

			if(this.handler){
				this.click.removeHandler(this.handler.activate);
				if(this.selectedMarker!== null){
				if(me.selectedMarker.attributes.polyline){
						me.selectedMarker.setIcon(me.selectedMarker.oldIcon);
						me.polylineUnselected.fire({'polyline': me.selectedMarker.attributes.polyline});
		  			}else{ 
						me.selectedMarker.setIcon(me.selectedMarker.oldIcon);
						me.markerUnselected.fire({'marker': me.selectedMarker});
		  			}
		  			me.selectedMarker.updateProprietary();
					me.selectedMarker = null;
				}
			}
			this.click.addHandler(addPoint);
			
			break;
			}
		},iconURL: function(state){
			return this.src+"icons/default/default-"+state+".png";
			/*switch(state){
			case "edit-vertex":
			return 'http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png'
			case "create":
			return 'http://maps.google.com/mapfiles/kml/pushpin/blue-pushpin.png'
			case "select":	
			return 'http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png'
			case "add-vertex":	
			return 'http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png'
			}
			//return 'http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png'
			return '/default-edit.png'*/
		}
	};
	
};
