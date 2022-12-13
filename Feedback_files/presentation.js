"use strict";
eesy.define('presentation', [
    'jquery-private',
    'sessionInfo',
    'engine-state',
    'utils',
    'helpitem-loader',
    'context-links',
    'mouse',
    'json!settings-supportcenter',
    'mustachejs',
    'json!language',
    'proactive-hints',
    'presentation-helper',
    'helpitem-visibility',
    'systrays',
    'quick-survey',
    'hints',
    'popups',
    'supportCenter',
    'helpitem-handling',
    'helpitem-accessibility',
    'walkthroughs',
], function (
/**
 * Some of these imports are not used, but still required in order to work.
 * DO NOT REMOVE without proper testing.
 */
$, sessionInfo, engineState, utils, helpitemLoader, contextlinks, mouse, settings, Mustache, language, proactiveHints, presentationHelper, helpitemVisibility, systrays, quickSurvey, hints, popups, supportCenter, helpitemHandling, helpItemAccessibility, walkthroughs) {
    window.addEventListener('previewhelp', function (ev) {
        var helpItem = ev.detail.helpItem;
        if (helpItem.itemtype === 'Hint') {
            hints.preview(helpItem);
        }
        else if (helpItem.itemtype === 'Systray') {
            systrays.preview(helpItem);
        }
        else if (helpItem.itemtype === 'Message') {
            popups.preview(helpItem);
        }
        else if (['HtmlCode', 'File'].indexOf(helpItem.itemtype) !== -1) {
            supportCenter.showHelpItemPreview(helpItem);
        }
    }, true);
    window.addEventListener('previewhelphide', function () {
        $('#hintcontainer[data-helpitemid="preview"]').remove();
        $('#systraycontainer').remove();
        $('.eesy_dark').remove();
        $('#eesy-dark-screen').remove();
        $('#eesy-standardcontainer').remove();
        supportCenter.hideHelpItemPreview();
    }, true);
    function showHintProactive(helpItem, connectTo) {
        proactiveHints.show(helpItem, connectTo);
    }
    function showHint(helpItem, connectTo) {
        hints.show(helpItem, connectTo);
    }
    function hideHint() {
        hints.hide();
    }
    function showPopup(helpItem) {
        popups.show(helpItem);
    }
    function showSystray(helpItem) {
        systrays.show(helpItem);
    }
    function showWalkthrough(helpItem) {
        walkthroughs.start(helpItem);
    }
    function showSupportTab() {
        supportTab.render(function () {
            supportTab.launchSupportCenter();
            utils.focusElement('#supportCenterMainHeading', 500);
        });
    }
    function fadeAndRemoveWithDark(target, onFaded) {
        target.fadeOut('fast', function () {
            $(this).remove();
            if ($('.eesy_dark').length) {
                $('.eesy_dark').fadeOut('fast', function () {
                    $(this).remove();
                    onFaded();
                });
            }
            else {
                onFaded();
            }
        });
    }
    function closeHelpitem(target) {
        var _a, _b, _c, _d, _e;
        var container = $(target).closest('.eesy_container');
        var helpItemId = (_b = (_a = container.get(0)) === null || _a === void 0 ? void 0 : _a.getAttribute('data-helpitemid')) !== null && _b !== void 0 ? _b : '';
        var helpItemType = (_e = (_d = (_c = container.get(0)) === null || _c === void 0 ? void 0 : _c.getAttribute('data-helpitem-type')) === null || _d === void 0 ? void 0 : _d.toLowerCase()) !== null && _e !== void 0 ? _e : '';
        if (helpItemType === 'walkthrough') {
            walkthroughs.close(helpItemId);
            return;
        }
        if (helpItemId && helpItemType === 'hint') {
            helpItemAccessibility.onCloseHintCallback(Number(helpItemId));
        }
        if (var_proactive_version > 2 && container.find('.eesy_hide_switch input').is(':checked')) {
            helpitemVisibility.dontShowAgain(Number(helpItemId));
        }
        else {
            helpitemVisibility.closeItem(Number(helpItemId));
        }
        fadeAndRemoveWithDark(container, function () {
            $('body').removeClass('eesy_modal_open');
            $(document).trigger('presentation.hide.item');
        });
    }
    utils.onClickOrSelectKey('.eesy_hint_close', function (e, target) { return closeHelpitem(target); });
    utils.onClickOrSelectKey('.eesy_close', function (e, target) { return closeHelpitem(target); });
    utils.onClickOrSelectKey('.eesy_systray_close', function (e, target) { return closeHelpitem(target); });
    // v2 & v1
    function hideAndFade(selector, element, onFaded) {
        helpitemVisibility.dontShowAgain($(selector).data('helpitemid'));
        fadeAndRemoveWithDark($(element).parents('.eesy_container'), onFaded);
    }
    utils.onClickOrSelectKey('#hintcontainer .eesy_hint_hide', function (e, element) {
        hideAndFade('#hintcontainer', element, function () { });
    });
    utils.onClickOrSelectKey('.eesy_systray_hide', function (e, element) {
        hideAndFade('#systraycontainer', element, function () { });
    });
    utils.onClickOrSelectKey('.eesy_standard_hide', function (e, element) {
        hideAndFade('#eesy-standardcontainer', element, function () {
            $(document).trigger('presentation.hide.item');
        });
    });
    utils.onClickOrSelectKey('.eesy_hintfixed_dontshowanymore', function (e, target) {
        var helpItemId = $(target).parents('.eesy_container').data('helpitemid');
        helpitemVisibility.dontShowAgain(helpItemId);
    });
    return {
        hideHint: hideHint,
        showHint: showHint,
        showHintProactive: showHintProactive,
        showPopup: showPopup,
        showSupportTab: showSupportTab,
        showSystray: showSystray,
        showWalkthrough: showWalkthrough,
    };
});
//# sourceMappingURL=presentation.js.map