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
  var $section = $(".project-section-description");
  var $readMoreLink = $section.find(".readmore");
  var $longueContent = $section.find(".longue");
  var $courteContent = $section.find(".courte");

  // --- FEATURE: Détecter si la version longue est vide ---
  var isLongueEmpty = $.trim($longueContent.html()) === "";
  var isCourteNotEmpty = $.trim($courteContent.html()) !== "";

  if (isLongueEmpty && isCourteNotEmpty) {
    $courteContent.css("display", "block");
    $readMoreLink.hide();
  }
  // -------------------------------------------------------

  if ($readMoreLink.length > 0) {
    // On sauvegarde le texte d'origine du bouton au chargement
    var texteOrigine = $readMoreLink.text();

    $readMoreLink.on("click", function (e) {
      e.preventDefault();

      // On vérifie si la section est actuellement ouverte
      var isExpanded = $longueContent.hasClass("is-visible");

      // 1. On récupère la hauteur actuelle avant de tout changer
      var startHeight = $section.outerHeight();

      // 2. On fixe la hauteur pour donner un point de départ à la transition CSS
      $section.css("height", startHeight);

      // 3. On inverse la visibilité et on met à jour le texte du bouton
      if (isExpanded) {
        // Action de RÉDUIRE
        $longueContent.removeClass("is-visible");
        $courteContent.show();
        $(this).text(texteOrigine);
      } else {
        // Action de DÉPLIER
        $courteContent.hide();
        $longueContent.addClass("is-visible");
        $(this).text("Réduire");
      }

      // 4. On calcule la nouvelle hauteur cible
      // Astuce: on passe temporairement en "auto" pour lire la hauteur naturelle du nouveau contenu
      $section.css("height", "auto");
      var endHeight = $section.outerHeight();

      // On remet la hauteur de départ pour préparer l'animation
      $section.css("height", startHeight);

      // 5. On lance l'animation vers la nouvelle hauteur
      requestAnimationFrame(function () {
        $section.css("height", endHeight);
      });

      // 6. Nettoyage: Une fois la transition terminée, on remet en 'auto'
      // L'utilisation de .off() avant .one() évite que les événements s'accumulent si on clique très vite
      $section.off("transitionend").one("transitionend", function () {
        $section.css("height", "auto");
      });
    });
  }
}

