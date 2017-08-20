$(document).ready(function() {

    $.mobile.loading('show', {
        text: 'Chargement...',
        textVisible: true,
        theme: 'z',
        html: ""
    });
    document.addEventListener("deviceready", onDeviceReady, false);

    $.mobile.loading('hide');
});

var watchID = null;
var marker;
var g_Map;
var origine;
var map;
var notificationService;

function onDeviceReady() {
    $.mobile.loading('show', {
        text: 'Chargement des données...',
        textVisible: true,
        theme: 'z',
        html: ""
    });
    //lunchNotificationService();
    checkConnection();
    checkGps();
    initdata();
    initauthentification();
    initspeech();
    initchargementequipe();
    initchargementcontact();
    initchargementmestaches();
    initchargementtachesaffectes();
    initChat();
    initvoirtache();
    initvoircontact();
    initvoirmembre();
    initactionstache();
    initmap();
    $.mobile.loading('hide');
    detailsTache();
    enregistrerTache();       
}
;

function initChat() {

            var cont = $('#chats');
            var list = $('.chats', cont);
            var form = $('.chat-form', cont);
            var input = $('input', form);
            var btn = $('.btn', form);

            var handleClick = function (e) {
                e.preventDefault();
                
                var text = input.val();
                if (text.length == 0) {
                    return;
                }

                var time = new Date();
                var time_str = time.toString('MMM dd, yyyy hh:mm');
                var tpl = '';
                tpl += '<li class="out">';
                tpl += '<img class="avatar" alt="" src="assets/img/avatar1.jpg"/>';
                tpl += '<div class="message">';
                tpl += '<span class="arrow"></span>';
                tpl += '<a href="#" class="name">Bob Nilson</a>&nbsp;';
                tpl += '<span class="datetime">at ' + time_str + '</span>';
                tpl += '<span class="body">';
                tpl += text;
                tpl += '</span>';
                tpl += '</div>';
                tpl += '</li>';

                var msg = list.append(tpl);
                input.val("");
                $('.scroller', cont).slimScroll({
                    scrollTo: list.height()
                });
            }

            /*
            $('.scroller', cont).slimScroll({
                scrollTo: list.height()
            });
            */

            $('body').on('click', '.message .name', function(e){
                e.preventDefault(); // prevent click event

                var name = $(this).text(); // get clicked user's full name
                input.val('@' +  name + ':'); // set it into the input field
                App.scrollTo(input); // scroll to input if needed
            });

            btn.click(handleClick);
            input.keypress(function (e) {
                if (e.which == 13) {
                    handleClick();
                    return false; //<---- Add this line
                }
            });
};
function lunchNotificationService() {
    var serviceName = 'com.rabbahsoft.commun.backgroundservice.MessageNotificationService';
    var factory = cordova.require('com.red_folder.phonegap.plugin.backgroundservice.BackgroundService')
    notificationService = factory.create(serviceName);
    getStatus();
}
;

function getStatus() {
    notificationService.getStatus(function(r) {
        displayResult(r)
    }, function(e) {
        displayError(e)
    });
}
;
function displayError(data) {
    //alert("We have an error to service : " + data.ErrorMessage);
}
;
function displayResult(data) {    
    //alert("Is service running: " + data.ServiceRunning);    
    if (data.ServiceRunning) {
        enableTimer(data);
    } else {
        //alert('start service');
        notificationService.startService(function(r) {enableTimer(r) }, function(e) { displayError(e)});
        //alert('register for bootstart');
        notificationService.registerForBootStart(function(r) { handleSuccess(r)}, function(e) { handleError(e)});
    }
}
;
function handleSuccess(data) {
    //alert("service register to boot start successfully");
}
;
function enableTimer(data) {
    if (data.TimerEnabled) {
        registerForUpdates(data);
    } else {
        notificationService.enableTimer(10000, function(r) {
            registerForUpdates(r)
        }, function(e) {
            displayError(e)
        });
    }
}
;
function registerForUpdates(data) {
    if (!data.RegisteredForUpdates) {
        notificationService.registerForUpdates(function(r) {
            updateHandler(r)
        }, function(e) {
            handleError(e)
        });
    }
}
;
function updateHandler(data) {
    //Service give us result nice display message
    //var config = { "HelloTo" : "RABBAH" }; 
    //notificationService.setConfiguration(config,function(r){handleSuccess(r)}, function(e){handleError(e)});
    //alert(data.LatestResult.Message);
    //alert(data.LatestResult.Error);
    var login = window.localStorage.getItem("login");
    var password = window.localStorage.getItem("password");
    var ipserver = window.localStorage.getItem("ipserver");
    var iduser = window.localStorage.getItem("iduser");
    var config = {"login": login, "password": password, "ipserver": ipserver, "iduser": iduser};
    //alert(login + password + ipserver + iduser);
    notificationService.setConfiguration(config, function(r) {
        handleSuccess(r)
    }, function(e) {
        handleError(e)
    });
//    alert('set config finish');
}
;
function handleError(e) {
    //service handl error
    //alert("Error handling serive");
}
;
function checkConnection() {
    var networkState = navigator.connection.type;
    if (networkState == Connection.NONE || networkState == Connection.UNKNOWN) {
        alert("Vous n'êtes pas connecté à internet, veillez vérifier votre connexion");
    }

}
;
function checkGps() {
    navigator.geolocation.getCurrentPosition(onSuccessCheckGps, onErrorCheckGps);

}
;
// onSuccess Geolocation
//
function onSuccessCheckGps(position) {
    //Nothing to do
    window.localStorage.setItem("myLatLng", position.coords.latitude + ',' + position.coords.longitude);
}
;
// onError Callback receives a PositionError object
//
function onErrorCheckGps(error) {
//    alert('code: ' + error.code + '\n' +
//            'message: ' + error.message + '\n');
    alert("Veillez vérifiez si votre GPS est activé");
}
;
function initdata() {
    var login = window.localStorage.getItem("login");
    var password = window.localStorage.getItem("password");
    var ipserver = window.localStorage.getItem("ipserver");
    if (login != null && password != null && ipserver != null) {
        silentauthentification(login, password, ipserver);
    } else {
        $.mobile.changePage($('#login'), 'slide-up', false);
    }
}
;
function initauthentification() {
    $("#formlogin").submit(function(event) {
        $.mobile.loading('show', {
            text: 'Authentification...',
            textVisible: true,
            theme: 'z',
            html: ""
        });
        event.preventDefault();
        var login = $("#lgn").val();
        var password = $("#password").val();
        var ipserver = $("#ip").val();


        if (login.length == 0) {
            alert('Login est requis');
        } else if (password.length == 0) {
            alert('Mote de passe est requis');
        } else if (ipserver.length == 0) {
            alert('Adresse IP du serveur est requise');
        } else {
            authentification(login, password, ipserver);
        }
    });
}
;

