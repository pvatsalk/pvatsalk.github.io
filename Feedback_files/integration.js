"use strict";
/*
 * Copyright (C) 2019, Blackboard Inc.
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  -- Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *
 *  -- Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *
 *  -- Neither the name of Blackboard Inc. nor the names of its contributors
 *     may be used to endorse or promote products derived from this
 *     software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY BLACKBOARD INC ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL BLACKBOARD INC. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
// Verify that we're in the integration iframe
if (!window.parent) {
    throw new Error('Not within iframe');
}
// Impact bbultra rest api
var restApiUrl = '/rest/bbultra';
var integrationHost = window.location.protocol +
    '//' +
    window.location.hostname +
    (window.location.port === '' ? '' : ':' + window.location.port);
var messageChannel;
var portalId;
var notificationId;
var analyticsId;
var currentModal;
var currentNotification;
var isNotificationShowing = false;
var isSysTrayShowing = false;
var isModalShowing = false;
var isSupportCenterPanelShowing = false;
var resizePanel = false;
var messageInQueue;
var sysTraysInQueue = [];
var modalsInQueue = [];
var modalHeaderCloseButtonClicked;
var uefSettings;
var proactiveLanguage;
var hiddenItemsSessionStorage = sessionStorage.getItem('eesysoft_hidden_items') || JSON.stringify({});
var hiddenItems = JSON.parse(hiddenItemsSessionStorage);
var showSupportTab = true;
sessionStorage.removeItem('isNotificationCloseIconClicked');
sessionStorage.removeItem('eesy_UEFDefaultHelp');
sessionStorage.removeItem('uefSupportCenterArticleId');
sessionStorage.removeItem('eesyState.route');
sessionStorage.removeItem('eesyState.analyticsId');
// Impact state object
var uefState = {
    route: '',
    analyticsId: '',
};
var MESSAGES_TIMEOUT_IN_MILLIS = 250;
// Set up the window.postMessage listener for the integration handshake
window.addEventListener('message', onPostMessageReceived, false);
// Send the integration handshake message to Learn Ultra. This notifies Learn Ultra that the integration has
// loaded and is ready to communicate.
window.parent.postMessage({ type: 'integration:hello' }, "".concat(window.__lmsHost, "/*"));
function onPostMessageReceived(evt) {
    // Do some basic message validation.
    var fromTrustedHost = evt.origin === window.__lmsHost || evt.origin === integrationHost;
    if (!fromTrustedHost || !evt.data || !evt.data.type) {
        return;
    }
    // Receives and handle messages from uef-messages-handlers
    if (evt.data.type === 'showHint') {
        showNotification(evt.data.itemID, evt.data.width, evt.data.height, false);
    }
    else if (evt.data.type === 'showPopup') {
        showModal(evt.data.itemID, evt.data.width, evt.data.height, evt.data.title);
    }
    else if (evt.data.type === 'showSystray') {
        showNotification(evt.data.itemID, evt.data.width, evt.data.height, true);
    }
    // Used by Expert Tool chrome plugin
    else if (evt.data.type === 'setUefRoute') {
        setUefRoute();
    }
    else {
        // A majority of the communication between the integration and Learn Ultra will be over a "secure" MessageChannel.
        // As response to the integration handshake, Learn Ultra will send a MessageChannel port to the integration.
        if (evt.data.type === 'integration:hello') {
            // Store the MessageChannel port for future use
            messageChannel = new LoggedMessageChannel(evt.ports[0]);
            messageChannel.onmessage = onMessageFromUltra;
            // Now, we need to authorize with Learn Ultra using the OAuth2 token that the server negotiated for us
            messageChannel.postMessage({
                type: 'authorization:authorize',
                // This token is passed in through integration.html
                token: window.__token,
            });
        }
    }
}
function handleRouteEvent(eventData) {
    sysTraysInQueue = [];
    modalsInQueue = [];
    if (eventData.routeData.courseId) {
        var courseId = eventData.routeData.courseId;
        window.eesy_course_id = parseInt(courseId.substr(courseId.indexOf('_') + 1, courseId.lastIndexOf('_') - 1), 10);
        sessionStorage.setItem('eesy_courseId', '' + window.eesy_course_id);
        if (eventData.routeData.contentId) {
            // todo contentId could be useful somehow
            var contentId = eventData.routeData.contentId;
        }
    }
    else {
        sessionStorage.setItem('eesy_courseId', '-1');
        window.eesy_course_id = undefined;
    }
    window.dispatchEvent(new CustomEvent('uefIntegration.routeChange'));
}
function showModal(helpItemId, width, height, title) {
    if (!isModalShowing) {
        if (isSupportCenterPanelShowing || isNotificationShowing) {
            if (!isModalInQueue(helpItemId)) {
                modalsInQueue.push({
                    helpItemId: helpItemId,
                    width: width,
                    height: height,
                    title: title,
                });
            }
        }
        else {
            isModalShowing = true;
            markHelpItemAsSeen(helpItemId);
            currentModal = {
                helpItemId: helpItemId,
                width: width,
                height: height,
                title: title,
            };
            var modalWidth_1 = setHelpItemWidth(width, 'small');
            setTimeout(function () {
                messageChannel.postMessage({
                    type: 'portal:modal',
                    modalId: helpItemId,
                    contents: getModalContents(helpItemId, modalWidth_1, height, title),
                });
            }, MESSAGES_TIMEOUT_IN_MILLIS);
        }
    }
    else {
        if (!isModalInQueue(helpItemId)) {
            modalsInQueue.push({
                helpItemId: helpItemId,
                width: width,
                height: height,
                title: title,
            });
        }
    }
}
function showNotification(helpItemId, width, height, isSystray, isHintInQueue) {
    // When the modal is displayed first we need to send the notification for sys trays requests once again
    // after modal has been closed so stacking sys trays
    if (isSystray && (isSupportCenterPanelShowing || isModalShowing || isNotificationShowing)) {
        if (!isSysTrayInQueue(helpItemId)) {
            sysTraysInQueue.push({
                helpItemId: helpItemId,
                width: width,
                height: height,
            });
        }
    }
    else {
        if (!isNotificationShowing) {
            // ignore hints when a modal or sys tray is displayed
            if (!isSystray && (isModalShowing || isSupportCenterPanelShowing || isSysTrayShowing)) {
                return;
            }
            currentNotification = {
                helpItemId: helpItemId,
                width: width,
                height: height,
                isSysTray: isSystray,
            };
            isSysTrayShowing = isSystray;
            isNotificationShowing = true;
            markHelpItemAsSeen(helpItemId);
            if (!isHintInQueue) {
                analyticsId = sessionStorage.getItem('eesyState.analyticsId') || '';
            }
            var modalWidth_2 = setHelpItemWidth(width, 'small');
            setTimeout(function () {
                messageChannel.postMessage({
                    type: 'portal:notification',
                    selector: {
                        type: isSystray ? 'notification:region:selector' : 'notification:analytics:selector',
                        value: isSystray ? 'bottom:right' : analyticsId,
                    },
                    contents: getNotificationContents(helpItemId, modalWidth_2, height, isSystray),
                });
            }, isSystray ? MESSAGES_TIMEOUT_IN_MILLIS : 100);
        }
    }
}
function isModalInQueue(helpItemId) {
    var modalInQueue = false;
    modalsInQueue.forEach(function (modal) {
        if (modal.helpItemId === helpItemId) {
            modalInQueue = true;
        }
    });
    return modalInQueue;
}
function isSysTrayInQueue(helpItemId) {
    var sysTrayInQueue = false;
    sysTraysInQueue.forEach(function (sysTray) {
        if (sysTray.helpItemId === helpItemId) {
            sysTrayInQueue = true;
        }
    });
    return sysTrayInQueue;
}
function setHelpItemWidth(width, modalWidth) {
    if (isNaN(width)) {
        modalWidth = width.toLowerCase();
    }
    else {
        if (width >= 270 && width < 405) {
            modalWidth = 'medium';
        }
        else if (width >= 405) {
            modalWidth = 'large';
        }
    }
    return modalWidth;
}
function checkDontShowAgain() {
    if (sessionStorage.getItem('dontshowagain') !== null) {
        var_eesy_hiddenHelpItems[sessionStorage.getItem('dontshowagain')] = true;
        window.dispatchEvent(new CustomEvent('uefIntegration.dontshowagain'));
    }
}
function markHelpItemAsSeen(helpItemId) {
    httpRequest("".concat(integrationHost, "/rest/public/helpitems/").concat(helpItemId, "/viewed?sessionkey=").concat(sessionStorage.getItem('eesysoft_session_key')), 'PUT', undefined, undefined);
}
function getModalContents(hid, width, height, title) {
    return {
        tag: 'Modal',
        props: {
            width: width,
        },
        children: [
            {
                tag: 'ModalHeader',
                props: {
                    title: title,
                },
            },
            {
                tag: 'ModalBody',
                children: [
                    {
                        tag: 'iframe',
                        props: {
                            style: {
                                display: 'flex',
                                height: height + 'px',
                                width: '100%',
                                flexDirection: 'column',
                                alignItems: 'stretch',
                                justifyContent: 'stretch',
                                border: '0',
                                flex: '1 1 auto',
                            },
                            src: "".concat(integrationHost).concat(restApiUrl, "/helpitem/").concat(hid, "?_=").concat(sessionStorage.getItem('var_eesy_build')),
                        },
                    },
                ],
            },
            {
                tag: 'ModalFooter',
                children: [
                    {
                        tag: 'button',
                        props: {
                            onClick: {
                                callbackId: hid,
                                mode: 'sync',
                            },
                            style: {
                                marginBottom: '0',
                            },
                            className: 'uef--button',
                        },
                        children: proactiveLanguage.LNG.PROACTIVE.CLOSEBUTTON,
                    },
                ],
            },
        ],
    };
}
function getNotificationContents(hid, width, height, isSystray) {
    return {
        tag: 'Notification',
        props: {
            size: width,
            theme: uefSettings.PROACTIVE.STYLE.DARK ? 'dark' : 'light',
            hideBeak: isSystray,
        },
        children: [
            {
                tag: 'iframe',
                props: {
                    style: {
                        display: 'flex',
                        height: height + 'px',
                        width: '100%',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        justifyContent: 'stretch',
                        border: '0',
                        flex: '1 1 auto',
                    },
                    src: "".concat(integrationHost).concat(restApiUrl, "/helpitem/").concat(hid, "?_=").concat(sessionStorage.getItem('var_eesy_build')),
                },
            },
        ],
    };
}
function handleHoverEvent(eventData) {
    if (!isNotificationShowing && !isModalShowing) {
        uefState.analyticsId = eventData.analyticsId;
        window.sessionStorage.setItem('eesyState.analyticsId', uefState.analyticsId);
        window.dispatchEvent(new CustomEvent('uefIntegration.hover'));
    }
}
function handleClickEvent(eventData) {
    uefState.analyticsId = eventData.analyticsId;
    window.sessionStorage.setItem('eesyState.analyticsId', uefState.analyticsId);
    window.dispatchEvent(new CustomEvent('uefIntegration.click'));
}
function getGlobalLtiStatesFromContentHandlerUrl(contentHandlerUrl) {
    var tempUrl = contentHandlerUrl.substr(contentHandlerUrl.indexOf('://') + 3);
    var activeLTIDomain = tempUrl.substr(0, tempUrl.indexOf('/'));
    var subDomains = activeLTIDomain.split('.').slice(1);
    var activeLTIDomainMain = subDomains.length > 1 ? subDomains.join('.') : undefined;
    var tempPath = tempUrl.substr(tempUrl.indexOf('/'));
    var activeLTIPath;
    var activeLTIParams;
    if (tempPath.indexOf('?') == -1) {
        // parameters not present
        activeLTIPath = tempPath;
        activeLTIParams = undefined;
    }
    else {
        activeLTIPath = tempPath.substr(0, tempPath.indexOf('?'));
        activeLTIParams = tempPath.substr(tempPath.indexOf('?') + 1);
    }
    return {
        ActiveLTI: {},
        ActiveLTIDomain: { value: activeLTIDomain, type: 'state', source: 'page_load' },
        ActiveLTIDomainMain: activeLTIDomainMain
            ? { value: activeLTIDomainMain, type: 'state', source: 'page_load' }
            : {},
        ActiveLTIPath: { value: activeLTIPath, type: 'state', source: 'page_load' },
        ActiveLTIParams: activeLTIParams ? { value: activeLTIParams, type: 'state', source: 'page_load' } : {},
    };
}
function deleteGlobalLtiStates() {
    delete window.GlobalEesy.ActiveLTI;
    delete window.GlobalEesy.ActiveLTIDomain;
    delete window.GlobalEesy.ActiveLTIDomainMain;
    delete window.GlobalEesy.ActiveLTIPath;
    delete window.GlobalEesy.ActiveLTIParams;
}
function handleLtiToolsWithoutPlacementId(toolHref, messageData) {
    var contentIdParamKey = 'content_id=';
    var contentIdIndex = toolHref.indexOf(contentIdParamKey);
    if (contentIdIndex !== -1) {
        var contentId = toolHref.substr(contentIdIndex + contentIdParamKey.length).split('&')[0];
        var courseId = messageData.routeData.courseId;
        httpRequest(window.__lmsHost + '/learn/api/public/v1/courses/' + courseId + '/contents/' + contentId, 'GET', [{ name: 'Authorization', value: 'Bearer ' + window.__token }], undefined, function (contentItem) {
            var response = JSON.parse(contentItem.trim());
            window.GlobalEesy = getGlobalLtiStatesFromContentHandlerUrl(response.contentHandler.url);
            createCustomEvent('registerLtiLaunch', {
                detail: {
                    launchType: 'LTI_LAUNCH_CONTENTHANDLER_ULTRA',
                    data: response.contentHandler.url,
                    courseId: window.eesy_course_id,
                },
            });
            setUefRoute();
            handleRouteEvent(messageData);
        }, function () { return console.error('Error connecting to learn course content api.'); });
    }
    else
        handleRouteEvent(messageData);
}
function handleLtiTools(placementIdIndex, placementIdParamKey, toolHref, messageData) {
    var placementId = toolHref.substr(placementIdIndex + placementIdParamKey.length).split('&')[0];
    createCustomEvent('registerLtiLaunch', {
        detail: {
            launchType: 'LTI_LAUNCH_ULTRA',
            data: placementId,
            courseId: window.eesy_course_id,
        },
    });
    httpRequest(window.__lmsHost + '/learn/api/public/v1/lti/placements/' + placementId, 'GET', [{ name: 'Authorization', value: 'Bearer ' + window.__token }], undefined, function (ltiPlacements) {
        var response = JSON.parse(ltiPlacements.trim());
        window.GlobalEesy.ActiveLTI = { value: response.handle, type: 'state', source: 'page_load' };
        setUefRoute();
        handleRouteEvent(messageData);
    }, function () { return console.error('Error connecting to learn lti placement api.'); });
}
function setUefRoute() {
    window.parent.postMessage({
        messageHandler: 'setUefRoute',
        route: uefState.route,
        GlobalEesy: window.GlobalEesy,
    }, '*');
}
function onMessageFromUltra(message) {
    // If our authorization token was valid, Learn Ultra will send us a response, notifying us that the authorization was successful
    if (message.data.type === 'authorization:authorize') {
        onAuthorizedWithUltra();
    }
    // On click, route, and hover messages, we will receive an event:event event
    if (message.data.type === 'event:event') {
        if (uefSettings.UEF.EVENT_LOGGING_ENABLED)
            console.debug(message.data);
        if (message.data.eventType === 'route') {
            uefState.route = message.data.routeName;
            window.sessionStorage.setItem('eesyState.route', uefState.route);
            window.GlobalEesy = window.GlobalEesy || {};
            deleteGlobalLtiStates();
            if (uefState.route.indexOf('peek.lti.launch-frame') !== -1) {
                var toolHref = message.data.routeData.toolHref;
                var placementIdParamKey = 'blti_placement_id=';
                var placementIdIndex = toolHref.indexOf(placementIdParamKey);
                if (placementIdIndex === -1) {
                    // no placement id
                    handleLtiToolsWithoutPlacementId(toolHref, message.data);
                }
                else {
                    // got placement id
                    handleLtiTools(placementIdIndex, placementIdParamKey, toolHref, message.data);
                }
            }
            else {
                setUefRoute(); // used by Expert Tool chrome plugin
                if (isOriginalCourse()) {
                    // close uef notifications when in an original iframe route
                    setTimeout(function () { return closeNotification(); }, 1000);
                }
                else if (uefState.route.indexOf('peek.course') !== -1) {
                    // ultra course route
                    /*
                    This timout fixes two problems:
                    1. Sometimes when clicking an original course, we first get an ultra course route then right after,
                        the original course route. This triggers ultra course messages in original courses.
                    2. An ultra course panel takes some time to load and can cause messages to briefly appear,
                        then closed automatically when the panel is rendered.
                     */
                    setTimeout(function () {
                        if (isOriginalCourse())
                            return;
                        else
                            handleRouteEvent(message.data);
                    }, 1000); // wait to see if route has changed or wait for course panel to render
                }
                else {
                    handleRouteEvent(message.data);
                }
            }
        }
        else if (message.data.eventType === 'hover') {
            handleHoverEvent(message.data);
        }
        else if (message.data.eventType === 'click') {
            // handle modal close icon
            if (message.data.analyticsId === 'integration.modal.header.close.button') {
                modalHeaderCloseButtonClicked = true;
            }
            handleClickEvent(message.data);
        }
        // this event is triggered whenever a message is opened
        else if (message.data.eventType === 'portal:new') {
            // message.data.portalId;
        }
        // this event is triggered whenever a message is closed
        else if (message.data.eventType === 'portal:remove') {
            var isSupportCenter = message.data.portalId === portalId;
            // only place to fetch event from clicking outside a notification container
            if (isNotificationShowing && !isSupportCenter) {
                isNotificationShowing = false;
                var isNotificationCloseIconClicked = sessionStorage.getItem('isNotificationCloseIconClicked');
                if (isSysTrayShowing) {
                    // handle close icon, the rest is handled in the close:response
                    if (isNotificationCloseIconClicked || sessionStorage.getItem('isPopupHandler')) {
                        sessionStorage.removeItem('isNotificationCloseIconClicked');
                    }
                    else {
                        // clicking outside container
                        postMessage({ type: 'closeUefMessages', itemID: currentNotification.helpItemId }, integrationHost);
                        isSysTrayShowing = false;
                        currentNotification = undefined;
                        handleMessageQueues();
                    }
                }
                else {
                    // is hint
                    currentNotification.isSysTray = false;
                    isSysTrayShowing = false;
                    if (!isNotificationCloseIconClicked) {
                        // clicking outside container
                        currentNotification = undefined;
                        handleMessageQueues();
                    }
                    else {
                        sessionStorage.removeItem('isNotificationCloseIconClicked');
                    }
                }
            }
        }
        else if (message.data.eventType === 'help:request') {
            window.dispatchEvent(new CustomEvent('uefIntegration.helpRequest'));
            if (uefSettings.UEF.DEFAULT_HELP_ENABLED) {
                sessionStorage.setItem('eesy_UEFDefaultHelp', message.data.helpUrl);
            }
            sessionStorage.setItem('eesy_uef_support_center_loaded', 'true');
            sessionStorage.setItem('lmsMode', 'ultra');
            // Ignore default help request from Ultra
            messageChannel.postMessage({
                type: 'help:request:response',
                correlationId: message.data.correlationId,
            });
            launchSupportCenter();
        }
    }
    if (message.data.type === 'portal:modal:response') {
        // message.data.portalId;
    }
    if (message.data.type === 'portal:notification:response') {
        notificationId = message.data.notificationId;
    }
    if (message.data.type === 'portal:notification:status') {
        // message.data.portalId
        // status types: "visible", "queued", "removed"
        if (message.data.status === 'visible') {
            // message.data.notificationId;
        }
    }
    // handle notification close icon response
    if (message.data.type === 'portal:notification:close:response') {
        // message.data.notificationId
        if (currentNotification) {
            checkDontShowAgain();
            postMessage({
                type: 'closeUefMessages',
                itemID: currentNotification.helpItemId,
                isPopupHandler: sessionStorage.getItem('isPopupHandler'),
            }, integrationHost);
            if (sessionStorage.getItem('helpItemPopupHandle')) {
                sessionStorage.removeItem('helpItemPopupHandle');
            }
            else {
                hideHelpItem(currentNotification.helpItemId); // actively closed
            }
            isNotificationShowing = false;
            isSysTrayShowing = false;
            currentNotification = undefined;
            if (sessionStorage.getItem('isPopupHandler')) {
                sessionStorage.removeItem('isPopupHandler');
            }
            else {
                handleMessageQueues();
            }
        }
    }
    // handle modal close (outside of container and icon)
    if (message.data.type === 'portal:modal:close:response') {
        isModalShowing = false;
        // handle modal close icon
        if (modalHeaderCloseButtonClicked) {
            checkDontShowAgain();
            postMessage({
                type: 'closeUefMessages',
                itemID: currentModal.helpItemId,
            }, integrationHost);
            hideHelpItem(currentModal.helpItemId); // actively closed
            modalHeaderCloseButtonClicked = false;
        }
        // clicking outside container or closed from clicking popup link
        else {
            postMessage({
                type: 'closeUefMessages',
                itemID: currentModal.helpItemId,
                isPopupHandler: sessionStorage.getItem('isPopupHandler'),
            }, integrationHost);
        }
        sessionStorage.removeItem('helpItemPopupHandle');
        if (!sessionStorage.getItem('isPopupHandler')) {
            handleMessageQueues();
        }
        else {
            sessionStorage.removeItem('isPopupHandler');
        }
        currentModal = undefined;
    }
    if (message.data.type === 'portal:callback') {
        // handle support center (iframe) closing
        if (message.data.callbackId === 'eesy-sc-panel-close') {
            sessionStorage.removeItem('eesy_uef_support_center_loaded');
            sessionStorage.removeItem('helpItemArticleHandle');
            isSupportCenterPanelShowing = false;
            if (resizePanel) {
                resizePanel = false;
                launchSupportCenter();
            }
            else
                handleMessageQueues();
        }
        // handle modal close button
        else if (currentModal && message.data.callbackId === currentModal.helpItemId) {
            checkDontShowAgain();
            closeModal(function () {
                hideHelpItem(currentModal.helpItemId); // actively closed
            });
            isModalShowing = false;
            handleMessageQueues();
        }
    }
    // Once Ultra has opened the panel, it will notify us that we can render into the panel
    if (message.data.type === 'portal:panel:response') {
        if (message.data.correlationId === 'eesy-sc-panel') {
            portalId = message.data.portalId;
            messageChannel.postMessage({
                type: 'portal:render',
                portalId: message.data.portalId,
                contents: {
                    tag: 'span',
                    props: {
                        style: {
                            display: 'flex',
                            height: '100%',
                            width: '100%',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            justifyContent: 'stretch',
                        },
                    },
                    children: [
                        {
                            tag: 'iframe',
                            props: {
                                style: {
                                    flex: '1 1 auto',
                                    position: 'fixed',
                                    top: '0',
                                    left: '0',
                                    right: '0',
                                    bottom: '0',
                                    width: '100%',
                                    height: '100%',
                                },
                                src: "".concat(integrationHost).concat(restApiUrl, "/iframe-panel?_=").concat(sessionStorage.getItem('var_eesy_build')),
                            },
                        },
                    ],
                },
            });
        }
    }
}
function isOriginalCourse() {
    return uefState.route.indexOf('peek.course.classic') !== -1;
}
function hideHelpItem(helpItemId) {
    hiddenItems[helpItemId] = true;
    sessionStorage.setItem('eesysoft_hidden_items', JSON.stringify(hiddenItems));
}
function handleMessageQueues() {
    handleMessageInQueue(function () {
        handleModalsInQueue(function () {
            handleSysTraysInQueue();
        });
    });
}
function handleMessageInQueue(callback) {
    if (messageInQueue && !isSupportCenterPanelShowing) {
        if (messageInQueue.isSysTray) {
            // is systray
            showNotification(messageInQueue.helpItemId, messageInQueue.width, messageInQueue.height, messageInQueue.isSysTray);
        }
        else if (messageInQueue.title) {
            // is popup
            showModal(messageInQueue.helpItemId, messageInQueue.width, messageInQueue.height, messageInQueue.title);
        }
        else {
            // is hint
            showNotification(messageInQueue.helpItemId, messageInQueue.width, messageInQueue.height, messageInQueue.isSysTray, true);
        }
        messageInQueue = undefined;
    }
    callback && callback();
}
function handleModalsInQueue(callback) {
    modalsInQueue.forEach(function (modal, index, array) {
        setTimeout(function () {
            array.splice(index, 1);
            showModal(modal.helpItemId, modal.width, modal.height, modal.title);
        }, MESSAGES_TIMEOUT_IN_MILLIS);
    });
    callback && callback();
}
function handleSysTraysInQueue(callback) {
    sysTraysInQueue.forEach(function (sysTray, index, array) {
        setTimeout(function () {
            array.splice(index, 1);
            showNotification(sysTray.helpItemId, sysTray.width, sysTray.height, true);
        }, MESSAGES_TIMEOUT_IN_MILLIS);
    });
    callback && callback();
}
function launchSupportCenter() {
    var panelType = sessionStorage.getItem('resizeUefSupportCenter') || 'small';
    isSupportCenterPanelShowing = true;
    closeModal();
    messageChannel.postMessage({
        type: 'portal:panel',
        correlationId: 'eesy-sc-panel',
        panelType: panelType,
        panelTitle: uefSettings.UEF.SUPPORT_CENTER.TITLE,
        useCustomPadding: true,
        attributes: {
            onClose: {
                callbackId: 'eesy-sc-panel-close',
            },
        },
    });
}
function closeSupportCenter() {
    if (isSupportCenterPanelShowing) {
        messageChannel.postMessage({
            type: 'portal:panel:close',
            id: portalId,
        });
    }
}
function closeModal(callback) {
    if (isModalShowing) {
        messageChannel.postMessage({
            type: 'portal:modal:close',
            modalId: currentModal.helpItemId,
        });
        callback && callback();
    }
}
function closeNotification(callback) {
    if (isNotificationShowing || isOriginalCourse()) {
        messageChannel.postMessage({
            type: 'portal:notification:close',
            notificationId: notificationId,
        });
        callback && callback();
    }
}
function onAuthorizedWithUltra() {
    initEngine(function () {
        document.addEventListener('engineLoaded', function () {
            showSupportTabForUser(function () {
                getAndSetUefSettings(function () {
                    var userLanguageId = sessionStorage.getItem('eesy_userLanguageID') || '-1';
                    getAndSetProactiveLanguage(userLanguageId, function () {
                        // Subscribe to events, such as telemetry events
                        // Event types: 'click', 'route', 'hover', 'portal:new', 'portal:remove', 'route:changing'
                        messageChannel.postMessage({
                            type: 'event:subscribe',
                            subscriptions: ['click', 'route', 'hover', 'portal:new', 'portal:remove'],
                        });
                        if (uefSettings.UEF.SUPPORT_CENTER.ENABLED && showSupportTab) {
                            // Register as helpProvider
                            messageChannel.postMessage({
                                type: 'help:register',
                                id: window.__appId,
                                displayName: uefSettings.UEF.SUPPORT_CENTER.TITLE,
                                providerType: window.__providerType,
                                iconUrl: "".concat(integrationHost, "/resources/images/").concat(uefSettings.UEF.SUPPORT_CENTER.ICON),
                            });
                        }
                    }, function () { return console.error('Error getting language map.'); });
                }, function () { return console.error('Error getting uef settings.'); });
            }, function () { return console.error('Error getting support_tab_visibility settings.'); });
        });
    });
}
function showSupportTabForUser(success, error) {
    if (JSON.parse(window.__customSupportTabVisibility)) {
        httpRequest(integrationHost +
            '/rest/public/support-center/show-support-button/' +
            sessionStorage.getItem('eesysoft_session_key') +
            '?_dbcnt=' +
            sessionStorage.getItem('var_eesy_dbUpdateCount'), 'GET', undefined, undefined, function (showSupportTabResponse) {
            showSupportTab = JSON.parse(showSupportTabResponse);
            success && success();
        }, function () { return error && error(); });
    }
    else {
        showSupportTab = true;
        success && success();
    }
}
function getAndSetProactiveLanguage(userLanguageId, success, error) {
    httpRequest(integrationHost +
        '/rest/public/language/proactive' +
        '?languageId=' +
        userLanguageId +
        '&s=' +
        sessionStorage.getItem('eesysoft_session') +
        '&_=' +
        sessionStorage.getItem('var_eesy_dbUpdateCount'), 'GET', undefined, undefined, function (proactiveLanguageResponse) {
        proactiveLanguage = JSON.parse(proactiveLanguageResponse);
        sessionStorage.setItem('proactiveLanguage', proactiveLanguageResponse);
        success && success();
    }, function () { return error && error(); });
}
function getAndSetUefSettings(success, error) {
    httpRequest(integrationHost +
        '/rest/settings/uef' +
        '?sessionkey=' +
        sessionStorage.getItem('eesysoft_session_key') +
        '&_=' +
        Date.now(), 'GET', undefined, undefined, function (uefSettingsResponse) {
        uefSettings = JSON.parse(uefSettingsResponse);
        sessionStorage.setItem('uefSettings', uefSettingsResponse);
        success && success();
    }, function () { return error && error(); });
}
// Sets up a way to communicate between a iframe and the integration script of the same origin
window.addEventListener('storage', onEventFromIframe);
function onEventFromIframe(evt) {
    // handle notification close icon
    if (evt.key === 'isNotificationCloseIconClicked') {
        if (evt.newValue !== null) {
            closeNotification();
        }
    }
    // handle link clicks to support articles
    else if (evt.key === 'helpItemArticleHandle') {
        if (evt.newValue !== null) {
            if (currentModal) {
                messageInQueue = {
                    helpItemId: currentModal.helpItemId,
                    width: currentModal.width,
                    height: currentModal.height,
                    title: currentModal.title,
                };
            }
            else if (currentNotification) {
                if (currentNotification.isSysTray) {
                    messageInQueue = {
                        helpItemId: currentNotification.helpItemId,
                        width: currentNotification.width,
                        height: currentNotification.height,
                        isSysTray: true,
                    };
                }
                else {
                    // is hint
                    messageInQueue = {
                        helpItemId: currentNotification.helpItemId,
                        width: currentNotification.width,
                        height: currentNotification.height,
                        isSysTray: false,
                    };
                }
            }
            launchSupportCenter();
        }
    }
    else if (evt.key === 'resizeUefSupportCenter') {
        if (evt.newValue !== null) {
            resizePanel = true;
            closeSupportCenter();
        }
    }
    // handle closing of the support center when a popup link has been clicked from within the sc
    else if (evt.key === 'closeUefSupportCenter') {
        if (evt.newValue !== null) {
            closeSupportCenter();
            sessionStorage.removeItem('closeUefSupportCenter');
        }
    }
    // handle link clicks from messages to popups
    else if (evt.key === 'helpItemPopupHandle') {
        if (evt.newValue !== null) {
            var helpItem = JSON.parse(evt.newValue);
            closeModal();
            closeNotification();
            createCustomEvent('helpitemHandle', {
                detail: {
                    helpitemGuid: helpItem.guid,
                    isUefSupportCenterPopupHandle: false,
                },
            });
        }
    }
    // handle link clicks from support center to popups
    else if (evt.key === 'isUefSupportCenterPopupHandle') {
        if (evt.newValue !== null) {
            var helpItemRequest = JSON.parse(evt.newValue);
            showModal(helpItemRequest.itemID, helpItemRequest.width, helpItemRequest.height, helpItemRequest.title);
            sessionStorage.removeItem('isUefSupportCenterPopupHandle');
        }
    }
}
function createCustomEvent(eventName, data) {
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent(eventName, true, true, data);
    document.dispatchEvent(event);
}
/**
 * A MessageChannel-compatible API, but with console logging.
 */
