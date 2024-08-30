from flask import Flask, request, jsonify
import subprocess

app = Flask(__name__)

def run_command(command):
    try:
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return result.stdout.decode('utf-8'), None
    except subprocess.CalledProcessError as e:
        return None, e.stderr.decode('utf-8')

@app.route('/tailscale/up', methods=['POST'])
def tailscale_up():
    exit_node = request.json.get('exit_node')
    if exit_node:
        command = f'tailscale up --reset --operator=$USER --accept-routes --exit-node={exit_node}'
    else:
        command = 'tailscale up --reset --operator=$USER --accept-routes'

    output, error = run_command(command)

    if error:
        return jsonify({"status": "error", "message": error}), 500
    return jsonify({"status": "success", "output": output})

@app.route('/tailscale/down', methods=['POST'])
def tailscale_down():
    command = 'tailscale down'
    output, error = run_command(command)

    if error:
        return jsonify({"status": "error", "message": error}), 500
    return jsonify({"status": "success", "output": output})

@app.route('/tailscale/set_exit_node', methods=['POST'])
def set_exit_node():
    exit_node = request.json.get('exit_node')
    if not exit_node:
        return jsonify({"status": "error", "message": "exit_node is required"}), 400

    command = f'tailscale set --exit-node={exit_node}'
    output, error = run_command(command)

    if error:
        return jsonify({"status": "error", "message": error}), 500
    return jsonify({"status": "success", "output": output})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
