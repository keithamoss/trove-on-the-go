# trove-on-the-go

Because it's 2020 and I like responsive design

❤️ [Trove](https://trove.nla.gov.au)

# Development

## HTTPS

`.env.development` configures create-react-app to use HTTPS, but for that to work we need to generate some self-signed SSL certs for localhost.

```
brew install mkcert
mkcert -install
```

```
mkdir dev-certs && cd $_
mkcert localhost
```

Ref:

- [Using HTTPS in Development](https://create-react-app.dev/docs/using-https-in-development/#custom-ssl-certificate)
- [HTTPS In Development: A Practical Guide](https://marmelab.com/blog/2019/01/23/https-in-development.html)

## iPhone Simulation

```
/Applications/Xcode.app/Contents/Developer/Applications/Simulator.app/Contents/MacOS/Simulator -CurrentDeviceID 8528838E-4B47-4F0E-B415-E87F8C8A6163
```

https://stackoverflow.com/a/60790454
https://hdorgeval.gitbooks.io/setup-your-mac-to-develop-nativescript-apps/content/your-first-nativescript-project-with-angular-2.html

# Resources

## PWAs on iOS

https://firt.dev/ios-14/

## React Hooks

https://reactjs.org/docs/hooks-reference.html
https://adamrackis.dev/state-and-use-reducer/
https://www.robinwieruch.de/react-hooks-fetch-data
https://levelup.gitconnected.com/usetypescript-a-complete-guide-to-react-hooks-and-typescript-db1858d1fb9c

## Redux

https://redux-toolkit.js.org/introduction/quick-start

## Photo Galleries

https://codeburst.io/how-to-pure-css-masonry-layouts-a8ede07ba31a
https://medium.com/@colecodes/masonry-in-react-a-performance-hell-fb779f5fcebd

https://github.com/peterpalau/react-bnb-gallery/
https://github.com/neptunian/react-photo-gallery/
https://github.com/benhowell/react-grid-gallery
https://github.com/xiaolin/react-image-gallery/
