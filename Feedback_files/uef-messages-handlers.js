"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
eesy.define('uef-messages-handlers', [
    'jquery-private',
    'sessionInfo',
    'presentation',
    'helpitem-loader',
    'view-controller',
    'eesy-timers',
    'iframe_communicator_server',
], function ($, sessionInfo, presentation, helpitemLoader, viewController, eesyTimers, iframe_communicator_server) {
    var isBuildMode = false;
    iframe_communicator_server.bind('enableUefBuildMode', function () {
        isBuildMode = true;
    });
    iframe_communicator_server.bind('disableUefBuildMode', function () {
        isBuildMode = false;
    });
    var AbstractHelpItemHandler = /** @class */ (function () {
        function AbstractHelpItemHandler(cl, triggedby, src) {
            this.cl = cl;
            this.triggedby = triggedby;
            this.src = src;
        }
        AbstractHelpItemHandler.prototype.hide = function () {
            eesyTimers.stop('helpitem' + this.cl.helpitemid);
        };
        AbstractHelpItemHandler.prototype.show = function (track, isUefSupportCenterPopupHandle) {
            var _this = this;
            helpitemLoader.loadHelpItem(this.cl.helpitemid, function (hi) {
                hi.embed = fixEesyLinks(hi.embed);
                if (!_this.triggedby) {
                    return;
                }
                _this.handle(hi, _this.triggedby, isUefSupportCenterPopupHandle);
            });
        };
        return AbstractHelpItemHandler;
    }());
    var ProactiveHintHandler = /** @class */ (function (_super) {
        __extends(ProactiveHintHandler, _super);
        function ProactiveHintHandler() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.itemType = viewController.ITEM_TYPE.HINT_PROACTIVE;
            _this.multiSupport = false;
            _this.modal = false;
            return _this;
        }
        ProactiveHintHandler.prototype.handle = function (hi, triggedby) {
            if (!isBuildMode) {
                postMessage({
                    type: 'showHint',
                    itemID: this.cl.helpitemid,
                    width: hi.width,
                    height: hi.height,
                    title: hi.title,
                }, var_dashboard_url);
            }
        };
        return ProactiveHintHandler;
    }(AbstractHelpItemHandler));
    var SystrayHandler = /** @class */ (function (_super) {
        __extends(SystrayHandler, _super);
        function SystrayHandler() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.itemType = viewController.ITEM_TYPE.SYSTRAY;
            _this.multiSupport = false;
            _this.modal = false;
            return _this;
        }
        SystrayHandler.prototype.handle = function (hi) {
            if (!isBuildMode) {
                postMessage({
                    type: 'showSystray',
                    itemID: this.cl.helpitemid,
                    width: hi.width,
                    height: hi.height,
                    title: hi.title,
                }, var_dashboard_url);
            }
        };
        return SystrayHandler;
    }(AbstractHelpItemHandler));
    var HintHandler = /** @class */ (function (_super) {
        __extends(HintHandler, _super);
        function HintHandler() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.itemType = viewController.ITEM_TYPE.HINT;
            _this.multiSupport = false;
            _this.modal = false;
            return _this;
        }
        HintHandler.prototype.handle = function (hi, triggedby) {
            if (!isBuildMode) {
                postMessage({
                    type: 'showHint',
                    itemID: this.cl.helpitemid,
                    width: hi.width,
                    height: hi.height,
                    title: hi.title,
                }, var_dashboard_url);
            }
        };
        return HintHandler;
    }(AbstractHelpItemHandler));
    var WalkthroughHandler = /** @class */ (function (_super) {
        __extends(WalkthroughHandler, _super);
        function WalkthroughHandler() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.itemType = viewController.ITEM_TYPE.WALKTHROUGH;
            _this.multiSupport = false;
            _this.modal = false;
            return _this;
        }
        WalkthroughHandler.prototype.handle = function (hi, triggedby) {
            if (!isBuildMode) {
                postMessage({
                    type: 'showWalkthrough',
                    itemID: this.cl.helpitemid,
                    width: hi.width,
                    height: hi.height,
                    title: hi.title,
                }, var_dashboard_url);
            }
        };
        return WalkthroughHandler;
    }(AbstractHelpItemHandler));
    var PopupHandler = /** @class */ (function (_super) {
        __extends(PopupHandler, _super);
        function PopupHandler() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.itemType = viewController.ITEM_TYPE.POPUP;
            _this.multiSupport = false;
            _this.modal = true;
            return _this;
        }
        PopupHandler.prototype.handle = function (hi, triggedby, isUefSupportCenterPopupHandle) {
            if (!isBuildMode) {
                var helpItemRequest = {
                    type: 'showPopup',
                    itemID: this.cl.helpitemid,
                    width: hi.width,
                    height: hi.height,
                    title: hi.title,
                };
                if (isUefSupportCenterPopupHandle) {
                    sessionStorage.setItem('isUefSupportCenterPopupHandle', JSON.stringify(helpItemRequest));
                }
                else {
                    postMessage(helpItemRequest, var_dashboard_url);
                }
            }
        };
        return PopupHandler;
    }(AbstractHelpItemHandler));
    var OnDemandItemHandler = /** @class */ (function (_super) {
        __extends(OnDemandItemHandler, _super);
        function OnDemandItemHandler() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.itemType = viewController.ITEM_TYPE.ON_DEMAND;
            _this.modal = false;
            _this.multiSupport = false;
            _this.isVisible = false;
            return _this;
        }
        OnDemandItemHandler.prototype.handle = function (hi, triggedby) { };
        OnDemandItemHandler.prototype.hide = function () { };
        OnDemandItemHandler.prototype.show = function () { };
        return OnDemandItemHandler;
    }(AbstractHelpItemHandler));
    function createHelpItemHandler(cl, mode, triggedby, src) {
        var triggerByElement = triggedby instanceof Element ? triggedby : triggedby.get(0);
        if (cl.mode === 'Normal') {
            return new OnDemandItemHandler(cl, triggerByElement, src);
        }
        else if (cl.mode === 'Walkthrough') {
            return new WalkthroughHandler(cl, triggerByElement, src);
        }
        else if (cl.mode === 'hint' && mode === 0) {
            return new HintHandler(cl, triggerByElement, src);
        }
        else if (cl.mode === 'hint' && mode === 1) {
            return new ProactiveHintHandler(cl, triggerByElement, src);
        }
        else if (cl.mode === 'systray') {
            return new SystrayHandler(cl, triggerByElement, src);
        }
        else if (cl.mode === 'Proactive' || cl.mode === 'Proactive Once') {
            return new PopupHandler(cl, triggerByElement, src);
        }
    }
    function fixEesyLinks(intip) {
        var tip = intip;
        var numchars = '0123456789';
        var idx = tip.indexOf('loadfile:');
        while (idx > -1) {
            var hiid = '';
            if (numchars.indexOf('' + tip.charAt(idx + 9)) > -1)
                hiid += tip.charAt(idx + 9);
            if (numchars.indexOf('' + tip.charAt(idx + 10)) > -1)
                hiid += tip.charAt(idx + 10);
            if (numchars.indexOf('' + tip.charAt(idx + 11)) > -1)
                hiid += tip.charAt(idx + 11);
            if (numchars.indexOf('' + tip.charAt(idx + 12)) > -1)
                hiid += tip.charAt(idx + 12);
            var opencall = "".concat(var_loadfile, "?fileid=").concat(hiid);
            tip = tip.replace('loadfile:' + hiid, opencall);
            idx = tip.indexOf('loadfile:');
        }
        return tip;
    }
    return {
        createHelpItemHandler: createHelpItemHandler,
        PopupHandler: PopupHandler,
    };
});
//# sourceMappingURL=uef-messages-handlers.js.map