function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleHCaptcha() {
  const captchaAnchor = document.querySelector('#anchor');
  if (captchaAnchor) {
    console.log("h-captcha detected. Clicking on the anchor...");
    captchaAnchor.click();
    return true; // Indicates that h-captcha was handled
  }
  return false; // Indicates no h-captcha was found
}

async function scrollToBottomTwice() {
  for (let i = 0; i < 2; i++) {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    console.log(`Scrolled to the bottom (${i + 1}/2)`);
    await sleep(2000); // Wait for 2 seconds
  }
}

async function downloadAndNavigate() {
  // Check for h-captcha and handle it first
  if (await handleHCaptcha()) {
    console.log("Waiting for h-captcha to complete...");
    return; // Stop further processing until h-captcha is resolved
  }

  // Scroll to the bottom of the page twice with a delay
  await scrollToBottomTwice();

  // Send HTML content to the background script for downloading
  chrome.runtime.sendMessage({
    action: "downloadHTML",
    htmlContent: document.documentElement.outerHTML
  }, (response) => {
    if (response && response.status === "Downloaded") {
      // Check if there is a "next page" link
      const nextPageLink = document.querySelector('a[title="Go to next page"]');
      if (nextPageLink) {
        console.log("Navigating to the next page...");
        const nextPageURI = nextPageLink.href;
        if(nextPageURI !== '') {
          window.location.href = nextPageURI;
        }

      } else {
        console.log("No more pages to process. Stopping.");
        // Optionally, send a message to the background script that processing is complete
        chrome.runtime.sendMessage({ action: "processComplete" });
      }
    }
  });
}

// Start the download and navigation process only once per page load
if (!window.processed) {
  window.processed = true; // Prevent re-processing the same page
  downloadAndNavigate();
}
