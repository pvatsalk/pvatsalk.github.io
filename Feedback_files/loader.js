/////////////////////////////////////////////////////////////////////////////
// loader.js

var eesyRequestCount = 0;
var var_hasReportAccess = undefined;
var var_isExpert = undefined;
var eesyTemplates = {};

if (var_uefMode) {
    sessionStorage.setItem("var_dashboard_url", var_dashboard_url);
    sessionStorage.setItem("var_eesy_build", var_eesy_build);
    sessionStorage.setItem("var_eesy_dbUpdateCount", var_eesy_dbUpdateCount);
}

if (!sessionStorage.getItem('eesysoft_session')) {
    sessionStorage.setItem('eesysoft_session', Date.now().valueOf());
}

if (!window.console) console = { log: function(){} };

function eesy_load_js(jsUrl) {
    var fileref = document.createElement("script");
    fileref.setAttribute("type", "text/javascript");
    fileref.setAttribute("src", jsUrl);
    document.getElementsByTagName("head")[0].appendChild(fileref);
}

//
// added checks to prevent the engine to load under ie < 11
//
function getIEVersion() {
    var ua = window.navigator.userAgent;
    var index = ua.indexOf("MSIE");

    if (index > 0) {
        return parseInt(ua.substring(index + 5, ua.indexOf(".", index)));
    } else if (!!navigator.userAgent.match(/Trident\/7\./)) {
        return 11;
    } else {
        return 0; //It is not IE
    }
}

function allowedBrowserBasedOnAgentPattern() {
    if (!window.doNotLoadEngineForUserAgentPattern || doNotLoadEngineForUserAgentPattern == "")
        return true;

        return !navigator.userAgent.match(doNotLoadEngineForUserAgentPattern);
    }


    function allowedBrowser() {
        if (!allowedBrowserBasedOnAgentPattern())
        return false;

    var ieVersion = getIEVersion();
    return ieVersion == 0 || ieVersion >= 10;
}


if (allowedBrowser()) {
    eesy_load_js(var_dashboard_url + "/resources/static/require-with-callback.js");
}

// This function is called directly from content
function handleHelpItem(itemId) {
    createCustomEvent("helpitemHandle", {detail: {helpitemid: itemId}});
}

function handleHelpItemByGuid(guid) {
    // this is triggered when a popup link has been clicked inside the uef support center
    if (var_uefMode) {
        createCustomEvent("helpitemHandle", {
            detail: {
                helpitemGuid: guid,
                isUefSupportCenterPopupHandle: true
            }
        });
    } else {
        createCustomEvent("helpitemHandle", {detail: {helpitemGuid: guid}});
    }
}

function handleHelpItemArticle(guid) {
    createCustomEvent("helpitemArticleHandle", {detail: {helpitemGuid: guid}});
}


function createCustomEvent(eventName, data) {
    var event;
    if (window.CustomEvent) {
        event = new CustomEvent(eventName, data);
    } else {
        event = document.createEvent('CustomEvent');
        event.initCustomEvent(eventName, true, true, data);
    }
    document.dispatchEvent(event);
}


/**
 * Example:
 *
 * eesyRequire(['dep1', 'dep2'], function(dep1, dep2) {
 *   // init module
 * })
 */
