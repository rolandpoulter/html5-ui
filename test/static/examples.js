var button_group = UI.dom.create({
	names: 'btn-group',
	parent: page,
	children: [{
		component: 'Button',
		element: {
			text: 'Left'
		}
	}]
});

var button_left = new UI.Button({
	element: {
		text: 'Middle Left',
		parent: button_group
	}
});

var button_middle = new UI.Button({
	element: {
		text: 'Middle Right',
		parent: button_group
	}
});

var button_right = new UI.Button({
	element: {
		text: 'Right',
		parent: button_group
	}
});

var menu = new UI.Menu({
	element: {
		parent: page
	},
	options: [
		{action: {tag: 'a', attrs: {role: 'menuitem', tabindex: '-1', href: '#'}, text: 'Action'}},
		{action: {tag: 'a', attrs: {role: 'menuitem', tabindex: '-1', href: '#'}, text: 'Another Action'}},
		{action: {tag: 'a', attrs: {role: 'menuitem', tabindex: '-1', href: '#'}, text: 'Something else here'}},
		{divider: true},
		{action: {tag: 'a', attrs: {role: 'menuitem', tabindex: '-1', href: '#'}, text: 'Separated link'}}
	]
});

menu.element.classList.add('open', 'clearfix');
