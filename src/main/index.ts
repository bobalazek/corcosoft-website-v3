import $ from 'jquery/dist/jquery.slim.js';

// CSS
import './css/index.scss';

// jQuery
$(document).ready(function() {
  $('[data-animation]').each(function(i) {
    var $el = $(this);
    var animation = $el.attr('data-animation');
    setTimeout(function () {
      $el
        .css('visibility', 'visible')
        .addClass('animation animation--' + animation)
      ;
    }, i * 400);
  });
});
