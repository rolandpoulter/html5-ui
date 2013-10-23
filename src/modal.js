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
