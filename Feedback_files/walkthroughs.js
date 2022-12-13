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
eesy.define('walkthroughs', [
    'jquery-private',
    'utils',
    'mustachejs',
    'sessionInfo',
    'helpitem-visibility',
    'systrays',
    'proactive-hints',
    'popups',
    'context-probe',
    'condition-matcher',
    'eesy-timers',
    'json!settings-supportcenter',
    'json!helpitem-reset-stamps',
    'json!language',
], function ($, utils, Mustache, sessionInfo, helpitemVisibility, systrays, proactiveHints, popups, ctxProbe, conditionMatcher, eesyTimers, settings, helpitemResetStamps, lng) {
    var activeWalks = [];
    var feedbackAnswer = null;
    var isFeedbackVisible = false;
    var userProgress = [];
    var BRK_DELIMITER = '#BRK#';
    var EXIT_CONFIRM_SELECTOR = '.eesy-step-exit-confirmation';
    var POPUP_TYPE_NONE = '4';
    var STORAGE_KEY = "eesysoft_walkthroughs_".concat(getUserId());
    var TIMER_ID = 'active_walks:contexts_probing';
    var TRANS_TYPE_EXIT = 'exit_walkthrough';
    var TRANS_TYPE_NEXT = 'next';
    var TRANS_TYPE_PREVIOUS = 'previous';
    var TRANSITIONS_SELECTOR = '.eesy-step-transitions';
    $(document).on('click', "".concat(TRANSITIONS_SELECTOR, " button"), onTransitionsBtnClick);
    $(document).on('click', "".concat(EXIT_CONFIRM_SELECTOR, " button.cancel-btn"), onWalkExitCancelBtnClick);
    $(document).on('click', "".concat(EXIT_CONFIRM_SELECTOR, " button.confirm-btn"), onWalkExitConfirmBtnClick);
    $(document).on('click', "".concat(EXIT_CONFIRM_SELECTOR, " button.skip-feedback-btn"), onSkipBtnClick);
    $(document).on('click', "".concat(EXIT_CONFIRM_SELECTOR, " button.submit-feedback-btn"), onSubmitBtnClick);
    $(document).on('click', "".concat(EXIT_CONFIRM_SELECTOR, " button.vote-btn"), onVoteBtnClick);
    sessionInfo.onInited(loadActiveWalks);
    return { start: start, close: close };
    function start(walk) {
        var found = getWalkById(walk.id);
        if (found) {
            // Passed `walkthrough` is already active.
            return;
        }
        var stepsData = JSON.parse(walk.embed);
        var newActiveWalk = {
            entity: walk,
            entityViewsStamp: helpitemResetStamps[walk.id] || '',
            entryPointId: stepsData.entryPointId,
            steps: stepsData.steps,
            stepsOrder: stepsData.stepsOrder || Object.keys(stepsData.steps),
            userViewsStamp: getUserViewsStamp(),
        };
        $.getJSON(getProgressUrl(), function (progress) {
            userProgress = progress;
            var newWalkWithProgress = extendWalkWithProgress(newActiveWalk);
            if (!newWalkWithProgress) {
                // Passed `walkthrough` is already completed.
                return;
            }
            activeWalks.push(newWalkWithProgress);
            setAndStoreActiveWalks(activeWalks);
            restartActiveWalks();
        }).fail(console.error);
    }
    function close(walkId) {
        var walk = getWalkById(Number(walkId));
        if (!walk) {
            throw new Error("Walk data unavailable.");
        }
        var isVotingEnabled = walk.entity.voting.enabled;
        var isVotedDown = walk.entity.voting.votedDown;
        var isVotedUp = walk.entity.voting.votedUp;
        var lastPlayedStepId = getLastPlayedStepId(walk);
        var templateArgs = {
            isVotedDown: isVotedDown,
            isVotedUp: isVotedUp,
            isVotingEnabled: isVotingEnabled,
            LNG: lng.LNG,
            stepId: lastPlayedStepId,
            walkId: walkId,
        };
        $('body').append(Mustache.to_html(eesyTemplates.step_exit_confirmation, templateArgs));
    }
    function getUserId() {
        return (var_user_map || {}).id || 'anony_mouse';
    }
    function getUserViewsStamp() {
        return (var_user_map || {}).reset_views_stamp || '';
    }
    /**
     * @param urlSuffix With leading slash.
     */
    function getProgressUrl(urlSuffix) {
        if (urlSuffix === void 0) { urlSuffix = ''; }
        var hasQuery = urlSuffix.indexOf('?') > -1;
        var parts = [
            sessionInfo.dashboardUrl(),
            '/rest/walkthroughs/user/progress',
            urlSuffix,
            hasQuery ? '&' : '?',
            'sessionkey=',
            sessionInfo.sessionKey(),
            '&userWalkProgressUpdatedStamp=',
            var_user_map.userWalkProgressUpdatedStamp,
        ];
        return parts.filter(Boolean).join('');
    }
    function loadActiveWalks() {
        try {
            var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            if (Array.isArray(parsed)) {
                setAndStoreActiveWalks(parsed.filter(areWalkStampsInLine));
            }
            $.getJSON(getProgressUrl(), function (progress) {
                if (Array.isArray(progress)) {
                    userProgress = progress;
                    setAndStoreActiveWalks(activeWalks.map(extendWalkWithProgress).filter(isTruthy));
                }
                checkWalksWithAllStepsPlayed();
                if (activeWalks.length) {
                    restartActiveWalks();
                }
            });
        }
        catch (err) {
            console.error(err);
        }
    }
    function extendWalkWithProgress(walk) {
        var state = userProgress.filter(function (i) { return i.entity.id === walk.entity.id; })[0];
        if (!state) {
            walk.stepsOrder.forEach(function (stepId) {
                if (walk.steps[stepId]) {
                    walk.steps[stepId].isPlayed = false;
                }
            });
            return walk;
        }
        if (state.isCompleted) {
            return null;
        }
        walk.stepsOrder.forEach(function (stepId) {
            var isPlayed = state.steps[stepId] ? state.steps[stepId].isPlayed : false;
            if (walk.steps[stepId]) {
                walk.steps[stepId].isPlayed = isPlayed;
            }
        });
        return walk;
    }
    function markStepAsCompleted(walkId, stepId) {
        $.ajax({
            type: 'POST',
            url: getProgressUrl("/".concat(walkId, "/completed/").concat(stepId)),
        });
    }
    function markStepAsNotCompleted(walkId, stepId) {
        if (!stepId) {
            return;
        }
        $.ajax({
            type: 'DELETE',
            url: getProgressUrl("/".concat(walkId, "/completed/").concat(stepId)),
        });
    }
    function markWalkAsCompleted(walkId) {
        $.ajax({
            type: 'PUT',
            url: getProgressUrl("/".concat(walkId, "/completed")),
        });
    }
    /**
     * Always update the 'activeWalks' variable via this setter function.
     */
    function setAndStoreActiveWalks(newValue) {
        activeWalks = newValue;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activeWalks));
    }
    function restartActiveWalks() {
        eesyTimers.stop(TIMER_ID);
        var contextIds = getActiveWalksContextsIds();
        var url = getContextRulesConditionsUrl(contextIds);
        if (!contextIds.length) {
            return;
        }
        $.getJSON(url, function (response) {
            var rulesMap = {};
            response.forEach(function (i) {
                try {
                    var conditions = JSON.parse(i.recognition).conditions;
                    if (Array.isArray(conditions) && conditions.length) {
                        rulesMap[i.id] = { id: i.id, conditions: conditions };
                    }
                }
                catch (err) {
                    console.error(err);
                }
            });
            if (Object.keys(rulesMap).length) {
                extendActiveWalksStepsWithContextsRules(rulesMap);
                probeForContexts();
            }
        });
    }
    function extendActiveWalksStepsWithContextsRules(map) {
        activeWalks.forEach(function (activeWalk) {
            activeWalk.stepsOrder.forEach(function (stepId) {
                var step = activeWalk.steps[stepId];
                step.rules = step.context_ids.map(function (id) { return map[id]; });
            });
        });
        setAndStoreActiveWalks(activeWalks); // To persist 'step' changes.
    }
    function probeForContexts() {
        eesyTimers.set(TIMER_ID, 1e3, probeForContexts);
        if ($('.eesy_container').length) {
            return;
        }
        for (var _i = 0, activeWalks_1 = activeWalks; _i < activeWalks_1.length; _i++) {
            var walk = activeWalks_1[_i];
            for (var _a = 0, _b = walk.stepsOrder; _a < _b.length; _a++) {
                var stepId = _b[_a];
                var _c = walk.steps[stepId], rules = _c.rules, isPlayed = _c.isPlayed;
                if (isPlayed) {
                    continue;
                }
                for (var _d = 0, rules_1 = rules; _d < rules_1.length; _d++) {
                    var rule = rules_1[_d];
                    var candidates = getCandidatesForRule(rule);
                    if (candidates.length) {
                        showStep(walk.entity.id, stepId, candidates[0]);
                        return;
                    }
                }
                break; /* Only next, non-played step can be checked. */
            }
        }
    }
    function getContextRulesConditionsUrl(contextIds) {
        var idsParam = encodeURI(JSON.stringify(contextIds));
        return "".concat(sessionInfo.dashboardUrl(), "/rest/public/context-rules-conditions?ids=").concat(idsParam);
    }
    function getActiveWalksContextsIds() {
        var ids = [];
        activeWalks.forEach(function (activeWalk) {
            activeWalk.stepsOrder.forEach(function (stepId) {
                var step = activeWalk.steps[stepId];
                ids.push.apply(ids, step.context_ids);
            });
        });
        return ids.filter(function (el, index) { return ids.indexOf(el) === index; });
    }
    function markHelpItemAsClosed(walkId) {
        if ($('#toggle-dont-show').is(':checked')) {
            helpitemVisibility.dontShowAgain(walkId);
            markWalkAsCompleted(walkId);
        }
        else {
            helpitemVisibility.closeItem(walkId);
        }
    }
    function renderVotingOptions(options) {
        options.forEach(function (option) {
            var inputId = "feedbackAdditionalAnswerCheckbox-".concat(option.id);
            $('.feedback-additional-answers').append("\n                    <div class=\"feedback-checkbox-wrapper\">\n                        <input\n                            class=\"feedback-checkbox\"\n                            data-caption=\"".concat(option.caption, "\"\n                            data-id=\"").concat(option.id, "\"\n                            id=\"").concat(inputId, "\"\n                            type=\"checkbox\"\n                        />\n                        <label class=\"feedback-checkbox-label\" for=\"").concat(inputId, "\">\n                            <span>").concat(option.caption, "</span>\n                        </label>\n                    </div>\n                "));
        });
        $('.feedback-additonal-reasons-title').removeClass('element-hidden');
    }
    function onVoteBtnClick(ev) {
        var $target = $(ev.currentTarget);
        var $container = $target.closest(EXIT_CONFIRM_SELECTOR);
        var walkId = $container.data('walk-id');
        var walk = getWalkById(walkId);
        if (!walk) {
            throw new Error("Walk ID \"".concat(walkId, "\" cannot be found."));
        }
        feedbackAnswer = $target.data('answer');
        $target.addClass('active').siblings('.vote-btn').removeClass('active');
        $('.subheading-upvote').toggleClass('subheading-hidden', !feedbackAnswer);
        $('.subheading-downvote').toggleClass('subheading-hidden', Boolean(feedbackAnswer));
        // to avoid unnecessary class switching
        if (!isFeedbackVisible) {
            isFeedbackVisible = true;
            $("".concat(EXIT_CONFIRM_SELECTOR, " .feedback")).removeClass('element-hidden');
        }
        $('.feedback-checkbox-anonymous').toggleClass('element-hidden', !settings.SUPPORTCENTER.VOTING.ANONYMOUSENABLED);
        if (settings.SUPPORTCENTER.VOTINGOPTIONS.ENABLED) {
            var voteType = feedbackAnswer ? 'up' : 'down';
            var optionsRoute = "".concat(sessionInfo.dashboardUrl(), "/rest/helpitems/options/voting");
            var optionsUrl = "".concat(optionsRoute, "?type=").concat(voteType, "&sessionkey=").concat(sessionInfo.sessionKey());
            $('.feedback-additional-answers').empty();
            $.getJSON(optionsUrl).done(renderVotingOptions).fail(console.error);
        }
    }
    function showSuccessMessage() {
        $("".concat(EXIT_CONFIRM_SELECTOR, " .submit-feedback-response-success")).removeClass('element-hidden');
        $("".concat(EXIT_CONFIRM_SELECTOR, " .feedback")).addClass('element-hidden');
    }
    function hideSuccessMessage() {
        $("".concat(EXIT_CONFIRM_SELECTOR, " .submit-feedback-response-success")).addClass('element-hidden');
        resetSurveyState();
    }
    function showErrorMessage() {
        $("".concat(EXIT_CONFIRM_SELECTOR, " .submit-feedback-response-error")).removeClass('element-hidden');
        $("".concat(EXIT_CONFIRM_SELECTOR, " .feedback")).addClass('element-hidden');
        resetSurveyState();
    }
    function hideErrorMessage() {
        $("".concat(EXIT_CONFIRM_SELECTOR, " .submit-feedback-response-error")).addClass('element-hidden');
    }
    function onSubmitBtnClick(ev) {
        var container = $(ev.currentTarget).closest(EXIT_CONFIRM_SELECTOR);
        var walkId = container.data('walk-id');
        var stepId = container.data('step-id');
        var voteOptionsById = {};
        var reason = $("".concat(EXIT_CONFIRM_SELECTOR, " .feedback-reason")).val();
        var appearAnonymous = $("".concat(EXIT_CONFIRM_SELECTOR, " #toggle-anonymous")).is(':checked');
        var walk = getWalkById(walkId);
        $('.feedback-additional-answers')
            .find('.feedback-checkbox-wrapper input:checkbox:checked')
            .each(function (_index, el) {
            voteOptionsById[$(el).data('id')] = $(el).data('caption');
        });
        var postUrl = "".concat(sessionInfo.dashboardUrl(), "/rest/helpitems/").concat(walkId, "/votes");
        var postData = {
            details: getVoteDetails(stepId, walk),
            sessionKey: sessionInfo.sessionKey(),
            isUp: feedbackAnswer,
            timeStamp: utils.createStamp(),
            reason: reason,
            appearAnonymous: appearAnonymous,
            votes: JSON.stringify(voteOptionsById),
        };
        $.post("".concat(postUrl, "?sessionkey=").concat(sessionInfo.sessionKey()), postData)
            .done(function () {
            showSuccessMessage();
            setTimeout(hideSuccessMessage, 2500);
        })
            .fail(function () {
            showErrorMessage();
            setTimeout(hideErrorMessage, 2500);
        });
    }
    function onSkipBtnClick() {
        $("".concat(EXIT_CONFIRM_SELECTOR, " .feedback")).addClass('element-hidden');
        resetSurveyState();
    }
    function triggerTransitionTypeNext(walkId) {
        var walk = getWalkById(walkId);
        if (!walk) {
            throw new Error("Walk ID \"".concat(walkId, "\" cannot be found."));
        }
        var lastPlayedStepId = getLastPlayedStepId(walk);
        var destinationStepId = getNextStepId(walk, lastPlayedStepId);
        markStepAsCompleted(walkId, lastPlayedStepId);
        closeMessages(walkId);
        proceedWalkWithDestinationStep(walk, destinationStepId);
    }
    function onTransitionsBtnClick(ev) {
        var container = $(ev.currentTarget).closest('.eesy_container');
        var walkId = container.data('helpitemid');
        var type = $(ev.currentTarget).data('transition-type');
        var walk = getWalkById(walkId);
        if (!walk) {
            throw new Error("Walk ID \"".concat(walkId, "\" cannot be found."));
        }
        var lastPlayedStepId = getLastPlayedStepId(walk);
        var destinationStepId = null;
        switch (type) {
            case TRANS_TYPE_EXIT: {
                close(walkId);
                break;
            }
            case TRANS_TYPE_PREVIOUS: {
                destinationStepId = getPreviousStepId(walk, lastPlayedStepId);
                if (lastPlayedStepId) {
                    walk.steps[lastPlayedStepId].isPlayed = false;
                }
                if (destinationStepId) {
                    walk.steps[destinationStepId].isPlayed = false;
                    markStepAsNotCompleted(walkId, destinationStepId);
                }
                closeMessages(walkId);
                proceedWalkWithDestinationStep(walk, destinationStepId);
                break;
            }
            case TRANS_TYPE_NEXT: {
                destinationStepId = getNextStepId(walk, lastPlayedStepId);
                markStepAsCompleted(walkId, lastPlayedStepId);
                closeMessages(walkId);
                proceedWalkWithDestinationStep(walk, destinationStepId);
                break;
            }
            default:
                throw new Error("Not supported transition type \"".concat(type, "\"!"));
        }
    }
    function proceedWalkWithDestinationStep(walk, destinationStepId) {
        if (!destinationStepId || !(destinationStepId in walk.steps)) {
            throw new Error("Destination ID \"".concat(destinationStepId, "\" cannot be found in steps."));
        }
        for (var _i = 0, _a = walk.steps[destinationStepId].rules; _i < _a.length; _i++) {
            var rule = _a[_i];
            var candidates = getCandidatesForRule(rule);
            if (candidates.length) {
                showStep(walk.entity.id, destinationStepId, candidates[0]);
                return;
            }
        }
    }
    function getVoteDetails(stepId, walk) {
        if (!walk) {
            return undefined;
        }
        var details = {
            amount: walk.stepsOrder.length,
            index: walk.stepsOrder.indexOf(stepId),
            stepId: stepId,
            title: walk.steps[stepId].title,
            walkId: walk.entity.id,
        };
        return JSON.stringify(details);
    }
    function getNextStepId(walk, activeStepId) {
        var activeStepIndex = walk.stepsOrder.indexOf(activeStepId);
        if (activeStepIndex > -1) {
            return walk.stepsOrder[activeStepIndex + 1];
        }
        return null;
    }
    function getPreviousStepId(walk, activeStepId) {
        var activeStepIndex = walk.stepsOrder.indexOf(activeStepId);
        if (activeStepIndex > -1) {
            return walk.stepsOrder[activeStepIndex - 1];
        }
        return null;
    }
    function getLastPlayedStepId(walk) {
        var out = '';
        walk.stepsOrder.forEach(function (key) {
            if (walk.steps[key].isPlayed) {
                out = key;
            }
        });
        return out;
    }
    function getCandidatesForRule(rule) {
        var currUrl = ctxProbe.getDocumentLocation(document);
        var candidates = $('body, body *:visible');
        for (var _i = 0, _a = rule.conditions; _i < _a.length; _i++) {
            var cond = _a[_i];
            candidates = conditionMatcher.reduceCandidates(currUrl, document, candidates, cond);
        }
        return candidates;
    }
    function resetSurveyState() {
        feedbackAnswer = null;
        isFeedbackVisible = false;
        $("".concat(EXIT_CONFIRM_SELECTOR, " .feedback-reason")).val('');
        $("".concat(EXIT_CONFIRM_SELECTOR, " #toggle-anonymous")).prop('checked', false);
        $('.vote-btn').removeClass('active');
    }
    function onWalkExitCancelBtnClick() {
        var walkId = $(EXIT_CONFIRM_SELECTOR).data('walk-id');
        if (!isNaN(walkId)) {
            var walk = getWalkById(walkId);
            walk && markStepAsNotCompleted(walkId, getLastPlayedStepId(walk));
        }
        removeExitConfirmation();
    }
    function removeExitConfirmation() {
        resetSurveyState();
        $(EXIT_CONFIRM_SELECTOR).remove();
    }
    function onWalkExitConfirmBtnClick() {
        var walkId = $(EXIT_CONFIRM_SELECTOR).data('walk-id');
        setAndStoreActiveWalks(activeWalks.filter(function (i) { return i.entity.id !== walkId; }));
        closeMessages(walkId);
        markHelpItemAsClosed(walkId);
        /* This 'removeExitConfirmation' has to be called after those above (some DOM elements dependencies). */
        removeExitConfirmation();
        restartActiveWalks();
    }
    function closeMessages(walkId) {
        hideProactiveHint(walkId);
        popups.hide();
        systrays.hide(walkId);
        $('.eesy_dark').remove();
        $('#eesy-dark-screen').remove();
    }
    function hideProactiveHint(walkId) {
        eesyTimers.stop("helpitem".concat(walkId));
        $("#systraycontainer_".concat(walkId)).remove();
        $("#arrow_".concat(walkId)).remove();
        $('.eesy-highlighted').removeClass('eesy-highlighted');
    }
    function canContextElementTriggerTransition(anchorElement, step) {
        return (step.type === 'hint' &&
            step.transitions.length === 0 &&
            !$(anchorElement).is('input') &&
            !$(anchorElement).is('textarea'));
    }
    function showStep(walkId, stepId, anchorElement) {
        var walk = getWalkById(walkId);
        if (!walk) {
            throw new Error("Walk ID \"".concat(walkId, "\" not found."));
        }
        var step = walk.steps[stepId];
        if (!step) {
            throw new Error("Step ID \"".concat(stepId, "\" not found."));
        }
        if (canContextElementTriggerTransition(anchorElement, step)) {
            $(anchorElement).one('click keypress', function (event) {
                if (event.which === 13 || event.type === 'click') {
                    triggerTransitionTypeNext(walkId);
                }
            });
        }
        var parsed = parseBRK(step.content);
        var showArg = __assign(__assign(__assign(__assign({}, walk.entity), step), parsed), { embed: parsed.html });
        switch (step.type) {
            case 'hint':
                proactiveHints.show(showArg, anchorElement);
                break;
            case 'popup':
                popups.show(showArg);
                break;
            case 'systray':
                systrays.show(showArg);
                break;
            default:
                throw new Error("Unsupported step type: \"".concat(step.type, "\"."));
        }
        step.isPlayed = true;
    }
    function getWalkById(id) {
        return activeWalks.filter(function (i) { return i.entity.id === id; })[0];
    }
    function checkWalksWithAllStepsPlayed() {
        var toDeactivate = [];
        activeWalks.forEach(function (walk) {
            var allStepsAmount = walk.stepsOrder.length;
            var playedStepsAmount = walk.stepsOrder
                .map(function (stepId) { return walk.steps[stepId].isPlayed; })
                .filter(Boolean).length;
            if (allStepsAmount === playedStepsAmount) {
                toDeactivate.push(walk.entity.id);
            }
        });
        setAndStoreActiveWalks(activeWalks.filter(function (i) { return toDeactivate.indexOf(i.entity.id) < 0; }));
        toDeactivate.forEach(function (walkId) {
            markWalkAsCompleted(walkId);
        });
    }
    function areWalkStampsInLine(walk) {
        if (walk.userViewsStamp !== getUserViewsStamp()) {
            return false;
        }
        if (walk.entityViewsStamp !== helpitemResetStamps[walk.entity.id]) {
            return false;
        }
        return true;
    }
    /**
     * There are two types of #BRK# patterns:
     * for 'hint' OR 'systray'   --> <mode>#BRK#<width>#BRK#<height>#BRK#<content>
     * for 'popup' AKA 'message' --> <width>#BRK#<height>#BRK#<msgType>:<content>
     *
     * Server side logic: https://github.com/Eesy/eesy-server/blob/4b8af832e410daa32f28ca67f00574c3fc517777/src/main/java/services/HelpItemStruct.java#L58
     */
    function parseBRK(text) {
        var defaults = {
            height: null,
            html: text,
            popupType: POPUP_TYPE_NONE,
            width: null,
        };
        if (typeof text !== 'string') {
            return defaults;
        }
        if (text.split(BRK_DELIMITER).length !== 3) {
            var _a = text.split(BRK_DELIMITER), width_1 = _a[1], height_1 = _a[2], html = _a[3];
            return {
                html: (html || '').trim(),
                width: parseDimension(width_1),
                height: parseDimension(height_1),
                popupType: POPUP_TYPE_NONE,
            };
        }
        var separatorIndex = text.indexOf(':');
        if (separatorIndex === -1) {
            return defaults;
        }
        var brkPart = text.substring(0, separatorIndex);
        var contentPart = text.substring(separatorIndex + 1);
        var _b = brkPart.split(BRK_DELIMITER), width = _b[0], height = _b[1], popupType = _b[2];
        return {
            html: contentPart.trim(),
            width: parseDimension(width),
            height: parseDimension(height),
            popupType: popupType,
        };
    }
    function parseDimension(value) {
        return value === '0' ? null : value;
    }
    function isTruthy(value) {
        return Boolean(value);
    }
});
//# sourceMappingURL=walkthroughs.js.map