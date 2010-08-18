mxn.register('{{api_id}}',{
	MapstractionRouter:{
		init:function(callback,api){
			
		},
		route: function(addresses){
			var mapstraction_router = this;
			
			// TODO: Add provider code
		},
		routePoints:function(points){
			var mapstraction_router = this;
			
			// TODO: Add provider code
		},
		route_callback: function(){
			var mapstraction_router = this;
			var mapstraction_points = [];
			var routeParameters = {};
			
			// TODO: Add provider code
			
			this.callback(mapstraction_points, routeParameters);
		}	
	}
});