function toggleSpinner() {
  var spinner = document.querySelector('#lablup-loading-spinner');
  spinner.active = !spinner.active;
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
