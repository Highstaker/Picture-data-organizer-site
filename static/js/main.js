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
                for(var i=0; i<data.length;i++){shown_indicies[i]=i;};
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

            $(".photo-container").hover(
                    function(event){
                        classes = $(this).attr("class").split(' ');
                        // console.debug(classes);
                        // console.debug(classes.indexOf("dimmed-pic"));

                        if(classes.indexOf("dimmed-pic") == -1){
                            //sets what to do when a pic is hovered
                            $("#info-box").html(get_info(this.id));
                            $("#info-box").css({"opacity": "1"});

                            $(this).css({"box-shadow": "10px 10px 20px " 
                                + $(this).css("border-color")
                                +" inset"
                                +", -10px -10px 20px " 
                                + $(this).css("border-color")
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

    var clear_search = function(){
        console.debug("clearing!");
        remove_all_pics();
        for(var i=0;i<source_data.length;i++){shown_indicies[i]=[i];}
        show_photos();
        return false;//prevent repetitive submission. No idea why a BUTTON submits too...
    };

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

    //search form behaviour on both Enter and search button click
    $("#search-form").submit(function(event){
        console.debug($("#search-bar").val());//debug
        // $("#search-bar").val("Doesn't work yet!");//debug
        // console.debug(shown_indicies);//debug
        // console.debug("search by " + $("#search-by-menu").val());
        // console.debug("search by " + $("#search-by-menu option:selected").text());
        var search_by = $("#search-by-menu").val();
        console.debug("search by " + search_by);

        clear_search();//search in ALL values at all times

        var found = [];//indicies of found elements
        for(var k=0;k<shown_indicies.length;k++){
            index = shown_indicies[k];
            var source = source_data[index][search_by];
            if(typeof source != "string"){source ="";}

            if(source.toLowerCase() == $("#search-bar").val().toLowerCase())
            {
                found.push(index);
            }
        }//for
        console.debug(found);//debug

        if(found.length > 0)
        {
            remove_all_pics();
            shown_indicies = found;
            show_photos();
        }

    });//$("#search-form").submit(function(event

    $("#clear-search-button").click(clear_search);


});//$
