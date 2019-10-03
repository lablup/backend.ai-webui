// ./renderer.js

// 1. Require the module
const TabGroup = require("electron-tabs");
const url = require('url');
const path = require('path');

mainIndex = 'index.html';
mainURL = url.format({
  pathname: path.join(mainIndex),
  protocol: 'file',
  slashes: true
});

// 2. Define the instance of the tab group (container)
let tabGroup = new TabGroup({
    // If you want a new button that appends a new tab, include:
    //newTab: {
    //    title: 'New Tab',
        // The file will need to be local, probably a local-ntp.html file
        // like in the Google Chrome Browser.

        //src: "./some-index-file.html",
        //visible: true,
        //webviewAttributes: {
        //    nodeintegration: true
        //}
    //}
});

// 3. Add a tab from a website
let tab1 = tabGroup.addTab({
    title: "Backend.AI",
    src: mainURL,
    visible: true,
    closable: false,
    active: true,
    webviewAttributes: {
        nodeintegration: false
    }
});

// 4. Add a new tab that contains a local HTML file
let tab2 = tabGroup.addTab({
    title: "Local File",
    src: "./local.html",
    visible: true,
    // If the page needs to access Node.js modules, be sure to
    // enable the nodeintegration
    webviewAttributes: {
        nodeintegration: true
    }
});
