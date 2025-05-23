export default class ScrollControl {
    constructor(target$, admin$) {
        this.target$ = target$;
        this.admin$ = admin$;
        let visible = new Set();
        this.observer = new IntersectionObserver(entries => {
            console.log(entries);
            entries.forEach(({ intersectionRatio, target }) => {
                let isVisible = intersectionRatio >= 0.5;
                let found = this.elements.find(([element]) => element == target);
                if (found) {
                    if (isVisible) visible.add(found[1])
                    else visible.delete(found[1]);
                }
            });
            //current$.set(Math.min(...visible));
        }, { threshold: 0.5 });
        this.elements = [];
    }

    attach(value) {
        return element => {
            const checkShow = () => {
                console.log("check show", this.target$.get() == value, !this.admin$.get()); 
                if (this.target$.get() == value && !this.admin$.get()) {
                    element.scrollIntoView({ behavior: 'smooth', block: "center" });
                }
            };
            this.observer.observe(element);
            this.elements.push([element, value]);
            this.target$.observe(element, checkShow);
            setTimeout(checkShow, 2000);
        };
    }
}