function authentification(login, password, ipserver) {
    var url = "http://" + ipserver + "/mobile/authentifier";
    $.ajax({
        type: "POST",
        url: url,
        data: {login: login, password: password},
        success: function(data) {
            if (data >= 0) {
                window.localStorage.setItem("iduser", data);
                window.localStorage.setItem("login", login);
                window.localStorage.setItem("password", password);
                window.localStorage.setItem("ipserver", ipserver);
                lunchNotificationService();
                chargerMesTaches();
                $.mobile.changePage($('#accueil'), 'slide-up', false);
                if (watchID == null) {
                    initGps();
                }
                /*setInterval(function() {
                 checkMessages();
                 }, 30000);*/
            } else {
                alert('Login et/ou mot de passe incorrect(s)');
                $.mobile.changePage($('#login'), 'slide-up', false);
            }
        },
        error: function(xhr, status, error) {

            //var err = eval("(" + xhr.responseText + ")");
            alert("Erreur lors de la connexion, veillez réesayer ultérieurement");
            $.mobile.changePage($('#login'), 'slide-up', false);
        }
    });
}
;
function silentauthentification(login, password, ipserver) {
    var url = "http://" + ipserver + "/mobile/authentifier";
    $.ajax({
        type: "POST",
        url: url,
        data: {login: login, password: password},
        success: function(data) {
            if (data >= 0) {
                lunchNotificationService();
                chargerMesTaches();
                $.mobile.changePage($('#accueil'), 'slide-up', false);
                if (watchID == null) {
                    initGps();
                }
                /*setInterval(function() {
                 checkMessages();
                 }, 30000);*/
            } else {
                window.localStorage.clear();
                $.mobile.changePage($('#login'), 'slide-up', false);
            }
        },
        error: function(xhr, status, error) {
            alert("Erreur lors de la connexion, veillez réesayer ultérieurement");
            $.mobile.changePage($('#login'), 'slide-up', false);
        }
    });
}
;
function initchargementcontact() {
    $(".contacts").click(function() {
        $.mobile.loading('show', {
            text: 'Chargement...',
            textVisible: true,
            theme: 'z',
            html: ""
        });

        var login = window.localStorage.getItem("login");
        var password = window.localStorage.getItem("password");
        var ipserver = window.localStorage.getItem("ipserver");
        var iduser = window.localStorage.getItem("iduser");
        var url = "http://" + ipserver + "/mobile/listContacts";

        $.ajax({
            type: "POST",
            url: url,
            data: {login: login, password: password, iduser: iduser},
            dataType: 'json',
            success: function(data) {
                var list = $("#listContacts").listview();
                $(list).empty();
                $.each(data, function(key, value) {
                    $(list).append('<li statut="' + value.statut + '" data-theme=""> <a href="#contact" id="' + value.id + '" class="viewcontact" data-transition="slide">' + value.nom + '<span class="ui-li-count">' + value.region + '</span></a></li>');
                });
                $("#listContacts").listview({
                    autodividers: true,
                    autodividersSelector: function(li) {
                        var out = li.attr("statut");
                        return out;
                    }
                }).listview("refresh");
                //$(list).listview("refresh");
                $.mobile.loading('hide');
            },
            error: function(msg) {
                $.mobile.loading('hide');
                alert("Error !: " + "Problème connexion réseaux");
            }
        });
    });
}
;
function initchargementequipe() {
    $(".equipe").click(function() {
        $.mobile.loading('show', {
            text: 'Chargement...',
            textVisible: true,
            theme: 'z',
            html: ""
        });

        var login = window.localStorage.getItem("login");
        var password = window.localStorage.getItem("password");
        var ipserver = window.localStorage.getItem("ipserver");
        var iduser = window.localStorage.getItem("iduser");
        var url = "http://" + ipserver + "/mobile/listUsers";

        $.ajax({
            type: "POST",
            url: url,
            data: {login: login, password: password, iduser: iduser},
            dataType: 'json',
            success: function(data) {
                var list = $("#listMembres").listview();
                $(list).empty();
                $.each(data, function(key, value) {
                    $(list).append('<li data-theme=""> <a href="#membre" id="' + value.id + '" class="viewmembre" data-transition="slide">' + value.nom + ' ' + value.prenom + '<span class="ui-li-count">' + value.gsm + '</span></a></li>');
                });
                $(list).listview("refresh");
                $.mobile.loading('hide');
            },
            error: function(msg) {
                $.mobile.loading('hide');
                alert("Error !: " + "Problème connexion réseaux");
            }
        });
    });
}
;

