UI.obj.declare('SplitView', function () {

	this.default_options = {
		element: {},
		one: {},
		two: {}, 
		collapse: 'one',
		auto_fill: true,
		resizable: true,
		min_ratio: 0,
		max_ratio: 1,
		auto_adapt: true,
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

	};


	this.remove = function () {

		this.removeElement();

		this.removeAutoAdapter();

		this.removeResizeHandle();

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


	this.setupAutoAdapter = function () {

		this.window_resize_events = this.window_resize_events || {
			resize: this.throttledAdapt.bind(this)
		};


		UI.dom.events(window, this.window_resize_events);

	};


	this.removeAutoAdapter = function () {

		if (this.window_resize_events) {
			UI.dom.events.remove(window, this.window_resize_events);
		}

	};


	this.throttledAdapt = function () {

		if (this.adapt_wait) return;

		this.adapt_wait = true;

		setTimeout(function () {

			this.adapt();

			this.adapt_wait = false;

		}.bind(this), 50);

	};


	this.collapse = function (split_side) {

		var new_ratio = 0;

		if (this.before_collapse === undefined) {
			this.before_collapse = this.split_ratio;

		} else {
			new_ratio = this.before_collapse;

			delete this.before_collapse;
		}


		this.setSplitRatio(new_ratio, split_side);

		this.adapt();

	};


	this.setSplitRatio = function (split_ratio, split_side) {

		this.split_ratio = Math.min(
			Math.max(split_ratio, this.options.min_ratio),
			Math.min(1, this.options.max_ratio)
		);


		this.other_ratio = 1.0 - split_ratio;


		if (split_side === 'two' || split_side === true) {

			var temp_split_ratio = this.split_ratio;

			this.other_ratio = this.split_ratio;

			this.split_ratio = this.other_ratio;

		}

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


	this.beforeAdapt = function () {

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

		return true;

	};


	this.adapt = function (non_recursive) {

		if (!this.beforeAdapt()) return;


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


		if (!non_recursive) {
			this.adaptDecendants();
		}

	};


	this.adaptDecendants = function () {

		UI.dom.query('.split-view', this.element).forEach(function (child_split_view) {

			if (child_split_view && child_split_view.split_view) {
				child_split_view.split_view.adapt(true);
			}

		});

	};


	UI.mix.resizeHandle.call(this, {
		parent_element_key: 'element',
		handle_class_key: 'orientation',

		dblclick: function (event) {
			this.collapse(this.options.collapse);
		}
	});


	this.adaptResizeHandle = function () {

		if (!this.resize_handle_element) return;


		var resize_update = {},
		    resize_handle_size = this.options.resize_handle_size;


		if (this.orientation === 'vertical') {
			resize_update.css = {
				top: Math.max(0, Math.round(this.height * this.split_ratio) - (resize_handle_size / 2)) + 'px',
				left: 0,
				width: this.width + 'px',
				height: resize_handle_size + 'px'
			};
		}

		else {
			resize_update.css = {
				top: 0,
				left: Math.max(0, Math.round(this.width * this.split_ratio) - (resize_handle_size / 2)) + 'px',
				width: resize_handle_size + 'px',
				height: this.height + 'px'
			};
		}


		UI.dom.update(this.resize_handle_element, resize_update);

	};


	this.initialResizeHandleState = function () {

		this.resize_handle_state.resize_class = 'resize-' + this.orientation;

		this.resize_handle_state.split_ratio = this.split_ratio;


		this.element.classList.add(this.resize_handle_state.resize_class);

	};


	this.updateResizeHandleState = function () {

		if (this.orientation === 'vertical') {
			this.setSplitRatio(
				this.resize_handle_state.split_ratio +
				(this.resize_handle_state.diffY / this[this.size_getter])
			);
		}

		else {
			this.setSplitRatio(
				this.resize_handle_state.split_ratio +
				(this.resize_handle_state.diffX / this[this.size_getter])
			);
		}

	};


	this.deleteResizeHandleState = function () {

		this.element.classList.remove(this.resize_handle_state.resize_class);

	};

});
