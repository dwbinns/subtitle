import { classList, Data, HTML, on, properties, style } from "ui-io";
import { toggleFullscreen } from "./fullscreen.js";


const { max, min } = Math;
const { div, iframe, button, dialog, canvas, input, a, label } = HTML(document);

export default function toolbar(show$, current$, pageCount$, showSettings$, online$, amAdmin$, broadcast$) {
    function advance(delta) {
        show$.set(max(0, min((current$.get() || 0) + delta, pageCount$.get() - 1)));
    }

    let buttonStyle = style({ width: '60px', height: '60px', border: 'none', padding: 0, fontSize: '32px', background: 'none', textShadow: '0 0 3px #fff', color: '#000' });
    return div(
        style({
            position: 'fixed', top: '0', bottom: '0', right: '0', 
            display: 'flex', flexDirection: 'column', 
            fontSize: '20px', textAlign: 'center', textShadow: '0 0 3px #fff', color: '#000'
        }),
        //button(buttonStyle, on('click', () => advance(-1)), "▲"),
        button(buttonStyle, on('click', () => showSettings$.set(true)), "✸", style({ color: online$.if("#000", "#f00") })),
        
        //div(current$.to(page => page + 1), " / ", pageCount$),
        button(buttonStyle, on('click', toggleFullscreen), "⛶"),
        amAdmin$.if([
            button(buttonStyle, on('click', () => broadcast$.toggle()), "◉", style({ color: broadcast$.if("#f00", "#000") })),
        ]),
        div(style({ flexGrow: 1 })),
        //button(buttonStyle, on('click', () => advance(1)), "▼"),
    );
}
