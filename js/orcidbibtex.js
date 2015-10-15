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
 * jQuery plugin for extracting BibTeX data from particular ORCID Account
 *
 * @author Viktor Dmitriyev
 */
function readyOnLoad( jQuery ) {
	
    //settings
    var WIDGET_NAME = "ORCID BibTeX Extractor";
    var WIDGET_ID = "ORCID_BibTeX";
	var ORCID_URL_LAB = "http://feed.labs.orcid-eu.org/";
	var ORCID_URL_PUB = "http://pub.orcid.org/";
	
	
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
	 * @param  {object} orcidAccount      orcid account number
	 * @return {void}            this will modify the DOM based on the search result
	 */
	function showORCIDWorks(orcidAccount){
		
		console.log('Starting showORCIDWorks');
		$('.htmlOutputTemplate').hide();
			
		$('.bibtexArea').html('<center>' + loadingInfoMsgHTML + '</br>' + loadingWarningMsgHTML + '<a href="http://orcid.org/' + orcidAccount + '">here</a>' + '</center>');
		
		$.ajax({
			url: ORCID_URL_PUB + encodeURIComponent(orcidAccount) + '/orcid-works', 
			//url: ORCID_URL_LAB + encodeURIComponent(orcidAccount) + '?format=json', 
			//url: ORCID_URL_LAB + encodeURIComponent(orcidAccount), 
			//headers: { 
			  //      Accept : "text/x-bibliography; style=ieee"
			    //},
			//type: "GET",
	        //crossDomain: true,
			dataType: 'jsonp',
			success: function(data){
				console.log('success');
			},
			error: function(xhr){
				console.error(xhr);
			}
		}).done(function(data) {
			
			console.log('done');
			//processORCIDFormatted(data);
			processORCIDBibtex(data);
			
		});
	}
	
	function processORCIDFormatted(data){
		
		console.log('processORCIDFormatted');
		console.log(data);
		$('.bibtexArea').html(data);
		
		var jsonBibtex = bibtexParse.toJSON(data);
		console.log(jsonBibtex);
		$('.bibtexArea').html(JSON.stringify(jsonBibtex));
	}
		
	function processORCIDBibtex(data){
		
		var works = data['orcid-profile']['orcid-activities']['orcid-works']['orcid-work'];
		var _htmlOutput = '';
		
		for (var i =0 ; i < works.length; i++){
			//_htmlOutput += '<strong>Title: </strong>' + works[i]['work-title']['title']['value'] + '</br></br>'
			//_htmlOutput += '<strong>BibTeX: </strong>' + works[i]['work-citation']['citation'] + '</br></br>'
			var jsonBibtex = bibtexParse.toJSON(works[i]['work-citation']['citation']);
			//_htmlOutput += '<strong>JSON: </strong>' + JSON.stringify(jsonBibtex) + '</br></br>'
			_htmlOutput += adaptBibTexToTemplate(jsonBibtex, works[i]['work-citation']['citation']) + '</br>'			
			//_htmlOutput += '<hr>'
		}
		
		$('.bibtexArea').html(_htmlOutput);
		
	}
	
	function adaptBibTexToTemplate(jsonBibtex, bibtex){
		
		var template = $('.htmlOutputTemplate').html();
		var obj = $.parseJSON(JSON.stringify(jsonBibtex));
		var htmlOutput = '';
		
		console.log(obj[0]);
		console.log(template);
		
		var  tplValues = new Array('Title', 'Author', 'Journal', 'Year', 'Doi', 'Url', 'Bibtex');
		
		//console.log(tplValues.length);
		
		for (var i = 0 ; i < tplValues.length; i++){
			console.log(i);
			var field = tplValues[i];
			console.log(field);
			var value = "";
			
			try {
				var value = obj[0]['entryTags'][field.toLowerCase()];
			}catch(err){
				console.log(err);
			}
			
			if (field == 'Author'){
				// forming proper naming
				var splittedValue = value.split(' and ');				
				var tempValue = "";
				for (var j = 0; j < splittedValue.length; j++){
					var singleValue = splittedValue[j].split(',');
					//console.log(singleValue);
					var singleName = splittedValue[j];
					
					if (singleValue.length == 2){
						try {
							singleName = singleValue[1] + ' ' + singleValue[0];
						} catch(err) {
							console.error(err);
						}
					}
					tempValue = tempValue + singleName + ', ';
				}
				
				value = tempValue.substring(0, tempValue.length - 2);
				value = replaceLaTeXSpecials(value);
			} 
			
			if (field == 'Title'){
				value = replaceLaTeXSpecials(value);
			}
			
			if (field == 'Doi'){
				
				if (value.startsWith('http')){
					value = '<a href="' + value + '">DOI</a>';
				} else {
					value = '<a href="http://dx.doi.org/' + value + '">DOI</a>';
				}
			}
			
			if (field == 'Url'){
				value = '<a href="' + value + '">URL</a>';
			}
			
			if (field == 'Bibtex'){
				bibtex = bibtex.split('\n').join('');
				bibtex = bibtex.split('},').join('},\n');
				
				var randomUID = uniqID(20);
				value = '<a href="#" onclick="toggleVisibility(\''+randomUID+'\');return false;">BibTeX</a>';
				value += '<div id="' + randomUID + '" style="display:none;">';
				value += '<pre>' + bibtex + '</pre>';
				value += '</div>';
			}
		
			template = template.replace( '{' + field + '}', typeof value === "undefined" ? " " : value);						
			//console.log(i);
			//console.log(template);
		}
		
		return template;
	}
	
	function replaceLaTeXSpecials(input){
		
		// special german and spanish symbols
		var UMLAUT_TO_LATEX = { 
				'Ö' : ['\\"{O}'],
				'ö' : ['\\"{o}'],
				'ä' : ['\\"{a}'],
				'Ä' : ['\\"{A}'],
				'Ü' : ['\\"{U}'],
				'ü' : ['\\"{u}'],
				'ß' : ['{\\ss}'],
				'ó' : ["{\\'o}", "\\'{o}", "\\'o"]
		};
		
		var result = input;
		
		for (var key in UMLAUT_TO_LATEX) {
			for (var i = 0; i < UMLAUT_TO_LATEX[key].length; i++){
				result = result.replace(UMLAUT_TO_LATEX[key][i], key);
				//console.log(UMLAUT_TO_LATEX[key]);
			}
		}
		
		return result;
	}
}

$( document ).ready( readyOnLoad );
