const tailscaleDaemonUrl = 'http://127.0.0.1:5000';
let activeDomains = new Set(); // Set to track active domains that require Tailscale
let tabDomainMap = {}; // Map to track domain associated with each tab
let currentExitNode = null; // Track the currently active exit node

function extractDomain(url) {
    try {
        const domain = (new URL(url)).hostname;
        const domainParts = domain.split('.').filter(part => part !== 'www');
        return domainParts.slice(-2).join('.');
    } catch (error) {
        if (url === undefined) {
            console.log('URL is empty!');
        } else {
        console.error('Error extracting domain from URL:', url, error);
        }
        return null;
    }
}

async function updateTailscaleState(shouldEnable, exitNode = null) {
    console.log('updateTailscaleState called with shouldEnable:', shouldEnable, 'and exitNode:', exitNode);

    if (shouldEnable) {
        if (exitNode === currentExitNode) {
            console.log('Exit node already active. No need to switch.');
            return;
        }

        try {
            const response = await fetch(`${tailscaleDaemonUrl}/tailscale/up`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ exit_node: exitNode })
            });

            if (response.ok) {
                currentExitNode = exitNode;
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
                currentExitNode = null;
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
    console.log('handleDomainForTab called with tabId:', tabId, 'and domain:', domain);

    if (!domain) {
        console.warn('Domain is null or undefined, skipping Tailscale update.');
        return;
    }

    chrome.storage.sync.get(['domainSettings'], function(data) {
        const domainSettings = data.domainSettings || {};

        if (domainSettings[domain]) {
            console.log('Domain settings found for:', domain);
            const exitNode = domainSettings[domain].exitNode;

            if (!activeDomains.has(domain)) {
                console.log('Adding domain to activeDomains and enabling Tailscale:', domain);
                activeDomains.add(domain);
                tabDomainMap[tabId] = domain; // Map the domain to the tab
                updateTailscaleState(true, exitNode);
            } else if (!(currentExitNode === exitNode)) {
                console.log('Domain already in activeDomains, but current exit-node incorrect. Updating exit-node to ', exitNode);
                updateTailscaleState(true, exitNode);
            }
        } else {
            console.log('No domain settings found for:', domain);

            if (activeDomains.has(domain)) {
                console.log('Removing domain from activeDomains:', domain);
                activeDomains.delete(domain);
                delete tabDomainMap[tabId];

                if (activeDomains.size === 0) {
                    console.log('No more active domains. Disabling Tailscale.');
                    updateTailscaleState(false);
                }
            }
        }
    });
}

chrome.tabs.onActivated.addListener((activeInfo) => {
    // Handle onActive tab changed
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        const activeDomain = extractDomain(tab.url);
        if (activeDomain) {
            console.log(`Active Tab changed to ${activeDomain} for tab id ${activeInfo.tabId}`);
            handleDomainForTab(activeInfo.tabId, activeDomain);
        }
    });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        const newDomain = extractDomain(tab.url);
        console.log('Tab updated. URL:', tab.url, 'Domain:', newDomain);

        const oldDomain = tabDomainMap[tabId];

        // Remove the old domain from activeDomains if it exists
        if (oldDomain && oldDomain !== newDomain && activeDomains.has(oldDomain)) {
            console.log('Removing old domain from activeDomains:', oldDomain);
            activeDomains.delete(oldDomain);

            // If no other tabs are using the old domain, disable Tailscale for that domain
            let oldDomainStillActive = false;
            for (let id in tabDomainMap) {
                if (tabDomainMap[id] === oldDomain) {
                    oldDomainStillActive = true;
                    break;
                }
            }
            if (!oldDomainStillActive) {
                console.log('No more tabs using old domain:', oldDomain, 'Disabling Tailscale for it.');
                updateTailscaleState(false);
            }
        }

        // Add the new domain to activeDomains and update the map
        if (newDomain) {
            tabDomainMap[tabId] = newDomain;
            handleDomainForTab(tabId, newDomain);
        }
    }
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    console.log('Tab removed. TabId:', tabId);

    const removedDomain = tabDomainMap[tabId];
    if (removedDomain && activeDomains.has(removedDomain)) {
        console.log('Removing domain from activeDomains on tab removal:', removedDomain);
        activeDomains.delete(removedDomain);
        delete tabDomainMap[tabId];

        // Check for remaining active domains
        chrome.tabs.query({}, function(tabs) {
            const remainingDomains = new Set();
            tabs.forEach(t => {
                const domain = extractDomain(t.url);
                if (activeDomains.has(domain)) {
                    remainingDomains.add(domain);
                }
            });

            if (remainingDomains.size > 0) {
                console.log('Switching Tailscale to the remaining active domain.');
                const remainingDomain = [...remainingDomains][0]; // Choose one of the remaining domains
                chrome.storage.sync.get(['domainSettings'], function(data) {
                    const domainSettings = data.domainSettings || {};
                    if (domainSettings[remainingDomain]) {
                        const exitNode = domainSettings[remainingDomain].exitNode;
                        updateTailscaleState(true, exitNode);
                    }
                });
            } else {
                console.log('No active domains remaining. Disabling Tailscale.');
                updateTailscaleState(false);
            }
        });
    }
    if (activeDomains.size === 0) {
        console.log('No active domains remaining. Disabling Tailscale.');
        updateTailscaleState(false);
    }
});
