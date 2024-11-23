function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleHCaptcha() {
  const captchaAnchor = document.getElementById('anchor');
  if (captchaAnchor) {
    console.log("h-captcha detected. Clicking on the anchor...");
    captchaAnchor.click(); // Trigger a click event on the anchor element
    await sleep(2000); // Give some time for the click action to take effect
    return true; // Indicates h-captcha was handled
  }
  return false; // No h-captcha detected
}

async function scrollToBottomTwice() {
  for (let i = 0; i < 2; i++) {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    console.log(`Scrolled to the bottom (${i + 1}/2)`);
    await sleep(2000); // Wait for 2 seconds
  }
}

async function downloadAndNavigate() {
  // Handle h-captcha first
  let captchaHandled = await handleHCaptcha();
  if (captchaHandled) {
    console.log("h-captcha clicked. Waiting for user action...");
    return; // Stop further actions until h-captcha is resolved
  }

  // Scroll to the bottom of the page twice
  await scrollToBottomTwice();

  captchaHandled = await handleHCaptcha();
  if (captchaHandled) {
    console.log("h-captcha clicked. Waiting for user action...");
    return; // Stop further actions until h-captcha is resolved
  }

  // Send HTML content to the background script for downloading
  chrome.runtime.sendMessage({
    action: "downloadHTML",
    htmlContent: document.documentElement.outerHTML
  }, (response) => {
    if (response && response.status === "Downloaded") {
      // Check for the next page
      const nextPageLink = document.querySelector('a[title="Go to next page"]');
      if (nextPageLink) {
        console.log("Navigating to the next page...");
        if(nextPageLink.href && nextPageLink.href != '') {
          window.location.href = nextPageLink.href;
        }
        
      } else {
        window.location.href = 'https://scrapeme.live/shop'
        console.log("No more pages to process. Stopping.");
        chrome.runtime.sendMessage({ action: "processComplete" });
      }
    }
  });
}

// Start the process only once per page
if (!window.processed) {
  window.processed = true;
  downloadAndNavigate();
}
