import jQuery from 'jquery';

// CSS
import './css/index.scss';

// jQuery
jQuery(document).ready(function($) {
  $('[data-animation]').each(function(i) {
    var $el = $(this);
    var animation = $el.attr('data-animation');
    setTimeout(function () {
      $el
        .css('visibility', 'visible')
        .addClass('animate__animated animate__' + animation)
      ;
    }, i * 400);
  });
});
