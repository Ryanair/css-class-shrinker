(function() {
  'use strict';

  var cls = 'some-class',
    body = Object,
    cls5, cls6;

  let cls2 = 'other-class';

  const cls3 = '.yet-another-class';

  const cls4 = 'yet-another-class';

  cls5 = '.some-class';

  cls6 = 'other-class';

  body.classList.remove(cls);

  body.className = cls2;

  body.querySelector(cls3);

  body.setAttribute('class', cls4);

  $(cls5);

  body.setClass(body, cls6);
})();
