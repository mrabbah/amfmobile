/* [ ---- Gebo Admin Panel - location finder ---- ] */

$(document).ready(function() {
    gebo_maps.init();
    //zoning();
});

g_Map = $('#googlemapsjs1');
//Ce tableau va contenir les agents depuis le system
var agents = new Array();
//Ce tableau va contenir information distance et duree par rapport a la cible
var agents_distance = new Array();
//Ce tableau va contenir les orgins des marker de gmap3
var origins = new Array();
//Ce tableau va contenir les orgins pour la recherche de distance
var originsObjet = new Array();
//Cet element contient la position de destination pour la recherche
var destinationObjet;
function placeMarker(position, map) {
    var marker = new google.maps.Marker({
        position: position,
        draggable: true,
        animation: google.maps.Animation.DROP,
        map: map
    });
    //map.panTo(position);
}
;

function zoning() {
    $("#btn_visualiser").click(function() {
        localisationAgents();
        return false;
    });
}
;

function localisationAgents() {
    var destination = $('#comp_lat_lng').val().split(',');
    destinationObjet = new google.maps.LatLng(destination[0], destination[1]);
    agents = new Array();
    agents_distance = new Array();
    origins = new Array();
    originsObjet = new Array();
    var origin1;
    var service = new google.maps.DistanceMatrixService();
    $.ajax({
        type: "POST",
        url: "/utilisateur/listAgents",
        dataType: 'json',
        success: function(data) {
            $.each(data, function(key, value) {
                origin1 = value.latLng.split(',');// += "[" + value.latLng.split(',') + "] ,";
                originsObjet.push(new google.maps.LatLng(origin1[0], origin1[1]));
                origins.push("{lat:" + origin1[0] + ",lng:" + origin1[1] + ", data:'" + value.nom + " " + value.prenom + "<br/>" + value.gsm + "', tag : 'agent', id : " + value.id + ", options : {icon:'/telegestion/img/markers/ducati-diavel.png',draggable: false}}");
                agents.push(value);
            });
            service.getDistanceMatrix(
                    {
                        origins: originsObjet,
                        destinations: [destinationObjet],
                        travelMode: google.maps.TravelMode.DRIVING,
                        avoidHighways: false,
                        avoidTolls: false
                    }, calcul);
        },
        error: function(msg) {
            $.sticky(msg, {autoclose: 5000, position: "top-center"});
        }
    });
}
;
function calcul(response, status) {
    if (status == google.maps.DistanceMatrixStatus.OK) {
        var originsLocal = response.originAddresses;
        //var destinations = response.destinationAddresses;
        var minDistance = 0;
        var minDistanceText = 0;
        var minDureeText = "";
        var index;
        var agentProche;
        for (var i = 0; i < originsLocal.length; i++) {
            var results = response.rows[i].elements;
            for (var j = 0; j < results.length; j++) {
                var element = results[j];
                if (i == 0) {
                    index = i;
                    minDistance = element.distance.value;
                    minDistanceText = element.distance.text;
                    minDureeText = element.duration.text;
                    agentProche = agents[i];
                } else {
                    if (minDistance > element.distance.value) {
                        index = i;
                        minDistance = element.distance.value;
                        minDistanceText = element.distance.text;
                        minDureeText = element.duration.text;
                        agentProche = agents[i];
                    }
                }
            }
        }
        $('#agent_id').val(agentProche.id);
        var msg = agentProche.nom + " " + agentProche.prenom + " est le plus proche : " + minDistanceText + " " + minDureeText;
        $.sticky(msg, {autoclose: 5000, position: "top-center"});
        var origin1 = agents[index].latLng.split(',');
        origins[index] = "{lat:" + origin1[0] + ",lng:" + origin1[1] + ", data:'" + agents[index].nom + " " + agents[index].prenom + "<br/>" + agents[index].gsm + "', tag : 'agent', id : " + agents[index].id + ", options : {icon:'/telegestion/img/markers/ducati-diavel-green.png',draggable: false,animation: google.maps.Animation.BOUNCE}}";
        var origins_string = "[" + origins.join() + "]";
        g_Map.gmap3(
                {
                    action: 'clear',
                    name: 'marker',
                    tag: 'agent',
                    all: true
                },
        {
            action: 'addMarkers',
            markers: eval(origins_string),
            marker: {
                events: {
                    mouseover: function(marker, event, data) {
                        var map = $(this).gmap3('get'),
                                infowindow = $(this).gmap3({action: 'get', name: 'infowindow'});
                        if (infowindow) {
                            infowindow.open(map, marker);
                            infowindow.setContent(data);
                        } else {
                            $(this).gmap3({action: 'addinfowindow', anchor: marker, options: {content: data}});
                        }
                    },
                    mouseout: function() {
                        var infowindow = $(this).gmap3({action: 'get', name: 'infowindow'});
                        if (infowindow) {
                            infowindow.close();
                        }
                    }
                }
            },
            callback: function(markers) {
                //tracerRoute();
            }
        }
        );

    }
}
;

