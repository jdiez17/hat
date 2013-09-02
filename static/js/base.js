$(document).ready(function(){

	$('#url').keypress(function(e) {
		if(e.which == 13) {
			var url = $(this).val();
			$(this).val('');
			$('ul.bookmarks li.editable').clone().prependTo('ul.bookmarks').addClass('new editable visible');
			$('.new .h2').val(url);
			$('.new .h1').focus();
		}
	})
	$('.edit').on('click', function(){
		parent = $(this).parent().parent();
		title = parent.children('h1');
		url = parent.children('h2');
		tags = parent.children('h3');

		// Add class editable and show the element
		parent.addClass('editable visible');

		// <h1> -> <input class="h1">
		title.hide();
		title.parent().append('<input type="text" class="h1 editing" placeholder="A somewhat descriptive title" value="'+title.text()+'">');
		setTimeout(function(){
			parent.children('.h1').focus();
		}, 100);

		// <h2> -> <input class="h2">
		url.hide();
		url.parent().append('<input type="url" class="h2 editing" placeholder="http://" value="'+url.text()+'">');

		// <h3> -> <input class="h3">
		tags.hide();
		tags.parent().append('<input type="text" class="h3 editing" placeholder="tags, separated like, this" value="'+tags.text()+'">');
	})

	$('ul').on('blur', 'li.editable.visible .editing', function(){
		onFormBlur = setTimeout(function(){

			newparent = $('li.editable.visible');
			newtitle = newparent.children('.h1');
			newurl = newparent.children('.h2');
			newtags = newparent.children('.h3');

			// Remove class editable and show the element
			newparent.removeClass('editable visible');

			// Guardar los valores de los input en el server y cambiarlos por los anteriores elementos
			// <input class="h1"> -> <h1>
			title.show().children('a:first-child').html(newtitle.val()).attr('href', newurl.val());
			newtitle.remove();
			
			// <input class="h2"> -> <h2>
			url.show().children('a').html(newurl.val()).attr('href', newurl.val());
			newurl.remove();

			// <input class="h3"> -> <h3>
			// Aquí habría que cambiar los tags raw por enlaces a tags
			tags.show().html(newtags.val());
			newtags.remove();

		}, 100)
	}).on('focus', 'li.editable.visible .editing', function(){
		clearTimeout(onFormBlur);
	})

});

var onFormBlur, parent, title, url, tags, newparent, newtitle, newurl, newtags;