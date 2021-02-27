# Social Bot

## Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Usage](#usage)
- [Contributing](../CONTRIBUTING.md)

## About <a name = "about"></a>

A mess of callback functions to repost Google Photos uploads to Facebook

## Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [deployment](#deployment) for notes on how to deploy the project on a live system.

### Prerequisites

1. Either Docker or npm
2. [Google Photos](https://console.developers.google.com/apis/api/photoslibrary.googleapis.com) credentials and Google API key
3. A [Facebook API key](https://developers.facebook.com/docs/facebook-login/access-tokens/)

### Installing

Create a .env file in the project root with:

```
INTERVAL=
PORT=
# Google settings
CLIENT_ID=
CLIENT_SECRET=
CALLBACK_URL=http://localhost:????/callback
API_KEY=

# Facebook settings
FACEBOOK_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CALLBACK_URL=http://localhost:????/facebook
FACEBOOK_PAGE_ID= #Page to post to, must be editable by logged in account

# Optional settings
FACEBOOK_STATE= #For increased security when authenticating with Facebook
FILE_PATH= #File to use to backup, defaults to ./pictures.json
ALBUM_NAME= #Album name to pull from Google Photos
```

Building from Docker:

```
docker run -p 8080:8080 `docker build . -q`
```

Running using npm:

```
npm start
```

Go to `http://localhost:(port)` to authenticate with Google and then Facebook