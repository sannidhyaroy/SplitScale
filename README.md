# SplitScale
A Split Tunneling Solution through Tailscale based on domain matching

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
- Clone this repository:
  ```bash
  git clone https://github.com/sannidhyaroy/SplitScale.git
  ```
- Install Flask, if it is not installed already:
  ```bash
  pip install Flask
  ```
- Optionally, for testing purposes, you can utilize [Python Virtual Environments](https://docs.python.org/3/library/venv.html):
  - Ensure you're inside the repository folder, then create a Python Virtual Environment:
    ```bash
    python -m venv venv
    ```
  - Activate the Virtual Environment:
      - For Windows:
        ```
        venv\Scripts\activate
        ```
        - For macOS or Linux:
        ```bash
        source venv/bin/activate
        ```
  - Install Dependencies from `requirements.txt`:
    ```bash
    pip install -r requirements.txt
    ```
  - Verify Dependency Installation:
    ```bash
    pip list
    ```
- Run the daemon temporarily by running `python <directory to daemon.py>`. Or, you can run it as a proper daemon, detached from the console, by following [this article](https://medium.com/@guemandeuhassler96/run-your-python-script-as-a-linux-daemon-9a82ed427c1a). Since, this project isn't stable for production, we'll run the daemon temporarily inside our terminal, that can be stopped with `Ctrl/Cmd + C`. You can deactivate Python Virtual Environment after stopping the daemon by running `deactivate`.
- Open you browser (based on Chromium), navigate to `chrome://extensions` (browsers may rewrite the url as necessary, if it isn't Chrome). Then turn on `Developer Mode` toggle and click `Load Unpacked`. Choose the `extensions` directory inside this repository.
- Navigate to the `SplitScale` Extension Settings Page and map required domains to an exit-node IP. You can obtain the exit-node IP address of a device by running `tailscale status` and noting down the IP of the device advertising as exit node.
- Try testing by going to one of the configured domains and the extension should sent a request to the daemon process to use the configured device as an exit-node.
---

### Privacy Considerations:
- SplitScale is fully open-source, licensed under the [GNU Affero General Public License (AGPL) v3.0](https://github.com/sannidhyaroy/SplitScale/blob/main/LICENSE). We are in no way affiliated to or partnered with Tailscale.
- Tailscale is a partially open-source tool with some proprietary components, such as the Tailscale Coordination Server. Our project works with Tailscale’s existing setup and does not modify or distribute Tailscale’s proprietary software. Users must comply with Tailscale’s terms of service and licensing. For a fully open-source alternative to Tailscale’s coordination server, users might consider using [Headscale](https://github.com/juanfont/headscale). The instructions provided for this project assumes you're using the default Tailscale Coordination Server and their official client apps or cli, but it should work with Headscale as well. Read more at ["Open-Source at Tailscale"](https://tailscale.com/opensource).
---

### License
SplitScale is licensed under the [GNU Affero General Public License (AGPL) v3.0](https://github.com/sannidhyaroy/SplitScale/blob/main/LICENSE).