function tracerRoute() {

    g_Map.gmap3(
            {
                action: 'getroute',
                options: {
                    origin: eval(origine),
                    destination: destination,
                    travelMode: google.maps.DirectionsTravelMode.DRIVING
                },
                callback: function(results) {
                    if (!results)
                        return;
                    $(this).gmap3(
                            {
                                action: 'addDirectionsRenderer',
                                options: {
                                    directions: results
                                }
                            }
                    );
                }
            }
    );
}
//* clear search input
function clear_search() {
    $('#gmap_search input').val('');
}
;
//* clear location add form
function clear_form() {
    $('#majContact').html('Sauvegarder <i class="splashy-document_letter_add">');
    location_add_form.hide().find('input').val('');
}
;
//* marker message 
function marker_message() {
    $.sticky('Bouger le pointeur pour ajuster la position', {autoclose: 5000, position: "top-center", type: "st-info"});
}
;
// marker callback after drag end
function marker_callback(marker) {
    $('#comp_lat_lng').val(marker.position.lat().toFixed(6) + ', ' + marker.position.lng().toFixed(6));
    g_Map.gmap3({
        action: 'getAddress',
        latLng: marker.getPosition(),
        callback: function(results) {
            $('#comp_address').val(results[0].formatted_address);
        }
    });
}
;

