$(function(){
    console.log("ready!");

    var source_data;
    var pic_id_prefix = "img-"

    var get_info = function(id){
        //takes the id of a picture and returns full info in HTML for the info box.
        index = parseInt(id.slice(pic_id_prefix.length));
        result = "";
        // console.log(index);

        result += "<p>Character name: " + source_data[index]["Fursuit"] + "</p>";
        result += "<p>Country: " + source_data[index]["Country"] + "</p>";
        result += "<p>Species: " + source_data[index]["Species"] + "</p>";
        result += "<p>Wearer: " + source_data[index]["Wearer"] + "</p>";

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
            // var img = $('<img>', {
            //     id: 'pic-'+i,
            //     class: 'photo',
            //     src: "img/"+source_data[i]["image_filename"]
            // });

            // var centering_helper= $('<div>', {
            //     class: 'centering-helper'
            // });

            var img_container = $('<div>', {
                class: 'photo-container',
                id: 'pic-'+i+'-container',
                style: 'background: url(' + "img/"+source_data[i]["image_filename"] + ");"
            });
            // centering_helper.appendTo(img_container);
            // img.appendTo(img_container);
            img_container.appendTo('#photo-screen');
        }
    };//show_photos

    collect_data();//run ajax

    $("#photo-screen").mousemove(function(event){
    	var mouseX = event.pageX;
    	var mouseY = event.pageY;
    	var window_width = $(window).width()
    	var middle = window_width / 2;
    	// console.log(mouseX + " " + mouseY + " " + window_width + " " + middle);//debug

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
