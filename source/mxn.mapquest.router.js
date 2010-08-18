mxn.register('mapquest',{
	MapstractionRouter:{
		init:function(callback,api){
			//set up the connection to the route server
	         var proxyServerName = "";
	         var proxyServerPort = "";
	         var proxyServerPath = "mapquest_proxy/JSReqHandler.php";
	
	         var geocoderServerName = "geocode.access.mapquest.com";
	         var routerServerName = "route.access.mapquest.com";
	         var serverPort = "80";
	         var serverPath = "mq";
	         for(var sOptKey in options) {
	             switch(sOptKey) {
	                 case 'var proxyServerName ':
	                 proxyServerName = options.proxyServerName;
	                 break;
	                 case 'proxyServerPort':
	                 proxyServerPort = options.proxyServerPort;
	                 break;
	                 case 'proxyServerPath':
	                 proxyServerPath = options.proxyServerPath;
	                 break;
	                 case 'geocoderServerName':
	                 geocoderServerName = options.geocoderServerName;
	                 break;
	                 case 'routerServerName ':
	                 routerServerName = options.routerServerName ;
	                 break;
	                 case 'serverPort ':
	                 serverPort = options.serverPort ;
	                 break;        
	                 case 'var serverPath ':
	                 serverPath = options.serverPath ;
	                 break;
	             }
	         }
         
			 this.geocoders[api] = new MQExec(geocoderServerName, serverPath, serverPort, proxyServerName, proxyServerPath, proxyServerPort );
	         this.routers[api] = new MQExec(routerServerName, serverPath, serverPort, proxyServerName, proxyServerPath, proxyServerPort );
		},
		route: function(addresses){
			var waypoints = new MQLocationCollection();
			var mapstraction_points = Array();
			var gaCollection = new MQLocationCollection("MQGeoAddress");
			var routeOptions = new MQRouteOptions();
			for (var i=0;i<addresses.length;i++) {
				var mqaddress = new MQAddress();

				//first geocode all the user entered locations
				mqaddress.setStreet(addresses[i].street);
				mqaddress.setCity(addresses[i].locality);
				mqaddress.setState(addresses[i].region);
				mqaddress.setPostalCode(addresses[i].postalcode);
				mqaddress.setCountry(addresses[i].country);
				this.geocoders[api].geocode(mqaddress, gaCollection);
				var geoAddr = gaCollection.get(0);
				waypoints.add(geoAddr);

				// Create an array of Mapstraction points to use for markers
  			var mapstraction_point = new Object();
				mapstraction_point.street = geoAddr.getStreet();
				mapstraction_point.locality = geoAddr.getCity();
				mapstraction_point.region = geoAddr.getState();
				mapstraction_point.country = geoAddr.getCountry();
				var mqpoint = geoAddr.getMQLatLng();
				mapstraction_point.point = new LatLonPoint(mqpoint.getLatitude(), mqpoint.getLongitude());
				mapstraction_points.push(mapstraction_point);
			}

			var session = new MQSession();	
			var routeResults = new MQRouteResults();
			var routeBoundingBox = new MQRectLL(new MQLatLng(),new MQLatLng());	
			var sessId = this.routers[api].createSessionEx(session);
			this.routers[api].doRoute(waypoints,routeOptions,routeResults,sessId,routeBoundingBox);
						
			var routeParameters = new Array();
			routeParameters['results'] = routeResults;
			routeParameters['bounding_box'] = routeBoundingBox;
			routeParameters['session_id'] = sessId;
			
			this.callback(mapstraction_points, routeParameters);
		},
		routePoints:function(points){
			var waypoints = new MQLocationCollection();
        var routeOptions = new MQRouteOptions();

        for (var i=0;i<points.length;i++) {
            var geoAddr = new MQGeoAddress();
            geoAddr.setMQLatLng(new MQLatLng(points[i].lat, points[i].lng));
            waypoints.add(geoAddr);
        }

        var session = new MQSession();	
        var routeResults = new MQRouteResults();
        var routeBoundingBox = new MQRectLL(new MQLatLng(),new MQLatLng());	
        var sessId = this.routers[api].createSessionEx(session);

        this.routers[api].doRoute(waypoints,routeOptions,routeResults,sessId,routeBoundingBox);

        var routeParameters = new Array();
        routeParameters['results'] = routeResults;
        routeParameters['bounding_box'] = routeBoundingBox;
        routeParameters['session_id'] = sessId;

        this.callback(points, routeParameters);
		},
		route_callback: function(){
			
		}	
	}
});