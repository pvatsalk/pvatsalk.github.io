(window.eesy ? eesy.define : define)([], function () {
    var dashboardUrl = undefined;
    var hasReportAccess = undefined;
    var instanceName = undefined;
    var isInitialized = false;
    var listeners = [];
    var sessionKey = undefined;
    var stylePath = undefined;

    function checkInitialized() {
        if (!isInitialized) {
            throw 'sessionInfo not initialized';
        }
    }

    function init(_dashboardUrl, _stylePath, _sessionKey, _hasReportAccess, _instanceName) {
        dashboardUrl = _dashboardUrl;
        stylePath = _stylePath;
        sessionKey = _sessionKey;
        hasReportAccess = _hasReportAccess;
        instanceName = _instanceName;
        isInitialized = true;

        for (const listener of listeners) {
            listener();
        }
    }

    function onInited(listener) {
        if (isInitialized) {
            listener();
        } else {
            listeners.push(listener);
        }
    }

    return {
        init,
        onInited,
        dashboardUrl: function (suffix) {
            checkInitialized();
            return [dashboardUrl, suffix].filter(Boolean).join('');
        },
        stylePath: function (suffix) {
            checkInitialized();
            return [stylePath, suffix].filter(Boolean).join('');
        },
        setSessionKey: function (_sessionKey) {
            sessionKey = _sessionKey;
        },
        sessionKey: function () {
            checkInitialized();
            return sessionKey;
        },
        hasReportAccess: function () {
            checkInitialized();
            return hasReportAccess;
        },
        instanceName: function () {
            checkInitialized();
            return instanceName;
        },
    };
});
