// Utilities for DOM elements.

// Reasons this library was created, instead of using jQuery or another?
// 1) Only intended to support modern browsers and jQuery is too bloated.
// 2) Other libraries were also to large or they didn't focus on the requirements.


UI.dom = {};


// Automatically converts NodeList results from querySelectorAll
// into a standard Array. Which allows standard array methods to be called.

UI.dom.query = function (selector, element) {

	element = element || document;


	var matches = element.querySelectorAll(selector);


	return Array.prototype.slice.call(matches, 0);

};


// Walks the parent nodes of an element. A matcher function
// is used to find the closest matching element.

UI.dom.closest = function (element, matcher) {

	var matched,
	    stop_at = document.body;

	// Three arguments can be passed, in this case the second
	// argument is the element to stop on, by default its the document body.
	// Then the third argument will be the matcher function.

	if (arguments.length === 3) {
		stop_at = matcher;
		matcher = arguments[2];
	}


	// Walk the parent nodes until it gets to an undefined parent,
	// or the element it should stop at.

	while (!matched) {
		// Invoke the matcher function every time, if it
		// returns a truthy value then a match has been found.

		if (matcher(element)) matched = element;

		element = element.parentNode;

		if (!element || element === stop_at) break;
	}


	return matched;

};


// Find the absolute position of an element.

UI.dom.position = function (element) {

	var x = 0, y = 0;


	do {
		x += element.offsetLeft;
		y += element.offsetTop;

	} while (element = element.offsetParent);


	return {x: x, y: y};

};


// Dispatch a DOM event for a given element. This can be used
// to simulate a standard event such as "click", or custom events.

UI.dom.trigger = function (element, event_name, event_data) {

	// Standard events are dispatched using method calls on the element.

	if (element[event_name]) {
		return element[event_name]();
	}


	// Make cancelable default to true.

	event_data = event_data || {};

	if (event_data.cancelable === undefined) {
		event_data.cancelable = true;
	}


	var event = new CustomEvent(event_name, event_data);


	element.dispatchEvent(event);


	// Returns the custom event so that event.defaultPrevented and other
	// properties can be accessed.

	return event;

};


// Create a DOM element from various inputs. Sometimes the element
// may already exist and no action should be taken.

UI.dom.create = function (element) {

	// Strings should be parsed as HTML. See UI.dom.parse() for more details.

	if (typeof element === 'string') {
		return UI.dom.parse(element);
	}


	// Any object with a nodeType is assumed to be an element. If this is
	// the case then no action should be taken and the element should be returned.

	if (element.nodeType) {
		return element;
	}

	// Sometimes, objects with element properties that have a nodeType may be
	// passed. Again, the element just needs to be returned.

	if (element.element && element.element.nodeType) {
		return element.element;
	}


	// When a component property is present an element can still be create,
	// but it has to create a new component first. All UI components have
	// elements.

	if (element.component) {
		return UI.obj.create(element).element;
	}


	// Finally, we know it is necessary to construct the element. A definition
	// object is used to to describe aspects of the new element.

	return UI.dom.construct(element);

};


// Parses an HTML string into a single DOM element, or
// a document fragment if there is more than one root element.

UI.dom.parse = function (html) {

	// Create a temporary wrapper element.

	var wrapper = document.createElement('div');

	// Parse the HTML into DOM nodes.

	wrapper.innerHTML = html;


	// Return the first child if it is the only child.

	if (wrapper.childNodes.length <= 1) {
		return wrapper.firstChild;
	}


	// Otherwise, create a document fragment which is more
	// suitable than the temporary wrapper element to use
	// as a return value.

	var fragment = document.createDocumentFragment();

	// Append each child node to the document fragment.

	Array.prototype.slice.call(wrapper.childNodes, 0).forEach(function (child) {

		fragment.appendChild(child);

	});


	return fragment;

};


// Constructs a DOM element from a definition object which
// describes all aspects of our new element.

UI.dom.construct = function (definition) {

	if (!definition) return;


	// If the definition is a string then it must be JSON.

	if (typeof definition === 'string') {
		definition = JSON.parse(definition);
	}


	// Text nodes have they're own special way of working.
	// Support for text nodes here is handy when UI.dom.children() is used.

	if (definition.tag === 'text') {
		return document.createTextNode(definition.text);
	}


	// Create a new DOM element, which by default is a "div" tag,
	// but can easily be overridden.

	var element = document.createElement(definition.tag || 'div');


	// Everything else about the element is set using UI.dom.update(). See
	// below.

	return UI.dom.update(element, definition);

};


// Helpful method for configuring aspects of a DOM element all at once.
// It can be used to add attributes, and events; to insert the element;
// create and/or append children to the element; etc.

