(function() {
  var $ = Object,
    body = Object;

  let cls = 'other-class';
  let cls2 = 'yet-another-class';

  body.querySelectorAll(`.yet-another-class .${cls}`);
  body.find('.some-class .' + cls2 + ' .other-class');
  $('.some-class');
  body.classList.add('some-class ' + cls);
  body.classList.remove('some-class');
  body.setAttribute('class', 'some-class other-class');
  body.attr('ng-class', `{'some-class': 1, 'no-class': true, ${cls}: true}`);
  body.attr('ng-class',
      '{\'some-class\': 1, \'no-class\': true, ' + cls + ': true}');
  body.addClass('some-class');
  body.className = 'other-class ' + cls + ' yet-another-class';
})();
