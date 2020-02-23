# Coding guidelines

The coding standards for the entire NGCP project is
[here](https://ngcp-calpoly.quip.com/0aJOAkm70ZzI/NGCP-Coding-Standards-and-Practices). **It is
required to read this if you are to contribute to GCS.**

Everything else discussed in this page talks about guidelines specific to GCS.

----------------------------------------------------------------------------------------------------

## Working with GCS

### Running GCS

To run GCS, you need to first install all the required package dependencies:

```bash
cd GCS
npm install
```

Then you can run the GCS by running this command:

```bash
npm run start
```

Once GCS is running, code changes you make will automatically be applied to GCS. There is no need
to re-run GCS (there are some special cases, such as installing new package dependencies).

### Building GCS

To make an executable version of GCS (an actual application), then you run the following command:

```bash
npm run build
```

This will create an executable application/installer on the `GCS/dist` folder. This application
depends on the operating system you are running.

### Testing GCS

To see if the code you have written for GCS works, you can perform the following actions:

 1. See if all the tests pass by running `npm run test`.
 2. Running GCS and seeing if the app runs properly.
 3. Building GCS and seeing if the executable runs properly.

----------------------------------------------------------------------------------------------------

## Managing GCS's version

The root of GCS's repository contains a file called `package.json`. That file has a `version` field,
which indicates GCS's version.

```json hl_lines="3"
{
  "name": "GCS",
  "version": "0.9.3",
  "license": "MIT",
  "author": "Northrop Grumman Collaboration Project",
  "description": "Ground Control Station for autonomous vehicle platforms in NGCP",
  "repository": "https://github.com/NGCP/GCS",
```

The `version` field is a string with the format "X.Y.Z". Here are the guidelines on how to update
them:

  - Update X if a major update happens. This happens when a really big update in GCS happens.

  - Update Y if a minor update happens. This happens when a change in GCS happens. This is usually
  the number to update if a minor feature is added.

  - Update Z if a patch update happens. This includes bug patches, small changes, and dependency
  package version bumps (usually from [Dependabot][])

!!! important "When to update version"
    **Always** update the package version for every pull request that is made. If package version is
    not updated, either update it or ask the person creating the pull request to update it.

----------------------------------------------------------------------------------------------------

## Updating GCS documentation

To run documentation locally on your computer, run the following command:

```bash
npm run docs
```

The documentation is hosted on your [localhost][].

[Airbnb's JavaScript style guide]: https://github.com/airbnb/javascript
[remark-lint]: https://github.com/remarkjs/remark-lint
[localhost]: http://localhost:8000/
[Dependabot]: https://dependabot.com/
