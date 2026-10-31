const { spawn, execFileSync } = require('child_process');
const net = require('net');

const preferredPorts = [8082, 8083, 8084, 8085, 8086, 8087, 8088, 8089, 8090, 9091];

function isPortFree(port) {
  if (process.platform === 'win32') {
    try {
      const result = execFileSync(
        'powershell',
        ['-NoProfile', '-Command', `Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty LocalPort`],
        { encoding: 'utf8' }
      );
      return result.trim() === '';
    } catch {
      return true;
    }
  }

  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(port, '0.0.0.0');
  });
}

async function main() {
  const extraArgs = process.argv.slice(2);
  let port = null;

  for (const candidate of preferredPorts) {
    if (await isPortFree(candidate)) {
      port = candidate;
      break;
    }
  }

  if (!port) {
    port = 19000 + Math.floor(Math.random() * 1000);
  }

  const expoBin = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const expoArgs = ['expo', 'start', '--port', String(port), ...extraArgs];

  console.log(`Starting Expo on port ${port}...`);

  const child = spawn(expoBin, expoArgs, {
    stdio: 'inherit',
    shell: true,
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });

  child.on('error', (error) => {
    console.error(`Failed to start Expo: ${error.message}`);
    process.exit(1);
  });
}

main();