function checkLongueColumns() {
  $(".project-section-description .longue").each(function () {
    var $this = $(this);
    // If the text is shorter than 450 characters, force 1 column layout
    if ($this.text().trim().length < 450) {
      $this.css("column-count", "1");
    } else {
      // Otherwise, let Webflow's default (3 columns) take over
      $this.css("column-count", "");
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
        "(max-width: 767px) 100vw, (max-width: 991px) 39vw, 100vw",
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

var mobileGalleryNumShownImages = 0;
var mobileGalleryNumHiddenImages = 0;
function logVisibleGridRowsAndColumns() {
  // Select the collection list within the specified wrapper
  var $collectionList = $(
    ".collection-list-wrapper.mobile-images .collection-list",
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
    (row) => row === "0px" || row === "0",
  );
  var hiddenColumns = gridTemplateColumns.filter(
    (column) => column === "0px" || column === "0",
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
    },
  );
}

const vcardKey = "whynotkey";
const scrambledVCardData =
  "53,45,62,39,33,78,61,38,56,37,44,115,56,42,38,56,44,54,57,82,74,64,95,126,37,95,45,18,26,23,23,84,59,7,12,15,30,13,11,85,84,79,97,35,55,77,39,21,7,25,29,14,23,89,35,13,11,0,22,126,36,55,62,77,31,17,23,1,27,31,69,24,5,11,17,7,27,17,8,17,12,5,13,115,43,34,53,34,41,66,35,49,41,43,82,61,37,49,60,37,38,60,58,67,35,36,55,50,91,24,11,11,9,78,4,9,16,55,31,17,23,1,27,31,75,24,5,11,17,7,101,32,46,41,66,35,49,41,43,82,35,36,55,50,91,24,11,11,9,78,64,81,72,64,81,65,91,87,69,95,84,65,125,41,61,60,84,32,50,53,60,74,63,54,60,36,88,27,23,28,17,82,66,85,44,128,31,0,10,90,12,28,67,34,27,5,17,27,18,6,22,0,79,66,80,41,24,2,27,24,0,1,17,80,94,72,71,88,74,85,60,3,2,17,3,18,26,21,15,1,16,97,48,43,59,83,45,55,63,49,86,50,54,37,35,85,30,29,17,13,95,17,3,28,9,29,85,91,68,18,17,14,6,22,26,65,21,25,6,17,30,98,60,32,43,78,61,38,56,37,44";

function descrambleVCardData(scrambled, key) {
  return scrambled
    .split(",")
    .map(function (value, index) {
      return String.fromCharCode(
        parseInt(value, 10) ^ key.charCodeAt(index % key.length),
      );
    })
    .join("");
}

function vCardOlivier() {
  const vcardData = descrambleVCardData(scrambledVCardData, vcardKey);

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

const PAGE_IDS = {
  allProjects: ["667935b968953faca0920638"],
  singleProject: ["6666ef1e6fb4b231ea16afbb"],
};

const MONTH_NAME_TO_INDEX = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
  janvier: 0,
  janv: 0,
  fevrier: 1,
  février: 1,
  fev: 1,
  fév: 1,
  mars: 2,
  avril: 3,
  avr: 3,
  mai: 4,
  juin: 5,
  juin: 5,
  juillet: 6,
  juil: 6,
  aout: 7,
  août: 7,
  sept: 8,
  septembre: 8,
  oct: 9,
  octobre: 9,
  novembre: 10,
  decembre: 11,
  décembre: 11,
  dec: 11,
};

function isCurrentPage(pageKey) {
  const configuredIds = PAGE_IDS[pageKey];
  if (!configuredIds) {
    console.warn("PAGE_IDS missing config for:", pageKey);
    return false;
  }
  const currentPageId = $("html").attr("data-wf-page");
  const ids = Array.isArray(configuredIds) ? configuredIds : [configuredIds];
  return ids.includes(currentPageId);
}

function parseTimeParts(hours, minutes, seconds, meridiem) {
  let h = parseInt(hours || "0", 10);
  const m = parseInt(minutes || "0", 10);
  const s = parseInt(seconds || "0", 10);

  if (meridiem) {
    const upper = meridiem.toUpperCase();
    if (upper === "PM" && h < 12) {
      h += 12;
    } else if (upper === "AM" && h === 12) {
      h = 0;
    }
  }

  return { hours: h, minutes: m, seconds: s };
}

function buildDate(year, month, day, timeParts) {
  return new Date(
    year,
    month,
    day,
    timeParts.hours,
    timeParts.minutes,
    timeParts.seconds,
  );
}

function parseNumericDateSegment(segment) {
  const cleaned = segment.trim().replace(/(\d)(st|nd|rd|th)/gi, "$1");
  const timeMatch = cleaned.match(
    /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i,
  );
  let timeParts = { hours: 0, minutes: 0, seconds: 0 };
  let datePart = cleaned;

  if (timeMatch) {
    timeParts = parseTimeParts(
      timeMatch[1],
      timeMatch[2],
      timeMatch[3],
      timeMatch[4],
    );
    datePart = cleaned.slice(0, timeMatch.index).trim();
  }

  const delimiterMatch = datePart.match(/[-\/.]/);
  if (!delimiterMatch) {
    return null;
  }
  const delimiter = delimiterMatch[0];
  const pieces = datePart.split(delimiter).map((part) => part.trim());

  if (pieces.length !== 3) {
    return null;
  }

  if (pieces[0].length === 4) {
    const year = parseInt(pieces[0], 10);
    const month = parseInt(pieces[1], 10) - 1;
    const day = parseInt(pieces[2], 10);
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
      return null;
    }
    return buildDate(year, month, day, timeParts);
  }

  let day = parseInt(pieces[0], 10);
  let month = parseInt(pieces[1], 10) - 1;
  let year = parseInt(pieces[2], 10);

  if (
    pieces[2].length === 2 &&
    !Number.isNaN(year) &&
    (year >= 0 || year < 100)
  ) {
    year += year >= 70 ? 1900 : 2000;
  }

  if (day > 31 && month < 0) {
    year = day;
    day = parseInt(pieces[2], 10);
    month = parseInt(pieces[1], 10) - 1;
  } else if (month > 11 && day <= 12) {
    const temp = day;
    day = month + 1;
    month = temp - 1;
  }

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null;
  }

  return buildDate(year, month, day, timeParts);
}

function parseTextualDateSegment(segment) {
  const cleaned = segment.trim().replace(/(\d)(st|nd|rd|th)/gi, "$1");
  const patterns = [
    /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?)?$/i,
    /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?)?$/i,
  ];

  for (let i = 0; i < patterns.length; i++) {
    const match = cleaned.match(patterns[i]);
    if (match) {
      if (i === 0) {
        const day = parseInt(match[1], 10);
        const monthName = match[2].toLowerCase();
        const year = parseInt(match[3], 10);
        const monthIndex = MONTH_NAME_TO_INDEX[monthName];
        if (
          Number.isNaN(day) ||
          Number.isNaN(year) ||
          monthIndex === undefined
        ) {
          continue;
        }
        const timeParts = parseTimeParts(
          match[4],
          match[5],
          match[6],
          match[7],
        );
        return buildDate(year, monthIndex, day, timeParts);
      } else {
        const monthName = match[1].toLowerCase();
        const day = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);
        const monthIndex = MONTH_NAME_TO_INDEX[monthName];
        if (
          Number.isNaN(day) ||
          Number.isNaN(year) ||
          monthIndex === undefined
        ) {
          continue;
        }
        const timeParts = parseTimeParts(
          match[4],
          match[5],
          match[6],
          match[7],
        );
        return buildDate(year, monthIndex, day, timeParts);
      }
    }
  }

  return null;
}

