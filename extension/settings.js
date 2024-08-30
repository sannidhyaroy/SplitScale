// Load saved domains and exit nodes
function loadDomainList() {
    chrome.storage.sync.get(['domainSettings'], function(data) {
        const domainSettings = data.domainSettings || {};
        const domainList = document.getElementById('domainList');
        domainList.innerHTML = ''; // Clear the list

        let count = 1; // Initialize the counter

        for (const domain in domainSettings) {
            const exitNode = domainSettings[domain].exitNode;

            // Create elements using DOM methods
            const div = document.createElement('div');
            div.className = 'domain-item';

            // Create the span element for domain and exit node
            const span = document.createElement('span');

            // Create the SVG element
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

            // Append text and SVG to span
            const domainText = document.createTextNode(`${count}. ${domain}`);
            const exitNodeText = document.createTextNode(` ${exitNode}`);

            span.appendChild(domainText);
            span.appendChild(svg);
            span.appendChild(exitNodeText);

            // Create the remove button
            const button = document.createElement('button');
            button.className = 'remove';
            button.setAttribute('data-domain', domain);
            button.textContent = 'Remove';

            // Append span and button to div
            div.appendChild(span);
            div.appendChild(button);

            // Append the div to the domain list
            domainList.appendChild(div);
            count++;
        }

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove').forEach(button => {
            button.addEventListener('click', function() {
                const domainToRemove = this.getAttribute('data-domain');
                removeDomain(domainToRemove);
            });
        });
    });
}

// Save a new domain and exit node mapping
document.getElementById('add').addEventListener('click', function() {
    const domain = document.getElementById('domain').value.trim();
    const exitNode = document.getElementById('exitNode').value.trim();

    if (domain && exitNode) {
        chrome.storage.sync.get(['domainSettings'], function(data) {
            const domainSettings = data.domainSettings || {};
            domainSettings[domain] = { exitNode: exitNode };

            chrome.storage.sync.set({ domainSettings: domainSettings }, function() {
                document.getElementById('status').textContent = 'Domain mapping saved!';
                loadDomainList();
            });
        });
    } else {
        document.getElementById('status').textContent = 'Please enter both a domain and an exit node IP.';
    }
});

// Remove a domain from the list
function removeDomain(domain) {
    chrome.storage.sync.get(['domainSettings'], function(data) {
        const domainSettings = data.domainSettings || {};
        delete domainSettings[domain];

        chrome.storage.sync.set({ domainSettings: domainSettings }, function() {
            document.getElementById('status').textContent = `Removed ${domain}`;
            loadDomainList();
        });
    });
}

// Load the domain list when the settings page is opened
document.addEventListener('DOMContentLoaded', function() {
    loadDomainList();
});
