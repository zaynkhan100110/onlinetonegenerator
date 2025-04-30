$(document).ready(function(){
	var audio = new Audio();
	audio.controls = true;
	document.getElementById("audio-file-wrapper").appendChild(audio);

	var fileInput = $("#audio-file");
	fileInput.on("change", function(e) {
		audio.pause();
		//see http://lostechies.com/derickbailey/2013/09/23/getting-audio-file-information-with-htmls-file-api-and-audio-element/
		var file = e.currentTarget.files[0];
		var objectUrl = URL.createObjectURL(file);
		audio.src = objectUrl;
		ga('send', 'event', 'tempo Change', "File uploaded","");

	});


	if ($(".tempo-slider").length){
		$(".tempo-slider").noUiSlider({
			start: 100,
			// slide: onSlide,
			range: {
				'min': 50,
				'max': 200
			},
		});

		$('.tempo-slider').on('slide', function(){
			onSlide();
		});

		$(".tempo-slider").on("change", function(){
			ga('send', 'event', 'tempo Change', "Slider", $(this).val());
		})
	}

	function onSlide(){
		// console.log($(".volume-slider").val());
		// gainNode.gain.value = volume($(".tempo-slider").val())/2;
		audio.playbackRate = parseInt($(".tempo-slider").val())/100;
		$(".js-tempo-value").html($(".tempo-slider").val());
		// console.log(volume($(".volume-slider").val())/2);
	};
})