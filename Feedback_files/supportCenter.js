eesy.define(
    [
        'jquery-private',
        'mustachejs',
        'osage-selector',
        'contact-options',
        'templates',
        'contact-options-handler',
        'utils',
        'sessionInfo',
        'json!language-supportcenter',
        'session-events',
        'helpitem-visibility',
        'json!context-node-link-data',
        'json!settings-supportcenter',
        'json!settings-uef',
    ],
    function (
        $,
        Mustache,
        osageSelector,
        contactOptionsModule,
        templates,
        contactOptionsHandler,
        utils,
        sessionInfo,
        language,
        sessionEvents,
        helpitemVisibility,
        contextNodeLinks,
        settings,
        settingsUef
    ) {
        let supportCenterIsOpen = false;
        let supportCenterId = undefined;
        let searchTimerId = undefined;
        let maxInitialHelpitems = undefined;
        let contextHelpItems = undefined;
        let contextNodePath = [];
        let activeNodeId = undefined;
        let activeNodePath = undefined;
        let activeNode = undefined;
        let navigationStack = [];
        let runningStandalone = false;
        let activeHid = undefined;
        let autoActivateHelpitemId = undefined;
        let ruleIds = undefined;
        let preferredLayout = undefined;
        let hasUnsavedFormChanges = false;

        let currentResult = undefined;
        let userContextVariables = undefined;

        const SLIDING_DURATION_MS = 2;
        const SEARCH_DELAY_MS = 300;
        const CONTACT_FORM_SELECTOR = '[data-form-contact]';
        const templateNames = [
            'support_center',
            'option_text_before',
            'option_buttons',
            'option_dropdown',
            'helpitem_in_list',
            'node_shell',
            'content_header',
            'content_main',
            'footer',
            'contact_email',
            'contact_phone',
            'contact_fields',
            'mail',
            'search_header',
            'mail_sent',
            'mail_section_courses',
            'mail_section_properties_table',
            'mail_section_single_property',
            'mail_section_message',
            'mail_section_attachments',
            'chat_section_url',
            'contact_options',
        ];

        const CHANNELS = {
            EMAIL: { id: 'email', cssClass: '___email', caption: language.LNG.SUPPORT_CENTER.CONTACT.EMAIL },
            PHONE: { id: 'phone', cssClass: '___call', caption: language.LNG.SUPPORT_CENTER.CONTACT.CALL },
            CHAT: { id: 'chat', cssClass: '___chat', caption: language.LNG.SUPPORT_CENTER.CONTACT.CHAT },
        };

        function selectNode(nodeId, onNodeSelected) {
            onNavigationStackChanged();

            activeNodeId = nodeId;

            $.get(
                sessionInfo.dashboardUrl() +
                    '/rest/nodes/' +
                    activeNodeId +
                    '/path?sessionkey=' +
                    sessionInfo.sessionKey(),
                function (nodePath) {
                    activeNodePath = nodePath;
                    activeNode = activeNodePath[activeNodePath.length - 1];
                    processPropertiesAsTemplates(activeNode, userContextVariables);
                    onNodeSelected();
                }
            );
        }

        function processPropertiesAsTemplates(node) {
            for (var p in node.properties) {
                node.properties[p] = Mustache.to_html(node.properties[p], userContextVariables);
            }
        }

        function onNavigationStackChanged() {
            if (navigationStack.length > 0 && !runningStandalone) {
                $('.header__back').removeClass('eesyHidden');
            } else {
                $('.header__back').addClass('eesyHidden');
            }
        }

        function getChildOptions(nodeId, fnChildOptions) {
            $.get(
                sessionInfo.dashboardUrl() +
                    '/rest/nodes/' +
                    nodeId +
                    '/children?type=option,link&sessionkey=' +
                    sessionInfo.sessionKey(),
                fnChildOptions
            );
        }

        function autoSelectNode(node) {
            if (contextNodePath.length == 0) return node.properties.auto_select == 'true';

            var result = false;
            var itemToDelete = undefined;

            $.each(contextNodePath, function (idx, contextNode) {
                if (node.id == contextNode.id) {
                    itemToDelete = contextNode;
                    result = true;
                }
            });

            if (itemToDelete) contextNodePath.splice($.inArray(itemToDelete, contextNodePath), 1);

            return result;
        }

        function loadActiveNode(onLoaded) {
            $('header section').append(templates.node_shell.html(activeNode));
            let childOptionPresentation =
                activeNode.properties.child_option_presentation == undefined
                    ? 'buttons'
                    : activeNode.properties.child_option_presentation;

            // get a selector for the node shell element
            var $node = $('header section .eesy-node[data-node-id="' + activeNodeId + '"]');

            if (activeNode.properties.collapse == 'true') {
                $node.addClass('___is-collapsable');
            }

            $node.append(templates.option_text_before.html(activeNode));

            if (var_uefMode) {
                $('#supportCenterMainHeading').hide();
            }

            getChildOptions(activeNodeId, function (children) {
                children.sort((a, b) => a.order - b.order);
                const requests = [];

                const childIdxToRemove = {};

                if (children.length) {
                    for (let i in children) {
                        if (children[i].type === 'link') {
                            (function (index) {
                                requests.push(
                                    $.get(
                                        `${sessionInfo.dashboardUrl()}/rest/nodes/${
                                            children[index].properties.destination
                                        }?sessionkey=${sessionInfo.sessionKey()}`,
                                        function (node) {
                                            if (node.error) {
                                                childIdxToRemove[index] = true;
                                            } else {
                                                children[index] = node;
                                            }
                                        }
                                    )
                                );
                            })(i);
                        }
                    }
                }

                $.when.apply($, requests).done(function () {
                    if (children.length) {
                        // remove unobtainable linked nodes
                        let i = children.length;
                        while (i--) {
                            if (childIdxToRemove[i]) {
                                children.splice(i, 1);
                            }
                        }

                        $node.append(
                            templates['option_' + childOptionPresentation].html({
                                id: activeNodeId,
                                children: children,
                            })
                        );

                        if (childOptionPresentation == 'dropdown') {
                            osageSelector.decorate('#dropdown-' + activeNodeId + '[data-selector]');
                        }

                        $node.slideDown(SLIDING_DURATION_MS);
                    }

                    let loadContent = true;
                    $.each(children, function (index, child) {
                        if (autoSelectNode(child)) {
                            if (childOptionPresentation === 'dropdown') {
                                const $optionElement = $(`[data-value="${child.id}"]`);

                                if ($optionElement.length === 0) {
                                    $j_eesy('.eesy__modal-scope select.optionDropdown[data-selector]')
                                        .val(child.id)
                                        .change();
                                } else {
                                    osageSelector.selectOption($optionElement, false);
                                }
                            } else {
                                const $optionElement = $(`[data-option-id="${child.id}"]`);
                                $optionElement.addClass('___is-selected');
                                const collapse = $optionElement.parent().parent().hasClass('___is-collapsable');
                                if (collapse) {
                                    $optionElement.siblings().hide();
                                    if (!settings.SUPPORTCENTER.WCAG.ENABLED) {
                                        $optionElement.append(
                                            "<div class='xbutton__close' id='xbutton' role='button' aria-label='exit' label='Exit'></div>"
                                        );
                                    }
                                    $optionElement.attr('aria-selected', 'true');
                                }
                                selectNode(child.id, function () {
                                    loadActiveNode(onLoaded);
                                });
                            }
                            loadContent = false;
                            return false;
                        }
                    });

                    if (loadContent) {
                        showActiveNodeContent(onLoaded);
                    }
                });
            });
        }

        function showActiveNodeContent(onDone) {
            contactOptionsModule.initForNodeId(supportCenterId, function () {
                loadHelpItemSuggestions(activeNodeId, onDone);
            });
        }

        function showSearchResults(searchString) {
            if (searchString.length) {
                loadAndPresentHelpItems(
                    sessionInfo.dashboardUrl() +
                        '/rest/helpitems/search?sessionkey=' +
                        sessionInfo.sessionKey() +
                        '&languageId=' +
                        var_language,
                    { s: searchString },
                    language.LNG.SUPPORT_CENTER.SEARCH.RESULTS_HEADER,
                    language.LNG.SUPPORT_CENTER.SEARCH.NO_RESULTS_HEADER,
                    getAvailableOptions(),
                    true,
                    (e) => {
                        e.source = 'Search';
                        e.source_value = searchString;
                    }
                );
                sessionEvents.addSearchEvent(searchString);
            } else {
                $('main.layout__main').html(''); // blank if nothing in search string
            }
        }

        function getAvailableOptions() {
            return $.map(CHANNELS, function (channel, key) {
                return contactOptionsModule.hasChannel(channel.id)
                    ? {
                          typeClass: channel.cssClass,
                          isDisabled: !contactOptionsModule.isChannelActive(channel.id),
                          caption: channel.caption,
                          tooltip: contactOptionsModule.getOpeningHoursChannelText(channel.id),
                      }
                    : undefined;
            });
        }

        function getMockedContactOptions() {
            return $.map(CHANNELS, function (channel) {
                return {
                    typeClass: channel.cssClass,
                    isDisabled: true,
                    caption: channel.caption,
                    tooltip: '',
                };
            });
        }

        function decorateHelpItems(items) {
            var helpitemClassByItemType = {
                HtmlCode: '___article',
                blackboard: '___article',
                blackboard2: '___article',
                blackboardSection: '___article',
                Recording: '___video',
                File: '___document',
                Link: '___article',
                Message: '___info',
                Systray: '___info',
                Hint: '___info',
            };

            $.each(items, function (idx, item) {
                if (!item.typeClass) {
                    item.typeClass = helpitemClassByItemType[item.itemtype];
                }
            });
        }

        function loadHelpItemSuggestions(nodeId, onDone) {
            $.get(
                sessionInfo.dashboardUrl() + '/rest/nodes/' + nodeId + '?sessionkey=' + sessionInfo.sessionKey(),
                function (node) {
                    $.get(
                        sessionInfo.dashboardUrl() +
                            '/rest/nodes/' +
                            nodeId +
                            '/children?type=helpsuggestion&sessionkey=' +
                            sessionInfo.sessionKey(),
                        function (suggestions) {
                            var helpitemsUrl =
                                sessionInfo.dashboardUrl() +
                                '/rest/public/helpitems?sessionkey=' +
                                sessionInfo.sessionKey() +
                                '&languageId=' +
                                var_language +
                                '&';

                            // Add ids for context help items
                            if (node.properties.context_sensitive_help == 'true') {
                                $.each(contextHelpItems, function (i, helpitemId) {
                                    helpitemsUrl += 'id=' + helpitemId + '&';
                                });
                            }

                            // Add configured items for node
                            $.each(suggestions, function (i, suggestion) {
                                helpitemsUrl += 'guid=' + suggestion.properties.guid + '&';
                            });

                            loadAndPresentHelpItems(
                                helpitemsUrl,
                                {},
                                node.properties.suggestions_title,
                                language.LNG.SUPPORT_CENTER.SUGGESTIONS.NO_RESULTS_HEADER,
                                getAvailableOptions(),
                                false,
                                (e) => {
                                    e.source =
                                        node.properties.context_sensitive_help == 'true' &&
                                        contextHelpItems.includes(e.id)
                                            ? 'IN_CONTEXT_SUGGESTION'
                                            : 'NODE_SUGGESTION';
                                    e.source_value = nodeId;
                                },
                                onDone
                            );
                        }
                    );
                }
            );
        }

        function loadAndPresentHelpItems(
            url,
            data,
            title,
            noResultTitle,
            contactOptions,
            showFilters,
            addSourceInformation,
            onDone
        ) {
            $.get(url, data, function (helpitems) {
                var helpItemsWithAccess = [];

                $.each(helpitems, function (idx, item) {
                    if (helpitemVisibility.hasAccessToHelpitem(item.id)) {
                        helpItemsWithAccess.push(item);
                    }
                });

                decorateHelpItems(helpitems);

                if (addSourceInformation !== undefined) {
                    helpitems.forEach((hi) => addSourceInformation(hi));
                }

                currentResult = {
                    helpitems: helpItemsWithAccess,
                    title: title,
                    noResultTitle: noResultTitle,
                    contactOptions: contactOptions,
                    selectedFilters: {},
                };

                displayResult(showFilters);

                if (
                    !!sessionStorage.getItem('eesy_uef_support_center_loaded') &&
                    !!sessionStorage.getItem('eesy_UEFDefaultHelp')
                ) {
                    var helpName = sessionStorage.getItem('eesy_UEFDefaultHelp_name');

                    var defaultBBHelp =
                        '' +
                        "<li class='results__result' id='defaultBBHelp' tabindex='0'>" +
                        "  <div class='results__cat ___default_ultra_article'></div>" +
                        "  <div class='results__subtitle isFocusable focusStyleUnderline' tabindex='0'>" +
                        helpName +
                        '</div>' +
                        '</li>';
                    $('.results .results__list').prepend(defaultBBHelp);

                    sessionStorage.removeItem('eesy_uef_support_center_loaded');
                }

                onDone && onDone();
            });
        }

        function displayResult(showFilters) {
            var $results = $('main.layout__main');

            var $contact = $('section.contact_options');

            var helpitemsVisible = [];
            var helpitemsHidden = [];

            var filters = [];
            var filtersAdded = {};

            // collect filters
            $.each(currentResult.helpitems, function (index, item) {
                $.each(item.labels, function (index, label) {
                    if (!filtersAdded[label.id]) {
                        filtersAdded[label.id] = label;
                        label.selected = currentResult.selectedFilters[label.id] ? true : false;
                        filters.push(label);
                    }
                });
            });

            // are any filters selected at all?
            var isFiltering = false;
            $.each(filters, function (index, filter) {
                if (currentResult.selectedFilters[filter.id]) {
                    isFiltering = true;
                }
            });

            // add helpitems
            $.each(currentResult.helpitems, function (index, item) {
                var include = true;

                if (isFiltering) {
                    include = false;

                    $.each(filters, function (index, filter) {
                        if (currentResult.selectedFilters[filter.id]) {
                            $.each(item.labels, function (index, label) {
                                if (label.id == filter.id) {
                                    include = true;
                                }
                            });
                        }
                    });
                }

                if (include) {
                    if (maxInitialHelpitems == undefined || maxInitialHelpitems > helpitemsVisible.length) {
                        helpitemsVisible.push(item);
                    } else {
                        helpitemsHidden.push(item);
                    }
                }
            });

            $results.html(
                templates.helpitem_in_list.html({
                    filters: showFilters ? filters : [],
                    title: helpitemsVisible.length ? currentResult.title : currentResult.noResultTitle,
                    helpitemsHidden: helpitemsHidden,
                    helpitemsVisible: helpitemsVisible,
                    totalHelpitems: helpitemsHidden.length + helpitemsVisible.length,
                })
            );

            $contact.html(
                templates.contact_options.html({
                    contactOptions: currentResult.contactOptions,
                })
            );
        }

        function fixYoutubeIFrames() {
            $('.embed-HtmlCode iframe[src*=youtube]').removeAttr('height').removeAttr('width').addClass('youtubevideo');
        }

        function showHelpItem(helpitem, contactOptions) {
            $('.eesy__modal__box header').html(templates.content_header.html({}));
            $('.eesy__modal__box main').html(
                templates.content_main.html({
                    helpitem: helpitem,
                    votingEnabled: runningStandalone
                        ? helpitem.voting.enabled == 'true'
                        : settings.SUPPORTCENTER.VOTING.ENABLED,
                })
            );

            if (!runningStandalone) {
                $('.eesy__modal__box section.contact_options').html(
                    templates.contact_options.html({
                        contactOptions: contactOptions,
                    })
                );
            }

            fixYoutubeIFrames();

            if ($('#eesy_embed_content')[0]) {
                function mapToSelector(selectorsStr, prefix) {
                    return selectorsStr
                        .trim()
                        .split(/,| /)
                        .map(function (selector) {
                            return selector.trim();
                        })
                        .filter(Boolean)
                        .map(function (selector) {
                            return prefix + selector;
                        })
                        .join(',');
                }

                function joinSelectors(selectors) {
                    return selectors.filter(Boolean).join(',');
                }

                var item_url = $('div.eesy_url')
                    .text()
                    .replace(/ /g, '')
                    .replace('http://', '')
                    .replace('https://', '');
                var contentselectorclass = mapToSelector($('div.eesy_selector').text(), '.');
                var contentselectorid = mapToSelector($('div.eesy_selector_id').text(), '#');
                var deletecontentclass = mapToSelector($('div.eesy_deleteselector').text(), '.');
                var deletecontentid = mapToSelector($('div.eesy_deleteselector_id').text(), '%23');

                var deleteSelectors = joinSelectors([deletecontentclass, deletecontentid]);
                var selectors = joinSelectors([contentselectorclass, contentselectorid]);

                $('#eesy_embed_content').load(
                    var_dashboard_url +
                        '/rest/content/partialHtmlPage?url=//' +
                        item_url +
                        '&selector=body' +
                        '&deleteSelector=' +
                        deleteSelectors +
                        ' ' +
                        selectors,
                    function (response, status, xhr) {
                        if (status == 'error') {
                            var msg = 'Sorry, but there was an error in loading this content: ';
                            $('#eesy_embed_content').html(msg + xhr.status + ' ' + xhr.statusText);
                        }
                    }
                );
            }
        }

        function loadAndShowHelpitem(helpitemId) {
            navigationStack.push($('.eesy__modal__box').clone(true));

            $.get(
                sessionInfo.dashboardUrl() +
                    '/rest/public/helpitems/' +
                    helpitemId +
                    '/?sessionkey=' +
                    sessionInfo.sessionKey() +
                    '&languageId=' +
                    var_language,
                function (helpitem) {
                    if (helpitem.bbLoadUrl) {
                        $.get(helpitem.bbLoadUrl + '&embedded=true', function (bbHTML) {
                            helpitem.embed = bbHTML;
                            applyVariablesAndShow(helpitem);
                        });
                    } else {
                        applyVariablesAndShow(helpitem);
                    }
                }
            );
        }

        function applyVariablesAndShow(helpitem) {
            helpitem.embed = Mustache.to_html(fixIframesSrc(helpitem.embed), userContextVariables);

            showHelpItem(helpitem, getAvailableOptions());
            sessionEvents.addShowHelpItemEvent(helpitem.id);

            if (var_uefMode) {
                hideLoadingIndicator();
            }
            // reset scroll position
            $('.eesy__modal').scrollTop(0);

            onNavigationStackChanged();
        }

        function fixIframesSrc(input) {
            const matches = input.match(/src="(\S+)"/gi);
            if (!matches) {
                return input;
            }

            matches.forEach((match) => {
                const isAbsolute = match.indexOf('src="http') === 0 || match.indexOf('src="//') === 0;
                if (isAbsolute) {
                    return;
                }
                input = input.replace(match, 'src="about:blank"'); // https://stackoverflow.com/a/5946696
            });

            return input;
        }

        function loadDefaultUltraHelp() {
            var defaultHelp = sessionStorage.getItem('eesy_UEFDefaultHelp');
            var path = defaultHelp.substring('https://help.blackboard.com'.length);

            var helpTitle = sessionStorage.getItem('eesy_UEFDefaultHelp_name');

            $.get('/rest/content/bbdrupal?language=-1&path=' + path, function (bbHTML) {
                var html = Mustache.to_html(bbHTML, userContextVariables);

                var helpItem = {
                    embed: html,
                    title: helpTitle,
                    labels: '',
                    description: '<a href=' + defaultHelp + ' target="_blank">Open article in a new window</a>',
                    itemtype: 'HtmlCode',
                    voting: {
                        enabled: false,
                    },
                };

                loadAndShowUefHelpItem(helpItem);

                hideLoadingIndicator();

                // reset scroll position
                $('.eesy__modal').scrollTop(0);
            });
        }

        function showLoadingIndicator() {
            if (var_uefMode) {
                $('#supportCenterLoading').show();
                $('.eesy__modal-scope').hide();
            }
        }

        function hideLoadingIndicator() {
            $('#supportCenterLoading').hide();
            $('.eesy__modal-scope').show();
        }

        function installGuiHandlers() {
            utils.replaceLiveHandler('focus', '#Subject', function (e) {
                $(this).addClass('formElementFocus');
            });

            utils.replaceLiveHandler('blur', '#Subject', function (e) {
                $(this).removeClass('formElementFocus');
            });

            utils.replaceLiveHandler('focus mouseover', '.eesy__modal-scope .header__search', function () {
                $(this).addClass('focusStyleOutline');
            });

            utils.replaceLiveHandler('blur mouseout', '.eesy__modal-scope .header__search', function () {
                $(this).removeClass('focusStyleOutline');
            });

            //And next textbox
            utils.onClickOrSelectKey('.eesy__modal-scope .eesy_hint_close', closeSupportCenter);

            function helpitemInListClicked(helpItemListItem) {
                var hid = $(helpItemListItem).data('helpitemId');

                showLoadingIndicator();

                if (hid !== undefined) {
                    sessionEvents.addHelpitemOpenedInContexts(
                        $.map(ruleIds, function (ruleId) {
                            return {
                                helpItemId: hid,
                                contextId: ruleId,
                                source: $(helpItemListItem).data('helpitemSource'),
                                source_value: $(helpItemListItem).data('helpitemSourceValue'),
                            };
                        })
                    );

                    loadAndShowHelpitem(hid);
                } else if (var_uefMode) {
                    loadDefaultUltraHelp();
                }
            }

            utils.replaceLiveHandler('keypress', '.eesy__modal-scope .results__subtitle', function (e) {
                if (utils.isSelectKey(e)) {
                    helpitemInListClicked($(this).parent());
                }
            });

            utils.replaceLiveHandler('keypress', '.eesy__modal-scope .results__result', function (e) {
                if (utils.isSelectKey(e)) {
                    helpitemInListClicked($(this));
                }
            });

            !var_uefMode && $(document).on('keyup', closeOnEscape);

            // click on a helpitem in the suggestions list
            utils.replaceLiveHandler('click', '.eesy__modal-scope .results__result', function () {
                helpitemInListClicked($(this));
            });

            // clicking on the back button
            utils.onClickOrSelectKey('.eesy__modal-scope .header__back', function () {
                if (!confirmLeavingContactForm()) {
                    return;
                }
                $('.eesy__modal__box').replaceWith(navigationStack.pop());

                if (isUefOriginalSupportCenter) {
                    // need to run this to get correct footer size
                    resizeUefFooter(sessionStorage.getItem('resizeUefSupportCenter'));
                }

                if (var_uefMode) {
                    $('.eesy__modal-scope section.contact_options').show();
                }
                hasUnsavedFormChanges = false;
            });

            utils.onClickOrSelectKey('.standalone .eesy_hint_hide', function (e, element) {
                var_eesy_hiddenHelpItems[activeHid] = true;

                $.ajax({
                    url: `${sessionInfo.dashboardUrl()}/rest/public/helpitems/${activeHid}/hidden?sessionkey=${sessionInfo.sessionKey()}`,
                    type: 'PUT',
                    success: (data) => {
                        closeSupportCenter();
                    },
                });
            });

            // clicking on one of the option buttons
            utils.onClickOrSelectKey('.eesy__modal-scope .option-button', function (e, element) {
                sessionEvents.addNodeSelectedEvent($(element).parents('.eesy-node').data('nodeId'));
                selectButtonHandler(element);
            });

            // jquery toggle just the attribute value
            $.fn.extend({
                toggleAttr: function (attr, val1, val2) {
                    var test = $(this).attr(attr);
                    if (test === val1) {
                        $(this).attr(attr, val2);
                        return this;
                    }
                    if (test === val2) {
                        $(this).attr(attr, val1);
                        return this;
                    }
                    // default to val1 if neither
                    $(this).attr(attr, val1);
                    return this;
                },
            });

            function selectButtonHandler(element) {
                var collapse = $(element).closest('.eesy-node').hasClass('___is-collapsable');
                var isDeselecting = $(element).hasClass('___is-selected');
                var buttonRemoved = false;

                $(element).toggleClass('___is-selected');
                $(element).toggleAttr('aria-selected', 'true', 'false');
                if (settings.SUPPORTCENTER.WCAG.ENABLED) {
                    if ($(element).children().length > 0) {
                        $(element).removeClass('xbutton__close');
                        $(element).find('button').remove();
                        buttonRemoved = true;
                    }
                    $(element).siblings().find('button').remove();
                }

                // "radio-button" handling
                $(element).siblings('.___is-selected').removeClass('___is-selected');
                $(element).siblings().attr('aria-selected', 'false');

                // Remove nodes below
                $(element)
                    .parents('.eesy-node')
                    .nextAll()
                    .slideUp(SLIDING_DURATION_MS, function () {
                        $(this).remove();
                    });

                if (settings.SUPPORTCENTER.WCAG.ENABLED) {
                    if (!buttonRemoved) {
                        $(element).append(
                            "<button class='xbutton__close' id='xbutton' role='button' aria-label='exit' label='Exit'>X</button>"
                        );
                    }
                }

                if (isDeselecting) {
                    if (collapse) {
                        $(element).siblings().show();
                        $(element).children().first().remove();
                    }
                    selectNode($(element).parents('.eesy-node').data('nodeId'), function () {
                        showActiveNodeContent();
                    });
                } else {
                    if (collapse) {
                        $(element).siblings().hide();
                        if (!settings.SUPPORTCENTER.WCAG.ENABLED) {
                            $(element).append(
                                "<div class='xbutton__close' id='xbutton' role='button' aria-label='exit' label='Exit'></div>"
                            );
                        }
                        $(element).attr('aria-selected', 'true');
                    }

                    selectNode($(element).data('optionId'), function () {
                        loadActiveNode(autoActivateHelpitem);
                    });
                }
            }

            utils.onClickOrSelectKey('.eesy__modal-scope .header__search', function () {
                openSearchForm();
            });

            utils.replaceLiveHandler('mouseover', '#toTopButton', function () {
                $(this).addClass('isActive');
            });

            utils.replaceLiveHandler('mouseout', '#toTopButton', function () {
                $(this).removeClass('isActive');
            });

            // selecting one of the options in a dropdown
            utils.replaceLiveHandler('change', '.eesy__modal-scope select.optionDropdown[data-selector]', function () {
                $(this)
                    .parents('.eesy-node')
                    .nextAll()
                    .slideUp(SLIDING_DURATION_MS, function () {
                        $(this).remove();
                    });

                selectNode($(this).val(), function () {
                    loadActiveNode(autoActivateHelpitem);
                });
            });

            function handleContactButton(selector, channel, templateName) {
                utils.onClickOrSelectKey(selector, function (e) {
                    $(this).removeClass('___is-focused');
                    navigationStack.push($('.eesy__modal__box').clone(true));
                    onNavigationStackChanged();
                    contactOptionsHandler.showChannel(activeNodePath, channel, templates[templateName]);
                    sessionEvents.addAssistedSupportRequestInitiated(
                        channel,
                        activeNodePath[activeNodePath.length - 1].id
                    );

                    if (channel == 'chat') {
                        sessionEvents.addAssistedSupportRequest(channel, activeNodePath[activeNodePath.length - 1].id);
                    }

                    $('.eesy__modal__box header').html(templates.content_header.html({}));
                    $('.eesy__modal-scope section.contact_options').hide();

                    if (channel == 'phone') {
                        utils.focusElement(
                            settings.SUPPORTCENTER.WCAG.ENABLED ? '#keepRefText' : '#submitPhoneForm',
                            500
                        );
                    } else if (channel == 'email') {
                        utils.focusElement(settings.SUPPORTCENTER.WCAG.ENABLED ? '#Subject' : '#selectedCategory', 500);
                    }
                });
            }

            // clicking on contact buttons
            handleContactButton('.eesy__modal-scope .contact__button.___email', 'email', 'contact_email');
            handleContactButton('.eesy__modal-scope .contact__button.___call', 'phone', 'contact_phone');
            handleContactButton('.eesy__modal-scope .contact__button.___chat', 'chat', 'chat_section_url');

            // support center close handler
            utils.onClickOrSelectKey('.eesy__modal-scope .header__close', closeSupportCenter);
            utils.replaceLiveHandler('click', '.eesy__modal-scope .eesy__modal__background', closeSupportCenter);

            // show more items
            utils.replaceLiveHandler('click', '.eesy__modal-scope [data-more-results]', loadMoreResults);

            utils.replaceLiveHandler('change', `${CONTACT_FORM_SELECTOR} select`, onContactFormDataChange);

            utils.replaceLiveHandler(
                'input',
                `${CONTACT_FORM_SELECTOR} input, ${CONTACT_FORM_SELECTOR} textarea`,
                onContactFormDataChange
            );

            utils.onEnterKey('.eesy__modal-scope [data-more-results]', loadMoreResults);

            function loadMoreResults() {
                var $resultsShowAll = $('.eesy__modal-scope .results__show-all');
                var $results = $resultsShowAll.closest('.results');
                var $moreTarget = $results.find('[data-more-results="target"]');
                var moreHeight = $moreTarget.children().outerHeight();
                $resultsShowAll.remove();
                $results.addClass('___is-open');
                $moreTarget.css('height', moreHeight + 4); // some extra height for focus outline

                var $resultsMore = $('.eesy__modal-scope .results__more');
                $resultsMore.find('.results__result').attr('tabindex', '0');
                $resultsMore.find('.results__result .results__subtitle').attr('tabindex', '0');
                $resultsMore.find('.results__result .results__votes').children().attr('tabindex', '0');

                $('.results .results__list .results__more >div .results__result').toArray()[0].focus();
            }

            // bring up the search form
            function openSearchForm() {
                navigationStack.push($('.eesy__modal__box').clone(true));
                onNavigationStackChanged();

                $('.eesy__modal__box header').html(templates.search_header.html({}));
                $('.eesy__modal__box main').html(templates.contact_options.html);
                $('input[data-search]').focus();
            }

            // react to search input typing
            if (settings.SUPPORTCENTER.WCAG.ENABLED) {
                utils.onEnterKey('.eesy__modal-scope [data-search]', function () {
                    var $dataSearch = $('.eesy__modal-scope [data-search]');
                    showSearchResults($dataSearch.val());
                });
            }

            if (!settings.SUPPORTCENTER.WCAG.ENABLED) {
                utils.replaceLiveHandler('keyup', '.eesy__modal-scope [data-search]', function () {
                    var $dataSearch = $(this);

                    if (searchTimerId != undefined) {
                        clearTimeout(searchTimerId);
                    }

                    searchTimerId = setTimeout(function () {
                        searchTimerId = undefined;
                        showSearchResults($dataSearch.val());
                    }, SEARCH_DELAY_MS);
                });
            } else {
                utils.onClickOrSelectKey('.eesy__modal-scope .searchButton', function () {
                    var $dataSearch = $('.eesy__modal-scope [data-search]');
                    showSearchResults($dataSearch.val());
                });
            }

            utils.replaceLiveHandler('keypress', '.eesy__modal-scope .eesy__filter-button', function () {
                var filterId = $(this).data('filter-id');
                currentResult.selectedFilters[filterId] = !$(this).hasClass('___is-selected');
                displayResult(true);
                //utils.focusElement('.eesy__modal-scope .eesy__filter-button', 500);
            });

            utils.replaceLiveHandler('click', '.eesy__modal-scope .eesy__filter-button', function () {
                var filterId = $(this).data('filter-id');
                currentResult.selectedFilters[filterId] = !$(this).hasClass('___is-selected');
                displayResult(true);
                //utils.focusElement('.eesy__modal-scope .eesy__filter-button', 500);
            });
        }

        function confirmLeavingContactForm() {
            const isEmailFormNotSubmitted = $(`${CONTACT_FORM_SELECTOR} .___email`).length > 0;
            const isPhoneCallFormNotSubmitted = $('#phoneNumber.___numberless').length > 0;
            const isFormNotSubmitted = isEmailFormNotSubmitted || isPhoneCallFormNotSubmitted;
            if (!isFormNotSubmitted || !hasUnsavedFormChanges) {
                return true;
            }

            const isConfirmed = window.confirm(language.LNG.SUPPORT_CENTER.CONTACT.EXIT_CONFIRMATION);
            if (isConfirmed) {
                hasUnsavedFormChanges = false;
            }
            return isConfirmed;
        }

        function closeSupportCenter() {
            if (!confirmLeavingContactForm()) {
                return;
            }

            navigationStack.length = 0;
            $('.eesy__modal-scope').fadeOut(function () {
                $(this).remove();
                $('body').removeClass('eesy__hide_y_overflow');
            });
            supportCenterIsOpen = false;
            runningStandalone = false;
            hasUnsavedFormChanges = false;
            sessionEvents.addCloseEvent();
            $(document).off('keyup', closeOnEscape);
        }

        function closeOnEscape(e) {
            if (e.key.toLowerCase() !== 'escape' || ['input', 'textarea'].includes(e.target.tagName.toLowerCase())) {
                return;
            }
            closeSupportCenter();
            e.stopPropagation();
        }

        function onContactFormDataChange(e) {
            if (!hasUnsavedFormChanges && e.target.value !== '') {
                hasUnsavedFormChanges = true;
            }
        }

        function isLocalContextNode(contextNode) {
            var result = false;

            $.each(contextNodeLinks, function (idx, contextNodeLink) {
                if (contextNodeLink.nodeId == contextNode && contextNodeLink.local) {
                    result = true;
                    return false;
                }
            });

            return result;
        }

        function getContextNodeIdThatShouldBeActivated(contextNodes) {
            // we prefer local nodes before out of the box nodes
            var result = contextNodes[0];

            $.each(contextNodes, function (idx, contextNode) {
                if (isLocalContextNode(contextNode)) {
                    result = contextNode;
                    return false;
                }
            });

            return result;
        }

        function positionUpButton() {
            if (!var_uefMode && !var_uefModeOriginalUseUefSupportCenter) {
                // none ultra style
                var elm = $('#eesyContentArea');

                if (elm.length) {
                    var x = elm[0].getBoundingClientRect().left;
                    var w = elm[0].getBoundingClientRect().width;
                    var buttonLeft = 817;
                    if (w <= 740) {
                        buttonLeft = x + w - 45;
                    }
                    $('#toTopButton').css('margin-left', buttonLeft);
                }
            }
        }

        function registerResizeHandler() {
            window.addEventListener('resize', function (e) {
                positionUpButton();
            });
        }

        function registerScrollHandler() {
            $('.eesy__modal').scroll(function (e) {
                if ($('#eesyContentArea').length) {
                    if ($(e.target).scrollTop() > 200) {
                        $('#toTopButton').show();
                        positionUpButton();
                    } else {
                        $('#toTopButton').hide();
                    }
                }
            });
        }

        function getPreferredLayout(layouts) {
            let layout = layouts[0];

            $.each(layouts, function (idx, layoutCandidate) {
                if (
                    layoutCandidate.properties.prefered_when_in_mode &&
                    layoutCandidate.properties.prefered_when_in_mode === sessionStorage.getItem('lmsMode')
                ) {
                    layout = layoutCandidate;
                }
            });

            return layout;
        }

        function showArticleById(contextHelpItems, contextNodes, helpItemId) {
            _show(contextHelpItems, contextNodes, undefined, helpItemId, undefined);
        }

        async function getLayout() {
            if (preferredLayout) {
                return preferredLayout;
            }
            return $.get(
                sessionInfo.dashboardUrl() + '/rest/nodes?type=dashboard_layout&sessionkey=' + sessionInfo.sessionKey()
            ).then((nodes) => {
                const layout = getPreferredLayout(nodes);
                preferredLayout = layout;
                supportCenterId = layout.id;
                return layout;
            });
        }

        function _show(_contextHelpItems, _contextNodes, hid, _autoActivateHelpitemId, _ruleIds) {
            eesyRequire(['json!user-context-variables'], function (response) {
                userContextVariables = response;
                var helpItem =
                    sessionStorage.getItem('helpItemArticleHandle') !== null
                        ? JSON.parse(sessionStorage.getItem('helpItemArticleHandle'))
                        : null;
                var helpItemId = sessionStorage.getItem('uefSupportCenterArticleId');

                if (var_uefMode && (helpItem || helpItemId)) {
                    // handle helpItem linking for bb ultra
                    if (helpItemId) {
                        sessionStorage.removeItem('uefSupportCenterArticleId');
                        showArticleById(
                            sessionStorage.getItem('eesy_foundHelpItems'),
                            sessionStorage.getItem('eesy_foundNodes'),
                            helpItemId
                        );
                    } else if (helpItem) {
                        sessionStorage.removeItem('helpItemArticleHandle');
                        showHelpItemInNode(helpItem.guid);
                    }
                    $('#supportCenterLoading').hide();
                } else {
                    autoActivateHelpitemId = _autoActivateHelpitemId;
                    activeHid = hid;
                    ruleIds = _ruleIds;

                    if (supportCenterIsOpen) {
                        autoActivateHelpitem();
                        return;
                    }
                    supportCenterIsOpen = true;

                    contextHelpItems =
                        _contextHelpItems === '' || _contextHelpItems == null ? [] : _contextHelpItems.split(',');
                    var contextNodes = _contextNodes === '' || _contextNodes == null ? [] : _contextNodes.split(',');

                    $.ajaxSetup({ cache: false });

                    installGuiHandlers();

                    const requests = [];
                    $.when.apply($, requests).then(function () {
                        initSupportCenter();
                    });
                    if (contextNodes.length > 0) {
                        requests.push(
                            $.get(
                                sessionInfo.dashboardUrl() +
                                    '/rest/nodes/' +
                                    getContextNodeIdThatShouldBeActivated(contextNodes) +
                                    '/path?sessionkey=' +
                                    sessionInfo.sessionKey(),
                                function (v) {
                                    contextNodePath = v;
                                }
                            )
                        );
                    }

                    function initSupportCenter() {
                        renderSupportCenter().then(async () => {
                            $('body').addClass('eesy__hide_y_overflow');
                            if (hid !== undefined) {
                                runningStandalone = true;
                                $('.footer__articles').addClass('footerHidden');
                                $('.eesy__footer').addClass('footerHidden');
                                $('.eesy_hint_footer').removeClass('footerHidden');
                                $('.eesy__modal__box').addClass('standalone');
                            }

                            registerScrollHandler();
                            registerResizeHandler();

                            utils.onClickOrSelectKey('#toTopButton', function () {
                                $('.eesy__modal').animate({ scrollTop: var_uefMode ? 0 : 100 }, 1000);
                            });

                            contactOptionsHandler.setup(
                                templates,
                                contactOptionsModule,
                                sessionInfo.sessionKey(),
                                sessionInfo.dashboardUrl()
                            );
                            const layout = await getLayout();

                            maxInitialHelpitems =
                                layout.properties.number_of_initial_visible_helpitems == undefined
                                    ? undefined
                                    : parseInt(layout.properties.number_of_initial_visible_helpitems);

                            contactOptionsModule.init(
                                sessionInfo.dashboardUrl(),
                                sessionInfo.sessionKey(),
                                supportCenterId,
                                function () {
                                    selectNode(supportCenterId, function () {
                                        if (hid) {
                                            loadAndShowHelpitem(hid);
                                        } else {
                                            loadActiveNode(autoActivateHelpitem);
                                        }
                                    });
                                }
                            );

                            // Apply "eesy-uef-original-override" styling when B2 support center is launched in BB Ultra hybrid
                            if (isUefOriginalSupportCenter) {
                                uefOriginalSupportCenterStyling();
                                resizeUefPanel(sessionStorage.getItem('resizeUefSupportCenter'));
                            }

                            initPanelTypeButton();
                        });
                        if (var_uefMode) {
                            $('#supportCenterLoading').hide();
                        }
                    }
                }
            });
        }

        function themeCssUrl(layout) {
            return sessionInfo.dashboardUrl(
                '/rest/public/support-center/' +
                    layout.id +
                    '/theme.css' +
                    '?__dbc' +
                    var_eesy_dbUpdateCount +
                    '&__bn=' +
                    var_eesy_build +
                    '&url=' +
                    window.location.hostname
            );
        }

        function uefOriginalSupportCenterStyling() {
            $('body').addClass('eesy-uef-original-override');

            var $eesyModalScope = $('.eesy__modal-scope');
            $eesyModalScope.prepend('<div id="uef-original-header"></div>');
            $eesyModalScope.prepend(
                '<a role="button" id="panelType-full" title="Resize panel">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">' +
                    '    <path d="M14 20L24 30" stroke="#A234B5" stroke-width="4" stroke-linecap="round"/>' +
                    '    <path d="M14 20L24 10" stroke="#A234B5" stroke-width="4" stroke-linecap="round"/>' +
                    '    <path d="M14 20L24 30" stroke="white" stroke-width="2" stroke-linecap="round"/>' +
                    '    <path d="M14 20L24 10" stroke="white" stroke-width="2" stroke-linecap="round"/>' +
                    '</svg></a>'
            );
            $eesyModalScope.prepend(
                '<a role="button" id="panelType-small" title="Resize panel">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">' +
                    '    <path d="M26 20L16 10" stroke="#A234B5" stroke-width="4" stroke-linecap="round"/>' +
                    '    <path d="M26 20L16 30" stroke="#A234B5" stroke-width="4" stroke-linecap="round"/>' +
                    '    <path d="M26 20L16 10" stroke="white" stroke-width="2" stroke-linecap="round"/>' +
                    '    <path d="M26 20L16 30" stroke="white" stroke-width="2" stroke-linecap="round"/>' +
                    '</svg></a>'
            );

            var $uefOriginalHeader = $('#uef-original-header');
            $uefOriginalHeader.append(
                '<a class="header__close" tabindex="0" role="button" aria-label="close"><div id="close-uef-svg"></div></a>'
            );
            $uefOriginalHeader.append('<div id="header-title" tabindex="0" aria-label="title"></div>');
            $('#header-title').text(settingsUef.UEF.SUPPORT_CENTER.TITLE);
        }

        function initPanelTypeButton() {
            if (var_uefMode) {
                var $panelType = $('#panelType');

                if ($panelType.length) {
                    var panelType = sessionStorage.getItem('resizeUefSupportCenter');

                    if (panelType === 'full') {
                        $panelType.css('content', 'url("/resources/images/uef-resize-small.svg")');
                    } else {
                        $panelType.css('content', 'url("/resources/images/uef-resize-full.svg")');
                    }
                    $panelType.show();
                }
            }

            utils.onClickOrSelectKey('[id^=panelType]', function () {
                var helpItemId = $('#eesyContentArea').data('helpitemid');
                var panelType = sessionStorage.getItem('resizeUefSupportCenter') || 'small';

                if (helpItemId) sessionStorage.setItem('uefSupportCenterArticleId', helpItemId);
                sessionStorage.setItem('resizeUefSupportCenter', panelType === 'small' ? 'full' : 'small');

                if (isUefOriginalSupportCenter) {
                    resizeUefPanel(sessionStorage.getItem('resizeUefSupportCenter'));
                }
            });
        }

        function resizeUefFooter(panelType) {
            $('.eesy-uef-original-override .eesy__modal-scope .eesy__modal .layout__footer')
                .css('width', panelType === 'full' ? '95%' : '420px')
                .css('transition', 'none');
        }

        function resizeUefPanel(panelType) {
            var isFullPanel = panelType === 'full';
            $('#panelType-full').toggle(!isFullPanel);
            $('#panelType-small').toggle(isFullPanel);
            $('.eesy__modal-scope')
                .css('width', isFullPanel ? '95%' : '420px')
                .css('transition', 'width 0.5s');
            $('.eesy__modal__background')
                .css('right', isFullPanel ? '95%' : '420px')
                .css('transition', 'right 0.5s');
            $('.eesy-uef-original-override .eesy__modal-scope .eesy__modal .layout__footer')
                .css('width', isFullPanel ? '95%' : '420px')
                .css('transition', 'width 0.5s');
        }

        function loadAndShowUefHelpItem(helpItem) {
            navigationStack.push($('.eesy__modal__box').clone(true));

            Mustache.to_html(helpItem.embed, userContextVariables);

            $('.eesy__modal__box header').html(templates.content_header.html({}));
            $('.eesy__modal__box main').html(
                templates.content_main.html({
                    helpitem: helpItem,
                    votingEnabled: helpItem.voting.enabled,
                })
            );

            // fix image scale
            $('#eesyContentArea').find('img').removeAttr('width').removeAttr('height');

            fixYoutubeIFrames();
            onNavigationStackChanged();
        }

        function autoActivateHelpitem() {
            if (autoActivateHelpitemId !== undefined) {
                loadAndShowHelpitem(autoActivateHelpitemId);
                autoActivateHelpitemId = undefined;
            }
        }

        function show(_contextHelpItems, _contextNodes, hid, ruleIds) {
            _show(_contextHelpItems, _contextNodes, hid, undefined, ruleIds);
        }

        function showHelpItemInNode(helpItemGuid) {
            $.get(sessionInfo.dashboardUrl() + '/rest/public/helpitemid?guid=' + helpItemGuid, function (response) {
                var helpitemId = response.id;
                $.get(
                    sessionInfo.dashboardUrl() + '/rest/public/helpitemSupportCenterNode?guid=' + helpItemGuid,
                    function (response) {
                        var nodeId = response.nodeId;
                        _show('' + helpitemId, '' + (nodeId == null ? '' : nodeId), undefined, helpitemId);
                    }
                );
            });
        }

        function showHelpItemPreview(helpItem) {
            const isPreviewAlreadyRendered = $('.eesy__modal-scope.eesy__preview').length;
            const renderContent = () => showHelpItem(helpItem, getMockedContactOptions());

            if (isPreviewAlreadyRendered) {
                renderContent();
            } else {
                closeSupportCenter();
                renderSupportCenter(true)
                    .then(() => var_uefMode && uefOriginalSupportCenterStyling())
                    .then(renderContent);
            }
        }

        function hideHelpItemPreview() {
            $('.eesy__modal-scope.eesy__preview').remove();
        }

        function renderSupportCenter(isPreview = false) {
            return new Promise(async (resolve) => {
                const layout = await getLayout();
                const themeId = layout?.properties?.design_active_theme_id;
                const inheritStyles = themeId === 'inherited' && settings.SUPPORTCENTER.CANVAS_THEME_COLORS_ENABLED;
                if (!inheritStyles) {
                    eesy_load_css(themeCssUrl(layout));
                }
                const TEMPLATE_DIR = sessionInfo.stylePath('/style_v2/eesysoft-template');
                templates.loadTemplates(TEMPLATE_DIR + '/mustache_templates/', templateNames, function () {
                    const $target = isPreview ? $('#expertActionBar') : $('body');
                    $target.append(
                        templates.support_center.html({
                            theme_id: themeId,
                            inherit_styles: inheritStyles,
                            is_preview: isPreview,
                        })
                    );
                    $('footer.layout__footer').append(
                        templates.footer.html({
                            hasReportAccess: sessionInfo.hasReportAccess(),
                            dashboardUrl: sessionInfo.dashboardUrl(),
                        })
                    );
                    resolve();
                });
            });
        }

        return {
            getLayout,
            hideHelpItemPreview,
            showHelpItemPreview,
            show,
            showHelpItemInNode,
        };
    }
);
