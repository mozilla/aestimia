$(window).ready(function() {
  var password = $('#js-password');

  $("#submissions a:first").tab('show');
  $("form.js-submission").submit(function() {
    var json = $(this.elements['json']).val();

    try {
      JSON.parse(json);
    } catch (e) {
      alert("Invalid JSON: " + e);
      return false;
    }

    $.ajax({
      type: "POST",
      url: "/api/submit",
      data: json,
      contentType: 'application/json',
      username: 'api',
      password: password.val(),
      success: function(response) {
        alert("Success! See your browser's debug console for details.");
      },
      error: function(req) {
        alert("Error! See your browser's debug console for details.");
      }
    });
    return false;
  });
});
