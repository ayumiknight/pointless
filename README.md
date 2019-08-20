## Pointless
### www.point4.club and www.jvrlibrary.com code repository

### /Point4 A Wordpress google street view log site

#### /Point4/crawler
Two crawlers built for google.com and weirdgoogleearth.com, for crawling data
For weirdgoogleearth.com, data is crawled and encoded into xml, imported by wordpress using offical plugin
For google.com is crawled into json files, and imported into wordpress using /importHelper


#### /Point4/importHelper
json file importer for google.com json files. Because cover images and titles is missing in json, importer let you fill them, and upload complete data to wordpress
Implemented using client side react rendering, browser babel environemnt, Nodejs and Koa for data hosting, Wordpress XMLRPC client for uploading to wordpress


### /r18 A Japan VR film library ( Adult Content) 

#### /r18/koa
A webside rendering app using dot.js as template, Nodejs, Koa, Sequelize as data provider

#### /r18/sequelize
Mysql schemas for theh website, implements 1:n and n:m asoociations and defines paged query or single query methods or all models.

#### /r18/tasks
Nodejs Tasks for crawling and syncing new data into database, using axios for fetching and cheerio for doucment parsing.
