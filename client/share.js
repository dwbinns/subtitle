import { classList, Data, HTML, on, properties, style } from "ui-io";
import QRCode from "qrcode";

const { max, min } = Math;
const { div, iframe, button, dialog, canvas, input, a, label } = HTML(document);


const qrCanvas = canvas();
const qrAdmin$ = new Data(false);

const qrURL$ = Data.from(qrAdmin$, selectedStrands$, (admin, selected) => {
    if (!selected) return '';
    console.log(admin, selected);
    let selectedStrands = selected.filter(({ selected }) => selected).map(({ name }) => name).join(",");
    let hash = `#token=${admin ? token : "-"}`;
    let url = new URL(`?name=${name}&strands=${selectedStrands}${hash}`, location);
    QRCode.toCanvas(qrCanvas, `${url}`, function (error) {
        if (error) console.error(error)
        console.log('success!');
    })
    style({ width: `min(50vh, 50vw)`, height: `min(50vh, 50vw)` })(qrCanvas);
    return url;
});


const qrDialog = dialog(
    div(style({ float: 'right' }), button(on('click', () => qrDialog.close()), "X")),
    admin$.if(
        div(label(input(checked(qrAdmin$)), "Admin"))
    ),
    selectedStrands$.map({}, selected$ =>
        div(label(input(checked(selected$.field('selected'))), selected$.field('name')))
    ),
    div(
        qrCanvas,
    ),
    a(
        style({ fontSize: '12px' }),
        properties({ href: qrURL$ }),
        qrURL$
    )
);


document.body.append(qrDialog);

export default function share() {
    qrDialog.showModal();
}

?? admin$