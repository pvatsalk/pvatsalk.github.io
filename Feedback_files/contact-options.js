eesy.define(
    ['jquery-private', 'json!language-supportcenter', 'json!settings-supportcenter', 'mustachejs'],
    function ($, language, settings, Mustache) {
        var dashboardUrl;
        var sessionKey = undefined;

        var contactOptions = undefined;
        var contactOptionsById = {};

        var enabledOptions = undefined;
        var instanceTime = undefined;

        function childrenByType(type, nodeId, onResponse) {
            return $.get(
                dashboardUrl + '/rest/nodes/' + nodeId + '/children?type=' + type + '&sessionkey=' + sessionKey,
                onResponse
            );
        }

        function getAllContactOptions() {
            return contactOptionsById;
        }

        function readContactOptions(layoutNodeId, onDone) {
            childrenByType('contactoption', layoutNodeId, function (_contactOptions) {
                contactOptions = _contactOptions;

                var requests = [];

                $.each(contactOptions, function (i, o) {
                    contactOptionsById[o.id] = o;

                    requests.push(
                        childrenByType('enabled_weekly', o.id, function (enabledWeeklies) {
                            o.enabledWeeklies = enabledWeeklies;
                        })
                    );

                    requests.push(
                        childrenByType('disabled_period', o.id, function (disabledPeriods) {
                            o.disabledPeriods = disabledPeriods;
                        })
                    );
                });

                $.when.apply($, requests).done(function () {
                    onDone();
                });
            });
        }

        function init(_dashboardUrl, _sessionKey, layoutNodeId, onInitialized) {
            dashboardUrl = _dashboardUrl;
            sessionKey = _sessionKey;

            $.get(dashboardUrl + '/rest/instance/time', function (_instanceTime) {
                instanceTime = String(_instanceTime);
                readContactOptions(layoutNodeId, onInitialized);
            });
        }

        function initForNodeId(nodeId, onNodeInited) {
            $.get(
                dashboardUrl + '/rest/contactoptions/' + nodeId + '/enabledContactOptions?sessionkey=' + sessionKey,
                function (enabledIds) {
                    enabledOptions = [];
                    $.each(enabledIds, function (i, o) {
                        // check if the contact option exists for the user(might not have access to the option itself)
                        if (contactOptionsById[o.id]) {
                            enabledOptions.push(contactOptionsById[o.id]);
                        }
                    });

                    onNodeInited();
                }
            );
        }

        /**
         * Parses an eesy "stamp" string.
         * @return a Date object
         */
        function parseStamp(s) {
            return new Date(
                s.substring(0, 4),
                s.substring(4, 6) - 1,
                s.substring(6, 8),
                s.substring(8, 10),
                s.substring(10, 12),
                s.substring(12, 14)
            );
        }

        function zeroPad2(value) {
            return ('0' + value).slice(-2);
        }

        function isOpen(contactOption) {
            var result = isEmpty(contactOption.enabledWeeklies); // Default open if no weeklies defined
            var now = parseStamp(instanceTime);
            var dayOfWeekBase1 = ((now.getDay() + 6) % 7) + 1; // Monday is 1, etc.
            var timeOfDay24 = zeroPad2(now.getHours()) + zeroPad2(now.getMinutes());

            $.each(contactOption.enabledWeeklies, function (i, w) {
                if (
                    w.properties.day == dayOfWeekBase1 &&
                    timeOfDay24 >= w.properties.from &&
                    timeOfDay24 <= w.properties.to
                ) {
                    result = true; // --> is within enabled weekly
                }
            });

            $.each(contactOption.disabledPeriods, function (i, p) {
                if (true && now >= parseStamp(p.properties.from) && now <= parseStamp(p.properties.to)) {
                    result = false; // --> is within disabled period
                }
            });

            return result;
        }

        function isEmpty(arr) {
            return !arr.length;
        }

        function arrayContains(arr, fnMatches) {
            return !isEmpty($.grep(arr, fnMatches));
        }

        function hasChannel(channel) {
            return arrayContains(contactOptions, function (o) {
                return o.properties.method == channel;
            });
        }

        /*
         * "active" is supposed to mean both enabled and open.
         */
        function isChannelActive(channel) {
            return !isEmpty(getActiveContactOptions(channel));
        }

        function getEnabledContactOptions(channel) {
            if (enabledOptions == undefined) {
                return [];
            }
            return $.grep(enabledOptions, function (o) {
                return o.properties.method == channel;
            });
        }

        function getActiveContactOptions(channel) {
            return $.grep(getEnabledContactOptions(channel), function (o) {
                return isOpen(o);
            });
        }

        function formatTime(hhmm) {
            var d = new Date();
            d.setHours(hhmm.substring(0, 2));
            d.setMinutes(hhmm.substring(2, 4));
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        function formatDateTime(stamp) {
            return parseStamp(stamp).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' });
        }

        function getOpeningHoursText(contactOption) {
            var LNG = language.LNG.SUPPORT_CENTER.OPEN_HOURS;
            var text = Mustache.to_html(LNG.HEADER, { name: contactOption.properties.name }) + '\n';

            if (isEmpty(contactOption.enabledWeeklies)) {
                text += LNG.ALWAYS_OPEN + '\n';
            } else {
                text +=
                    $.map(contactOption.enabledWeeklies, function (w) {
                        return Mustache.to_html(LNG.WEEKDAY_OPEN, {
                            day: [LNG.MON, LNG.TUE, LNG.WED, LNG.THU, LNG.FRI, LNG.SAT, LNG.SUN][w.properties.day - 1],
                            from: formatTime(w.properties.from),
                            to: formatTime(w.properties.to),
                        });
                    }).join('\n') + '\n';
            }

            if (!isEmpty(contactOption.disabledPeriods)) {
                text += LNG.EXCEPT_HEADER + '\n';
                text +=
                    $.map(contactOption.disabledPeriods, function (p) {
                        return Mustache.to_html(LNG.EXCEPT_PERIOD, {
                            from: formatDateTime(p.properties.from),
                            to: formatDateTime(p.properties.to),
                        });
                    }).join('\n') + '\n';
            }

            return text;
        }

        function getOpeningHoursChannelText(channel) {
            return settings.SUPPORTCENTER.OPENING_HOURS.VISIBLE
                ? $.map(getEnabledContactOptions(channel), function (o) {
                      return getOpeningHoursText(o);
                  }).join('\n')
                : settings.SUPPORTCENTER.TOOLTIP.FIXED
                ? language.LNG.SUPPORT_CENTER.CONTACT.TOOLTIP //fixed title
                : channel.substr(0, 1).toUpperCase() + channel.substr(1); // display channel name
        }

        return {
            init,
            initForNodeId,
            hasChannel,
            isChannelActive,
            getEnabledContactOptions,
            getAllContactOptions,
            getActiveContactOptions,
            getOpeningHoursChannelText,
        };
    }
);