function parseDateFromAltText(text) {
  if (!text) {
    return null;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const cleaned = trimmed.replace(/(\d)(st|nd|rd|th)/gi, "$1");
  const direct = new Date(cleaned);
  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }

  const patterns = [
    /\b\d{4}[-\/.]\d{1,2}[-\/.]\d{1,2}(?:[ T]\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?)?\b/gi,
    /\b\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?)?\b/gi,
    /\b\d{1,2}\s+[A-Za-z]+(?:\s+\d{1,2})?,?\s+\d{2,4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?)?\b/gi,
    /\b[A-Za-z]+\s+\d{1,2},?\s+\d{2,4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?)?\b/gi,
  ];

  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    let match;
    while ((match = pattern.exec(cleaned)) !== null) {
      const segment = match[0];
      const native = new Date(segment);
      if (!Number.isNaN(native.getTime())) {
        return native;
      }

      const numeric = parseNumericDateSegment(segment);
      if (numeric) {
        return numeric;
      }

      const textual = parseTextualDateSegment(segment);
      if (textual) {
        return textual;
      }
    }
  }

  const pieces = cleaned.split(/[,;|]/);
  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i].trim();
    if (!piece) {
      continue;
    }
    const native = new Date(piece);
    if (!Number.isNaN(native.getTime())) {
      return native;
    }

    const numeric = parseNumericDateSegment(piece);
    if (numeric) {
      return numeric;
    }

    const textual = parseTextualDateSegment(piece);
    if (textual) {
      return textual;
    }
  }

  return null;
}

function formatDateForArchive(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return day + "/" + month + "/" + year + " " + hours + ":" + minutes;
}

function normalizeUrl(url) {
  if (!url) {
    return "";
  }
  return url.split("#")[0].split("?")[0];
}

function filenameFromUrl(url) {
  if (!url) {
    return "";
  }
  const normalized = normalizeUrl(url);
  if (!normalized) {
    return "";
  }
  const parts = normalized.split("/");
  return parts[parts.length - 1] || "";
}

function expandFilenameVariants(filename) {
  if (!filename) {
    return [];
  }

  const variants = new Set([filename]);
  const variantMatch = filename.match(/^(.*?)(?:-p-\d+|-w-\d+)(\.\w+)$/);
  if (variantMatch) {
    variants.add(variantMatch[1] + variantMatch[2]);
  }

  return Array.from(variants);
}

