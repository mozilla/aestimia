$(function() {
  $('.evaluation-checkbox').each(function() {
    var evaluationNode = this.parentNode;
    var evaluationId = evaluationNode.id;
    var submissionId = this.parentNode.parentNode.id;
    var apiUrl = "/api/submission/" + submissionId + "/evaluation/" + evaluationId;
    $(this).on('click', function() {
      $.post(apiUrl, {pass:this.checked}, function(data) {
        console.log(data);
        $(evaluationNode).html(data);
      });
    });
  });
});
