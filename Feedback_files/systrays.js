"use strict";
eesy.define('systrays', ['jquery-private', 'utils', 'mustachejs', 'eesy-timers', 'presentation-helper', 'helpitem-accessibility'], function ($, utils, Mustache, eesyTimers, presentationHelper, helpItemAccessibility) {
    return { show: show, preview: preview, hide: hide };
    function hide(helpItemId) {
        $('#systraycontainer').remove();
        if (helpItemId) {
            eesyTimers.stop("helpitem".concat(helpItemId));
        }
        else {
            eesyTimers.stopAll();
        }
    }
    function show(helpItem) {
        if ($('#systraycontainer').length) {
            if ($('#systraycontainer').data('helpitemid') == helpItem.id) {
                return;
            }
            $('#systraycontainer').remove();
        }
        if (utils.cookieExists('eesysystrayhidden_' + helpItem.id + '_' + var_key))
            return;
        $('body').prepend(Mustache.to_html(eesyTemplates.systray, presentationHelper.helpItemModel(helpItem), eesyTemplates));
        positionSystray(helpItem);
        $('#systraycontainer').fadeIn('slow', function () {
            helpItemAccessibility.goToSystray();
        });
    }
    function positionSystray(helpItem) {
        var _a, _b, _c, _d;
        if (!$('#systraycontainer').length)
            return;
        if ($('#systraycontainer').data('helpitemid') != helpItem.id)
            return;
        var survey = $("#systraycontainer[data-helpitemid=\"".concat(helpItem.id, "\"] .quick-survey-section"));
        var surveyheight = survey.length ? ((_a = survey.height()) !== null && _a !== void 0 ? _a : 0) + 30 : 0;
        var bottomTabPos = var_tab_version == 2 ? 88 : 20; // Adjust bottom if tab v2
        var bottomPos = (var_proactive_version == 4 || var_proactive_version == 3 ? surveyheight : 0) + bottomTabPos;
        if (attemptUnobscure) {
            var bodyWidth = (_b = $('body').width()) !== null && _b !== void 0 ? _b : 0;
            var windowHeight = (_c = $(window).height()) !== null && _c !== void 0 ? _c : 0;
            var traypos_1 = {
                left: bodyWidth - 20 - helpItem.width,
                right: bodyWidth - 20,
                top: windowHeight - bottomPos - helpItem.height,
                bottom: windowHeight - bottomPos,
                height: '',
            };
            if (windowHeight - bottomPos < helpItem.height) {
                traypos_1.top = 0;
                traypos_1.height = windowHeight - bottomPos + 'px';
            }
            else {
                traypos_1.height = helpItem.height + 'px';
            }
            do {
                var obscuringStuff = false;
                $('input').each(function () {
                    if (utils.intersectRect(traypos_1, utils.rectangleOf($(this)))) {
                        obscuringStuff = true;
                        // nudge left
                        traypos_1.left -= 50;
                        traypos_1.right -= 50;
                    }
                });
            } while (obscuringStuff && traypos_1.right > 0);
            $('#systraycontainer').css({
                position: 'fixed',
                height: traypos_1.height,
                width: traypos_1.right - traypos_1.left + 'px',
                top: traypos_1.top,
                left: traypos_1.left,
                bottom: traypos_1.bottom,
            });
        }
        else {
            var windowHeight = (_d = $(window).height()) !== null && _d !== void 0 ? _d : 0;
            if (windowHeight - bottomPos < helpItem.height) {
                $('#systraycontainer').css({
                    position: 'fixed',
                    height: windowHeight - bottomPos + 'px',
                    width: helpItem.width + 'px',
                    top: '0px',
                    right: '20px',
                });
            }
            else {
                $('#systraycontainer').css({
                    position: 'fixed',
                    height: helpItem.height + 'px',
                    width: helpItem.width + 'px',
                    bottom: bottomPos + 'px',
                    top: 'auto',
                    right: '20px',
                });
            }
        }
        eesyTimers.set('helpitem' + helpItem.id, 100, function () {
            positionSystray(helpItem);
        });
    }
    function preview(helpItem) {
        $('#systraycontainer').remove();
        $('#expertActionBar').append(Mustache.to_html(eesyTemplates.systray, presentationHelper.helpItemModel(helpItem), eesyTemplates));
        $('#systraycontainer').css({
            position: 'fixed',
            height: helpItem.height + 'px',
            width: helpItem.width + 'px',
            bottom: var_proactive_version == 4 ? 172 : 22 + 'px',
            right: '440px',
        });
        $('#systraycontainer').show();
    }
});
//# sourceMappingURL=systrays.js.map