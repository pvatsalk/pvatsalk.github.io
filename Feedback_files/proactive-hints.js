"use strict";
eesy.define('proactive-hints', [
    'jquery-private',
    'utils',
    'mustachejs',
    'presentation-helper',
    'helpitem-visibility',
    'eesy-timers',
    'helpitem-accessibility',
], function ($, utils, Mustache, presentationHelper, helpItemVisibility, eesyTimers, helpItemAccessibility) {
    return { show: show };
    function show(helpItem, connectTo) {
        var $body = $('body');
        var helpItemId = helpItem.id;
        $body.append(Mustache.to_html(eesyTemplates.hintfixed, presentationHelper.helpItemModel(helpItem), eesyTemplates));
        __showHintProactive(helpItem, connectTo);
        helpItemAccessibility.renderProactiveHintAnchors(connectTo, helpItemId);
        var hint = document.getElementById("systraycontainer_".concat(helpItemId));
        if (hint) {
            utils.onElementRemove(hint, function () { return helpItemAccessibility.removeHintAnchors(helpItemId); });
        }
    }
    function __showHintProactive(helpItem, connectTo) {
        var _a;
        if (!helpItemVisibility.isVisible(helpItem.id)) {
            hideHint(helpItem.id, connectTo);
            return;
        }
        if (window.sessionStorage['build_mode'] === 'true') {
            $(connectTo).removeClass('eesy-highlighted');
        }
        else {
            var surveyHeight = $('#systraycontainer_' + helpItem.id + ' .quick-survey-section').outerHeight();
            surveyHeight = surveyHeight ? surveyHeight : 54.7; // set default for proactive v4
            var surveyOffset = var_proactive_version == 4 ? surveyHeight : 0;
            var metrics = calcMetrics(connectTo, parseInt(helpItem.width), parseInt(helpItem.height), surveyOffset);
            var hintXPos = 0;
            var hintYPos = 0;
            var arrowPos = undefined;
            var allowedDirections = [
                'BOTTOM',
                'TOP',
                'RIGHT',
                'LEFT',
                'BOTTOMRIGHT',
                'BOTTOMLEFT',
                'TOPRIGHT',
                'TOPLEFT',
            ];
            var orientationCandidates = allowedDirections.indexOf(helpItem.orientation) === -1 ||
                !canPositionAt(metrics, helpItem.orientation)
                ? allowedDirections
                : [helpItem.orientation];
            var orientation_1 = getOrientation(metrics, orientationCandidates);
            var $systrayContainer = $("#systraycontainer_".concat(helpItem.id));
            var arrowSelector = "#arrow_".concat(helpItem.id);
            if (orientation_1 !== undefined) {
                $(connectTo).addClass('eesy-highlighted');
                var c = metrics.hintMetricsCentered;
                var t = metrics.target;
                var h = metrics.hintMetrics;
                _a = {
                    BOTTOM: ['up', c.left, t.top + t.height + 14],
                    TOP: ['down', c.left, t.top - h.height - surveyOffset - 15],
                    RIGHT: ['right', t.left + t.width + 15, c.top],
                    LEFT: ['left', t.left - h.width - 15, c.top],
                    BOTTOMRIGHT: ['up rightcorner', t.left + t.width - 20, t.top + t.height + 14],
                    BOTTOMLEFT: ['up leftcorner', t.left - h.width + 20, t.top + t.height + 14],
                    TOPRIGHT: ['down rightcorner', t.left + t.width - 20, t.top - h.height - surveyOffset - 15],
                    TOPLEFT: ['down leftcorner', t.left - h.width + 20, t.top - h.height - surveyOffset - 15],
                }[orientation_1], arrowPos = _a[0], hintXPos = _a[1], hintYPos = _a[2];
                $systrayContainer.css({
                    display: 'block',
                    position: 'absolute',
                    height: helpItem.height + 'px',
                    width: helpItem.width + 'px',
                    top: hintYPos,
                    left: hintXPos,
                });
                $('#arrowInner_' + helpItem.id)
                    .removeClass('eesyarrow up down left right leftcorner rightcorner')
                    .addClass('eesyarrow ' + arrowPos);
                if ((arrowPos == 'down' || arrowPos == 'down rightcorner' || arrowPos == 'down leftcorner') &&
                    var_proactive_version == 4) {
                    $("".concat(arrowSelector, " .eesyarrow")).css({
                        top: 'calc(100% + ' + surveyOffset + 'px - 1.5px )',
                    });
                }
                else {
                    $("".concat(arrowSelector, " .eesyarrow")).css('top', '');
                }
                if (utils.isTargetVisible(metrics.target, connectTo) || $systrayContainer.is(':focus-within')) {
                    $(arrowSelector).fadeIn('slow');
                    fadeInElement($systrayContainer);
                }
                else {
                    $(arrowSelector).fadeOut('slow');
                    fadeOutElement($systrayContainer);
                }
            }
            else if (!utils.isTargetVisible(metrics.target, connectTo)) {
                $(arrowSelector).fadeOut('slow');
                fadeOutElement($systrayContainer);
            }
        }
        eesyTimers.set('helpitem' + helpItem.id, 100, function () {
            __showHintProactive(helpItem, connectTo);
        });
    }
    function hideHint(id, connectTo) {
        $('#systraycontainer_' + id)
            .fadeOut('fast')
            .remove();
        $(connectTo).removeClass('eesy-highlighted');
        $('#arrow_' + id).remove();
        $("#systray_anchor_".concat(id)).focus().parent().remove();
        $(document).trigger('helpitemHandle.hide', [id]);
    }
    function getOrientation(metrics, orientationCandidates) {
        return orientationCandidates.find(function (c) { return canPositionAt(metrics, c); });
    }
    function fadeInElement($element) {
        $element.css({
            opacity: 1,
            'z-index': '',
        });
    }
    function fadeOutElement($element) {
        $element.css({
            opacity: 0,
            'z-index': -1,
        });
    }
    function canPositionAt(metrics, orientationCandidate) {
        var orientationChecks = {
            BOTTOM: function () { return metrics.canCenter.x && metrics.space.below; },
            TOP: function () { return metrics.canCenter.x && metrics.space.above; },
            RIGHT: function () { return metrics.canCenter.y && metrics.space.right; },
            LEFT: function () { return metrics.canCenter.y && metrics.space.left; },
            BOTTOMRIGHT: function () { return metrics.space.below && metrics.space.right; },
            BOTTOMLEFT: function () { return metrics.space.below && metrics.space.left; },
            TOPRIGHT: function () { return metrics.space.above && metrics.space.right; },
            TOPLEFT: function () { return metrics.space.above && metrics.space.left; },
        };
        return orientationChecks[orientationCandidate]();
    }
    function calcMetrics(connectTo, hintWidth, hintHeight, surveyOffset) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        var hintOffset = 10;
        var target = {
            left: (_b = (_a = $(connectTo).offset()) === null || _a === void 0 ? void 0 : _a.left) !== null && _b !== void 0 ? _b : 0,
            top: (_d = (_c = $(connectTo).offset()) === null || _c === void 0 ? void 0 : _c.top) !== null && _d !== void 0 ? _d : 0,
            width: Math.max((_e = $(connectTo).outerWidth()) !== null && _e !== void 0 ? _e : 0, (_f = $(connectTo).width()) !== null && _f !== void 0 ? _f : 0),
            height: Math.max((_g = $(connectTo).outerHeight()) !== null && _g !== void 0 ? _g : 0, (_h = $(connectTo).height()) !== null && _h !== void 0 ? _h : 0),
        };
        var hintMetrics = {
            width: hintWidth,
            height: hintHeight,
        };
        var hintMetricsCentered = {
            left: target.left + (target.width - hintMetrics.width) / 2,
            top: target.top + (target.height - hintMetrics.height) / 2,
        };
        var scrollTop = (_j = $(window).scrollTop()) !== null && _j !== void 0 ? _j : 0;
        var scrollLeft = (_k = $(window).scrollLeft()) !== null && _k !== void 0 ? _k : 0;
        var windowWidth = (_l = $(window).width()) !== null && _l !== void 0 ? _l : 0;
        var windowHeight = (_m = $(window).height()) !== null && _m !== void 0 ? _m : 0;
        var space = {
            below: target.top + target.height + hintMetrics.height + surveyOffset + hintOffset <
                scrollTop + windowHeight,
            above: target.top - hintMetrics.height - surveyOffset - hintOffset > scrollTop,
            right: target.left + target.width + hintMetrics.width + hintOffset < scrollLeft + windowWidth,
            left: target.left - hintMetrics.width - hintOffset > scrollLeft,
        };
        var bodyWidth = (_o = $('body').width()) !== null && _o !== void 0 ? _o : 0;
        var canCenter = {
            x: hintMetricsCentered.left >= 0 &&
                hintMetricsCentered.left + hintMetrics.width < bodyWidth &&
                (space.below || space.above),
            y: hintMetricsCentered.top >= 0 &&
                hintMetricsCentered.top + hintMetrics.height + surveyOffset + hintOffset <
                    windowHeight + scrollTop &&
                (space.left || space.right),
        };
        return {
            target: target,
            hintMetrics: hintMetrics,
            hintMetricsCentered: hintMetricsCentered,
            space: space,
            canCenter: canCenter,
        };
    }
});
//# sourceMappingURL=proactive-hints.js.map