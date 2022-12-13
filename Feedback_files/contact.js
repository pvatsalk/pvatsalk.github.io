eesy.define(['jquery-private', 'sessionInfo', 'utils'], function ($, sessionInfo, utils) {
    return {
        setupForm: function () {
            function sendFile(file, onSuccess) {
                $.ajax({
                    type: 'post',
                    url: sessionInfo.dashboardUrl() + '/uploader?json=true&filename=' + file.name + '&fileid=-1',
                    data: file,
                    success: onSuccess,
                    processData: false,
                    contentType: file.type,
                });
            }

            (function () {
                'use strict';

                var $dataForm = $('[data-form-contact]');

                if ($dataForm.length > 0) {
                    $dataForm.find('[data-form-contact-hide]').hide();

                    utils.replaceLiveHandler(
                        'click.contactform',
                        '.selector__option:not(.___is-disabled)',
                        function () {
                            $dataForm.find('[data-form-contact-hide]').show();
                            $dataForm.find('input, textarea').prop('disabled', false);

                            $('body').on('click', '.form__submit input', function () {
                                //$dataForm.hide();
                                //$('.form__send').show();
                            });

                            $('body').off('click.contactform');
                        }
                    );

                    utils.replaceLiveHandler('change', '.form__upload', function (evt) {
                        var files = evt.target.files;

                        for (var i = 0; i < files.length; i++) {
                            let file = files[i];

                            let fileDOM =
                                '<div data-filename="' +
                                file.name +
                                '" class="file__upload__file __in_progress">' +
                                file.name +
                                '<div class="file__upload__remove-file"></div></div>';
                            const $fileList = $(`#${evt.target.id}-files`);
                            if ($fileList.hasClass('form__upload__files_single')) {
                                $fileList.html(fileDOM);
                            } else {
                                $fileList.append(fileDOM);
                            }

                            sendFile(file, function (response) {
                                $('[data-filename="' + file.name + '"]')
                                    .removeClass('__in_progress')
                                    .attr('data-fileid', response.guid);
                            });
                        }
                    });

                    utils.replaceLiveHandler('click', '.file__upload__remove-file', function (event) {
                        let $this = $(this);
                        $this.parent().remove();
                    });
                }
            })();
        },
    };
});