function collectCandidateFilenames($img, $parentLink) {
  const urlCandidates = [
    $parentLink.attr("href"),
    $img.attr("src"),
    $img.attr("data-src"),
  ];

  const srcset = $img.attr("srcset");
  if (srcset) {
    srcset.split(",").forEach(function (entry) {
      const url = entry.trim().split(" ")[0];
      if (url) {
        urlCandidates.push(url);
      }
    });
  }

  const dataSrcset = $img.attr("data-srcset");
  if (dataSrcset) {
    dataSrcset.split(",").forEach(function (entry) {
      const url = entry.trim().split(" ")[0];
      if (url) {
        urlCandidates.push(url);
      }
    });
  }

  const filenames = new Set();
  urlCandidates
    .filter(Boolean)
    .map(filenameFromUrl)
    .forEach(function (name) {
      expandFilenameVariants(name).forEach(function (variant) {
        if (variant) {
          filenames.add(variant);
        }
      });
    });

  return Array.from(filenames);
}

function removeArchiveItemsFromLightbox(archiveEntries) {
  if (!archiveEntries || archiveEntries.length === 0) {
    return false;
  }

  const filenamesToRemove = new Set();
  archiveEntries.forEach(function (entry) {
    entry.filenames.forEach(function (name) {
      filenamesToRemove.add(name);
    });
  });

  if (filenamesToRemove.size === 0) {
    return false;
  }

  let itemsRemoved = false;

  $(".project-section-images .w-dyn-items .w-lightbox").each(function () {
    const $lightboxLink = $(this);
    const $jsonScript = $lightboxLink.find("script.w-json");
    if ($jsonScript.length === 0) {
      return;
    }

    let data;
    try {
      data = JSON.parse($jsonScript.html());
    } catch (error) {
      console.warn("Unable to parse lightbox JSON", error);
      return;
    }

    if (!data || !Array.isArray(data.items)) {
      return;
    }

    const originalLength = data.items.length;

    data.items = data.items.filter(function (item) {
      const itemCandidates = [
        item.url,
        item.thumb,
        item.fileName,
        item.origFileName,
        item.mainImage,
        item._id,
      ]
        .filter(Boolean)
        .map(filenameFromUrl);

      return !itemCandidates.some(function (candidate) {
        return filenamesToRemove.has(candidate);
      });
    });

    if (data.items.length < originalLength) {
      $jsonScript.text(JSON.stringify(data));
      itemsRemoved = true;
    }
  });

  return itemsRemoved;
}

function reinitialiseWebflowLightbox() {
  if (!window.Webflow || !window.Webflow.require) {
    return;
  }

  try {
    const lightboxModule = window.Webflow.require("lightbox");
    if (!lightboxModule) {
      return;
    }

    if (typeof lightboxModule.destroy === "function") {
      lightboxModule.destroy();
    }
    if (typeof lightboxModule.ready === "function") {
      lightboxModule.ready();
    }
  } catch (error) {
    console.warn("Failed to reinitialise Webflow lightbox", error);
  }
}

function tagArchivePhotos() {
  const archiveEntries = [];
  $(".project-section-images .w-dyn-items img").each(function () {
    const altText = $(this).attr("alt");
    const parsedDate = parseDateFromAltText(altText);
    if (!parsedDate) {
      return;
    }

    const parentLink = $(this).closest("a");
    if (!parentLink.length) {
      return;
    }

    const parentItem = parentLink.closest(".w-dyn-item");
    if (!parentItem.length) {
      return;
    }

    parentLink.removeClass("archive-photo");
    parentItem.addClass("archive-photo");

    let dateWrapper = parentLink.find(".image-archive-date").first();
    if (!dateWrapper.length) {
      dateWrapper = $('<div class="image-archive-date"></div>');
      parentLink.append(dateWrapper);
    }

    let dateParagraph = dateWrapper.find("p").first();
    if (!dateParagraph.length) {
      dateParagraph = $("<p></p>");
      dateWrapper.append(dateParagraph);
    }

    dateParagraph.text(formatDateForArchive(parsedDate));

    archiveEntries.push({
      link: parentLink,
      filenames: collectCandidateFilenames($(this), parentLink),
    });
  });

  return archiveEntries;
}

