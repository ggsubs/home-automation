# Z-Way Home Automation Engine v1.0.0

## Links

Documentation: https://github.com/Z-Wave-Me/home-automation/wiki

Issues, bugs and feature requests are welcome: https://github.com/Z-Wave-Me/home-automation/issues

## Precompiling client-side templates

    $ cd /path/to/automationFolder
    $ nunjucks-precompile ./templates/ > ./htdocs/js/_templates.js


## Deployement

    $ scp main.js pi@192.168.1.4:/opt/z-way-server/automation/main.js
    $ ssh pi@192.168.1.4
    $ sudo /etc/init.d/Z-Way restart
    $ tail -f /var/log/Z-Way.log
