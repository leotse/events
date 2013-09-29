function initAlbum(eventId) {

  var maxId = "", minId = "";
  var cachedList = []; // not in use yet
  var set = false;

  var myHeader, myContentHeader;

  function refresh(data) {
    var $medialist = $(".media");
    var length = data.length; 

    if(length > 0) {
      for (var i = 0; i < length; i++) {
        //$(".media").prepend("<img class='fade" + (i % 3) + "' src='" + data[i].images.thumbnail.url + "' rel='" + data[i].images.standard_resolution.url + "'/>");        
        // $(".media").append("<img class='fade" + (i % 3) + "' src='" + data[i].images.thumbnail.url + "' rel='" + data[i].images.standard_resolution.url + "'/>");        
        
        // create image
        var $img = $("<img class='fade2' src='" + data[i].images.thumbnail.url + "' rel='" + data[i].id + "'/>");
        
        // append image
        $(".media").append($img);

        // hook up click handler     
        $img.click(mediaDetailsHandler); 
        cachedList.push(data[i]);
      }        

      // update last id
      minId = data[0].id;
      maxId = data[length - 1].id;
      //console.log("max:" + maxId + " min:" + minId);

      if($(".end_of_media:in-viewport").length > 0) {
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

    if(id != "") {
      console.log("here");
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

  function scrollFixedTopHandler() {
    var hPos = myContentHeader.data('position'), scroll = getScroll();
    if ( hPos.top < scroll.top ) {
      myContentHeader.addClass('fixed');
    }
    else {
      myContentHeader.removeClass('fixed');
    }
  }

  $(document).ready(function() {
    myHeader = $('header');
    myContentHeader = $('.content_header');
    myHeader.data( 'position', myHeader.position() );
    myContentHeader.data( 'position', myContentHeader.position() );

    $(window).scroll(scrollFixedTopHandler);

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