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

var button_left = new UI.create({
	component: 'Button',
	element: {
		text: 'Middle',
		parent: button_group
	}
});

var menu = new UI.Menu({
	element: {
		names: 'btn-group',
		parent: button_group
	},
	options: [
		{action: {text: 'Action'}},
		{action: {text: 'Another Action'}},
		{action: {text: 'Something else here'}},
		{divider: true},
		{names: 'dropdown-header', text: 'Other'},
		{action: {text: 'Separated link'}}
	],
	toggle: {
		component: 'Button',
		element: {text: 'Right ', children: [{names: 'caret'}]}
	}
});
