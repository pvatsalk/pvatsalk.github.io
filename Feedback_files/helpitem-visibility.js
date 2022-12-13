"use strict";
eesy.define('helpitem-visibility', ['jquery-private', 'sessionInfo', 'json!language', 'json!hipa', 'view-controller', 'json!helpitem-reset-stamps'], function ($, sessionInfo, language, hipa, viewController, helpitemResetStamps) {
    if (!sessionStorage.eesysoft_hidden_items) {
        sessionStorage.eesysoft_hidden_items = JSON.stringify({});
    }
    var hiddenItems = JSON.parse(sessionStorage.eesysoft_hidden_items);
    return {
        dontShowAgain: dontShowAgain,
        closeItem: closeItem,
        closeUefItem: closeUefItem,
        isVisible: isVisible,
        hasAccessToHelpitem: hasAccessToHelpitem,
    };
    function dontShowAgain(hid) {
        closeItem(hid);
        var_eesy_hiddenHelpItems[helpitemVisibilityKey(hid)] = true;
        if (!!sessionInfo.sessionKey()) {
            $.ajax({
                url: "".concat(sessionInfo.dashboardUrl(), "/rest/public/helpitems/").concat(hid, "/hidden?sessionkey=").concat(sessionInfo.sessionKey()),
                type: 'PUT',
                success: function (data) { },
            });
        }
    }
    function closeItem(hid) {
        viewController.removeHelpitem(hid);
        if (hid !== undefined) {
            hiddenItems[helpitemVisibilityKey(hid)] = true;
            sessionStorage.eesysoft_hidden_items = JSON.stringify(hiddenItems);
        }
    }
    function closeUefItem(hid) {
        viewController.removeHelpitem(hid);
        if (hid !== undefined) {
            hiddenItems[helpitemVisibilityKey(hid)] = true;
        }
    }
    function helpitemVisibilityKey(hid) {
        return [hid, var_user_map.reset_views_stamp, helpitemResetStamps[hid]].filter(Boolean).join('_');
    }
    function isVisible(hid) {
        if (helpitemVisibilityKey(hid) in hiddenItems) {
            return false;
        }
        if (!hasAccessToHelpitem(hid)) {
            return false;
        }
        if (hasHiddenHelpitem(hid)) {
            return false; // user has hidden it
        }
        if ($('.eesy_dark').length) {
            return false; // some modal is showing
        }
        return true;
    }
    function hasAccessToHelpitem(helpItemId) {
        var h = hipa['' + helpItemId] || [];
        var s = var_eesy_sac;
        for (var i = 0; i < h.length; i++) {
            if (s[h[i]]) {
                if (s[h[i]].enabled) {
                    return true;
                }
            }
        }
        return false;
    }
    function hasHiddenHelpitem(helpItemId) {
        return var_eesy_hiddenHelpItems[helpitemVisibilityKey(helpItemId)];
    }
});
//# sourceMappingURL=helpitem-visibility.js.map