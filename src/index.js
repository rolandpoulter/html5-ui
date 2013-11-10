// HTML5 UI toolkit -- MIT License -- Copyright (c) 2013 Roland Poulter


"use strict";


// UI is the namespace this toolkit uses.

var UI = {
	conflict: (typeof UI !== 'undefined') ? UI : undefined,
};


// Incase this is loaded as a CommonJS module.

if (typeof module !== 'undefined') {
	module.exports = UI;
}


// Create namespace for mixin functions.

UI.mix = {};


// Make like UI was never loaded into the global namespace.

UI.noConflict = function () {

	var exports = UI;

	UI = UI.conflict;

	return exports;

};


// Create new UI components or DOM elements.

UI.create = function (definition) {

	return UI[
		typeof definition.component === 'string' ? 'obj' : 'dom'
	].create(definition);

};
