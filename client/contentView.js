
import { classList, HTML, style, on, Data, attr } from "ui-io";
import ScrollControl from "./ScrollControl.js";

const { div, p, img } = HTML(document);

function range(length, map = i => i) {
    return [...new Array(length)].map((_, index) => map(index));
}

export default function (count$, target$, current$, admin$, originalDocument$, translatedDocument$) {

    let scrollControl = new ScrollControl(target$, admin$);


    return div(
        style({ display: 'flex', overflow: 'scroll', flexDirection: 'column', height: '100vh', userSelect: 'none' }),
        classList('noScrollBars'),
        div(style({minHeight: '50px'})),
        count$.to(pageCount =>
            range(pageCount, index =>
                div(
                    on('click', () => current$.set(index)),
                    scrollControl.attach(index),
                    div(
                        style({
                            opacity: Data.from(target$, admin$, (show, admin) => show == index ? 1 : show < index && !admin ? 0 : 1),
                        }),
                        img(attr({src: originalDocument$.to(doc => doc?.[index].image)}))
                    ),
                    div(
                        style({
                            opacity: Data.from(target$, admin$, (show, admin) => show == index ? 1 : show < index && !admin ? 0.5 : 1),
                        }),
                        p(
                            style({ color: '#ffc' }),
                            originalDocument$.to(doc => doc?.[index].text),
                        ),
                        p(
                            style({ color: '#fcf' }),
                            translatedDocument$.to(doc => doc?.[index].text),
                        )
                    )
                )
            )
        ),
        div(style({minHeight: '50px'})),
    );
}