function initchargementtachesaffectes() {
    $(".taches").click(function() {
        $.mobile.loading('show', {
            text: 'Chargement...',
            textVisible: true,
            theme: 'z',
            html: ""
        });

        chargerTachesAffectees();
    });
}
;
function initchargementmestaches() {
    $(".accueil").click(function() {
        $.mobile.loading('show', {
            text: 'Chargement...',
            textVisible: true,
            theme: 'z',
            html: ""
        });

        chargerMesTaches();
    });
}
;
function chargerMesTaches() {
    $.mobile.loading('show', {
        text: 'Chargement des données...',
        textVisible: true,
        theme: 'z',
        html: ""
    });
    var login = window.localStorage.getItem("login");
    var password = window.localStorage.getItem("password");
    var ipserver = window.localStorage.getItem("ipserver");
    var iduser = window.localStorage.getItem("iduser");
    var url = "http://" + ipserver + "/mobile/mesTaches";
    var compteur = 0;
    $.ajax({
        type: "POST",
        url: url,
        data: {login: login, password: password, iduser: iduser},
        dataType: 'json',
        success: function(data) {
            var list = $("#listMesTaches").listview();
            $(list).empty();
            $.each(data, function(key, value) {
                compteur++;
                var dateFormat = "";
                if (value.dateDebutPrevue) {
                    var dateBrute = value.dateDebutPrevue;
                    var dateFormat = dateBrute.substring(8, 10) + "-" + dateBrute.substring(5, 7) + "-" + dateBrute.substring(0, 4) + " " + dateBrute.substring(11, 13) + ":" + dateBrute.substring(14, 16);
                }
                //if (value.priorite == 'NORMALE') {
                $(list).append('<li data-theme="" priorite="' + value.priorite + '"> <a href="#tache" id="' + value.id + '" class="viewtache" data-transition="slide">' + value.endroit.nom + '<span class="ui-li-count">' + dateFormat + '</span></a></li>');
                /*} else if (value.priorite == 'IMPORTANTE') {
                 $(list).append('<li data-theme="b" priorite="' + value.priorite + '"> <a href="#tache" id="' + value.id + '" class="viewtache" data-transition="slide">' + value.endroit.nom + '<span class="ui-li-count">' + dateFormat + '</span></a></li>');
                 } else {
                 $(list).append('<li data-theme="e" priorite="' + value.priorite + '"> <a href="#tache" id="' + value.id + '" class="viewtache" data-transition="slide">' + value.endroit.nom + '<span class="ui-li-count">' + dateFormat + '</span></a></li>');
                 }*/

            });
            //$(list).listview("refresh");
            $("#listMesTaches").listview({
                autodividers: true,
                autodividersSelector: function(li) {
                    var out = li.attr("priorite");
                    return out;
                }
            }).listview("refresh");

            if (compteur > 0) {
                $("#mestachesdiv").show();
                $("#mestachesmessagediv").hide();
            } else {
                $("#mestachesmessagediv").show();
                $("#mestachesdiv").hide();
            }
            $.mobile.loading('hide');
        },
        error: function(msg) {
            $.mobile.loading('hide');
            alert("Error !: " + "Problème connexion réseaux");
        }
    });
}
function chargerTachesAffectees() {
    var login = window.localStorage.getItem("login");
    var password = window.localStorage.getItem("password");
    var ipserver = window.localStorage.getItem("ipserver");
    var iduser = window.localStorage.getItem("iduser");
    var url = "http://" + ipserver + "/mobile/mesTachesAffectees";
    var compteur = 0;
    $.ajax({
        type: "POST",
        url: url,
        data: {login: login, password: password, iduser: iduser},
        dataType: 'json',
        success: function(data) {
            var list = $("#listeTachesAffectees").listview();
            $(list).empty();
            $.each(data, function(key, value) {
                compteur++;
                var dateFormat = "";
                if (value.dateDebutPrevue) {
                    var dateBrute = value.dateDebutPrevue;
                    var dateFormat = dateBrute.substring(8, 10) + "-" + dateBrute.substring(5, 7) + "-" + dateBrute.substring(0, 4) + " " + dateBrute.substring(11, 13) + ":" + dateBrute.substring(14, 16);
                }
                //if (value.priorite == 'NORMALE') {
                $(list).append('<li data-theme="" priorite="' + value.priorite + '"> <a href="#tache" id="' + value.id + '" class="viewtache" data-transition="slide">' + value.endroit.nom + '<span class="ui-li-count">' + dateFormat + '</span></a></li>');
                /*} else if (value.priorite == 'IMPORTANTE') {
                 $(list).append('<li data-theme="b" priorite="' + value.priorite + '"> <a href="#tache" id="' + value.id + '" class="viewtache" data-transition="slide">' + value.endroit.nom + '<span class="ui-li-count">' + dateFormat + '</span></a></li>');
                 } else {
                 $(list).append('<li data-theme="e" priorite="' + value.priorite + '"> <a href="#tache" id="' + value.id + '" class="viewtache" data-transition="slide">' + value.endroit.nom + '<span class="ui-li-count">' + dateFormat + '</span></a></li>');
                 }*/

            });
            //$(list).listview("refresh");
            $("#listeTachesAffectees").listview({
                autodividers: true,
                autodividersSelector: function(li) {
                    var out = li.attr("priorite");
                    return out;
                }
            }).listview("refresh");
            if (compteur > 0) {
                $("#tacheaffecteesdiv").show();
                $("#tacheaffecteesmessagediv").hide();
            } else {
                $("#tacheaffecteesmessagediv").show();
                $("#tacheaffecteesdiv").hide();
            }
            $.mobile.loading('hide');
        },
        error: function(msg) {
            $.mobile.loading('hide');
            alert("Error !: " + "Problème connexion réseaux");
        }
    });
}
;
function initvoirtache() {

    $("ul").on('click', '.viewtache', function() {
        var idtache = $(this).attr("id");
        var login = window.localStorage.getItem("login");
        var password = window.localStorage.getItem("password");
        var ipserver = window.localStorage.getItem("ipserver");
        var iduser = window.localStorage.getItem("iduser");
        var url = "http://" + ipserver + "/mobile/getTache";
        var myLatLng = window.localStorage.getItem("myLatLng");
        if (typeof map == 'undefined') {
            map = $('#googlemapsjs1').gmap({'center': myLatLng, 'zoom': 10, 'callback': function() {
                }});
        }


        $.ajax({
            type: "POST",
            url: url,
            data: {login: login, password: password, iduser: iduser, idtache: idtache},
            dataType: 'json',
            success: function(data) {
                var tache = data[0];
                var contact = data[1];
                window.localStorage.setItem("idtache", tache.id);
                window.localStorage.setItem("idcontact", contact.id);
                window.localStorage.setItem("latLng", contact.latLng);

                origine_tab = myLatLng.split(",");
                destination_tab = contact.latLng.split(",");
                var origine = new google.maps.LatLng(origine_tab[0], origine_tab[1]);
                var destination = new google.maps.LatLng(destination_tab[0], destination_tab[1]);
                $('#googlemapsjs1').gmap('refresh');
                $('#googlemapsjs1').gmap('displayDirections', {'origin': origine, 'destination': destination, 'travelMode': google.maps.DirectionsTravelMode.DRIVING}, {'panel': document.getElementById('directions')}, function(result, status) {
                    if (status === 'OK') {
                        navigator.tts.speak(result.routes[0].legs[0].start_address);
                        $('#directions').show();
                    } else {
                        $('#directions').hide();
                    }
                });
                $.mobile.loading('hide');
                $("#prioritetache").html(tache.priorite);
                $("#statustache").html(tache.status);
                $("#datetache").html(tache.dateDebutPrevue);
                $("#adressetache").html(contact.adresse);
                $("#nomcontact").html(contact.nom);
                // Gardien 1 & 2
                $("#gardien1nomTache").html(contact.gardien1.nom);
                $("#gardien1tel1Tache").html(contact.gardien1.tel1);
                $("#gardien1tel2Tache").html(contact.gardien1.tel2);
                $("#gardien2nomTache").html(contact.gardien2.nom);
                $("#gardien2tel1Tache").html(contact.gardien2.tel1);
                $("#gardien2tel2Tache").html(contact.gardien2.tel2);

                if (tache.status == 'PLANIFIEE') {
                    $("#literminermission").hide();
                    $("#licomencermission").hide();
                    $("#lideclinermission").hide();
                    $("#liacceptermission").hide();
                } else if (tache.status == 'AFFECTEE') {
                    $("#literminermission").hide();
                    $("#licomencermission").hide();
                    $("#lideclinermission").show();
                    $("#liacceptermission").show();
                } else if (tache.status == 'ACCEPTEE') {
                    $("#literminermission").hide();
                    $("#licomencermission").show();
                    $("#lideclinermission").show();
                    $("#liacceptermission").hide();
                } else if (tache.status == 'REFUSEE') {
                    $("#literminermission").hide();
                    $("#licomencermission").hide();
                    $("#lideclinermission").hide();
                    $("#liacceptermission").show();
                } else if (tache.status == 'EN COURS') {
                    $("#literminermission").show();
                    $("#licomencermission").hide();
                    $("#lideclinermission").show();
                    $("#liacceptermission").hide();
                } else if (tache.status == 'TERMINEE') {
                    $("#literminermission").hide();
                    $("#licomencermission").hide();
                    $("#lideclinermission").hide();
                    $("#liacceptermission").hide();
                } else if (tache.status == 'ANULEE') {
                    $("#literminermission").hide();
                    $("#licomencermission").hide();
                    $("#lideclinermission").hide();
                    $("#liacceptermission").hide();
                }
                initialiserDetails(tache);
            },
            error: function(msg) {
                $.mobile.loading('hide');
                alert("Error !: " + "Problème connexion réseaux");
            }
        });
    });
}
;
function initvoircontact() {

    $("ul").on('click', '.viewcontact', function() {
        var idcontact = $(this).attr("id");
        var login = window.localStorage.getItem("login");
        var password = window.localStorage.getItem("password");
        var ipserver = window.localStorage.getItem("ipserver");
        var iduser = window.localStorage.getItem("iduser");
        var url = "http://" + ipserver + "/mobile/getContact";

        $.ajax({
            type: "POST",
            url: url,
            data: {login: login, password: password, iduser: iduser, idcontact: idcontact},
            dataType: 'json',
            success: function(data) {
                window.localStorage.setItem("idcontact", data.id);
                window.localStorage.setItem("latLng", data.latLng);
                $.mobile.loading('hide');
                // Site
                $('#sitenom').html(data.nom);
                $('#siteregion').html(data.region);
                $('#siteinterlocuteur').html(data.interlocuteur);
                $('#siteadresse').html(data.adresse);
                // Gardien 1 & 2
                $("#gardien1nom").html(data.gardien1.nom);
                $("#gardien1tel1").html(data.gardien1.tel1);
                $("#gardien1tel2").html(data.gardien1.tel2);
                $("#gardien2nom").html(data.gardien2.nom);
                $("#gardien2tel1").html(data.gardien2.tel1);
                $("#gardien2tel2").html(data.gardien2.tel2);
//                // Groupe Electrogéne
                $('#puissance').html(data.groupeElectrogene.puissance);
                $('#typeMoteur').html(data.groupeElectrogene.typeMoteur);
                $('#serieMoteur').html(data.groupeElectrogene.serieMoteur);
                $('#typeAleternateur').html(data.groupeElectrogene.typeAleternateur);
                $('#serieAleternateur').html(data.groupeElectrogene.serieAleternateur);
                $('#moduleDemarrage').html(data.groupeElectrogene.moduleDemarrage);
//                $("#callcontactbis").attr("href", "tel:" + data.gardien2.tel1);
            },
            error: function(msg) {
                $.mobile.loading('hide');
                alert("Error !: " + "Problème connexion réseaux");
            }
        });
    });
}
;
function initvoirmembre() {

    $("ul").on('click', '.viewmembre', function() {
        var idmembre = $(this).attr("id");
        var login = window.localStorage.getItem("login");
        var password = window.localStorage.getItem("password");
        var ipserver = window.localStorage.getItem("ipserver");
        var iduser = window.localStorage.getItem("iduser");
        var url = "http://" + ipserver + "/mobile/getMembre";

        $.ajax({
            type: "POST",
            url: url,
            data: {login: login, password: password, iduser: iduser, idmembre: idmembre},
            dataType: 'json',
            success: function(data) {
                $.mobile.loading('hide');
                $("#membrenomprenom").html(data.nom + " " + data.prenom);
                $("#membregsm").html(data.gsm);
                $("#membreemail").html(data.email);
                $("#callmembre").attr("href", "tel:" + data.gsm);
            },
            error: function(msg) {
                $.mobile.loading('hide');
                alert("Error !: " + "Problème connexion réseaux");
            }
        });
    });
}
;
function initGps() {
    //chaque trois minute
    var options = {frequency: 60000, enableHighAccuracy: false, maximumAge: 600000, timeout: 30000};
    watchID = navigator.geolocation.watchPosition(onSuccessWatchGPS, onErrorWatchGPS, options);
}
;

