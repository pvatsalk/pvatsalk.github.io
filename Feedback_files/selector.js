eesy.define(['jquery-private', 'json!settings-supportcenter', 'utils'], function ($, settings, utils) {
    'use strict';

    var openState = '___is-open';
    var selectedState = '___is-selected';

    /**
     * Actions to perform when selection one of the options with either mouse, keyboard.
     * @param HtmlElement   el      the selected option
     * @param Boolean       close   whether to close after selecting
     */

    function selectOption(el, close) {
        var $selectedOption = $(el);

        if ($selectedOption.attr('data-value')) {
            var selectedOptionText = $selectedOption.text();

            // Add selected state
            $selectedOption.siblings().removeClass(selectedState);
            $selectedOption.addClass(selectedState);

            // Update selected value
            $selectedOption.closest('.selector').children('.selector__select').text(selectedOptionText);

            // Select option in the original 'select' element
            var selectedValue = $selectedOption.attr('data-value');
            $selectedOption
                .closest('.selector')
                .find('[value="' + selectedValue + '"]')
                .prop('selected', true)
                .change();

            // Hide options
            if (close) {
                $selectedOption.closest('.selector').removeClass(openState);
            }

            if ($selectedOption.attr('data-value').indexOf('.html') > 0) {
                window.location.href = $(el).attr('data-value');
            }
        }
    }

    // This is a function that focus on the element when navigating with the arrow keys in a dropdown selector
    function focusScrollOnSelectedElement() {
        if ($('.selector.___is-open').length > 0) {
            var selectedOption = $('.selector.___is-open').find('.selector__option.___is-inFocus');
            if (selectedOption.length !== 0) {
                // TODO need a better calculation for the scrollTop position value
                $('.selector__options').scrollTop(selectedOption.offset().top);
            }
        }
    }

    return {
        selectOption: selectOption,

        decorate: function (jquerySelector) {
            /**
             * Turns 'select' elements into fancy selectors by looking for [data-selector].
             * It hides 'select' and replaces it with own html that can be styled.
             * On mobile the select 'hovers' transparently above it's replacer to tricker
             * default behaviour.
             */

            var $dataSelector = $(jquerySelector); // used to be [data-selector]

            /**
             * Inits selector. All code lives here, when detected it builds our selector.
             */
            function initSelector() {
                var userAgent = window.navigator.userAgent || window.navigator.vendor || window.opera,
                    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(userAgent),
                    mobileState = isMobile ? ' ___is-mobile' : '',
                    isFirefox = /Firefox/i.test(userAgent);

                function buildSelector() {
                    // Build selector out of each 'select' that is found
                    $dataSelector.each(function (index) {
                        var tabIndex = 0;
                        if ($(this).attr('tabindex')) {
                            tabIndex = $(this).attr('tabindex');
                        }
                        $(this).attr('tabindex', -1);

                        if (!settings.SUPPORTCENTER.WCAG.ENABLED) {
                            // Wrap the 'select' element in a new stylable selector
                            $(this).wrap('<div class="selector' + mobileState + '"></div>');

                            // Fill the selector with a stylable 'select'
                            $(this)
                                .parent()
                                .append(
                                    '<div class="selector__select isFocusable focusStyleOutline" tabindex="' +
                                        tabIndex +
                                        '"></div><ul class="selector__options"></ul>'
                                );

                            var optionSelectedText = '';
                            $(this)
                                .children('option')
                                .each(function () {
                                    var optionText = $(this).text(),
                                        optionValue = $(this).attr('value'),
                                        optionSelected = '';

                                    // Check if option is selected
                                    if ($(this).attr('selected')) {
                                        optionSelected = ' ___is-selected';
                                        optionSelectedText = optionText;
                                    }

                                    if ($(this).attr('disabled')) {
                                        optionSelected += ' ___is-disabled';
                                        optionValue = '';
                                        if (optionSelectedText.length === 0) {
                                            optionSelectedText = optionText;
                                        }
                                    }

                                    // Fill the selector with stylable 'options'
                                    $(this)
                                        .closest('.selector')
                                        .children('.selector__options')
                                        .append(
                                            '<li class="selector__option' +
                                                optionSelected +
                                                '" data-value="' +
                                                optionValue +
                                                '">' +
                                                optionText +
                                                '</li>'
                                        );
                                });
                        } else {
                            $(this).append('<div class="selector__select isFocusable focusStyleOutline" tabindex=0>');
                            $(this).addClass('selector__select');
                            $(this).addClass('isFocusable');
                            $(this).addClass('focusStyleOutline');
                            $(this).attr('tabindex', '0');
                        }

                        // Set our selector to the disabled ('Make a choice..') or selected text
                        $(this).closest('.selector').children('.selector__select').text(optionSelectedText);
                    });
                }

                buildSelector();

                // Original select changes on mobile
                $dataSelector.change(function () {
                    $(this)
                        .children('option:selected')
                        .each(function () {
                            $(this).closest('.selector').children('.selector__select').text($(this).text());
                        });
                });

                // SELECTOR : the "new" select consisting of li's
                var $selector = $('.selector'),
                    $selectorSelect = $('.selector__select'),
                    $selectorOption = $('.selector__option');

                // Show options
                $selectorSelect.on('click', function (e) {
                    e.preventDefault();
                    $(this).parent('.selector').addClass(openState);
                    $(this).removeClass('focusStyleOutline');

                    $('.selector__options').css('max-height', $(window).height() - 100);
                });

                // Add and remove a .___has-focus class when selected with keyboard
                $selectorSelect
                    .on('focusin', function () {
                        $(this).addClass('___has-focus');
                    })
                    .on('focusout', function () {
                        $(this).removeClass('___has-focus');

                        /*
                        NOTE: I commented out the following line because it led to the box disappearing too quickly,
                        blocking the selection if the click lasted too long. Not quite sure why it was there in
                        the first place though, thus this remark. The actual closing happens elsewhere.
                     */
                        //$(this).parent('.selector').removeClass('___is-open');
                    });

                // Remove .___is-open and close our selector when navigating outside of this element
                $(document).mouseup(function (e) {
                    // If the target of the click isn't the container nor a descendant of the container
                    if (
                        !$('.selector.___is-open').is(e.target) &&
                        $('.selector.___is-open').has(e.target).length === 0
                    ) {
                        $('.selector.___is-open').removeClass(openState);
                        $selectorSelect.addClass('focusStyleOutline');

                        $(this).find('.selector__option').removeClass('___is-inFocus');
                        $(this).find('.___is-selected').addClass('___is-inFocus');
                    }
                });

                // Select option
                $selectorOption.off('click').on('click', function (e) {
                    e.preventDefault();
                    if ($(this).hasClass('___is-disabled')) {
                        return;
                    }
                    $selectorSelect.addClass('focusStyleOutline');
                    selectOption(this, true);
                });

                $selector.off('keydown').on('keydown', function (ev) {
                    var $selectorIsOpen = $('.selector.___is-open');

                    $('.selector__options').css('max-height', $(window).height() - 100);

                    if (utils.isSelectKey(ev)) {
                        // select keys
                        ev.preventDefault();

                        $selectorSelect.removeClass('focusStyleOutline');

                        if ($selectorIsOpen.length > 0) {
                            $selectorSelect.addClass('focusStyleOutline');

                            $(this).find('.selector__option').removeClass(selectedState);
                            $(this).find('.___is-inFocus').addClass(selectedState);

                            selectOption($(this).find('.___is-selected'), true);
                        } else {
                            $(this).addClass(openState);
                        }
                    } else if (ev.keyCode === 27) {
                        // escape
                        $selectorIsOpen.removeClass(openState);
                        $selectorSelect.addClass('focusStyleOutline');

                        $(this).find('.selector__option').removeClass('___is-inFocus');
                        $(this).find('.___is-selected').addClass('___is-inFocus');
                    } else if (ev.keyCode !== 9 && !ev.metaKey && !ev.altKey && !ev.ctrlKey && !ev.shiftKey) {
                        ev.preventDefault();
                        ev.stopPropagation();

                        var found;

                        if ($selectorIsOpen.length > 0) {
                            found = $(this).find('.___is-inFocus');
                        } else {
                            found = $(this).find('.' + selectedState);
                        }

                        if (ev.keyCode === 38) {
                            // up
                            var prev = $(found).prev('.selector__option:not(.___is-disabled)');

                            if (!prev.length) {
                                // is first item in list
                                prev = $(this).find('.selector__option:not(.___is-disabled)').last();
                            }

                            // only auto update when selector is closed
                            if ($selectorIsOpen.length === 0) {
                                $(this).find('.selector__option').removeClass(selectedState);
                                $(prev).addClass(selectedState);

                                selectOption(prev);
                            } else {
                                //focusScrollOnSelectedElement();
                            }

                            $(this).find('.selector__option').removeClass('___is-inFocus');
                            $(prev).addClass('___is-inFocus');
                        } else if (ev.keyCode === 40) {
                            // down
                            var next;

                            if (!found.length) {
                                next = $(this).find('.selector__option:not(.___is-disabled)').first();
                            } else {
                                next = $(found).next('.selector__option:not(.___is-disabled)');

                                if (!next.length) {
                                    // is last item in list
                                    next = $(this).find('.selector__option:not(.___is-disabled)').first();
                                }
                            }

                            // only auto update when selector is closed
                            if ($selectorIsOpen.length === 0) {
                                $(this).find('.selector__option').removeClass(selectedState);
                                $(next).addClass(selectedState);

                                selectOption(next);
                            } else {
                                //focusScrollOnSelectedElement();
                            }

                            $(this).find('.selector__option').removeClass('___is-inFocus');
                            $(next).addClass('___is-inFocus');
                        }
                    }
                });
            }

            // If selects are found
            if ($dataSelector.length) {
                initSelector();
            }
        },
    };
});
