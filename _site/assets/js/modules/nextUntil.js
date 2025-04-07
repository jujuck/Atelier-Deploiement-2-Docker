export default function (elem, selector, filter = false) {
	// Setup siblings array
	let siblings = [];
	// Get the next sibling element
	elem = elem.nextElementSibling;
	// As long as a sibling exists
	while (elem) {
		// If we've reached our match, bail
		if (elem.matches(selector)) break;
		// If filtering by a selector, check if the sibling matches
		if (filter && !elem.matches(filter)) {
			elem = elem.nextElementSibling;
			continue;
		}
		// Otherwise, push it to the siblings array
		siblings.push(elem);
		// Get the next sibling element
		elem = elem.nextElementSibling;
	}
	return siblings;
};
