"use strict";
eesy.define('keep-alive', ['jquery-private', 'sessionInfo'], function ($, sessionInfo) {
    /*
    private functions:
  */
    function keepAliveTimer() {
        $.ajax({
            url: "".concat(sessionInfo.dashboardUrl(), "/rest/public/session/keep-alive?sessionkey=").concat(sessionInfo.sessionKey()),
            type: 'PUT',
            success: function (data) { },
        });
        setTimeout(keepAliveTimer, 30 * 6e4); // 30 minutes
    }
    /*
  public functions:
  */
    function start() {
        setTimeout(keepAliveTimer, 30 * 6e4); // 30 minutes
    }
    return {
        start: start,
    };
});
//# sourceMappingURL=keep-alive.js.map