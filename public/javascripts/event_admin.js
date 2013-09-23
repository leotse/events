//////////////
// Album.js //
//////////////

// custom js that drives the albums page

$(document).ready(function() {
	var items = [];
	var $form = $('form');
	var $remove = $('.action_menu .remove');

	// select image on click
	$('.media img').click(function(e) {
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
	$remove.click(function(e) { $form.submit(); });

	// set the form data before submiting
	$form.submit(function(e) {
		$form[0].items.value = items;
	});
});