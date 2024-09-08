  
    function addParamToURL() {
      const urlInput = document.getElementById('current-url');
      const apiKeyDropdown = document.getElementById('apiKey-dropdown').value;
      const apiKey = apiKeyDropdown;
      const apiKeyCustom = document.getElementById('apiKey-custom').value.trim();
      const languageDropdown = document.getElementById('language-dropdown').value;
      const language = languageDropdown;
      const startZoomLevel = document.getElementById('startZoomLevel').value.trim();
      const pitch = document.getElementById('pitch').value.trim();
      const bearing = document.getElementById('bearing').value.trim();
      const kioskDropdown = document.getElementById('kioskOriginLocationId-dropdown').value;
      const kioskOriginLocationId = kioskDropdown; 
      const kioskCustom = document.getElementById('kiosk-custom').value.trim();
      const useKeyboardDropdown = document.getElementById('useKeyboard-dropdown').value;
      const useKeyboard = useKeyboardDropdown;
      
      let url = new URL(urlInput.value);
      const params = new URLSearchParams(url.search);

      if (apiKey) {
          params.set('apiKey', apiKey);
      }
      if (apiKeyCustom) {
        params.set('apiKey', apiKeyCustom);
      }
      if (language) {
          params.set('language', language);
      }
      if (startZoomLevel) {
          params.set('startZoomLevel', startZoomLevel);
      }
      if (pitch) {
          params.set('pitch', pitch);
      }
      if (bearing) {
          params.set('bearing', bearing);
      }
      if (kioskOriginLocationId) {
        params.set('kioskOriginLocationId', kioskOriginLocationId);
        params.set('startZoomLevel', 23);
        params.set('bearing', 208);
        params.set('pitch', 60);
      } else if (startZoomLevel) {
        params.set('startZoomLevel', startZoomLevel);
      }
      if (kioskCustom) {
        params.set('kioskOriginLocationId', kioskCustom);
      }
      if (useKeyboard) {
          params.set('useKeyboard', useKeyboard)
      }

      url.search = params.toString();
      urlInput.value = url.toString();
    }

  function updateIframe() {
  const urlInput = document.getElementById('current-url').value;
  const iframe = document.getElementById('map-iframe');

    if (iframe) {
        iframe.src = urlInput;
        console.log("Iframe updated with new src: ", iframe.src);
    }
  };

  function copyToClipboard() {
  const urlInput = document.getElementById('current-url');
  urlInput.select(); // Select the text field
  urlInput.setSelectionRange(0, 99999); // For mobile devices

  // Copy the text inside the text field
  navigator.clipboard.writeText(urlInput.value)
    .then(() => {
      console.log('URL copied to clipboard');
      alert('URL copied to clipboard!');
    })
    .catch(err => {
      console.error('Failed to copy: ', err);
    });
}

function refreshPage() {
  location.reload();
}

document.getElementById('apiKey-dropdown').addEventListener('change', function() {
  const selectedApiKey = this.value;
  const kioskContainer = document.getElementById('kioskOriginLocationId-container');

  if (selectedApiKey === 'mapspeople3d') {
      kioskContainer.style.display = 'block';
  } else {
      kioskContainer.style.display = 'none';
  }
});