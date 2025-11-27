Reconciliation service test bench v1.0
===================================

This web application can be used to access and play with the reconciliation services described in the [Reconciliation API specifications](https://github.com/reconciliation-api/specs).
It is meant to be a companion to the [W3C Entity Reconciliation Community Group](https://www.w3.org/community/reconciliation/).

This application is developed with React and calls to the reconciliation services are made directly from the browser.
It can be used at:
https://reconciliation-api.github.io/testbench/1.0



## Available Scripts

Before running these scripts, set up your project by running `npm install`.

In the project directory, you can then run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

### `npm run deploy`

Deploys the web app on GitHub Pages. It will become available at:

https://reconciliation-api.github.io/testbench/1.0/

Note: There is a redirect in the gh-pages branch that redirects https://reconciliation-api.github.io/testbench/ to https://reconciliation-api.github.io/testbench/0.2.  This redirect should always point to the lastest official version of the spec.

## Support for Test bench v0.2
The previous Reconciliation service test bench v0.2 is available at:
https://reconciliation-api.github.io/testbench/0.2

The code is maintained in branch `testbench-0.2`. From that branch the code may be maintained and  deployed using the same scripts. The files are deployed to the Github Pages subfolder testbench/0.2.