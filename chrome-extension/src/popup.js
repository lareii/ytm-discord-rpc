console.log("Popup script loaded")

document.getElementById("state").addEventListener('change', function() {
    const checkbox = document.getElementById("state");
    chrome.storage.local.set({isOpen: checkbox.checked});
});

chrome.storage.local.get("isOpen", function(result) {
    document.getElementById("state").checked = result.isOpen;
});
