// ARGUMENTS.
// ==============================================
// key = "t" + tabId, value = windowId.
var tabsList = {};
// this agruments is ID of GUI structure.
var rootTabsId = '';

// DEBUG FUNCTIONS.
// ==============================================
var showObjProperties = function(obj) {
    //console.log(obj.toString())
    for(var i in obj){
        console.log(i + " : " + obj[i]);
    }
};
var addTabsList = function(id, windowId) {
    var tid = "t" + id;
    tabsList[tid] = windowId;
};
var removeTabsList = function(id) {
    var tid = "t" + id;
    delete tabsList[tid];
};
// has tabId on TabsLists.
var hasWindowId = function(id) {
//  var tid = "t" + id;
    return tabsList[id]; 
}
// Test 
chrome.tabs.onCreated.addListener(function(tab){
    console.log("onCreated");
    console.log(tab.status);
    //console.log(tab);
    if(tab.status === "loading") {
        console.log(tab);
        var id = chrome.contextMenus.create({"id": "t" + tab.id,
                                    "title": tab.title,
                                    "parentId": rootTabsId,
                                    "onclick": moveTab}, 
                                   addTabsList(tab.id, tab.windowId)
                                  );
        console.log("onCreate id is: " + id);
    };
});
//  
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    console.log("TabId: " + tabId);
    console.log(tab);
    console.log(changeInfo.status);
    if (tab.status === "complete"){
        console.log("Update Data.");
        // Update tabsList(Data.) in this Programs.
        var id = chrome.contextMenus.create({"id": "t" + tabId,
                                             "title": tab.title, 
                                             "parentId": rootTabsId,
                                             "onclick": moveTab
                                            },
                                            addTabsList(tab.id, tab.windowId)
                                           );
        chrome.contextMenus.update("t" + tabId, {"title": tab.title});
        //console.log("onUpdated: Compelte. Added TabId: " + id);
    }
});

// 
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
    console.log(removeInfo);
    console.log(tabId);
    chrome.contextMenus.remove(("t" + tabId),
                               function(){
                                   console.log("Tab Removed: " + tabId);
                                   removeTabsList(tabId);
                               });
});
chrome.tabs.onDetached.addListener(function(tabId, detachInfo){
    console.log("onDetached tabId: " + tabId);
    console.log(detachInfo);
    addTabsList(tabId, detachInfo.oldWindowId);
});
chrome.tabs.onAttached.addListener(function(tabId, attachInfo){
    console.log("onAttached tabId: " + tabId);
    console.log(attachInfo);
    addTabsList(tabId, attachInfo.newWindowId);
});
// -------------------------------------------------------
// between currentTab to other Tab. 
var moveTab = function(info, tab) {
    console.log("move tab");
    console.log(info);
    //console.log(tab.id);
    var currentWindowId;
    chrome.tabs.query({"active": true,
                       "currentWindow": true},
                      function(result){
                          currentWindowId = result[0].windowId;
                          console.log("Get CurrentWindowId: " + currentWindowId);
                          moveTab2(currentWindowId, info);
                      });
}
function moveTab2(cWindowId, info) {
    console.log("Parse CurrnetWindowId: " + cWindowId);
    var nWindowId = hasWindowId(info.menuItemId);
    if (cWindowId === nWindowId){
        console.log("Current Window.");
        chrome.tabs.update(parseInt(info.menuItemId.substr(1)), {"active": true});
    } else {
        console.log("To Other Window.");
        chrome.windows.update(nWindowId, 
                              {"focused": true},
                              function(){
                                  chrome.tabs.update(parseInt(info.menuItemId.substr(1)), {"active": true});
                              });
    }
}
var test;
var initThis = function() {
    var currentWindowId;
    chrome.tabs.query({"currentWindow": true},
                      function(result){
                          console.log("[INIT] Begin.");
                          console.log(result);
                          test = result;
                          result.forEach(function(element, index){
                              var id = chrome.contextMenus.create({"id": "t" + element.id,
                                                                   "title": element.title, 
                                                                   "parentId": rootTabsId,
                                                                   "onclick": moveTab
                                                                  },
                                                                  addTabsList(element.id, element.windowId)
                                                                 );
                          });
                          console.log("[INIT] Finished.");            
                      });
}
// -------------------------------------------------------
// add Options. (options-Obj.id is "op" +  "id")
window.onload = function() {
    rootTabsId = chrome.contextMenus.create({"id": "tb1", "type": "normal", "title": "Open Your Tabs!"});
    initThis();
}