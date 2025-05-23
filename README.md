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

The presenter opens:

http://localhost:8728/example/#token=controller

Participants follow the QR code to:

http://localhost:8728/example/

The presenter taps the third (circular) button at the top left, and then taps paragraphs on their device to scroll the participants devices to show the current paragraph.

# Deployment

```
npm run build
```

Then copy the files to an appropriate server, configure the DeepL api key there and run:

```
node server/index.js
```