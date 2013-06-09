(function() {
    var visible = [];

    function zip(a, b) {
        var r = [],
            i;
        for(i = 0; i < a.length; i++) {
            r[i] = {
                _1: a[i]
            };
        }
        for(i = 0; i < b.length; i++) {
            if(!r[i])
                break;
            r[i]._2 = b[i];
        }
        return r;
    }

    function findFirst(a, p) {
        var i;
        for(i = 0; i < a.length; i++) {
            if(p(a[i]))
                return a[i];
        }
        return null;
    }

    function markVisible() {
        var links,
            rects;

        if(visible.length)
            return;

        links = [].slice.call(document.querySelectorAll('a'));

        rects = links.map(function(link) {
            var rects = [].slice.call(link.getClientRects());
            return findFirst(rects, function(rect) {
                return rect.top > -1 &&
                    rect.top < window.innerHeight - 4 &&
                    rect.left > -1 &&
                    rect.left < window.innerWidth - 4;
            });
        })

        visible = zip(links, rects).filter(function(t) {
            return t._2;
        });

        visible.forEach(function(v, index) {
            var marker = document.createElement("div"),
                link = v._1,
                rect = v._2;

            marker.className = 'crabHintMarker';
            marker.style.left = rect.left + window.scrollX + 'px';
            marker.style.top = rect.top + window.scrollY + 'px';
            marker.innerHTML = index;

            document.body.appendChild(marker);
        });
    }

    function mouseEvent(name) {
        var event = document.createEvent('MouseEvents');
        event.initMouseEvent(name, true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
        return event;
    }

    function clickMarker(index) {
        var link;
        if(!visible[index]) return;
        link = visible[index]._1;

        ['mouseover', 'mousedown', 'mouseup', 'click'].forEach(function(name) {
            link.dispatchEvent(mouseEvent(name));
        });
    }

    function removeMarkers() {
        var markers = [].slice.call(document.body.querySelectorAll('.crabHintMarker'));
        markers.forEach(function(marker) {
            document.body.removeChild(marker);
        });
        visible = [];
    }

    chrome.runtime.onMessage.addListener(function(data) {
        switch(data.cmd) {
        case 'show-link-hints':
            markVisible();
            break;
        case 'click-link-hint':
            clickMarker(data.index);
        case 'hide-link-hints':
            removeMarkers();
            break;
        }
    });
})();
