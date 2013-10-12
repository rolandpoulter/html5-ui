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


		if (this.options.toggle) {
			this.setupToggle(this.options.toggle);
		}

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

	};


	this.setupToggle = function (element) {

		this.toggle_element = UI.dom.create(element);


		this.toggle_element.menu = this;


		UI.dom.update(this.toggle_element, {
			data: {toggle: 'dropdown'},
			events: {click: this.onToggle.bind(this)},
			before: this.menu_element
		});

	};


	this.setupAutoHide = function () {

		this.auto_hide_events = this.auto_hide_events || {
			click: this.hideAll.bind(this)
		};


		UI.dom.events(document.body, this.auto_hide_events);

	};


	this.removeAutoHide = function () {

		UI.dom.events.remove(document.body, this.auto_hide_events);

	};


	this.setupKeydown = function () {

		this.keydown_events = this.keydown_events || {
			keydown: this.onKeydown.bind(this)
		};


		UI.dom.events(document.body, this.keydown_events);

	};


	this.removeKeydown = function () {

		UI.dom.events.remove(document.body, this.keydown_events);

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
