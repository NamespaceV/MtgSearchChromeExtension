chrome.contextMenus.create({
    "title": "Do I have %s?",
    "contexts":["selection"],
    "onclick": function genericOnClick(info, tab){
        var url = `https://deckbox.org/mtg/${info.selectionText}`;
        chrome.tabs.create({ url: url });
    }
});

chrome.contextMenus.create({
    "title": "Scryfall %s",
    "contexts":["selection"],
    "onclick": function genericOnClick(info, tab){
        var url = `https://scryfall.com/search?q=${info.selectionText}`;
        chrome.tabs.create({ url: url });
    }
});

chrome.contextMenus.create({
    "title": "Goldfish %s",
    "contexts":["selection"],
    "onclick": function genericOnClick(info, tab)
    {
        var url = `https://www.mtggoldfish.com/q?query_string=${info.selectionText}`;
        var ajax = $.get({
            url:url,
            success : function onLoaded(data){
                var originalUrl = $(data).find("table a")[0].href;
                var replaceUrl = originalUrl.replace(/^.*\/\/[^\/]*\//, "https://www.mtggoldfish.com/" );
                chrome.tabs.create({ url: replaceUrl });
            }
        });
    }
});

chrome.contextMenus.create({
    "title": "CardMarkert %s",
    "contexts":["selection"],
    "onclick": function genericOnClick(info, tab)
    {
        var url = `https://www.cardmarket.com/en/Magic/Products/Search?searchString=${info.selectionText}`;
        var ajax = $.get({
            url:url,
            success : function onLoaded(data){
                if (!$(data).text().includes("Search Results"))
                {
                    chrome.tabs.create({ url: url });
                    return;
                }
                var originalUrl = $(data).find(".table-body .col a")[0].href;
                var replaceUrl = originalUrl.replace(/^.*\/\/[^\/]*\//, "https://www.cardmarket.com/" );
                chrome.tabs.create({ url: replaceUrl });
            }
        });
    }
});

var parentId = chrome.contextMenus.create({
    title: "Advanced",
    contexts:["selection"]
});

chrome.contextMenus.create({
    parentId: parentId,
    "title": "Goldfish -- Search",
    "contexts":["selection"],
    "onclick": function genericOnClick(info, tab){
        var url = `https://www.mtggoldfish.com/q?query_string=${info.selectionText}`;
        chrome.tabs.create({ url: url });
    }
});

chrome.contextMenus.create({
    parentId: parentId,
    "title": "CardMarkert -- Search",
    "contexts":["selection"],
    "onclick": function genericOnClick(info, tab)
    {
        var url = `https://www.cardmarket.com/en/Magic/Products/Search?searchString=${info.selectionText}`;
        chrome.tabs.create({ url: url });
    }
});

chrome.contextMenus.create({
    parentId: parentId,
    "title": "Goldfish -- Deck",
    "contexts":["selection"],
    "onclick": function genericOnClick(info, tab)
    {
        chrome.tabs.executeScript(
            null,
            { code: "window.getSelection().toString();" },
            function parseDeckFromSelectrion(text) {
                if (!text[0]) return;
                var url = `https://www.mtggoldfish.com/tools/deck_pricer?deck=${encodeURI(text[0])}`;
                chrome.tabs.create({ url: url });
            }
        );
    }
});