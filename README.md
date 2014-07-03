Facebook Global ID (fb-global-id)
========

An Express-based WebService which uses PhantomJS to get the global Facebook user_id, as well as the global profile_url from an app-scoped user_id

####Installation

Installation is pretty simple. Just install PhantomJS as a prerequisite and clone the Repository in a new directory.

######Prerequisites 

NodeJS: http://nodejs.org/  
PhantomJS: http://phantomjs.org/  

######Project setup

1. git clone https://github.com/fb-tools/fb-global-id.git
2. npm install
3. Enter your FB credentials in app.js replacing the {FB_USERNAME} (email address) and {FB_PASSWORD} (password)
 
####Running

1. npm start
2. Access WebService by calling http://localhost:3333/getGlobalID?id={APP-SCOPED-ID}
3. Result will look like:

```
{"id":"123456789","app_scoped_id":"10203040506070","profile_url":"https://www.facebook.com/username","processing_time":1234}
```

Be aware that it can take around 1 second per call. Version 0.0.3 was optimized so that the login to Facebook is only done once with the application start.
