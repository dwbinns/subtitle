//@ts-check
import { WebSocketServer } from "ws";
import FileServer from "fs-serve";
import AutoMap from "auto-creating-map";
import http from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Translator } from 'deepl-node';

const [port = "8728"] = process.argv.slice(2);

// DEEPL_KEY
const deeplKey = process.env.DEEPL_KEY;

if (!deeplKey) {
    console.log("Obtain a DeepL api key:")
    console.log("export DEEPL_KEY=<deepl-api-key-here>");
    process.exit(1);
}

const translator = new Translator(deeplKey);

let languages = {
    AR: "Arabic",
    BG: "Bulgarian",
    CS: "Czech",
    DA: "Danish",
    DE: "German",
    EL: "Greek",
    ES: "Spanish",
    ET: "Estonian",
    FI: "Finnish",
    FR: "French",
    HU: "Hungarian",
    ID: "Indonesian",
    IT: "Italian",
    JA: "Japanese",
    KO: "Korean",
    LT: "Lithuanian",
    LV: "Latvian",
    NB: "Norwegian (Bokmål)",
    NL: "Dutch",
    PL: "Polish",
    "PT-BR": "Portuguese (Brazilian)",
    "PT-PT": "Portuguese",
    RO: "Romanian",
    RU: "Russian",
    SK: "Slovak",
    SL: "Slovenian",
    SV: "Swedish",
    TR: "Turkish",
    UK: "Ukrainian",
    ZH: "Chinese",
};

class Session {
    sockets = [];
    state = {};

    constructor(path, name, token, sourceLanguage) {
        this.token = token;
        this.name = name;
        this.path = path;
        this.sourceLanguage = sourceLanguage;
    }

    broadcast(message) {
        this.sockets.forEach(s => s.send(JSON.stringify(message)));
    }

    addSocket(socket, token) {
        let admin = token == this.token;
        this.sockets.push(socket);
        socket.on('close', () => this.sockets = this.sockets.filter(s => socket != s));
        socket.on('message', data => {
            if (admin) {
                let message = JSON.parse(data);
                if (message.type == "state") {
                    this.state = message.state;
                    this.broadcast({ type: "state", state: this.state });
                }
            }
        });
        socket.send(JSON.stringify({ type: "admin", admin }));
        socket.send(JSON.stringify({ type: "state", state: this.state }));
    }

    async translate(language) {
        let original = await readFile(join(this.path, "text.xml"), {encoding: "utf8"});
        if (!language) {
            return original;
        }
        if (!languages[language]) throw new Error("Unknown language");

        let languagePath = join(this.path, language + ".xml");
        let result = await readFile(languagePath).catch(e => e.code == "ENOENT" ? null : Promise.reject(e));
        if (result == null) {
            console.log("Sending text to be translated", this.sourceLanguage, "->", language);
            result = (await translator.translateText(original, this.sourceLanguage, language, { 
                tagHandling: 'xml',
                outlineDetection: false,
                splittingTags: ["paragraph"]
            })).text;

            await writeFile(languagePath, result, {encoding: "utf8"});
        }

        return result;
    }

    static async get(name) {
        if (!name.match(/^[a-z0-9]+$/)) throw new Error("Invalid name");
        let path = join("data", name);
        let {token, sourceLanguage} = JSON.parse(await readFile(join(path, "config.json"), {encoding: "utf8"}));
        return new Session(path, name, token, sourceLanguage);
    }
}

const sessions = new AutoMap(name => Session.get(name));

async function getSession(name) {
    return await sessions.get(name);
}


const staticContent = new FileServer('dist');
const dataContent = new FileServer('data');

const server = http.createServer(async (request, response) => {
    let parts = request.url?.split("/") || [];
    if (parts[2] == "doc") {
        try {
            let session = await getSession(parts[1]);
            response.setHeader("Content-type", "text/xml");
            response.write(await session.translate(parts[3]));
            response.end();
        } catch (e) {
            response.statusCode = 500;
            response.write(`${e}`);
            response.end();
        }

        // request.url = `/${request.url.split("/").slice(2).join("/")}`;
        // dataContent.serve(request, response);
    } else if (parts.length <= 3) {
        staticContent.serve(request, response);
    } else if (parts.length >= 4 && parts.every(p => !p.startsWith("."))) {
        dataContent.serve(request, response);
    } else {
        response.statusCode = 404;
        response.end();
    }
});

const socketServer = new WebSocketServer({ server });
socketServer.on('connection', async (socket, request) => {
    console.log("connect", request.url);
    try {
        let parts = request.url?.split("/") || [];
        (await getSession(parts[1])).addSocket(socket, parts[2]);
    } catch (e) {
        console.log("Socket connection error", e);
    }
});

server.listen(Number(port));

console.log(`http://localhost:${port}`);
