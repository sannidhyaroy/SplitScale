const tailscaleDaemonUrl = 'http://127.0.0.1:5000';
let activeDomain = null; // Track the currently active domain

async function updateTailscaleState(shouldEnable, exitNode = null) {
    if (shouldEnable && activeDomain === null) {
        const response = await fetch(`${tailscaleDaemonUrl}/tailscale/up`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ exit_node: exitNode })
        });

        if (response.ok) {
            activeDomain = exitNode;
            console.log('Tailscale enabled for domain:', activeDomain);
        }
    } else if (!shouldEnable && activeDomain !== null) {
        const response = await fetch(`${tailscaleDaemonUrl}/tailscale/down`, {
            method: 'POST'
        });

        if (response.ok) {
            console.log('Tailscale disabled for domain:', activeDomain);
            activeDomain = null;
        }
    }
}

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        const url = new URL(details.url);
        const domain = url.hostname;

        chrome.storage.sync.get(['domainSettings'], function(data) {
            const domainSettings = data.domainSettings || {};

            if (domainSettings[domain]) {
                const exitNode = domainSettings[domain].exitNode;

                // If the domain matches and Tailscale isn't already enabled, enable it
                if (activeDomain !== domain) {
                    updateTailscaleState(true, exitNode);
                }
            } else {
                // If the domain doesn't match and Tailscale is enabled, disable it
                if (activeDomain !== null) {
                    updateTailscaleState(false);
                }
            }
        });

        return {};
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
//        chrome.tabs.get(tabId, function(tab) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            var tab = tabs[0];
            var url = new URL(tab.url);
            var domain = url.hostname;

            chrome.storage.sync.get(['domainSettings'], function(data) {
                const domainSettings = data.domainSettings || {};

                if (domainSettings[domain]) {
                    const exitNode = domainSettings[domain].exitNode;

                    if (activeDomain !== domain) {
                        updateTailscaleState(true, exitNode);
                    }
                } else if (activeDomain !== null) {
                    updateTailscaleState(false);
                }
            });
        });
    }
});

//chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
//    if (activeDomain !== null) {
//        updateTailscaleState(false);
//    }
//});
