function initAlbum(eventId) {

  var maxId = "", minId = "";
  var cachedList = []; // cache of all the images loaded in view
  var newImages = []; // cache of all the new images in polling, but not loaded
  var lastScroll = 0; // for detecting scroll up or down

  var myHeader, myContentHeader;

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
    }, 1000); // to-do: set this to 15 min for production
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
    $(".overlay").show();
    $("body").attr("style", "overflow: hidden");
  }

  function findMediaItemById(id) {
    var l=cachedList.length;
    for(var i=0; i<l; i++) {
      if(cachedList[i].id === id) return cachedList[i];
    }
    return undefined;
  }

  function clickToClose(e) {
    $(".overlay").hide();
    $("body").attr("style", "overflow: auto");
  }

  function mediaDetailsHandler(e) {
    $(".overlay").show();    
    $("body").attr("style", "overflow: hidden");
    console.log(this);

    var id = $(this).attr("rel");

    if(id !== "") {
      var media = findMediaItemById(id);      
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

  function scrollHandler() {
    var hPos = myContentHeader.data('position'), scroll = getScroll();
    if ( hPos.top < scroll.top ) {
      myContentHeader.addClass('fixed');
      $(".event").css("margin-top", "120px");
    }
    else {
      myContentHeader.removeClass('fixed');
      $(".event").css("margin-top", "0");
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
    $(".overlay").click(clickToClose);
  });
}