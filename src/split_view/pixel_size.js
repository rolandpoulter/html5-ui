UI.obj.declare('SplitViewInPixels', UI.SplitView, function () {

	this.default_options = UI.obj.mixin({}, this.default_options, {
		min_size: null,
		max_size: null,
		split_size: null
	});


	var super_initialize = this.initialize;

	this.initialize = function () {

		super_initialize.call(this);


		if (typeof this.options.split_size === 'number') {
			this.setSplitSize(this.options.split_size);

			this.adapt();
		}

	};


	this.collapse = function (split_side) {

		var new_size = 0;

		if (this.before_collapse === undefined) {
			this.before_collapse = this.last_split_size;

		} else {
			new_size = this.before_collapse;

			delete this.before_collapse;
		}


		this.setSplitSize(new_size, split_side);

		this.adapt();

	};


	this.setSplitSize = function (client_size, split_side) {

		var max_client_size = this[this.size_getter],
		    split_ratio = client_size / max_client_size;


		this.setSplitRatio(split_ratio, split_side);


		this.last_split_size = client_size;

		this.last_split_side = split_side;

	};


	var super_beforeAdapt = this.beforeAdapt;

	this.beforeAdapt = function () {

		if (!super_beforeAdapt.call(this)) return;

		this.setSplitSize(this.last_split_size, this.last_split_side);

		return true;

	};


	var super_initialResizeHandleState = this.initialResizeHandleState;

	this.initialResizeHandleState = function (event) {

		this.resize_handle_state.split_size = this[this.size_getter] * this.split_ratio;


		super_initialResizeHandleState.call(this, event);

	};


	this.updateResizeHandleState = function () {

		if (this.orientation === 'vertical') {
			this.setSplitSize(
				this.resize_handle_state.split_size +
				this.resize_handle_state.diffY
			);
		}

		else {
			this.setSplitSize(
				this.resize_handle_state.split_size +
				this.resize_handle_state.diffX
			);
		}

	};

});
