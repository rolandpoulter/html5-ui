var button_group = UI.create({
	names: 'btn-group',
	parent: page,
	children: [{
		component: 'Button',
		element: {
			text: 'Left'
		}
	}]
});

var button_left = UI.create({
	component: 'Button',
	element: {
		text: 'Middle',
		parent: button_group
	}
});

var menu_options = [
	{action: {text: 'Action'}, events: {click: function () {alert('action');}}},
	{action: {text: 'Another Action'}},
	{action: {text: 'Something else here'}},
	{divider: true},
	{names: 'dropdown-header', text: 'Other'},
	{action: {text: 'Separated link'}}
];

var menu = new UI.Menu({
	element: {
		names: 'btn-group',
		parent: button_group
	},
	options: menu_options,
	toggle: {
		component: 'Button',
		element: {text: 'Right ', children: [{names: 'caret'}]}
	}
});

UI.create({
	component: 'ContextMenu',
	element: {
		parent: {
			before: page.firstChild,
			names: 'overlay',
			css: {position: 'absolute', top: 0, left: 0}
		}
	},
	options: menu_options,
	context: document
});

UI.create({
	tag: 'p',
	text: 'Right click for a context menu.',
	parent: page
});

UI.create({
	component: 'Modal',
	element: {
		attrs: {id: 'myDialog', role: 'dialog'},
		parent: page
	},
	dialog: {
		close: true,
		title: 'My Dialog',
		actions: [
			{text: 'Close', data: {dismiss: 'modal'}},
			{text: 'Save changes', names: 'btn btn-primary'}
		],
		body: {
			tag: 'p',
			text: 'Modal body...'
		}
	},
	show: false,
	toggle: {
		component: 'Button',
		element: {
			tag: 'a',
			text: 'Launch modal dialog',
			attrs: {href: '#myDialog'},
			data: {toggle: 'modal'},
			parent: page
		}
	}
});

var loading_button = new UI.Button({
	element: {
		parent: page,
		text: 'Loading state',
		data: {loadingText: 'Loading...'},
		events: {click: function () {
			loading_button.state = 'loading';

			setTimeout(function () {
				loading_button.state = 'reset';
			}, 1000);
		}}
	}
});
