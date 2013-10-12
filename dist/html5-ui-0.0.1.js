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

UI.create = function (definition) {

	return UI[
		typeof definition.component === 'string' ? 'obj' : 'dom'
	].create(definition);

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

	return UI[class_name] = UI.obj.define.apply(this, arguments);

};


UI.obj.define = function (class_name, decorator) {

	var initialize = UI.obj.initialize;


	var Constructor = eval(
		'(function ' + class_name + ' (options) { initialize(this, options); })'
	);


	Constructor.toString = UI.obj.define.toString;


	if (arguments.length === 3) {
		var Super = decorator;

		Constructor.prototype = Object.create(Super.prototype || Super, {
			constructor: {value: Constructor}
		});

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


UI.dom.query = function (selector, element) {

	element = element || document;


	var matches = element.querySelectorAll(selector);


	return Array.prototype.slice.call(matches, 0);

};


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


	return event;

};


UI.dom.create = function (element) {

	if (typeof element === 'string') {
		return UI.dom.parse(element);
	}


	if (element.nodeType) {
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

	if (definition.before) {
		UI.dom.before(element, definition.before);
	}

	if (definition.after) {
		UI.dom.after(element, definition.after);
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


UI.dom.before = function (element, before) {

	if (typeof before === 'string') {
		before = document.querySelector(before);
	}


	var parent = before.parentNode;

	if (parent && parent.insertBefore) {
		parent.insertBefore(element, before);
	}

};


UI.dom.after = function (element, after) {

	if (after.nextSibling) {
		return UI.dom.before(element, after.nextSibling);
	}

	UI.dom.parent(element, after.parentNode);

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

		UI.dom.events.remove.some(element, event_name, event_cache[event_name], use_capture);

	});

};


UI.dom.events.remove.some = function (element, event_name, event_handlers, use_capture) {

	if (!event_handlers) return;


	if (!Array.isArray(event_handlers)) {
		event_handlers = [event_handlers]
	}


	event_handlers.forEach(function (eventHandler) {

		element.removeEventListener(event_name, eventHandler, use_capture);

		var event_cache = element.events;

		if (event_cache) {
			if (use_capture) event_cache = event_cache.capture;

			event_cache = event_cache[event_name];

			if (event_cache) {
				var index = event_cache.indexOf(eventHandler);

				if (index !== -1) {
					event_cache.splice(index, 1);
				}
			}
		}

	});

};


UI.dom.remove = function (element) {

	UI.dom.events.remove(element);


	if (element.parentNode) {
		element.parentNode.removeChild(element);
	}


	element.childNodes.forEach(UI.dom.remove);

};

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
			click: this.hideAll.bind(this)
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

		if (!/(38|40|27)/.test(event.keyCode)) return;


		event.preventDefault();

		event.stopPropagation();


		if (this.isDisabled) return;


		if (!this.isActive || (this.isActive && event.keyCode === 27)) {
			if (event.which === 27) {
				UI.dom.trigger(this.toggle_element, 'click');

				this.toggle_element.focus();
			}

			return UI.dom.trigger(this.element, 'click');
		}


		var items = UI.dom.query('[role=menu] li:not(.divider) a', this.element);

		if (!items.length) return;


		var index = items.indexOf(document.activeElement),
				end = items.length - 1;


		if (event.keyCode == 38 && index > 0)   index--; // Up

		if (event.keyCode == 40 && index < end) index++; // Down

		if (index === -1) index = 0;


		items[index].focus();

	};

});

UI.obj.declare('ContextMenu', UI.Menu, function () {

	var super_initialize = this.initialize;

	this.initialize = function () {

		super_initialize.call(this)

		if (this.options.context) {
			this.setupContext(this.options.context);
		}

	};


	this.setupContext = function (context_element) {

		if (this.context_element) this.removeContext();

		this.context_element = context_element;

	};


	this.removeContext = function () {

	};

});

UI.obj.declare('AutoComplete', function () {

	this.default_options = {};

});

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

	this.default_options = {};

});

UI.obj.declare('Tabs', function () {

	this.default_options = {};

});

UI.obj.declare('Tooltip', function () {

	this.default_options = {};

});
