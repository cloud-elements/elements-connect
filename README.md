# Element Loader and Element Connect
The Element Loader and Element Connect applications share the same source code, and application configuration controls if the application is used to load data from one service to another in bulk or keep data between any two services in sync with each other by leveraging Cloud Elements Formulas. The former use case is represented by Element Loader and the latter use case by Element Connect.

# License

Copyright 2015 Cloud Elements Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    (http://www.apache.org/licenses/LICENSE-2.0)

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
* import the project into Intelli-J
* setup `config.js` file: 
 * `cp [PROJECT_HOME]/target-grunt/webapp/scripts/config.js [PROJECT_HOME]/src/main/webapp/scripts/config.js`
 *  make sure the `elementsUrl` is set to point to the proper URL
* In a browser, go to `http://localhost:63342/bulkloader.io/src/main/webapp/index.html` (Note: `63342` is the default Intelli-J port and requires no run/debug configuration setup) 

## Application Setup
* Currently, the Cloud Elements Solutions team implements the applications for customers or assists customers to setup/implement the applications with their own use cases and branding.
* Once the application configuration is setup, to access the bulkloader application in your development environment via the intelliJ setup described above, please use the URL - `http://localhost:63342/bulkloader.io/src/main/webapp/index.html?key=<clientId>`
* You may also deploy the application to your own environment and provide your own URLs, which can be setup in the application configuration, for example, `https://me.mycompany.com`
