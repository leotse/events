function initAlbum(eventId, pollInterval, slideInterval) {

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


  // refresh UI with the new data
  function refresh(data, prepend) {
    var $medialist = $(".media");
    var length = data.length; 
    var append = prepend === undefined || prepend === false;

    if(length > 0) {
      for (var i = 0; i < length; i++) {
        // create image
        var $img = $("<img class='fade2' src='" + data[i].images.thumbnail.url + "' rel='" + data[i].id + "'/>");
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

  function poll() {
    $.ajax({
      type: 'GET',
      dataType: 'json',
      url: '/api/events/' + eventId + '/media?from=' + maxId,
      success: function (data) {
        console.log(data);
        // if there's data, refresh grid
        if(data.length > 0) refresh(data);
      },
      complete: pollAgain
    });
  }

  function pollAgain() {
    setTimeout(function () {
      poll();
    }, pollInterval); // to-do: set this to 15 min for production
  };

  function getScroll () {
    var b = document.body;
    var e = document.documentElement;
    return {
      left: parseFloat( window.pageXOffset || b.scrollLeft || e.scrollLeft ),
      top: parseFloat( window.pageYOffset || b.scrollTop || e.scrollTop )
    };
  }

  function lazyload() {
    //if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
      $.ajax({
        type: 'GET',
        dataType: 'json',
        url: '/api/events/' + eventId + '/media?max_id=' + maxId,
        success: function (data) {
          console.log(data);
          // if there's data, refresh grid
          if(data.length > 0) refresh(data);                    
        }
      });      
    //}
  }

  function slideshowHandler(e) {
    $(".overlay").addClass("active slideshow");
    $("body").attr("style", "overflow: hidden");
    if(slideTimer !== null) { clearTimeout(slideTimer); }
    slideNext();
  }

  function slideNext() {
    // increment index or reset current index if already reached the end
    if(++slideCurrentIndex === cachedList.length) {   
      slideCurrentIndex = 0;
    }
    console.log(slideCurrentIndex);
    var media = cachedList[slideCurrentIndex];
    var created = media.created_time;
    var fx = fxlist[slideCurrentIndex % fxlist.length];
    // var fxout = fxoutlist[slideCurrentIndex % fxoutlist.length];
    $(".media_details").html("");
    $(".media_details").append("<div class='details_desc fade1'>"+media.caption.text+"</div>");
    $(".media_details").append("<img class='details_author_img fade2' src='"+media.user.profile_picture+"' />");
    $(".media_details").append("<div class='details_author fade2'>By: "+media.user.full_name+"</div>");
    $(".media_details").append("<div class='details_created fade3'>Date: "+created+"</div>");
    $(".media_img_container img").attr("src", media.images.standard_resolution.url);
    $(".media_img_container img").removeClass(); // clear class
    $(".media_img_container img").addClass('animated '+fx); // add animation class
    
    // recur slideNext    
    slideTimer = setTimeout(slideNext, slideInterval); // to-do: set this to 15 min for production
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
    console.log(slideTimer);
    if(slideTimer !== undefined) {       
      clearTimeout(slideTimer); 
    } // clear timers
  }  

  function loadMediaDetails(mediaIndex) {
    if(mediaIndex !== undefined) {      
      var media = cachedList[mediaIndex];
      var created = media.created_time;
      $(".media_details").html("");
      $(".media_details").append("<div class='details_desc fade1'>"+media.caption.text+"</div>");
      $(".media_details").append("<img class='details_author_img fade2' src='"+media.user.profile_picture+"' />");
      $(".media_details").append("<div class='details_author fade2'>By: "+media.user.full_name+"</div>");
      $(".media_details").append("<div class='details_created fade3'>Date: "+created+"</div>");
      $(".media_img_container img").attr("src", media.images.standard_resolution.url);
      $(".media_img_container img").attr("class", "fade1");
    }
  }

  function nextPrevImgHandler(e) {
    if($(this).attr("id") === "action_next_img") {
      mediaIndex = ++mediaIndex === cachedList.length? 0: mediaIndex; 
      console.log("next");
    }
    else {
      mediaIndex = --mediaIndex === -1? cachedList.length - 1: mediaIndex; 
      console.log("prev");
    }

    console.log(mediaIndex);
    loadMediaDetails(mediaIndex);
  }

  function mediaDetailsHandler(e) {
    $(".overlay").addClass("active");    
    $("body").attr("style", "overflow: hidden");
    console.log(this);

    var id = $(this).attr("rel");

    if(id !== "") {
      mediaIndex = findMediaItemById(id);
      loadMediaDetails(mediaIndex);
    }
  }

  function scrollHandler() {
    var hPos = myContentHeader.data('position'), scroll = getScroll();
    if ( hPos.top < scroll.top ) {
      myContentHeader.addClass('fixed');
      $(".event").css("margin-top", "120px");
      $("#action_scrolltop").addClass("active");
    }
    else {
      myContentHeader.removeClass('fixed');
      $(".event").css("margin-top", "0");
      $("#action_scrolltop").removeClass("active");
    }    
  }

  $(document).ready(function() {
    myHeader = $('header');
    myContentHeader = $('.content_header');
    myHeader.data( 'position', myHeader.position() );
    myContentHeader.data( 'position', myContentHeader.position() );

    $(window).scroll(scrollHandler);

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