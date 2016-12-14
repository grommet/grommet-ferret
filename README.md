# Grommet Example App: Ferret

[![Build Status](https://api.travis-ci.org/grommet/grommet-ferret.svg)](https://travis-ci.org/grommet/grommet-ferret) [![Code Climate](https://codeclimate.com/github/grommet/grommet-ferret/badges/gpa.svg)](https://codeclimate.com/github/grommet/grommet-ferret)  [![Dependency Status](https://david-dm.org/grommet/grommet-ferret.svg)](https://david-dm.org/grommet/grommet-ferret)  [![devDependency Status](https://david-dm.org/grommet/grommet-ferret/dev-status.svg)](https://david-dm.org/grommet/grommet-ferret#info=devDependencies)

## Demo
[Live demo](http://ferret.grommet.io/) of an example application using grommet and grommet-index.

Login credentials: `Username` any string that looks like an email address and any `Password` (not used or stored).

## How To
This app demonstrates an application using [Modular Grommet](http://grommet.io/docs/develop/get-started).
We demonstrate UI routing and some important patterns like Login, Resource Management (including WebSocket connections), and Search. This application **must** have a back-end to perform login operations and manage resources.

**IMPORTANT**: Make sure to run `npm install` at Grommet root folder.

To run this application, execute the following commands:

  1. Install NPM modules
    ```
    $ cd grommet-ferret
    $ npm install
    ```
  2. Start the server

    ```
    $ cd server
    $ gulp dev
    ```

  3. Start the UI development server
    ```
    $ gulp dev
    ```

  4. Login credentials: `Username` any string that looks like an email address and any `Password` (not used or stored).

  5. Check Ferret production server
    ```
    $ cd grommet-ferret
    $ gulp dist
    $ node server/server.js
    ```
