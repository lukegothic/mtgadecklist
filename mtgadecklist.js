String.prototype.format = function() {
  var s = this;
  for (var i = 0; i < arguments.length; i++) {
    var reg = new RegExp("\\{" + i + "\\}", "gm");
    s = s.replace(reg, arguments[i]);
  }
  return s;
}
var mtgcolorToHEX = {
    "W": "#fdbd35",
    "U": "#018dc8",
    "B": "#3d3a33",
    "R": "#b7032a",
    "G": "#2c5535",
    "M": "#c2c20a",
    "O": "#777777"
};
function getBorderColor(colors) {
  switch(colors.length) {
    case 0: return mtgcolorToHEX["O"];
    case 1: return mtgcolorToHEX[colors[0]];
    default: return mtgcolorToHEX["M"];
  }
}
function parseDecklist(node) {
  var reCard = /x?(\d+)x?.?(.*?).?\((.*?)\).?(\d+)/g;
  var decklist = {
    main: [],
    side: []
  };
  do {
    card = reCard.exec(node.innerHTML);
    if (card) {
      if (card !== null) {
        decklist.main.push({
          "quantity": parseInt(card[1]),
          "name": card[2].trim(),
          "set": card[3].toLowerCase(),
          "collector_number": parseInt(card[4])
        });
      }
    }
  } while (card);
  var scryfallQ = [];
  for (var c = 0; c < decklist.main.length; c++) {
    card = decklist.main[c];
    scryfallQ.push("(s:" + card.set + " and cn:" + card.collector_number + ")");
  }
  // scryfall esta limitado a 20 nested queries, dividimos peticion en chunks de 20
  var scryfallQlimit = 20;
  var oReqs = [];
  while (scryfallQ.length > 0) {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function() {
      var scryfallData = JSON.parse(this.responseText).data;
      var data;
      for (var c = 0; c < decklist.main.length; c++) {
        card = decklist.main[c];
        for (var di = 0; di < scryfallData.length; di++) {
          data = scryfallData[di];
          if (card.set === data.set && card.collector_number == data.collector_number) {
            card.data = data;
            break;
          }
        }
      }
      var allReqFinished = true;
      for (var r = 0; r < oReqs.length; r++) {
        if (oReqs[r].readyState !== oReqs[r].DONE) {
          allReqFinished = false;
          break;
        }
      }
      if (allReqFinished) {
        console.log(decklist, node);
        showDecklist(decklist, node);
      }
    });
    oReq.open("GET", encodeURI("https://api.scryfall.com/cards/search?q=" + scryfallQ.splice(0, Math.min(scryfallQ.length, scryfallQlimit)).join("or")));
    oReqs.push(oReq);
    oReq.send();
  }
}
function showCardPreview(card, url) {
  var cardpreview = document.getElementById("cardpreview");
  if (cardpreview === null) {
    cardpreview = document.createElement("img");
    cardpreview.id = "cardpreview";
    cardpreview.width = "250";
    cardpreview.addEventListener("mouseout", hideCardPreview);
    cardpreview.addEventListener("mousemove", function(e) {
      if (e.y > parseInt(cardpreview.dataset.hideoffset) + 28) {
        hideCardPreview();
      }
    });
    document.body.appendChild(cardpreview);
  }
  var bcr = card.getBoundingClientRect();
  cardpreview.style.top = bcr.top + document.body.scrollTop;
  cardpreview.style.left = bcr.left + document.body.scrollLeft;
  cardpreview.dataset.hideoffset = bcr.top;
  cardpreview.src = url;
  cardpreview.style.display = "block";
}
function hideCardPreview() {
  var cardpreview = document.getElementById("cardpreview");
  if (cardpreview !== null) {
    cardpreview.style.display = "none";
  }
}
function showDecklist(deck, node) {
  // TODO: card type symbol, sort by type + cmc
  // TODO: settings
  var html = "";
  var template = "<div class=\"card\" onmouseover=\"javascript:showCardPreview(this, '{0}')\" style=\"background-image:url('{1}');box-shadow:inset 0 0 5px 2px {2};\" /><span class=\"quantity q-{3}\">{4}</span><span class=\"name\">{5}</span><span class=\"mc\">{6}</span></div>";
  var card, art, colors, mc;
  var rarities = {"common":0,"uncommon":0,"rare":0,"mythic":0};
  for (var c = 0; c < deck.main.length; c++) {
    card = deck.main[c];
    rarities[card.data.rarity] += card.quantity;
    art = card.data.card_faces ? card.data.card_faces[0].image_uris.normal : card.data.image_uris.normal;
    colors = card.data.card_faces ? card.data.card_faces[0].colors : card.data.colors;
    mc = card.data.card_faces ? card.data.card_faces[0].mana_cost : card.data.mana_cost;
    mcsymbols = mc.toLowerCase().replace(/\{/g, "<i class=\"ms ms-cost ms-shadow ms-").replace(/\}/g, "\"></i>");
    html += template.format(art, art, getBorderColor(colors), card.data.rarity, card.quantity, card.name, mcsymbols);
  }
  var deckfooter = "<div class=\"footer\">";
  for (var r in rarities) {
    if (rarities[r] > 0) {
      deckfooter += "<span>" + rarities[r] + "</span><span class=\"wc\ wc-" + r + "\"></span>";
    }
  }
  deckfooter += "</div>"
  node.className = "decklist";
  node.innerHTML = html + deckfooter;
}

