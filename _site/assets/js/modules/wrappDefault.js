import nextUntil from "./nextUntil.js";

const wrappSection = (elem) => {
    const section = document.createElement('section');
    if (elem.tagName === 'H1') {
        section.classList.add('no-background')
    }
    elem.before(section);
    const nextUntilHeadings = nextUntil(elem, ['h1', 'h2']);
    section.append(elem);
    for (let nextElem of nextUntilHeadings) {
        section.append(nextElem);
    }
}

for (let heading of document.querySelectorAll('main h1, main h2')) {
    wrappSection(heading);
}
