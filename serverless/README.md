## Initial setup

# Serverless
Used [Fetch image from URL then upload to s3 Example](https://github.com/serverless/examples/tree/master/aws-node-fetch-file-and-store-in-s3) to bootstrap a new serverless install.
```
serverless install -u https://github.com/serverless/examples/tree/master/aws-node-fetch-file-and-store-in-s3 -n trove-on-the-go
```

Some prior art: [Dynamic image resizing with Node.js and Serverless framework](https://github.com/serverless/examples/tree/master/aws-node-dynamic-image-resizer)

# Development

## HTTPS

```
brew install mkcerts
mkcert -install

mkdir dev-certs
cd dev-certs
mkcert localhost
mv localhost-key.pem key.pem
mv localhost.pem cert.pem
```

## Commands
Start serverless using serverless-offline for faster local dev and hot reloading and mocking of AWS services:
```
yarn run start
```

Manually invoke the trove_result function:
```
yarn run invoke-local-trove_result
```

Deploy:
```
yarn run deploy-dev
yarn run deploy-prod
yarn run deploy-all-stages
```

Deploy and overwrite the trove_result function (NOT recommended - do a full deploy. Only use for quick testing in AWS-land):
```
yarn run deploy-dev-trove_result
```

Check out the logs:
```
yarn run logs-dev
yarn run logs-prod
```