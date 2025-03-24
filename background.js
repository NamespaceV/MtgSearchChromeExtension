var callbacks = {}

chrome.contextMenus.create({
    "id": "my-check",
    "title": "Do I have %s?",
    "contexts":["selection"],
});
callbacks["my-check"] = function deckboxSearch(info, tab){
    var url = `https://deckbox.org/mtg/${info.selectionText}`;
    chrome.tabs.create({ url: url });
}


chrome.contextMenus.create({
    "id": "scryfall-check",
    "title": "Scryfall %s",
    "contexts":["selection"],
});
callbacks["scryfall-check"] = function scryfallSearch(info, tab){
    var url = `https://scryfall.com/search?q=${info.selectionText}`;
    chrome.tabs.create({ url: url });
}


chrome.contextMenus.create({
    "id": "goldfish-check",
    "title": "Goldfish %s",
    "contexts":["selection"],
});
callbacks["goldfish-check"] = async function goldfishSearch(info, tab)
{
    var url = `https://www.mtggoldfish.com/q?query_string=${info.selectionText}`;
    var response = await fetch(url);
    if  (!response.ok){
        return;
    }
    var htmlText = await response.text();

    let [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
    let scriptResult = await chrome.scripting.executeScript({
        target: {tabId:activeTab.id},
        func: parseGoldfishLinks,
        args: [htmlText]
    });
    //console.log("result", scriptResult);
    //chrome.tabs.create({ url: replaceUrl });
}
function parseGoldfishLinks(htmlText){
    //console.log("parseGoldfishLinks executed");
    var doc = new DOMParser().parseFromString(htmlText, 'text/html');
    var link = doc.querySelector("table a");
    var originalUrl = link.href;
    var replaceUrl = originalUrl.replace(/^.*\/\/[^\/]*\//, "https://www.mtggoldfish.com/" );
    window.open(replaceUrl,'_blank').focus();
    return replaceUrl;
}

chrome.contextMenus.create({
    "id": "mcm-check",
    "title": "CardMarkert %s",
    "contexts":["selection"],
});
callbacks["mcm-check"] = async function genericOnClick(info, tab) 
{
    var url = `https://www.cardmarket.com/en/Magic/Products/Search?searchString=${info.selectionText}`;
    var response = await fetch(url);
    if  (!response.ok){
        return;
    }
    var htmlText = await response.text();

    let [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
    let scriptResult = await chrome.scripting.executeScript({
        target: {tabId:activeTab.id},
        func: parseMcmLinks,
        args: [htmlText, url]
    });
}
function parseMcmLinks(htmlText, url){
    //console.log("parseMcmLinks executed");
    if (!htmlText.includes("Search Results")){
        window.open(url,'_blank').focus();
        return;
    }
    var doc = new DOMParser().parseFromString(htmlText, 'text/html');
    var link = doc.querySelector(".table-body .col a");
    var originalUrl = link.href;
    var replaceUrl = originalUrl.replace(/^.*\/\/[^\/]*\//, "https://www.cardmarket.com/" );
    window.open(replaceUrl,'_blank').focus();
    return replaceUrl;
}
var parentId = chrome.contextMenus.create({
    id: "advanced-submenu",
    title: "Advanced",
    contexts:["selection"]
});

chrome.contextMenus.create({
    parentId: parentId,
    "id": "goldfish-search",
    "title": "Goldfish -- Search",
    "contexts":["selection"],
});
callbacks["goldfish-search"] = function genericOnClick(info, tab){
    var url = `https://www.mtggoldfish.com/q?query_string=${info.selectionText}`;
    chrome.tabs.create({ url: url });
}

chrome.contextMenus.create({
    parentId: parentId,
    "id": "mcm-search",
    "title": "CardMarkert -- Search",
    "contexts":["selection"],
});
callbacks["mcm-search"] = function genericOnClick(info, tab)
{
    var url = `https://www.cardmarket.com/en/Magic/Products/Search?searchString=${info.selectionText}`;
    chrome.tabs.create({ url: url });
}

chrome.contextMenus.create({
    parentId: parentId,
    "id": "goldfish-deck",
    "title": "Goldfish -- Deck",
    "contexts":["selection"],
});
callbacks["goldfish-deck"] = async function genericOnClick(info, tab)
{
    let [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
    let scriptResult = await chrome.scripting.executeScript({
        target: {tabId:activeTab.id},
        func: copyDeckAndGoldfishIt,
        args: []
    });
}
function copyDeckAndGoldfishIt(){
    var deckText = window.getSelection().toString();
    var url = `https://www.mtggoldfish.com/tools/deck_pricer?deck=${encodeURI(deckText)}`;
    window.open(url,'_blank').focus();
}


function contextClick(info, tab) {
    const { menuItemId } = info
    let callback = callbacks[menuItemId]
    callback(info, tab);
}
chrome.contextMenus.onClicked.addListener(contextClick)
