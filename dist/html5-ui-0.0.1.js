// HTML5 UI toolkit -- MIT License -- Copyright (c) 2013 Roland Poulter


"use strict";


// UI is the namespace this toolkit uses.

var UI = {
	conflict: (typeof UI !== 'undefined') ? UI : undefined
};


// Incase this is loaded as a CommonJS module.

if (typeof module !== 'undefined') {
	module.exports = UI;
}


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

// Utilities for JavaScript objects/classes.

// Why this library is necessary, instead of using an off the shelf class framework?
// 1) A solid mixin procedure is always needed. Why isn't this standardized yet?
// 2) Only wanted support for modern browsers.
// 3) Other class libraries are always too fancy, complicated, or absurd.
// 4) Just needed handy helper methods over classic prototype based classes.
// 5) Really, when you strip out all the comments and whitespace there isn't much too it.
//    The mixin function is more code then everything else, practically.


UI.obj = {};


// Creates a new instance of a UI component, based on
// definition.component string.

UI.obj.create = function (definition) {

	var ComponentConstructor = UI[definition.component];

	if (!ComponentConstructor) {
		throw new Error('Missing component: ' + definition.component);
	}


	return new ComponentConstructor(definition);

};


// Defines a new UI component class, which is then assigned
// to UI by its class_name.

UI.obj.declare = function (class_name, decorator){

	return UI[class_name] = UI.obj.define.apply(this, arguments);

};


// Creates a UI component class. Returns the contructor.
// Class methods and properties are assigned to the component prototype
// with a decorator function. Eval is used to give the constructor a class_name.

UI.obj.define = function (class_name, decorator) {

	var initialize = UI.obj.initialize;


	// In JavaScript functions don't have names, except when you give them on
	// when using the literal syntax. Afterwords the name property is immutable.
	// Eval is used to ensure the Contructor has a name. This is important, because
	// it makes it easier to determine the class_name of an instance. Handy when
	// debugging or doing type checking.

	var Constructor = eval(
		'(function ' + class_name + ' (options) { initialize(this, options); })'
	);

	// A more useful toString for UI component class constructors.
	// This sort of makes ensuring Contructors are given a name, but providing
	// a name this way is unconventional.

	Constructor.toString = UI.obj.define.toString;


	// Allows inheritance of another constructor function in JavaScript. In most
	// cases it is best to avoid using inheritance, but still useful when needed.

	if (arguments.length === 3) {
		var Super = decorator;

		Constructor.prototype = Object.create(Super.prototype || Super, {
			constructor: {value: Constructor}
		});

		decorator = arguments[2];
	}


	// Decorates the prototype using a function which is how methods, and
	// properties should be assigned to a class. Why? Because it forces the
	// module pattern. Except that it uses it on a prototype which provides the
	// efficiency of prototypes in JavaScript. However one could always use the
	// decorator after the fact on objects they wish to make behave like the 
	// contructor based version.

	/* Example: 

		var myObj = {};

		UI.MyFirstClass.prototype.decorator.call(myObj);
		UI.MyOtherClass.prototype.decorator.call(myObj);

		var options = {};

		UI.obj.initialize(myObj, options);

	*/

	UI.obj.decorate(Constructor.prototype, decorator);


	return Constructor;

};

// The toString method for UI component constructor functions.
// Should return the class_name.

UI.obj.define.toString = function () {

	return this.name;

};


// Assignes a decorator function to an object and then invokes it.
// Pretty simple.

UI.obj.decorate = function (entity, decorator) {

	entity.decorator = decorator;

	entity.decorator(entity);

};


// All UI component classes adhere to this initializer. It takes
// a context or the instance object, and an options object. No
// other arguments are supported.

UI.obj.initialize = function (context, options) {

	// Mixin the options object and any default options from the context
	// into a new options object assigned to the context.

	context.options = UI.obj.mixin({element: {}}, context.default_options, options);

	// Creates a dom element from options.element. See UI.dom.create() for more details.

	context.element = context.element || UI.dom.create(context.options.element);


	// Provides a couple default methods for updating or removing
	// the element on the context.

	context.updateElement = UI.obj.create.update;

	context.removeElement = UI.obj.create.remove;


	// Safely invoke an initialize method specific to the context,
	// most likely defined by the class of the context.

	if (context.initialize) context.initialize();

};

// Updates the main element of an object. See UI.dom.update().

UI.obj.create.update = function (definition) {

	return UI.dom.update(this.element, definition);

};

