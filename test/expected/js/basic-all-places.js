(function() {
  var $ = Object,
    body = Object;

  body.querySelector('.sCl');
  body.querySelectorAll('.sCl');
  body.find('.sCl');
  $('.sCl');
  body.classList.add('sCl');
  body.classList.remove('sCl');
  body.classList.contains('sCl');
  body.setAttribute('ng-class', '{\'some-class\': true}');
  body.setAttribute('class', 'sCl');
  body.addClass('sCl');
  body.removeClass('sCl');
  body.hasClass('sCl');
  body.setClass(body, 'sCl', 'sCl');
  body.attr('class', 'sCl');
  body.attr('ng-class', '{\'some-class\': false}');
  body.toggleClass('sCl');
  body.getElementsByClassName('sCl');
  body.className = 'sCl';
})();
