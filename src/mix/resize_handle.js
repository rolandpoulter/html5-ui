UI.mix.resizeHandle = function (mix_options) {

	UI.obj.assertMix(this);


	mix_options = mix_options || {};


	this.setupResizeHandle = function () {

		var events = {
			mousedown: this.attachResizeHandle.bind(this)
		};

		if (mix_options.dblclick) {
			events.dblclick = mix_options.dblclick.bind(this);
		}


		this.resize_handle_element = UI.dom.create(UI.obj.mixin({
			css: {position: 'absolute'},
			names: 'resize-handle ' + this[mix_options.handle_class_key],
			parent: this[mix_options.parent_element_key || 'element'],
			events: events
		}, this.options.resize_handle));


		this.adaptResizeHandle();

	};


	this.removeResizeHandle = function () {

		UI.dom.remove(this.resize_element);

	};


	this.attachResizeHandle = function (event) {

		this.resize_handle_events = this.resize_handle_events || {
			mousemove: this.updateResizeHandle.bind(this),
			mouseup:   this.detachResizeHandle.bind(this)
		};


		UI.dom.events(document, this.resize_handle_events);

		event.preventDefault();


		this.resize_handle_state = {
			startX: event.x,
			startY: event.y
		};


		this.initialResizeHandleState(event);

	};


	this.updateResizeHandle = function (event) {

		this.resize_handle_state.diffX = event.x - this.resize_handle_state.startX;

		this.resize_handle_state.diffY = event.y - this.resize_handle_state.startY;


		this.updateResizeHandleState(event);		


		this.throttledAdapt();

		event.preventDefault();

	};


	this.detachResizeHandle = function (event) {

		this.deleteResizeHandleState(event);

		delete this.resize_handle_state;


		UI.dom.events.remove(document, this.resize_handle_events);

		event.preventDefault();

	};


	this.adaptResizeHandle = function () {

		// Adapt resize handle hook.

	};


	this.initialResizeHandleState = function (event) {

		// Initial resize handle state hook.

	};


	this.updateResizeHandleState = function (event) {

		// Update resize handle state hook.

	};


	this.deleteResizeHandleState = function (event) {

		// Delete resize handle state hook.

	};

};
