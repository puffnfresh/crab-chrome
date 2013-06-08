(function(global) {
    var connectButton = document.getElementById('connect'),
        disconnectButton = document.getElementById('disconnect'),
        background = chrome.extension.getBackgroundPage();

    connectButton.addEventListener('click', function() {
        background.connect();
        window.close();
    }, false);

    disconnectButton.addEventListener('click', function() {
        background.disconnect();
        window.close();
    }, false);
})(this);
