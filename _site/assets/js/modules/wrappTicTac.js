import nextUntil from "./nextUntil.js";

const sectionClasses = ['tic', 'tac'];
let sectionIndex = 0;

const wrappSection = (elem) => {
    const section = document.createElement('section');
    if (elem.tagName === 'H1') {
        section.classList.add('no-background')
    }
    if (elem.tagName === 'H2') {
        section.classList.add(sectionClasses[sectionIndex % 2]);
        sectionIndex++;
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
