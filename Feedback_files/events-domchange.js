"use strict";
eesy.define('events-domchange', ['support-tab', 'jquery-private'], function (supportTab, $) {
    var timer = undefined;
    function isEesyElement(node) {
        if (!node) {
            return false;
        }
        var $node = $(node);
        return (!!$node.closest('.eesy_container').length ||
            !!$node.closest('.eesy').length ||
            !!$node.closest('.eesy_dark').length);
    }
    function isNodeRelevant(node) {
        // since messages can be connected to support button we need to trigger "domchanged" event when button appears
        return !isEesyElement(node) || supportTab.isSupportButtonNode(node);
    }
    function start() {
        new MutationObserver(function (mutationsList, observer) {
            if (!timer) {
                var relevantUpdates = mutationsList.reduce(function (result, mutation) {
                    result.push.apply(result, Array.prototype.slice.call(mutation.addedNodes).filter(isNodeRelevant));
                    result.push.apply(result, Array.prototype.slice.call(mutation.removedNodes).filter(isNodeRelevant));
                    return result;
                }, []);
                if (relevantUpdates.length) {
                    timer = setTimeout(function () {
                        $(document).trigger('domchanged');
                        timer = undefined;
                    }, 250);
                }
            }
        }).observe(document.getElementsByTagName('BODY')[0], {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true,
        });
    }
    return {
        start: start,
        isEesyElement: isEesyElement,
    };
});
//# sourceMappingURL=events-domchange.js.map