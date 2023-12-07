import React, { useState, useEffect } from 'react';

function Home() {
  const { ipcRenderer } = window.electron;

  const [ytDlpVersion, setYtDlpVersion] = useState('');

  const [percentage, setPercentage] = useState(0);

  const [input, setInput] = useState('');

  const [downloadStatus, setDownloadStatus] = useState({
    loading: false,
    status: '',
  });

  const [options, setOptions] = useState({
    resolution: '',
    url: '',
  });

  useEffect(() => {
    ipcRenderer
      .invoke('get-yt-dlp-version')
      .then((version) => setYtDlpVersion(version))
      .catch(() => setYtDlpVersion(`Error: yt-dlp not installed`));
  }, []);

  useEffect(() => {
    const removeDownloadStatusListener = ipcRenderer.on(
      'download-status',
      (status) => {
        setDownloadStatus(status);
      },
    );

    const removeDownloadProgressListener = ipcRenderer.on(
      'download-progress',
      (progress) => {
        setPercentage(progress);
      },
    );

    return () => {
      removeDownloadStatusListener();
      removeDownloadProgressListener();
    };
  }, []);

  function handleDownload(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    ipcRenderer
      .invoke('download', options)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.error('Download error:', error);
      });
  }

  const renderStatusMessage = () => {
    if (downloadStatus.loading) return <div>Loading...</div>;
    if (downloadStatus.status === 'ok') return <div>Download Complete</div>;
    if (downloadStatus.status === 'error') return <div>Error in Download</div>;
  };

  return (
    <div className="">
      <div className="container">
        <h2 className="title">Url to downlaod:</h2>
        <input
          type="text"
          id="videoUrl"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setOptions((prev) => ({ ...prev, url: e.target.value }))
          }
          placeholder="Enter Video URL"
        />
        <div className="options">
          <label htmlFor="audioOnly">
            <input
              type="radio"
              id="audioOnly"
              name="resolution"
              onChange={() =>
                setOptions((prev) => ({ ...prev, resolution: 'audioOnly' }))
              }
            />
            Audio Only
          </label>

          <div className="">
            <label htmlFor="720p">
              <input
                onChange={() =>
                  setOptions((prev) => ({ ...prev, resolution: '720p' }))
                }
                type="radio"
                id="720p"
                name="resolution"
              />
              720p
            </label>
            <label htmlFor="1080p">
              <input
                onChange={() =>
                  setOptions((prev) => ({ ...prev, resolution: '1080p' }))
                }
                type="radio"
                id="1080p"
                name="resolution"
              />
              1080p
            </label>

            <label htmlFor="1440p">
              <input
                onChange={() =>
                  setOptions((prev) => ({ ...prev, resolution: '1440p' }))
                }
                type="radio"
                id="1440p"
                name="resolution"
              />
              1440p
            </label>
            <label htmlFor="4k">
              <input
                onChange={() =>
                  setOptions((prev) => ({ ...prev, resolution: '4k' }))
                }
                type="radio"
                id="4k"
                name="resolution"
              />
              4k
            </label>
          </div>
        </div>

        <div id="formatOptions" />
        <button type="button" onClick={handleDownload} id="downloadButton">
          Download
        </button>

        <div className="progress">
          <div className="bar">
            <div style={{ width: `${percentage}%` }} className="stick" />
          </div>
          <div className="status">{renderStatusMessage()}</div>
        </div>
        <p>{percentage}</p>
      </div>
      <div className="check">
        <p className="">yt-dlp {ytDlpVersion}</p>
      </div>
    </div>
  );
}

export default Home;
