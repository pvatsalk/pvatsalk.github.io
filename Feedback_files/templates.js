(window.eesy ? eesy.define : define)(
    ['jquery-private', 'mustachejs', 'json!settings-supportcenter', 'json!language-supportcenter'],
    function ($, Mustache, settings, language) {
        var templates = {
            loadTemplates: loadTemplates,
        };

        function loadTemplates(templateDir, templateNames, onTemplatesLoaded) {
            var numLoaded = 0;

            $.each(templateNames, function (i, templateName) {
                $.get(templateDir + templateName + '.html', function (template) {
                    templates[templateName] = {
                        html: function (data) {
                            data.language = language;
                            data.settings = settings;
                            return Mustache.to_html(template, data);
                        },
                    };

                    if (++numLoaded === templateNames.length) {
                        onTemplatesLoaded();
                    }
                });
            });
        }

        return templates;
    }
);
