eesy.define('system-information', ['json!language-supportcenter'], function (language) {
    function cookiesEnabled() {
        document.cookie = 'testcookie=1';
        var cookieEnabled = '' + (document.cookie.indexOf('testcookie') != -1) ? true : false;

        document.cookie = 'testcookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC'; // delete the cookie

        return cookieEnabled;
    }

    function operatingSystem() {
        var nAgt = navigator.userAgent;
        var os = 'Unknown';
        if (nAgt == 'null') {
            return os;
        }

        var clientStrings = [
            { s: 'Windows 3.11', r: /Win16/ },
            { s: 'Windows 95', r: /(Windows 95|Win95|Windows_95)/ },
            { s: 'Windows ME', r: /(Win 9x 4.90|Windows ME)/ },
            { s: 'Windows 98', r: /(Windows 98|Win98)/ },
            { s: 'Windows CE', r: /Windows CE/ },
            { s: 'Windows 2000', r: /(Windows NT 5.0|Windows 2000)/ },
            { s: 'Windows XP', r: /(Windows NT 5.1|Windows XP)/ },
            { s: 'Windows Server 2003', r: /Windows NT 5.2/ },
            { s: 'Windows Vista', r: /Windows NT 6.0/ },
            { s: 'Windows 7', r: /(Windows 7|Windows NT 6.1)/ },
            { s: 'Windows 8.1', r: /(Windows 8.1|Windows NT 6.3)/ },
            { s: 'Windows 8', r: /(Windows 8|Windows NT 6.2)/ },
            { s: 'Windows 10', r: /(Windows 10|Windows NT 10)/ },
            { s: 'Windows NT 4.0', r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
            { s: 'Windows ME', r: /Windows ME/ },
            { s: 'Android', r: /Android/ },
            { s: 'Open BSD', r: /OpenBSD/ },
            { s: 'Sun OS', r: /SunOS/ },
            { s: 'Linux', r: /(Linux|X11)/ },
            { s: 'iOS', r: /(iPhone|iPad|iPod)/ },
            { s: 'Mac OS X', r: /Mac OS X/ },
            { s: 'Mac OS', r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
            { s: 'QNX', r: /QNX/ },
            { s: 'UNIX', r: /UNIX/ },
            { s: 'BeOS', r: /BeOS/ },
            { s: 'OS/2', r: /OS\/2/ },
            { s: 'Search Bot', r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/ },
        ];

        for (var id in clientStrings) {
            var cs = clientStrings[id];
            if (cs.r.test(nAgt)) {
                os = cs.s;
                break;
            }
        }

        var regexOsVersion;

        switch (os) {
            case 'Mac OS X':
                regexOsVersion = /Mac OS X ([\.\_\d]+)/.exec(nAgt);
                if (regexOsVersion) os += ' ' + regexOsVersion[1];
                else console.warn('Unable to find OS version.');
                break;

            case 'Android':
                regexOsVersion = /Android ([\.\_\d]+)/.exec(nAgt);
                if (regexOsVersion) os += ' ' + regexOsVersion[1];
                else console.warn('Unable to find OS version.');
                break;

            case 'iOS':
                var nVer = navigator.appVersion;
                regexOsVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                if (regexOsVersion)
                    os += ' ' + regexOsVersion[1] + '.' + regexOsVersion[2] + '.' + (regexOsVersion[3] | 0);
                else console.warn('Unable to find OS version.');
                break;
        }

        return os;
    }

    function screenSize() {
        if (screen.width) {
            var width = screen.width ? screen.width : '';
            var height = screen.height ? screen.height : '';
            return '' + width + ' x ' + height;
        }

        return 'Unknown';
    }

    function browserInformation() {
        var nAgt = navigator.userAgent;

        if (nAgt == 'null' || nAgt == '') {
            return 'Unknown';
        }

        var nameOffset, verOffset, ix;

        var browser;
        var version;

        if ((verOffset = nAgt.indexOf('Opera')) != -1) {
            browser = 'Opera';
            version = nAgt.substring(verOffset + 6);
            if ((verOffset = nAgt.indexOf('Version')) != -1) {
                version = nAgt.substring(verOffset + 8);
            }
        } else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
            browser = 'Microsoft Internet Explorer';
            version = nAgt.substring(verOffset + 5);
        } else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
            browser = 'Chrome';
            version = nAgt.substring(verOffset + 7);
        } else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
            browser = 'Safari';
            version = nAgt.substring(verOffset + 7);
            if ((verOffset = nAgt.indexOf('Version')) != -1) {
                version = nAgt.substring(verOffset + 8);
            }
        } else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
            browser = 'Firefox';
            version = nAgt.substring(verOffset + 8);
        } else if (nAgt.indexOf('Trident/') != -1) {
            // MSIE 11+
            browser = 'Microsoft Internet Explorer';
            version = nAgt.substring(nAgt.indexOf('rv:') + 3);
        } else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
            // Other browsers
            browser = nAgt.substring(nameOffset, verOffset);
            version = nAgt.substring(verOffset + 1);
            if (browser.toLowerCase() == browser.toUpperCase()) {
                browser = navigator.appName;
            }
        }

        // trim the version string
        if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
        if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
        if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);

        return browser + ' ' + version;
    }

    function getAllProperties() {
        var properties = [];

        properties.push({
            name: 'os',
            caption: language.LNG.SUPPORT_CENTER.MAIL.FIELD.OS,
            value: operatingSystem(),
        });

        properties.push({
            name: 'browser',
            caption: language.LNG.SUPPORT_CENTER.MAIL.FIELD.BROWSER,
            value: browserInformation(),
        });

        properties.push({
            name: 'cookies',
            caption: language.LNG.SUPPORT_CENTER.MAIL.FIELD.COOKIES,
            value: cookiesEnabled(),
        });

        properties.push({
            name: 'screenSize',
            caption: language.LNG.SUPPORT_CENTER.MAIL.FIELD.SCREEN_SIZE,
            value: screenSize(),
        });

        return properties;
    }

    return {
        getAllProperties,
    };
});
