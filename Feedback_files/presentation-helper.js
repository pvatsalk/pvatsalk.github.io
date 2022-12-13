"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
eesy.define('presentation-helper', ['json!language'], function (language) {
    return { helpItemModel: helpItemModel };
    function helpItemModel(helpItem) {
        var embed = fixIframesSrc(helpItem.embed);
        return {
            LNG: language.LNG,
            var_dashboard_url: var_dashboard_url,
            var_proactive_lms: var_proactive_lms,
            var_proactive_dark: var_proactive_dark,
            var_proactive_version: var_proactive_version,
            helpItem: __assign(__assign({ transitions: [] }, helpItem), { embed: embed }),
            isLoggedIn: !!var_key,
            isNotWalkthrough: helpItem.itemtype !== 'Walkthrough',
            isVersion4: var_proactive_version === 4,
        };
    }
    function fixIframesSrc(input) {
        var matches = input.match(/src="(\S+)"/gi);
        if (!matches) {
            return input;
        }
        matches.forEach(function (match) {
            var isAbsolute = match.indexOf('src="http') === 0 || match.indexOf('src="//') === 0;
            if (isAbsolute) {
                return;
            }
            input = input.replace(match, 'src="about:blank"'); // https://stackoverflow.com/a/5946696
        });
        return input;
    }
});
//# sourceMappingURL=presentation-helper.js.map