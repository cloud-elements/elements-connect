# bulkloader.io
Bulk loader application

# setup

## install
* nodejs
 * `https://nodejs.org/download/`
* bower
 * `npm install -g bower`
* grunt
 * `npm install -g grunt-cli`

## building
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

## intelli-j setup
* create bower components sym link:
 * `cd [PROJECT_HOME]/src/main/webapp`
 * `ln -s ../../../target-grunt/bower_components bower_components`
* import the project into Intelli-J
* setup `config.js` file: 
 * `cp [PROJECT_HOME]/target-grunt/webapp/scripts/config.js [PROJECT_HOME]/src/main/webapp/scripts/config.js`
 *  make sure the `elementsUrl` is set to point to the proper URL
 *  Don't checkin this file, this is only for project to get running on intelli-j
* In a browser, go to `http://localhost:63342/bulkloader.io/src/main/webapp/index.html` (Note: `63342` is the default Intelli-J port and requires no run/debug configuration setup) 

## app setup
#### Setting up a Bulkloader Application for Hubspot
* create a user and note the `companyId` for the user
* download the POSTMAN collection `https://www.getpostman.com/collections/7233df2896ca1eac0990` for setting up Hubspot Bulkloader in your dev environment. 
* in the JSON body change the below details:
 * `companyId` to the newly created `companyId`
 * change the API keys or secrets and callback URLs to your local
 * change the elements local URL to point to your local environment  
 * change the name of the application to the name you want, this is just for easy readability
 * change the referrer to the URL which your bulkloader is running. This plays a critical role in loading your configuration on UI
* to access the bulkloader Hubspot application your URL will be same as your referrer, ex `http://localhost:63342/bulkloader.io/src/main/webapp/index.html?key=hubspot`
