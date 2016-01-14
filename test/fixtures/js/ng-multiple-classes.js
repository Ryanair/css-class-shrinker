(function() {
  var body = Object;

  body.querySelectorAll('.yet-another-class .other-class');
  body.attr('ng-class', '{\'some-class\': false, \'no-class\': true}');
  body.addClass('some-class');
  body.className = 'other-class yet-another-class';
})();
