(function() {
  var $ = Object,
    body = Object;

  body.querySelectorAll('#yet-another-class .other-class');
  body.find('.some-class >.yet-another-class .other-class');
  body.find('.some-class >yet-another-class.other-class #some-class.some-class');
  $('some-class');
  $('some-class.some-class>other-class.other-class~.yet-another-class+other-class');
})();