function eesy_init_require() {
    window.eesyRequire = function(dependencies, initializer) {
        __eesyRequire(var_key, var_eesy_build, var_eesy_dbUpdateCount)(['require'], function(require) {
            require(dependencies, initializer);
        });
    };

    function isDebugLocalAssets() {
        return sessionStorage.DEBUG_LOCAL_ASSETS === 'true';
    }

    function getDashboardUrl () {
        if (isDebugLocalAssets()) {
            return 'http://127.0.0.1:9666';
        }

        return var_dashboard_url;
    };

    eesyRequire( ['jquery-private', 'sessionInfo', 'engine_core'], function($, sessionInfo, engineCore) {

        //$.support.cors = true;

        $(document).ajaxError(function(e, xhr, settings, exception) {
            console.error({ url: settings.url, exception });
        });

        var getCssUrl = function (basePath, filePath) {
            var args = [`__md5=${var_eesy_style_checksum}`, `__bn=${var_eesy_build}`, `__h=${location.host}`].join('&');

            return [basePath, filePath, '?', args].join('');
        };

        //
        //  Load the CSS
        //
        eesy_load_css(getCssUrl(getDashboardUrl(), '/static/css/proactiveresources-base.min.css'));
        eesy_load_css(getCssUrl(var_style_path, '/proactiveresources/style.css'));
        eesy_load_css(getCssUrl(var_style_path, '/style_v2/eesysoft-template/assets/css/support-center.min.css'));
        eesy_load_css(getCssUrl(var_style_path, '/override-proactive.css'));
        eesy_load_css(getCssUrl(getDashboardUrl(), '/static/css/support-center-theme-defaults.min.css'));
        if (window.CANVAS_ACTIVE_BRAND_VARIABLES) {
            //load styles that uses canvas brand variables only when those variables are available
            eesy_load_css(getCssUrl(getDashboardUrl(), '/static/css/support-center-theme-canvas.min.css'));
        }

        //
        //  Load the templates
        //
        $.ajaxSetup({
            cache: true
        });

        eesy_initUserValues(function() {
            const args = [
                `languageId=${var_language}`,
                `styleChecksum=${var_eesy_style_checksum}`,
                'static=true',
                `__=${ location.host}`,
                isDebugLocalAssets() && `__stamp=${Date.now()}`,
            ].filter(Boolean).join('&');
            const eesy_url_load_templates = `${var_dashboard_url}/rest/public/proactive/templates?${args}`


            $.get(eesy_url_load_templates, function (json) {
                eesyTemplates = json;
                sessionInfo.init(var_dashboard_url, var_style_path, var_key, var_hasReportAccess, var_instance_name);
                engineCore.start();
                createCustomEvent("engineLoaded", {});
            });
        });
    });

    function getUrlArgs(id, url) {
        var glue = url.indexOf('?') < 0 ? '?' : '&';
        var args = [
            `__bn=${var_eesy_build}`,
            `__lng=${var_language}`,
            isDebugLocalAssets() && `__stamp=${Date.now()}`,
        ].filter(Boolean).join('&');

        return `${glue}${args}`;
    }

    function __eesyRequire(sessionKey, build, dbUpdateCount) {
        const staticJsLocation = getDashboardUrl() + '/static/js';
        const resourcesLocation = isDebugLocalAssets() ? "http://127.0.0.1:9666/dashboardstyles/base" : "resources";

        return eesy.requirejs.config({
            context: "eesy",
            urlArgs: getUrlArgs,
            baseUrl: var_dashboard_url,
            waitSeconds: 200,
            paths: {
                // internal modules
                'field-decorator': resourcesLocation + '/style_v2/js_require_modules/field-decorator',
                'sessionInfo': resourcesLocation + '/style_v2/js_require_modules/sessionInfo',
                'supportCenter': resourcesLocation + '/style_v2/js_require_modules/supportCenter',
                'system-information': resourcesLocation + '/style_v2/js_require_modules/system-information',
                'utils': resourcesLocation + '/style_v2/js_require_modules/utils',
                'contact-options': resourcesLocation + '/style_v2/js_require_modules/contact-options',
                'contact-options-handler': resourcesLocation + '/style_v2/js_require_modules/contact-options-handler',
                'session-events': resourcesLocation + '/style_v2/js_require_modules/session-events',
                'templates': resourcesLocation + '/style_v2/js_require_modules/templates',
                'osage-app': resourcesLocation + '/style_v2/eesysoft-template/assets/js/app',
                'osage-selector': resourcesLocation + '/style_v2/eesysoft-template/assets/js/selector',
                'osage-contact': resourcesLocation + '/style_v2/eesysoft-template/assets/js/contact',
                'context-probe': staticJsLocation + '/context-probe',
                'context-handling': staticJsLocation + '/context-handling',
                'monitor-handling': staticJsLocation + '/monitor-handling',
                'monitor-lti-launch-handling': staticJsLocation + '/monitor-lti-launch-handling',
                'engine-state': staticJsLocation + '/engine-state',
                'found-items-handler': staticJsLocation + '/found-items-handler',
                'events-urlchange': staticJsLocation + '/events-urlchange',
                'events-domchange': staticJsLocation + '/events-domchange',
                'events-iframe': staticJsLocation + '/events-iframe',
                'context-tree-matcher': staticJsLocation + '/context-tree-matcher',
                'context-links': staticJsLocation + '/context-links',
                'keep-alive': staticJsLocation + '/keep-alive',
                'helpitem-handling': staticJsLocation + '/helpitem-handling',
                'presentation': staticJsLocation + '/presentation',
                'helpitem-loader': staticJsLocation + '/helpitem-loader',
                'mouse': staticJsLocation + '/mouse',
                'engine_core': staticJsLocation + '/engine_core',
                'constants': staticJsLocation + '/constants',
                'expert-tools': staticJsLocation + '/expert-tools',
                'recognition_templates': staticJsLocation + '/recognition_templates',
                'build_mode': staticJsLocation + '/build_mode',
                'condition-matcher': staticJsLocation + '/condition-matcher',
                'expert-context-action-bar': staticJsLocation + '/expert-context-action-bar',
                'expert-element-highlighter': staticJsLocation + '/expert-element-highlighter',
                'support-tab': staticJsLocation + '/presentation/support-tab',
                'support-tab-custom': staticJsLocation + '/presentation/support-tab-custom',
                'proactive-hints': staticJsLocation + '/presentation/proactive-hints',
                'presentation-helper': staticJsLocation + '/presentation/presentation-helper',
                'helpitem-visibility': staticJsLocation + '/presentation/helpitem-visibility',
                'helpitem-accessibility': staticJsLocation + '/presentation/helpitem-accessibility',
                'eesy-timers': staticJsLocation + '/presentation/eesy-timers',
                'systrays': staticJsLocation + '/presentation/systrays',
                'hints': staticJsLocation + '/presentation/hints',
                'popups': staticJsLocation + '/presentation/popups',
                'walkthroughs': staticJsLocation + '/presentation/walkthroughs',
                'quick-survey': staticJsLocation + '/presentation/quick-survey',
                'view-controller': staticJsLocation + '/presentation/view-controller',
                'helpitem-handlers': staticJsLocation + '/presentation/helpitem-handlers',
                'uef-messages-handlers': staticJsLocation + '/presentation/uef-messages-handlers',
                'debug': staticJsLocation + '/debug',
                'focus-trap': staticJsLocation + '/focus-trap',
                'iframe_communicator_server': staticJsLocation + '/iframe_communicator_server',
                'html2canvas': 'dashboardstyles/base/style_v2/js_require_modules/html2canvas.jsp?noext',
                'settings-inline-editor': 'rest/settings/inlineEditor?sessionkey=' + sessionKey + '&u=' + dbUpdateCount + '&styleChecksum=' + var_eesy_style_checksum,

                // resources
                // 3 next: can change when the server version change or a new style is applied....goes for all resources loaded via /rest/public languages
                'language-supportcenter': 'rest/public/language/supportcenter?languageId=' + var_language + '&u=' + dbUpdateCount + '&styleChecksum=' + var_eesy_style_checksum + '&static=true',
                'language-cms': 'rest/public/language/cms?languageId=' + (window.var_expert_language === undefined ? -1 : var_expert_language) + '&u=' + dbUpdateCount + '&styleChecksum=' + var_eesy_style_checksum + '&static=true',
                'language': 'rest/public/language?languageId=' + var_language + '&u=' + dbUpdateCount + '&styleChecksum=' + var_eesy_style_checksum + '&static=true',
                'settings-supportcenter': 'rest/settings/supportcenter?sessionkey=' + sessionKey + '&u=' + dbUpdateCount + '&styleChecksum=' + var_eesy_style_checksum,
                'settings-uef': 'rest/settings/uef?sessionkey=' + sessionKey + '&u=' + dbUpdateCount + '&styleChecksum=' + var_eesy_style_checksum,
                // 3 next: can change when the server version change or the db updates count change
                'context-rule-tree': 'rest/public/context-rule-tree?v=' + build + "&u=" + dbUpdateCount + '&static=true',
                'context-link-data': 'rest/public/context-links?v=' + build + "&u=" + dbUpdateCount + '&static=true',
                'context-node-link-data': 'rest/public/contextNodeLinks?v=' + build + "&u=" + dbUpdateCount + '&static=true',
                'user-context-variables': 'rest/userContext/userContextVariables?v=' + build + "&u=" + dbUpdateCount + '&sessionkey=' + sessionKey + '&courseId=' + (!(typeof window.eesy_course_id === 'undefined') ? window.eesy_course_id : -1)  + '&s=' + window.sessionStorage.eesysoft_session,
                // 2 next: can change when the server version change or the db updates count change
                'monitor-data': 'rest/public/monitors?v=' + build + "&u=" + dbUpdateCount + '&static=true',
                'hipa': 'rest/public/hipa?v=' + build + "&u=" + dbUpdateCount + '&static=true',
                'helpitem-reset-stamps': 'rest/public/helpitem-reset-stamps?v=' + build + "&u=" + dbUpdateCount + '&static=true',

                'page-templates': 'rest/public/templates/page_template?v=' + build + "&u=" + dbUpdateCount + '&sessionkey=' + sessionKey + '&s=' + window.sessionStorage.eesysoft_session,
                'element-templates': 'rest/public/templates/element_template?v=' + build + "&u=" + dbUpdateCount + '&sessionkey=' + sessionKey + '&s=' + window.sessionStorage.eesysoft_session,

                // external dependencies
                'jquery-private': 'resources/static/jquery-private.js?v=' + build,
                'mustachejs': 'resources/static/mustachejs-private.js?v=' + build,
                'bootstrap': 'bootstrap-js-as-define.jsp?noext',
                'datepicker': 'dashboardstyles/base/style_v2/js_require_modules/bootstrap-datepicker.jsp?noext',
                'bootstrap-switch': 'webjars/bootstrap-switch/3.3.2/js/bootstrap-switch.min',

                // require plugins
                'text': 'static/js/compiled/text',
                'json': 'static/js/compiled/json'
            },

            shim: {
                'jquery-private': {
                    exports: '$'
                },
                bootstrap: {
                    deps: ['jquery-private']
                },
                'bootstrap-switch': { deps: ['jquery-private'] },
                datepicker: {
                    deps: ['bootstrap', 'jquery-private']
                }
            },

            map: {
                '*': { 'jquery': 'jquery-private' }
            }
        });
    }
}



