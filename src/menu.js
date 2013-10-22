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