function groupArchivePhotoItems() {
  const $container = $(".project-section-images .w-dyn-items");
  if (!$container.length) {
    return;
  }

  // Undo any previous grouping to avoid nesting wrappers on re-run
  $container.find(".archive-photos").each(function () {
    const $group = $(this);
    $group.children(".w-dyn-item").insertBefore($group);
    $group.remove();
  });

  let currentGroup = [];
  const flushGroup = function () {
    if (currentGroup.length >= 2) {
      const $wrapper = $('<div class="archive-photos"></div>');
      currentGroup[0].before($wrapper);
      currentGroup.forEach(function ($item) {
        $wrapper.append($item);
      });
    }
    currentGroup = [];
  };

  $container.children(".w-dyn-item").each(function () {
    const $item = $(this);
    if ($item.hasClass("archive-photo")) {
      currentGroup.push($item);
    } else {
      flushGroup();
    }
  });

  flushGroup();
}

// Detect and group consecutive vertical images (Performance Optimized)
function groupVerticalImages() {
  const $container = $(".project-section-images .w-dyn-items");
  if (!$container.length) return;

  // Only target the main project images, not the archive ones
  const $items = $container.children(".w-dyn-item:not(.archive-photo)");
  if ($items.length === 0) return;

  const orientations = [];
  let loadedChecks = 0;

  $items.each(function (index) {
    const $item = $(this);
    const img = $item.find("img.image-projet")[0];

    // Fallback if no image is found in this item
    if (!img) {
      orientations[index] = { item: $item, isVertical: false };
      checkIfAllDone();
      return;
    }

    // Extract the absolute smallest image from Webflow's srcset (usually the first one)
    let testSrc = img.src;
    if (img.srcset) {
      const srcsetParts = img.srcset.split(",");
      testSrc = srcsetParts[0].trim().split(" ")[0];
    }

    // Load ONLY the tiny image in background memory to check dimensions instantly
    const tempImg = new Image();
    tempImg.onload = function () {
      const isVertical = tempImg.naturalHeight > tempImg.naturalWidth;
      orientations[index] = { item: $item, isVertical: isVertical };
      checkIfAllDone();
    };
    tempImg.onerror = function () {
      // If error, assume horizontal to be safe
      orientations[index] = { item: $item, isVertical: false };
      checkIfAllDone();
    };

    // Trigger the background load
    tempImg.src = testSrc;
  });

  // Check if all memory images have reported their dimensions
  function checkIfAllDone() {
    loadedChecks++;
    if (loadedChecks === $items.length) {
      executeGrouping();
    }
  }

  // The actual DOM manipulation
  function executeGrouping() {
    // Clean up any existing groups just in case
    $container.find(".vertical-image-group").each(function () {
      const $group = $(this);
      $group.children(".w-dyn-item").insertBefore($group);
      $group.remove();
    });

    let verticalPair = [];
    let itemsMoved = false;

    // Loop through the results in their original DOM order
    for (let i = 0; i < orientations.length; i++) {
      const data = orientations[i];
      if (!data) continue;

      if (data.isVertical) {
        verticalPair.push(data.item);

        // Wrap when we hit two consecutive vertical images
        if (verticalPair.length === 2) {
          const $wrapper = $('<div class="vertical-image-group"></div>');
          verticalPair[0].before($wrapper);
          $wrapper.append(verticalPair[0]).append(verticalPair[1]);
          verticalPair = []; // Reset for the next pair
          itemsMoved = true;
        }
      } else {
        // Break the sequence if a horizontal image appears
        verticalPair = [];
      }
    }

    // Reinitialize Webflow's lightbox if we changed the DOM structure
    if (itemsMoved && typeof reinitialiseWebflowLightbox === "function") {
      reinitialiseWebflowLightbox();
    }
  }
}

