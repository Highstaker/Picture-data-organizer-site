const SEARCH_BAR_HELP = "<p>Input the query you want to send, fully or partially.</p>" +
"<p>If you want to search for fursuiters that have the selected criteria unfilled, type ^$</p>"+
"<p>If you are familiar with REGEX, you can use it here.</p>";

$(function(){
    console.log("ready!");

    var source_data;
    // indexes to be shown, in order of showing. Will be required for filtering and sorting
    var shown_indicies = [];
    const pic_id_prefix = "pic-"

    var get_info = function(id){
        //takes the id of a picture and returns full info in HTML for the info box.
        index = parseInt(id.slice(pic_id_prefix.length));
        result = "";

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
                text: vall[1], //country name
            }));
        });//each
    }//set_countries_menu

    var collect_data = function(){
        //collects data from server
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
            $("#"+pic_id_prefix+i+'-container').hover(
                    function(event){
                        classes = $(this).attr("class").split(' ');
                        // console.debug(classes);
                        // console.debug(classes.indexOf("dimmed-pic"));

                        if(classes.indexOf("dimmed-pic") == -1){
                            //sets what to do when a pic is hovered
                            $("#info-box").html(get_info(this.id));
                            $("#info-box").css({"opacity": "1"});

                            $(this).css({"box-shadow": "10px 10px 20px "
                                + $(this).css("border-top-color")
                                +" inset"
                                +", -10px -10px 20px "
                                + $(this).css("border-top-color")
                                +" inset"
                            });
                        }//if
                            
                        },//end enter function
                    function(event){
                        classes = $(this).attr("class").split(' ');

                        //sets what to do when a pic is not hovered over anymore
                        $("#info-box").css({"opacity": "0"});
                        if(classes.indexOf("dimmed-pic") == -1){
                            $(this).css({"box-shadow": "none"});//remove shadow
                        }
                        /*end exit function*/});
        }//for

        $("#fursuit-count").text(shown_indicies.length);

    };//show_photos

    var dim_all_pics = function(){
        for(var k=0; k<shown_indicies.length; k++)
        {
            index = shown_indicies[k];
            $(".photo-container").addClass("dimmed-pic");
            $('.photo-container').css('box-shadow', '');//removing inline styling
        }

    };//dim_all_pics

    var undim_pic = function(id){
        $("#"+pic_id_prefix+id+"-container").removeClass("dimmed-pic");
    };//undim_pic

    var undim_all_pics = function(){
        for(var k=0; k<shown_indicies.length; k++)
        {
            index = shown_indicies[k];
            undim_pic(index);
        }

    };//undim_all_pics

    var remove_all_pics = function(){
        //removes all pics from screen
        $(".photo-container").remove();
    };

    var reset_shown_indicies_array = function(){
        for(var i=0;i<source_data.length;i++){shown_indicies[i]=[i];}
    }

    var set_photoscreen_margins = function(event){
        //sets the margins of the main screen so the header and footer wouldn't overlap it
        var header_height = $("#header").outerHeight(true);
        $("#photo-screen").css({"margin-top": header_height});

        var footer_height = $("#footer").outerHeight(true);
        $("#photo-screen").css({"margin-bottom": footer_height});
    }

    /////MAIN/////////

    collect_data();//run ajax

    $("#photo-screen").mousemove(function(event){
        //moves infobox so it wouldn't get in a way depending on mouse location
    	var mouseX = event.pageX;
    	var mouseY = event.pageY;
        var window_width = $(window).width();
    	var window_height = $(window).height();
    	var middleX = window_width / 2;
        var middleY = window_height / 2;

        if(mouseY < middleY){
    	if(mouseX < middleX)
	    	{
	    		$("#info-box").css({"right": "0"});
	    	}
	    	else
	    	{
	    		$("#info-box").css({"right": "auto"});
	    	}
        }
    });//$("#photo-screen").mousemove

    set_photoscreen_margins();
    $(window).resize(set_photoscreen_margins);
    $("button[class*='navbar-toggle']").click(function(){setTimeout(set_photoscreen_margins,1000);});//bodging! not sure how to make it run after the opening of dropdown panel

    //////////////////
    //////FILTERING-RELATED STUFF
    /////////////////

    $("#search-bar").hover(function(event){
        $("#info-box").html(SEARCH_BAR_HELP);
        $("#info-box").css({"opacity": "1"});
    },
    function(event){
        $("#info-box").css({"opacity": "0"});
    });

    var filter_by_country = function(event){
        //don't apply filter if all countries are selected
        if("all" == $("#country-menu").val()){return;}

        var found = [];//indicies of found elements
        for(var j=0;j<shown_indicies.length;j++){
            var index = shown_indicies[j];
            if(source_data[index]["CountryCode"] == $("#country-menu").val())
            {
                found.push(index);
            }
        }//for
        shown_indicies = found;
    };

    var filter_by_search = function(event){
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

    var filter_by_gender = function(event){
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
    }

    var clear_search = function(event){
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
    $("#country-menu").change(master_filter);
    $("#search-form").submit(master_filter);//search form behaviour on both Enter and search button click
    $("#clear-search-button").click(clear_search);

});//$