// onSuccess Geolocation
//
function onSuccessWatchGPS(position) {


    var latLng = position.coords.latitude + ',' + position.coords.longitude;
    window.localStorage.setItem("myLatLng", latLng);

    if (typeof map != 'undefined') {
        var origine = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var idcontact = window.localStorage.getItem("idcontact");
        if (typeof idcontact != 'undefined') {
            var latLngClient = window.localStorage.getItem("latLng");
            var destination_tab = latLngClient.split(',');
            var destination = new google.maps.LatLng(destination_tab[0], destination_tab[1]);

            $('#googlemapsjs1').gmap('displayDirections', {'origin': origine, 'destination': destination, 'travelMode': google.maps.DirectionsTravelMode.DRIVING}, {'panel': document.getElementById('directions')}, function(result, status) {
                if (status === 'OK') {
                    //navigator.tts.speak(result.routes[0].legs[0].start_address);  
                    $('#directions').show();
                } else {
                    $('#directions').hide();
                }
            });

        }
    }


}

// clear the watch that was started earlier
//
//function clearWatch() {
//    if (watchID != null) {
//        navigator.geolocation.clearWatch(watchID);
//        watchID = null;
//    }
//}

function onErrorWatchGPS(error) {
    //Chercher position par internet
    navigator.geolocation.getCurrentPosition(onSuccessWatchGPS, onErrorNetworGps);
}

