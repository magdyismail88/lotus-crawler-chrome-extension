function downloadAndNavigate() {
    // Send HTML content to the background script for downloading
    chrome.runtime.sendMessage({
      action: "downloadHTML",
      htmlContent: document.documentElement.outerHTML
    }, (response) => {
      if (response && response.status === "Downloaded") {
        // Check if there is a "next page" link
        const nextPageLink = document.querySelector('a[title="Go to next page"]');
        if (nextPageLink) {
          // Navigate to the next page
          nextPageLink.click();
        } else {
          console.log("No more pages to process.");
        }
      }
    });
  }
  
  // Start the download and navigation process
  downloadAndNavigate();
  