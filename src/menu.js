UI.obj.declare('Menu', function () {

	this.constructor.id = this.constructor.id || 0;


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

		this.id = this.constructor.id++;

		this.menu_element = this.element.firstChild;


		UI.dom.update(this.menu_element, {
			attrs: {'aria-labelledby': 'dropdownMenu' + this.id}
		});


		var options = this.options.options;

		if (!options) return;


		options.forEach(function (params) {

			this.addOption(params);

		}.bind(this));

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

	}

});
