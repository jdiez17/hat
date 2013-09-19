String.prototype.tagsplit = function() {
    return this.toString().split(",").map(function(e) { 
        return e.trim();
    }).filter(function(e) {
        return e != "";   
    });
};

function do_add_url() {
    var template = $(".editable");
    var populate = template.clone().addClass("visible");
    populate.find(".url").val($("#url").val());

    template.parent().prepend(populate);
    populate.find(".title").focus();

    populate.keypress(function(e) {
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

function save_link(orig) {
    link = {
        'url': orig.find(".url").val(),
        'tags': orig.find(".tags").val().tagsplit(),
        'title': orig.find(".title").val()
    };

    $.post("/api/link", link, function(response) {
        obj = JSON.parse(response);

        if(obj['status'] == "ok") {
            var template = $(".hidden");
            var populate = template.clone();

            populate.find(".title")
                .attr('href', link['url'])
                .text(link['title']);

            populate.find(".link")
                .attr('href', link['url'])
                .text(link['url']);

            populate.find("h3")
                .text(link['tags'].join(', '));

            populate.removeClass("hidden template");
            populate.attr('id', 'bookmark_' + obj['id']);

            template.parent().prepend(populate);
            orig.remove();
        }
    });


}

$(document).ready(function(){
    $("#url").keypress(function(e) {
        if(e.which == 13) {
            do_add_url();
            $("#url").val("");
        }
    });
});
