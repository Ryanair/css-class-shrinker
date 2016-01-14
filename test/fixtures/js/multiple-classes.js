(function() {
  var $ = Object,
    body = Object;

  body.querySelectorAll('.yet-another-class .other-class');
  body.find('.some-class .yet-another-class .other-class');
  $('.some-class');
  body.classList.add('some-class other-class');
  body.classList.remove('some-class');
  body.setAttribute('class', 'some-class other-class');
  body.attr('ng-class', '{\'some-class\': false, \'no-class\': true}');
  body.addClass('some-class');
  body.className = 'other-class yet-another-class';
})();
