import { classList, Data, HTML, on, properties, style } from "ui-io";
import QRCode from "qrcode";
import checked from "./checked.js";
import { requestFullscreen } from "./fullscreen.js";

const { max, min } = Math;
const { div, iframe, button, dialog, canvas, input, a, label } = HTML(document);


let languages = {
    EN: "English",
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
    AR: "Arabic",
};

export default function settings(name, token, amAdmin$, selectedLanguage$, showSettings$) {
    const qrCanvas = canvas();
    const qrAdmin$ = new Data(false);

    const qrURL$ = Data.from(qrAdmin$, (admin) => {
        let hash = admin ? `#token=${token}` : '';
        let url = new URL(`.${hash}`, location);
        QRCode.toCanvas(qrCanvas, `${url}`, function (error) {
            if (error) console.error(error)
            console.log('success!');
        })
        style({ width: `min(80vh, 80vw)`, height: `min(80vh, 80vw)` })(qrCanvas);
        return url;
    });


    return div(
        style({
            overflow: "scroll",
            maxHeight: "100vh",
        }),
        div(
            style({ float: 'right' }),
            button(on('click', () => {
                showSettings$.set(false);
            }), "X")
        ),
        div(
            style({ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)',
            }),
            Object.entries(languages).map(([code, name]) =>
                button(
                    style({ margin: '8px', padding: '8px' }),
                    on('click', () => {
                        selectedLanguage$.set(code);
                        showSettings$.set(false);
                        requestFullscreen();
                    }),
                    name
                )
            )
        ),
        div(
            style({ textAlign: 'center' }),
            qrCanvas,
        ),
        a(
            style({ fontSize: '12px' }),
            properties({ href: qrURL$ }),
            qrURL$
        ),
        amAdmin$.if(
            div(label(input(checked(qrAdmin$)), "Admin"))
        ),
    );

}