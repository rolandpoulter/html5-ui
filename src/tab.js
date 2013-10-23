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
