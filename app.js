var express = require('express');
var phantom = require('phantom');
var http = require('http');

var app = express();
app.set('port', process.env.PORT || 3333);

var globalPage = null;
var globalResponse = null;
var globalAppScopedId = null;
var globalStartTimestamp = null;

app.use('/getGlobalID', function(req, res){

    globalAppScopedId = req.query.id;
    globalStartTimestamp = new Date().getTime();

    globalPage.open("https://www.facebook.com/app_scoped_user_id/" + globalAppScopedId + "/", function (status) {

        if (status === "success") {

            globalResponse = res;

        } else {

            res.send(500, {
                id: null,
                app_scoped_id: globalAppScopedId,
                profile_url: null,
                processing_time: ((new Date().getTime())-globalStartTimestamp),
                status: status
            });

        }

    });

});

var server = app.listen(app.get('port'), function() {

    console.log('Express server listening on port ' + server.address().port);

    phantom.create(function (ph) {

        ph.createPage(function (page) {

            globalPage = page;

            globalPage.set('onUrlChanged', function() {

                globalPage.evaluate(function () {
                    return document.URL;
                }, function (url) {

                    if (url.indexOf("https://www.facebook.com/login.php") === -1 && url.indexOf("https://www.facebook.com/app_scoped_user_id") === -1 && url.indexOf("https://www.facebook.com/?sk=welcome") === -1) {

                        http.get("http://graph.facebook.com/?id="+url, function(response) {
                            var body = '';

                            response.on('data', function(chunk) {
                                body += chunk;
                            });

                            response.on('end', function() {

                                globalResponse.send(200, {
                                    id: JSON.parse(body).id,
                                    app_scoped_id: globalAppScopedId,
                                    profile_url: url,
                                    processing_time: ((new Date().getTime())-globalStartTimestamp),
                                    status: 'success'
                                });

                            });
                        }).on('error', function(e) {

                            console.log("Got error: " + e.message);

                            if (globalResponse) {
                                globalResponse.send(500, {
                                    id: null,
                                    app_scoped_id: globalAppScopedId,
                                    profile_url: null,
                                    processing_time: ((new Date().getTime())-globalStartTimestamp),
                                    status: 'error'
                                });
                            }

                        });

                    }

                });

            });

            globalPage.open("https://www.facebook.com/login.php", function (status) {

                if (status === "success") {

                    console.log("Got login page loaded");

                    globalPage.evaluate(function() {
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
