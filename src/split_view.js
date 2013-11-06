UI.obj.declare('SplitView', function () {

	this.default_options = {
		element: {},
		one: {},
		two: {},
		collapse: 'one',
		auto_fill: true,
		resizable: true,
		auto_adapt: true,
		split_size: null,
		split_ratio: 0.5,
		orientation: 'vertical',
		resize_handle: {},
		resize_handle_size: 10
	};


	this.initialize = function () {

		if (this.options.auto_adapt) {
			this.setupAutoAdapter();
		}


		UI.dom.update(this.element, {
			names: 'split-view',
			css: {position: 'relative', overflow: 'hidden'}
		});

		this.element.split_view = this;


		this.one_element = UI.dom.create(this.options.one);

		this.two_element = UI.dom.create(this.options.two);


		var split_element_update = {
			parent: this.element,
			names: 'split-view-pane',
			css: {position: 'absolute'}
		};


		UI.dom.update(this.one_element, split_element_update);

		UI.dom.update(this.two_element, split_element_update);


		this.setOrientation(this.options.orientation);

		this.setSplitRatio(this.options.split_ratio);


		this.adapt();


		if (this.options.resizable) {
			this.setupResizeHandle();
		}


		if (typeof this.options.split_size === 'number') {
			this.setSplitSize(this.options.split_size);

			this.adapt();
		}

	};


	this.remove = function () {

		this.removeElement();

		this.removeAutoAdapter();

		this.removeResizeHandle();

	};


	this.throttledAdapt = function () {

		if (this.adapt_wait) return;

		this.adapt_wait = true;

		setTimeout(function () {

			this.adapt();

			this.adapt_wait = false;

		}.bind(this), 50);

	};


	this.setupAutoAdapter = function () {

		UI.dom.events(window, this.window_resize_events = this.window_resize_events || {
			resize: this.throttledAdapt.bind(this)
		});

	};


	this.removeAutoAdapter = function () {

		if (this.window_resize_events) {
			UI.dom.events.remove(window, this.window_resize_events);
		}

	};


	this.collapse = function (split_side) {

		this.setSplitSize(0, split_side);

		this.adapt();

	};


	this.setupResizeHandle = function () {

		this.resize_element = UI.dom.create(UI.obj.mixin({
			css: {position: 'absolute'},
			names: 'resize-handle ' + this.orientation,
			parent: this.element,
			events: {
				dblclick: this.collapse.bind(this, this.options.collapse),
				mousedown: this.startResize.bind(this)
			}
		}, this.options.resize_handle));


		this.adaptResizeHandle();

	};


	this.removeResizeHandle = function () {

		UI.dom.remove(this.resize_element);

	};


	this.startResize = function (event) {

		this.resize_state = {
			resize_class: 'resize-' + this.orientation,
			split_size: this[this.size_getter] * this.split_ratio,
			startX: event.x,
			startY: event.y
		};

		this.element.classList.add(this.resize_state.resize_class);

		this.element.offsetWidth;


		UI.dom.events(document, this.resize_events = this.resize_events || {
			mouseup: this.stopResize.bind(this),
			mousemove: this.dragResize.bind(this)
		});

		event.preventDefault();

	};


	this.dragResize = function (event) {

		var diffX = event.x - this.resize_state.startX,
		    diffY = event.y - this.resize_state.startY;


		if (this.orientation === 'vertical') {
			this.setSplitSize(this.resize_state.split_size + diffY);
		}

		else {
			this.setSplitSize(this.resize_state.split_size + diffX);
		}


		this.throttledAdapt();

		event.preventDefault();

	};


	this.stopResize = function (event) {

		this.element.classList.remove(this.resize_state.resize_class);

		delete this.resize_state;

		UI.dom.events.remove(document, this.resize_events);

		event.preventDefault();

	};


	Object.defineProperties(this, {
		width: {
			get: function () {

				return this.element.clientWidth;

			}
		},
		height: {
			get: function () {

				return this.element.clientHeight;

			}
		}
	});


	this.setSplitSize = function (client_size, split_side) {

		// TODO: preserve the pixel size

		var max_client_size = this[this.size_getter],
		    split_ratio = client_size / max_client_size;


		if (split_side === 'two' || split_side === true) {
			split_ratio = 1.0 - split_ratio;
		}


		this.setSplitRatio(split_ratio);

	};


	this.setSplitRatio = function (split_ratio) {

		this.split_ratio = Math.min(1, split_ratio);

		this.other_ratio = 1 - split_ratio;

	};


	this.setOrientation = function (orientation) {

		if (orientation === 'vertical') {

			this.orientation = orientation;

			this.size_getter = 'height';

		}

		else if (orientation === 'horizontal') {

			this.orientation = orientation;

			this.size_getter = 'width';

		}

	};


	this.adapt = function (non_recursive) {

		if (!this.one_element) return;


		if (this.options.auto_fill && this.element.parentNode) {
			if (this.element.parentNode === document.body) {
				UI.dom.css(this.element, {
					width: window.innerWidth + 'px',
					height: window.innerHeight + 'px'
				});
			}

			else {
				UI.dom.css(this.element, {
					width: this.element.parentNode.clientWidth + 'px',
					height: this.element.parentNode.clientHeight + 'px'
				});
			}
		}


		var one_update = {css: {}},
		    two_update = {css: {}};


		if (this.orientation === 'vertical') {
			one_update.css.width =
			two_update.css.width = this.width + 'px';

			two_update.css.left = 0;

			two_update.css.top =
			one_update.css.height = Math.floor(this.height * this.split_ratio) + 'px';

			two_update.css.height = Math.round(this.height * this.other_ratio) + 'px';
		}

		else {
			one_update.css.height =
			two_update.css.height = this.height + 'px';

			two_update.css.top = 0;

			two_update.css.left =
			one_update.css.width = Math.floor(this.width * this.split_ratio) + 'px';

			two_update.css.width = Math.round(this.width * this.other_ratio) + 'px';
		}


		UI.dom.update(this.one_element, one_update);

		UI.dom.update(this.two_element, two_update);


		this.adaptResizeHandle();


		if (non_recursive) return;

		UI.dom.query('.split-view', this.element).forEach(function (child_split_view) {

			if (child_split_view && child_split_view.split_view) {
				child_split_view.split_view.adapt(true);
			}

		});

	};


	this.adaptResizeHandle = function () {

		if (!this.resize_element) return;


		var resize_update = {},
		    handle_size = this.options.resize_handle_size;


		if (this.orientation === 'vertical') {
			resize_update.css = {
				top: Math.max(0, Math.round(this.height * this.split_ratio) - (handle_size / 2)) + 'px',
				left: 0,
				width: this.width + 'px',
				height: handle_size + 'px'
			};
		}

		else {
			resize_update.css = {
				top: 0,
				left: Math.max(0, Math.round(this.width * this.split_ratio) - (handle_size / 2)) + 'px',
				width: handle_size + 'px',
				height: this.height + 'px'
			};
		}


		UI.dom.update(this.resize_element, resize_update);

	};

});
