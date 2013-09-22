//////////////
// Album.js //
//////////////

// custom js that drives the albums page

$(document).ready(function() {
	var items = [];
	var $form = $('form.media');

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
	});

	// set the form data before submiting
	$form.submit(function(e) {
		$form[0].items.value = items;
	});
});