var main_split = new UI.SplitView({
	element: page,
	split_size: 100,
	one: {attrs: {id: 'header'}},
	two: {
		component: 'SplitView',
		element: {attrs: {id: 'main'}},
		orientation: 'horizontal',
		one: {attrs: {id: 'left'}},
		two: {attrs: {id: 'right'}}
	}
});

var button_group = UI.create({
	names: 'btn-group',
	parent: header,
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
		parent: page
	},
	options: menu_options,
	toggle: {
		component: 'Button',
		element: {parent: button_group, text: 'Right ', children: [{names: 'caret'}]},
	}
});

UI.create({
	component: 'ContextMenu',
	element: {
		parent: {
			before: right,
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
	parent: right
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
			parent: left
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

new UI.TabList({
	element: {
		parent: header
	},
	tabs: [
		{element: {text: 'One'}},
		{element: {text: 'Two'}},
		{element: {text: 'Three'}}
	]
});
