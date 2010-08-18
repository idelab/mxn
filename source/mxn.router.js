(function(){
/**
 * Initialise our provider. This function should only be called 
 * from within mapstraction code, not exposed as part of the API.
 * @private
 */
var init = function() {
	this.invoker.go('init', [ this.callback, this.api, this.error_callback ]);
};

/**
* Router instantiates a geocoder with some API choice
* @name mxn.Geocoder
* @constructor
* @param {String} api The API to use, currently only 'mapquest' is supported
* @param {Function} callback The function to call when a geocode request returns (function(waypoint))
* @param {Function} error_callback The optional function to call when a geocode request fails
* @exports Router as mxn.Router
*/
var MapstractionRouter = mxn.MapstractionRouter = function(api, callback, error_callback){
	this.api = api;
	this.callback = callback;
	this.routers = {};
	this.geocoders = {};
	this.error_callback = error_callback || function(){};
	
	// set up our invoker for calling API methods
	this.invoker = new mxn.Invoker(this, 'MapstractionRouter', function(){return this.api;});
	init.apply(this);
};

mxn.addProxyMethods(MapstractionRouter, [
  
  /**
   * Performs a routing and then calls the specified callback function with the waypoints and route
   * @param {Array} addresses The array of address objects to use for the waypoints of the route
   */
  'route',
  
  /**
  * Performs a routing and then calls the specified callback function with the waypoints and route
  * 
  * @param {Array} points The array of point/location objects to use for the route
  */
  'routePoints',
  
  /**
   * Default handler for route request completion
   */
  'route_callback'  

]);

/**
* Change the Routing API in use
* @name mxn.Router#swap
* @param {String} api The API to swap to
*/
MapstractionRouter.prototype.swap = function(api) {
  if (this.api == api) { return; }

  this.api = api;
  if (this.routers[this.api] == undefined) {
    init.apply(this);
  }
};

/**
 * Default Route error function
 */
MapstractionRouter.prototype.route_error = function(response) { 
	alert("Sorry, we were unable to route that address");
};

})();