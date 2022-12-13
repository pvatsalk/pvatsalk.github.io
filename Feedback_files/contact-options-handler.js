eesy.define(
    [
        'jquery-private',
        'osage-contact',
        'osage-selector',
        'system-information',
        'utils',
        'field-decorator',
        'json!language-supportcenter',
        'json!settings-supportcenter',
        'session-events',
    ],
    function (
        $,
        osageContact,
        osageSelector,
        systemInformation,
        utils,
        fieldDecorator,
        language,
        settings,
        sessionEvents
    ) {
        var templates = undefined;
        var contactOptionsModule = undefined;
        var activeNodePath = undefined;
        var sessionKey = undefined;
        var dashboardUrl = undefined;
        var reference = undefined;
        var decoratedFields = undefined;
        var isSubmitting = false;

        function setup(_templates, _contactOptionsModule, _sessionKey, _dashboardUrl) {
            templates = _templates;
            contactOptionsModule = _contactOptionsModule;
            sessionKey = _sessionKey;
            dashboardUrl = _dashboardUrl;
        }

        function showChannel(_activeNodePath, channel, template, rootNode) {
            activeNodePath = _activeNodePath;

            var recipientOptions = contactOptionsModule.getActiveContactOptions(channel);
            var allContactOptions = contactOptionsModule.getAllContactOptions();

            if (channel == 'chat' && recipientOptions[0].properties.chattype == 'external_module') {
                var role = 'student';

                if (var_eesy_sac['-3:0']) role = 'instructor';

                var payload = {
                    payload: {
                        context: {
                            conversation_id: sessionKey,
                            role: role,
                            contactOptions: allContactOptions,
                        },
                    },
                };

                eesyRequire([utils.addStampToUrl(recipientOptions[0].properties.address)], function (external) {
                    external.launch('.eesy__modal__box main', payload);
                });
            } else {
                if (channel == 'chat' && recipientOptions[0].properties.open_in_new_window == 'true') {
                    window.open(recipientOptions[0].properties.address, 'Chat');
                } else {
                    setupContactTemplate(channel, template, recipientOptions);
                }
            }
        }

        function setupContactTemplate(channel, template, recipientOptions) {
            var hideRecipientSelector = recipientOptions.length == 1;

            if (hideRecipientSelector) {
                recipientOptions[0].selected = true;
            }

            var nodeId = activeNodePath[activeNodePath.length - 1].id;

            $.get(
                dashboardUrl + '/rest/contactform/' + nodeId + '/' + channel + '/fields?sessionkey=' + sessionKey,
                function (_fields) {
                    var hideTimeSelector = _fields.some(function (item) {
                        return item.useTimeOfDay === 'false';
                    });
                    decoratedFields = fieldDecorator.decorateFields(_fields, categoryPath());

                    $('.eesy__modal__box main').html(
                        template.html({
                            fieldsHtml: templates.contact_fields.html({
                                fields: decoratedFields,
                                hideTimeSelector: hideTimeSelector,
                            }),
                            recipientOptions: recipientOptions,
                            hideRecipientSelector: hideRecipientSelector,
                        })
                    );

                    $(
                        '.eesy__modal-scope .form__item input,.eesy__modal-scope .form__item textarea,.eesy__modal-scope .form__item select'
                    ).each(function () {
                        var newid = $(this).attr('id').replace(/ /g, '');
                        $(this).attr('id', newid);
                    });

                    if (!hideRecipientSelector) {
                        // preselect first option (only applies to chat)
                        if (recipientOptions.length > 1) {
                            $(
                                '.chat-selector#dropdown-recipient-select[data-selector] ' +
                                    'option[value="' +
                                    recipientOptions[0].id +
                                    '"]'
                            ).attr('selected', 'selected');
                        }

                        osageSelector.decorate('#dropdown-recipient-select[data-selector]');

                        // handle frame change (only applies to chat)
                        utils.replaceLiveHandler(
                            'change',
                            '.eesy__modal-scope .chat-selector#dropdown-recipient-select[data-selector]',
                            function () {
                                $.each(
                                    recipientOptions,
                                    (function (selected) {
                                        return function (i, o) {
                                            if (o.id == $(selected).val()) {
                                                $('#eesy_chatframe').attr('src', o.properties.address);
                                            }
                                        };
                                    })(this)
                                );
                            }
                        );

                        // handle number change
                        utils.replaceLiveHandler(
                            'change',
                            '.eesy__modal-scope .__static-call #dropdown-recipient-select[data-selector]',
                            function () {
                                $('.eesy__modal-scope .__static-call .form__submit.___call').trigger('click');
                            }
                        );
                    }

                    if (settings.SUPPORTCENTER.PHONE.USE_STATIC_NUMBER) {
                        //trigger show number event
                        $('.eesy__modal-scope .__static-call .form__submit.___call').trigger('click');
                    }

                    osageSelector.decorate('.eesy__modal__box .dropdown-contact-field');

                    if ($('.datepicker-contact-field').length) {
                        eesyRequire(['datepicker'], function (datepicker) {
                            $('.datepicker-contact-field').datepicker({
                                container: '.eesy__modal__box .layout__main',
                                format: 'DD, MM d, yyyy', //Could use settings.DATE_FORMAT.SHORT or similar
                                todayBtn: 'linked', // button for resetting to today
                                todayHighlight: true, // indicate the current day
                                weekStart: 1, // week starts on monday
                                daysOfWeekHighlighted: [0, 6], // highlight weekend days
                                calendarWeeks: false, // don't show week numbers
                                autoclose: true, // close when a date is selected
                            });
                            $('.datepicker-contact-field').datepicker('setDate', new Date());
                        });
                    }

                    osageContact.setupForm();
                }
            );
        }

        function categoryPath() {
            return (
                $.map(activeOptionPath(), function (node) {
                    return node.properties.name;
                }).join(' -> ') || language.LNG.SUPPORT_CENTER.FORM.NO_CATEGORY_SELECTED
            );
        }

        function activeOptionPath() {
            return $.grep(activeNodePath, function (node) {
                return node.type == 'option';
            });
        }

        function validateForm(channel) {
            var valid = true;

            $('.eesy__modal-scope .form__error').remove();

            // Require contact option selection
            var contactOptions = contactOptionsModule.getActiveContactOptions(channel);
            if (contactOptions.length != 1 && $('select#dropdown-recipient-select').val() == null) {
                $('.eesy__modal-scope select#dropdown-recipient-select')
                    .parent()
                    .parent()
                    .append(
                        '<div class="form__error isFocusable focusStyleUnderline" style="display: block;">' +
                            language.LNG.SUPPORT_CENTER.MAIL.FORM.RECIPIENT_INVALID +
                            '</div>'
                    );

                valid = false;
            }

            $.each(decoratedFields, function (i, field) {
                if (field.validator && !field.validator(field.id)) {
                    const errorMessage =
                        field.validationFailedText ?? language.LNG.SUPPORT_CENTER.FORM.DEFAULT_VALIDATION_ERROR;
                    const errorHtml = `
                        <div tabindex="0" class="form__error isFocusable focusStyleUnderline" style="display: block;">
                            ${errorMessage}
                        </div>
                    `;
                    const inputQuery = `.eesy__modal-scope #${field.id.replace(/ /g, '')}`;

                    if (field.type === 'date') {
                        $(`${inputQuery} .form__item:first`).append(errorHtml);
                    } else if (field.type === 'attachments') {
                        $(inputQuery).parent().after(errorHtml);
                    } else {
                        $(inputQuery).parent().append(errorHtml);
                    }

                    valid = false;
                }
            });
            return valid;
        }

        function renderEmail(mailSections) {
            const mailHtml = templates.mail.html({ mailSections: mailSections });
            $('.eesy__modal-scope').append('<div style="display: none" id="hiddenmail">' + mailHtml + '</div>');

            $('.eesy__modal-scope #cte-mail table td').css({
                margin: '0',
                padding: '0',
            });

            $('.eesy__modal-scope #cte-mail table').css({
                'border-collapse': 'collapse',
                width: '100%',
            });

            $('.eesy__modal-scope .cte-para').css('margin', '0 0 0.7em');
            $('.eesy__modal-scope .cte-message-body').css('white-space', 'pre-line');
            $('.eesy__modal-scope .cte-emphasis').css('font-weight', 'bold');
            $('.eesy__modal-scope .cte-key').css('width', '15em');
            $('.eesy__modal-scope .cte-key, .cte-value').css('display', 'inline-block');

            const result = $('#hiddenmail').html();
            $('#hiddenmail').remove();
            return result;
        }

        function getAttachments(fieldId) {
            const attachments = [];
            $(`#${fieldId}-files .file__upload__file`).each(function (i, item) {
                attachments.push({
                    fileName: $(item).data('filename'),
                    fileUrl: dashboardUrl + '/loadFile?fileid=' + $(item).data('fileid'),
                });
            });
            return attachments;
        }

        function submitForm(channel, onFormSent) {
            var subject = undefined;

            if (!validateForm(channel)) {
                //utils.focusElement(('.eesy__modal-scope .form__error'), 500);
                $('.eesy__modal-scope .form__error').toArray()[0].focus();
                return;
            }
            if (isSubmitting) return;
            isSubmitting = true;

            sessionEvents.addAssistedSupportRequest(channel, activeNodePath[activeNodePath.length - 1].id);
            if ((!settings.SUPPORTCENTER.PHONE.USE_STATIC_NUMBER && channel == 'phone') || channel == 'email') {
                $('.eesy__modal-scope .selector__select').off('click'); // disable the recipient selector
            }
            $('.eesy__modal__box .form__send').text(language.LNG.SUPPORT_CENTER.MAIL.FORM.SENDING);

            $.each(decoratedFields, function (i, field) {
                if (field.useAsSubject && (field.type == 'singleLineInput' || field.type == 'subjectCallReference')) {
                    subject = field.value();
                } else if (field.useAsSubject && field.type == 'selectedCategories') {
                    subject = $('.eesy__modal-scope #selectedCategories').val();
                }
            });

            if (channel == 'email' && settings.SUPPORTCENTER.EMAIL.USE_FIXED_SUBJECT) {
                subject = language.LNG.SUPPORT_CENTER.MAIL.SUBJECT.FIXED;
            }

            $.get(dashboardUrl + '/rest/user/?sessionkey=' + sessionKey, function (user) {
                $.getJSON(dashboardUrl + '/rest/user/courses/names?sessionkey=' + sessionKey, function (courseNames) {
                    setCourseIdIfUefMode();
                    if (hasCourse()) {
                        $.getJSON(
                            dashboardUrl +
                                '/rest/user/courses/' +
                                (!(typeof eesy_course_id === 'undefined') ? eesy_course_id : -1),
                            function (activeCourse) {
                                populateAndSendMail(
                                    channel,
                                    user,
                                    subject,
                                    courseNames,
                                    onFormSent,
                                    activeCourse.course_id ? activeCourse : undefined
                                );
                            }
                        );
                    } else {
                        populateAndSendMail(channel, user, subject, courseNames, onFormSent, undefined);
                    }
                });
            });

            if (!validateForm(channel)) {
                //utils.focusElement("#form__error", 500);
                $('#form__error').toArray()[0].focus();
            }
        }

        function populateAndSendMail(channel, user, subject, courseNames, onFormSent, activeCourse) {
            const mailSections = [];

            $.each(decoratedFields, function (i, field) {
                // ettersom hva slags field vi får inn, legg til mailSection
                const attachments = field.type === 'attachments' ? getAttachments(field.id) : [];
                const mailContext = {
                    user,
                    activeCourse,
                    hasCourse: hasCourse(),
                    courseNames,
                    attachments,
                    categoryPath: categoryPath(),
                    templates,
                    field,
                };

                mailSections.push({ html: field.mailHtml(mailContext) });
            });

            const mailHtml = renderEmail(mailSections);

            const contactOptions = contactOptionsModule.getActiveContactOptions(channel);
            const toContactOptionNodeId =
                contactOptions.length === 1 ? contactOptions[0].id : $('select#dropdown-recipient-select').val();

            if ((!settings.SUPPORTCENTER.PHONE.USE_STATIC_NUMBER && channel === 'phone') || channel === 'email') {
                $.post(
                    dashboardUrl + '/rest/contactoptions/' + toContactOptionNodeId + '?sessionkey=' + sessionKey,
                    {
                        mailHtml: mailHtml,
                        subject: (subject + ' ' + language.LNG.SUPPORT_CENTER.MAIL.SUBJECT.APPEND).trim(),
                    },
                    function () {
                        isSubmitting = false;
                        onFormSent && onFormSent(toContactOptionNodeId);
                        utils.focusElement('#msgsent', 500);
                    }
                );
            } else {
                isSubmitting = false;
                onFormSent && onFormSent(toContactOptionNodeId);
                utils.focusElement('#msgsent', 500);
            }
        }

        function hasCourse() {
            return typeof eesy_course_id !== 'undefined' && eesy_course_id !== '-1';
        }

        function preventDefault(e) {
            e.preventDefault();
        }

        function setCourseIdIfUefMode() {
            if (var_uefMode) {
                eesy_course_id = sessionStorage.getItem('eesy_courseId');
            }
        }

        //
        // handlers
        //
        $(function () {
            utils.replaceLiveHandler('submit', '.eesy__modal-scope form[data-form-contact]', preventDefault);

            utils.replaceLiveHandler('click', '.eesy__modal-scope .form__submit.___call', function () {
                reference = Math.floor(Math.random() * 9000) + 1000;

                $('[data-call-reference]').data('reference', reference);

                submitForm('phone', function (toContactOptionNodeId) {
                    $.each(decoratedFields, function (i, field) {
                        $('#' + field.id).attr('disabled', 'disabled');
                    });

                    $('.form__submit.___call input').attr('disabled', 'disabled');

                    $.get(
                        dashboardUrl + '/rest/nodes/' + toContactOptionNodeId + '?sessionkey=' + sessionKey,
                        function (contactNode) {
                            $('[data-call-phonenumber]')
                                .removeClass('___numberless')
                                .html(contactNode.properties.number);

                            $('[data-call-reference]').text(reference);
                        }
                    );
                });

                return false;
            });

            utils.replaceLiveHandler('click', '.eesy__modal-scope .form__submit.___email', function () {
                submitForm('email', function () {
                    $('.eesy__modal__box main').html(templates.mail_sent.html({}));
                });
            });
        });

        return {
            showChannel,
            setup,
        };
    }
);
