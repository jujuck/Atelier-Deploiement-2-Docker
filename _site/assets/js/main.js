const banner = document.querySelector('.banner');
const header = document.querySelector('body > header');

window.onscroll = () => {
    let scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;

    if (scrollPosition > (header.clientHeight - (banner.clientHeight) * 0.3)) {
        banner.classList.add('fixed');
    } else {
        banner.classList.remove('fixed');
    }

};

const copyButton = document.getElementById('copy-button');
if (copyButton) {
    copyButton.addEventListener('click', (event) => {
        const inputClone = document.getElementById("input-clone");

        inputClone.select();
        inputClone.setSelectionRange(0, 99999); // For mobile devices
    
        navigator.clipboard.writeText(inputClone.value);
        inputClone.blur();
        event.target.classList.add('copied')
        setTimeout(() => { event.target.classList.remove('copied')}, 2000);
    })
}

const wrappTable = (elem) => {
    const div = document.createElement('div');
    div.classList.add('table-responsive');
    elem.before(div);
    div.append(elem);
}

for (let table of document.querySelectorAll('table')) {
    wrappTable(table);
}