var decklists = document.querySelectorAll("[data-decklist]");
if (decklists.length > 0) {
  var link = document.createElement('link');
  link.href = "//cdn.jsdelivr.net/npm/mana-font@latest/css/mana.min.css";
  link.rel ="stylesheet";
  link.type="text/css";
  document.head.appendChild(link);
  // inject css
  var style = document.createElement('style');
  style.innerHTML = "#cardpreview{position:absolute;z-index:999999;border-radius:10px;}.decklist{width:250px;}.card{box-sizing:border-box;position:relative;height:30px;width:100%;overflow:hidden;background-position:50% 25%;border:3px solid #1c1c1c;border-top-left-radius:10px;border-top-right-radius:10px;margin-top:-8px;}.card .quantity{position:absolute;top:0;left:0;width:16px;font-weight:bold;height:20px;line-height:20px;text-align:right;text-shadow: 0px 0px 3px #000000, 0px 0px 2px #000000, 0px 0px 1px #000000;}.card .quantity.q-common{color:#eeedee}.card .quantity.q-uncommon{color:#a4c0cf}.card .quantity.q-rare{color:#f0bd38}.card .quantity.q-mythic{color:#f95e34}.card .name{position:absolute;top:0;left:20px;color:#ffffff;font-weight:bold;height:20px;line-height:20px;text-shadow: 0px 0px 3px #000000, 0px 0px 2px #000000, 0px 0px 1px #000000;}.card .mc{position:absolute;top:4px;right:2px;height:20px;line-height:20px;}.decklist .footer{text-align:center;background-color:#1c1c1c;margin-top:-6px;padding:2px;border-bottom-left-radius:10px;border-bottom-right-radius:10px;}.decklist .footer span{font-weight:bold;color:#ffffff;}.decklist .footer .wc{margin:0 2px;font-weight:bold;height:20px;width:20px;display:inline-block;vertical-align:text-bottom;background-size:cover;}.wc.wc-common{background-image:url('data:image/png;base64,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')}.wc.wc-uncommon{background-image:url('data:image/png;base64,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')}.wc.wc-rare{background-image:url('data:image/png;base64,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')}.wc.wc-mythic{background-image:url('data:image/png;base64,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')}.ms-cost{font-size:.65em;}";
  document.head.appendChild(style);
  // process decklists
  for (var d = 0; d < decklists.length; d++) {
    parseDecklist(decklists[d]);
  }
}