// Removes the main element of an object. See UI.dom.remove() if you care.

UI.obj.create.remove = function () {

	return UI.dom.remove(this.element);

};


// Generic object mixin procedure. Takes as many supplier object as needed.
// Please be careful not to pass a cyclical object, or there will be a 
// stack overflow.

UI.obj.mixin = function (receiver) {

	// Slice off a list of supplier objects to mix into the receiver object.

	var suppliers = Array.prototype.slice.call(arguments, 1),
	    toString = Object.prototype.toString;

	// Enumerate each supplier object one at a time for mixin.

	suppliers.forEach(function (supplier) {

		if (!supplier) return;

		// Enumerates the keys of a supplier object so their values
		// can be assigned to the supplier.

		Object.keys(supplier).forEach(function (property) {

			if (supplier[property]) {
				// Check if the value of the supplier's property is an object,
				// and not a custom object, meaning it is only an instance of Object.

				if (supplier[property].constructor === Object) {
					// Ensure that we have a reveiver value to recursively mixin too.

					receiver[property] = receiver[property] || {};

					// Recursively mixin nested supplier objects into nested receiver objects.

					return UI.obj.mixin(receiver[property], supplier[property]);
				}

				// Allow objects to have a custom mixinTo method.

				if (supplier[property].mixinTo) {
					receiver[property] = receiver[property] || {};

					return supplier[property].mixinTo(receiver[property]);
				}
			}

			// Otherwise, we can safely assume that the supplier value
			// can overwrite any possible receiver value. Do so using
			// Object.defineProperty incase we're dealing with getters and setters.

			Object.defineProperty(
				receiver,
				property,
				Object.getOwnPropertyDescriptor(supplier, property)
			);

		});

	});


	return receiver;

};

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

UI.obj.declare('Menu', function () {

	this.default_options = {
		element: {
			names: 'dropdown',
			children: [{
				tag: 'ul',
				names: 'dropdown-menu',
				attrs: {role: 'menu'}
			}]
		}
	};


	this.initialize = function () {

		this.menu_element = this.element.firstChild;


		var options = this.options.options;

		if (options) {
			options.forEach(this.addOption.bind(this));
		}


		UI.dom.events(this.element, {
			mousedown: function (event) {event.stopPropagation();},
			click: this.hideAll.bind(this)
		});


		this.setupToggle(this.options.toggle || {});

	};


	this.addOption = function (params) {

		if (params && params.divider) {
			return this.addDivider();
		}


		return this.constructMenuItem(params);

	};


	this.addDivider = function () {

		return UI.dom.construct({
			parent: this.menu_element,
			names: 'divider',
			attrs: {role: 'presentation'},
			tag: 'li'
		});

	};


	this.constructMenuItem = function (params) {

		if (params.action && !params.children) {
			params.children = [params.action];

			var action = params.action,
			    attrs = action.attributes || action.attrs;

			action.tag = action.tag || 'a';

			if (!attrs) attrs = action.attrs = {};

			attrs.href = attrs.href || '#';

			attrs.role = 'menuitem';

			attrs.tabindex =  '-1';

			delete params.action;
		}


		return UI.dom.construct(UI.obj.mixin({
			parent: this.menu_element,
			attrs: {role: 'presentation'},
			tag: 'li'
		}, params));

	};


	this.setupToggle = function (element) {

		this.toggle_element = UI.dom.create(element);


		this.toggle_element.menu = this;


		UI.dom.update(this.toggle_element, {
			data: {toggle: 'dropdown'},
			names: 'dropdown-toggle',
			events: {click: this.onToggle.bind(this)},
			before: this.menu_element
		});

	};


	this.setupAutoHide = function () {

		this.auto_hide_events = this.auto_hide_events || {
			mousedown: this.hideAll.bind(this)
		};


		UI.dom.events(document, this.auto_hide_events);

	};


	this.removeAutoHide = function () {

		UI.dom.events.remove(document, this.auto_hide_events);

	};


	this.setupKeydown = function () {

		this.keydown_events = this.keydown_events || {
			keydown: this.onKeydown.bind(this)
		};


		UI.dom.events(document, this.keydown_events);

	};


	this.removeKeydown = function () {

		UI.dom.events.remove(document, this.keydown_events);

	};


	Object.defineProperty(this, 'isActive', {
		get: function () {

			return this.element.classList.contains('open');

		}
	});


	Object.defineProperty(this, 'isDisabled', {
		get: function () {

			return this.element.classList.contains('disabled') || this.element.disabled;

		}
	});


	this.hideAll = function () {

		var all_toggle_elements = UI.dom.query('[data-toggle=dropdown]');

		all_toggle_elements.forEach(function (toggle_element) {

			var menu = toggle_element.menu;

			if (menu) menu.hide();

		});

	};


	this.hide = function () {

		if (!this.isActive) return;


		var event = UI.dom.trigger(this.element, 'hide');

		if (event.defaultPrevented) return;


		this.element.classList.remove('open');

		this.removeAutoHide();

		this.removeKeydown();


		UI.dom.trigger(this.element, 'hidden');

	};


	this.show = function () {

		var event = UI.dom.trigger(this.element, 'show');

		if (event.defaultPrevented) return;


		this.element.classList.add('open');

		this.setupAutoHide();

		this.setupKeydown();


		UI.dom.trigger(this.element, 'shown');


		if (this.toggle_element) {
			this.toggle_element.focus();
		}

	};


	this.onToggle = function (event) {

		if (this.isDisabled) return;

		var isActive = this.isActive;


		this.hideAll();


		if (!isActive) {
			event.stopPropagation();

			this.show();
		}


		event.preventDefault();

		return false;

	};


	this.onKeydown = function (event) {

		if ([38, 40, 27, 13].indexOf(event.keyCode) === -1) return;


		event.preventDefault();

		event.stopPropagation();


		if (this.isDisabled) return;


		var isActive = this.isActive;

		if (!isActive || (isActive && event.keyCode === 27)) {
			if (event.which === 27) {
				UI.dom.trigger(this.toggle_element, 'click');

				this.toggle_element.focus();
			}

			return UI.dom.trigger(this.element, 'click');
		}


		var items = UI.dom.query('[role=menu] li:not(.divider) a', this.element);

		if (!items.length) return;


		var selected = this.element.querySelector('li a:focus'),
		    index = items.indexOf(selected),
		    end = items.length - 1;


		if (event.keyCode === 13) {
			return UI.dom.trigger(selected, 'click');
		}

		if (event.keyCode == 38 && index > 0)   index--; // Up

		if (event.keyCode == 40 && index < end) index++; // Down

		if (index === -1) index = 0;


		items[index].focus();

	};

});

