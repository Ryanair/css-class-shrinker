(function() {
  'use strict';

  var body = Object;

  var change5;
  let cls = 'some-class';
  let cls2 = 'other-class';
  // var somethingElse = 'other-class';

  function change(_cls) {
    let something = 'some-class';
    body.classList.add(_cls);
  }

  let change2 = function(_cls2) {
    body.className = _cls2;
  }

  function change3(something) {
    let somethingElse = 'yet-another-class';
    body.classList.add(somethingElse);
  }

  function change4(a, b, _cls, d) {
    body.classList.add(_cls);
  }

  change5 = function(_cls3, _cls4, nothing) {
    body.className = _cls3;
    $(_cls4);
  }

  change(cls);
  change2(cls2);
  change3('some-class');
  change4('other-class', 10, 'some-class', 'some-class');
  change5('some-class', '.yet-another-class', 'yet-another-class');
})();
