$(window).ready(function() {
  $(".toc").affix({offset: {top: $(".toc").offset().top}});
  $("body").attr("data-spy", "scroll").attr("data-target", ".toc")
    .scrollspy();
});