function hideDescriptionIfEmpty() {
  $(".project-section-description").each(function () {
    // Find the children within the current .project-section-description
    var courteText = $(this).find("p.courte").text().trim();
    var longueText = $(this).find("div.longue").text().trim();

    // If both text contents are empty after trimming, hide the section
    if (courteText === "" && longueText === "") {
      $(this).hide();
    }
  });
}

function hideQuoteIfEmpty() {
  $(".project-section-quotes").each(function () {
    if ($(this).find(".quote-content").hasClass("w-dyn-bind-empty")) {
      $(this).hide();
    }
  });
}

function tagLastVisibleMetaRow() {
  // 1. Select all .meta-row elements
  // 2. Use .not() to exclude any that have the 'w-condition-invisible' class
  // 3. Use .last() to target only the final element in that filtered list
  // 4. Add the 'meta-last' class
  $(".meta-row").not(".w-condition-invisible").last().addClass("meta-last");
}

function moveInfoBlockIfSingleRow() {
  // 1. On cible toutes les lignes qui ne sont PAS cachées par Webflow
  // (J'ajoute :visible par sécurité au cas où elles seraient cachées par du CSS standard)
  var $visibleRows = $(".meta-row")
    .not(".w-condition-invisible")
    .filter(":visible");

  // 2. On vérifie s'il n'y a qu'UNE SEULE ligne visible
  // ET que cette ligne n'a PAS la classe "entreprises"
  if ($visibleRows.length === 1 && !$visibleRows.hasClass("entreprises")) {
    // 3. On déplace tout le bloc info juste avant la bannière
    $(".project-section-info-block").insertBefore(".project-section-banner");
  }
}

function initProjectPlanSliders() {
  var $sections = $(".project-section-plan");
  if ($sections.length === 0) return;

  if ($("#project-plan-slider-styles").length === 0) {
    $("head").append(
      '<style id="project-plan-slider-styles">' +
        ".project-section-plan .w-dyn-items{position:relative;overflow:hidden;}" +
        ".project-section-plan .plans-slider{position:absolute;inset:0;opacity:0;pointer-events:none;transition:opacity 250ms ease;}" +
        ".project-section-plan .plans-slider.is-active{opacity:1;pointer-events:auto;z-index:1;}" +
        ".project-section-plan .plans-slider img{display:block;width:100%;height:100%;object-fit:contain;}" +
        ".project-plan-slider-arrow{position:absolute;top:50%;z-index:3;display:flex;align-items:center;justify-content:center;width:34px;height:34px;padding:0;border:0;background:transparent;color:var(--blue,#152667);font-size:34px;line-height:1;cursor:pointer;opacity:0;transform:translateY(-50%);transition:opacity 150ms ease;}" +
        ".project-section-plan .w-dyn-items:hover .project-plan-slider-arrow{opacity:1;}" +
        ".project-plan-slider-arrow.is-prev{left:12px;}" +
        ".project-plan-slider-arrow.is-next{right:12px;}" +
        ".project-plan-slider-pills{position:absolute;left:50%;bottom:12px;z-index:3;display:flex;gap:6px;transform:translateX(-50%);}" +
        ".project-plan-slider-pill{width:7px;height:7px;padding:0;border:1px solid var(--blue,#152667);border-radius:999px;background:transparent;cursor:pointer;transition:background-color 150ms ease,transform 150ms ease;}" +
        ".project-plan-slider-pill.is-active{background:var(--blue,#152667);transform:scale(1.25);}" +
      "</style>",
    );
  }

  $sections.each(function () {
    var $section = $(this);
    if ($section.data("plan-slider-ready")) return;

    var $list = $section.find(".w-dyn-items").first();
    var $slides = $list.children(".plans-slider");
    if ($list.length === 0 || $slides.length === 0) return;

    $section.data("plan-slider-ready", true);
    $list.attr("aria-live", "polite");
    $slides.removeClass("is-active").attr("aria-hidden", "true");
    $slides.first().addClass("is-active").attr("aria-hidden", "false");
    $slides.find("img").removeAttr("loading").attr("loading", "eager");

    function resizeSlider() {
      var maxH = 0;
      var containerWidth = $list.width();

      if (containerWidth <= 0) return;

      $slides.find("img").each(function () {
        var w = this.naturalWidth || parseFloat($(this).attr("width"));
        var h = this.naturalHeight || parseFloat($(this).attr("height"));
        if (w && h) {
          var projectedH = (h / w) * containerWidth;
          if (projectedH > maxH) maxH = projectedH;
        }
      });

      if (maxH > 0) {
        $list.css("height", maxH + "px");
      }
    }

    $(window).on("resize", resizeSlider);
    $slides.find("img").on("load", resizeSlider);
    resizeSlider();
    setTimeout(resizeSlider, 250);

    if ($slides.length <= 1) return;

    var currentIndex = 0;
    var timer;
    var $prev = $(
      '<button type="button" class="project-plan-slider-arrow is-prev" aria-label="Plan précédent">‹</button>',
    );
    var $next = $(
      '<button type="button" class="project-plan-slider-arrow is-next" aria-label="Plan suivant">›</button>',
    );
    var $pills = $('<div class="project-plan-slider-pills" aria-label="Plans"></div>');

    $slides.each(function (index) {
      var $pill = $(
        '<button type="button" class="project-plan-slider-pill" aria-label="Afficher le plan ' +
          (index + 1) +
          '"></button>',
      );
      if (index === 0) $pill.addClass("is-active");
      $pills.append($pill);
    });

    $list.append($prev).append($next).append($pills);

    function showSlide(index) {
      currentIndex = index;
      $slides.removeClass("is-active").attr("aria-hidden", "true");
      $slides.eq(currentIndex).addClass("is-active").attr("aria-hidden", "false");
      $pills.children().removeClass("is-active").eq(currentIndex).addClass("is-active");
    }

    function nextSlide() {
      showSlide((currentIndex + 1) % $slides.length);
    }

    function prevSlide() {
      showSlide((currentIndex - 1 + $slides.length) % $slides.length);
    }

    function startSlider() {
      stopSlider();
      timer = setInterval(nextSlide, 3000);
    }

    function stopSlider() {
      clearInterval(timer);
    }

    $pills.on("click", ".project-plan-slider-pill", function () {
      stopSlider();
      showSlide($(this).index());
      startSlider();
    });

    $prev.on("click", function () {
      stopSlider();
      prevSlide();
    });

    $next.on("click", function () {
      stopSlider();
      nextSlide();
    });

    startSlider();
  });
}

