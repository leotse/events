////////////////////
// event_admin.js //
////////////////////

// custom js that drives the events admin page

function init(eventId, maxId) {
	$(document).ready(function() {

		///////////////
		// Constants //
		///////////////

		var ENDPOINT = '/api/events/' + eventId + '/media';

		////////////
		// Fields //
		////////////

		var mediaList = [];
		var hasMore = true;
		var loading = false;

		////////////////////
		// Initialization //
		////////////////////

		var $media = $('.media-ios');
		var $dialog = $('.dialog');
		var $swiper = $('.swiper-wrapper');

		// listen for window scroll and resize event to load more items
		$(window).scroll(loadMore);
		$(window).resize(loadMore);

		// listen for click on picture
		$media.on('click', 'img', showDialog);
		// $dialog.on('click', '', function() { $dialog.addClass('hidden'); });

		// init swiper
		var swiper = new Swiper('.swiper-container',{
			loop: true,
			grabCursor: true
		});

		// init lazy loading
		loadMore();


		/////////////
		// Methods //
		/////////////

		function loadMore() {
			if(loading) return; 

			// if there aren't any more to load
			// might as well remove the scroll and resize handlers
			if(!hasMore) {
				$(window).off('scroll');
				$(window).off('resize');
				return;
			}

			// if the beacon element is in view, load more items!
			var $end = $('.loadmore:in-viewport');
			if($end.length > 0) {

				// prevents this from getting called multiple times
				loading = true;

				// build api url
				var url = ENDPOINT;
				if(maxId) { url += '?max_id=' + maxId; }

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
					var i, item, length = items.length;
					var img, imgs = [];
					for(i = 0; i < items.length; i++) {
						item = items[i];
						img = createImg(item, i);
						imgs.push(img);
					}

					// add to dom!
					$media.append(imgs);

					// update internal media list
					mediaList = mediaList.concat(items);

					// and 'recursively' check again
					setTimeout(loadMore, 250);
				});
			}
		}

		function createImg(media, index) {
			var id = media.id;
			var url = media.images.thumbnail.url;
			return "<img src='" + url + "' id='" + id + "' index='" + index + "' />";
		}

		function showDialog() {
			var $swiperItems = $swiper.find('.swiper-slide img');
			var index = Number($(this).attr('index'));

			// update the swiper virtual scrolling dom
			var media, url;
			$swiperItems.each(function(i, item) {
				media = mediaList[index + i];
				url = media.images.standard_resolution.url;
				item.src = url;
			});

			// reset swiper and show dialog!
			swiper.reInit();
			swiper.swipeTo(0, 0, false);
			$dialog.removeClass('hidden'); 
		}
	});
}