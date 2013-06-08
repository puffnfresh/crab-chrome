(function(global) {
    var server = localStorage['server'] || 'ws://localhost:2722/',
        socket;

    function icon(state) {
        chrome.browserAction.setIcon({
            path: 'crab-' + (state ? 'on' : 'off') + '38.png'
        });
    }

    global.connect = function() {
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
                chrome.tabs.executeScript(null, {
                    code: data.code
                }, function(results) {
                    results.forEach(function(result) {
                        socket.send(JSON.stringify({
                            cmd: "result",
                            value: result
                        }));
                    });
                });
                break;
            case "open-tab":
                chrome.tabs.create({
                    url: data.url
                });
            default:
                throw new Error("Unrecognised command: " + data.cmd);
            }
        };
    };

    global.disconnect = function() {
        socket.close();
        icon(false);
    };
})(this);
