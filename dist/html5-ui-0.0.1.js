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

// Utilities for objects.

UI.obj = {};


UI.obj.create = function (definition) {

	var ComponentConstructor = UI[definition.component];

	if (!ComponentConstructor) {
		throw new Error('Missing component: ' + definition.component);
	}


	return new ComponentConstructor(definition);

};


UI.obj.declare = function (class_name, decorator){

	return UI[class_name] = UI.obj.define(class_name, decorator);

};


UI.obj.define = function (class_name, decorator) {

	var initialize = UI.obj.initialize;


	var Constructor = eval(
		'(function ' + class_name + ' (options) { initialize(this, options); })'
	);


	Constructor.toString = UI.obj.define.toString;


	if (arguments.length === 3) {
		var beforeDecorator = decorator;

		beforeDecorator(Constructor);

		decorator = arguments[2];
	}


	UI.obj.decorate(Constructor.prototype, decorator);


	return Constructor;

};

UI.obj.define.toString = function () {

	return this.name;

};


UI.obj.decorate = function (entity, decorator) {

	entity.decorator = decorator;

	entity.decorator(entity);

};


UI.obj.initialize = function (context, options) {

	context.options = UI.obj.mixin({}, context.default_options, options);

	context.element = context.element || UI.dom.create(context.options.element);


	context.updateElement = UI.obj.create.update;

	context.removeElement = UI.obj.create.remove;


	if (context.initialize) context.initialize();

};


UI.obj.create.update = function (definition) {

	return UI.dom.update(this, definition);

};

UI.obj.create.remove = function () {

	return UI.dom.remove(this);

};


UI.obj.mixin = function (receiver) {

	var suppliers = Array.prototype.slice.call(arguments, 1),
	    toString = Object.prototype.toString;

	suppliers.forEach(function (supplier) {

		if (!supplier) return;


		Object.keys(supplier).forEach(function (property) {

			if (toString.call(supplier[property]) === '[object Object]') {
				if (typeof receiver[property] === 'undefined') {
					receiver[property] = {};
				}

				UI.obj.mixin(receiver[property], supplier[property]);
			}

			else {
				Object.defineProperty(
					receiver,
					property,
					Object.getOwnPropertyDescriptor(supplier, property)
				);
			}

		});

	});


	return receiver;

};


// Utilities for dom elements.

UI.dom = {};


UI.dom.closest = function (element, matcher) {

	var matched;


	while (!matched) {
		if (matcher(parent)) matched = parent;

		element = element.parentNode;

		if (!element) break;
	}


	return matched;

};


UI.dom.trigger = function (element, event_name, event_data) {

	var event = event_data ?
		new CustomEvent(event_name, event_data) :
		new Event(event_name);


	element.dispatchEvent(event);

};


UI.dom.create = function (element) {

	if (typeof element === 'string') {
		return UI.dom.parse(element);
	}


	if (element && element.nodeType) {
		return element;
	}

	if (element.element && element.element.nodeType) {
		return element.element;
	}


	if (element.component) {
		return UI.obj.create(element).element;
	}


	return UI.dom.construct(element);

};


UI.dom.parse = function (html) {

	var wrapper = document.createElement('div');

	wrapper.innerHTML = html;


	if (wrapper.childNodes.length <= 1) {
		return wrapper.childNodes[0];
	}


	var fragment = document.createDocumentFragment();

	wrapper.childNodes.forEach(function (child) {

		fragment.appendChild(child);

	});


	return fragment;

};


UI.dom.construct = function (definition) {

	if (!definition) return;


	if (typeof definition === 'string') {
		definition = JSON.parse(definition);
	}


	var element = document.createElement(definition.tag || 'div');


	return UI.dom.update(element, definition);

};


UI.dom.update = function (element, definition) {

	var attributes = definition.attributes || definition.attrs;

	if (attributes) {
		UI.dom.attributes(element, attributes);
	}

	if (definition.style) {
		elment.style = defintion.style;
	}

	if (definition.css) {
		UI.dom.css(element, definition.css);
	}

	if (definition.data) {
		UI.dom.data(element, definition.data);
	}

	if (definition.names) {
		UI.dom.names(element, definition.names);
	}

	if (definition.text) {
		element.textContent = definition.text;
	}

	if (definition.html) {
		element.innerHTML = definition.html;
	}

	if (definition.parent) {
		UI.dom.parent(element, definition.parent);
	}

	if (definition.children) {
		UI.dom.children(element, definition.children);
	}

	if (definition.events) {
		UI.dom.events(element, definition.events);
	}


	return element;

};


UI.dom.attributes = function (element, attributes) {

	Object.keys(attributes).forEach(function (name) {
		
		element.setAttribute(name, attributes[name]);

	});

}


UI.dom.css = function (element, css_definition) {

	Object.keys(css_definition).forEach(function (attribute) {

		element.style[attribute] = css_definition[attribute];

	});

};


UI.dom.data = function (element, data_definition) {

	Object.keys(data_definition).forEach(function (property) {

		var value = data_definition[property];

		if (typeof value === 'object') {
			value = JSON.stringify(value);
		}

		element.dataset[property] = value;

	});

};


UI.dom.names = function (element, names) {

	if (typeof names === 'string') {
		names = names.split(/\s+/);
	}

	element.classList.add.apply(element.classList, names);

};


