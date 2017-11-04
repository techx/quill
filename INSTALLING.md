# Configuring HackUCI/quill for development

## Requirements
Regardless of operatiing system, developers need to download and install the latest version of [NodeJS](https://nodejs.org/en/)

**Note for Windows users:** you  will first need to download and install [Git](https://git-scm.com/)

**For all users**
```bash
git clone https://github.com/hackuci/quill.git
cd quill
```
At this point everything is downloaded onto your machine, now all that is left is to configure it

```bash
npm install
bower install
npm run config
```

The last command will create a .env file. This file contains values that will need to be replaced in order for you to test with full functionality

Run this command to start up the test server

```bash
gulp server
```

## Making Changes

See [here](https://github.com/hackuci/quill#customizing-for-your-event) for a breif overview on how to customise quill for our hackathon

### Pull Requests
All changes must come via a pull request.
**All pull requests must be made to hackuci/quill and not techx/quill**

All branches should be named as follows: name/feature (e.g. peter/new-logo)