// onError Callback receives a PositionError object
//
function onErrorNetworGps(error) {
    //rien à faire
}
;
function initactionstache() {
    $(".correctposition").click(function() {
        alert('correction de la postion');
        var options = {maximumAge: 5 * 60 * 1000, enableHighAccuracy: false, timeout: 10000};
        navigator.geolocation.getCurrentPosition(onSuccessCorrectPositionContact, onErrorCorrectPositionContact, options);
        $.mobile.loading('show', {
            text: 'Chargement...',
            textVisible: true,
            theme: 'z',
            html: ""
        });
    });
    $("#acceptermission").click(function() {
        $.mobile.loading('show', {
            text: 'Chargement...',
            textVisible: true,
            theme: 'z',
            html: ""
        });

        var login = window.localStorage.getItem("login");
        var password = window.localStorage.getItem("password");
        var ipserver = window.localStorage.getItem("ipserver");
        var iduser = window.localStorage.getItem("iduser");
        var idtache = window.localStorage.getItem("idtache");
        var url = "http://" + ipserver + "/mobile/accepterTache";
        var d = new Date();
        var curr_date = d.getDate();
        var curr_month = d.getMonth() + 1; //Months are zero based
        var curr_year = d.getFullYear();
        var curr_heure = d.getHours();
        var curr_minute = d.getMinutes();
        var date = curr_date + "/" + curr_month + "/" + curr_year + " " + curr_heure + ":" + curr_minute;
        $.ajax({
            type: "POST",
            url: url,
            data: {login: login, password: password, iduser: iduser, idtache: idtache, date: date},
            dataType: 'json',
            success: function(data) {
                $.mobile.loading('hide');
                $("#literminermission").hide();
                $("#licomencermission").show();
                $("#lideclinermission").show();
                $("#liacceptermission").hide();
                alert("Tâche attribuée avec succèe");
            },
            error: function(msg) {
                $.mobile.loading('hide');
                alert("Problème lors de l'attribution de la tâche");
            }
        });
    });
    $(".declinermission").click(function() {
        $.mobile.loading('show', {
            text: 'Chargement...',
            textVisible: true,
            theme: 'z',
            html: ""
        });
        var login = window.localStorage.getItem("login");
        var password = window.localStorage.getItem("password");
        var ipserver = window.localStorage.getItem("ipserver");
        var iduser = window.localStorage.getItem("iduser");
        var idtache = window.localStorage.getItem("idtache");
        var url = "http://" + ipserver + "/mobile/refuserTache";
        var d = new Date();
        var curr_date = d.getDate();
        var curr_month = d.getMonth() + 1; //Months are zero based
        var curr_year = d.getFullYear();
        var curr_heure = d.getHours();
        var curr_minute = d.getMinutes();
        var date = curr_date + "/" + curr_month + "/" + curr_year + " " + curr_heure + ":" + curr_minute;
        $.ajax({
            type: "POST",
            url: url,
            data: {login: login, password: password, iduser: iduser, idtache: idtache, date: date},
            dataType: 'json',
            success: function(data) {
                $.mobile.loading('hide');
                $("#accepterRefuser").hide();
                $("#statustache").html("ANULEE");
//                $("#literminermission").hide();
//                $("#licomencermission").hide();
//                $("#lideclinermission").hide();
//                $("#liacceptermission").show();
                alert("L'administration est notifiée de votre refus");
            },
            error: function(msg) {
                $.mobile.loading('hide');
                alert("Problème lors du refus de la tâche");
            }
        });
    });
    $("#comencermission").click(function() {
        $.mobile.loading('show', {
            text: 'Chargement...',
            textVisible: true,
            theme: 'z',
            html: ""
        });
        var login = window.localStorage.getItem("login");
        var password = window.localStorage.getItem("password");
        var ipserver = window.localStorage.getItem("ipserver");
        var iduser = window.localStorage.getItem("iduser");
        var idtache = window.localStorage.getItem("idtache");
        var url = "http://" + ipserver + "/mobile/commencerTache";
        var d = new Date();
        var curr_date = d.getDate();
        var curr_month = d.getMonth() + 1; //Months are zero based
        var curr_year = d.getFullYear();
        var curr_heure = d.getHours();
        var curr_minute = d.getMinutes();
        var date = curr_date + "/" + curr_month + "/" + curr_year + " " + curr_heure + ":" + curr_minute;
        $.ajax({
            type: "POST",
            url: url,
            data: {login: login, password: password, iduser: iduser, idtache: idtache, date: date},
            dataType: 'json',
            success: function(data) {
                $.mobile.loading('hide');
                alert("Tâche est en cours d'exécution");
                $("#literminermission").show();
                $("#licomencermission").hide();
                $("#lideclinermission").show();
                $("#liacceptermission").hide();
            },
            error: function(msg) {
                $.mobile.loading('hide');
                alert("Problème lors du contact du serveur");
            }
        });
    });
    $("#terminermission").click(function() {
        $.mobile.loading('show', {
            text: 'Chargement...',
            textVisible: true,
            theme: 'z',
            html: ""
        });
        var login = window.localStorage.getItem("login");
        var password = window.localStorage.getItem("password");
        var ipserver = window.localStorage.getItem("ipserver");
        var iduser = window.localStorage.getItem("iduser");
        var idtache = window.localStorage.getItem("idtache");
        var url = "http://" + ipserver + "/mobile/acheverTache";
        var d = new Date();
        var curr_date = d.getDate();
        var curr_month = d.getMonth() + 1; //Months are zero based
        var curr_year = d.getFullYear();
        var curr_heure = d.getHours();
        var curr_minute = d.getMinutes();
        var date = curr_date + "/" + curr_month + "/" + curr_year + " " + curr_heure + ":" + curr_minute;
        $.ajax({
            type: "POST",
            url: url,
            data: {login: login, password: password, iduser: iduser, idtache: idtache, date: date},
            dataType: 'json',
            success: function(data) {
                $.mobile.loading('hide');
                alert("Félicitation vous venez de terminer votre mission");
                $("#literminermission").hide();
                $("#licomencermission").hide();
                $("#lideclinermission").hide();
                $("#liacceptermission").hide();
            },
            error: function(msg) {
                $.mobile.loading('hide');
                alert("Problème lors du contact du serveur");
            }
        });
    });

    $("#voirmessages").click(function() {
        $.mobile.loading('show', {
            text: 'Chargement...',
            textVisible: true,
            theme: 'z',
            html: ""
        });
        var login = window.localStorage.getItem("login");
        var password = window.localStorage.getItem("password");
        var ipserver = window.localStorage.getItem("ipserver");
        var iduser = window.localStorage.getItem("iduser");
        var idtache = window.localStorage.getItem("idtache");
        var url = "http://" + ipserver + "/mobile/getMessagesTache";

        $.ajax({
            type: "POST",
            url: url,
            data: {login: login, password: password, iduser: iduser, idtache: idtache},
            dataType: 'json',
            success: function(data) {
                var list = $("#listMessages").listview();
                $(list).empty();
                $.each(data, function(key, value) {
                    if (value.type == 'TEXT') {
                        $(list).append('<li data-theme="">' + value.texte + ' ' + value.dateMessage + '</li>');
                    } else if (value.type == 'VIDEO') {
                        $(list).append('<li data-theme=""><video width="320" height="240" controls><source src="http://' + ipserver + '/mobile/download?idMessage=' + value.id + '"></video></li>');
                    } else if (value.type == 'AUDIO') {
                        $(list).append('<li data-theme=""><audio controls><source src="http://' + ipserver + '/mobile/download?idMessage=' + value.id + '">Votre navigateur ne supporte pas la lecture d\'audio veillez utilisez Chrome Browser</audio></li>');
                    } else {
                        $(list).append('<li data-theme=""> <a href ="http://' + ipserver + '/mobile/download?idMessage=' + value.id + '">' + value.filename + '</a> </li>');
                    }
                });
                $(list).listview("refresh");
                $.mobile.loading('hide');
            },
            error: function(msg) {
                $.mobile.loading('hide');
                alert("Problème lors du contact du serveur");
            }
        });
    });
    $("#envoyeraudio").click(function() {
        navigator.device.capture.captureAudio(captureSuccess, captureError, {limit: 1});

    });
    $("#envoyervideo").click(function() {
        navigator.device.capture.captureVideo(captureSuccess, captureError, {limit: 1});

    });
    $("#envoyerimage").click(function() {
        navigator.device.capture.captureImage(captureSuccess, captureError, {limit: 1});
    });

    $("#envoyermessagetext").click(function() {
        $.mobile.loading('show', {
            text: 'Chargement...',
            textVisible: true,
            theme: 'z',
            html: ""
        });
        var login = window.localStorage.getItem("login");
        var password = window.localStorage.getItem("password");
        var ipserver = window.localStorage.getItem("ipserver");
        var iduser = window.localStorage.getItem("iduser");
        var idtache = window.localStorage.getItem("idtache");
        var url = "http://" + ipserver + "/mobile/envoyerMessage";
        var message = $("#messagetext").val();
        /*var d = new Date();
         var curr_date = d.getDate();
         var curr_month = d.getMonth() + 1; //Months are zero based
         var curr_year = d.getFullYear();
         var curr_heure = d.getHours();
         var curr_minute = d.getMinutes();
         var date = curr_date + "/" + curr_month + "/" + curr_year + " " + curr_heure + ":" + curr_minute;*/
        $.ajax({
            type: "POST",
            url: url,
            data: {login: login, password: password, iduser: iduser, idtache: idtache, message: message},
            dataType: 'json',
            success: function(data) {
                $.mobile.loading('hide');
                var msg = 'Votre message est bien envoyé: ';
                $("#ecriremessage").hide();
                navigator.notification.alert(msg, null, 'Sucèes!');
            },
            error: function(msg) {
                $.mobile.loading('hide');
                var message = 'Problème lors du contact du serveur :' + msg;
                $("#ecriremessage").hide();
                navigator.notification.alert(message, null, 'Problème!');
            }
        });
    });

}
;

