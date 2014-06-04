var express = require('express');
var phantom = require('phantom');
var http = require('http');

var app = express();
app.set('port', process.env.PORT || 3333);

app.use('/getGlobalID', function(req, res){

    var app_scoped_id = req.query.id;
    var start_timestamp = new Date().getTime();

    phantom.create(function (ph) {

        ph.createPage(function (page) {

            page.set('onUrlChanged', function() {

                page.evaluate(function () {
                    return document.URL;
                }, function (url) {

                    if (url.indexOf("https://www.facebook.com/login.php") === -1 && url.indexOf("https://www.facebook.com/app_scoped_user_id") === -1) {

                        http.get("http://graph.facebook.com/?id="+url, function(response) {
                            var body = '';

                            response.on('data', function(chunk) {
                                body += chunk;
                            });

                            response.on('end', function() {

                                var end_timestamp = new Date().getTime();

                                res.send(200, {
                                    id: JSON.parse(body).id,
                                    app_scoped_id: app_scoped_id,
                                    profile_url: url,
                                    processing_time: (end_timestamp-start_timestamp)
                                });

                            });
                        }).on('error', function(e) {
                                console.log("Got error: " + e.message);
                        });

                        setTimeout(function() {
                            ph.exit();
                        }, 10);

                    }

                });

            });

            page.open("https://www.facebook.com/login.php?next=https%3A%2F%2Fwww.facebook.com%2Fapp_scoped_user_id%2F" + app_scoped_id + "%2F", function (status) {

                if (status === "success") {

                    page.evaluate(function() {
                        document.getElementById("email").value = "{FB_USERNAME}";
                        document.getElementById("pass").value = "{FB_PASSWORD}";
                        document.getElementById("u_0_1").click();
                    });

                }

            });
        });
    }, {
        dnodeOpts: {
            weak: false
        }
    });

});

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});