UI.dom.update = function (element, definition) {

	if (!definition) return element;


	// DOM attributes can be set from definition.attribtes or definition.attrs.
	// If you want to set the "id" of the DOM element, do it in the attributes.

	var attributes = definition.attributes || definition.attrs;

	if (attributes) {
		UI.dom.attributes(element, attributes);
	}


	if (definition.id) {
		UI.dom.attributes(element, {id: definition.id});
	}


	// Inline styles can be applied using a string, this is done
	// before individual css attributes are applied.

	if (typeof definition.style === 'string') {
		// WARNING: This will overwrite any previous styles applied directly to the element.

		elment.style = defintion.style;
	}

	// Assigns individual css attributes to the DOM element's style
	// object.

	if (definition.css) {
		UI.dom.css(element, definition.css);
	}

	// Assigns data- attributes to the DOM element, using the dataset
	// object.

	if (definition.data) {
		UI.dom.data(element, definition.data);
	}

	// Adds class names to the DOM element, using the classList pseudo-array.

	if (definition.names) {
		UI.dom.names(element, definition.names);
	}

	if (definition.other_names) {
		UI.dom.names(element, definition.other_names);
	}


	// Sets the text content of the DOM element. Setting DOM children after this
	// won't remove the text, but setting HTML will.

	if (definition.text) {
		element.textContent = definition.text;
	}

	// Sets the HTML content of a the DOM element. Careful with this one.

	if (definition.html) {
		element.innerHTML = definition.html;
	}


	// The next three definition properties are "before", "after", and "parent".
	// You can use more than one at once, but only one, whichever is last will
	// actually be the case.

	// Inserts the DOM element just before another DOM element.

	if (definition.before) {
		UI.dom.before(element, definition.before);
	}

	// Inserts the DOM element right after another DOM element.

	if (definition.after) {
		UI.dom.after(element, definition.after);
	}

	// Inserts the DOM element at the bottom of a parent element.

	if (definition.parent) {
		UI.dom.parent(element, definition.parent);
	}


	// Populates the DOM element with children, which can be created
	// on the fly. See UI.dom.children() to learn more.

	if (definition.children) {
		UI.dom.children(element, definition.children);
	}


	// Finally, the most useful feature. Attach event listeners
	// to the DOM node. Just like nearly all of the other definition
	// properties this is non-destructive. You can only add events.
	// However, if you use UI.dom.remove() to remove the DOM element
	// any events added with UI.dom.events() will automatically be removed.

	if (definition.events) {
		UI.dom.events(element, definition.events);
	}


	return element;

};


// Assigns attributes to a DOM element. Nothing special.

UI.dom.attributes = function (element, attributes) {

	Object.keys(attributes).forEach(function (name) {
		
		element.setAttribute(name, attributes[name]);

	});

}


// Assigns css attributes to a DOM element. Boring...

UI.dom.css = function (element, css_definition) {

	Object.keys(css_definition).forEach(function (attribute) {

		// WARNING: Some css attributes require a unit of measurement to be attached.
		// other libraries add them automatically. This does NOT. It is much simpler that way.

		element.style[attribute] = css_definition[attribute];

	});

};


// Assigns data- attributes to a DOM element. This uses
// the DOM element's dataset object to accomplish this.

UI.dom.data = function (element, data_definition) {

	Object.keys(data_definition).forEach(function (property) {

		var value = data_definition[property];

		// Objects will be turned into JSON strings, otherwise
		// they can't be stored in a DOM element's dataset.

		if (typeof value === 'object') {
			value = JSON.stringify(value);
		}

		element.dataset[property] = value;

	});

};


// Adds class names to a DOM element, by using the classList
// pseudo-array.

UI.dom.names = function (element, names) {

	// If names is a string, then it is split into an array.
	// So that it will work with element.classList.add.apply(),
	// which expects names as individual arguments.

	if (typeof names === 'string') {
		names = names.split(/\s+/);
	}

	element.classList.add.apply(element.classList, names);

};


// Appends a DOM element before another one. In order for this
// to work the target element must have a parent.

UI.dom.before = function (element, before) {

	// If the value of before is a string, the it is used
	// as a selector to locate a valid DOM element.

	if (typeof before === 'string') {
		before = document.querySelector(before);
	}

	// Ensure that the before value is a DOM element, it can
	// be created on the fly this way.

	before = UI.dom.create(before);


	var parent = before.parentNode;

	if (parent && parent.insertBefore) {
		parent.insertBefore(element, before);
	}

};


// Appends a DOM element after another one.

UI.dom.after = function (element, after) {

	// Ensure there is a valid DOM element to use
	// as the which must come before the DOM element
	// that is being inserted.

	after = UI.dom.create(after);


	// DOM elements can only be inserted before another, or at the bottom
	// of a parent's children. In order to insert after, first check if
	// there is a sibling after the one to insert after. This will be the
	// element to insert before. Confusing I know.

	if (after.nextSibling) {
		return UI.dom.before(element, after.nextSibling);
	}

	// Otherwise, as previously explained, the only way to insert a DOM element,
	// after one that is the last of its siblings is to insert it at the bottom of
	// a parent's children.

	UI.dom.parent(element, after.parentNode);

};


// Appends a DOM element to a parent element. It will go to the bottom
// of the parent elements children.

UI.dom.parent = function (element, parent) {

	// If the parent value is a string then it is used as
	// a selector to locate an actual parent element.

	if (typeof parent === 'string') {
		parent = document.querySelector(parent);
	}

	// The parent element can also be an element definition
	// to be created on the fly. Which can then have a parent
	// attribute, it works recursively.

	parent = UI.dom.create(parent);


	if (parent && parent.appendChild) {
		parent.appendChild(element);
	}

};