function onSuccessCorrectPositionContact(position) {
    var login = window.localStorage.getItem("login");
    var password = window.localStorage.getItem("password");
    var ipserver = window.localStorage.getItem("ipserver");
    var iduser = window.localStorage.getItem("iduser");
    var idcontact = window.localStorage.getItem("idcontact");
    var url = "http://" + ipserver + "/mobile/corrigerPositionContact";
    var latLng = position.coords.latitude + ',' + position.coords.longitude;
    $.ajax({
        type: "POST",
        url: url,
        data: {login: login, password: password, iduser: iduser, idcontact: idcontact, latLng: latLng},
        dataType: 'json',
        success: function(data) {
            $.mobile.loading('hide');
            alert("Position corrigée avec succès")
        },
        error: function(msg) {
            $.mobile.loading('hide');
            alert("Problème connexion réseau");
        }
    });
}
;
function onErrorCorrectPositionContact(error) {
    alert("Erreur obtention position actuelle : " + error.message);
    //Chercher position par internet
    //navigator.geolocation.getCurrentPosition(onSuccessCorrectPositionContact, onErrorCorrect2PositionContact);
}
;
function onErrorCorrect2PositionContact(error) {
    alert('error 2');
    $.mobile.loading('hide');
    alert("Erreur obtention position actuelle");
}
;

// Called when capture operation is finished
//
function captureSuccess(mediaFiles) {
    var i, len;
    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
        uploadFile(mediaFiles[i]);
    }
}
;

// Called if something bad happens.
//
function captureError(error) {
    var msg = 'An error occurred during capture: ' + error.code;
    navigator.notification.alert(msg, null, 'Problème!');
}
;

// Upload files to server
function uploadFile(mediaFile) {
    var ft = new FileTransfer(),
            path = mediaFile.fullPath,
            name = mediaFile.name,
            type = mediaFile.type;

    var login = window.localStorage.getItem("login");
    var password = window.localStorage.getItem("password");
    var ipserver = window.localStorage.getItem("ipserver");
    var iduser = window.localStorage.getItem("iduser");
    var idtache = window.localStorage.getItem("idtache");
    var url = "http://" + ipserver + "/mobile/upload?iduser=" + iduser + "&idtache=" + idtache + "&login=" + login + "&idtache=" + password;
    ft.upload(path,
            url,
            function(result) {
                var msg = 'Message envoyé avec succès: ';
                navigator.notification.alert(msg, null, 'Sucèes!');
                console.log('Upload success: ' + result.responseCode);
                console.log(result.bytesSent + ' bytes sent');
            },
            function(error) {
                var msg = 'Erreur lors de l\'upload du ficiher: ' + error.code;
                navigator.notification.alert(msg, null, 'Problème!');
                console.log('Error uploading file ' + path + ': ' + error.code);
            },
            {fileKey: 'file', fileName: name, mimeType: type});
}
;
function checkMessages() {
    var login = window.localStorage.getItem("login");
    var password = window.localStorage.getItem("password");
    var ipserver = window.localStorage.getItem("ipserver");
    var iduser = window.localStorage.getItem("iduser");
    var idcontact = window.localStorage.getItem("idcontact");
    var idmessage = window.localStorage.getItem("idmessage");
    var url = "http://" + ipserver + "/mobile/getLastMessages";
    $.ajax({
        type: "POST",
        url: url,
        data: {login: login, password: password, iduser: iduser, idcontact: idcontact, idmessage: idmessage},
        dataType: 'json',
        success: function(data) {
            var compte = 0;
            $.each(data, function(key, value) {
                compte = compte + 1;
                window.localStorage.setItem("idmessage", value.id);
                if (value.type == 'TEXT') {
                    navigator.notification.alert(
                            value.texte, // message
                            'Nouveau message'
                            );
                }

            });
            if (compte > 0) {
                navigator.notification.beep(3);
                navigator.notification.vibrate(2000);
            }
        },
        error: function(msg) {
            //alert("Problème connexion réseau");
        }
    });
}
;
function initmap() {
    g_Map = $('#googlemapsjs1');
}
;
function initspeech() {
    navigator.tts.startup(startupSpeechWin, failSpeech);
}
;
function startupSpeechWin(result) {
    // When result is equal to STARTED we are ready to play
    console.log("Result " + result);
    //TTS.STARTED==2 use this once so is answered
    if (result == 2) {
        navigator.tts.getLanguage(winSpeech, failSpeech);
        navigator.tts.speak("Bonjour");
    }
}
;
function winSpeech() {
    //alert('win');
}
;
function failSpeech() {
    alert('fail');
}
;

