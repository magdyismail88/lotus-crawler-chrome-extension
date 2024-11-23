chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "downloadHTML") {
    // Convert HTML content to base64
    const base64Content = btoa(unescape(encodeURIComponent(message.htmlContent)));
    const dataUrl = `data:text/html;base64,${base64Content}`;

    const url = new URL(sender.tab.url);

    // Generate a filename based on the URL path
    let sanitizedUrl = url.hostname + url.pathname;
    
    for(const [key, value] of url.searchParams.entries()) {
      sanitizedUrl += `${key}${value}`;
    }

    const filename = sanitizedUrl.replace(/[<>:"/\\|&=?*]+/g, '') + '.html';

    console.log(filename);

    // Trigger download with the generated filename
    chrome.downloads.download({
      url: dataUrl,
      filename: filename
    });

    // Respond with a success message
    sendResponse({ status: "Downloaded" });
  }

  return true; // Keeps the message channel open for asynchronous responses
});