// Creates DOM elements to be used as children of a parent element.

UI.dom.children = function (element, children) {

	children.forEach(function (child) {

		// Ensure the child is a DOM element.
		// This can also be used to create UI components.

		child = UI.dom.create(child);

		element.appendChild(child);

	});

};


// Helper for adding event listeners to a DOM element.
// It remembers the event handlers in an events property on
// the DOM element. So that they can automatically be removed.

UI.dom.events = function (element, events, use_capture) {

	// Upsert event cache on the DOM element.

	var event_cache = element.events = element.events || {capture: {}};

	// Events that initiate capture go inside a different event namespace.

	if (use_capture) {
		event_cache = event_cache.capture;
	}


	// Enumerate through the events object by event name/type.

	Object.keys(events).forEach(function (event_name) {

		// Skip capture, because it contains its own list of events.

		if (event_name === 'capture') return;


		// Upsert an array for the event name in the event cache,
		// so remembered handlers can be removed later.

		event_cache[event_name] = event_cache[event_name] || [];


		var event_handlers = events[event_name],
		    event_list = event_cache[event_name];


		// Usually, only one event listener will be attached to a given
		// event type at a time. However it is possible to assign as many
		// as needed.

		if (!Array.isArray(event_handlers)) {
			event_handlers = [event_handlers];
		}

		// Enumerate the list of event handlers, so they can be remembered,
		// and attached.

		event_handlers.forEach(function (eventHandler) {

			// Attach the event handler to listen on the DOM element events for
			// the event name/type.

			element.addEventListener(event_name, eventHandler, use_capture);

			// Remember the event handler.

			event_list.push(eventHandler);

		});

	});


	// So far, only non-capture events have been taken care of.
	// If there are capture events then we attach them in a seperate pass.

	if (!use_capture && events.capture) {
		UI.dom.events(element, events.capture, true);
	}

};


// Removes event listeners from a DOM element.

UI.dom.events.remove = function (element, events, use_capture) {

	// If the value of events is undefined, a string, or an array.
	// All events attached using UI.dom.events() will be removed for
	// each event name/type provided. When events is undefined all are
	// used.

	if (typeof events === 'string') {
		events = events.split(/\s+/);
	}

	if (!events || Array.isArray(events)) {
		return UI.dom.events.remove.all(element, events, use_capture);
	}


	// Enumerate each event name/type to only remove provided event
	// handlers.

	Object.keys(events).forEach(function (event_name) {

		UI.dom.events.remove.some(element, event_name, events[event_name], use_capture);

	});


	// Just like in UI.dom.events(), capture events are kept in a
	// seperate namespace and must be handled in another pass.

	if (!use_capture && events.capture) {
		UI.dom.events.remove(element, events.capture, use_capture);
	}

};


// Removes all events from a DOM element by a given list of event names/types.

UI.dom.events.remove.all = function (element, events, use_capture) {

	// When no events are present then our work here is done.

	if (!element.events) return;


	var event_cache = element.events;

	if (use_capture) {
		event_cache = event_cache.capture;
	}


	// If events is falsy then all events will be used.

	events = events || Object.keys(event_cache);

	events.forEach(function (event_name) {

		UI.dom.events.remove.some(element, event_name, event_cache[event_name], use_capture);

	});

};


// Actually removes event handlers from a DOM element. This is
// where it really happens.

UI.dom.events.remove.some = function (element, event_name, event_handlers, use_capture) {

	if (!event_handlers || event_name === 'capture') return;


	// Sometimes event_handlers is just a single event handler,
	// dependening on how this gets called.

	if (!Array.isArray(event_handlers)) {
		event_handlers = [event_handlers]
	}


	// Enumerate each of the event handlers to be removed.

	event_handlers.forEach(function (eventHandler) {

		// Remove the event handler so it no longer listens to events of
		// the event name/type on the DOM element.

		element.removeEventListener(event_name, eventHandler, use_capture);


		// Now, worry about forgetting the event handler because it is gone
		// now.

		var event_cache = element.events;

		if (event_cache) {
			// Capture events use a different namespace.

			if (use_capture) event_cache = event_cache.capture;


			// Get the event list from the cache of the given event name/type.
			// This is where the event handler is referenced.

			var event_list = event_cache[event_name];

			if (event_list) {
				// Find the index of the event handler in the list. So
				// it can be removed.

				var index = event_list.indexOf(eventHandler);

				// In order to remove a value from an array without leaving
				// a whole you have to use splice.

				if (index !== -1) {
					event_list.splice(index, 1);
				}
			}
		}

	});

};


// Removes a DOM element and all of its children from their parents.
// Any events attached using UI.dom.events() will also be removed.

UI.dom.remove = function (element) {

	UI.dom.events.remove(element);


	if (element.parentNode) {
		element.parentNode.removeChild(element);
	}


	// Recursively, remove all children and their children.

	Array.prototype.slice.call(element.childNodes, 0).forEach(UI.dom.remove);

};