function detailsTache() {
    $("input[name='details']").click(function() {
        var searchIDs = $("input[name='details']:checked").map(function() {
            return $(this).val();
        }).toArray();
        if (jQuery.inArray("maintenancePreventive", searchIDs) > -1) {
            $("#maintenancePreventive").show();
        }
        else {
            $("#maintenancePreventive").hide();
        }
        if (jQuery.inArray("maintenanceCurative", searchIDs) > -1) {
            $("#maintenanceCurative").show();
        }
        else {
            $("#maintenanceCurative").hide();
        }
        if (jQuery.inArray("approvisionnementGasoil", searchIDs) > -1) {
            $("#approvisionnementGasoil").show();

        }
        else {
            $("#approvisionnementGasoil").hide();
        }
        if (jQuery.inArray("deploiement", searchIDs) > -1) {
            $("#deploiement").show();

        }
        else {
            $("#deploiement").hide();
        }
        if (jQuery.inArray("administrative", searchIDs) > -1) {
            $("#administrative").show();

        }
        else {
            $("#administrative").hide();
        }

        if (jQuery.inArray("maintenancePreventive", searchIDs) > -1 || jQuery.inArray("maintenanceCurative", searchIDs) > -1 || jQuery.inArray("approvisionnementGasoil", searchIDs) > -1) {
            $("#compteurHoraire").show();
        }
        else if (jQuery.inArray("maintenancePreventive", searchIDs) < 0 || jQuery.inArray("maintenanceCurative", searchIDs) < 0 || jQuery.inArray("approvisionnementGasoil", searchIDs) < 0) {
            $("#compteurHoraire").hide();
        }
    });
}
;

function initialiserDetails(tache) {

    $('#checkbox-1a').prop('checked', tache.maintenancePreventive).checkboxradio('refresh');
    if (tache.maintenancePreventive) {
        $("#maintenancePreventive").show();
        $('#checkbox-11a').prop('checked', tache.vidange).checkboxradio('refresh');
        $('#checkbox-12a').prop('checked', tache.prefiltre).checkboxradio('refresh');
        $('#checkbox-13a').prop('checked', tache.filtreGasoil).checkboxradio('refresh');
        $('#checkbox-14a').prop('checked', tache.filtreHuile).checkboxradio('refresh');
        $('#checkbox-15a').prop('checked', tache.filtreAir).checkboxradio('refresh');
        $('#checkbox-16a').prop('checked', tache.courroieAlt).checkboxradio('refresh');
        $('#checkbox-17a').prop('checked', tache.courroieDist).checkboxradio('refresh');
        $('#checkbox-18a').prop('checked', tache.batterie).checkboxradio('refresh');
    }
    else {
        $("#maintenancePreventive").hide();
    }

    $('#checkbox-2a').prop('checked', tache.maintenanceCurative).checkboxradio('refresh');
    if (tache.maintenanceCurative) {
        $("#maintenanceCurative").show();
        $("#anomalie").text(tache.anomalie);
    }
    else {
        $("#maintenanceCurative").hide();
    }
    $('#checkbox-3a').prop('checked', tache.approvisionnementGasoil).checkboxradio('refresh');
    if (tache.approvisionnementGasoil) {
        $("#approvisionnementGasoil").show();
        $("#quantiteGasoil").val(tache.quantiteGasoil);
        $("#quantiteGasoilReste").val(tache.quantiteGasoilReste);
    }
    else {
        $("#approvisionnementGasoil").hide();
    }

    $('#checkbox-4a').prop('checked', tache.deploiement).checkboxradio('refresh');
    if (tache.deploiement) {
        $("#deploiement").show();
        $("#descriptionDeploiement").text(tache.descriptionDeploiement);
    }
    else {
        $("#deploiement").hide();
    }

    $('#checkbox-5a').prop('checked', tache.administrative).checkboxradio('refresh');
    if (tache.administrative) {
        $("#administrative").show();
        $("#descriptionAdministrative").text(tache.descriptionAdministrative);
    }
    else {
        $("#administrative").hide();
    }

    if (tache.approvisionnementGasoil == true || tache.maintenanceCurative == true || tache.maintenancePreventive == true) {
        $("#compteurHoraire").show();
        $("#compteurHoraires").val(tache.compteurHoraire);
    }
    else if (tache.approvisionnementGasoil == false && tache.maintenanceCurative == false && tache.maintenancePreventive == false) {
        $("#compteurHoraire").hide();
    }

    if (tache.status == "TERMINEE" || tache.status == "ANNULEE") {
        $("#accepterRefuser").hide();
    }


}
;

