//@ts-check

import { classList, Data, HTML, on, properties, style } from "ui-io";
import contentView from "./contentView.js";
import settings from "./settings.js";
import toolbar from "./toolbar.js";

const { max, min } = Math;
const { div, iframe, button, dialog, canvas, input, a, label, p } = HTML(document);

function paragraphSplit(text) {
    return [
        ...new DOMParser()
            .parseFromString(text, "text/xml")
            .querySelectorAll("paragraph")
    ].map(paragraph => {
        console.log(paragraph.querySelector("img")?.getAttribute("src"));
        return {text: paragraph.textContent, image: paragraph.querySelector("img")?.getAttribute("src")};
    });
}

async function get(url) {
    let response = await fetch(url);
    if (!response.ok) throw new Error("Response error");
    return paragraphSplit(await response.text());
}

const hashParams = new URLSearchParams(location.hash.slice(1));
const token = hashParams.get("token") || sessionStorage.getItem("token");
if (token) {
    location.hash = '';
    sessionStorage.setItem("token", token);
}

const name = location.pathname.split("/").at(-2);

const wsLocation = new URL(`./${token}`, location);
wsLocation.protocol = wsLocation.protocol.replace("http", "ws");


const minimumReconnect = 5000;

let currentSocket = null;

const origin = Date.now();

const selectedLanguage$ = new Data();
const originalDocument$ = new Data(get(`./doc`)).asyncResult();
const translatedDocument$ = selectedLanguage$.to(
    language => language == 'EN'
        ? Promise.resolve(null)
        : get(`./doc/${language}`)
).asyncResult();

const paragraphCount$ = originalDocument$.to(paragraphs => paragraphs.length);

const online$ = new Data();
const state$ = new Data({index: 0});
const targetPosition$ = state$.to(({ index }) => index);
const currentPosition$ = new Data(0);
const broadcast$ = new Data(false);
const amAdmin$ = new Data(false);
const showSettings$ = new Data(true);

targetPosition$.log("target");

function send() {
    console.log("send?", broadcast$.get(), currentPosition$.get());
    if (broadcast$.get()) {
        currentSocket?.send(JSON.stringify({ type: "state", state: { index: currentPosition$.get() } }))
    }
}

currentPosition$.observe(window, send);
broadcast$.observe(window, send);


document.body.append(
    div(
        style({ display: showSettings$.if(null, "none") }),
        settings(name, token, amAdmin$, selectedLanguage$, showSettings$),

    ),
    div(
        style({ display: showSettings$.if("none", null) }),
        contentView(paragraphCount$, targetPosition$, currentPosition$, amAdmin$, originalDocument$, translatedDocument$),
        toolbar(targetPosition$, currentPosition$, paragraphCount$, showSettings$, online$, amAdmin$, broadcast$),
        
    ),
);

function connect() {
    let startTime = Date.now();
    let reconnecting = false;
    let socket = new WebSocket(wsLocation);

    function reconnect() {
        if (reconnecting) return;
        reconnecting = true;
        currentSocket = null;
        online$.set(false);
        setTimeout(connect, max(0, (startTime + minimumReconnect) - Date.now()));
    }

    console.log("connecting", Date.now() - origin);

    socket.addEventListener('open', (event) => {
        console.log("connected", Date.now() - origin);
        currentSocket = socket;
        online$.set(true);
    });

    socket.addEventListener('close', (event) => {
        reconnect();
        console.log("close");
    });

    socket.addEventListener('error', (event) => {
        reconnect();
        console.log("error");
    });

    socket.addEventListener('message', (event) => {
        //console.log("received", event.data);
        let message = JSON.parse(event.data);
        if (message.type == "state") {
            state$.set(message.state);
        }
        if (message.type == "admin") {
            amAdmin$.set(message.admin);
        }
    });
}

connect();



