var flvPlayerCur;


document.addEventListener('visibilitychange', function() { 
	var isHidden = document.hidden;
	if(isHidden)
	{
		console.log('hide page');
		if (!$('#videopanelbody').is(':hidden')) { 
			console.log('destory video');
			destoryVideo();
		}
	}
	else{
		console.log('show page');
		if (!$('#videopanelbody').is(':hidden')) { 
			console.log('start video');
			startVideo();
		}
	}
});

function startSingleVideoChannel(pos,no,isPlay){
	var elementId = pos+'VideoElement'
	var videoElement1 = document.getElementById(elementId);
	var flvPlayer = flvjs.createPlayer({
		type: 'flv',
		isLive: true,
		hasAudio: false,
		hasVideo: true,
		url: 'http://www.hexagonsi-ps.com:8080/live?app=live&stream=demo'+no
	},
	{
		//autoCleanupMaxBackwardDuration: 5,
		//autoCleanupMinBackwardDuration: 3,
		enableWorker: true,
		enableStashBuffer: false,
		stashInitialSize: 128,
	});

	flvPlayerCur = flvPlayer;
	
	flvPlayer.attachMediaElement(videoElement1);
	flvPlayer.load();
	if(isPlay)
		flvPlayer.play();
}	

function startVideo(){
	console.log('start video');
	if(flvjs.isSupported()){
		startSingleVideoChannel('left',4,false);
	}
	else
		console.log('not support playing flv');
}

/*
leftVideoElement.addEventListener('click', function(){
	console.log( 'support request video:' + flvjs.getFeatureList().mseFlvPlayback + ' support live flv:' + flvjs.getFeatureList().mseLiveFlvPlayback );
	reloadVideo();
})
*/
function destoryVideo(){

	flvPlayerCur.pause();
	flvPlayerCur.unload();
	flvPlayerCur.detachMediaElement();
	flvPlayerCur.destroy();
	flvPlayerCur = null;
}

function reloadVideo(){
	alert('reload');
	destoryVideo();
	startVideo();
}

function hideVideoElement(){
	//videoComponent.hide();
	destoryVideo();
}

function showVideoElement(){
	//videoComponent.show();
	startVideo();
}

var videojs={};
videojs.startVideo = startVideo;
videojs.stopVideo = destoryVideo;