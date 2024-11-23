async function downloadAndNavigate() {
    // Send HTML content to the background script for downloading
    chrome.runtime.sendMessage({
      action: "downloadHTML",
      htmlContent: document.documentElement.outerHTML
    }, async (response) => {
      if (response && response.status === "Downloaded") {

        await new Promise(resolve => {
          // Scroll to the bottom of the page
          window.scrollTo(0, document.body.scrollHeight);
      
          // Wait for 2 seconds after scrolling
          setTimeout(resolve, 2000);
        });

        // Check if there is a "next page" link
        const nextPageLink = document.querySelector('a[title="Go to next page"]');
        if (nextPageLink) {
          // Navigate to the next page
          // nextPageLink.click();
          window.location.href = nextPageLink.href;
          await new Promise(resolve => setTimeout(resolve, 20000));

        } else {
          console.log("No more pages to process.");
        }
      }
    });
  }
  
  // Start the download and navigation process
  if (!window.processed) {
    window.processed = true; // Prevent re-processing the same page
    downloadAndNavigate();
  }
  