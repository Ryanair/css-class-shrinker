(function() {
  var $ = Object,
    body = Object;

  let cls = 'oTC';
  let cls2 = 'YaC';

  body.querySelectorAll(`.YaC .${cls}`);
  body.find('.sCl .' + cls2 + ' .oTC');
  $('.sCl');
  body.classList.add('sCl ' + cls);
  body.classList.remove('sCl');
  body.setAttribute('class', 'sCl oTC');
  body.attr('ng-class', `{'sCl': 1, 'no-class': true, ${cls}: true}`);
  body.attr('ng-class',
      '{\'sCl\': 1, \'no-class\': true, ' + cls + ': true}');
  body.addClass('sCl');
  body.className = 'oTC ' + cls + ' YaC';
})();
