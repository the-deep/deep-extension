const EXTENSION_GET_SCREENSHOT_MESSAGE = 'deep-get-screenshot';

chrome.runtime.onMessageExternal.addListener((request, _, reply) => {
    switch (request.message) {
        case EXTENSION_GET_SCREENSHOT_MESSAGE: {
            chrome.tabs.captureVisibleTab(null, {}, (image) => {
                reply({
                    message: 'success',
                    image,
                });
            });

            // return true to indicate that the reply is async
            return true;
        }
        default:
            return false;
    }
});
