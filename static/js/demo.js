$(window).ready(function() {
  var password = $('#js-password');
  var postJSON = function(path, json) {
    try {
      JSON.parse(json);
    } catch (e) {
      alert("Invalid JSON: " + e);
      return;
    }

    $.ajax({
      type: "POST",
      url: path,
      data: json,
      contentType: 'application/json',
      success: function(response) {
        alert("Success! See your browser's debug console for details.");
      }
    });
  };

  $("#submissions a:first").tab('show');

  $(document).ajaxSend(function(event, jqxhr, settings) {
    settings.username = 'api';
    settings.password = password.val();
  }).ajaxError(function() {
    alert("Error! See your browser's debug console for details.");
  });

  $("#js-update-mentor").click(function() {
    postJSON("/api/mentor", $("#js-update-mentor-json").val());
  });

  $("#js-list-mentors").click(function() {
    $.get('/api/mentors', function(response) {
      $("#js-mentors").text(JSON.stringify(response, null, 2));
    });
  });

  $("form.js-submission").submit(function() {
    postJSON("/api/submit", $(this.elements['json']).val());
    return false;
  });
});
