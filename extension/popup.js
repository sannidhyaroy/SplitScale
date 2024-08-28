// Load saved domains and exit nodes
function loadDomainList() {
    chrome.storage.sync.get(['domainSettings'], function(data) {
        const domainSettings = data.domainSettings || {};
        const domainList = document.getElementById('domainList');
        domainList.innerHTML = '';

        let count = 1; // Initialize a counter

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
            `;
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
