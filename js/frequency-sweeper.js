var contextClass = (window.AudioContext ||
  window.webkitAudioContext ||
  window.mozAudioContext ||
  window.oAudioContext ||
  window.msAudioContext);

var messageDisplayed = false;

if (contextClass) {
  // Web Audio API is available.
  var context = new contextClass();
	var gainValue = 0.1;
	var gainNode;
	var oscillator;
} else {
	$(".beginTuning").click(function(e){
		e.stopImmediatePropagation();
		ga('send', 'event', 'Error caught', "No context available");
		if (!messageDisplayed){
			$("#generator").css("padding-top",'0').prepend("<p style='padding:20px;font-size:0.8em;'>Sorry, it looks like your browser is not compatible with this particular feature. If possible, please try again with the latest version of Chrome, Safari or Firefox.</p>");
			$(this).parents(".tuningTable").before("<p style='padding:20px;font-size:0.8em;'>Sorry, it looks like your browser is not compatible with the tone generator. If possible, please try again with the latest version of Chrome, Safari or Firefox.</p>");
			messageDisplayed = true;
		}
	});
}

var oscs = {sine:0, square:1, sawtooth:2, triangle:3 };


function createSource(buffer) {
  var source = context.createBufferSource();
  var gainNode = context.createGainNode();
  source.buffer = buffer;
  // Connect source to gain.
  source.connect(gainNode);
  // Connect gain to destination.
  gainNode.connect(context.destination);

  return {
    source: source,
    gainNode: gainNode
  };
}



$(".waveform-wrapper").click(function(e){
	e.preventDefault();
	$(this).children("input").click();
});


$("input[name='waveform']").click(function(e){
	e.stopPropagation();
	if (typeof oscillator != 'undefined'){
		if (oscillator.type === parseInt(oscillator.type)){
			oscillator.type = oscs[$(this).val()];
		} else {
			oscillator.type = $(this).val();
		}
	}
	ga('send', 'event', 'Waveform Changed', $(this).val());
});


var freq1,freq2,duration;
$(".frequency-sweeper .beginTuning").click(function(e){
	if (validate($("#freq-start").val())){

		freq1 = $("#freq-start").val();
		freq2 = $("#freq-end").val();
		duration = $("#duration").val();
		ga('send', 'event', 'Sweep started', "Sweep", freq1 + ", " + freq2 + ", " + duration);
		start(freq1, freq2, duration);

	} else {
		alert("Sorry, you entered an invalid number. Please enter a number between 1 and 20000 and try again.");
	}
});

var animationID;

function start(freq) {
	if (typeof oscillator != 'undefined') oscillator.disconnect();
	sweep(freq1, freq2, duration);
	$(".beginTuning").addClass("active");
	animationID = window.setInterval(function(){
		newTime = context.currentTime;
		$("#current-frequency").html(parseInt(oscillator.frequency.value));
		$("#current-volume").html((parseFloat(gainNode.gain.value)*400).toFixed(1));
		$("#current-time").html((newTime - currTime).toFixed(1));
		if ((newTime - currTime) > duration){
			clearInterval(animationID);
			$("#current-frequency").html(freq2);
			$("#current-volume").html($("#end-volume").val());
			$("#current-time").html(duration);

		}
	}, 50);
}
var currTime;
function sweep(freq1, freq2, duration){

	clearInterval(animationID);

	  currTime = context.currentTime;


	oscillator = context.createOscillator();
	gainNode = context.createGain ? context.createGain() : context.createGainNode();

	// oscillator.type = 0;
	oscillator.frequency.value = freq1;

	oscillator.connect(gainNode);
	gainNode.connect(context.destination);
	// gainNode.gain.value = $(".volume-slider").length ? volume($(".volume-slider").val())/2 : gainValue;
	// gainNode.gain.value = 0.15;


	if ($("input[name='waveform']:checked").length){

		if (oscillator.type === parseInt(oscillator.type)){
			oscillator.type = oscs[$("input[name='waveform']:checked").val()];
		} else {
			oscillator.type = $("input[name='waveform']:checked").val();
		}
	} else {
		if (oscillator.type === parseInt(oscillator.type)){
			oscillator.type = 0;
		} else {
			oscillator.type = "sine";
		}
	}
	oscillator.start ? oscillator.start(0) : oscillator.noteOn(0);

	vol1 = $("#start-volume").val()/100 == 0 ? 0.001 : $("#start-volume").val()/400; //divide by 2 so maximum gain is 0.25
	vol2 = $("#end-volume").val()/100 == 0 ? 0.001 : $("#end-volume").val()/400;

	vol1 = Math.min(vol1, 0.5);
	vol2 = Math.min(vol2, 0.5);

	gainNode.gain.value = vol1;


	if ($('input[name=ramp]:checked').val() == 'linear'){
		oscillator.frequency.linearRampToValueAtTime(freq1, currTime);
		gainNode.gain.linearRampToValueAtTime(vol1, currTime);
		oscillator.frequency.linearRampToValueAtTime(freq2, currTime + duration*1);
		gainNode.gain.linearRampToValueAtTime(vol2, currTime + duration*1);
	} else {
		oscillator.frequency.exponentialRampToValueAtTime(freq1, currTime);
		gainNode.gain.exponentialRampToValueAtTime(vol1, currTime);
		oscillator.frequency.exponentialRampToValueAtTime(freq2, currTime + duration*1);
		gainNode.gain.exponentialRampToValueAtTime(vol2, currTime + duration*1);
	}
	if ($("#maintain-tone").prop("checked")){

	} else {
		oscillator.stop ? oscillator.stop(currTime + duration*1) : oscillator.noteOff(currTime + duration*1);
		
	}

	// oscillator.start(0);
};

function validate(n){
	if (isNumber(n) && n > 0 && n < 20001){
		return true;
	}
}

function isNumber(n){
	return !isNaN(parseFloat(n)) && isFinite(n);
}

function stop() {
	oscillator.disconnect();
	$(".frequency-sweeper .beginTuning").removeClass("active");
	clearInterval(animationID);

}