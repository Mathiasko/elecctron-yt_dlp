import { ipcMain } from 'electron';
import { parseProgress } from './helper';

const { app } = require('electron');
const { exec } = require('child_process');
const { quote } = require('shell-quote');

function getDownloadOptions(selection) {
  switch (selection) {
    case 'audioOnly':
      return '-f bestaudio';
    case '720p':
      return '-f 136+bestaudio';
    case '1080p':
      return '-f 137+bestaudio';
    case '1440p':
      return '-f 271+bestaudio';
    case '4k':
      return '-f 313+bestaudio';
    default:
      return ''; // or some default option
  }
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

const ipcHandler = () => {
  ipcMain.handle('get-yt-dlp-version', async () => {
    return new Promise((resolve, reject) => {
      exec('yt-dlp --version', (error, stdout, stderr) => {
        if (error) {
          reject(`Error: ${error}`);
          return;
        }
        if (stderr) {
          reject(`stderr: ${stderr}`);
          return;
        }
        resolve(stdout.trim());
      });
    });
  });

  // ipcMain.handle('fake-download', async (e, url) => {
  //   return new Promise((resolve, reject) => {
  //     let i = 0;
  //     const interval = setInterval(() => {
  //       e.sender.send('download-progress', i);

  //       if (i >= 100) {
  //         clearInterval(interval);
  //         resolve('Download complete');
  //       }

  //       i += 5;
  //     }, 50);
  //   });
  // });

  ipcMain.handle('download', async (e, { url, resolution }) => {
    return new Promise((resolve, reject) => {
      if (!url || !resolution) {
        reject(new Error('Invalid URL or resolution'));
        return;
      }

      const options = getDownloadOptions(resolution);
      const downloadsPath = app.getPath('downloads');

      // resolve(getDownloadOptions(options.resolution));
      const command = `yt-dlp ${quote([url])} ${options} -P ${downloadsPath}`;

      e.sender.send('download-status', { loading: true });

      const ytDlpProcess = exec(command);

      ytDlpProcess.stdout.on('data', (data) => {
        const progress = parseProgress(data.toString());
        e.sender.send('download-progress', progress?.percentage);
      });

      ytDlpProcess.stderr.on('data', (data) => {
        e.sender.send('download-error', data.toString());
      });

      ytDlpProcess.on('close', (code) => {
        if (code === 0) {
          e.sender.send('download-status', { loading: false, status: 'ok' });
          resolve('Download complete');
        } else {
          e.sender.send('download-status', { loading: false, status: 'error' });
          reject(new Error(`Download failed with code: ${code}`));
        }
      });

      ytDlpProcess.on('error', (error) => {
        e.sender.send('download-status', { loading: false, status: 'error' });
        reject(new Error(`Error when starting yt-dlp: ${error.message}`));
      });
    });
  });
};

export default ipcHandler;
