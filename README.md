# SOPHOS Relay
Bypass SOPHOS over Tailscale intelligently

### Prerequisites (will be covered in Instructions):
- A Tailscale Account
- Tailscale CLI configured on your system. The daemon controls Tailscale through the CLI interface, so this is necessary.
- A Chromium Browser (example: Google Chrome, Chromium, Brave, Arc, etc.). Gecko browsers aren't yet tested.
- A working brain 🧠, some courage and patience to deal with this alpha project and read the documentations.
---

### Compatibility:
- Windows
- macOS
- Linux (recommended as it's actively tested)
---

### Instructions:
- Follow the instructions on [Tailscale's Download Page](https://tailscale.com/download) to install the Tailscale client or cli. There is no official GUI for Linux, unlike on Windows and macOS. The Tailscale CLI is packaged inside the GUI Client on Windows and macOS, that might need additional configuration to access it. Refer to [Tailscale Docs](https://tailscale.com/kb/1080/cli) for more information. You need at least such two devices (one as an exit-node, and the other as a client, where you want to route through the exit-node).
- Test if Tailscale is working correctly by running `tailscale up`. If you aren't logged in, the CLI should provide a link, to login with your Tailscale account (or create one, if you haven't already). You may or may not need a `sudo` prefix to the command.
- At this point, if at least two devices are connected to Tailscale, you can run `tailscale status` and you should see the two devices listed along with their Tailscale IP and status.
- Prepare to configure one of the devices as an exit-node by running `tailscale up --advertise-exit-node`, then allow the exit-node request of the device from the [admin console](https://login.tailscale.com/admin/machines), by clicking the `ellipsis icon menu` of the exit node device, then open the `Edit route` settings panel, and enable `Use as exit node`. Refer to [Advertise a device as an exit node](https://tailscale.com/kb/1103/exit-nodes#advertise-a-device-as-an-exit-node) section and [Allow the exit node from the admin console](https://tailscale.com/kb/1103/exit-nodes#allow-the-exit-node-from-the-admin-console) for more info.
- Clone this repository by running `git clone https://github.com/sannidhyaroy/SOPHOS-Relay`.
- Run the daemon temporarily by running `python <directory to daemon.py>`. Or, you can run it as a proper daemon, detached from the console, by following [this article](https://medium.com/@guemandeuhassler96/run-your-python-script-as-a-linux-daemon-9a82ed427c1a). Since, this project isn't stable for production, we'll run the daemon temporarily inside our terminal, that can be stopped with `Ctrl/Cmd + C`.
- Open you browser (based on Chromium), navigate to `chrome://extensions` (browsers may rewrite the url as necessary, if it isn't Chrome). Then turn on `Developer Mode` toggle and click `Load Unpacked`. Choose the `extensions` directory inside this repository.
- Navigate to the `SOPHOS Relay` Extension Settings Page and map required domains to an exit-node IP. You can obtain the exit-node IP address of a device by running `tailscale status` and noting down the IP of the device advertising as exit node.
- Try testing by going to one of the configured domains and the extension should sent a request to the daemon process to use the configured device as an exit-node.
---

### Privacy Considerations:
- SOPHOS Relay is fully open-source, licensed with the AGPL License. We are in no way affiliated or partnered to Tailsacle.
- Tailscale is mostly open-source at it's core, except their coordination server. However, they encourage open-source projects like [Headscale](https://github.com/juanfont/headscale), that can be configured to act as a self-hosted Tailscale Coordination Server instead. You can read more about "Open-Source at Tailscale" on their [Open Source page](https://tailscale.com/opensource). The instructions provided for SOPHOS Relay assumes you're using the default Tailscale Coordination Server and their official client apps or cli.
---

### License
SOPHOS Relay is licensed by the AGPL License