UI.obj.declare('AutoComplete', function () {

	this.default_options = {};

});

UI.obj.declare('Button', function () {

	this.default_options = {
		element: {
			tag: 'button',
			names: 'btn btn-default',
			attrs: {type: 'button'}
		}
	};


	Object.defineProperty(this, 'isInput', {
		get: function () {

			return this.element.tagName.toLowerCase() === 'input';

		}
	});


	Object.defineProperty(this, 'value', {
		enumerable: true,

		get: function (value) {

			if (this.isInput) {
				return this.element.getAttribute('value');
			}


			return this.element.textContent;

		},

		set: function (value) {

			if (this.isInput) {
				this.element.setAttribute('value', value);
			}

			else {
				this.element.textContent = value;
			}

		}
	});


	Object.defineProperty(this, 'state', {
		enumerable: true,

		get: function () {

			return this._state_;

		},

		set: function (state) {

			this._state_ = state;

			var data_state_attr = state + 'Text';

			if (!this.element.dataset.resetText) {
				this.element.dataset.resetText = this.value;
			}

			this.value = this.element.dataset[data_state_attr] || this.options[data_state_attr];

			setTimeout(this.updateState.bind(this), 0);

		}
	});


	this.updateState = function () {

		if (this.state === 'loading') {
			this.disable()
		}

		else {
			this.enable();
		}

	};


	this.disable = function () {

		this.element.classList.add('disabled');

		this.element.setAttribute('disabled', 'disabled');

	};


	this.enable = function () {

		this.element.classList.remove('disabled');

		this.element.removeAttribute('disabled');

	};


	this.toggle = function () {

		this.handleGroupedButtonToggles();

		this.element.classList.toggle('active');

	};


	this.handleGroupedButtonToggles = function () {

		var button_group_parent = UI.dom.closest(
			this.element,
			this.buttonGroupParentCheck.bind(this)
		);

		if (!button_group_parent) return;

		
		var button_input = this.element.querySelector('input');

		if (!button_input) return;


		var checked = (button_input.getAttribute('checked') === 'checked') ?
			'' :
			'checked';

		button_input.setAttribute('checked', checked);

		UI.dom.trigger(button_input, 'change');


		if (button_input.getAttribute('type') !== 'radio') return;

		var button_siblings = UI.dom.query('.active', buttonGroupParent);

		button_siblings.forEach(this.deactivateSibling.bind(this));

	};


	this.buttonGroupParentCheck = function (element) {

		return element.dataset.toggle === 'buttons';

	};


	this.deactivateSibling = function (sibling) {

		sibling.classList.remove('active');

	};

});

