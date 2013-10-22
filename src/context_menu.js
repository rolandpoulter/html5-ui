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
