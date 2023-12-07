export function parseProgress(data) {
  const regex = /\[download\]\s+(\d+\.\d+)%/;
  const match = data.toString().match(regex);

  if (match) {
    const percentage = match[1];
    console.log('percentage', percentage);

    return { percentage };
  }

  return null;
}

export function resolveHtmlPath() {}