UI.obj.declare('ContextMenu', UI.Menu, function () {

	var super_initialize = this.initialize;

	this.initialize = function () {

		super_initialize.call(this)


		if (this.options.context) {
			this.setupContext(this.options.context);
		}

		UI.dom.events(this.element, {
			hide: this.close.bind(this)
		});

	};


	this.setupContext = function (context_element) {

		if (this.context_element) this.removeContext();

		this.context_element = context_element;

		this.context_events = this.context_events || {
			contextmenu: this.open.bind(this)
		};

		UI.dom.events(this.context_element, this.context_events);

	};


	this.removeContext = function () {

		if (!this.context_element) return;


		UI.dom.events.remove(this.context_element, this.context_events);


		delete this.context_events;

		delete this.context_element;

	};


	this.open = function (event) {

		this.hideAll();

		UI.dom.css(this.menu_element, {
			top: event.pageY + 'px',
			left: event.pageX + 'px'
		});


		this.show();


		event.stopPropagation();

		event.preventDefault();

	};

	this.close = function () {

		if (this.options.temporary) {
			this.removeContext();

			this.removeElement();
		}

	};

});

UI.obj.declare('Dialog', function () {

	this.default_options = {
		element: {
			names: 'modal-dialog',
			children: [
				{names: 'modal-content', children: [
					{names: 'modal-header'},
					{names: 'modal-body'},
					{names: 'modal-footer'}
				]}
			]	
		},
		show: true
	};


	this.initialize = function () {

		this.header_element = this.element.querySelector('.modal-header');

		this.body_element = this.element.querySelector('.modal-body');

		this.footer_element = this.element.querySelector('.modal-footer');


		this.setupHeader();

		this.setupBody();

		this.setupFooter();


		UI.dom.events(this.element, {
			click: this.onClickDismissCheck.bind(this)
		});


		if (!this.options.show) {
			this.hide();
		}

	};


	this.setupHeader = function () {

		if (this.options.close) {
			UI.dom.create({
				parent: this.header_element,
				names: 'close',
				data: {dismiss: 'modal'},
				html: '&times;',
				tag: 'button'
			});
		}

		if (this.options.title) {
			UI.dom.create({
				parent: this.header_element,
				names: 'modal-title',
				text: this.options.title,
				tag: this.options.title_tag || 'h4'
			});
		}

	};


	this.setupBody = function (params) {

		UI.dom.update(this.body_element, this.options.body);

	};


	this.setupFooter = function (params) {

		if (Array.isArray(this.options.actions)) {
			this.options.actions.forEach(function (dialog_action) {

				UI.dom.create(UI.obj.mixin(
					{
						tag: 'button',
						names: 'btn btn-default',
						parent: this.footer_element
					},
					dialog_action
				));

			}.bind(this));
		}

	};


	this.onClickDismissCheck = function (event) {

		var dismiss_element = UI.dom.closest(event.target, this.element, function (element) {

			return element.dataset.dismiss === 'modal';

		});


		if (dismiss_element) {
			var dismiss_event = UI.dom.trigger(this.element, 'dismiss');

			if (!dismiss_event.defaultPrevented) {
				this.hide(event);
			}
		}

	};


	this.show = function () {

		this.element.style.display = 'block';

	};


	this.hide = function () {

		this.element.style.display = 'none';

	};

});

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

UI.obj.declare('FileList', function () {

	this.default_options = {};

});

UI.obj.declare('GhostDom', function () {

	this.default_options = {};

});

UI.obj.declare('Layout', function () {

	this.default_options = {};

});

