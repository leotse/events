////////////////////
// event_admin.js //
////////////////////

// custom js that drives the events admin page

function adminInit(eventId, maxId) {
	$(document).ready(function() {

		///////////////
		// Constants //
		///////////////

		var ENDPOINT = '/api/events/' + eventId + '/media?max_id=';

		////////////
		// Fields //
		////////////

		var items = [];
		var hasMore = true;
		var loading = false;

		////////////////////
		// Initialization //
		////////////////////

		var $media = $('.media')
		var $form = $('form');
		var $remove = $('.admin_menu .remove');

		// select image on click
		$media.on('click', 'img', function() {
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

		// listen for window scroll and resize event to load more items
		$(window).scroll(loadMore);
		$(window).resize(loadMore);

		// init lazy loading
		loadMore();


		/////////////
		// Methods //
		/////////////

		function loadMore() {
			console.log(Date.now() + ' ' + loading);
			if(loading) return; 

			// if there aren't any more to load
			// might as well remove the scroll and resize handlers
			if(!hasMore) {
				$(window).off('scroll');
				$(window).off('resize');
				return;
			}

			// if the beacon element is in view, load more items!
			var $end = $('.end_of_media:in-viewport');
			if($end.length > 0) {

				// prevents this from getting called multiple times
				loading = true;

				var url = ENDPOINT + maxId;
				$.getJSON(url, function(items) {

					// reset flag
					loading = false;

					// if there aren't any more items, we are at the end of the page!
					if(items.length === 0) { 
						hasMore = false; 
						return;
					}

					// update the max id for next api call
					maxId = items[items.length - 1].id;
					
					// add the items to the list
					var i, item, el, els = [], length = items.length;
					for(i = 0; i < items.length; i++) {
						item = items[i];
						el = createImg(item);
						els.push(el);
					}

					// add to dom!
					$media.append(els);

					// and 'recursively' check again
					setTimeout(loadMore, 250);
				});
			}
		}

		function createImg(media) {
			var id = media.id;
			var url = media.images.thumbnail.url;
			return "<img src='" + url + "' id='" + id + "' />";
		}
	});
}