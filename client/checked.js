import { HTML, on, properties } from "ui-io";

export default function checked(boolean$) {
    return [
        properties({ type: 'checkbox', checked: boolean$ }),
        on('change', ({ target }) => boolean$.set(target.checked))
    ];
}
