## Subtitle

Provide machine translated subtitles for talks, taking a script for the talk as input.

# Prerequisites

Obtain a DeepL api key (the free plan is suitable for initial use):
```
export DEEPL_KEY=<deepl-api-key-here>
```

# Installation

```
npm install
```

# Usage

```
mkdir data
mkdir data/example
cp example.xml data/example/text.xml
cp example-config.json data/example/config.json
npm start
```

[http://localhost:8728/example/#token=controller]

(NB: the final slash is required)

# Deployment

```
npm run build
```

Then copy the files to an appropriate server, configure the DeepL api key there and run:

```
node server/index.js
```