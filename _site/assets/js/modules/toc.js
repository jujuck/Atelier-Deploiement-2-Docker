function snakeCase(text) {
    return text.toLowerCase().split(" ").join("_");
}
function scanHeaders(parent) {
    if (parent === void 0) { parent = document.body; }
    /*
     * Iterate through header tags in page
     * - Side effect: If header has no ID tag, generate one based by snake-casing
     *   the inner text
     *  - Otherwise, add ID to set of processed IDs
     *  - Also, if generated name collides with another one, append a number
     *
     * Return: An array of IDs
     *
     */
    const headers = parent.querySelectorAll("h1, h2, h3, h4");
    const processed = Object();
    const temp = new Array();
    for (let i = 0; i < headers.length; i++) {
        const h = headers[i];
        const processed_id = h.getAttribute("id");
        // No ID found
        if (!processed_id) {
            const snake_cased = snakeCase(h.innerText);
            if (snake_cased in processed) {
                processed_id = snake_cased + "_" + ++processed[snake_cased];
            }
            else {
                processed_id = snake_cased;
                processed[processed_id] = 1;
            }
            h.setAttribute("id", processed_id);
        }
        else {
            processed[processed_id] = 1;
        }
        temp.push({
            'level': parseInt(h.tagName[1]),
            'name': h.innerText,
            'id': processed_id
        });
    }
    return temp;
}
function makeListItem(href, text) {
    // Generate a bullet point containing a link
    const link = document.createElement('a');
    link.setAttribute('href', href);
    link.innerText = text;
    const temp = document.createElement('li');
    temp.appendChild(link);
    return temp;
}

function makeList(listParams) {
    if (listParams === void 0) { listParams = {
        'target': "",
        'parent': "body"
    }; }
    const headers = scanHeaders(document.querySelector(listParams.parent));
    // Keep track of where we are in the list;
    const parents = [
        document.createElement("ol")
    ];
    let currentLevel = null; // Used to determine when to indent/dedent list
    let prevBullet = null;
    for (let i in headers) {
        let currentParent = parents.slice(-1)[0];
        const tocItem = headers[i];
        const link = makeListItem("#" + tocItem.id, tocItem.name);
        // Add link text
        if (currentLevel) {
            let levelDiff = tocItem.level - currentLevel;
            if (levelDiff <= 0) {
                // Dedent (or stay the same)
                while (parents.length > 1 && levelDiff) {
                    parents.pop();
                    levelDiff++;
                }
            }
            else if (levelDiff > 0) {
                // Indent
                while (levelDiff) {
                    const nextParent = document.createElement("ol");
                    prevBullet.appendChild(nextParent);
                    currentParent.appendChild(prevBullet);
                    currentParent = nextParent;
                    parents.push(nextParent);
                    levelDiff--;
                }
            }
            // Update parent
            currentParent = parents.slice(-1)[0];
        }
        // Update
        currentLevel = tocItem.level;
        currentParent.appendChild(link);
        prevBullet = link;
    }
    const target = document.querySelector(listParams.target);
    target.appendChild(parents[0]);
}

makeList({
    'target': '#toc-nav',
    'parent': '#main'
});