function enregistrerTache() {
    $(".enregistrerTache").click(function() {
        $.mobile.loading('show', {
            text: 'Enregistrement...',
            textVisible: true,
            theme: 'z',
            html: ""
        });
        $("input[name='details']").checkboxradio('refresh');
        $("#checkbox-3a").checkboxradio('refresh');
        $("#checkbox-2a").checkboxradio('refresh');
        $("#checkbox-1a").checkboxradio('refresh');
        var searchIDs = $("input[name='details']:checked").map(function() {
            return $(this).val();
        }).toArray();
        var sousDetailsID = $("input[name='sousDetails']:checked").map(function() {
            return $(this).val();
        }).toArray();
        var state;
        state = true;
        var gasoil;
        gasoil = true;
        var descriptionAdministrative;
        var descriptionDeploiement;
        var quantiteGasoil;
        var quantiteGasoilReste;
        var anomalie;
        var administrative;
        var deploiement;
        var approvisionnementGasoil;
        var maintenanceCurative;
        var maintenancePreventive;
        var vidange;
        var prefiltre;
        var filtreGasoil;
        var filtreHuile;
        var filtreAir;
        var courroieAlt;
        var courroieDist;
        var batterie;
        var compteurHoraire;
        if (jQuery.inArray("maintenancePreventive", searchIDs) > -1) {
            maintenancePreventive = true;
            if (jQuery.inArray("vidange", sousDetailsID) > -1) {
                vidange = true;
            } else {
                vidange = false;
            }
            if (jQuery.inArray("prefiltre", sousDetailsID) > -1) {
                prefiltre = true;
            } else {
                prefiltre = false;
            }
            if (jQuery.inArray("filtreGasoil", sousDetailsID) > -1) {
                filtreGasoil = true;
            } else {
                filtreGasoil = false;
            }
            if (jQuery.inArray("filtreHuile", sousDetailsID) > -1) {
                filtreHuile = true;
            } else {
                filtreHuile = false;
            }
            if (jQuery.inArray("filtreAir", sousDetailsID) > -1) {
                filtreAir = true;
            } else {
                filtreAir = false;
            }
            if (jQuery.inArray("courroieAlt", sousDetailsID) > -1) {
                courroieAlt = true;
            } else {
                courroieAlt = false;
            }
            if (jQuery.inArray("courroieDist", sousDetailsID) > -1) {
                courroieDist = true;
            } else {
                courroieDist = false;
            }
            if (jQuery.inArray("batterie", sousDetailsID) > -1) {
                batterie = true;
            } else {
                batterie = false;
            }

        }
        else {
            maintenancePreventive = false;
            vidange = false;
            prefiltre = false;
            filtreGasoil = false;
            filtreHuile = false;
            filtreAir = false;
            courroieAlt = false;
            courroieDist = false;
            batterie = false;
        }
        if (jQuery.inArray("administrative", searchIDs) > -1) {
            descriptionAdministrative = $("#descriptionAdministrative").val();
            administrative = true;

        }
        else {
            descriptionAdministrative = "";
            administrative = false;
        }
        if (jQuery.inArray("deploiement", searchIDs) > -1) {
            descriptionDeploiement = $("#descriptionDeploiement").val();
            deploiement = true;

        }
        else {
            descriptionDeploiement = "";
            deploiement = false;
        }
        if (jQuery.inArray("approvisionnementGasoil", searchIDs) > -1) {
            quantiteGasoil = $("#quantiteGasoil").val();
            quantiteGasoilReste = $("#quantiteGasoilReste").val();
            approvisionnementGasoil = true;
            if (quantiteGasoil == "") {
                gasoil = false;
            }

        }
        else {
            quantiteGasoil = "";
            approvisionnementGasoil = false;
        }
        if (jQuery.inArray("maintenanceCurative", searchIDs) > -1) {
            anomalie = $("#anomalie").val();
            maintenanceCurative = true;

        }
        else {
            anomalie = "";
            maintenanceCurative = false;
        }
        if (jQuery.inArray("maintenancePreventive", searchIDs) > -1 || jQuery.inArray("maintenanceCurative", searchIDs) > -1 || jQuery.inArray("approvisionnementGasoil", searchIDs) > -1) {
            compteurHoraire = $("#compteurHoraires").val();
            if (compteurHoraire == "") {
                state = false;
            }
        }
        else if (jQuery.inArray("maintenancePreventive", searchIDs) < 0 || jQuery.inArray("maintenanceCurative", searchIDs) < 0 || jQuery.inArray("approvisionnementGasoil", searchIDs) < 0) {
            compteurHoraire = "";
        }
        if (gasoil == true) {
            if (state == true) {
                var ipserver = window.localStorage.getItem("ipserver");
                var idtache = window.localStorage.getItem("idtache");
                var url = "http://" + ipserver + "/mobile/updateTache";
                $.ajax({
                    type: "POST",
                    url: url,
                    data: {idtache: idtache, administrative: administrative, descriptionAdministrative: descriptionAdministrative, deploiement: deploiement, descriptionDeploiement: descriptionDeploiement, approvisionnementGasoil: approvisionnementGasoil, quantiteGasoil: quantiteGasoil, maintenanceCurative: maintenanceCurative, anomalie: anomalie, vidange: vidange, prefiltre: prefiltre, filtreGasoil: filtreGasoil, filtreHuile: filtreHuile, filtreAir: filtreAir, courroieAlt: courroieAlt, courroieDist: courroieDist, batterie: batterie, maintenancePreventive: maintenancePreventive, compteurHoraire: compteurHoraire},
                    dataType: 'json',
                    success: function(data) {
                        $.mobile.loading('hide');
                        alert("La tâche est modifié ");
                        achevermission();
                    },
                    error: function(msg) {
                        alert("Error !: " + "Problème connexion réseaux");
                    }
                });
            }
            else {
                alert("Merci de remplir le champ Compteur horaire");
                $.mobile.loading('hide');
            }
        }
        else {
            alert("Merci de remplir le champ Quantité gasoile");
            $.mobile.loading('hide');
        }
    });

}

function achevermission() {
    $.mobile.loading('show', {
        text: 'Chargement...',
        textVisible: true,
        theme: 'z',
        html: ""
    });
    var login = window.localStorage.getItem("login");
    var password = window.localStorage.getItem("password");
    var ipserver = window.localStorage.getItem("ipserver");
    var iduser = window.localStorage.getItem("iduser");
    var idtache = window.localStorage.getItem("idtache");
    var url = "http://" + ipserver + "/mobile/acheverTache";
    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth() + 1; //Months are zero based
    var curr_year = d.getFullYear();
    var curr_heure = d.getHours();
    var curr_minute = d.getMinutes();
    var date = curr_date + "/" + curr_month + "/" + curr_year + " " + curr_heure + ":" + curr_minute;
    $.ajax({
        type: "POST",
        url: url,
        data: {login: login, password: password, iduser: iduser, idtache: idtache, date: date},
        dataType: 'json',
        success: function(data) {
            $.mobile.loading('hide');
            alert("Félicitation vous venez de terminer votre mission");
            $("#accepterRefuser").hide();
            $("#statustache").html("TERMINEE");
//                $("#literminermission").hide();
//                $("#licomencermission").hide();
//                $("#lideclinermission").hide();
//                $("#liacceptermission").hide();
        },
        error: function(msg) {
            $.mobile.loading('hide');
            alert("Problème lors du contact du serveur");
        }
    });
}
    