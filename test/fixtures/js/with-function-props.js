(function() {
  'use strict';

  var body = Object;

  let cls = 'some-class';
  let cls2 = 'other-class';

  function change(_cls) {
    let something = 'some-class';
    body.classList.add(_cls);
  }

  let change2 = function(_cls2) {
    body.className = _cls2;
  }

  change(cls);
  change2(cls);
})();
