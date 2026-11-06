var charts = [
  ["#chart01", "js/chart01_food_wine_spending.vg.json"],
  ["#chart02", "js/chart02_sa_origin_spend.vg.json"],
  ["#chart03", "js/chart03_sa_spend_cartogram.vg.json"],
  ["#chart04", "js/chart04_wine_gi_footprints.vg.json"],
  ["#chart05", "js/chart05_regional_symbol_map.vg.json"],
  ["#chart06", "js/chart06_food_market_state_shares.vg.json"],
  ["#chart07", "js/chart07_regional_average_stay_slope.vg.json"],
  ["#chart08", "js/chart08_regional_visitor_nights_lollipop.vg.json"],
  ["#chart09", "js/chart09_sa_spend_per_night_choropleth.vg.json"],
  ["#chart10", "js/chart10_sa_spend_composition_heatmap.vg.json"],
  ["#chart11", "js/chart11_barossa_hunter_butterfly.vg.json"]
];

// Each panel is a standard, independently responsive Vega-Lite view.
// Charts 04 and 09 have no linked selections, so their existing panels can
// share a card while each fills its own full-width HTML container (Week 9).
function responsivePanels(specification) {
  var panels = specification.hconcat || [specification];

  return panels.map(function (panel) {
    var prepared = Object.assign({}, panel);
    prepared.$schema = specification.$schema;
    prepared.config = specification.config;
    prepared.width = "container";
    prepared.autosize = { type: "fit-x", contains: "padding" };
    return prepared;
  });
}

function embedPanel(container, specification) {
  return vegaEmbed(container, specification, {
    actions: false,
    renderer: "svg"
  }).then(function () {
    var svg = container.querySelector("svg");
    if (svg) {
      function syncViewBox() {
        svg.setAttribute("viewBox", "0 0 " + svg.getAttribute("width") + " " + svg.getAttribute("height"));
      }
      syncViewBox();
      new MutationObserver(syncViewBox).observe(svg, {
        attributes: true,
        attributeFilter: ["width", "height"]
      });
    }
  });
}

function loadCharts() {
  if (typeof vegaEmbed !== "function") {
    charts.forEach(function (chart) {
      var container = document.querySelector(chart[0]);

      if (container) {
        container.textContent = "Vega-Embed did not load. Check your internet connection.";
      }
    });
    return;
  }

  charts.forEach(function (chart) {
    var container = document.querySelector(chart[0]);

    fetch(chart[1]).then(function (response) {
      if (!response.ok) {
        throw new Error("Specification request failed: " + response.status);
      }
      return response.json();
    }).then(function (specification) {
      var panels = responsivePanels(specification);
      container.textContent = "";
      return Promise.all(panels.map(function (panel, index) {
        var child = document.createElement("div");
        child.className = "chart-panel";
        child.id = container.id + "-panel-" + (index + 1);
        container.appendChild(child);
        return embedPanel(child, panel);
      }));
    }).catch(function (error) {
      console.error("Could not load " + chart[0], error);

      if (container) {
        container.textContent = "Chart could not load. Check Live Server and the browser console (F12).";
      }
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadCharts);
} else {
  loadCharts();
}
