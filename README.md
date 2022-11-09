# Zoom Apps Serverless Sample

This Zoom App sample uses Vue.js + Firebase to build a serverless Todo app that lives right in your Zoom Client

![image](https://user-images.githubusercontent.com/6127137/200740037-aa985d7e-38fd-4756-869d-b6482a337054.png)

## Prerequisites

1. [Node JS](https://nodejs.org/en/)
1. [Ngrok](https://ngrok.com/docs/getting-started)
1. [Firebase Account](https://firebase.google.com/)
1. [Zoom Account](https://support.zoom.us/hc/en-us/articles/207278726-Plan-Types-)
1. [Zoom App Credentials](#config:-app-credentials) (Instructions below)
    1. Client ID
    2. Client Secret
    3. Redirect URI

## Getting started

Open your terminal:

```bash
# Clone down this repository
git clone git@github.com/zoom/zoomapps-serverless-vuejs

# navigate into the cloned project directory
cd zoomapps-serverless-vuejs

# run NPM to install the app dependencies
npm install

# navigate to the Cloud Functions folder
cd functions

# install Cloud Function dependencies locally
npm install

# start the ngrok instance
ngrok http 5173
```

### Configuring Firebase

To use this codebase, make sure that you have created
a [Firebase Project](https://firebase.google.com/docs/projects/learn-more) that
has [hosting](https://firebase.google.com/docs/hosting), [firestore](https://firebase.google.com/docs/firestore), and
[cloud functions](https://firebase.google.com/docs/functions) enabled.

#### Firebase Config Object

In order to set up the source code with your project, make sure to replace the `firebaseConfig` object found in
the [firebase.config.js](firebase.config.js) file. You can find steps on obtaining the Firebase Config
Object [here](https://support.google.com/firebase/answer/7015592#web&zippy=%2Cin-this-article).

### Create your Zoom App

In your web browser, navigate to [Zoom Developer Portal](https://developers.zoom.us/) and register/log into your
developer account.

Click the "Build App" button at the top and choose to "Zoom Apps" application.

1. Name your app
2. Choose whether to list your app on the marketplace or not
3. Click "Create"

For more information, you can follow [this guide](https://marketplace.zoom.us/docs/beta-docs/zoom-apps/createazoomapp)
check out [this video series]() on how to create and configure these sample Zoom Apps.

### Config: App Credentials

In your terminal where you launched `ngrok`, find the `Forwarding` value and copy/paste that into the "Home URL" and
"Redirect URL for OAuth" fields.

When we're running this app in development mode, we'll be using local emulators that are accessed via a reverse-proxy
through our development server. This provides instant and more detailed debugging logs without having to deploy our
local changes.

This means that your Ngrok URL will also point to the path for a Firebase Local Emulator. What this means is that when
we start our local server, the emulator will indicate that your local functions emulator is
running at the following location (for example):

`http://locahost:5001/[project-id]/[region]/redirectURL`

When we start Ngrok, that means that these emulators will be available from our Ngrok instance. For that reason, our
OAuth redirect URL will be:

`https://[subdomain].ngrok.com/[project-id]/[region]/redirectURL`

Here's an example of what the Home and Redirect URLs would be. If you're unsure what the redirect URL should be you can
confirm the Local Emulator URLs when the application is started.

```
Home URL:               https://xxxxx.ngrok.io
Redirect URL for OAuth: https://xxxxx.ngrok.io/[project-id]/[region]/redirectURL
```

> NOTE: ngrok URLs under ngrok's Free plan are ephemeral, meaning they will only live for up to a couple hours at most,
> and will change every time you reinitialize the application. This will require you to update these fields every time
> you
> restart your ngrok service.

#### Production

When it comes to running in production, the Home URL is set to the Firebase hosting URL that you have for your project.
Similarly, the Redirect URL is the cloud function URL that is assigned to the `redirectURL` function when you deploy
your app.

For this reason, when you deploy your app for the first time you will want to deploy the functions first so that you can
configure the deployed cloud function Redirect URL with your Zoom App.

#### OAuth allow list

- `https://xxxxx.ngrok.io/[project-id]/[region]/redirectURL`
- `https://[region]-[project-id].cloudfunctions.net/redirectURL`

#### Domain allow list

- `ngrok.io`
- `fonts.googleapis.com`
- `[region]-[project-id].cloudfunctions.net`

### Config: Information

The following information is required to activate your application:

- Basic Information
    - App name
    - Short description
    - Long description (entering a short message here is fine for now)
- Developer Contact Information
    - Name
    - Email address

> NOTE: if you intend to publish your application on the Zoom Apps Marketplace, more information will be required in
> this section before submitting.

### Config: App Features

Under the Zoom App SDK section, click the `+ Add APIs` button and enable the following options from their respective
sections:

#### APIs

- `getMeetingUUID`
- `getUserContext`

### Scopes

Select the following OAuth scopes from the Scopes tab:

- `zoomapp:inmeeting`

### Config Environment

When you install dependencies in the [functions](functions) directory, three files are created: .env, .env.local and
.secret.local

The .env and .env.local files are for storing the Redirect URL that your application uses in production and development
environments respectively.

When you first start the app, ensure these fields are populated with the Redirect URL that you use for each environment

#### .secret.local

The .secret.local file is used only for development and is meant to contain your Client ID and Client Secret for your
Zoom App.

When in production, you should be using the [Google Cloud Secret Manager](https://cloud.google.com/secret-manager) to set the secrets used by
your project.

#### Zoom for Government

If you are a [Zoom for Government (ZfG)](https://www.zoomgov.com/) customer you can use the `ZM_HOST` variable to change
the base URL used for Zoom. This will allow you to adjust to the different Marketplace and API Base URLs used by ZfG
customers.

**Marketplace URL:** marketplace.*zoomgov.com*

**API Base URL:** api.*zoomgov.com*

## Start the App

### Development

Run the `dev` npm script to start running the app in development mode

```shell
npm run dev
```

### Production
Running in production is as simple as deploying your changes to firebase and ensuring that your Zoom App is using the production firebase URLS:

```shell
npm run deploy
```

## Usage

To install the Zoom App, Navigate to the **Home Page URL** that you set in your browser and click the link to install.

After you authorize the app, Zoom will automatically open the app within the client.

## Contribution

Please send pull requests and issues to this project for any problems or suggestions that you have!

Make sure that you install packages locally to pass pre-commit git hooks.

### Keeping secrets secret

This application makes use of your Zoom App Client ID and Client Secret as well as a custom secret for signing session
cookies. During development, the application will read from the .secret.local file.

In order to align with security best practices, this application does not read from the .secret.local file in production mode.

> :warning: **Never commit your .secret.local file to version control:** The file likely contains Zoom App Credentials and
> Session Secrets

### Code Style

This project uses [prettier](https://prettier.io/) and [eslint](https://eslint.org/) to enforce style and protect
against coding errors along with a pre-commit git hook(s) via [husky](https://typicode.github.io/husky/#/) to ensure
files pass checks prior to commit.

### Testing

At this time there are no e2e or unit tests.

## Need help?

If you're looking for help, try [Developer Support](https://devsupport.zoom.us) or
our [Developer Forum](https://devforum.zoom.us). Priority support is also available
with [Premier Developer Support](https://zoom.us/docs/en-us/developer-support-plans.html) plans.