function eesy_load_css(url) {
    if (document.createStyleSheet) {
        document.createStyleSheet(url);
    } else {
        var fileref = document.createElement("link");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", url);
        fileref.setAttribute("rel", "stylesheet");
        document.getElementsByTagName("head")[0].appendChild(fileref);
    }
}

function eesy_set_role_inactive(rolename) {
    for (var prop in var_eesy_sac) {
        if(var_eesy_sac[prop].rolename == rolename) {
            var_eesy_sac[prop].enabled = false;
        }
    }
}

function eesy_issueUserRequests() {
    var $ = $j_eesy;

    return [
        $.getJSON(var_dashboard_url + '/rest/userContext/hiddenHelpItems?sessionkey='
            + var_key + '&userUpdated='
            + var_eesy_userUpdated
            + '&s=' + window.sessionStorage.eesysoft_session
            + "&__=" + location.host, function (hiddenHelpItems) {

            var_eesy_hiddenHelpItems = hiddenHelpItems;
        }),

        $.getJSON(var_dashboard_url + '/rest/userContext/sessionAccessCache?sessionkey='
            + var_key
            + '&userUpdated=' + var_eesy_userUpdated
            + '&s=' + window.sessionStorage.eesysoft_session
            + "&__=" + location.host, function(sac) {

            var_eesy_sac = sac;
            //
            // check if any of the roles in the sac should be deactivated
            //
            if(!(typeof var_eesy_inactive_roles === 'undefined')) {
                for (var i=0; i < var_eesy_inactive_roles.length; i++) {
                    eesy_set_role_inactive(var_eesy_inactive_roles[i]);
                }
            }
        }),

        $.getJSON(var_dashboard_url + '/rest/userContext/helpItemsSeen?sessionkey='
            + var_key + '&userUpdated='
            + var_eesy_userUpdated
            + '&s=' + window.sessionStorage.eesysoft_session
            + "&__=" + location.host, function(helpitemsSeen) {

            var_eesy_helpitemsSeen = helpitemsSeen;
        })
    ];
}

function eesy_initUserValues(onUserValuesInited) {
    var_show_tab = ((!!var_key) || window.var_delay_login_until_support_requested) && (var_show_tab_initial || var_user_map.isShowTab);
    var_eesy_userUpdated = var_user_map.userUpdatedStamp;
    var_language = var_user_map.languageId || -1;
    supportTabMinimized = var_user_map.isSupportTabMinimized;
    supportTabPosition = var_user_map.supportTabPosition;
    var_hasReportAccess = var_user_map.hasReportAccess;
    var_isExpert = var_user_map.isExpert;
    sessionStorage.setItem("eesy_isExpert", var_user_map.isExpert);
    sessionStorage.setItem("eesy_userLanguageID", var_language);
    var $ = $j_eesy;
    if (!!var_key) {
        $.when.apply($, eesy_issueUserRequests()).then(onUserValuesInited);
    } else {
        if (window.var_delay_login_until_support_requested) {
            onUserValuesInited();
        }
    }

}
