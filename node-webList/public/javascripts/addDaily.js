/* 
 * 发表日报 周报页面JS
 */
(function() {
	var curTime = new Date();
	curTime = curTime.format('yyyy/MM/dd');
	KindEditor.ready(function(K) {
		var editor = K.create('textarea[name="content"]', {
			allowFileManager : true
		});
		$('#submit_btn').click(function() {
			$('#messageContent').val(editor.html());
			if($('#title').val().replace(/\s*/g,'') === '') {
				var nickname = $('input[name=which]:checked').attr('nickname');
				$('#title').val('《'+curTime+'的'+nickname+'》');
			}
		});
	});
	
	$('#title').attr('placeholder','默认为《'+curTime+'的日报》');

	$('input[name=which]').click(function() {
		var which = this.id;
		if(which == 'rb') {
			//日报
			$('#baoTitle').text('发表日报');
			$('#title').attr('placeholder','默认为《'+curTime+'的日报》');
			// if($('#title').val().replace(/\s*/g,'') === '') {
			// 	$('#title').val('《'+curTime+'的日报》');
			// }
		}else{
			//周报
			$('#baoTitle').text('发表周报');
			$('#title').attr('placeholder','默认为《'+curTime+'的周报》');
			// if($('#title').val().replace(/\s*/g,'') === '') {
			// 	$('#title').val('《'+curTime+'的周报》');
			// }
		}
	})


})();