UI.obj.declare('Modal', function () {

	this.default_options = {
		element: {
			names: 'modal'
		},
		backdrop_parent: null,
		backdrop: true,
		keyboard: true,
		show: true,
		fade: true
	};

	this.initialize = function () {

		this.options.backdrop_parent =
			this.options.backdrop_parent || document.body;

		if (this.options.fade) {
			this.element.classList.add('fade');
		}


		if (typeof this.options.dialog === 'object') {
			var dialog_options = this.options.dialog;

			dialog_options.element = dialog_options.element || {};

			dialog_options.element.parent = this.element;

			dialog_options.modal = this;


			this.dialog = new UI.Dialog(dialog_options);
		}


		if (this.options.show) {
			this.show();
		}

		if (this.options.toggle) {
			this.setupToggle(this.options.toggle);
		}


		UI.dom.events(this.element, this.click_events = this.click_events || {
			click: this.hide.bind(this)
		});

	};


	this.setupToggle = function (toggle_element) {

		toggle_element = UI.dom.create(toggle_element);


		toggle_element.modal = this;


		UI.dom.update(toggle_element, {
			data: {toggle: 'modal'},
			events: {click: this.show.bind(this)}
		});

	};


	this.toggle = function (event, _related_target) {

		return this[this.isShown ? 'hide' : 'show'](event, _related_target);

	};


	Object.defineProperty(this, 'hasFade', {
		get: function () {

			return this.element.classList.contains('fade');

		}
	});


	this.show = function (event, _related_target) {

		if (event && event.defaultPrevented) return;

		var show_event = UI.dom.trigger(this.element, 'show', {
			relatedTarget: _related_target
		});


		if (this.isShown || show_event.defaultPrevented) return;


		this.isShown = true;

		this.escape();


		this.backdrop(function () {

			this.options.backdrop_parent.appendChild(this.element);


			this.element.style.display = 'block';


			if (this.dialog) {
				this.dialog.show();
			}


			if (this.hasFade) {
			  // Force a reflow.

				this.element.offsetWidth;
			}


			this.element.classList.add('in');

			this.element.setAttribute('aria-hidden', false);

			this.enforceFocus();

			
			if (this.hasFade) {
				UI.dom.onceTransitionEnd(this.element, 300, trigger_shown.bind(this));
			}

			else {
				trigger_shown.call(this);
			}


			function trigger_shown () {

				this.element.focus();

				UI.dom.trigger(this.element, 'shown', {
					relatedTarget: _related_target
				});

			}

		}.bind(this));

	};


	this.hide = function (event) {

		if (event) event.preventDefault();


		var hide_event = UI.dom.trigger(this.element, 'hide');

		if (!this.isShown || hide_event.defaultPrevented) return;


		this.isShown = false;

		this.escape();


		UI.dom.events.remove(document, this.focusin_events);


		this.element.classList.remove('in');

		this.element.setAttribute('aria-hidden', true);


		if (this.dialog) {
			UI.dom.events.remove(this.dialog.element, this.dialog_events);
		}


		if (this.hasFade) {
			UI.dom.onceTransitionEnd(this.backdrop_element, 300, this.hideModal.bind(this));
		}

		else {
			this.hideModal();
		}

	};


	this.enforceFocus = function () {

		this.focusin_events = this.focusin_events || {
			focusin: function (event) {

				var dont_refocus = UI.dom.closest(event.target, function (element) {

					return element === this.element;

				}.bind(this));


				if (!dont_refocus) {
					this.element.focus();
				}

			}.bind(this)
		};


		UI.dom.events(document, this.focusin_events);

	};


	this.escape = function () {

		if (this.isShown && this.options.keyboard) {
			UI.dom.events(document, this.keyup_events = this.keyup_events || {
				keyup: function (event) {

					if (event.which === 27) this.hide();

				}.bind(this)
			});
		}

		else if (!this.isShown) {
			UI.dom.events.remove(document, this.keyup_events);
		}

	};


	this.hideModal = function () {

		this.element.style.display = 'none';

		this.backdrop(function () {

			this.removeBackdrop();

			UI.dom.trigger(this.element, 'hidden');

		}.bind(this));

	};


	this.removeBackdrop = function () {

		UI.dom.remove(this.backdrop_element)

		delete this.backdrop_element;

	};


	this.backdrop = function (callback) {

		var animate = this.hasFade ? ' fade' : '';

		if (this.isShown && this.options.backdrop) {
			this.backdrop_element = UI.dom.create({
				parent: this.options.backdrop_parent,
				names: 'modal-backdrop' + animate
			});


			if (this.dialog) {
				UI.dom.events(this.dialog.element, this.dialog_events = this.dialog_events || {
					click: function (event) {

						event.stopPropagation();

					},

					dismiss: function (event) {

						if (event.target !== event.currentTarget) return;


						event.preventDefault();


						if (this.options.backdrop === 'static') {
							this.element.focus();
						}

						else {
							this.hide();
						}

					}.bind(this)
				});
			}

			if (this.hasFade) {
				this.backdrop_element.offsetWidth; // force reflow
			}

			this.backdrop_element.classList.add('in');

			if (this.hasFade) {
				UI.dom.onceTransitionEnd(this.backdrop_element, 300, callback);
			}

			else if (callback) {
				callback();
			}
		}

		else if (!this.isShown && this.backdrop_element) {debugger;
			this.backdrop_element.classList.remove('in');

			if (this.hasFade) {
				UI.dom.onceTransitionEnd(this.backdrop_element, 300, callback);
			}

			else if (callback) {
				callback();
			}
		}

		else if (callback) {
			callback();
		}

	};

});

