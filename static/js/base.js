String.prototype.tagsplit = function() {
    return this.toString().split(",").map(function(e) { 
        return e.trim();
    }).filter(function(e) {
        return e != "";   
    });
};

function url_edit_element(url, title, tags) {
    var template = $(".editable");
    var populate = template.clone().addClass("visible");

    populate.find(".url").val(url);
    populate.find(".title").val(title);
    populate.find(".tags").val(tags.join(', '));


    return populate;
}

function do_add_url() {
    var template = $(".editable");
    var populate = url_edit_element($("#url").val(), "", []);

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

    template.parent().prepend(populate);
    populate.find(".title").focus();
}

function show_entry(orig, id) {
    var template = $(".hidden");
    var populate = template.clone();

    link = {
        'url': orig.find(".url").val(),
        'tags': orig.find(".tags").val().tagsplit(),
        'title': orig.find(".title").val()
    }; 

    populate.find(".title")
        .attr('href', link['url'])
        .text(link['title']);

    populate.find(".link")
        .attr('href', link['url'])
        .text(link['url']);

    populate.find("h3")
        .text(link['tags'].join(', '));

    populate.find(".edit")
        .click(function() { edit_link(populate[0]); });

    populate.removeClass("hidden template");
    populate.data('id', id);

    orig.replaceWith(populate);
}

function link_object(orig) {
    return {
        'url': orig.find(".url").val(),
        'tags': orig.find(".tags").val().tagsplit(),
        'title': orig.find(".title").val()
    };
}

function edit_link(elm) {
    var orig = $(elm);
    var link = {
        'url': orig.find(".url").text(),
        'tags': orig.find("h3").text().tagsplit(),
        'title': orig.find(".title").text()
    };
    var edit_element = url_edit_element(link['url'], link['title'], link['tags']);
    var save_function = function(e) {
        $.ajax({
            'type': 'PUT',
            'url': '/api/link/' + orig.data('id'),
            'data': link_object(edit_element),
            'success': function(data, status, xhr) {
                show_entry(edit_element, edit_element.data('id'));
            }
        });
    }

    edit_element.find(".delete").click(function(e) {
        $.ajax({
            'type': 'DELETE',
            'url': '/api/link',
            'data': {'id': orig.data('id')},

            'success': function(data, status, xhr) {
                edit_element.remove();
            }
        });
    });

    edit_element.find(".save").click(save_function);
    edit_element.keypress(function(e) {
        if(e.which == 13) {
            save_function(e);
        }
    });

    orig.replaceWith(edit_element);

}


function save_link(orig) {
    $.post("/api/link", link_object(orig), function(response) {
        obj = JSON.parse(response);

        if(obj['status'] == "ok") {
            show_entry(orig, obj['id']);
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
