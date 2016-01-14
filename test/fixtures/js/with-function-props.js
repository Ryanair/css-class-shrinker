(function() {
  'use strict';

  var body = Object;

  let cls = 'some-class';

  function change(_cls) {
    body.classList.add(_cls);
  }

  change(cls);
})();
