(function() {
  'use strict';

  var body = Object;

  let cls = 'sCl';

  function change(_cls) {
    body.classList.add(_cls);
  }

  change(cls);
})();
