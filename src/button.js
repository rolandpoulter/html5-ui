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
