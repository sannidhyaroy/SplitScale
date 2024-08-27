const tailscaleDaemonUrl = 'http://127.0.0.1:5000';
let activeDomains = new Set(); // Set to track active domains that require Tailscale

function extractDomain(url) {
    try {
        let hostname = (new URL(url)).hostname;

        // Normalize the domain by removing 'www.' or other subdomains if necessary
        let domainParts = hostname.split('.');
        if (domainParts.length > 2) {
            // Keep only the last two parts of the domain (e.g., 'reddit.com' from 'old.reddit.com')
            hostname = domainParts.slice(-2).join('.');
        }

        return hostname;
    } catch (error) {
        console.error('Invalid URL provided:', url, error);
        return null; // Return null if URL is invalid
    }
}

async function updateTailscaleState(shouldEnable, exitNode = null) {
    console.log('updateTailscaleState called with shouldEnable:', shouldEnable, 'and exitNode:', exitNode);

    if (shouldEnable) {
        try {
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
                console.error('Failed to enable Tailscale. Status:', response.status, 'Status Text:', response.statusText);
            }
        } catch (error) {
            console.error('Error enabling Tailscale:', error);
        }
    } else {
        try {
            const response = await fetch(`${tailscaleDaemonUrl}/tailscale/down`, {
                method: 'POST'
            });

            if (response.ok) {
                console.log('Tailscale disabled');
            } else {
                console.error('Failed to disable Tailscale. Status:', response.status, 'Status Text:', response.statusText);
            }
        } catch (error) {
            console.error('Error disabling Tailscale:', error);
        }
    }
}

function handleDomainForTab(tabId, domain) {
    if (!domain) return; // Skip if domain extraction failed

    console.log('handleDomainForTab called with tabId:', tabId, 'and domain:', domain);

    chrome.storage.sync.get(['domainSettings'], function(data) {
        const domainSettings = data.domainSettings || {};

        if (domainSettings[domain]) {
            console.log('Domain settings found for:', domain);
            const exitNode = domainSettings[domain].exitNode;

            // If the domain is not in the activeDomains set, enable Tailscale
            if (!activeDomains.has(domain)) {
                console.log('Adding domain to activeDomains and enabling Tailscale:', domain);
                activeDomains.add(domain);
                updateTailscaleState(true, exitNode);
            }
        } else {
            console.log('No domain settings found for:', domain);

            // If the domain is in the activeDomains set but no longer needed, disable Tailscale
            if (activeDomains.has(domain)) {
                console.log('Removing domain from activeDomains and disabling Tailscale:', domain);
                activeDomains.delete(domain);

                // Check if there are any other active domains
                if (activeDomains.size === 0) {
                    console.log('No more active domains. Disabling Tailscale.');
                    updateTailscaleState(false);
                }
            }
        }
    });
}

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        const domain = extractDomain(details.url);

        if (domain) {
            console.log('webRequest onBeforeRequest for domain:', domain);

            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                const tabId = tabs[0]?.id;
                if (tabId) {
                    handleDomainForTab(tabId, domain);
                }
            });
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url) {
        const domain = extractDomain(tab.url);
        if (domain) {
            console.log('Tab updated. URL:', tab.url, 'Domain:', domain);
            handleDomainForTab(tabId, domain);
        }
    }
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    console.log('Tab removed. TabId:', tabId);

    chrome.tabs.get(tabId, function(tab) {
        if (tab && tab.url) {
            const domain = extractDomain(tab.url);

            if (domain && activeDomains.has(domain)) {
                console.log('Removing domain from activeDomains on tab removal:', domain);
                activeDomains.delete(domain);

                // Check if any other tabs are using this domain or other active domains
                chrome.tabs.query({}, function(tabs) {
                    const isDomainStillActive = tabs.some(t => {
                        const tDomain = extractDomain(t.url);
                        return activeDomains.has(tDomain);
                    });

                    if (!isDomainStillActive) {
                        console.log('No active domains remaining. Disabling Tailscale.');
                        updateTailscaleState(false);
                    }
                });
            }
        }
    });
});
