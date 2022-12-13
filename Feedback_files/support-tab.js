"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
eesy.define('support-tab', [
    'jquery-private',
    'engine-state',
    'utils',
    'mouse',
    'mustachejs',
    'json!language',
    'helpitem-handling',
    'context-tree-matcher',
    'context-probe',
    'sessionInfo',
    'json!settings-supportcenter',
], function ($, engineState, utils, mouse, Mustache, language, helpitemHandling, contextTreeMatcher, ctxProbe, sessionInfo, settings) {
    var supportTabSelector = '[data-eesy-role="support-center-button"]';
    var onClickSupportTab;
    var supportTabAlign = 'right';
    utils.onClickOrSelectKey('#eesy-tab-inner .eesy-tab2-btn-content, #eesy-tab-custom-inner .eesy-tab-custom-btn-content, #eesy-tab-inner.eesy-tab-v1', function () {
        if ($('#eesyBuildModeBar').length == 0) {
            onClickSupportTab && onClickSupportTab();
        }
    });
    // TODO can we replace these handlers entirely with css pseudo class selectors? (":hover" etc)
    $(document).on('mouseenter focus', '#eesy-tab-inner', function (e) {
        $('#eesy-tab-inner').addClass('___TabIsFocused');
    });
    $(document).on('mouseleave blur', '#eesy-tab-inner', function (e) {
        $('#eesy-tab-inner').removeClass('___TabIsFocused');
    });
    function startMove() {
        $('#eesy-tab-inner')
            .addClass('eesy_draggable')
            .parents()
            .on('mousemove touchmove', dragButton)
            .on('mouseup touchcancel touchend', stopMove);
    }
    function dragButton(e) {
        var _a;
        var minY = supportTabMoveLimit; // the top limit
        var posY;
        if (e.type == 'touchmove') {
            var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
            posY = touch.pageY;
        }
        else {
            posY = e.pageY;
        }
        var maxY = posY - supportTabMoveLimit; // the bottom limit
        var $eesyDraggable = $('.eesy_draggable');
        var draggableHeight = (_a = $eesyDraggable.outerHeight()) !== null && _a !== void 0 ? _a : 0;
        var topOffset = posY - draggableHeight / 2;
        var top = var_tab_version === 3 ? topOffset : Math.max(Math.min(topOffset, maxY), minY);
        $eesyDraggable.offset({ top: top });
        e.preventDefault();
    }
    function stopMove() {
        var $eesyTabInner = $('#eesy-tab-inner');
        var currentTabPosition = $eesyTabInner.position();
        $eesyTabInner
            .parents()
            .off('mousemove touchmove', dragButton)
            .off('mouseup touchcancel touchend', stopMove);
        $('.eesy_draggable').removeClass('eesy_draggable');
        updateDefaultPositionOffset(currentTabPosition.top);
    }
    function helpAvailableNotify() {
        if (!$('#eesy-tab-inner').length)
            return;
        var numHelpItems = 0;
        var tabData = function (key) {
            return $('#eesy-tab-inner').data(key);
        };
        if (var_tab_version == 1) {
            var host = tabData('host');
            var backBorder = parseInt(tabData('bottom-width')) > 0;
            var borderRadius = tabData('border-radius').substring(0, 1);
            var fgColor = encodeURIComponent(tabData('fg-color'));
            var bgColor = encodeURIComponent(tabData('bg-color'));
            supportTabAlign = tabData('align');
            var borderColor = tabData('border-style') == 'none' ? bgColor : encodeURIComponent(tabData('border-color'));
            var imageUrl = '//' +
                host +
                '/support_tab_image.jsp?' +
                'backBorder=' +
                backBorder +
                '&borderRadius=' +
                borderRadius +
                '&borderColor=' +
                borderColor +
                '&fgColor=' +
                fgColor +
                '&bgColor=' +
                bgColor +
                '&align=' +
                supportTabAlign.toUpperCase() +
                '&numItems=' +
                numHelpItems +
                '&language=' +
                var_language +
                '&extraHeightTop=' +
                ($('#eesy-tab-inner').data('hideable') ? 20 : 0) +
                '&styleChecksum=' +
                var_eesy_style_checksum;
            $('#eesy-tab-inner-img').one('load', function () {
                var width = $('#eesy-tab-inner-img').width();
                var height = $('#eesy-tab-inner-img').height();
                var maximizedWidth = eesy_maximizedTabWidth || width + 'px';
                $('#eesy-tab-inner')
                    .css('width', '' + (supportTabMinimized ? eesy_minimizedTabWidth : maximizedWidth))
                    .css('height', '' + height + 'px')
                    .css('background-position', supportTabAlign == 'left' ? 'right' : 'left');
                if ($('#eesy-tab-inner').data('hideable')) {
                    $('#tab-locker')
                        .css('display', 'block')
                        .css('height', width + 'px');
                    updateTabLocker(supportTabMinimized);
                }
            });
            $('#eesy-tab-inner').css('background-image', 'url(' + imageUrl + ')');
            $('#eesy-tab-inner-img').attr('src', imageUrl);
            $('#eesy-tab-inner').css(supportTabAlign, '0px');
        }
    }
    function updateTabLocker(drawMinimized) {
        var flip = supportTabAlign == 'left';
        var minimizedCode = flip ? 8676 : 8677;
        var maximizedCode = flip ? 8677 : 8676;
        var characterCode = drawMinimized ? minimizedCode : maximizedCode;
        $('#tab-locker').css('background-image', 'url(//' +
            $('#eesy-tab-inner').data('host') +
            '/generateIcon.jsp' +
            '?color=' +
            encodeURIComponent($('#eesy-tab-inner').data('fg-color')) +
            '&size=' +
            $('#eesy-tab-inner-img').width() +
            '&char=' +
            characterCode +
            ')');
    }
    function positionTab() {
        var _a, _b, _c, _d, _e, _f;
        if (var_tab_version != 1)
            return;
        try {
            var $tabInner = $('#eesy-tab-inner');
            var tabInnerHeight = (_b = (_a = $('#eesy-tab-inner')) === null || _a === void 0 ? void 0 : _a.height()) !== null && _b !== void 0 ? _b : 0;
            if (tabInnerHeight > 0) {
                // dont position if the image is not loaded yet
                if (supportTabAlign == 'right') {
                    try {
                        var $globalNavPageContentArea = $('#globalNavPageContentArea');
                        var adjustScrollbar = Boolean((_d = (_c = $globalNavPageContentArea.get(0)) === null || _c === void 0 ? void 0 : _c.scrollHeight) !== null && _d !== void 0 ? _d : 0 > ((_e = $globalNavPageContentArea.height()) !== null && _e !== void 0 ? _e : 0));
                        if (adjustScrollbar) {
                            $tabInner.css('right', scrollbarRightAdjust);
                        }
                        else {
                            $tabInner.css('right', '0px');
                        }
                    }
                    catch (e) {
                        $tabInner.css('right', '0px');
                    }
                }
                var tabInnerHeight_1 = (_f = $tabInner.height()) !== null && _f !== void 0 ? _f : 0;
                $tabInner.css('margin-top', '-' + tabInnerHeight_1 / 2 + 'px');
                $tabInner.css('display', 'inline-block');
            }
        }
        finally {
            setTimeout(function () {
                positionTab();
            }, 500);
        }
    }
    function render(_onClickSupportTab) {
        eesyRequire(['supportCenter'], function (supportCenter) {
            supportCenter.getLayout().then(function (layout) {
                var _a;
                onClickSupportTab = _onClickSupportTab;
                if (((_a = settings.ENV_SETTINGS) === null || _a === void 0 ? void 0 : _a.CUSTOM_BUTTON_STYLES_ENABLED) &&
                    layout &&
                    layout.properties.design_button_design_id === 'custom' &&
                    var_tab_version !== 3) {
                    eesyRequire(['support-tab-custom'], function (supportTabCustom) {
                        loadCustomButtonDesignCss();
                        var buttonDesign = supportTabCustom.getButtonCustomDesignFromLayout(layout);
                        supportTabCustom.init(buttonDesign, document.body, Mustache.to_html, supportTabPosition, updateDefaultPositionOffset, language.LNG);
                    });
                    return;
                }
                $('body').append({
                    1: eesyTemplates.dashboardlinker,
                    2: Mustache.to_html(eesyTemplates.dashboardlinker2, language),
                    3: Mustache.to_html(eesyTemplates.dashboardlinker3, language),
                }[var_tab_version]);
                if (var_tab_version == 1) {
                    helpAvailableNotify();
                    positionTab();
                }
                if (var_moveable_tab === true) {
                    var $supportButton = $('#eesy-tab-inner');
                    if (supportTabPosition !== null) {
                        $supportButton.css({ top: supportTabPosition + 'px' });
                        if (!utils.isInViewport($supportButton)) {
                            $supportButton.css({ top: '' });
                        }
                    }
                    if (var_tab_version === 3)
                        $supportButton.css({ right: '-25px' });
                    else if (var_uefModeOriginal)
                        $supportButton.css({ right: '-15px' });
                    $('.eesy-tab2-btn-handle').removeClass('eesyHidden');
                    $('body')
                        .on('mousedown', '.eesy-tab2-btn-handle', startMove)
                        .on('touchstart', '#eesy-tab-inner', startMove);
                }
            });
        });
    }
    function isDebugLocalAssets() {
        return sessionStorage.DEBUG_LOCAL_ASSETS === 'true';
    }
    function getDashboardUrl() {
        if (isDebugLocalAssets()) {
            return 'http://127.0.0.1:9666';
        }
        return var_dashboard_url;
    }
    function loadCustomButtonDesignCss() {
        var urlParts = [
            getDashboardUrl(),
            '/static/css/support-tab-custom.min.css',
            '?__dbc=',
            var_eesy_dbUpdateCount,
            '&__bn=',
            var_eesy_build,
            '&url=',
            window.location.hostname,
            isDebugLocalAssets() && "__stamp=".concat(Date.now()),
        ].filter(Boolean);
        eesy_load_css(urlParts.join(''));
    }
    function getRestServiceUrl(queryParts) {
        var query = __spreadArray(['u=sessionkey', "p=".concat(var_key)], queryParts, true);
        return "".concat(var_dashboard_url, "/restapi/service.jsp?").concat(query.join('&'));
    }
    function updateDefaultPositionOffset(position) {
        $.get(getRestServiceUrl(['userUpdate=setPosition', "top=".concat(position)]));
    }
    function launchSupportCenter(hid, ltiHelpItems, ltiNodes) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(var_key == '' && !!userLogin)) return [3 /*break*/, 2];
                        return [4 /*yield*/, userLogin()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        sessionInfo.setSessionKey(var_key);
                        eesyRequire(['supportCenter'], function (supportCenter) {
                            reportSupportTabClick(hid, true);
                            var match = contextTreeMatcher.scanForContext(ctxProbe.getDocumentLocation(document), document);
                            var ruleIds = [];
                            for (var ruleId in match) {
                                ruleIds.push(ruleId);
                            }
                            supportCenter.show(mergeItems(ltiHelpItems, helpitemHandling.getFoundItemsString()), mergeItems(ltiNodes, engineState.foundNodes.get().getFoundItemsString()), hid, ruleIds);
                        });
                        return [2 /*return*/];
                }
            });
        });
    }
    function mergeItems(ltiItems, parentItems) {
        return [ltiItems, parentItems].filter(Boolean).join();
    }
    function launchSupportCenterBySessionStorage() {
        eesyRequire(['supportCenter'], function (supportCenter) {
            var _a, _b;
            reportSupportTabClick(undefined, true);
            supportCenter.show((_a = sessionStorage.getItem('eesy_foundHelpItems')) !== null && _a !== void 0 ? _a : undefined, (_b = sessionStorage.getItem('eesy_foundNodes')) !== null && _b !== void 0 ? _b : undefined, undefined, []);
        });
    }
    function reportSupportTabClick(hid, async) {
        if (hid === undefined) {
            var url = var_uefMode ? sessionStorage.getItem('eesyState.route') : document.location.href;
            $.ajax(var_dashboard_url + '/restapi/service.jsp', {
                async: async,
                data: {
                    sessionkey: var_key,
                    userUpdate: 'addSessionEvent',
                    event_name: 'SUPPORT_TAB_TRIGGERED',
                    event_data: JSON.stringify({
                        url: url,
                        coursePk1: !(typeof eesy_course_id === 'undefined') ? eesy_course_id : -1,
                    }),
                },
            });
        }
    }
    function hide() {
        $(supportTabSelector).hide();
    }
    function show() {
        $(supportTabSelector).show();
    }
    function suspendHoverActions() {
        $(supportTabSelector).addClass('not-hoverable');
    }
    function restoreHoverActions() {
        $(supportTabSelector).removeClass('not-hoverable');
    }
    function isSupportButtonNode(node) {
        return (Boolean($(node).has(supportTabSelector).length) || Boolean($(node).closest(supportTabSelector).length));
    }
    // TODO can we replace these handlers entirely with css pseudo class selectors? (":hover" etc)
    $(document).on('mouseenter focus', '#eesy-tab-inner', function (e) {
        $('#eesy-tab-inner').addClass('___TabIsFocused');
    });
    $(document).on('mouseleave blur', '#eesy-tab-inner', function (e) {
        $('#eesy-tab-inner').removeClass('___TabIsFocused');
    });
    $(document).on('mouseenter', '#tab-locker', function (e) {
        updateTabLocker(!supportTabMinimized);
    });
    $(document).on('mouseleave', '#tab-locker', function (e) {
        updateTabLocker(supportTabMinimized);
    });
    $(document).on('click', '#tab-locker', function (e) {
        if ($('#eesy-tab-inner').data('hideable')) {
            supportTabMinimized = !supportTabMinimized;
            updateTabLocker(supportTabMinimized);
            var maximizedWidth = eesy_maximizedTabWidth || $('#eesy-tab-inner-img').width() + 'px';
            $('#eesy-tab-inner').animate({
                width: '' + (supportTabMinimized ? eesy_minimizedTabWidth : maximizedWidth),
            });
            $.get(getRestServiceUrl(['userUpdate=setMinimized', "minimized=".concat(supportTabMinimized ? 1 : 0)]));
            return false;
        }
    });
    return {
        suspendHoverActions: suspendHoverActions,
        hide: hide,
        launchSupportCenter: launchSupportCenter,
        launchSupportCenterBySessionStorage: launchSupportCenterBySessionStorage,
        render: render,
        restoreHoverActions: restoreHoverActions,
        show: show,
        isSupportButtonNode: isSupportButtonNode,
    };
});
//# sourceMappingURL=support-tab.js.map