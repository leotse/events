function initAlbum(eventId, pollInterval, slideInterval, debugMode) {

  var IS_IPAD = navigator.userAgent.match(/iPad/i) != null;

  var maxId = "", minId = "";
  var cachedList = []; // cache of all the images loaded in view
  var newImages = []; // cache of all the new images in polling, but not loaded
  var lastScroll = 0; // for detecting scroll up or down
  var slideCurrentIndex = 0; // current slide img index in the case of a slideshow
  var slideTimer; // slide timer object to loop through the images
  var mediaIndex = 0; // current media item in the popup, not for a slideshow

  var myHeader, myContentHeader;

  //var fxlist = ["bounce", "flip", "shake", "tada", "swing", "wobble", "pulse"]; // too goofy maybe not for wedding and for other event types
  var fxlist = ["fadeInDown", "fadeIn", "fadeInLeft", "fade", "pulse"];
  var fxoutlist = ["fadeOutDown", "fadeOut", "fadeOutLeft"];

  // ensures no double lazy loading
  var loading = false;

  // swipe-able carousel -- for iPad only
  var carousel;

  // refresh UI with the new data
  function refresh(data, prepend) {
    var $medialist = $(".media");
    var length = data.length; 
    var append = prepend === undefined || prepend === false;

    if(length > 0) {
      for (var i = 0; i < length; i++) {
        // create image
        var $img = $("<img class='fade23' src='" + data[i].images.thumbnail.url + "' rel='" + data[i].id + "'/>");
        var $figure = $("<figure></figure>");

        // append image
        $figure.append($img);

        if(append)           
          $(".media").append($figure);
        else
          $(".media").prepend($figure);

        // hook up click handler     
        $img.click(mediaDetailsHandler); 
        cachedList.push(data[i]);
      }        

      // update last id
      minId = data[0].id;
      maxId = data[length - 1].id;

      // if page is not filled yet
      if(append && $(".end_of_media:in-viewport").length > 0) {
        lazyload();
      }
    }
  }

  function getScroll () {
    var b = document.body;
    var e = document.documentElement;
    return {
      left: parseFloat( window.pageXOffset || b.scrollLeft || e.scrollLeft ),
      top: parseFloat( window.pageYOffset || b.scrollTop || e.scrollTop )
    };
  }

  function lazyload() {

    // prevent loading same data multiple times
    if(loading) { return; }

    //if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
      loading = true;
      $.ajax({
        type: 'GET',
        dataType: 'json',
        url: '/api/events/' + eventId + '/media?max_id=' + maxId,
        success: function (data) {
          loading = false;
          // if there's data, refresh grid
          if(data.length > 0) { refresh(data); }
        }
      });      
    //}
  }

  function slideshowHandler(e) {
    $(".overlay").addClass("active slideshow");
    $("body").attr("style", "overflow: hidden");
    if(slideTimer !== null) { clearTimeout(slideTimer); }
    if(IS_IPAD) {
      $("#media_swipe_wrapper").html(""); // clear html
      createSwipe();      
    }
    slideNext();
  }

  function slideNext() {
    if(IS_IPAD) {
      carousel.next();
    }
    else {
      // increment index or reset current index if already reached the end    
      if(++slideCurrentIndex === cachedList.length) {   
        slideCurrentIndex = 0;
      }
      mediaIndex = slideCurrentIndex;
      if(debugMode) console.log(slideCurrentIndex);
      var media = cachedList[slideCurrentIndex];
      var created = moment.unix(media.created_time);
      var fx = fxlist[slideCurrentIndex % fxlist.length];
      // var fxout = fxoutlist[slideCurrentIndex % fxoutlist.length];
      $(".media_details").html("");
      $(".media_details img").show();
      $(".media_details").append("<div class='details_desc fade1'>"+media.caption.text+"</div>");
      $(".media_details").append("<img class='details_author_img fade2' src='"+media.user.profile_picture+"' />");
      $(".media_details").append("<div class='details_author fade2'>By: "+media.user.full_name+"</div>");
      $(".media_details").append("<div class='details_created fade3'>Date: "+(created.isBefore(new Date(), "day")? created.format("YYYY-MM-DD"): created.fromNow())+"</div>");
      $(".media_img_container img").attr("src", media.images.standard_resolution.url);
      $(".media_img_container img").removeClass(); // clear class
      $(".media_img_container img").addClass('animated '+fx); // add animation class     
    }

    fixMissingImgs();
    // recur slideNext    
    slideTimer = setTimeout(slideNext, slideInterval); // to-do: set this to 15 min for production
  }

  // replace the missing images with placeholder images
  function fixMissingImgs() {
    $(".media_details img").error(function () { 
        $(this).attr("src", "/images/icons/anonymousUser.jpg");
    });
    $(".media_img_container img").error(function () { 
        $(this).attr("src", "/images/logo4.png");
    });
  }

  function findMediaItemById(id) {
    var l=cachedList.length;
    for(var i=0; i<l; i++) {
      if(cachedList[i].id === id) return i;
    }
    return undefined;
  }

  function clickToClose(e) {
    if($(e.target).parents(".action_next_prev_img").length) return;

    $(".overlay").removeClass("active");
    $("body").attr("style", "overflow: auto");
    if(debugMode) console.log(slideTimer);
    if(slideTimer !== undefined) {       
      clearTimeout(slideTimer); 
    } // clear timers
  }  

  function loadMediaDetails(mediaIndex) {
    if(mediaIndex !== undefined) {      
      var media = cachedList[mediaIndex];
      var created = moment.unix(media.created_time);
      $(".media_details").html("");
      $(".media_details img").show();
      $(".media_details").append("<div class='details_desc fade1'>"+media.caption.text+"</div>");
      $(".media_details").append("<img class='details_author_img fade2' src='"+media.user.profile_picture+"' />");
      $(".media_details").append("<div class='details_author fade2'>By: "+media.user.full_name+"</div>");
      $(".media_details").append("<div class='details_created fade3'>Date: "+(created.isBefore(new Date(), "day")? created.format("YYYY-MM-DD"): created.fromNow())+"</div>");

      // ipad hacks for Alan's wedding; to be cleaned up
      if(IS_IPAD) {
        $("div.action_next_prev_img").hide();     
      }
      else {
        $("div.action_next_prev_img").show();
        $(".media_img_container img").attr("src", media.images.standard_resolution.url);
        $(".media_img_container img").attr("class", "fade1");
      }

      fixMissingImgs();
    }
  }

  function nextPrevImgHandler(e) {
    if($(this).attr("id") === "action_next_img") {
      mediaIndex = ++mediaIndex === cachedList.length? 0: mediaIndex; 
      if(debugMode) console.log("next");
    }
    else {
      mediaIndex = --mediaIndex === -1? cachedList.length - 1: mediaIndex; 
      if(debugMode) console.log("prev");
    }

    if(debugMode) console.log(mediaIndex);
    loadMediaDetails(mediaIndex);
  }

  function mediaDetailsHandler(e) {
    $(".overlay").addClass("active");    
    $("body").attr("style", "overflow: hidden");
    if(debugMode) console.log(this);

    var id = $(this).attr("rel");

    if(id !== "") {
      mediaIndex = findMediaItemById(id);

      if(IS_IPAD) {
        $("#media_swipe_wrapper").html(""); // clear html
        createSwipe();
        carousel.goToPage(mediaIndex);
      }
      else {
        loadMediaDetails(mediaIndex);
      }
    }
  }

  function populateDetails(media) {
    var created = moment.unix(media.created_time);
    var desc = media.caption === null? "": media.caption.text;
    return '<div class="media_popup"><div class="media_img_container"><img src="'+ media.images.standard_resolution.url +'" class="fade1"></div><div class="overlay_close"></div><div class="media_details"><div class="details_desc fade1">'+desc+'</div><img class="details_author_img fade2" src="'+media.user.profile_picture+'" ><div class="details_author fade2">By: '+media.user.full_name+'</div><div class="details_created fade3">Date: '+(created.isBefore(new Date(), "day")? created.format("YYYY-MM-DD"): created.fromNow())+'</div></div></div>';
  }

  function createSwipe() {
    var el,
        i,
        page,
        slides = [];

    // load slides
    for(i=0; i<cachedList.length; i++) {
      slides.push(populateDetails(cachedList[i]));
    }

    carousel = new SwipeView('#media_swipe_wrapper', {
      numberOfPages: slides.length,
      hastyPageFlip: true
    });

    // Load initial data
    for (i=0; i<3; i++) {
      page = i==0 ? slides.length-1 : i-1;

      el = document.createElement('span');
      el.innerHTML = slides[page];
      carousel.masterPages[i].appendChild(el)
    }

    carousel.onFlip(function () {
      var el,
        upcoming,
        i;

      for (i=0; i<3; i++) {
        upcoming = carousel.masterPages[i].dataset.upcomingPageIndex;

        if (upcoming != carousel.masterPages[i].dataset.pageIndex) {
          el = carousel.masterPages[i].querySelector('span');
          el.innerHTML = slides[upcoming];

          fixMissingImgs();
        }
      }
    });
  }

  var $event = $(".event");
  var $actionScrolltop = $("#action_scrolltop");

  function scrollHandler() {
    var hPos = myContentHeader.data('position'), scroll = getScroll();
    if ( hPos.top < scroll.top ) {
      myContentHeader.addClass('fixed');
      $event.css("margin-top", "120px");
      $actionScrolltop.addClass("active");
    }
    else {
      myContentHeader.removeClass('fixed');
      $event.css("margin-top", "0");
      $actionScrolltop.removeClass("active");
    }    
  }


  $(document).ready(function() { 
    myHeader = $('header');
    myContentHeader = $('.content_header');
    myHeader.data( 'position', myHeader.position() );
    myContentHeader.data( 'position', myContentHeader.position() );

    if(IS_IPAD) {
      $(window).bind("touchmove touchend touchstart scroll", scrollHandler);  
      // append placeholders DOM
      var i;
      for(i=0; i<1000; i++) {
        $("#swipe-wrap").append("<div id='img_"+i+"'></div>");
      }
    }
    else {
      $(window).scroll(scrollHandler);  
    }  

    $('.end_of_media').bind('inview', function(event, visible) {
      if (visible) {
        lazyload();
      } 
    });    
    lazyload();

    $('#action_slideshow').click(slideshowHandler);
    $('.action_next_prev_img a').click(nextPrevImgHandler);
    $(".overlay").click(clickToClose);


  });
}