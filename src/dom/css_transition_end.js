UI.dom.getTransitionEndEventName = function () {

	var self = UI.dom.getTransitionEndEventName;

	if (self.result) {
		return self.result;
	}


	var tranistion_element = document.createElement('transition');

	var transition_end_event_names = {
		'WebkitTransition': 'webkitTransitionEnd',
		'MozTransition'   : 'transitionend',
		'OTransition'     : 'oTransitionEnd otransitionend',
		'transition'      : 'transitionend'
	}


	for (var name in transition_end_event_names) {

		if (tranistion_element.style[name] !== undefined) {
			return self.result = transition_end_event_names[name];
		}

	}


	return self.result = 'transitionend';

};


UI.dom.emulateTransitionEnd = function (element, duration) {

	var called = false,
	    event_name = UI.dom.getTransitionEndEventName(),
	    temp_events = {};


	temp_events[event_name] = function () {

		UI.dom.events.remove(element, temp_events);

		called = true;

	};


	UI.dom.events(element, temp_events);


	setTimeout(callback, duration || 1000);

	function callback () {

		if (!called) UI.dom.trigger(element, event_name);

	}

};


UI.dom.onceTransitionEnd = function (element, duration, callback) {

	if (!callback) return;


	var transition_events = {};

	transition_events[UI.dom.getTransitionEndEventName()] = function (event) {

		UI.dom.events.remove(element, transition_events);

		callback(event);

	};

	UI.dom.events(element, transition_events);

	UI.dom.emulateTransitionEnd(element, duration);

};
