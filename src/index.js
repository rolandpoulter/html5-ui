"use strict";


var UI = {
	conflict: (typeof UI !== 'undefined') ? UI : undefined
};


if (typeof module !== 'undefined') {
	module.exports = UI;
}


UI.noConflict = function () {

	var exports = UI;

	UI = UI.conflict;

	return exports;

};
