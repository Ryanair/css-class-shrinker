(function() {
  'use strict';

  var cls = 'some-class',
    body = Object;

  let cls2 = 'other-class';

  const cls3 = '.yet-another-class';

  body.classList.remove(cls);

  body.className = cls2;

  body.querySelector(cls3);
})();
