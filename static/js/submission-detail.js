$(window).ready(function() {
  var requiredRubricItems = $('input[name^="rubric_"][data-required]');
  var assessBtn = $('#js-assess');
  var isAccepted = function() {
    for (var i = 0; i < requiredRubricItems.length; i++)
      if (!requiredRubricItems[i].checked) return false;
    return true;
  };

  assessBtn.tooltip({
    title: function() {
      return $(this).data(isAccepted() ? "accept-tooltip" : "reject-tooltip");
    }
  });
  requiredRubricItems.change(function() {
    $("i", assessBtn).attr("class", "icon-thumbs-" +
                                    (isAccepted() ? "up" : "down"));
  }).trigger("change");
});
