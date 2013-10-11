UI.obj.declare('Button', function () {

	this.default_options = {
		loadingText: 'loading...',

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

			var dataStateAttr = state + 'Text';

			if (!this.element.dataset.resetText) {
				this.element.dataset.resetText = this.value;
			}

			this.value = this.element.dataset[dataStateAttr] || this.options[dataStateAttr];

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

		var buttonGroupParent = this.utils.closest(
			this.element,
			this.buttonGroupParentCheck.bind(this)
		);

		if (!buttonGroupParent) return;

		
		var buttonInput = this.element.querySelector('input');

		if (!buttonInput) return;


		var checked = (buttonInput.getAttribute('checked') === 'checked') ?
			'' :
			'checked';

		buttonInput.setAttribute('checked', checked);

		this.utils.trigger(buttonInput, 'change');


		if (buttonInput.getAttribute('type') !== 'radio') return;

		var buttonSiblings = buttonGroupParent.querySelectorAll( '.active');

		buttonSiblings.forEach(this.deactivateSibling.bind(this));

	};


	this.buttonGroupParentCheck = function (element) {

		return element.dataset.toggle === 'buttons';

	};


	this.deactivateSibling = function (sibling) {

		sibling.classList.remove('active');

	};

});
