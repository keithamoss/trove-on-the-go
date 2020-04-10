# Getting started

https://github.com/serverless/examples/tree/master/aws-node-fetch-file-and-store-in-s3
```
serverless install -u https://github.com/serverless/examples/tree/master/aws-node-fetch-file-and-store-in-s3 -n trove-on-the-go
```

```
brew install mkcerts
mkcert -install

mkdir dev-certs
cd dev-certs
mkcert localhost
mv localhost-key.pem key.pem
mv localhost.pem cert.pem
```

```
yarn run start
```

```
yarn run invoke-local-trove_result
```

```
yarn run deploy-dev
yarn run deploy-dev-trove_result
yarn run deploy-prod
```

```
yarn run logs-dev
yarn run logs-prod
```

```json
{
  "Version":"2012-10-17",
  "Statement":[
    {
      "Sid":"PublicRead",
      "Effect":"Allow",
      "Principal": "*",
      "Action":["s3:GetObject"],
      "Resource":["arn:aws:s3:::trove-on-the-go/photos/*"]
    }
  ]
}
```

# RTYI

- https://github.com/serverless/serverless/blob/master/lib/plugins/create/templates/aws-nodejs-typescript/package.json
- https://github.com/serverless/examples/tree/master/aws-node-dynamic-image-resizer
