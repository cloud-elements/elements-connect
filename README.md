# Element Loader and Element Connect
The Element Loader and Element Connect applications share the same source code, and application configuration controls if the application is used to load data from one service to another in bulk or keep data between any two services in sync with each other by leveraging Cloud Elements Formulas. The former use case is represented by Element Loader and the latter use case by Element Connect.

# License

Copyright 2015 Cloud Elements Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

# Setup

## Installation
* nodejs
 * `https://nodejs.org/download/`
* bower
 * `npm install -g bower`
* grunt
 * `npm install -g grunt-cli`

## Building the code
* add the following profiles to your `$HOME/.m2/settings.xml`:

```
        <profile>
            <id>elements-local</id>
            <properties>
                <environment>localhost</environment>
            </properties>
        </profile>
        <profile>
            <id>elements-snapshot</id>
            <properties>
                <environment>snapshot</environment>
            </properties>
        </profile>
        <profile>
            <id>elements-qa</id>
            <properties>
                <environment>qa</environment>
            </properties>
        </profile>
        <profile>
            <id>elements-staging</id>
            <properties>
                <environment>staging</environment>
            </properties>
        </profile>
        <profile>
            <id>elements-prod</id>
            <properties>
                <environment>api</environment>
            </properties>
        </profile>
```
* Execute the Maven target:
 * `mvn clean grunt:create-resources grunt:npm grunt:bower grunt:grunt -P elements-local`

## intelliJ IDEA Setup
* create bower components sym link:
   * `cd [PROJECT_HOME]/src/main/webapp`
   * `ln -s ../../../target-grunt/bower_components bower_components`
* import the project into Intelli-J. In IntelliJ, if you go to View -> Tool Windows -> Maven Projects, you should see
 `bulkloader.io` in your Maven Projects.
* setup `config.js` file: 
   * `cp [PROJECT_HOME]/target-grunt/webapp/scripts/config.js [PROJECT_HOME]/src/main/webapp/scripts/config.js`
   *  make sure the `elementsUrl` is set to point to the proper URL. For running locally, it should be `http://localhost:8080/elements/api-v2`.
* In a browser, go to `http://localhost:63342/bulkloader.io/src/main/webapp/index.html` (Note: `63342` is the default Intelli-J port and requires no run/debug configuration setup) 

## Application Setup
* Currently, the Cloud Elements Solutions team implements the applications for customers or assists customers to setup/implement the applications with their own use cases and branding.
* Once the application configuration is setup, to access the bulkloader application in your development environment via the intelliJ setup described above, please use the URL - `http://localhost:63342/bulkloader.io/src/main/webapp/index.html?key=<clientId>`
* You may also deploy the application to your own environment and provide your own URLs, which can be setup in the application configuration, for example, `https://me.mycompany.com`

## Importing a Specific Elements Connect Application
1. Get the existing Elements Connect app metadata for a customer's Elements Connect implementation by make a GET request to. 
`https://console.cloud-elements.com/elements/api-v2/applications/{appId}`.
2. Take the response body from the previous request and replace the following fields: 
    - `referrer` should become `http://localhost:63342/bulkloader.io/src/main/webapp/index.html?key={clientId}`.
    - All instances of `something.callbackUrl` should be replaced with `http://localhost:63342/bulkloader.io/callback`.
    - `company.id` should become `1`.
3. Send the modified body in a POST request to `http://localhost:8080/elements/api-v2/applications`. Soba must be 
running at this point. 
4. In a browser, visit the referrerUrl from the response body. IntelliJ should prompt you to copy an authorization Url
 to your clipboard. Copy it and paste it into the browser. You should arrive at the client's Elements Connect app.   
