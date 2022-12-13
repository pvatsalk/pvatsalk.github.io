"use strict";
eesy.define('hints', ['jquery-private', 'utils', 'mouse', 'mustachejs', 'presentation-helper', 'helpitem-accessibility'], function ($, utils, mouse, Mustache, presentationHelper, helpItemAccessibility) {
    function preview(helpItem) {
        $('#hintcontainer[data-helpitemid="preview"]').remove();
        $('#expertActionBar').append(Mustache.to_html(eesyTemplates.hint, presentationHelper.helpItemModel(helpItem), eesyTemplates));
        $('#hintcontainer[data-helpitemid="preview"]')
            .css({
            position: 'fixed',
            height: helpItem.height + 'px',
            width: helpItem.width + 'px',
            top: '100px',
            right: '440px',
        })
            .show();
    }
    function isHint(elm) {
        return utils.isOrHas(elm, '#hintcontainer');
    }
    function getHintCoordinates(connectedTo) {
        var isFocused = document.activeElement === connectedTo && utils.isFocusVisible(document.activeElement);
        if (isFocused) {
            var _a = connectedTo.getBoundingClientRect(), x = _a.x, y = _a.y;
            return { x: x, y: y };
        }
        else {
            return { x: mouse.x, y: mouse.y };
        }
    }
    function show(helpItem, connectedTo) {
        var _a, _b, _c, _d;
        var $body = $('body');
        var helpItemId = helpItem.id;
        $body.append(Mustache.to_html(eesyTemplates.hint, presentationHelper.helpItemModel(helpItem), eesyTemplates));
        helpItemAccessibility.renderNonProactiveHintAnchors(connectedTo, helpItemId);
        var _e = getHintCoordinates(connectedTo), x = _e.x, y = _e.y;
        var xpos = x + 20;
        var bodyWidth = (_a = $body.width()) !== null && _a !== void 0 ? _a : 0;
        var helpItemWidth = parseInt((_b = helpItem.width) !== null && _b !== void 0 ? _b : '0');
        if (xpos + helpItemWidth > bodyWidth) {
            xpos = x - 20 - helpItemWidth;
        }
        var ypos = y + 20;
        var bodyHeight = (_c = $body.height()) !== null && _c !== void 0 ? _c : 0;
        var helpItemHeight = parseInt((_d = helpItem.height) !== null && _d !== void 0 ? _d : '0');
        if (ypos + helpItemHeight > bodyHeight) {
            ypos = y - 20 - helpItemHeight;
        }
        $("#hintcontainer[data-helpitemid=\"".concat(helpItem.id, "\"]"))
            .css({
            position: 'absolute',
            height: helpItem.height + 'px',
            width: helpItem.width + 'px',
            top: ypos,
            left: xpos,
        })
            .fadeIn('fast');
        var hint = document.getElementById('hintcontainer');
        if (hint) {
            utils.onElementRemove(hint, function () { return helpItemAccessibility.removeHintAnchors(helpItemId); });
        }
    }
    function hide() {
        $('#hintcontainer').remove();
    }
    return {
        preview: preview,
        isHint: isHint,
        show: show,
        hide: hide,
    };
});
//# sourceMappingURL=hints.js.map