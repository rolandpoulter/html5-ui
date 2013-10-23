// Utilities for JavaScript objects/classes.

// Why this library is necessary, instead of using an off the shelf class framework?
// 1) A solid mixin procedure is always needed. Why isn't this standardized yet?
// 2) Only wanted support for modern browsers.
// 3) Other class libraries are always too fancy, complicated, or absurd.
// 4) Just needed handy helper methods over classic prototype based classes.
// 5) Really, when you strip out all the comments and whitespace there isn't much too it.
//    The mixin function is more code then everything else, practically.


UI.obj = {};


// Creates a new instance of a UI component, based on
// definition.component string.

UI.obj.create = function (definition) {

	var ComponentConstructor = UI[definition.component];

	if (!ComponentConstructor) {
		throw new Error('Missing component: ' + definition.component);
	}


	return new ComponentConstructor(definition);

};


// Defines a new UI component class, which is then assigned
// to UI by its class_name.

UI.obj.declare = function (class_name, decorator){

	return UI[class_name] = UI.obj.define.apply(this, arguments);

};


// Creates a UI component class. Returns the contructor.
// Class methods and properties are assigned to the component prototype
// with a decorator function. Eval is used to give the constructor a class_name.

UI.obj.define = function (class_name, decorator) {

	var initialize = UI.obj.initialize;


	// In JavaScript functions don't have names, except when you give them on
	// when using the literal syntax. Afterwords the name property is immutable.
	// Eval is used to ensure the Contructor has a name. This is important, because
	// it makes it easier to determine the class_name of an instance. Handy when
	// debugging or doing type checking.

	var Constructor = eval(
		'(function ' + class_name + ' (options) { initialize(this, options); })'
	);

	// A more useful toString for UI component class constructors.
	// This sort of makes ensuring Contructors are given a name, but providing
	// a name this way is unconventional.

	Constructor.toString = UI.obj.define.toString;


	// Allows inheritance of another constructor function in JavaScript. In most
	// cases it is best to avoid using inheritance, but still useful when needed.

	if (arguments.length === 3) {
		var Super = decorator;

		Constructor.prototype = Object.create(Super.prototype || Super, {
			constructor: {value: Constructor}
		});

		decorator = arguments[2];
	}


	// Decorates the prototype using a function which is how methods, and
	// properties should be assigned to a class. Why? Because it forces the
	// module pattern. Except that it uses it on a prototype which provides the
	// efficiency of prototypes in JavaScript. However one could always use the
	// decorator after the fact on objects they wish to make behave like the 
	// contructor based version.

	/* Example: 

		var myObj = {};

		UI.MyFirstClass.prototype.decorator.call(myObj);
		UI.MyOtherClass.prototype.decorator.call(myObj);

		var options = {};

		UI.obj.initialize(myObj, options);

	*/

	UI.obj.decorate(Constructor.prototype, decorator);


	return Constructor;

};

// The toString method for UI component constructor functions.
// Should return the class_name.

UI.obj.define.toString = function () {

	return this.name;

};


// Assignes a decorator function to an object and then invokes it.
// Pretty simple.

UI.obj.decorate = function (entity, decorator) {

	entity.decorator = decorator;

	entity.decorator(entity);

};


// All UI component classes adhere to this initializer. It takes
// a context or the instance object, and an options object. No
// other arguments are supported.

UI.obj.initialize = function (context, options) {

	// Mixin the options object and any default options from the context
	// into a new options object assigned to the context.

	context.options = UI.obj.mixin({element: {}}, context.default_options, options);

	// Creates a dom element from options.element. See UI.dom.create() for more details.

	context.element = context.element || UI.dom.create(context.options.element);


	// Provides a couple default methods for updating or removing
	// the element on the context.

	context.updateElement = UI.obj.create.update;

	context.removeElement = UI.obj.create.remove;


	// Safely invoke an initialize method specific to the context,
	// most likely defined by the class of the context.

	if (context.initialize) context.initialize();

};

// Updates the main element of an object. See UI.dom.update().

UI.obj.create.update = function (definition) {

	return UI.dom.update(this.element, definition);

};

// Removes the main element of an object. See UI.dom.remove() if you care.

UI.obj.create.remove = function () {

	return UI.dom.remove(this.element);

};


// Generic object mixin procedure. Takes as many supplier object as needed.
// Please be careful not to pass a cyclical object, or there will be a 
// stack overflow.

UI.obj.mixin = function (receiver) {

	// Slice off a list of supplier objects to mix into the receiver object.

	var suppliers = Array.prototype.slice.call(arguments, 1),
	    toString = Object.prototype.toString;

	// Enumerate each supplier object one at a time for mixin.

	suppliers.forEach(function (supplier) {

		if (!supplier) return;

		// Enumerates the keys of a supplier object so their values
		// can be assigned to the supplier.

		Object.keys(supplier).forEach(function (property) {

			if (supplier[property]) {
				// Check if the value of the supplier's property is an object,
				// and not a custom object, meaning it is only an instance of Object.

				if (supplier[property].constructor === Object) {
					// Ensure that we have a reveiver value to recursively mixin too.

					receiver[property] = receiver[property] || {};

					// Recursively mixin nested supplier objects into nested receiver objects.

					return UI.obj.mixin(receiver[property], supplier[property]);
				}

				// Allow objects to have a custom mixinTo method.

				if (supplier[property].mixinTo) {
					receiver[property] = receiver[property] || {};

					return supplier[property].mixinTo(receiver[property]);
				}
			}

			// Otherwise, we can safely assume that the supplier value
			// can overwrite any possible receiver value. Do so using
			// Object.defineProperty incase we're dealing with getters and setters.

			Object.defineProperty(
				receiver,
				property,
				Object.getOwnPropertyDescriptor(supplier, property)
			);

		});

	});


	return receiver;

};
