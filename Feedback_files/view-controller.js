"use strict";
eesy.define('view-controller', [], function () {
    var viewState = {};
    function helpitemHandlerToId(helpitem) {
        return [helpitem.cl.helpitemid, helpitem.constructor.name].join('_');
    }
    function allItems() {
        return Object.keys(viewState).map(function (key) { return viewState[key]; });
    }
    function addHelpitem(helpitem) {
        viewState[helpitemHandlerToId(helpitem)] = helpitem;
    }
    function removeHelpitem(helpitemId) {
        allItems().forEach(function (handler) {
            if (handler.cl.helpitemid === helpitemId) {
                removeHelpitemByHandler(handler);
            }
        });
    }
    function removeHelpitemByHandler(helpitem) {
        delete viewState[helpitemHandlerToId(helpitem)];
    }
    function isShowing(item) {
        return !!viewState[helpitemHandlerToId(item)];
    }
    function isTypeShowing(itemType) {
        return numShowingByType(itemType) > 0;
    }
    function numShowingByType(itemType) {
        return getByType(itemType).length;
    }
    function getByType(itemType) {
        return Object.keys(viewState)
            .filter(function (key) { return viewState[key].itemType === itemType; })
            .map(function (key) { return viewState[key]; });
    }
    function getModalShowing() {
        for (var helpitemId in viewState) {
            if (viewState[helpitemId].modal) {
                return viewState[helpitemId];
            }
        }
        return undefined;
    }
    function isModalShowing() {
        return !!getModalShowing();
    }
    function removeByType(itemType) {
        getByType(itemType).forEach(function (item) {
            delete viewState[helpitemHandlerToId(item)];
        });
    }
    return {
        allItems: allItems,
        isShowing: isShowing,
        isModalShowing: isModalShowing,
        getModalShowing: getModalShowing,
        isTypeShowing: isTypeShowing,
        addHelpitem: addHelpitem,
        removeHelpitem: removeHelpitem,
        removeByType: removeByType,
        getByType: getByType,
        removeHelpitemByHandler: removeHelpitemByHandler,
        ITEM_TYPE: {
            HINT: 'hint',
            SYSTRAY: 'systray',
            POPUP: 'popup',
            WALKTHROUGH: 'Walkthrough',
            HINT_PROACTIVE: 'proactiveHint',
            ON_DEMAND: 'onDemand',
        },
    };
});
//# sourceMappingURL=view-controller.js.map