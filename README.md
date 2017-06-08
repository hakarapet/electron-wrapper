# electron-wrapper

**Description**

Simple electron wrapper for creating desktop application.
Possibly can wrap as an external, as an internal applications.\
The project is created as a boilerplate for future applications.
So feel free to grab and play arround with it.\
Application is capable of packing and building and installable file.
At this moment pakcing and building only for\
Windows OS (creating setup installable file for Windows OS only).

To try out the application simply follow these steps:
- git clone https://github.com/hakarapet/electron-wrapper.git
- npm install
- npm run

These steps are enough to have the application running on your machine. (Tested on MacOS and Linux actually).

To create installable file for windows, you must run\
`npm run build:win`\
To create installable file for macos, you must run\
`npm run build:mac`\
To create installable file for both operating systems at once, you must run\
`npm run build:all`

_Notice: all builds are going to be 64 bit._

The application has a functionality of detecting newer versions of itself and updating to them.\
By default the build application is sending a GET request to a host, which is configured in __package.json__ file as\
`publish.provider`

By the default it is set to `127.0.0.1:9090`.\
When the new builds are made a folder called __dist__ is created.\
Make that folder acceptable from outside (_python -m SimpleHTTPServer 9090 is ideal for this cases_) or use your Appache server\
or anything else, so that application could make GET request to that url and see if there is an update. In case of newer version,\
application will notify with and dialogue box saying that there is a newer version and that it is going to be downloaded and installed.

The application has two envionments:
- *production* - this shows the google.com
- *development* - this shows example.com

According to the environment a differet url will be loaded.

Testing is provided in __test__ folder.\
To run tests run command:\
`npm test`

**Licence**

_MIT_

