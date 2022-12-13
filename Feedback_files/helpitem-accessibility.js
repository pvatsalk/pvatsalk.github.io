"use strict";
eesy.define('helpitem-accessibility', ['utils', 'json!language'], function (utils, language) {
    var hintTargetAttribute = 'data-eesy-assigned-helpitem-id';
    var hasHintCustomDescribedByAttribute = 'data-eesy-described-by';
    function renderNonProactiveHintAnchors(connectedTo, helpItemId) {
        renderHintAnchors(connectedTo, helpItemId, false);
    }
    function renderProactiveHintAnchors(connectedTo, helpItemId) {
        renderHintAnchors(connectedTo, helpItemId, true);
    }
    function renderHintAnchors(connectedTo, helpItemId, isProactive) {
        var hintElementId = isProactive ? "systraycontainer_".concat(helpItemId) : 'hintcontainer';
        var role = isProactive ? 'proactive-hint-anchor' : 'hint-anchor';
        var visibleAnchor = getVisibleAnchor(helpItemId);
        if (!visibleAnchor) {
            document.body.append(createVisibleAnchor(helpItemId, role));
            visibleAnchor = getVisibleAnchor(helpItemId);
        }
        var accessibleAnchor = getAccessibleAnchor(helpItemId);
        if (!accessibleAnchor) {
            connectedTo.after(createAccessibleAnchor(helpItemId, hintElementId, role));
            accessibleAnchor = getAccessibleAnchor(helpItemId);
        }
        connectedTo.setAttribute(hintTargetAttribute, String(helpItemId));
        if (!connectedTo.getAttribute('aria-describedby')) {
            connectedTo.setAttribute('aria-describedby', hintElementId);
            connectedTo.setAttribute(hasHintCustomDescribedByAttribute, 'true');
        }
        visibleAnchor === null || visibleAnchor === void 0 ? void 0 : visibleAnchor.addEventListener('click', function () {
            accessibleAnchor === null || accessibleAnchor === void 0 ? void 0 : accessibleAnchor.click();
        });
        visibleAnchor === null || visibleAnchor === void 0 ? void 0 : visibleAnchor.addEventListener('focus', function () { return recalculateHintVisibleAnchorStyles(helpItemId); });
        visibleAnchor === null || visibleAnchor === void 0 ? void 0 : visibleAnchor.addEventListener('focusout', function () { return recalculateHintVisibleAnchorStyles(helpItemId); });
        accessibleAnchor === null || accessibleAnchor === void 0 ? void 0 : accessibleAnchor.addEventListener('focus', function () { return recalculateHintVisibleAnchorStyles(helpItemId); });
        accessibleAnchor === null || accessibleAnchor === void 0 ? void 0 : accessibleAnchor.addEventListener('focusout', function (e) {
            if (visibleAnchor && e.relatedTarget !== visibleAnchor) {
                recalculateHintVisibleAnchorStyles(helpItemId);
            }
        });
    }
    function removeHintAnchors(helpItemId) {
        var _a, _b, _c;
        (_a = getVisibleAnchor(helpItemId)) === null || _a === void 0 ? void 0 : _a.remove();
        (_c = (_b = getAccessibleAnchor(helpItemId)) === null || _b === void 0 ? void 0 : _b.parentElement) === null || _c === void 0 ? void 0 : _c.remove();
        var connectedTo = getConnectedToElement(helpItemId);
        connectedTo === null || connectedTo === void 0 ? void 0 : connectedTo.removeAttribute(hintTargetAttribute);
        if (connectedTo && connectedTo.getAttribute(hasHintCustomDescribedByAttribute)) {
            connectedTo.removeAttribute('aria-describedby');
            connectedTo.removeAttribute(hasHintCustomDescribedByAttribute);
        }
    }
    function getConnectedToElement(helpItemId) {
        return document.querySelector("[".concat(hintTargetAttribute, "=\"").concat(helpItemId, "\"]"));
    }
    function getAccessibleAnchor(helpItemId) {
        return document.getElementById("hint_accessible_anchor_".concat(helpItemId));
    }
    function getVisibleAnchor(helpItemId) {
        return document.getElementById("hint_visible_anchor_".concat(helpItemId));
    }
    function createAccessibleAnchor(helpItemId, hintElementId, role) {
        var _a;
        // Styles sets directly to element not by classes, to make sure LMS styles don't interfere with it.
        var div = document.createElement('div');
        div.innerHTML = "\n                    <div style='width:0; height:0; position:absolute'>\n                      <a\n                            style='width:1px; height:1px; opacity:0; position: absolute; clip-path: circle(0)'\n                            href='#".concat(hintElementId, "'\n                            id='hint_accessible_anchor_").concat(helpItemId, "'\n                            aria-label='").concat(language.LNG.PROACTIVE.GO_TO_HINT, "'\n                            data-eesy-connected-hintid='").concat(helpItemId, "'\n                            data-eesy-role='").concat(role, "'\n                        />\n                        <div id='hint_return_anchor_").concat(helpItemId, "' />\n                    </div>\n        ").trim();
        return (_a = div.firstChild) !== null && _a !== void 0 ? _a : '';
    }
    function createVisibleAnchor(helpItemId, role) {
        var _a;
        // visible anchor needs to be div with tabindex because in Safari clicking button or anchor doesn't cause focusing clicked element
        // and the whole trick with showing anchor when one of 2 anchors has focus doesn't work
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#clicking_and_focus
        var div = document.createElement('div');
        div.innerHTML = "\n                    <div\n                        tabindex='0'\n                        role='button'\n                        style='visibility: hidden'\n                        id='hint_visible_anchor_".concat(helpItemId, "'\n                        class='eesy_hint_visible_anchor'\n                        data-eesy-connected-hintid='").concat(helpItemId, "'\n                        data-eesy-role='").concat(role, "'\n                        aria-hidden='true'\n                    >\n                        ").concat(language.LNG.PROACTIVE.GO_TO_HINT, "\n                    </div>\n            ").trim();
        return (_a = div.firstChild) !== null && _a !== void 0 ? _a : '';
    }
    function recalculateHintVisibleAnchorStyles(helpItemId) {
        var visibleAnchor = getVisibleAnchor(helpItemId);
        var accessibleAnchor = getAccessibleAnchor(helpItemId);
        if (!visibleAnchor || !accessibleAnchor) {
            return;
        }
        var isAnchorVisible = utils.isFocusVisible(accessibleAnchor) || visibleAnchor.matches(':focus');
        var connectedTo = getConnectedToElement(helpItemId);
        if (!connectedTo) {
            visibleAnchor.style.display = 'none';
            return;
        }
        var anchorDimensions = connectedTo.getBoundingClientRect();
        var space = 3;
        visibleAnchor.style.cssText = "\n            top: ".concat(anchorDimensions.y + space, "px;\n            left: ").concat(anchorDimensions.x + space, "px;\n            width: ").concat(isAnchorVisible ? anchorDimensions.width - 2 * space : 0, "px;\n            height: ").concat(isAnchorVisible ? anchorDimensions.height - 2 * space : 0, "px;\n            opacity: ").concat(isAnchorVisible ? 1 : 0, ";\n            visibility: ").concat(isAnchorVisible ? 'visible' : 'hidden', ";\n        ");
    }
    function goToSystray() {
        var _a;
        var isPopupVisible = Boolean(document.getElementById('eesy-standardcontainer'));
        if (isPopupVisible) {
            return;
        }
        var container = document.getElementById('systraycontainer');
        if (container) {
            (_a = utils.getFirstFocusableElement(container)) === null || _a === void 0 ? void 0 : _a.focus();
        }
    }
    function onCloseHintCallback(helpItemId) {
        var _a;
        var isKeyboardNavigationUsed = utils.isFocusVisible(document.activeElement);
        if (!isKeyboardNavigationUsed) {
            return;
        }
        var hintAnchor = getAccessibleAnchor(helpItemId);
        if (!hintAnchor) {
            return;
        }
        (_a = utils.getNextFocusableElement(hintAnchor, document.body)) === null || _a === void 0 ? void 0 : _a.focus();
    }
    return {
        goToSystray: goToSystray,
        onCloseHintCallback: onCloseHintCallback,
        removeHintAnchors: removeHintAnchors,
        renderProactiveHintAnchors: renderProactiveHintAnchors,
        renderNonProactiveHintAnchors: renderNonProactiveHintAnchors,
    };
});
//# sourceMappingURL=helpitem-accessibility.js.map