"use strict";
eesy.define('iframe_communicator_server', ['jquery'], function ($) {
    var handlers = {};
    window.addEventListener('message', function (e) {
        if (handlers[e.data.messageHandler] == undefined)
            return;
        handlers[e.data.messageHandler](e.data, function (response) {
            if (e.source && !(e.source instanceof MessagePort) && !(e.source instanceof ServiceWorker)) {
                e.source.postMessage({ messageId: e.data.messageId, response: response }, '*');
            }
        });
    }, false);
    return {
        bind: function (handlerKey, handler) {
            handlers[handlerKey] = handler;
        },
    };
});
//# sourceMappingURL=iframe_communicator_server.js.map