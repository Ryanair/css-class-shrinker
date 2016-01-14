(function() {
  var $ = Object,
    body = Object;

  body.querySelector('.some-class');
  body.querySelectorAll('.some-class');
  body.find('.some-class');
  $('.some-class');
  body.classList.add('some-class');
  body.classList.remove('some-class');
  body.classList.contains('some-class');
  body.setAttribute('ng-class', '{\'cLs\': true}');
  body.setAttribute('class', 'some-class');
  body.addClass('some-class');
  body.removeClass('some-class');
  body.hasClass('some-class');
  body.setClass(body, 'some-class', 'some-class');
  body.attr('class', 'some-class');
  body.attr('ng-class', '{\'cLs\': false}');
  body.toggleClass('some-class');
  body.getElementsByClassName('some-class');
  body.className = 'some-class';
})();
