// Some utilities

// visibility of particular block
function toggleVisibility(id) {
	
	var e = document.getElementById(id);
	if(e.style.display == 'block')
		e.style.display = 'none';
	else
		e.style.display = 'block';
	  
  //$(id).toggle();
}

// Generating uniques ID
function uniqID(idlength) {
	
	var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < idlength; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}