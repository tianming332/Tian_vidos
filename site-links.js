(function () {
  "use strict";
  var live = {
    main: "https://tianming332.github.io/JiangmingTian_Portfolio_Final/",
    annual: "https://tianming332.github.io/TianJiangming-s-portfolio/",
    applied: "https://tianming332.github.io/Applied-Brand-Desig_wed/",
    video: "https://tianming332.github.io/Tian_vidos/",
    gallery: "https://tianming332.github.io/JiangmingTian_Portfolio_Final/gallery.html"
  };
  window.SITE_LINKS = Object.freeze(live);
  document.querySelectorAll("[data-site]").forEach(function (link) {
    var target = window.SITE_LINKS[link.dataset.site];
    if (target) link.href = target;
  });
}());
