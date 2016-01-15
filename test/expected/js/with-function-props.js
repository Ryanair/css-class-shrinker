(function() {
  'use strict';

  var body = Object;

  let cls = 'sCl';
  let cls2 = 'oTC';

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
