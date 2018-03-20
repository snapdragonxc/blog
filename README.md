# blog
### Description
**blog** is a content management system template for use as a personal blog website (an alternative to a static blog template). It was built using the following technologies:
- AngularJS
- UI-Router
- MongoDB
- Mongoose
- ExpressJS
- PrismJS (code highlight)
- Masonary (image layout)
- PassportJS (authentication)
- Bootstrap

### Design
PrismJS is used for the code highlighting of Javascript and HTML. Javascript code is distinguished from plain text by [codejs] ... [/codejs] blocks. HTML is distinguished by [code] ... [/code] blocks.

Masonary is used for the layout of the images on the front page.

### Styling
The front page styling, with an upside down navigation bar, was based on the [www.wix.com](https://www.wix.com), Graphic Design Portfolio template, previewed at:

[https://www.wix.com/demone2/graphic-design-portf](https://www.wix.com/demone2/graphic-design-portf)

The remainder of the styling is the default styling of Bootstrap.

### Installation
The website can be installed on a cloud service, such as Amazon AWS, or locally on a PC. It has been tested on an Amazon, 
AWS EC2 Ubuntu instance. 

To host on an EC2 instance use SSH to install an Nginx server, NodeJS, MongoDB, Certbot and a process manager such as 
[PM2](http://pm2.keymetrics.io/). Then clone a copy of the website and run: 

```
npm install
```
An example installation 'Setting up MERN Stack on AWS EC2', by Keith Weaver, is given in detail at medium at:

[https://medium.com/@Keithweaver_/setting-up-mern-stack-on-aws-ec2-6dc599be4737](https://medium.com/@Keithweaver_/setting-up-mern-stack-on-aws-ec2-6dc599be4737).

Note that this example installation uses a linux distribution version of MongoDB and does not include the official MongoDB 
installation, which is described at:

[https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)

Also note that MongoDB must be restarted in order for the database authentication to take effect. 


To install locally ensure that you have first installed NodeJS and MongoDB. Then use npm: 

```
npm install
```
### Running Locally
To run the website locally: 
```
npm start
```
and navigate to 'http:\localhost:8080' in your web browser
