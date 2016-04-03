window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

window.addEventListener('load', init, false);

function init () {
  try {
    record(new AudioContext());
  }
  catch (e) {
    console.error(e);
    alert('Web Audio API is not supported in this browser');
  }
}

function record (context) {
  navigator.getUserMedia({ audio: true }, sound, error);

  function sound (stream) {
    var analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.2;
    analyser.fftSize = 1024;

    var node = context.createJavaScriptNode(2048, 1, 1);

    var values = 0;
    var average;
    node.onaudioprocess = function () {
      // bitcount is fftsize / 2
      var array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);

      var length = array.length;
      for (var i = 0; i < length; i++) {
        values += array[i];
      }

      average = values / length;
      oppdaterGui(average);
      average = values = 0;
    };

    var input = context.createMediaStreamSource(stream);

    input.connect(analyser);
    analyser.connect(node);
    node.connect(context.destination);

    //input.connect(context.destination); // hello feedback
  }

  function error () {
    console.log(arguments);
  }
}