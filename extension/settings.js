// Load saved domains and exit nodes
function loadDomainList() {
    chrome.storage.sync.get(['domainSettings'], function(data) {
        const domainSettings = data.domainSettings || {};
        const domainList = document.getElementById('domainList');
        domainList.innerHTML = '';

        let count = 1; // Initialize the counter

        for (const domain in domainSettings) {
            const exitNode = domainSettings[domain].exitNode;

            const div = document.createElement('div');
            div.className = 'domain-item';
            div.innerHTML = `
                <span>${count}. ${domain}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right-short" viewBox="0 -4 16 16">
                        <path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"/>
                    </svg>
                ${exitNode}</span>
                <button class="remove" data-domain="${domain}">Remove</button>
            `;
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
