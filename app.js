$(document).ready(function () {
  $("#search_form").submit(function (e) {
    e.preventDefault()

    var search_terms = $("#search_field").val();
    if (search_terms.length > 0) {
      doTroveSearch(search_terms)
    }
  });
});

function doTroveSearch(search_terms) {
  var TROVE_API_BASE_URL = "https://api.trove.nla.gov.au/v2/result";
  var TROVE_API_KEY = "pdp9gliahqs834fe";

  $.getJSON(TROVE_API_BASE_URL, {
    key: TROVE_API_KEY,
    q: search_terms,
    zone: "picture",
    "l-place": "Australia/Western Australia",
    sortby: "datedesc",
    n: "50",
    "l-availability": "y",
  }, function (data) {
    var works = data.response.zone[0].records.work;
    $.each(works, function (index, element) {
      var work = works[index];
      var thumbnail = work.identifier.find((function (obj) {
        return obj.linktype === "thumbnail"
      }))

      if (typeof thumbnail === "undefined") {
        var thumbnail = work.identifier[0]
        var thumbnail_url = thumbnail.value
      } else if (thumbnail.value.indexOf("slwa") !== -1) {
        var thumbnail_url = thumbnail.value
      } else {
        var thumbnail_url = thumbnail.value
      }

      if (thumbnail_url.indexOf("slwa")) {
        if (thumbnail_url.slice(-4) === ".png") {
          var thumbnail_url = thumbnail_url.replace(".png", ".jpg")
        }
        if (thumbnail_url.slice(-4) !== ".jpg") {
          var thumbnail_url = thumbnail_url + ".jpg"
        }
      }


      var template = document.getElementById("template").innerHTML;
      var rendered = Mustache.render(template, {
        full_size_url: thumbnail_url,
        thumbnail_url: thumbnail_url,
        thumbnail_alt: "There should be an image here...",
        contributor: work.contributor,
        issued: work.issued,
        text: work.title,
        open_url: work.troveUrl,
      });
      $("div.container.results").append(rendered)
    });
  });
}