// token:
//78e99139f94bdfde044307ce12d7acbe2ef16cb4c6db93c43dc666edba171879

// Function to handle the filter click event
function filterProjects(e) {
  e.preventDefault(); // Prevent default link behavior
  $("#filtres div a.tag").addClass("unchecked");
  $(this).removeClass("unchecked");

  // Get the category ID from the clicked link
  var categoryId = $(this).attr("data-id");

  // Loop through each project item
  $("#projets div[role=listitem]").each(function () {
    if (categoryId === undefined) {
      $(this).show();
      return;
    }
    var itemId = $(this).attr("data-id");
    var showItem = false;

    // Loop through the categories to find matching subItems
    categories.forEach(function (category) {
      if (category.url === itemId) {
        if (category.subItems.includes(categoryId)) {
          showItem = true;
        }
      }
    });

    // Show or hide the item based on the category filter
    if (showItem) {
      $(this).show();
    } else {
      $(this).hide();
    }
  });
}

function retirerLiensCategoriesVides() {
  var linkDataId = $(this).data("id");
  var found = false;

  $.each(categories, function (index, category) {
    if (category.subItems.includes(linkDataId)) {
      found = true;
      return false; // exit loop
    }
  });

  if (!found) {
    $(this).closest('[role="listitem"]').hide();
  }
}

function projectReadMore() {
  var richTextBlock = $("#description .rich-text-block");
  var readMoreLink = $("#description .readmore");
  var content = richTextBlock.text();
  var readmoretext = readMoreLink.text();

  // Count characters
  if (content.length > 600) {
    richTextBlock.parent().addClass("shortened");
    readMoreLink.show();
  } else {
    readMoreLink.hide();
  }

  // Toggle shortened class on click
  readMoreLink.on("click", function (e) {
    e.preventDefault();
    $("#description").toggleClass("shortened");
    if ($("#description").hasClass("shortened")) {
      $(this)
        .children("div:first-child")
        .removeClass("fleche-haut")
        .addClass("fleche-bas");
      $(this).children("div:last-child").show();
    } else {
      $(this)
        .children("div:first-child")
        .removeClass("fleche-bas")
        .addClass("fleche-haut");
      $(this).children("div:last-child").hide();
    }
  });
}

var originalOrder = [];

// Save the original order of items
function saveOriginalOrder() {
  originalOrder = [];
  $("#masonry .collection-item-2").each(function () {
    originalOrder.push($(this));
    $(this)
      .find("img")
      .attr(
        "sizes",
        "(max-width: 767px) 100vw, (max-width: 991px) 39vw, 100vw"
      );
  });
}

function restoreOriginalOrder() {
  var collectionList = $("#masonry");
  collectionList.empty();
  originalOrder.forEach(function (item) {
    collectionList.append(item);
  });
}

// Function to calculate the outer height of an array of items
function calculateTotalHeight(items) {
  var totalHeight = 0;
  items.each(function () {
    totalHeight += $(this).outerHeight(true);
  });
  return totalHeight;
}

function projectMasonryOrder() {
  var collectionList = $("#masonry");
  if (collectionList.length == 0) return;

  // Restore original order before doing anything
  restoreOriginalOrder();

  var items = $(originalOrder); // Convert the originalOrder array back into a jQuery collection

  // Get the column-count property value
  var columnCount = parseInt(collectionList.css("column-count"), 10);
  console.log("Number of columns: " + columnCount);

  // If columnCount is 1, return after restoring original order
  if (columnCount === 1) {
    return;
  }

  // Initialize an array to hold columns
  var columns = [];
  for (var i = 0; i < columnCount; i++) {
    columns.push($());
  }

  // Distribute items based on the smallest column height
  items.each(function () {
    var item = $(this);
    var smallestColumnIndex = 0;
    var smallestColumnHeight = calculateTotalHeight(columns[0]);

    for (var i = 1; i < columns.length; i++) {
      var columnHeight = calculateTotalHeight(columns[i]);
      if (columnHeight < smallestColumnHeight) {
        smallestColumnIndex = i;
        smallestColumnHeight = columnHeight;
      }
    }

    columns[smallestColumnIndex] = columns[smallestColumnIndex].add(item);
  });

  // Clear the collection list and append items in new order
  collectionList.empty();
  for (var i = 0; i < columns.length; i++) {
    collectionList.append(columns[i]);
  }
}

