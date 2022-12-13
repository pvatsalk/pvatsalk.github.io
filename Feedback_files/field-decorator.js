eesy.define(
    ['jquery-private', 'json!language-supportcenter', 'system-information', 'mustachejs'],
    function ($, language, systemInformation, Mustache) {
        // configuration and state

        var fieldTemplatesList = [
            {
                id: 'primaryPropertiesTable',
                type: 'primaryPropertiesTable',
                mailHtml: function (context) {
                    return context.templates.mail_section_properties_table.html({
                        properties: getPrimaryProperties(context.activeCourse, context.user, context.hasCourse),
                    });
                },
            },
            {
                id: 'selectedCategories',
                type: 'selectedCategories',
                isFixedInfoLine: true,
                placeholder: '',
                label: language.LNG.SUPPORT_CENTER.MAIL.FORM.SELECTED_CATEGORIES,
                setupMembers: function (id, categoryPath) {
                    return {
                        value: function () {
                            return categoryPath;
                        },
                    };
                },
                mailHtml: function (context) {
                    return context.templates.mail_section_single_property.html({
                        value: context.field.value(),
                        name: 'selectedOption',
                        caption: language.LNG.SUPPORT_CENTER.MAIL.SELECTED_CATEGORY,
                    });
                },
            },
            {
                type: 'singleLineInput',
                isSingleLine: true,
                setupMembers: function (id) {
                    return {
                        value: function () {
                            return $('.eesy__modal-scope #' + id.replace(/ /g, '')).val();
                        },
                    };
                },
                mailHtml: function (context) {
                    return context.templates.mail_section_single_property.html({
                        value: context.field.value(),
                        name: context.field.id,
                        caption: context.field.label,
                    });
                },
            },
            {
                type: 'checkbox',
                isCheckbox: true,
                setupMembers: function (id) {
                    return {
                        value: function () {
                            return $('.eesy__modal-scope #' + id.replace(/ /g, '')).is(':checked');
                        },
                    };
                },
                mailHtml: function (context) {
                    return context.templates.mail_section_single_property.html({
                        value: context.field.value(),
                        name: context.field.id,
                        caption: context.field.label,
                    });
                },
            },
            {
                type: 'dropdown',
                isDropdown: true,
                setupMembers: function (id) {
                    return {
                        value: function () {
                            return $('.eesy__modal-scope #' + id.replace(/ /g, '')).val();
                        },
                    };
                },
                mailHtml: function (context) {
                    return context.templates.mail_section_single_property.html({
                        value: context.field.value(),
                        name: context.field.id,
                        caption: context.field.label,
                    });
                },
            },
            {
                type: 'date',
                isDatepicker: true,
                setupMembers: function (id) {
                    return {
                        value: function () {
                            return (
                                $('.eesy__modal-scope #' + id.replace(/ /g, '') + ' .eesy_dateField').val() +
                                ' ' +
                                $('.eesy__modal-scope #' + id.replace(/ /g, '') + ' .eesy_timeField').val()
                            );
                        },
                    };
                },
                mailHtml: function (context) {
                    return context.templates.mail_section_single_property.html({
                        value: context.field.value(),
                        name: context.field.id,
                        caption: context.field.label,
                    });
                },
                timeOfDayOptions: createTimesOfDay(0, 24, ['00']),
            },
            {
                id: 'subjectCallReference',
                type: 'subjectCallReference',
                useAsSubject: true,
                setupMembers: function (id) {
                    return {
                        value: function () {
                            return Mustache.to_html(language.LNG.SUPPORT_CENTER.PHONE.CALL_REFERENCE_DETAILS, {
                                reference: $('[data-call-reference]').data('reference'),
                            });
                        },
                    };
                },
                mailHtml: function (context) {
                    return context.templates.mail_section_single_property.html({
                        value: context.field.value(),
                        name: context.field.id,
                        caption: language.LNG.SUPPORT_CENTER.PHONE.CALL_REFERENCE,
                    });
                },
            },
            {
                type: 'multiLineInput',
                isMultiLine: true,
                setupMembers: function (id) {
                    return {
                        value: function () {
                            return $('.eesy__modal-scope #' + id.replace(/ /g, '')).val();
                        },
                    };
                },
                mailHtml: function (context) {
                    return context.templates.mail_section_message.html({
                        title: context.field.label,
                        value: context.field.value(),
                    });
                },
            },
            {
                id: 'courses',
                type: 'courseList',
                mailHtml: function (context) {
                    return context.templates.mail_section_courses.html({
                        courses: getCourseList(context.courseNames),
                    });
                },
            },
            {
                id: 'systemInformation',
                type: 'systemInformation',
                mailHtml: function (context) {
                    return context.templates.mail_section_properties_table.html({
                        title: language.LNG.SUPPORT_CENTER.MAIL.HEADER.SYSTEM_INFORMATION,
                        properties: systemInformation.getAllProperties(),
                    });
                },
            },
            {
                type: 'attachments',
                isAttachment: true,
                mailHtml: function (context) {
                    return context.templates.mail_section_attachments.html({
                        attachments: context.attachments,
                        caption: context.field.label,
                    });
                },
            },
        ];

        var validators = {
            HAS_TEXT: function (id) {
                return $('.eesy__modal-scope #' + id.replace(/ /g, '')).val().length > 0;
            },
            HAS_DATE: function (id) {
                return $('.eesy__modal-scope #' + id.replace(/ /g, '') + ' .eesy_dateField').val().length > 0;
            },
            MUST_BE_CHECKED: function (id) {
                return $('.eesy__modal-scope input#' + id.replace(/ /g, '') + ':checked').length > 0;
            },
            HAS_SELECTION: function (id) {
                return $('.eesy__modal-scope #' + id.replace(/ /g, ''))[0].selectedIndex > 0;
            },
            HAS_FILE: function (id) {
                return $(`#${id}-files`).children().length > 0;
            },
        };

        var defaultValidators = {
            singleLineInput: validators.HAS_TEXT,
            multiLineInput: validators.HAS_TEXT,
            checkbox: validators.MUST_BE_CHECKED,
            dropdown: validators.HAS_SELECTION,
            date: validators.HAS_DATE,
            attachments: validators.HAS_FILE,
        };

        var fieldTemplates = {};

        // initialization

        $.each(fieldTemplatesList, function (i, fieldTemplate) {
            fieldTemplates[fieldTemplate.type] = fieldTemplate;
        });

        // functions

        function createTimesOfDay(beginHour, endHour, minuteOptions) {
            var res = [];
            for (var i = beginHour; i < endHour; i++) {
                for (var m = 0; m < minuteOptions.length; m++) {
                    res.push((i < 10 ? '0' : '') + i + ':' + minuteOptions[m]);
                }
            }
            return res;
        }

        function getCourseList(courseNames) {
            var coursesList = [];
            for (var i = 0; i < courseNames.length; i++) {
                coursesList.push({
                    name: 'course',
                    caption: language.LNG.SUPPORT_CENTER.MAIL.FIELD.COURSE + ': ',
                    value: courseNames[i],
                });
            }
            return coursesList;
        }

        function hasText(s) {
            return s != null && s.length > 0;
        }

        function getPrimaryProperties(activeCourse, user, hasCourse) {
            var primaryProperties = [];

            primaryProperties.push({
                name: 'from',
                caption: language.LNG.SUPPORT_CENTER.MAIL.FIELD.FROM,
                value: user.fullname,
            });

            if (hasText(user.firstName)) {
                primaryProperties.push({
                    name: 'firstName',
                    caption: language.LNG.SUPPORT_CENTER.MAIL.FIELD.FIRST_NAME,
                    value: user.firstName,
                });
            }

            if (hasText(user.middleName)) {
                primaryProperties.push({
                    name: 'middleName',
                    caption: language.LNG.SUPPORT_CENTER.MAIL.FIELD.MIDDLE_NAME,
                    value: user.middleName,
                });
            }

            if (hasText(user.lastName)) {
                primaryProperties.push({
                    name: 'lastName',
                    caption: language.LNG.SUPPORT_CENTER.MAIL.FIELD.LAST_NAME,
                    value: user.lastName,
                });
            }

            primaryProperties.push({
                name: 'userName',
                caption: language.LNG.SUPPORT_CENTER.MAIL.FIELD.USERNAME,
                value: user.name,
            });

            if (user.sis_id !== undefined && user.sis_id !== '') {
                primaryProperties.push({
                    name: 'sisId',
                    caption: language.LNG.SUPPORT_CENTER.MAIL.FIELD.SISID,
                    value: user.sis_id,
                });
            }

            primaryProperties.push({
                name: 'email',
                caption: language.LNG.SUPPORT_CENTER.MAIL.FIELD.EMAIL,
                value: user.email,
            });

            if (!var_uefMode) {
                primaryProperties.push({
                    name: 'url',
                    caption: language.LNG.SUPPORT_CENTER.MAIL.FIELD.MESSAGE_TRIGGERED_FROM,
                    value: window.location.href,
                });
            }

            if (hasCourse && activeCourse) {
                primaryProperties.push({
                    name: 'course_id',
                    caption: language.LNG.SUPPORT_CENTER.MAIL.FIELD.COURSE_ID,
                    value: activeCourse.course_id,
                });

                primaryProperties.push({
                    name: 'course-name',
                    caption: language.LNG.SUPPORT_CENTER.MAIL.FIELD.COURSE_NAME,
                    value: activeCourse.course_name,
                });
            }

            return primaryProperties;
        }

        function decorateField(field, categoryPath) {
            var decoratedField = $.extend({}, fieldTemplates[field.type], field);
            if (decoratedField.validatorKey) {
                decoratedField.validator = validators[decoratedField.validatorKey];
            }

            if (decoratedField.validator === undefined && decoratedField.is_mandatory === 'true') {
                decoratedField.validator = defaultValidators[decoratedField.type];
            }
            if (!decoratedField.id) {
                decoratedField.id = 'field-id-' + (Math.floor(Math.random() * 900000) + 100000);
            }
            if (decoratedField.setupMembers) {
                $.extend(decoratedField, decoratedField.setupMembers(decoratedField.id, categoryPath));
            }

            return decoratedField;
        }

        // public

        function decorateFields(fieldsFromService, categoryPath) {
            var allFields = [];

            $.each(fieldsFromService, function (i, field) {
                allFields.push(decorateField(field, categoryPath));
            });

            return allFields;
        }

        // export

        return {
            decorateFields: decorateFields,
        };
    }
);
