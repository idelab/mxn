var yahoo = new GenericInteractivity();
yahoo.Mapstraction.iconURL = function(state){
	return this.src+"icons/yahoo/yahoo-"+state+".png";
};
mxn.register('yahoo',yahoo);