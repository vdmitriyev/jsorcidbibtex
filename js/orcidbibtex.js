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
		var _htmlTmp = '';
		var convertedResults = {};
		
		for (var i =0 ; i < works.length; i++){
			//_htmlTmp += '<strong>Title: </strong>' + works[i]['work-title']['title']['value'] + '</br></br>'
			//_htmlTmp += '<strong>BibTeX: </strong>' + works[i]['work-citation']['citation'] + '</br></br>'
			//_htmlTmp += '<strong>JSON: </strong>' + JSON.stringify(jsonBibtex) + '</br></br>'
			var jsonBibtex = bibtexParse.toJSON(works[i]['work-citation']['citation']);
			
			_htmlTmp = adaptBibTexToTemplate(jsonBibtex, works[i]['work-citation']['citation']) + '</br>'			
			
			var newYear = JSON.stringify(works[i]['publication-date']['year']['value']);
			
			if (!(newYear in convertedResults)){
				convertedResults[newYear] = new Array();
			}

			convertedResults[newYear].push(_htmlTmp)
		}
		
		var keys = Object.keys(convertedResults),
		keys.sort().reverse();
		
		for (var i = 0; i < keys.length; i++) {
			k = keys[i];
			for (var j = 0 ; j < convertedResults[k].length; j++){
				_htmlOutput += '<div>' + convertedResults[k][j]	+ '</div>';
			}
		}
		
		$('.bibtexArea').html(_htmlOutput);
	}
	
	function adaptBibTexToTemplate(jsonBibtex, bibtex){
		
		var template = $('.htmlOutputTemplate').html();
		var obj = $.parseJSON(JSON.stringify(jsonBibtex));
		var htmlOutput = '';
		
		console.log(obj[0]);
		//console.log(template);
		
		template = template.split(',').join('');
		
		var  tplValues = new Array('Title', 'Author', 'Journal', 'Year', 'Doi', 'Url', 'Bibtex');
		
		for (var i = 0 ; i < tplValues.length; i++){
			var field = tplValues[i];			
			var value = "";
			
			try {
				var value = obj[0]['entryTags'][field.toLowerCase()];
			}catch(err){
				console.log(err);
			}
			
			// forming proper naming
			if (field == 'Author'){
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
					singleName = singleName.split('{').join('');
					singleName = singleName.split('}').join('');
					
					tempValue = tempValue + singleName + ', ';
				}
				
				value = tempValue.substring(0, tempValue.length - 2);
				value = replaceLaTeXSpecials(value);
			} 
			
			if (field == 'Title'){
				value = replaceLaTeXSpecials(value);
			}
			
			if (field == 'Doi'){
				if (typeof value !== "undefined"){
					try{
						if (value.startsWith('http')){
							value = '<a href="' + value + '">DOI</a>';
						} else {
							value = '<a href="http://dx.doi.org/' + value + '">DOI</a>';
						}
					} catch(err){
						console.error(err);
					}
				} else {
					console.log("DOI is not presented");
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
			
			if (field == 'Journal'){
				
				value = typeof value === "undefined" ? obj[0]['entryTags']['booktitle'.toLowerCase()] : value;
				
				if (typeof value !== "undefined")
					value = replaceLaTeXSpecials(value);
			}
				
		
			template = template.replace( '{' + field + '}', typeof value === "undefined" ? " " : value + ",");
		}
		
		return template;
	}
	
	function replaceLaTeXSpecials(input){
		
		// special German, Spanish, etc. symbols
		var UMLAUT_TO_LATEX = { 
				'Ö' : ['\\"{O}'],
				'ö' : ['\\"{o}', '\\"o'],
				'ä' : ['\\"{a}', '\\"a'],
				'Ä' : ['\\"{A}'],
				'Ü' : ['\\"{U}'],
				'ü' : ['\\"{u}', '\\"{u}', '\\"{u}'],
				'ß' : ['{\\ss}'],
				'ó' : ["{\\'o}", "\\'{o}", "\\'o"],
				'é' : ["\\'{e}", "\\'e"]
		};
		
		var result = input;
		
		for (var key in UMLAUT_TO_LATEX) {
			for (var i = 0; i < UMLAUT_TO_LATEX[key].length; i++){
				result = result.replace(UMLAUT_TO_LATEX[key][i], key);
				result = result.replace( '{' + UMLAUT_TO_LATEX[key][i] + '}', key);
			}
		}
		
		return result;
	}
}

$( document ).ready( readyOnLoad );
