const SEARCH_BAR_HELP = "Input the query you want to send, fully or partially. " +
"If you are familiar with REGEX, you can use it here. " +
"If you want to search for fursuiters that have the selected criterion unfilled, type ^$";

const INITIAL_CONTAINER_SIZE = 150;//pixels

$(function(){
	console.log("ready!");
	var s_country_menu = $("#country-menu");
	var s_info_dialog = $("#info-dialog");
	var s_info_box = $("#info-box");
	var s_photo_screen = $("#photo-screen");
	var s_back_to_top_button = $("#back-to-top-button");

	//jquery UI initializations
	$( document ).tooltip();
	s_info_dialog.dialog();
	$(".ui-dialog-titlebar").hide();
	s_info_dialog.dialog('close');
	s_info_dialog.click(function(){
		s_info_dialog.dialog('close'); 
		deselect_all();
	});

	var is_mobile_browser = function(){
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	};

	var source_data;
	// indexes to be shown, in order of showing. Will be required for filtering and sorting
	var shown_indicies = [];
	const pic_id_prefix = "pic-";

	var get_info = function(id){
		//takes the id of a picture and returns full info in HTML for the info box.
		var index = parseInt(id.slice(pic_id_prefix.length));
		var result = "";

		var gender;
		switch(source_data[index]["FursuitGender"].toLowerCase()){
			case "male":
			gender = '<img class ="gender-symbol" src="css/male_symbol.svg" alt="Male"/>';
			break;
			case "female":
			gender = '<img class ="gender-symbol" src="css/female_symbol.svg" alt="Female"/>';
			break;
			default: 
			gender = '<span style="color: black">???</span>';
			break;
		}

		var wearer = source_data[index]["FursuitWearer"]?source_data[index]["FursuitWearer"]:"???";
		var species = source_data[index]["FursuitSpecies"]?source_data[index]["FursuitSpecies"]:"???";
		var country = source_data[index]["CountryName"]?"" 
		+ '<span id="country-flag" class="flag flag-' + source_data[index]["CountryCode"].toLowerCase() + '"></span>'
		+ '<span class="country-texts">' + source_data[index]["CountryName"] + '</span>'
		+ "":"???";

		result += "<p>Character name: " + source_data[index]["FursuitNickName"] + "</p>";
		result += '<p id="country-info-line"><span class="country-texts">Country: </span>' + country + "</p>";
		result += "<p>Species: " + species + "</p>";
		result += "<p>Wearer: " + wearer + "</p>";
		result += '<p><span class="gender-texts">Gender: </span>' + gender + "</p>";

		return result;
	};//get_info

	var set_countries_menu = function() {
		var arrayInArray = function(arr, value){
				//checks if a array is in array
				for(var i=0; i<arr.length; i++){
					// console.debug(arr, value, arr==value);
					if(value.length == arr[i].length){
						var equal = true;
						for(var j=0;j<value.length;j++){
							if(value[j]!=arr[i][j]){
								equal = false;
								break;
							}
						}
						if(equal)return true;
					}
				}
				return false;
			};

		//initial setup of countries filter menu
		var unique_countries = [];
		for(var i=0; i<source_data.length; i++){
			var country = [source_data[i]["CountryCode"], source_data[i]["CountryName"]];
			if(!arrayInArray(unique_countries, country)){// not in array
				unique_countries.push(country);
			}
		}//for

		unique_countries.sort(function(a, b){
			if(a[1]<b[1])return -1;
			if(a[1]>b[1])return 1;
			return 0;
		});

		console.debug(unique_countries);

		$.each(unique_countries, function(key, vall) {
			$('#country-menu').append($("<option/>", {
				class: "country-option",
				value: vall[0], //country code
				text: vall[1] //country name
			}));
		});//each
	};//set_countries_menu

	var collect_data = function(){
		//collects data from server
		//noinspection JSUnusedLocalSymbols
		$.ajax({
			url: "get_data",
			type: "GET",
			dataType: "Json",
			success: function(data, status){
				source_data = data;
				shown_indicies = [];
				//fill with all
				reset_shown_indicies_array();
				set_countries_menu();
				show_photos();
				reinitialize_photoscreen();
			}//success
		});//ajax
	};//collect_data

	var show_photos = function(){
		console.log(source_data);//debug

		for(var k=0;k<shown_indicies.length;k++)
		{       
			var i = shown_indicies[k];
			var border_color;

			switch(source_data[i]["FursuitGender"].toLowerCase()){
				case "male":
				border_color = 'rgb(0,100,255)';
				break;
				case "female":
				border_color = 'rgb(255,0,100)';
				break;
				default: 
				border_color = 'rgb(230,230,230)';
				break;
			}

			var img_container = $('<div>', {
				class: 'photo-container',
				id: pic_id_prefix+i+'-container',
				style: 'background: url(' + "img/"+source_data[i]["ImageFilename"] + ");" +
				"border-color:" + border_color + ";"
			});

			var flag_thumbnail = $('<div>', {
				class: 'flag flag-' + source_data[i]["CountryCode"].toLowerCase() + ' flag-thumbnail'
			});

			flag_thumbnail.appendTo(img_container);
			img_container.appendTo('#photo-screen');

			//setting hover behaviour for images
			if(!is_mobile_browser())
			{  

				$("#"+pic_id_prefix+i+'-container').click(function(){
						deselect_all();
						select_photo($(this));
						s_info_box.addClass("info-box-selected");
						s_info_box.html("<p>[SELECTED]</p>" + get_info(this.id));
					});//click

				//deselect of escape
				$(document).keyup(function(e) {
					 if (e.keyCode == 27){// escape key maps to keycode `27`
					 	deselect_all();
					 	s_info_box.removeClass("info-box-selected");
					 }
					});

				//on desktop browsers show the custom tooltip on hover
				$("#"+pic_id_prefix+i+'-container').hover(
					function(){
						var classes = $(this).attr("class").split(' ');

							//sets what to do when a pic is hovered
							if(!s_info_box.hasClass("info-box-selected")){
								s_info_box.html(get_info(this.id));
							}
							s_info_box.addClass("info-box-visible");

							$(this).addClass("hovered");//default behaviour
							//cannot set color dynamically, will have to do it here
							$(this).css({"box-shadow": "10px 10px 20px "
								+ $(this).css("border-top-color")
								+" inset"
								+", -10px -10px 20px "
								+ $(this).css("border-top-color")
								+" inset"
							});

						},//end enter function
						function(){
							var classes = $(this).attr("class").split(' ');

							$(this).removeClass("hovered");
							$(this).css({"box-shadow": ""});//remove dynamical shadow

						//sets what to do when a pic is not hovered over anymore
						s_info_box.removeClass("info-box-visible");
					/*end exit function*/});
				}//if(!is_mobile_browser())

				else
				{
					//it's a mobile browser, show a dilaog instead
					$("#"+pic_id_prefix+i+'-container').click(function(){
						deselect_all();
						select_photo($(this));

						s_info_dialog.html(get_info(this.id));
						s_info_dialog.dialog('close');
						s_info_dialog.dialog('open');
					});//click
				}//else

		}//for

		reinitialize_photoscreen();

		$("#fursuit-count").text(shown_indicies.length);

	};//show_photos

	var select_photo = function(obj){
		obj.addClass("selected");
	}

	var deselect_all = function(){
		$(".photo-container").removeClass("selected");
	}

	var remove_all_pics = function(){
		//removes all pics from screen
		$(".photo-container").remove();
	};

	var reset_shown_indicies_array = function(){
		for(var i=0;i<source_data.length;i++){shown_indicies[i]=[i];}
	};

	var set_photoscreen_margins = function(){
		//sets the margins of the main screen so the header and footer wouldn't overlap it
		var header_height = $("#header").outerHeight(true);
		s_photo_screen.css({"margin-top": header_height});

		var footer_height = $("#footer").outerHeight(true);
		s_photo_screen.css({"margin-bottom": footer_height});
	};

	var resize_photocontainers = function(){
		var window_width = $(window).width();

		var n_containers = Math.floor(window_width/INITIAL_CONTAINER_SIZE) + 1;
		var container_size = Math.floor(window_width/n_containers);

		$(".photo-container").css({"height": container_size, "width": container_size});
	};

	/////MAIN/////////

	collect_data();//run ajax

	if(!is_mobile_browser())
	{  
		//no info box in mobile browsers, so we won't need the movement of it depending on mouse position
		s_photo_screen.mousemove(function(event){
		//moves infobox so it wouldn't get in a way depending on mouse location
		var mouseX = event.clientX;
		var mouseY = event.clientY;
		var window_width = $(window).width();
		var window_height = $(window).height();
		var middleX = window_width / 2;
		var middleY = window_height / 2;
		var infobox_height = s_info_box.outerHeight(true);
		var infobox_position_top = document.getElementById("info-box").getBoundingClientRect()["top"];
		// console.debug(mouseX, mouseY, window_width, window_height, infobox_height, infobox_position_top);


		if(mouseY < (infobox_position_top + infobox_height) || mouseY < middleY)
		{
			if(mouseX < middleX)
			{
				s_info_box.css({"right": "0"});
			}
			else
			{
				s_info_box.css({"right": "auto"});
			}
		}
		});//s_photo_screen.mousemove
	}//if(!is_mobile_browser())

	var reinitialize_photoscreen = function(event){
		set_photoscreen_margins(event);
		resize_photocontainers(event);
	};

	$(window).resize(reinitialize_photoscreen);//resize
	$("button[class*='navbar-toggle']").click(function(){setTimeout(set_photoscreen_margins,1000);});//bodging! not sure how to make it run after the opening of dropdown panel

	$(window).scroll(function(){
		//show/hide back-to-top button
		//http://www.2my4edge.com/2015/03/responsive-back-to-top-using-bootstrap.html
		if ($(this).scrollTop() > 250) 
		{
			s_back_to_top_button.fadeIn();
		} 
		else 
		{
			s_back_to_top_button.fadeOut();
		}
	});

	s_back_to_top_button.click(function(){
		$('body,html').animate({
			scrollTop: 0
		}, 800);
		return false;
	});
	//hide in the beginning
	s_back_to_top_button.css({"display": "none"});

	//////////////////
	//////FILTERING-RELATED STUFF
	/////////////////

	$("#search-bar").attr({"title": SEARCH_BAR_HELP});

	var filter_by_country = function(){
		//don't apply filter if all countries are selected
		if("all" == s_country_menu.val()){return;}

		var found = [];//indicies of found elements
		for(var j=0;j<shown_indicies.length;j++){
			var index = shown_indicies[j];
			if(source_data[index]["CountryCode"] == s_country_menu.val())
			{
				found.push(index);
			}
		}//for
		shown_indicies = found;
	};

	var filter_by_search = function(){
		var search_by = $("#search-by-menu").val();
		var search_query = $("#search-bar").val().toLowerCase();

		// skip this filter if nothing is written in search
		if(search_query == "")return;

		var found = [];//indicies of found elements
		for(var j=0;j<shown_indicies.length;j++){
			var index = shown_indicies[j];
			var source = source_data[index][search_by];
			if(typeof source != "string"){source ="";}

			if(search_query == "")
			{
				if(source == "")
				{
					//if the query is empty, show all entries that have this field empty
					found.push(index);
				}
			}
			else
			{
				var re_pattern = new RegExp(search_query, 'gi');
				if(source.toLowerCase().match(re_pattern))
				{
					found.push(index);
				}
			}
		}//for

		shown_indicies = found;

	};//filter_by_search

	var filter_by_gender = function(){
		var males = $("#male-gender-option").is(":checked");
		var females = $("#female-gender-option").is(":checked");
		var unspec = $("#unspecified-gender-option").is(":checked");

		var found = [];//indicies of found elements
		for(var j=0;j<shown_indicies.length;j++){
			switch(source_data[j]["FursuitGender"])
			{
				case "Male":
				if(males){
					found.push(j);
				}
				break;
				case "Female":
				if(females){
					found.push(j);
				}
				break;                
				default:
				if(unspec){
					found.push(j);
				}
				break;
			}//switch
		}//for
		shown_indicies = found;
	};

	var clear_search = function(){
		$("#search-bar").val("");
		master_filter();
		return false;//prevent repetitive submission. No idea why a BUTTON submits too...
	};

	var master_filter = function(event){
		remove_all_pics();
		reset_shown_indicies_array();
		filter_by_gender(event);
		filter_by_country(event);
		filter_by_search(event);
		show_photos();
	};

	//setting the master to filter elements
	$(".gender-option").change(master_filter);
	s_country_menu.change(master_filter);
	$("#search-form").submit(master_filter);//search form behaviour on both Enter and search button click
	$("#clear-search-button").click(clear_search);

});//$
