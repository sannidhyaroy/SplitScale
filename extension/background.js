const tailscaleDaemonUrl = 'http://127.0.0.1:5000';
let activeDomains = new Set(); // Set to track active domains that require Tailscale

async function updateTailscaleState(shouldEnable, exitNode = null) {
    if (shouldEnable) {
        const response = await fetch(`${tailscaleDaemonUrl}/tailscale/up`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ exit_node: exitNode })
        });

        if (response.ok) {
            console.log('Tailscale enabled for domain:', exitNode);
        } else {
            console.error('Failed to enable Tailscale');
        }
    } else {
        const response = await fetch(`${tailscaleDaemonUrl}/tailscale/down`, {
            method: 'POST'
        });

        if (response.ok) {
            console.log('Tailscale disabled');
        } else {
            console.error('Failed to disable Tailscale');
        }
    }
}

function handleDomainForTab(tabId, domain) {
    chrome.storage.sync.get(['domainSettings'], function(data) {
        const domainSettings = data.domainSettings || {};

        if (domainSettings[domain]) {
            const exitNode = domainSettings[domain].exitNode;

            // If the domain is not in the activeDomains set, enable Tailscale
            if (!activeDomains.has(domain)) {
                activeDomains.add(domain);
                updateTailscaleState(true, exitNode);
            }
        } else {
            // If the domain is in the activeDomains set but no longer needed, disable Tailscale
            if (activeDomains.has(domain)) {
                activeDomains.delete(domain);

                // Check if there are any other active domains
                if (activeDomains.size === 0) {
                    updateTailscaleState(false);
                }
            }
        }
    });
}

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        const url = new URL(details.url);
        const domain = url.hostname;

        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const tabId = tabs[0].id;
            handleDomainForTab(tabId, domain);
        });

        return {};
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        const url = new URL(tab.url);
        const domain = url.hostname;
        handleDomainForTab(tabId, domain);
    }
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    chrome.tabs.get(tabId, function(tab) {
        if (tab && tab.url) {
            const url = new URL(tab.url);
            const domain = url.hostname;

            if (activeDomains.has(domain)) {
                activeDomains.delete(domain);

                // Check if any other tabs are using this domain or other active domains
                chrome.tabs.query({}, function(tabs) {
                    const isDomainStillActive = tabs.some(t => {
                        const tDomain = new URL(t.url).hostname;
                        return activeDomains.has(tDomain);
                    });

                    if (!isDomainStillActive) {
                        updateTailscaleState(false);
                    }
                });
            }
        }
    });
});
