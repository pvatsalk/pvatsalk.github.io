"use strict";
eesy.define('condition-matcher', ['jquery-private'], function ($) {
    function conditionMatches(url, element, condition) {
        var _a;
        try {
            var doc_1 = (_a = element.get(0)) === null || _a === void 0 ? void 0 : _a.ownerDocument;
            if (!doc_1 || condition.type === 'mismatch') {
                return false;
            }
            if (!Array.isArray(condition.value)) {
                return reduceCandidates(url, doc_1, element, condition).length > 0;
            }
            return (condition.value
                .map(function (v) { return ({ type: condition.type, value: v }); })
                .filter(function (condition) { return reduceCandidates(url, doc_1, element, condition).length > 0; }).length > 0);
        }
        catch (_b) {
            return false;
        }
    }
    function isMatchedConditionFromSessionStorage(conditionValue) {
        if (var_uefModeOriginal) {
            return false;
        }
        var values = conditionValue.split('=');
        var itemName = values[0]; // Typically "route" or "analyticsId"
        var matchValue = values[1];
        var stateValue = sessionStorage.getItem(itemName);
        if (stateValue === null)
            return false;
        // Check if we simply should use a comparison of the two strings
        if (matchValue.match('^\\w+(\\.\\w+)*$') !== null)
            return stateValue === matchValue;
        return stateValue.match(matchValue) !== null;
    }
    function stateEquals(conditionValue) {
        var values = conditionValue.split('=');
        var stateName = values[0]; // Typically "route" or "analyticsId"
        var matchValue = values[1];
        return hasState(stateName) && matchValue.split('||').indexOf(GlobalEesy[stateName].value) > -1;
    }
    function hasState(stateName) {
        return window['GlobalEesy'] && GlobalEesy[stateName];
    }
    /**
     * Processes a jQuery collection of candidate elements according to some condition, returning a
     * new collection that has had the elements that don't match the condition removed.
     *
     * @param url the current url
     * @param candidates collection of candidate elements or undefined meaning ALL elements
     * @param condition the condition to match against
     * @returns a new collection with non-matching elements removed
     */
    function reduceCandidates(url, document, candidates, condition) {
        if (condition.type === 'mismatch') {
            return $();
        }
        try {
            if (condition.evaluate == 'false') {
                return candidates;
            }
            var conditionType = condition.type;
            switch (conditionType) {
                case 'sessionStorage':
                    return isMatchedConditionFromSessionStorage(condition.value) ? candidates : $();
                case 'element_tag':
                case 'is':
                    return selectOrFilter(candidates, condition.value);
                case 'path_matches':
                    return document.location.pathname.match(condition.value.replace('^$', '^/?$')) == null
                        ? $()
                        : candidates;
                case 'path_template':
                    return candidates; // find a better solution
                case 'url_contains':
                    return url.indexOf(condition.value) !== -1 ? candidates : $();
                case 'url_contains_not':
                    return url.indexOf(condition.value) !== -1 ? $() : candidates;
                case 'state_equals':
                    return stateEquals(condition.value) ? candidates : $();
                case 'has_state':
                    return hasState(condition.value) ? candidates : $();
                case 'selector_matches_not':
                    return $(document).find(condition.value).length ? $() : candidates;
                case 'selector_matches':
                case 'body_contains_child':
                    return $(document).find(condition.value).length ? candidates : $();
                case 'has_parent':
                    return selectOrFilter(candidates, "".concat(condition.value, " *"));
                case 'text_contains':
                    return selectOrFilter(candidates, ":contains(".concat(condition.value.trim(), ")"));
                case 'contains_child':
                    return candidates
                        ? $('* ' + condition.value).length
                            ? candidates.filter(":has(".concat(condition.value, ")"))
                            : $()
                        : $('* ' + condition.value).parents(":has(".concat(condition.value, ")"));
                case 'text_equals':
                    return selectOrFilter(candidates, ":contains(".concat(condition.value.trim(), ")")).filter(function (i, candidate) { return $(candidate).text().trim() === condition.value.trim(); });
                default:
                    if (window.console)
                        console.log("Unimplemented condition type: \"".concat(conditionType, "\""));
                    return $();
            }
        }
        catch (err) {
            if (window.console)
                console.log('Problems with condition', condition.type, condition.value);
            return $();
        }
    }
    function selectOrFilter(candidates, selector) {
        try {
            var escaped = selector.startsWith('#') ? selector.replace('/', '\\/') : selector;
            return candidates ? candidates.filter(escaped) : $(escaped);
        }
        catch (err) {
            if (window.console)
                console.log("Problems with selector: \"".concat(selector, "\""));
            return $();
        }
    }
    function isNegativeCondition(condition) {
        switch (condition.type) {
            case 'url_contains_not':
            case 'selector_matches_not':
                return true;
            default:
                return false;
        }
    }
    return {
        conditionMatches: conditionMatches,
        reduceCandidates: reduceCandidates,
        isNegativeCondition: isNegativeCondition,
    };
});
//# sourceMappingURL=condition-matcher.js.map