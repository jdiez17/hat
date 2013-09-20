var active_tags = [];

String.prototype.tagsplit = function() {
    return this.toString().split(",").map(function(e) { 
        return e.trim();
    }).filter(function(e) {
        return e != "";   
    });
};

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
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

function show_entry(link, id) {
    var template = $(".hidden");
    var populate = template.clone();

    console.log(populate.find(".title").attr('href', 'derp').text('lol'), link);

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

    return populate;
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
        var link = link_object(edit_element);
        $.ajax({
            'type': 'PUT',
            'url': '/api/link/' + orig.data('id'),
            'data': link,
            'success': function(data, status, xhr) {
                edit_element.replaceWith(show_entry(link, edit_element.data('id')));
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

function toggle_tag(elm) {
    var tag = $(elm).data('tag');
    var idx = active_tags.indexOf(tag);
    var collection = $(".bookmarks li").filter(function() {
        // Only interested in actual entries, not templates or other stuff.
        return $(this).data("id") != undefined; 
    });

    if(idx != -1) { // tag in active_tags
        active_tags.remove(idx);
        $("li[data-tag='" + tag + "']").removeClass("active"); // TODO: Actually fetch links
    } else {
        active_tags.push(tag);
        $("li[data-tag='" + tag + "']").addClass("active"); // TODO: Actually fetch links
    }

    if(active_tags.length == 0) {
        tagspec = "*";
        $("#tags_all").removeClass("show");
    } else {
        tagspec = active_tags.join("+");
        $("#tags_all").addClass("show");
    }

    $.get("/api/link/by_tag/" + tagspec, function(obj) {
        if(obj['status'] == 'ok')
            for(i = 0; i < collection.length; i++) 
                collection[i].remove();
        for(i = obj['links'].length - 1; i >= 0; i--) { // reverse
            var link = obj['links'][i];
            $("#bookmark_list").append(show_entry(link, link['id']));
        }
    });

    console.log(active_tags);
}

function save_link(orig) {
    $.post("/api/link", link_object(orig), function(response) {
        obj = JSON.parse(response);

        if(obj['status'] == "ok") {
            var link = link_object(orig);
            orig.replaceWith(show_entry(link, obj['id']));
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
