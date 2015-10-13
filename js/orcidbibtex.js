/*
The MIT License (MIT)

Copyright (c) 2015 Viktor Dmitriyev

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*****************************************/

/**
 * jQuery plugin for extracting BibTeX data from particular ORCID ID
 *
 * @author Viktor Dmitriyev
 */
function readyOnLoad( jQuery ) {
	
    //settings
    var WIDGET_NAME = "ORCID BibTeX Extractor";
    var WIDGET_ID = "ORCID_BibTeX";
	var loadingInfoMsgHTML = 'Please wait while BibTeX is loading ...'
	var loadingWarningMsgHTML = 'In case loading takes too much time try ORCID directly ';
	var loadingErrorMsgHTML = 'Something went wrong. Please, contact web administrator.';
	
	// get orcid account
	var orcidAccount = $('#orcidAccount').val();
	console.log("ORCID Account: " + orcidAccount);
	
	if (typeof orcidAccount === "undefined") {
		console.log('ORCID Account was not defined!');
		console.log('Use following HTML');		
		console.log('<input type="hidden" name="name" id="orcidAccount" value="0000-0001-5661-4587" size="40" class=""/>');
		$('.bibtexArea').html(loadingErrorMsgHTML);
	} else{
		showORCIDWorks(orcidAccount);
	}
	
	/**
	 * extracts and shows BibTeX of particular ORCID ID
	 *
	 * @param  {object} obj      javascript object represent the input target field
	 * @param  {object} settings local settings of the plugin
	 * @return {void}            this will modify the DOM based on the search result
	 */
	function showORCIDWorks(orcidAccount){
		
		console.log('Starting showORCIDWorks');
			
		$('.bibtexArea').html('<center>' + loadingInfoMsgHTML + '</br>' + loadingWarningMsgHTML + '<a href="http://orcid.org/' + orcidAccount + '">here</a>' + '</center>');
		
		$.ajax({
			url: "http://pub.orcid.org/" + encodeURIComponent(orcidAccount) + '/orcid-works', 
	
			dataType: 'jsonp',
			success: function(data){					
				console.log('success');
			},
			error: function(xhr){
				console.error(xhr);
			}
		}).done(function(data) {
			var works = data['orcid-profile']['orcid-activities']['orcid-works']['orcid-work'];
			var _htmlOutput = '';
			
			for (var i =0 ; i < works.length; i++){
				_htmlOutput += '<strong>Title: </strong>' + works[i]['work-title']['title']['value'] + '</br></br>'
				_htmlOutput += '<strong>BibTeX: </strong>' + works[i]['work-citation']['citation'] + '</br></br>'
				var jsonBibtex = bibtexParse.toJSON(works[i]['work-citation']['citation']);
				_htmlOutput += '<strong>JSON: </strong>' + JSON.stringify(jsonBibtex) + '</br></br>'
				_htmlOutput += '<hr>'
			}
			
			$('.bibtexArea').html(_htmlOutput);
			
		});
	}
}

$( document ).ready( readyOnLoad );