// Wait for all images to be loaded
function waitForImagesToLoad(callback) {
  var images = $("#masonry img");
  var loadedCount = 0;
  var totalImages = images.length;

  if (totalImages === 0) {
    callback();
    return;
  }

  images.each(function () {
    if (this.complete) {
      loadedCount++;
      if (loadedCount === totalImages) {
        callback();
      }
    } else {
      $(this)
        .one("load", function () {
          loadedCount++;
          if (loadedCount === totalImages) {
            callback();
          }
        })
        .one("error", function () {
          loadedCount++;
          if (loadedCount === totalImages) {
            callback();
          }
        });
    }
  });
}

function projectEntrepriseBold() {
  $(".meta_row .rich-text-block-2 ul li").each(function () {
    var text = $(this).html();
    var modifiedText = text.replace(/^(.+?):/, "<strong>$1:</strong>");
    $(this).html(modifiedText);
  });
}

var mobileGalleryNumShownImages = 0;
var mobileGalleryNumHiddenImages = 0;
function logVisibleGridRowsAndColumns() {
  // Select the collection list within the specified wrapper
  var $collectionList = $(
    ".collection-list-wrapper.mobile-images .collection-list"
  );

  if ($collectionList.length <= 0) {
    return;
  }

  // Get the computed style of the collection list
  var computedStyle = window.getComputedStyle($collectionList[0]);

  // Get the grid template rows and columns
  var gridTemplateRows = computedStyle
    .getPropertyValue("grid-template-rows")
    .split(" ");
  var gridTemplateColumns = computedStyle
    .getPropertyValue("grid-template-columns")
    .split(" ");

  // Filter out rows and columns that are not visible
  var hiddenRows = gridTemplateRows.filter(
    (row) => row === "0px" || row === "0"
  );
  var hiddenColumns = gridTemplateColumns.filter(
    (column) => column === "0px" || column === "0"
  );

  // Calculate the total number of hidden items
  var totalRows = gridTemplateRows.length;
  var totalColumns = gridTemplateColumns.length;
  var visibleRows = totalRows - hiddenRows.length;
  var visibleColumns = totalColumns - hiddenColumns.length;
  mobileGalleryNumShownImages = visibleRows * visibleColumns;
  mobileGalleryNumHiddenImages =
    totalRows * totalColumns - visibleRows * visibleColumns;

  if (mobileGalleryNumHiddenImages === 0) {
    $("a.seemore").hide();
  } else {
    $("a.seemore")
      .unbind("click")
      .bind("click", function (e) {
        e.preventDefault();
        // Simulate click of the child a.w-lightbox of $collectionList.collection-item-2 at the index of mobileGalleryNumHiddenImages
        $collectionList
          .find(".collection-item-2")
          .eq(mobileGalleryNumShownImages)
          .find("a.w-lightbox")
          .click();
      });
  }
}

function accordionLoadImages() {
  $(".accordion-item").each(function () {
    var $details = $(this).find(".accordion-details");
    $details
      .find("img")
      .slice(0, 4)
      .each(function () {
        // Create a temporary image to preload
        var img = new Image();
        img.src = $(this).data("src") || $(this).attr("src");
        img.srcset = $(this).attr("srcset");
        img.sizes = $(this).attr("sizes");
      });
  });
}

function accordionCalculateAdditionalHeight() {
  $(".accordion").css("height", "auto");

  var $firstAccordionItem = $(".accordion-item").first();
  var $accordionDetails = $firstAccordionItem.find(".accordion-details");

  $accordionDetails.css("display", "block");
  var additionalHeight = $accordionDetails.prop("scrollHeight");
  $accordionDetails.css("display", "none");

  $(".accordion").height(function (index, height) {
    return height + additionalHeight;
  });
}

