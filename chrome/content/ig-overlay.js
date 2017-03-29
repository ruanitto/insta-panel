"use strict";

/**
 * instagram_panel namespace.
 */
if ("undefined" == typeof(instagram_panel)) {
  var instagram_panel = {};
};

instagram_panel.sibPref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

instagram_panel.BrowserOverlay = {

  resizePanel: function(){ //resize the panel with the preference %.
    var panelWidth = instagram_panel.sibPref.getIntPref("extensions.instagram_panel.panelWidth")/100;
    var panelHeight = instagram_panel.sibPref.getIntPref("extensions.instagram_panel.panelHeight")/100;
    var panel = document.getElementById("instagram_panel-panel");
    panel.sizeTo(window.screen.availWidth*panelWidth,window.screen.availHeight*panelHeight);
  },

  setFavicon: function (){ //This function set the button's image with the favicon of instagram Web (change with unread messages).
    var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                     .getInterface(Components.interfaces.nsIWebNavigation)
                     .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                     .rootTreeItem
                     .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                     .getInterface(Components.interfaces.nsIDOMWindow);

    var igButton = mainWindow.document.getElementById("instagram_panel-toolbar-button");
    var igButton = mainWindow.document.getElementById("instagram_panel-iframe").contentDocument;

    try{
      var faviconUrl = igButton.getElementById("favicon").href;
      igButton.setAttribute("image",faviconUrl);
    }catch(e){
      //do nothing.
    };
  },

  setinstagramIframe: function(){ //set the iframe src.
    var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                     .getInterface(Components.interfaces.nsIWebNavigation)
                     .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                     .rootTreeItem
                     .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                     .getInterface(Components.interfaces.nsIDOMWindow);

    var instagramIframe = mainWindow.document.getElementById("instagram_panel-iframe");
    instagramIframe.webNavigation.loadURI('https://instagram.com/accounts/login/',Components.interfaces.nsIWebNavigation,null,null,null);

  },

  pininstagramPanel: function (){
    var panel = document.getElementById("instagram_panel-panel");
    var noautohide = instagram_panel.sibPref.getBoolPref("extensions.instagram_panel.noautohide");
    panel.setAttribute("noautohide", noautohide);
    var pinButton = document.getElementById("instagram_panel-toolbarButton_pin");
    pinButton.checked = noautohide;
  },

  changePinMode: function (){
    var pinMode = document.getElementById("instagram_panel-toolbarButton_pin").checked;
    instagram_panel.sibPref.setBoolPref("extensions.instagram_panel.noautohide", pinMode);
    instagram_panel.BrowserOverlay.pininstagramPanel();
    //Need to close and reopen the panel to make the change take effect.
    var panel = document.getElementById("instagram_panel-panel");
    panel.hidePopup();
    var button = document.getElementById("instagram_panel-toolbar-button");
    panel.openPopup(button, "", 0, 0, false, false);
  },

  autoHideToolbar: function (){
    var panelToolbar = document.getElementById("instagram_panel-panel-toolbar");
    var toolbarAutoHide = instagram_panel.sibPref.getBoolPref("extensions.instagram_panel.toolbarAutoHide");
    if(toolbarAutoHide){
      panelToolbar.classList.add("instagram_panel-toolbar-class-hide");
      panelToolbar.classList.remove("instagram_panel-toolbar-class-show");
    }else{
      panelToolbar.classList.add("instagram_panel-toolbar-class-show");
      panelToolbar.classList.remove("instagram_panel-toolbar-class-hide");
    };
    var autoHideButton = document.getElementById("instagram_panel-toolbarButton_autoHide");
    autoHideButton.checked = toolbarAutoHide;
  },

  changeAutoHideMode: function (){
    var pinMode = document.getElementById("instagram_panel-toolbarButton_autoHide").checked;
    instagram_panel.sibPref.setBoolPref("extensions.instagram_panel.toolbarAutoHide", pinMode);
    instagram_panel.BrowserOverlay.autoHideToolbar();
    //Need to close and reopen the panel to make the change take effect.
    var panel = document.getElementById("instagram_panel-panel");
    panel.hidePopup();
    var button = document.getElementById("instagram_panel-toolbar-button");
    panel.openPopup(button, "", 0, 0, false, false);
  },

  openinstagramPanel: function (){
    window.clearTimeout(instagram_panel.delayFirstRunTimeOut);
    window.clearTimeout(instagram_panel.refreshTime);

    instagram_panel.BrowserOverlay.resizePanel();
    instagram_panel.BrowserOverlay.setFavicon();
    instagram_panel.BrowserOverlay.pininstagramPanel();
    instagram_panel.BrowserOverlay.autoHideToolbar();

    var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                     .getInterface(Components.interfaces.nsIWebNavigation)
                     .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                     .rootTreeItem
                     .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                     .getInterface(Components.interfaces.nsIDOMWindow);

    var instagramIframe = mainWindow.document.getElementById("instagram_panel-iframe");
    if(instagramIframe.src == "chrome://instagram_panel/content/ig-loading.xul"){
      //if the user opens the panel before it is loaded for the first time, I load it.
      //if it's loaded, I do nothing, because it's pretty annoying loading every time you open the panel because the load has a little delay. Also, you might lose information.
      instagram_panel.BrowserOverlay.setinstagramIframe();
    };

  },

  closeinstagramPanel: function (){
    instagram_panel.BrowserOverlay.setFavicon();
    instagram_panel.refreshTime = setInterval(function() { instagram_panel.BrowserOverlay.setFavicon(); },
            instagram_panel.sibPref.getIntPref("extensions.instagram_panel.faviconRefreshTime")*
            30*
            1000); //Refresh the button's image with de instagram Web's favicon every 30 seconds.
  },

  installButton: function(toolbarId, id){
    if (!document.getElementById(id)){
        var toolbar = document.getElementById(toolbarId);
        var before = null;
        toolbar.insertItem(id, before);
        toolbar.setAttribute("currentset", toolbar.currentSet);
        document.persist(toolbar.id, "currentset");
    };
  },

  instagram_panelShortcut_cmd: function(){ //opens the panel with the shortcut.
    var panel = document.getElementById("instagram_panel-panel");
    var button = document.getElementById("instagram_panel-toolbar-button");
    if(panel.state == "closed"){
      panel.openPopup(button, "", 0, 0, false, false);
    }else{
      panel.hidePopup();
    };
  },

  initKeyset: function(){ //On Firefox loads sets the shortcut keys.
    var modifiers = instagram_panel.sibPref.getCharPref("extensions.instagram_panel.modfiers");
    var key = instagram_panel.sibPref.getCharPref("extensions.instagram_panel.key");
    var keyset = document.getElementById("instagram_panel-shortcut_cmd");
    keyset.setAttribute("modifiers",modifiers);
    keyset.setAttribute("key",key);
  },

  onFirefoxLoad: function(event){
    var isFirstRunPref = instagram_panel.sibPref.getBoolPref("extensions.instagram_panel.isFirstRun");
    if (isFirstRunPref){
      instagram_panel.BrowserOverlay.installButton("nav-bar", "instagram_panel-toolbar-button");
      instagram_panel.sibPref.setBoolPref("extensions.instagram_panel.isFirstRun", false);
    };
    instagram_panel.BrowserOverlay.initKeyset(); //initiate the button's keyboard shortcut.
  },

};

window.addEventListener("load", function onFirefoxLoadEvent() {
  window.removeEventListener("load", onFirefoxLoadEvent, false); // remove listener, no longer needed
  instagram_panel.BrowserOverlay.onFirefoxLoad();
  }, false);

instagram_panel.delayFirstRunTimeOut = setTimeout(function() {instagram_panel.BrowserOverlay.setinstagramIframe(); },
           instagram_panel.sibPref.getIntPref("extensions.instagram_panel.delayFirstRun")*
           1000); //Delay the first panel load.

instagram_panel.refreshTime = setInterval(function() { instagram_panel.BrowserOverlay.setFavicon(); },
            instagram_panel.sibPref.getIntPref("extensions.instagram_panel.faviconRefreshTime")*
            30*
            1000); //Refresh the button's image with de instagram Web's favicon every 30 seconds.
