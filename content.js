function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleHCaptcha() {
  // Locate all iframe elements on the page
  const iframes = document.querySelectorAll('iframe');

  // Iterate through each iframe to find the one containing #anchor
  for (const iframe of iframes) {
    try {
      // Access the iframe's document
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      // Locate the anchor element inside the iframe
      const captchaAnchor = iframeDoc.querySelector('#anchor');
      if (captchaAnchor) {
        console.log("h-captcha anchor detected inside iframe. Clicking...");
        captchaAnchor.click(); // Simulate a click on the anchor element
        await sleep(2000); // Wait for 2 seconds for the action to take effect
        return true; // Indicate h-captcha was handled
      }
    } catch (error) {
      console.error("Error accessing iframe content:", error);
    }
  }

  console.log("No h-captcha anchor found in any iframe.");
  return false; // Indicate no h-captcha was handled
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
  }, async (response) => {
    if (response && response.status === "Downloaded") {
      // Check for the next page
      const nextPageLink = document.querySelector('a[title="Go to next page"]');
      if (nextPageLink) {
        console.log("Navigating to the next page...");
        if(nextPageLink.href && nextPageLink.href != '') {
          window.location.href = nextPageLink.href;
        }
        
      } else {
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
