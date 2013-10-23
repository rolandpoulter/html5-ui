UI.obj.declare('TabList', function () {

	this.default_options = {
		element: {
			tag: 'ul',
			names: 'nav nav-tabs'
		}
	};


	this.initialize = function () {

		this.tabs = [];


		this.pane_container_element = UI.dom.create(UI.obj.mixin({
			names: 'tab-content',
			parent: this.element.parentNode
		}, this.options.pane_container));


		if (this.options.tabs) {
			this.options.tabs.forEach(this.addTab.bind(this));
		}


		if (this.tabs.length) {
			this.tabs[0].show();
		}

	};


	this.addTab = function (tab_definition) {

		// TODO: support dropdown menus in tab list.

		var tab = (tab_definition instanceof UI.Tab) ?
			tab_definition : new UI.Tab(tab_definition);


		if (this.tabs.indexOf(tab) === -1) {
			tab.setParentList(this);

			this.tabs.push(tab);
		}


		return tab;

	};


	this.removeTab = function (tab) {

		var index = this.tabs.indexOf(tab);

		if (index !== -1) {
			this.element.removeChild(tab.list_item_element);

			this.pane_container_element.removeChild(tab.pane_element);


			delete tab.parent;


			this.tabs.splice(index, 1);
		}

	};

});