UI.obj.declare('Tab', function () {

	this.default_options = {
		element: {
			parent: {
				tag: 'li'
			},
			attrs: {href: '#'},
			data: {toggle: 'tab'},
			tag: 'a'
		},
		pane: {},
		fade: true
	};


	this.initialize = function () {

		this.list_item_element = this.element.parentNode;


		UI.dom.events(this.element, {
			click: this.show.bind(this)
		});


		this.pane_element = UI.dom.create({
			names: 'tab-pane'
		}, this.options.pane);


		if (this.options.fade) {
			this.pane_element.classList.add('pane');
		}

	};


	this.setParentList = function (tab_list) {

		if (this.parent) {
			this.parent.removeTab(this);
		}


		tab_list.element.appendChild(this.list_item_element);

		tab_list.pane_container_element.appendChild(this.pane_element);


		this.parent = tab_list;

	};


	Object.defineProperty(this, 'isActive', {
		get: function () {

			return this.list_item_element.classList.contains('active');

		}
	});


	Object.defineProperty(this, 'hasFade', {
		get: function () {

			return this.pane_element.classList.contains('fade');

		}
	});


	this.show = function () {

		if (!this.parent || this.isActive) return;


		var active = this.parent.active;


		var event_details = {
			relatedTarget: active && active.element
		};


		var show_event = UI.dom.trigger(this.element, 'show', event_details);


		if (show_event.defaultPrevented) return;


		this.activate(function () {

			UI.dom.trigger(this.element, 'shown', event_details);

		}.bind(this));

	};


	this.activate = function (callback) {

		if (!this.parent || this.isActive) return;


		var active = this.parent.active;

		if (active) {
			active.list_item_element.classList.remove('active');

			if (active.hasFade) {
				active.pane_element.classList.remove('in');

				UI.dom.onceTransitionEnd(active.pane_element, 150, activate_tab.bind(this));
			}

			else {
				activate_tab.call(this);
			}
		}

		else {
			activate_tab.call(this);
		}


		function activate_tab () {

			this.parent.active = this;

			this.list_item_element.classList.add('active');


			if (this.hasFade) {
				this.element.offsetWidth; // reflow for transition

				this.pane_element.classList.add('in');
			}

			else if (callback) {
				callback();
			}

		}

	};

});

UI.obj.declare('TabList', function () {

	this.default_options = {
		element: {
			tag: 'ul',
			names: 'nav nav-tabs'
		}
	};


	this.initialize = function () {

		this.tabs = [];


		this.pane_container_element = UI.dom.create(UI.obj.mixin({
			names: 'tab-content',
			parent: this.element.parentNode
		}, this.options.pane_container));


		if (this.options.tabs) {
			this.options.tabs.forEach(this.addTab.bind(this));
		}


		if (this.tabs.length) {
			this.tabs[0].show();
		}

	};


	this.addTab = function (tab_definition) {

		// TODO: support dropdown menus in tab list.

		var tab = (tab_definition instanceof UI.Tab) ?
			tab_definition : new UI.Tab(tab_definition);


		if (this.tabs.indexOf(tab) === -1) {
			tab.setParentList(this);

			this.tabs.push(tab);
		}


		return tab;

	};


	this.removeTab = function (tab) {

		var index = this.tabs.indexOf(tab);

		if (index !== -1) {
			this.element.removeChild(tab.list_item_element);

			this.pane_container_element.removeChild(tab.pane_element);


			delete tab.parent;


			this.tabs.splice(index, 1);
		}

	};

});

UI.obj.declare('Tooltip', function () {

	this.default_options = {};

});
