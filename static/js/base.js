function do_add_url() {
    var template = $(".editable");
    var populate = template.clone().addClass("visible");
    populate.find(".url").val($("#url").val());

    template.parent().append(populate);
    populate.find(".title").focus();

    populate.find(".tags").keypress(function(e) {
        if(e.which == 13) {
            save_link(populate);
        }
    });
    populate.find(".delete").click(function(e) {
        populate.remove();
    });
    populate.find(".save").click(function(e) {
        save_link(populate);
    });
}

function save_link(obj) {
    link = {
        'url': obj.find(".url").val(),
        'tags': obj.find(".tags").val().trim().split(","),
        'title': obj.find(".title").val()
    };
    console.log(link);
}

$(document).ready(function(){
    $("#url").keypress(function(e) {
        if(e.which == 13) {
            do_add_url();
            $("#url").val("");
        }
    });
});
