# redaxo-headless-deploy
This action allows the deployment of SPAs to REDAXO with the ["Headless" addon](https://github.com/jelleschutter/redaxo_headless).
## Support
I've currently only tested the action with a simple Vue.js v3 application however other frameworks also might work.
## Inputs
Name | Required | Default
--- | --- | ---
url | Yes | -
token | Yes | -
folder | No | "dist"
## Example
```yaml
name: Deployment

on:
  push:
    branches:
      - master

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v1
      - name: Installing NPM
        run: npm install
      - name: Build NPM
        run: npm run build
      - name: Deploy to REDAXO
        uses: jelleschutter/redaxo-headless-deploy@main
        with:
          url: https://headless.jelle.server4.bluemouse.ch
          token: ${{ secrets.HEADLESS_TOKEN }}
```