// Call the function inside your document ready block
$(document).ready(function () {
  tagLastVisibleMetaRow();
});

$(document).ready(function () {
  initProjectPlanSliders();
  logVisibleGridRowsAndColumns();

  checkLongueColumns();

  saveOriginalOrder();
  waitForImagesToLoad(projectMasonryOrder);

  groupVerticalImages();

  hideDescriptionIfEmpty(); 
  hideQuoteIfEmpty();

  $("#oli-vcard").on("click", vCardOlivier);

  var previousColumnCount = parseInt($("#masonry").css("column-count"), 10);

  $(window).resize(function () {
    var currentColumnCount = parseInt($("#masonry").css("column-count"), 10);
    if (currentColumnCount !== previousColumnCount) { 
      previousColumnCount = currentColumnCount;
      projectMasonryOrder();
    }

    //initParallax();

    //accordionCalculateAdditionalHeight();
  });
  accordionItemClick();

  if (isCurrentPage("allProjects")) {
    $("#filtres a").each(retirerLiensCategoriesVides);

    $("#all-projects").wrap(
      '<div role="listitem" class="collection-item-9 w-dyn-item"></div>',
    );
    $("#filtres").prepend($("#all-projects").parent());

    // Bind the function to click event of filter links
    $("#filtres div a.tag").click(filterProjects);
  }

  if (isCurrentPage("singleProject")) {
    var archiveEntries = tagArchivePhotos();
    var itemsRemoved = removeArchiveItemsFromLightbox(archiveEntries);
    if (itemsRemoved) {
      reinitialiseWebflowLightbox();
    }
    groupArchivePhotoItems();
    tagLastVisibleMetaRow();
    projectReadMore();
    moveInfoBlockIfSingleRow();
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
