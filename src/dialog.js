UI.obj.declare('Dialog', function () {

	this.default_options = {
		element: {
			names: 'modal-dialog',
			children: [
				{names: 'modal-content', children: [
					{names: 'modal-header'},
					{names: 'modal-body'},
					{names: 'modal-footer'}
				]}
			]	
		},
		show: true
	};


	this.initialize = function () {

		this.header_element = this.element.querySelector('.modal-header');

		this.body_element = this.element.querySelector('.modal-body');

		this.footer_element = this.element.querySelector('.modal-footer');


		this.setupHeader();

		this.setupBody();

		this.setupFooter();


		UI.dom.events(this.element, {
			click: this.onClickDismissCheck.bind(this)
		});


		if (!this.options.show) {
			this.hide();
		}

	};


	this.setupHeader = function () {

		if (this.options.close) {
			UI.dom.create({
				parent: this.header_element,
				names: 'close',
				data: {dismiss: 'modal'},
				html: '&times;',
				tag: 'button'
			});
		}

		if (this.options.title) {
			UI.dom.create({
				parent: this.header_element,
				names: 'modal-title',
				text: this.options.title,
				tag: this.options.title_tag || 'h4'
			});
		}

	};


	this.setupBody = function (params) {

		UI.dom.update(this.body_element, this.options.body);

	};


	this.setupFooter = function (params) {

		if (Array.isArray(this.options.actions)) {
			this.options.actions.forEach(function (dialog_action) {

				UI.dom.create(UI.obj.mixin(
					{
						tag: 'button',
						names: 'btn btn-default',
						parent: this.footer_element
					},
					dialog_action
				));

			}.bind(this));
		}

	};


	this.onClickDismissCheck = function (event) {

		var dismiss_element = UI.dom.closest(event.target, this.element, function (element) {

			return element.dataset.dismiss === 'modal';

		});


		if (dismiss_element) {
			var dismiss_event = UI.dom.trigger(this.element, 'dismiss');

			if (!dismiss_event.defaultPrevented) {
				this.hide(event);
			}
		}

	};


	this.show = function () {

		this.element.style.display = 'block';

	};


	this.hide = function () {

		this.element.style.display = 'none';

	};

});
