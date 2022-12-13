"use strict";
eesy.define('popups', [
    'jquery-private',
    'json!settings-supportcenter',
    'mustachejs',
    'presentation-helper',
    'focus-trap',
    'helpitem-accessibility',
    'utils',
], function ($, settings, Mustache, presentationHelper, focusTrap, helpItemAccessibility, utils) {
    var popupSelector = '#eesy-standardcontainer';
    var popupOverlaySelector = '#eesy-dark-screen';
    function preview(helpItem) {
        var _a;
        $('.eesy_dark').remove();
        window.scrollTo(0, 0);
        $('#expertActionBar').append(Mustache.to_html(eesyTemplates.standard, presentationHelper.helpItemModel(helpItem), eesyTemplates));
        $(popupOverlaySelector).addClass('preview');
        $(popupOverlaySelector).height((_a = $(document).height()) !== null && _a !== void 0 ? _a : 0);
        $(popupOverlaySelector).show();
        $prepareContainer(helpItem).show();
    }
    function hide() {
        $(popupSelector).remove();
    }
    function show(helpItem) {
        $('.eesy_dark').remove();
        $('body').append(Mustache.to_html(eesyTemplates.standard, presentationHelper.helpItemModel(helpItem), eesyTemplates));
        $(popupOverlaySelector).fadeIn('fast');
        var $container = $prepareContainer(helpItem);
        $container.fadeIn('fast', function () {
            focusTrap.createFocusTrap($container[0]);
        });
        // if we have both popup and systray on the same page we want to move focus to systray after closing popup
        utils.onElementRemove($container[0], function () { return helpItemAccessibility.goToSystray(); });
    }
    function $prepareContainer(helpItem) {
        var $container = $("".concat(popupSelector, "[data-helpitemid=\"").concat(helpItem.id, "\"]"));
        if (helpItem.width !== '0' || helpItem.height !== '0') {
            $container.css({
                width: helpItem.width + 'px',
                height: helpItem.height + 'px',
            });
        }
        return $container;
    }
    return {
        preview: preview,
        show: show,
        hide: hide,
    };
});
//# sourceMappingURL=popups.js.map