$(function(){
    console.log("ready!");

    var source_data;
    var pic_id_prefix = "img-"

    var get_info = function(id){
        //takes the id of a picture and returns full info in HTML for the info box.
        index = parseInt(id.slice(pic_id_prefix.length));
        result = "";

        var gender;
        switch(source_data[index]["FursuitGender"].toLowerCase()){
            case "male":
                gender = '<span style="color: Blue">M</span>';
                break;
            case "female":
                gender = '<span style="color: Red">F</span>';
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
        result += "<p>Gender: " + gender + "</p>";

        return result;
    }

    var collect_data = function(){
        $.ajax({
            url: "get_data",
            type: "GET",
            dataType: "Json",
            success: function(data, status){
                source_data = data;
                show_photos();
                $(".photo-container").hover(
                    function(event){
                        // console.log("entered " + this.id);//debug
                        $("#info-box").css({"visibility": "visible"});
                        $("#info-box").html(get_info(this.id));
                        },//end enter function
                    function(event){
                        // console.log("leaving " + this.id);//debug
                        $("#info-box").css({"visibility": "hidden"});
                        /*end exit function*/});
            }//success
        });//ajax
    };//collect_data

    var show_photos = function(){
        console.log(source_data);//debug



        for(var i=0;i<source_data.length;i++)
        {       
            var border_color;
            switch(source_data[i]["FursuitGender"].toLowerCase()){
            case "male":
                border_color = 'rgb(0,100,255)';
                break;
            case "female":
                border_color = 'rgb(255,0,100)';
                break;
            default: 
                border_color = 'rgb(40,40,40)';
                break;
            }

            var img_container = $('<div>', {
                class: 'photo-container',
                id: 'pic-'+i+'-container',
                style: 'background: url(' + "img/"+source_data[i]["ImageFilename"] + ");" +
                "border-color:" + border_color + ";"
            });

            var flag_thumbnail = $('<div>', {
                class: 'flag flag-' + source_data[i]["CountryCode"].toLowerCase() + ' flag-thumbnail'

            });

            flag_thumbnail.appendTo(img_container);
            img_container.appendTo('#photo-screen');
        }
    };//show_photos

    collect_data();//run ajax

    $("#photo-screen").mousemove(function(event){
    	var mouseX = event.pageX;
    	var mouseY = event.pageY;
    	var window_width = $(window).width()
    	var middle = window_width / 2;

    	if(mouseX < middle)
	    	{
	    		$("#info-box").css({"right": "0"});
	    	}
	    	else
	    	{
	    		$("#info-box").css({"right": "auto"});
	    	}
    });//$("#photo-screen").mousemove


    });//$
