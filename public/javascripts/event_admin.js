//////////////
// Album.js //
//////////////

// custom js that drives the albums page

$(document).ready(function() {
	var items = [];
	var $form = $('form');
	var $remove = $('.action_menu .remove');

	// add a waypoint to the last image
	$('.media').waypoint('infinite', {
		container: $('.media'),
		items: '.infinite-item',
		more: '.more',
		offset: 'bottom-in-view',
		loadingClass: 'loading',
		onBeforePageLoad: $.noop,
		onAfterPageLoad: function() { console.log(this); }
	});

	// select image on click
	$('.media').on('click', 'img', function() {
		var $this = $(this);
		var id = this.id;

		// select/unselect item
		$this.toggleClass('selected');
		
		// and add/remove it from the remove items list
		var index = items.indexOf(id);
		if(index >= 0) {
			items.splice(index, 1);
		} else {
			items.push(id);
		}

		// show/hide remove action depending on if there are items left in the selected list
		if(items.length === 0) { $remove.addClass('hidden'); }
		else { $remove.removeClass('hidden'); }
	});

	// submit form on remove clicked
	$remove.click(function() { $form.submit(); });

	// set the form data before submiting
	$form.submit(function() {
		$form[0].items.value = items;
	});
});