UI.dom.parent = function (element, parent) {

	if (typeof parent === 'string') {
		parent = document.querySelector(parent);
	}

	if (parent && parent.appendChild) {
		parent.appendChild(element);
	}

};


UI.dom.children = function (element, children) {

	children.forEach(function (child) {

		child = UI.dom.create(child);

		element.appendChild(child);

	});

};


UI.dom.events = function (element, events, use_capture) {

	var event_cache = element.events = element.events || {capture: {}};

	if (use_capture) {
		event_cache = event_cache.capture;
	}


	Object.keys(events).forEach(function (event_name) {

		if (event_name === 'capture') return;


		var eventHandler = events[event_name];

		element.addEventListener(event_name, eventHandler, use_capture);


		event_cache[event_name] = event_cache[event_name] || [];

		event_cache[event_name].push(eventHandler);

	});


	if (!use_capture && events.capture) {
		UI.dom.events(element, events.capture, true);
	}

};


UI.dom.events.remove = function (element, events, use_capture) {

	if (!events || Array.isArray(events)) {
		return UI.dom.events.remove.all(element, events, use_capture);
	}


	Object.keys(events).forEach(function (event_name) {

		UI.dom.events.remove.some(element, events[event_name], use_capture);

	});


	if (!use_capture && events.capture) {
		UI.dom.events.remove(element, events.capture, use_capture);
	}

};


UI.dom.events.remove.all = function (element, events, use_capture) {

	if (!element.events) return;


	var event_cache = element.events;

	if (use_capture) {
		event_cache = event_cache.capture;
	}


	events = events || Object.keys(event_cache);

	events.forEach(function (event_name) {

		UI.dom.events.remove.some(element, event_cache[event_name], use_capture);

	});

};


UI.dom.events.remove.some = function (element, event_handlers, use_capture) {

	if (!event_handlers) return;


	event_handlers.forEach(function (eventHandler) {

		element.removeEventListener(event_name, eventHandler, use_capture);

	});

};


UI.dom.remove = function (element) {

	UI.dom.events.remove(element);


	if (element.parentNode) {
		element.parentNode.removeChild(element);
	}


	element.childNodes.forEach(UI.dom.remove);

};


UI.obj.declare('AutoComplete', function () {

	this.default_options = {};

});

UI.obj.declare('Button', function () {

	this.default_options = {
		loadingText: 'loading...',

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

			var dataStateAttr = state + 'Text';

			if (!this.element.dataset.resetText) {
				this.element.dataset.resetText = this.value;
			}

			this.value = this.element.dataset[dataStateAttr] || this.options[dataStateAttr];

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

		var buttonGroupParent = this.utils.closest(
			this.element,
			this.buttonGroupParentCheck.bind(this)
		);

		if (!buttonGroupParent) return;

		
		var buttonInput = this.element.querySelector('input');

		if (!buttonInput) return;


		var checked = (buttonInput.getAttribute('checked') === 'checked') ?
			'' :
			'checked';

		buttonInput.setAttribute('checked', checked);

		this.utils.trigger(buttonInput, 'change');


		if (buttonInput.getAttribute('type') !== 'radio') return;

		var buttonSiblings = buttonGroupParent.querySelectorAll( '.active');

		buttonSiblings.forEach(this.deactivateSibling.bind(this));

	};


	this.buttonGroupParentCheck = function (element) {

		return element.dataset.toggle === 'buttons';

	};


	this.deactivateSibling = function (sibling) {

		sibling.classList.remove('active');

	};

});

UI.obj.declare('ContextMenu', function () {

	this.default_options = {};


	this.setupEvents = function () {

		this.element.addEventListener('keydown', this.onKeyDown.bind(this));

	};

	this.removeEvents = function () {

		this.element.removeEventListener('keydown', this.onKeyDown);

	};


	this.onKeyDown = function (event) {

		event;

	};

});

UI.obj.declare('GhostDom', function () {

	this.default_options = {};

});

UI.obj.declare('Layout', function () {

	this.default_options = {};

});

UI.obj.declare('Menu', function () {

	this.constructor.id = this.constructor.id || 0;


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

		this.id = this.constructor.id++;

		this.menu_element = this.element.firstChild;


		UI.dom.update(this.menu_element, {
			attrs: {'aria-labelledby': 'dropdownMenu' + this.id}
		});


		var options = this.options.options;

		if (!options) return;


		options.forEach(function (params) {

			this.addOption(params);

		}.bind(this));

	};


	this.addOption = function (params) {

		if (params && params.divider) {
			return this.addDivider();
		}


		if (params.action && !params.children) {
			params.children = [params.action];

			delete params.action;
		}

		UI.dom.construct(UI.obj.mixin({
			parent: this.menu_element,
			attrs: {role: 'presentation'},
			tag: 'li'
		}, params));

	};


	this.addDivider = function () {

		UI.dom.construct({
			parent: this.menu_element,
			names: 'divider',
			attrs: {role: 'presentation'},
			tag: 'li'
		});

	}

});

UI.obj.declare('Modal', function () {

	this.default_options = {};

});

UI.obj.declare('NestedMenu', function () {

	this.default_options = {};

});

UI.obj.declare('Resizable', function () {

	this.default_options = {};

});

UI.obj.declare('Search', function () {

	this.default_options = {};

});

UI.obj.declare('Tabs', function () {

	this.default_options = {};

});

UI.obj.declare('Tooltip', function () {

	this.default_options = {};

});
