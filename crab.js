(function(global) {
    var server = localStorage['server'] || 'ws://localhost:2722/',
        connected = false,
        socket;

    function icon(state) {
        connected = state;
        chrome.browserAction.setIcon({
            path: 'crab-' + (state ? 'on' : 'off') + '38.png'
        });
    }

    function currentTabId(cb) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(results) {
            if(!results.length)
                return;

            cb(results[0].id);
        });
    }

    function currentTab(cb) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(results) {
            if(!results.length)
                return;

            cb(results[0]);
        });
    }

    function evaluate(js) {
        chrome.tabs.executeScript(null, {
            code: js
        }, function(results) {
            results.forEach(function(result) {
                socket.send(JSON.stringify({
                    cmd: "result",
                    value: result
                }));
            });
        });
    }

    function openTab(url) {
        chrome.tabs.create({
            url: url
        });
    }

    function showLinkHints() {
        currentTabId(function(id) {
            chrome.tabs.sendMessage(id, {
                cmd: "show-link-hints"
            });
        });
    }

    function hideLinkHints() {
        currentTabId(function(id) {
            chrome.tabs.sendMessage(id, {
                cmd: "hide-link-hints"
            });
        });
    }

    function clickLinkHint(index) {
        currentTabId(function(id) {
            chrome.tabs.sendMessage(id, {
                cmd: "click-link-hint",
                index: index
            });
        });
    }

    function moveTab(amount) {
        currentTab(function(tab) {
            var targetIndex = tab.index + amount;
            chrome.tabs.query({currentWindow: true}, function (tabs) {
                // handle wraparound
                var toIndex;
                if (targetIndex===-1) {
                    toIndex = tabs.length-1;
                } else if (targetIndex >= tabs.length) {
                    toIndex = 0;
                } else {
                    toIndex = targetIndex;
                }
                chrome.tabs.update(tabs[toIndex].id, {selected: true});
            });
        });
    }

    function closeTab() {
        currentTabId(function(id) {
            chrome.tabs.remove(id);
        });
    }

    connect = function() {
        socket = new WebSocket(server);

        socket.onopen = function() {
            console.log("Crab server connected");
            icon(true);
        };

        socket.onclose = function() {
            console.log("Crab server disconnected");
            icon(false);
        };

        socket.onmessage = function(message) {
            var data = JSON.parse(message.data);

            switch(data.cmd) {
            case "eval":
                evaluate(data.code);
                break;
            case "open-tab":
                openTab(data.url);
                break;
            case "next-tab":
                moveTab(1);
                break;
            case "prev-tab":
                moveTab(-1);
                break;
            case "close-tab":
                closeTab();
                break;
            case "show-link-hints":
                showLinkHints();
                break;
            case "hide-link-hints":
                hideLinkHints();
                break;
            case "click-link-hint":
                clickLinkHint(data.index);
                break;
            default:
                throw new Error("Unrecognised command: " + data.cmd);
            }
        };
    };

    disconnect = function() {
        socket.close();
        icon(false);
    };

    chrome.browserAction.onClicked.addListener(function() {
        if (connected) {
            disconnect();
        } else {
            connect();
        }
    });

})(this);
