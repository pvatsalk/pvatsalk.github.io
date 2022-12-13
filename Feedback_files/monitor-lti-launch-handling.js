"use strict";
eesy.define('monitor-lti-launch-handling', ['jquery-private', 'sessionInfo'], function ($, sessionInfo) {
    document.addEventListener('registerLtiLaunch', function (ev) {
        var details = (ev || {}).detail || {};
        var ltiLaunchWithCourseId = {
            data: details.data,
            launch_type: details.launchType,
            courseId: details.courseId !== undefined ? details.courseId : -1,
        };
        handleLtiLaunch(ltiLaunchWithCourseId);
    });
    var unhandledLtiLaunches = [];
    if (!sessionStorage.eesysoft_unhandled_lti_launches) {
        sessionStorage.eesysoft_unhandled_lti_launches = JSON.stringify([]);
    }
    unhandledLtiLaunches = JSON.parse(sessionStorage.eesysoft_unhandled_lti_launches);
    return { handleUnhandledLtiLaunches: handleUnhandledLtiLaunches };
    function addUnhandledLtiLaunch(ltiLaunchWithCourseId) {
        if (!ltiLaunchWithCourseidInArray(ltiLaunchWithCourseId, unhandledLtiLaunches)) {
            unhandledLtiLaunches.push(ltiLaunchWithCourseId);
        }
        sessionStorage.eesysoft_unhandled_lti_launches = JSON.stringify(unhandledLtiLaunches);
    }
    function removeUnhandledLtiLaunch(ltiLaunchWithCourseId) {
        removeLtiLaunchWithCourseIdFromArray(ltiLaunchWithCourseId, unhandledLtiLaunches);
        sessionStorage.eesysoft_unhandled_lti_launches = JSON.stringify(unhandledLtiLaunches);
    }
    function handleUnhandledLtiLaunches() {
        unhandledLtiLaunches.forEach(function (ltiLaunchWithCourseId) {
            handleLtiLaunch(ltiLaunchWithCourseId);
        });
    }
    function handleLtiLaunch(ltiLaunchWithCourseId) {
        addUnhandledLtiLaunch(ltiLaunchWithCourseId);
        if (sessionInfo.sessionKey().trim() === '') {
            removeUnhandledLtiLaunch(ltiLaunchWithCourseId);
            return;
        }
        $.ajax({
            url: "".concat(sessionInfo.dashboardUrl(), "/rest/public/lti/launch") +
                "?launchtype=".concat(ltiLaunchWithCourseId.launch_type, "&data=").concat(ltiLaunchWithCourseId.data, "&sessionkey=").concat(sessionInfo.sessionKey(), "&courseid=").concat(ltiLaunchWithCourseId.courseId, "&_=").concat(new Date().getTime()),
            type: 'PUT',
            success: function (data) {
                createCustomEvent('lti.launch.context', { detail: { contextId: data } });
                removeUnhandledLtiLaunch(ltiLaunchWithCourseId);
            },
        });
    }
    function ltiLaunchWithCourseidInArray(ltiLaunchWithCourseId, array) {
        return findIndexInArray(ltiLaunchWithCourseId, array) > -1;
    }
    function findIndexInArray(ltiLaunchWithCourseId, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].courseId === ltiLaunchWithCourseId.courseId &&
                array[i].launch_type === ltiLaunchWithCourseId.launch_type &&
                array[i].data === ltiLaunchWithCourseId.data) {
                return i;
            }
        }
        return -1;
    }
    function removeLtiLaunchWithCourseIdFromArray(ltiLaunchWithCourseId, array) {
        var index = findIndexInArray(ltiLaunchWithCourseId, array);
        if (index > -1) {
            array.splice(index, 1);
        }
    }
});
//# sourceMappingURL=monitor-lti-launch-handling.js.map