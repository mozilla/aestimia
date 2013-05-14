$(window).ready(function() {
  $("section").each(function() {
    var title = $("h2", this).text();
    var li = $('<li></li>').appendTo(".toc");
    $('<a></a>').text(title).attr('href', '#' + this.id)
      .appendTo(li);
  });

  $(".toc li").first().addClass("active");
  $("body").attr("data-spy", "scroll").attr("data-target", ".toc")
    .scrollspy();
});
