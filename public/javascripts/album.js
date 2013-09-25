function initAlbum(eventId) {

  var maxId = "", minId = "";
  var cachedList = []; // not in use yet
  var set = false;

  function refresh(data) {
    var $medialist = $(".media");
    var length = data.length; 
    if(length > 0) {
      for (var i = 0; i < length; i++) {
        //$(".media").prepend("<img class='fade" + (i % 3) + "' src='" + data[i].images.thumbnail.url + "' rel='" + data[i].images.standard_resolution.url + "'/>");        
        // $(".media").append("<img class='fade" + (i % 3) + "' src='" + data[i].images.thumbnail.url + "' rel='" + data[i].images.standard_resolution.url + "'/>");        
        $(".media").append("<img class='fade2' src='" + data[i].images.thumbnail.url + "' rel='" + data[i].images.standard_resolution.url + "'/>");        
      }        

      // update last id
      minId = data[0].id;
      maxId = data[length - 1].id;
      console.log("max:" + maxId + " min:" + minId);

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
    }, 1000);
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

  $(document).ready(function() {
    var myHeader = $('header');
    var myContentHeader = $('.content_header');

    myHeader.data( 'position', myHeader.position() );
    myContentHeader.data( 'position', myContentHeader.position() );

    $(window).scroll(function() {
      hPos = myContentHeader.data('position'), scroll = getScroll();
      if ( hPos.top < scroll.top ) {
        myContentHeader.addClass('fixed');
      }
      else {
        myContentHeader.removeClass('fixed');
      }
    });

    $('.end_of_media').bind('inview', function(event, visible) {
      if (visible) {
        lazyload();
      } 
    });    
    lazyload();
  });
}