gebo_maps = {
    init: function() {
        gebo_maps.create();
        //gebo_maps.save_location();
        //gebo_maps.commercial_proche();
        //gebo_maps.edit_location();
        //gebo_maps.show_location();

    },
    create: function() {
        //* create basic map
        g_Map.gmap3({
            action: 'init',
            options: {
                center: [30.581179, -7.540054],
                zoom: 6,
                mapTyprId: google.maps.MapTypeId.ROADMAP,
            },
            callback: function() {

            }
        });
    },
    save_location: function() {
        //* save location
        location_add_form.on('click', '#majContact', function() {
            $('html,body').animate({scrollTop: location_table.offset().top}, 'fast');
            //alert($('#majContact').text());
            var nom_val = $('#comp_name').val();
            var societe_val = $('#comp_contact').val();
            var gsm_val = $('#comp_phone').val();
            var lat_val = $('#comp_lat_lng').val();
            var adresse_val = $('#comp_address').val();
            if ($('#majContact').text().lastIndexOf('Sauvegarder', 0) === 0) {
                $.post("/contact/save",
                        {
                            nom: nom_val,
                            societe: societe_val,
                            gsm: gsm_val,
                            adresse: adresse_val,
                            latLng: lat_val
                        },
                function(data) {
                    if (data > 0) {
                        var last_row = location_table.find('tbody:last');
                        var comp_id = $('#comp_id').val();
                        if (comp_id != '') {
                            //location_table.find('tbody > tr:nth-child(' + comp_id + ')').html('<td>' + comp_id + '</td><td>' + location_add_form.find('#comp_name').val() + '</td><td>' + location_add_form.find('#comp_contact').val() + '</td><td class="address">' + $('#comp_address').val() + '</td><td>' + location_add_form.find('#comp_lat_lng').val() + '</td><td>' + location_add_form.find('#comp_phone').val() + '</td><td><a href="javascript:void(0)" class="show_on_map btn btn-mini btn-gebo">Show</a> <a href="javascript:void(0)" class="comp_edit btn btn-mini">Edit</a></td>');
                            last_row.append('<tr><td>' + data + '</td><td>' + nom_val + '</td><td>' + societe_val + '</td><td>' + adresse_val + '</td><td>' + gsm_val + '</td><td>' + lat_val + '</td><td><a href="javascript:void(0)" class="comp_edit btn btn-gebo btn-mini">Editer</a></td></tr>');
                            $('#comp_id').val('');
                        } else {
                            last_row.append('<tr><td>' + data + '</td><td>' + nom_val + '</td><td>' + societe_val + '</td><td>' + adresse_val + '</td><td>' + gsm_val + '</td><td>' + lat_val + '</td><td><a href="javascript:void(0)" class="comp_edit btn btn-gebo btn-mini">Editer</a></td></tr>');
                        }
                        $.sticky('Contact ajouté avec succès', {autoclose: 5000, position: "top-center", type: "st-info"});
                    } else {
                        $.sticky("Problème lors de l'ajout du contact", {autoclose: 5000, position: "top-center", type: "st-error"});
                    }
                }
                );
            } else {
                $.post("/contact/update",
                        {
                            id: $('#comp_id').val(),
                            nom: nom_val,
                            societe: societe_val,
                            gsm: gsm_val,
                            adresse: adresse_val,
                            latLng: lat_val
                        },
                function(data) {
                    if (data > 0) {
                        $.sticky('Contact modifié avec succès', {autoclose: 5000, position: "top-center", type: "st-info"});
                    } else {
                        $.sticky("Problème lors de la modification du contact", {autoclose: 5000, position: "top-center", type: "st-error"});
                    }
                }
                );
            }


            clear_form();
            clear_search();
            g_Map.gmap3({action: 'clear'});
            //$.sticky("Position sauveguardée avec succès.", {autoclose: 5000, position: "top-center", type: "st-info"});
            return false;
        });
    },
    edit_location: function() {
        //* edit location
        location_table.on('click', '.comp_edit', function() {
            location_add_form.show();
            $('#majContact').html('Modifier <i class="splashy-document_letter_add">');
            var this_item = $(this).closest('tr');
            $('#comp_id').val(this_item.find('td:nth-child(1)').text());
            $('#comp_name').val(this_item.find('td:nth-child(2)').text());
            $('#comp_contact').val(this_item.find('td:nth-child(3)').text());
            $('#comp_address').val(this_item.find('td:nth-child(4)').text());
            var show_lat_lng = $('#comp_lat_lng').val(this_item.find('td:nth-child(6)').text());
            var latLng_array = show_lat_lng.val().split(',');
            $('#comp_phone').val(this_item.find('td:nth-child(5)').text());
            $('html,body').animate({scrollTop: $('.main_content').offset().top - 40}, 'fast', function() {
                g_Map.gmap3(
                        {
                            action: 'clear',
                            name: 'marker'
                        },
                {
                    action: 'addMarker',
                    latLng: latLng_array,
                    map: {center: true, zoom: 10},
                    marker: {
                        options: {
                            draggable: true,
                            icon: new google.maps.MarkerImage("/telegestion/img/markers/office-building.png")
                        },
                        events: {
                            dragend: function(marker) {
                                marker_callback(marker);
                                localisationAgents();
                            }
                        },
                        callback: function() {
                            marker_message();
                            localisationAgents();
                        }
                    }
                }
                );
            });
        });
    },
    drop_marker_search: function() {
        //* drop marker on map after location search
        $('#majContact').html('Sauvegarder <i class="splashy-document_letter_add">');
        var search_query = $('#gmap_search input').val();
        $('#comp_id').val('');
        if (search_query != '') {
            g_Map.gmap3(
                    {
                        action: 'clear',
                        name: 'marker'
                    },
            {action: 'addMarker',
                address: search_query,
                map: {
                    center: true,
                    zoom: 10
                },
                marker: {
                    options: {draggable: true,
                        icon: new google.maps.MarkerImage("/telegestion/img/markers/office-building.png")},
                    events: {
                        dragend: function(marker) {
                            marker_callback(marker);
                            g_Map.gmap3('get').panTo(marker.position);
                            localisationAgents();
                        }
                    },
                    callback: function(marker) {
                        if (marker) {
                            location_add_form.slideDown('normal');
                            marker_callback(marker);
                            marker_message();
                            localisationAgents();
                        } else {
                            clear_form();
                            $.sticky("Aucune adresse ne satisfait votre requête. Réesayez à nouveau.", {autoclose: 5000, position: "top-center"});
                        }
                    }
                }
            }
            )
        } else {
            //* if location name not entered show message
            clear_form();
            $.sticky("Merci d'entrer un endroit pour rechercher.", {autoclose: 5000, position: "top-center"});
        }
    }
};

    