(function() {
  'use strict';

  var body = Object;

  var change5;
  let cls = 'sCl';
  let cls2 = 'oTC';
  var somethingElse = 'other-class';

  function change(_cls) {
    let something = 'some-class';
    body.classList.add(_cls);
  }

  let change2 = function(_cls2) {
    body.className = _cls2;
  }

  function change3(something) {
    let somethingElse = 'YaC';
    body.classList.add(somethingElse);
  }

  function change4(a, b, _cls, d) {
    body.classList.add(_cls);
  }

  change5 = function(_cls3, _cls4, nothing) {
    body.className = _cls3;
    $(_cls4);
  }

  let somethingDifferent = 'some-class';
  function change6(someClass) {
    let somethingDifferent = 'YaC';
    (function() {
      body.classList.add(somethingDifferent);
      body.setAttribute('class', someClass);
    })();
  }

  function inception(_cls5) {
    change(_cls5);
  }

  change(cls);
  change2(cls2);
  change3('some-class');
  change4('other-class', 10, 'sCl', 'some-class');
  change5('sCl', '.YaC', 'yet-another-class');
  change6('oTC');
  inception('sCl');
})();
