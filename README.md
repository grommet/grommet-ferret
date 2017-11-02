# Grommet Example App: Ferret

[![Build Status](https://api.travis-ci.org/grommet/grommet-ferret.svg)](https://travis-ci.org/grommet/grommet-ferret) [![Code Climate](https://codeclimate.com/github/grommet/grommet-ferret/badges/gpa.svg)](https://codeclimate.com/github/grommet/grommet-ferret)  [![Dependency Status](https://david-dm.org/grommet/grommet-ferret.svg)](https://david-dm.org/grommet/grommet-ferret)  [![devDependency Status](https://david-dm.org/grommet/grommet-ferret/dev-status.svg)](https://david-dm.org/grommet/grommet-ferret#info=devDependencies)

## Demo
[Live demo](http://ferret.grommet.io/) of an example application using grommet and grommet-addons.

**Login credentials:**

`Username` - enter any string that looks like an email address

`Password` - enter any string (it is not used or stored anywhere)

## How To
This app demonstrates an application using [Grommet](http://grommet.io/docs/get-started).
We demonstrate UI routing and some important patterns like Login, Resource Management (including WebSocket connections), and Search. 

This application **must** have back-end data to perform login operations and manage resources.
By default, it provides mock backend data. The application can also be modified to point to a
real backend server.

**IMPORTANT**: Be sure to run `npm install` and the remaining commands in the grommet-ferret folder.

To run this application, execute the following commands:

  1. Go to the grommet-ferret folder
```
    $ cd grommet-ferret
```
  2. Install NPM modules
```
    $ npm install
```  
  3. Create the NPM distribution
```
    $ npm run build

    This step will create the **dist** folder with content ready to be deployed in NPM.
```

  4. Start Ferret in production mode 
```
    $ npm run start

    This step will start a front-end dev server that provides mock backend data by default. 
```
  5. Start Ferret in development mode
```
    $ npm run start:dev

    This step will also start a front-end dev server that provides mock backend data by default.  
    Additionally, it also monitors the source code and restarts the server when any changes are 
    detected.
```

  **NOTE:** - if prompted for Login Credentials in your development environment, see information in the Demo section above.


