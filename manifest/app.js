function isAuthenticated() {
  const api_key = localStorage.getItem('backendaiconsole.api_key');
  const secret_key = localStorage.getItem('backendaiconsole.secret_key');
  const api_endpoint = localStorage.getItem('backendaiconsole.api_endpoint');
  let authenticated = false;
  if (api_key && secret_key && api_endpoint &&
    api_key !== 'null' && secret_key !== 'null' && api_endpoint !== 'null') {
    authenticated = true;
  }
  return authenticated;
}

function backToPreviousPage(e) {
  window.history.back();
}

function setNotification(text) {
  document.querySelector('#lablup-notification').text = text;
  document.querySelector('#lablup-notification').show();
}

function setNotificationNavbar(text, timeout) {
  document.querySelector('#lablup-notification-navbar').innerText = text;
  if (timeout != 0) {
    setTimeout(function () {
      document.querySelector('#lablup-notification-navbar').innerText = '';
    }, timeout);
  }
}

function closeNotification() {
  document.querySelector('#lablup-notification').visible = false;
}

function popAlert(html) {
  var alert = document.querySelector('lablup-alert');
  alert.text = html;
  alert.show();
}

function closeAlert() {
  document.getElementById('lablup-alert').close();
}

function activateSpinner() {
  var spinner = document.querySelector('#lablup-loading-spinner');
  spinner.style.display = 'block';
  spinner.active = true;
}

function deactivateSpinner() {
  var spinner = document.querySelector('#lablup-loading-spinner');
  setTimeout(function () {
    spinner.style.display = 'none';
  }, 500);
  spinner.active = false;
}

function toggleSpinner() {
  var spinner = document.querySelector('#lablup-loading-spinner');
  spinner.active = !spinner.active;
}

function confirmHrefAction(link, message) {
  var dialog = document.querySelector('#confirmDialog');
  dialog.querySelector('#confirmDialog-message').innerHTML = message;
  dialog.querySelector('#confirmDialog-confirm').href = link;
  dialog.open();
}

function confirmJSAction(js, message) {
  var dialog = document.querySelector('#confirmDialog');
  dialog.querySelector('#confirmDialog-message').innerHTML = message;
  dialog.querySelector('#confirmDialog-confirm').setAttribute('onclick', js);
  dialog.open();
}

function notificationDialog(message) {
  var dialog = document.querySelector('#notificationDialog');
  dialog.querySelector('#notificationDialog-message').innerHTML = message;
  dialog.open();
}

function resetInputForm(event) {
  Polymer.dom(event).localTarget.errorMessage = '';
  Polymer.dom(event).localTarget.invalid = false;
}

function warnInputForm(response) {
  if (!response.error_msg) {
    for (var key in response) {
      if (document.getElementById("id_" + key) != undefined) {
        if (document.getElementById("id_" + key).errorMessage == undefined) {
          document.getElementById("id_" + key).errorMessage = '';
        }
        for (var message in response[key]) {
          document.getElementById("id_" + key).errorMessage = response[key][message].message;
          document.getElementById("id_" + key).invalid = true;
        }
      }
    }
  }
  return true;
}

function sendData(id) {
  document.getElementById(id).submit();
}

function mapToggleButtonValue(e) {
  if (Polymer.dom(e).localTarget.checked) {
    Polymer.dom(e).localTarget.value = "checked";
  } else {
    Polymer.dom(e).localTarget.value = undefined;
  }
}

function moveTo(url) {
  activateSpinner();
  window.location.href = url;
}

function toggleDisplayElement(e) {
  var o = document.getElementById(e);
  if (o.style.display == '' || o.style.display == undefined || o.style.display != 'block') {
    o.style.display = 'block';
  } else {
    o.style.display = 'none';
  }
}

function toggleVisibilityElement(e) {
  var o = document.getElementById(e);
  if (o.classList.contains('visible')) {
    o.classList.remove('visible');
    o.classList.add("invisible");
  } else {
    o.classList.remove("invisible");
    o.classList.add('visible');
  }
}

var forEach = function (array, callback, scope) {
  for (var i = 0; i < array.length; i++) {
    callback.call(scope, i, array[i]);
  }
};
