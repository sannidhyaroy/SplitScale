// Load saved domains and exit nodes
function loadDomainList() {
    chrome.storage.sync.get(['domainSettings'], function(data) {
        const domainSettings = data.domainSettings || {};
        const domainList = document.getElementById('domainList');
        domainList.innerHTML = '';

        let count = 1; // Initialize a counter

        for (const domain in domainSettings) {
            const exitNode = domainSettings[domain].exitNode;

            // Create container div
            const div = document.createElement('div');
            div.className = 'domain-item';

            // Create span for domain and exit node
            const span = document.createElement('span');

            // Create text node for count and domain
            const textNode1 = document.createTextNode(`${count}. ${domain} `);

            // Create SVG element
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            svg.setAttribute("width", "16");
            svg.setAttribute("height", "16");
            svg.setAttribute("fill", "currentColor");
            svg.setAttribute("class", "bi bi-arrow-right-short");
            svg.setAttribute("viewBox", "0 -4 16 16");

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("fill-rule", "evenodd");
            path.setAttribute("d", "M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8");

            svg.appendChild(path);

            // Create text node for exitNode
            const textNode2 = document.createTextNode(` ${exitNode}`);

            // Append all nodes to span
            span.appendChild(textNode1);
            span.appendChild(svg);
            span.appendChild(textNode2);

            // Append span to div
            div.appendChild(span);

            // Append div to domainList
            domainList.appendChild(div);

            count++;
        }
    });
}

// Open Extension Settings Page on button click event
document.getElementById('settingsIcon').addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
});

// Load the domain list when the settings page is opened
document.addEventListener('DOMContentLoaded', function() {
    loadDomainList();
});