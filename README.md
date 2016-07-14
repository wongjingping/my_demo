# Demo Tracker

This web application allows you to track your demos in a single-page application. The schema can be changed but is currently configured and named for data-analytics-related stuff.



## Dependencies

 - [NodeJS](https://nodejs.org/en/)
 - [MongoDB](https://www.mongodb.com/)
   - `mongod` to start the mongo daemon
   - you can use `mongoimport -d db_demo -c c_demo --file=data/sample.json` to import your json file into the specified database and collection
 - `npm install` should install all necessary nodeJS packages
 - `bower install` should install all necessary front-end components

Type `node server`, point your browser to localhost:3000 and you should see something like this:


![Screenshot with 2 demos in my list](https://raw.githubusercontent.com/wongjingping/my_demo/master/public/static/imgs/screenshot.png "Screenshot with 2 demos in my list")