function accordionHover() {
  let mouseInAccordion = false;
  var mouseLeaveAccordion;
  var animationDuration = 400;

  $(".accordion").unbind("mouseenter mouseleave");
  $(".accordion").bind("mousemove", function () {
    clearTimeout(mouseLeaveAccordion);
    mouseInAccordion = true;
  });

  $(".accordion").bind("mouseleave", function () {
    clearTimeout(mouseLeaveAccordion);
    mouseLeaveAccordion = setTimeout(function () {
      mouseInAccordion = false;
    }, 50);
  });

  var currentlyOpeningAnItem = false;

  $(".accordion-item").each(function (index) {
    var $this = $(this);
    var mouseLeaveTimeout;
    var mouseEnterTimeout;
    var $details = $this.find(".accordion-details");
    $this.data("open", "false");

    function onMouseEnter() {
      clearTimeout(mouseLeaveTimeout);

      if (currentlyOpeningAnItem) {
        return;
      }

      $(".accordion-item").not($(this)).trigger("mouseleave");

      mouseEnterTimeout = setTimeout(() => {
        if ($this.data("open") !== "true") {
          currentlyOpeningAnItem = true;
          $this.unbind("mouseenter");

          $details.css("display", "block");
          var autoHeight = $details.prop("scrollHeight") + "px";
          $details.css("height", autoHeight);
          $this.data("open", "true");

          setTimeout(() => {
            currentlyOpeningAnItem = false;
            $this.bind("mouseenter", onMouseEnter);
            $this.unbind("mouseleave").bind("mouseleave", onMouseLeave);
          }, animationDuration);
        }
      }, 200);
    }

    function onMouseLeave() {
      clearTimeout(mouseEnterTimeout);
      mouseLeaveTimeout = setTimeout(() => {
        if (mouseInAccordion && $this.data("open") !== "false") {
          $this.unbind("mouseleave");

          $details.css("height", "0");
          $this.data("open", "false");

          setTimeout(function () {
            $details.css("display", "none");
            $this.bind("mouseleave", onMouseLeave);
            $this.unbind("mouseenter").bind("mouseenter", onMouseEnter);
          }, animationDuration); // Match the timeout to the CSS transition duration }, 100);
        }
      }, 200);
    }

    $this.bind("mouseenter", onMouseEnter);
    $this.bind("mouseleave", onMouseLeave);
  });
}

function accordionItemClick() {
  $(".accordion-item")
    .unbind("click")
    .on("click", function () {
      var url = $(this).data("url");
      if (url) {
        window.location.href = "projets/" + url;
      }
    });
}

function whynotDynamicColours() {
  $(".hover-block-project").hover(
    function () {
      // Get the background color of the currently hovered .hover-block-project
      let bgColor = $(this).css("background-color");
      // Change the text color of all elements with the attribute "dynamic_colour"
      $("[dynamic_colour]").css({
        color: bgColor,
        "border-color": bgColor,
      });
      if (bgColor == "rgb(250, 231, 107)") {
        $("[dynamic_bg_colour]").css({
          color: "var(--blue)",
        });
      }
      $("[dynamic_bg_colour]").css({
        "background-color": bgColor,
      });
    },
    function () {
      // Reset the text color of all elements with the attribute "dynamic_colour" when hover is off
      $("[dynamic_colour]").css({
        color: "",
        "border-color": "",
      });
      $("[dynamic_bg_colour]").css({
        "background-color": "",
        color: "",
      });
    }
  );
}

function vCardOlivier() {
  const vcardData = `BEGIN:VCARD
VERSION:3.0
N:Terny;Olivier;;;
FN:Olivier Terny
ORG:whynot architecture
EMAIL;TYPE=INTERNET,WORK,pref:oli@whynot.archi
TEL;TYPE=WORK,pref:+41798581418
ADR;TYPE=WORK,pref:;;Côtes-de-Montbenon 6;Lausanne;;1003;Switzerland
URL;TYPE=WORK,pref:https://whynot.archi
END:VCARD`;

  // Create a Blob from the vCard data
  const blob = new Blob([vcardData], { type: "text/vcard" });

  // Create a temporary anchor element and trigger the download
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = "contact.vcf";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Release the object URL after the download
  URL.revokeObjectURL(url);
}

$(document).ready(function () {
  logVisibleGridRowsAndColumns();

  projectReadMore();
  saveOriginalOrder();
  waitForImagesToLoad(projectMasonryOrder);
  projectEntrepriseBold();

  $("#oli-vcard").on("click", vCardOlivier);

  var previousColumnCount = parseInt($("#masonry").css("column-count"), 10);

  $(window).resize(function () {
    var currentColumnCount = parseInt($("#masonry").css("column-count"), 10);
    if (currentColumnCount !== previousColumnCount) {
      previousColumnCount = currentColumnCount;
      projectMasonryOrder();
    }

    initParallax();

    //accordionCalculateAdditionalHeight();
  });
  accordionItemClick();

  if ($("html").attr("data-wf-page") == "667935b968953faca0920638") {
    $("#filtres a").each(retirerLiensCategoriesVides);

    $("#all-projects").wrap(
      '<div role="listitem" class="collection-item-9 w-dyn-item"></div>'
    );
    $("#filtres").prepend($("#all-projects").parent());

    // Bind the function to click event of filter links
    $("#filtres div a.tag").click(filterProjects);
  }

  if (
    !("ontouchstart" in window) &&
    !("onmsgesturechange" in window) &&
    $(window).width() >= 992
  ) {
    // Desktop functions here
    accordionLoadImages();
    //accordionCalculateAdditionalHeight();
    accordionHover();
    whynotDynamicColours();
  }
});
