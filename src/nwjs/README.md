# Ferret Windows App

To run build the NWJS binary version of this application, execute the following commands:

  1. Create a build directory, such as `c:\build`

  2. Checkout the Ferret source into the `c:\build` directory

  3. Rename the base source directory from `grommet-ferret` to `ferret`

  4. Download NWJS binaries from http://dl.nwjs.io/v0.12.3/nwjs-v0.12.3-win-x64.zip

  5. Extract the NWJS binaries to `c:\build`

  6. Copy `ferret\src\nwjs\package.json` to `c:\build`

  7. From the `c:\build\ferret` directory, `npm install`

  8. From the `c:\build\ferret` directory, `gulp dist`

  9. Test the application by running `c:\build\nw.exe`

  10. Delete the `c:\build\ferret\src` directory

  11. Delete the `c:\build\ferret\.git` directory

  12. Delete the *files* (not directories) in `c:\build\ferret` such as .babelrc

  13. Zip the contents of the `c:\build\` directory
