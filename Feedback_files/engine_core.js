"use strict";
window['Impact'] = window['Impact'] || {};
var Impact = window['Impact'];
eesy.define('engine_core', [
    'jquery-private',
    'context-probe',
    'context-handling',
    'json!context-node-link-data',
    'monitor-handling',
    'monitor-lti-launch-handling',
    'events-urlchange',
    'events-domchange',
    'events-iframe',
    'engine-state',
    'keep-alive',
    'presentation',
    'found-items-handler',
    'mouse',
    'context-tree-matcher',
    'eesy-timers',
    'hints',
    'helpitem-handling',
    'support-tab',
    'utils',
    'sessionInfo',
    'session-events',
    'iframe_communicator_server',
    'json!language',
    'json!settings-supportcenter',
], function ($, ctxProbe, ctxHandling, contextNodeLinks, monitorHandling, monitorLtiLaunchHandling, eventsUrlChange, eventsDOMChange, eventsIframe, engineState, keepAlive, presentation, foundItemsHandler, mouse, contextTreeMatcher, eesyTimers, hints, helpitemHandling, supportTab, utils, sessionInfo, sessionEvents, iframe_communicator_server, language, supportCenterSettings) {
    var mouseOverElement = undefined;
    var lookupTimer = null;
    var ltiHelpItems = '';
    var ltiNodes = '';
    var ltiLaunchContext = undefined;
    window.addEventListener('eesy_launchSupportTab', function () {
        supportTab.launchSupportCenter();
    }, true);
    window.addEventListener('eesy_launchSupportCenterBySessionStorage', function () {
        supportTab.launchSupportCenterBySessionStorage();
    }, true);
    $(document).on('helpitemArticleHandle', function (e) {
        eesyRequire(['supportCenter'], function (supportCenter) {
            supportCenter.showHelpItemInNode(e.originalEvent.detail.helpitemGuid);
        });
    });
    return {
        start: start,
    };
    function inBuildMode() {
        return window.sessionStorage.build_mode && window.sessionStorage.build_mode == 'true';
    }
    function hideExpertToolChromePlugin() {
        var elementsToHide = ['#expert-build-mode', '#eesyBuildModeBar'];
        if (window.parent.$) {
            elementsToHide.forEach(function (elementId) {
                var element = window.parent.$(elementId);
                if (element.length === 1)
                    element.hide();
            });
        }
    }
    function showExpertToolChromePlugin() {
        var $expertTool = window.parent.$('#expert-build-mode');
        if ($expertTool.length === 1 && !inBuildMode())
            $expertTool.show();
        var $buildModeBar = window.parent.$('#eesyBuildModeBar');
        if ($buildModeBar.length === 1 && inBuildMode()) {
            $buildModeBar.show();
        }
    }
    function start() {
        var isSupportCenterVisibleForUser = false;
        engineState.foundNodes.set(foundItemsHandler.create());
        if (var_show_tab && !var_isLtiLaunch && !var_uefMode) {
            if (Impact.enabled) {
                // For eesy-support-center we don't want to init support tab here, we just pass flag.
                // Later is eesy-support-center we check if customer is "Tier 1 + Chatbot" and then show support tab.
                isSupportCenterVisibleForUser = true;
            }
            else {
                supportTab.render(function () {
                    sessionStorage.setItem('lmsMode', 'originalCourseExperience');
                    supportTab.launchSupportCenter(undefined, ltiHelpItems, ltiNodes);
                    utils.focusElement('#supportCenterMainHeading', 500);
                });
            }
        }
        if (var_uefModeOriginal) {
            hideExpertToolChromePlugin();
        }
        if (var_isExpert && var_loadExpertTool) {
            // load expert tool
            eesyRequire(['expert-tools'], function (expertTools) {
                window['InlineEditorConfig'] = {
                    dashboardUrl: var_dashboard_url,
                    languageId: var_expert_language,
                    sessionKey: var_key,
                };
                expertTools.show(function () {
                    // handle expert tool chrome plugin
                    if (var_isExpertToolChromePlugin) {
                        iframe_communicator_server.bind('setUefRoute', function (request) {
                            sessionStorage.setItem('eesyState.route', request.route);
                            window.GlobalEesy = request.GlobalEesy;
                            if (request.route.indexOf('peek.course.classic') !== -1) {
                                // is original course
                                hideExpertToolChromePlugin();
                            }
                            else {
                                showExpertToolChromePlugin();
                            }
                        });
                        for (var i = 0; i < window.parent.frames.length; i++) {
                            window.parent.frames[i].postMessage({ type: 'setUefRoute' }, '*');
                        }
                    }
                });
            });
        }
        monitorHandling.handleUnhandledMonitors();
        monitorLtiLaunchHandling.handleUnhandledLtiLaunches();
        // Do not handle monitors when in build mode, uef expert tool or uef support center
        if ((!inBuildMode() && !var_uefMode) ||
            (var_uefMode &&
                window.location !== window.parent.location &&
                !sessionStorage.getItem('eesy_uef_support_center_loaded'))) {
            handleContentChanges();
        }
        function loadImapct() {
            var match = contextTreeMatcher.scanForContext(ctxProbe.getDocumentLocation(document), document);
            var contextRulesIds = [];
            for (var ruleId in match) {
                contextRulesIds.push(ruleId);
            }
            var contextNodePaths = engineState.foundNodes.get().getFoundItemsString().split(',');
            Impact.init({
                sessionKey: var_key,
                dashboardUrl: var_dashboard_url,
                languageId: var_language,
            }, {
                contextNodePaths: contextNodePaths,
                contextNodeLinks: contextNodeLinks,
                contextRulesIds: contextRulesIds,
                helpItemsFromContexts: helpitemHandling.getFoundItems(),
                isSupportCenterVisibleForUser: isSupportCenterVisibleForUser,
                showSupportTab: supportTab.render,
                language: language,
                supportCenterSettings: supportCenterSettings,
            });
        }
        if (window['_chatBotReady']) {
            window['_chatBotReady'].then(loadImapct);
        }
        else if (Impact.init) {
            // Legacy loading method. Remove after all beta institutions move to new launching scripts.
            loadImapct();
        }
        //
        // Allow iframes/lti tools to load the engine directly()
        //
        window.addEventListener('message', function (e) {
            if (e.data.messageName === 'lti.data') {
                ltiHelpItems = e.data.helpItems;
                ltiNodes = e.data.nodes;
            }
            if (e.data.messageName === 'lti.ready') {
                handleLtiReadyEvent(e);
            }
        }, false);
        document.addEventListener('ltiLoadEngine', function (d) {
            handleLtiReadyEvent(d.detail.event);
        });
        document.addEventListener('lti.launch.context', function (d) {
            ltiLaunchContext = d.detail.contextId;
            handleContentChanges();
        });
        function handleLtiReadyEvent(e) {
            if (e.source !== null) {
                var dashboardUrl = sessionInfo.dashboardUrl().indexOf('//') > -1
                    ? sessionInfo.dashboardUrl().split('//')[1]
                    : sessionInfo.dashboardUrl();
                e.source.postMessage({
                    eesysoftloader: '//' +
                        dashboardUrl +
                        '/loader.jsp' +
                        '?stmp=' +
                        new Date().getTime() +
                        '&listento=top.nav' +
                        '&embedded=true' +
                        '&showquicklink=false' +
                        '&k=' +
                        sessionInfo.sessionKey() +
                        '&isLtiLaunch=true',
                }, '*');
                var_ltiEngineIsPresent = true;
            }
        }
        if (!var_uefMode || var_uefModeOriginal) {
            registerGuardedHandler(document, 'mousemove', handleMouseMove);
            registerGuardedHandler(document, 'iframe.mousemove', function (e, orgEvent) { return handleMouseMove(orgEvent); });
            registerGuardedHandler(document, 'mouseup', function (e) { return probeForMonitors($(e.target)); });
            registerGuardedHandler(document, 'iframe.mouseup', function (e, orgEvent) {
                return probeForMonitors($(orgEvent.target));
            });
            registerGuardedHandler(document, 'iframes.changed presentation.hide.item', handleContentChanges);
            registerGuardedHandler(window, 'domchanged', handleContentChanges);
            registerGuardedHandler(document, 'iframe.focus iframe.added', function (e, iframe) {
                return probeForMonitors($(iframe).find('body'));
            });
            registerGuardedHandler(window, 'urlchanged', handleContentChanges);
            registerGuardedHandler(document, 'focusin', handleFocusChange);
            eventsIframe.start();
            eventsUrlChange.start();
            eventsDOMChange.start();
        }
        //link tracking
        $(document).on('click', '[data-helpitemid] a', function () {
            var helpItemId = $(this).closest('[data-helpitemid]').data('helpitemid');
            sessionEvents.addHelpitemLinkClickedEvent(getLinkClickEventData(helpItemId, this));
        });
        // UEF Events
        if (var_uefMode &&
            window.location !== window.parent.location &&
            !inBuildMode() &&
            !var_uefModeOriginal &&
            !var_isExpertToolChromePlugin) {
            window.addEventListener('uefIntegration.routeChange', handleUEFIntegrationRouteChange, true);
            window.addEventListener('uefIntegration.click', handleUEFIntegrationClick, true);
            window.addEventListener('uefIntegration.hover', handleUEFIntegrationHover, true);
            window.addEventListener('uefIntegration.helpRequest', handleUEFIntegrationHelpRequest, true);
            window.addEventListener('uefIntegration.dontshowagain', handleUEFIntegrationDontShowAgain, true);
        }
        keepAlive.start();
        if (var_uefMode && window.location.pathname === '/rest/bbultra/iframe-panel') {
            window.dispatchEvent(new CustomEvent('eesy_launchSupportCenterBySessionStorage'));
        }
    } //main end
    function getLinkClickEventData(_helpItemId, link) {
        var _a;
        var onClick = $(link).attr('onClick');
        var linkType = onClick !== undefined && onClick.indexOf('handleHelpItemByGuid') > -1 ? 'helpitem' : 'href';
        var target = linkType === 'helpitem' && onClick
            ? (_a = onClick.trim().match(/handleHelpItemByGuid\(["'](.*)["']\)/)) === null || _a === void 0 ? void 0 : _a[1]
            : $(link).attr('href');
        return {
            linkType: linkType,
            target: target,
            text: $(link).attr('href'),
            helpItemId: _helpItemId,
        };
    }
    function handleUEFIntegrationDontShowAgain() {
        var hid = sessionStorage.getItem('dontshowagain');
        $.ajax({
            url: "".concat(sessionInfo.dashboardUrl(), "/rest/public/helpitems/").concat(hid, "/hidden?sessionkey=").concat(sessionInfo.sessionKey()),
            type: 'PUT',
            success: function (data) { },
        });
        sessionStorage.removeItem('dontshowagain');
    }
    function handleUEFIntegrationHelpRequest() {
        sessionStorage.setItem('eesy_foundHelpItems', helpitemHandling.getFoundItemsString());
        sessionStorage.setItem('eesy_foundNodes', engineState.foundNodes.get().getFoundItemsString());
    }
    function handleUEFIntegrationRouteChange() {
        handleContentChanges();
    }
    function handleUEFIntegrationClick(e) {
        probeForMonitors($('body'));
    }
    function handleUEFIntegrationHover(e) {
        helpitemHandling.hideHints();
        probeForHelp($('body'));
    }
    function handleMouseMove(e) {
        var _a;
        mouse.x = e.pageX;
        mouse.y = e.pageY;
        if (e.target != mouse.lastelement) {
            mouse.lastelement = ((_a = e.target) !== null && _a !== void 0 ? _a : undefined);
            var $hintContainer = $('#hintcontainer');
            if (lookupTimer && $hintContainer.length === 0) {
                clearTimeout(lookupTimer);
                lookupTimer = null;
            }
            if (!lookupTimer) {
                lookupTimer = setTimeout(timedLookup, $hintContainer.length > 0 ? 1000 : 10);
            }
        }
    }
    function handleFocusChange(e) {
        var target = e.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }
        var isPreview = Boolean(document.querySelector('#hintcontainer[data-helpitemid="preview"]'));
        if (isPreview) {
            return;
        }
        var isHintAnchor = target.getAttribute('data-eesy-role') === 'hint-anchor';
        var isHintContent = target.closest('#hintcontainer');
        var hintContainer = document.getElementById('hintcontainer');
        var isCurrentVisibleHintTrigger = hintContainer &&
            target.getAttribute('data-eesy-assigned-helpitem-id') === hintContainer.getAttribute('data-helpitemid');
        if (isHintContent || isHintAnchor || isCurrentVisibleHintTrigger) {
            return;
        }
        var isKeyboardNavigation = utils.isFocusVisible(target);
        if (!isKeyboardNavigation && !isHintAnchor) {
            helpitemHandling.hideHints();
            return;
        }
        var hintId = target.getAttribute('data-eesy-connected-hintid');
        var connectedTo = hintId && document.querySelector("[data-eesy-assigned-helpitem-id=\"".concat(hintId, "\"]"));
        if (connectedTo) {
            target = connectedTo;
        }
        else {
            helpitemHandling.hideHints();
        }
        probeForHelp(target);
    }
    function registerGuardedHandler(target, eventName, handler) {
        $(target).on(eventName, function (e, data) {
            if (inBuildMode())
                return true;
            handler(e, data);
            return true;
        });
    }
    function probeForContexts(element) {
        ctxProbe.probeForElementContexts(ctxHandling.handlePresentContext, element);
        ctxProbe.probeForPresentContexts(element.get(0).ownerDocument, ctxHandling.handlePresentContext);
    }
    function handleContentChanges() {
        if (!eventsDOMChange.isEesyElement(mouse.lastelement)) {
            ctxHandling.clearQueuedContextLinks();
            ctxHandling.clearQueuedMonitors();
            engineState.foundNodes.get().clearFoundItems();
            probeForContexts($('body'));
            if (ltiLaunchContext !== undefined)
                ctxHandling.handleContextLinks({ id: ltiLaunchContext }, $('body'), 1);
            eventsIframe.getIFrames().forEach(function (iframe) {
                probeForContexts($(iframe.iframe.documentElement).find('body'));
            });
            ctxHandling.handleQueuedContextLinks();
            ctxHandling.handleQueuedMonitors();
            if (var_isLtiLaunch) {
                window.parent.postMessage({
                    messageName: 'lti.data',
                    helpItems: helpitemHandling.getFoundItemsString(),
                    nodes: engineState.foundNodes.get().getFoundItemsString(),
                }, '*');
            }
        }
    }
    function timedLookup() {
        var isKeyboardNavigation = utils.isFocusVisible(document.activeElement);
        if (mouseOverElement !== mouse.lastelement &&
            !eventsDOMChange.isEesyElement(mouse.lastelement) &&
            !isKeyboardNavigation) {
            mouseOverElement = mouse.lastelement;
            helpitemHandling.hideHints();
            probeForHelp(mouseOverElement);
        }
        lookupTimer = null;
    }
    function probeForMonitors(element) {
        ctxProbe.traversePathForMatchingContexts(element, function (contextRule) {
            ctxHandling.handleMonitors(contextRule);
        });
        ctxHandling.handleQueuedMonitors();
    }
    function probeForHelp(element) {
        ctxProbe.traversePathForMatchingContexts(element, function (contextRule) {
            ctxHandling.handleContextLinks(contextRule, element, 0);
        });
        ctxHandling.handleQueuedContextLinks();
    }
});
//# sourceMappingURL=engine_core.js.map