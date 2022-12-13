"use strict";
eesy.define('helpitem-loader', ['jquery-private', 'sessionInfo', 'mustachejs'], function ($, sessionInfo, Mustache) {
    var helpitems = {};
    function loadHelpItem(hid, success) {
        var hi = helpitems[hid];
        if (hi !== undefined) {
            if (!hi.loading) {
                success(hi);
            }
        }
        else {
            $.get(getLoadUrl(hid), function (json) {
                eesyRequire(['json!user-context-variables'], function (userContextVariables) {
                    helpitems[hid] = {
                        id: hid,
                        title: Mustache.to_html(json.title, userContextVariables),
                        embed: Mustache.to_html(json.embed, userContextVariables),
                        itemtype: json.itemtype,
                        orientation: json.orientation,
                        width: json.width,
                        height: json.height,
                        voting: parseVoting(json),
                        loading: false,
                    };
                    success(helpitems[hid]);
                });
            });
        }
    }
    return { loadHelpItem: loadHelpItem };
    function parseVoting(json) {
        return {
            enabled: json.voting.enabled == 'true',
            votedUp: json.voting.votedUp == 'true',
            votedDown: json.voting.votedDown == 'true',
        };
    }
    function getLoadUrl(hid) {
        /**
         * BIGEASY_LOCALE is present ONLY in Canvas
         */
        var locale = (window.ENV || {}).BIGEASY_LOCALE || document.documentElement.lang || '';
        var publicProfileParameters = [];
        if (window.var_public_profiles) {
            window.var_public_profiles.forEach(function (profileId) {
                publicProfileParameters.push('&publicRoleId%5B%5D=' + profileId);
            });
        }
        return [
            sessionInfo.dashboardUrl(),
            '/rest/public/helpitems/',
            hid,
            '?sessionkey=',
            sessionInfo.sessionKey(),
            '&locale=',
            locale,
            '&languageId=',
            var_language === undefined ? '-1' : var_language,
            '&__dbc=',
            var_eesy_dbUpdateCount,
            publicProfileParameters.join(''),
        ].join('');
    }
});
//# sourceMappingURL=helpitem-loader.js.map