var LoggedMessageChannel = /** @class */ (function () {
    function LoggedMessageChannel(messageChannel) {
        var _this = this;
        this.onmessage = function (evt) { };
        // From Learn Ultra
        this.onMessage = function (evt) {
            _this.onmessage(evt);
        };
        // To Learn Ultra
        this.postMessage = function (msg) {
            _this.messageChannel.postMessage(msg);
        };
        this.messageChannel = messageChannel;
        this.messageChannel.onmessage = this.onMessage;
    }
    return LoggedMessageChannel;
}());
// Impact injection script
function initEngine(callback) {
    httpRequest(window.__lmsHost + '/learn/api/public/v1/users/uuid:' + window.__userId, 'GET', [{ name: 'Authorization', value: 'Bearer ' + window.__token }], undefined, function (userInfo) {
        httpRequest(window.__lmsHost + '/learn/api/public/v1/users/uuid:' + window.__userId + '/courses', 'GET', [{ name: 'Authorization', value: 'Bearer ' + window.__token }], undefined, function (userCourses) {
            var userData = JSON.parse(userInfo);
            var courseData = JSON.parse(userCourses);
            var courseRoles = {};
            userData.institutionRoleIds.forEach(function (institutionRoleId) {
                courseRoles[institutionRoleId] = {};
            });
            courseData.results.forEach(function (course) {
                courseRoles['CourseRole_' + course.courseRoleId] = {};
            });
            var roles = window.__userRoles;
            Object.keys(courseRoles).forEach(function (role) {
                roles += '#COMMA#' + role;
            });
            var hostPath = document.referrer.substring(document.referrer.indexOf(':') + 3);
            var host = hostPath.substring(0, hostPath.indexOf('/'));
            var userLoginParams = "username=".concat(encodeURIComponent(window.__userName), "/auto/bb                &mail=").concat(encodeURIComponent(window.__userEmail), "                &locale=").concat(encodeURIComponent(window.__userLocale), "                &fullname=").concat(encodeURIComponent(window.__userFullName), "                &roles=").concat(encodeURIComponent(roles), "                &pk1=").concat(userData.id, "                &isUltra=true                &host=").concat(host, "                &signature=").concat(window.__eesySignature);
            httpRequest('/UserLogin.jsp?', 'POST', [{ name: 'Content-type', value: 'application/x-www-form-urlencoded' }], userLoginParams, function (sessionKey) {
                var eesySessionKey = sessionKey.trim();
                if (eesySessionKey != '') {
                    sessionStorage.setItem('eesysoft_session_key', eesySessionKey);
                    launchEngine(eesySessionKey);
                    callback && callback();
                }
                else {
                    console.error('Unable to get session key.');
                }
            }, function () { return console.error('User login failed.'); });
        }, function () { return console.error('Error connecting to learn courses api.'); });
    }, function () { return console.error('Error connecting to learn users api.'); });
}
// @ts-ignore
function launchEngine(sessionKey) {
    var __eesyEngine = document.createElement('script');
    __eesyEngine.src =
        integrationHost +
            '/loader.jsp' +
            '?stmp=' +
            new Date().getTime() +
            '&showquicklink=false' +
            '&uef_mode=true' +
            '&loadExpertTool=false' +
            '&k=' +
            sessionKey;
    __eesyEngine.async = true;
    __eesyEngine.type = 'text/javascript';
    var __element = document.getElementsByTagName('script')[0];
    if (__element.parentNode !== null)
        __element.parentNode.insertBefore(__eesyEngine, __element);
}
function httpRequest(url, method, headers, params, success, error) {
    var request = new XMLHttpRequest();
    request.open(method, url, true);
    if (Array.isArray(headers)) {
        headers.forEach(function (header) {
            request.setRequestHeader(header.name, header.value);
        });
    }
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status >= 200 && request.status < 400) {
            success && success(request.responseText);
        }
        else if (request.status >= 400) {
            error && error();
        }
    };
    request.send(params);
}
//# sourceMappingURL=integration.js.map