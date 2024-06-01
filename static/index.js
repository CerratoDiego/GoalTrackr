"use strict"

let giorniSettimana = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
let utenteCorrente, giocatoreSelezionato;

$(document).ready(async function () {
    // Variabili globali
    let selectedSection = localStorage.getItem('selectedSection');
    let isSidebarToggled = localStorage.getItem('sidebarToggled');
    let dataCorrente = new Date();
    let dataSelezionata = dataCorrente;
    let mail = localStorage.getItem('mail') || "";
    utenteCorrente = "";
    giocatoreSelezionato = "";

    // Puntatori HTML
    let _wrapper = $("#wrapper");
    let _navbar = $("#accordionSidebar");
    let _dashboard = $("#dashboard");
    let _calendar = $("#calendar");

    // Stili
    $(".statoPresenzaView").css('background-color', '#6c757d').css('color', 'white');
    $(".presenceTables").css('margin', 'auto');

    // Visibilità
    _dashboard.show();
    $("#programmaGenerale").show();
    $("#visualizzazioneDettagliata").hide();
    $("#btnAnnullaModifiche").hide();
    $("#btnSalvaModifiche").hide();
    $("#newGiocatoreContainer").hide();
    $("#updateStats").hide();
    $("#btnUpdateStats").show();
    $("#btnAnnullaStats").hide();
    $("#btnSalvaStats").hide();
    $("#newEventoContainer").hide();

    if (window.location.pathname.includes("index.html")) {
        await getDatiPersonali();
        utenteCorrente = JSON.parse(localStorage.getItem('utenteCorrente'));
        await getGiocatori();
        await getEventi();
        await getStatistiche();
        setTimeout(() => {
            $(".accountName").text(utenteCorrente.nome + " " + utenteCorrente.cognome);
        }, 1000);
    }
    if (window.location.pathname.includes("calendario.html")) {
        utenteCorrente = JSON.parse(localStorage.getItem('utenteCorrente'))
        await getEventi();
        $(".accountName").text(utenteCorrente.nome + " " + utenteCorrente.cognome);
        if (utenteCorrente.categoria === "allenatore") {
            $("#newEventoContainer").show();
        }
    }
    if (window.location.pathname.includes("giocatori.html")) {
        utenteCorrente = JSON.parse(localStorage.getItem('utenteCorrente'))
        await getGiocatori();
        $(".accountName").text(utenteCorrente.nome + " " + utenteCorrente.cognome);
        if (utenteCorrente.categoria === "allenatore") {
            $("#newGiocatoreContainer").show();
        }
    }
    if (window.location.pathname.includes("statistiche.html")) {
        utenteCorrente = JSON.parse(localStorage.getItem('utenteCorrente'))
        await getStatistiche();
        $(".accountName").text(utenteCorrente.nome + " " + utenteCorrente.cognome);
        if (utenteCorrente.categoria === "allenatore") {
            $("#updateStats").show();
        }
    }
    if (window.location.pathname.includes("account.html")) {
        utenteCorrente = JSON.parse(localStorage.getItem('utenteCorrente'))
        await getDatiPersonali();
        $(".accountName").text(utenteCorrente.nome + " " + utenteCorrente.cognome);
    }

    if (isSidebarToggled === 'true') {
        $('body').addClass('sidebar-toggled');
        _navbar.addClass('toggled');
    }

    // Ordinamento delle tabelle per campi
    $("th").click(function () {
        var table = $(this).closest("table");
        var columnIndex = $(this).index();
        var rows = table.find("tbody > tr").get();
        var isAscending = $(this).hasClass("asc");

        rows.sort(function (a, b) {
            var aValue = $(a).find("td").eq(columnIndex).text();
            var bValue = $(b).find("td").eq(columnIndex).text();

            if ($.isNumeric(aValue) && $.isNumeric(bValue)) {
                aValue = parseFloat(aValue);
                bValue = parseFloat(bValue);
                // Ordinamento numerico
                if (isAscending) {
                    return aValue - bValue;
                } else {
                    return bValue - aValue;
                }
            } else if (isDate(aValue) && isDate(bValue)) {
                // Converte le date nel formato "DD-MM-YYYY" in oggetti Date
                var aDateParts = aValue.split("-");
                var bDateParts = bValue.split("-");
                var aDate = new Date(aDateParts[2], aDateParts[1] - 1, aDateParts[0]);
                var bDate = new Date(bDateParts[2], bDateParts[1] - 1, bDateParts[0]);
                // Ordinamento per data
                if (isAscending) {
                    return aDate - bDate;
                } else {
                    return bDate - aDate;
                }
            } else {
                // Ordinamento per stringa
                if (isAscending) {
                    return aValue.localeCompare(bValue);
                } else {
                    return bValue.localeCompare(aValue);
                }
            }
        });

        $.each(rows, function (index, row) {
            table.children("tbody").append(row);
        });

        $("th").removeClass("asc").removeClass("desc");
        $(this).addClass(isAscending ? "desc" : "asc");
    });

    function isDate(value) {
        var dateRegex = /^\d{2}-\d{2}-\d{4}$/;
        return dateRegex.test(value);
    }

    /****************************************************** GESTIONE TOGGLER ************************************************************************/
    // Sidebar
    $('#sidebarToggle').click(function () {
        $('body').toggleClass('sidebar-toggled');
        _navbar.toggleClass('toggled');

        // Memorizza lo stato della sidebar nello storage locale
        if ($('body').hasClass('sidebar-toggled')) {
            localStorage.setItem('sidebarToggled', 'true');
        } else {
            localStorage.setItem('sidebarToggled', 'false');
        }

        if (_navbar.hasClass('toggled')) {
            _navbar.collapse('hide');
        }

        // Impedisce al menu di collassare automaticamente se la finestra è ridimensionata
        if ($('body').hasClass('sidebar-toggled')) {
            _navbar.collapse('hide');
        }
    });

    /****************************************************** GESTIONE BUTTON ************************************************************************/

    // Gestisci il click sul bottone Calendario dalla Dashboard
    $("#btnCalendarioDashboard").click(function () {
        window.location.href = "/calendario.html";
    });

    $("#btnGiocatoriDashboard").click(function () {
        window.location.href = "/giocatori.html";
    });

    $("#btnStatisticheDashboard").click(function () {
        window.location.href = "/statistiche.html";
    });

    $("#btnUpdateStats").click(function () {
        $("input").prop("disabled", false);
        $("tr").each(function () {
            $(this).find("input[type='text']").eq(0).prop("disabled", true);
            $(this).find("input[type='text']").eq(1).prop("disabled", true);
        });
        $("#btnUpdateStats").hide();
        $("#btnAnnullaStats").show();
        $("#btnSalvaStats").show();
    });

    $("#btnAnnullaStats").click(function () {
        $("input").prop("disabled", true);
        $("#btnUpdateStats").show();
        $("#btnAnnullaStats").hide();
        $("#btnSalvaStats").hide();
        $("#tbodyStatistiche").empty();
        getStatistiche();
    })

    $("#btnSalvaStats").click(function () {
        $("input").prop("disabled", true);
        $("input").prop("disabled", true);
        $("#btnUpdateStats").show();
        $("#btnAnnullaStats").hide();
        $("#btnSalvaStats").hide();
        Swal.fire({
            title: "Attendere...",
            icon: "info",
            timer: 5000,
            showConfirmButton: false
        });
        // $("#tbodyStatistiche").empty();
        let statistiche = [];
        $("#tbodyStatistiche tr").each(function () {
            let _tds = $(this).find("td");
            let _stat = {
                "nome": _tds.eq(0).find("input").val(),
                "cognome": _tds.eq(1).find("input").val(),
                "partite_giocate": _tds.eq(2).find("input").val(),
                "gol": _tds.eq(3).find("input").val(),
                "assist": _tds.eq(4).find("input").val(),
                "ammonizioni": _tds.eq(5).find("input").val(),
                "espulsioni": _tds.eq(6).find("input").val()
            }
            statistiche.push(_stat);
        });
        console.log(statistiche)
        let rq = inviaRichiesta("PATCH", "/api/updateStatistiche", { statistiche });
        rq.then((response) => {
            console.log(response);
            Swal.fire({
                title: "Statistiche aggiornate!",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });
        });
        rq.catch((error) => {
            console.log(error);
        });
    });

    // Gestisci il click sul bottone Assente
    $(".absentBtns").click(function () {
        Swal.fire({
            title: 'Assenze',
            html:
                '<span style="font-weight: bold;">Motivo dell\'assenza:</span>' +
                '<select id="motivoAssenza" class="form-control" style="margin-top: 10px;">' +
                '<option value="">Seleziona un motivo</option>' +
                '<option value="Malattia">Motivi di salute</option>' +
                '<option value="Malattia">Visita medica</option>' +
                '<option value="Impegni personali">Impegni personali</option>' +
                '<option value="Altro">Altro</option>' +
                '</select>',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Conferma',
            cancelButtonText: 'Annulla',
            preConfirm: () => {
                const motivo = document.getElementById('motivoAssenza').value;
                if (!motivo) {
                    Swal.showValidationMessage('Seleziona il motivo dell\'assenza');
                }
                return { motivo: motivo };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                if (result.value.motivo == 'Altro') {
                    Swal.fire({
                        title: 'Motivo dell\'assenza',
                        input: 'text',
                        inputPlaceholder: 'Inserisci il motivo dell\'assenza',
                        showCancelButton: true,
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#6c757d',
                        confirmButtonText: 'Conferma',
                        cancelButtonText: 'Annulla',
                        inputValidator: (value) => {
                            if (!value) {
                                return 'E\' richiesto il motivo dell\'assenza!';
                            }
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            Swal.fire(
                                'Assenza segnata!',
                                'Motivo: ' + result.value,
                                'success'
                            );
                            let closestTr = $(this).closest('tr');
                            let statusTd = closestTr.find('td.statoPresenzaView');
                            statusTd.text('Assente').css('background-color', '#dc3545').css('color', 'white');
                            let motivoTd = closestTr.find('td.motivoAssenzaView');
                            motivoTd.text(result.value);
                            $(this).prop('disabled', true);
                            closestTr.find('.presentBtns').prop('disabled', false);
                        }
                    });
                } else {
                    Swal.fire(
                        'Assenza segnata!',
                        'Motivo: ' + result.value.motivo,
                        'success'
                    );
                    let closestTr = $(this).closest('tr');
                    let statusTd = closestTr.find('td.statoPresenzaView');
                    statusTd.text('Assente').css('background-color', '#dc3545').css('color', 'white');
                    let motivoTd = closestTr.find('td.motivoAssenzaView');
                    motivoTd.text(result.value.motivo);
                    $(this).prop('disabled', true);
                    closestTr.find('.presentBtns').prop('disabled', false);
                }
            }
        });
    });

    // Gestisci il click sul bottone Presenza
    $(".presentBtns").click(function () {
        let closestTr = $(this).closest('tr');
        let statusTd = closestTr.find('td.statoPresenzaView');
        statusTd.text('Presente').css('background-color', '#28a745').css('color', 'white');
        let motivoTd = closestTr.find('td.motivoAssenzaView');
        motivoTd.text(" -- ");
        $(this).prop('disabled', true);
        closestTr.find('.absentBtns').prop('disabled', false);
    });

    // Gestisci il click sul bottone Programma generale
    $('#programmaGeneraleButton').click(function () {
        $(this).css('background-color', '#107ed9').css('color', 'white');
        $('#visualizzazioneDettagliataButton').css('background-color', '#b8dfff').css('color', 'black');
        // Qui puoi aggiungere il codice per passare al programma generale
        $("#programmaGenerale").show();
        $("#visualizzazioneDettagliata").hide();
    });

    // Gestisci il click sul bottone Visualizzazione dettagliata
    $('#visualizzazioneDettagliataButton').click(function () {
        $(this).css('background-color', '#107ed9').css('color', 'white');
        $('#programmaGeneraleButton').css('background-color', '#b8dfff').css('color', 'black');
        // Qui puoi aggiungere il codice per passare alla visualizzazione dettagliata
        $("#visualizzazioneDettagliata").show();
        $("#programmaGenerale").hide();
    });

    $("#selectData").change(function () {
        dataSelezionata = $(this).val();
        console.log(dataSelezionata);
        eventiSettimana = filterEventsForSelectedWeek(eventi);
        console.log(eventiSettimana);
        scriviSettimana(new Date(dataSelezionata));
        riempiVisualizzazioneDettagliata(eventiSettimana);
    });

    /****************************************************** FUNZIONI ************************************************************************/
    function caricaOreCalendario() {
        let _tbodyCalendario = $("#tbodyOreCalendario");
        _tbodyCalendario.html("");

        for (let i = 8; i < 24; i++) {
            let _tr = $("<tr>").appendTo(_tbodyCalendario);
            let _td = $("<td>").text(i + ":00").appendTo(_tr);
            _td = $("<td>").text(" -- ").appendTo(_tr);
            _td = $("<td>").text(" -- ").appendTo(_tr);
            _td = $("<td>").text(" -- ").appendTo(_tr);
            _td = $("<td>").text(" -- ").appendTo(_tr);
            _td = $("<td>").text(" -- ").appendTo(_tr);
            _td = $("<td>").text(" -- ").appendTo(_tr);
            _td = $("<td>").text(" -- ").appendTo(_tr);
        }
    }

    function parseDate(dateString) {
        var parts = dateString.split("-");
        return new Date(parts[2], parts[1] - 1, parts[0]); // Anno, mese (0-11), giorno
    }

    function formatDate(date) {
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        return (day < 10 ? '0' : '') + day + '-' + (month < 10 ? '0' : '') + month + '-' + year;
    }

    function isDateInSelectedWeek(date) {
        var selectedDate = new Date(dataSelezionata);
        console.log(selectedDate);
        var selectedWeek = getWeekNumber(selectedDate);
        var targetWeek = getWeekNumber(date);

        return selectedWeek === targetWeek && selectedDate.getFullYear() === date.getFullYear();
    }

    function getWeekNumber(date) {
        var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        var dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    function filterEventsForSelectedWeek(events, selectedDate) {
        var selectedWeekEvents = [];
        for (var i = 0; i < events.length; i++) {
            var eventDate = parseDate(events[i].data);
            if (isDateInSelectedWeek(eventDate)) {
                selectedWeekEvents.push(events[i]);
            }
        }
        return selectedWeekEvents;
    }

    /****************************************************** UTILIZZO SERVIZI ************************************************************************/

    // Funzione per inserire i giocatori nella tabella

    function getGiocatori() {
        console.log(utenteCorrente)
        let rq = inviaRichiesta('GET', '/api/getGiocatori', { utenteCorrente });
        rq.then((response) => {
            console.log(response.data);
            $("#nGiocatoriH1").text(response.data.length);
            for (let item of response.data) {
                let _tr = $("<tr>").appendTo($("#tbodyGiocatori"));
                $("<td>").text(item.nome).appendTo(_tr);
                $("<td>").text(item.cognome).appendTo(_tr);
                $("<td>").text(item.data_di_nascita).appendTo(_tr);
                $("<td>").text(item.numero).appendTo(_tr);
                $("<td>").text(item.ruolo).appendTo(_tr);
                $("<button>").text("VISUALIZZA STATISTICHE").addClass("stats-button").css("background-color", "#107ed9").appendTo($("<td>").appendTo(_tr)).click(async function () {
                    await (giocatoreSelezionato = localStorage.setItem('giocatoreSelezionato', JSON.stringify(item)));
                    window.location.href = "/statisticheGiocatore.html";
                });
            }
        });
        rq.catch((error) => {
            console.log(error);
        });
        rq.finally(() => {
            console.log("Chiamata getGiocatori terminata");
        });
    }

    if (window.location.pathname.includes("statisticheGiocatore.html")) {
        utenteCorrente = JSON.parse(localStorage.getItem('utenteCorrente'))
        $(".accountName").text(utenteCorrente.nome + " " + utenteCorrente.cognome);
        let giocatoreSelezionato = JSON.parse(localStorage.getItem('giocatoreSelezionato'));
        $("#statsGiocatoreH1").text("Statistiche di " + giocatoreSelezionato.cognome + " " + giocatoreSelezionato.nome);
        $("#imgPlayer").prop("src", giocatoreSelezionato.immagine);
        $("#partiteGiocate").val(giocatoreSelezionato.statistiche.partite_giocate);
        $("#goalSegnati").val(giocatoreSelezionato.statistiche.gol);
        $("#assistEffettuati").val(giocatoreSelezionato.statistiche.assist);
        $("#ammonizioni").val(giocatoreSelezionato.statistiche.ammonizioni);
        $("#espulsioni").val(giocatoreSelezionato.statistiche.espulsioni);
        let presenzeTotali = giocatoreSelezionato.presenze.partite + giocatoreSelezionato.presenze.allenamenti + giocatoreSelezionato.presenze.sessioni_video;
        $("#presenze").val(presenzeTotali);
        $("#presenzePartite").val(giocatoreSelezionato.presenze.partite);
        $("#presenzeAllenamenti").val(giocatoreSelezionato.presenze.allenamenti);
        $("#presenzeSessioniVideo").val(giocatoreSelezionato.presenze.sessioni_video);
    }

    // Funzione per inserire gli eventi nella tabella ------------------------------------------------------

    let lunCorrente
    let domCorrente
    function scriviSettimana(data) {
        let giornoSettimana = data.getDay();
        let lunedì = new Date(data);
        lunedì.setDate(data.getDate() - giornoSettimana + (giornoSettimana === 0 ? -6 : 1));
        let domenica = new Date(lunedì);
        domenica.setDate(lunedì.getDate() + 6);
        let lunedìFormat = formatDate(lunedì);
        let domenicaFormat = formatDate(domenica);
        lunCorrente = lunedì;
        domCorrente = domenica;

        let parti = lunedìFormat.split("-");
        let lunedìFormatNuovo = `${parti[2]}-${parti[1]}-${parti[0]}`;
        $("#selectData").val(lunedìFormatNuovo);

        // $("#visualizzazioneDettagliata h3").text(`Settimana selezionata: da ${lunedìFormat} a ${domenicaFormat}`);

        $("#theadOreCalendario").html("");
        let _tr = $("<tr>").appendTo($("#theadOreCalendario"));
        $("<th>").text("Orario").appendTo(_tr);
        for (let i = 0; i < 7; i++) {
            $("<th>").text(giorniSettimana[i] + ", " + parseInt(lunedì.getDate() + i) + "/" + (lunedì.getMonth() + 1)).appendTo(_tr);
        }
    }

    scriviSettimana(dataCorrente);

    let eventiSettimana = [];
    let eventi = [];
    let eventsForCalendar = [];

    if (window.location.pathname.includes("calendario.html")) {
        await $('#visualizzazioneDettagliata').evoCalendar({
            theme: 'Midnight Blue', // Tema del calendario
            language: 'it', // Lingua del calendario
            format: 'MM dd, yyyy', // Formato della data
            todayHighlight: true, // Evidenzia il giorno corrente
            sidebarDisplayDefault: true, // Mostra la barra laterale di default
            calendarEvents: eventsForCalendar
            /* [
                {
                    id: 'bHay68s', // Genera automaticamente un id
                    name: "New Year", // Nome dell'evento
                    date: "May/10/2024", // Data dell'evento
                    type: "holiday", // Tipo di evento
                },
                {
                    id: 'gD8s9s', // Genera automaticamente un id
                    name: "Meeting", // Nome dell'evento
                    date: "May/18/2024", // Data dell'evento
                    type: "event" // Tipo di evento
                }
            ] */
        });
    }

    function getEventi() {
        let rq = inviaRichiesta('GET', '/api/getEventi', { utenteCorrente });
        rq.then(async (response) => {
            eventi = response.data;
            await eventi.sort((a, b) => {
                let dateA = parseDate(a.data);
                let dateB = parseDate(b.data);

                if (dateA.getTime() !== dateB.getTime()) {
                    return dateA.getTime() - dateB.getTime();
                } else {
                    let oraA = a.inizio.split(':').map(Number);
                    let oraB = b.inizio.split(':').map(Number);

                    if (oraA[0] !== oraB[0]) {
                        return oraA[0] - oraB[0];
                    } else {
                        return oraA[1] - oraB[1];
                    }
                }
            });
            console.log(eventi);

            //voglio mettergli la data 3000-01-01 per farlo comparire sempre
            let nearestDate = new Date("3000-01-01");
            let nearestEvent;
            if (eventi.length == 0 && window.location.pathname.includes("calendario.html")) {
                Swal.fire({
                    title: "Nessun evento in programma",
                    icon: "info",
                    showConfirmButton: false,
                    timer: 2000
                });
            }
            for (let item of eventi) {
                let newDate;
                let month = item.data.split("-")[1]
                switch (month) {
                    case "01":
                        newDate = `January/${item.data.split("-")[0]}/${item.data.split("-")[2]}`;
                        break;
                    case "02":
                        newDate = `February/${item.data.split("-")[0]}/${item.data.split("-")[2]}`;
                        break;
                    case "03":
                        newDate = `March/${item.data.split("-")[0]}/${item.data.split("-")[2]}`;
                        break;
                    case "04":
                        newDate = `April/${item.data.split("-")[0]}/${item.data.split("-")[2]}`;
                        break;
                    case "05":
                        newDate = `May/${item.data.split("-")[0]}/${item.data.split("-")[2]}`;
                        break;
                    case "06":
                        newDate = `June/${item.data.split("-")[0]}/${item.data.split("-")[2]}`;
                        break;
                    case "07":
                        newDate = `July/${item.data.split("-")[0]}/${item.data.split("-")[2]}`;
                        break;
                    case "08":
                        newDate = `August/${item.data.split("-")[0]}/${item.data.split("-")[2]}`;
                        break;
                    case "09":
                        newDate = `September/${item.data.split("-")[0]}/${item.data.split("-")[2]}`;
                        break;
                    case "10":
                        newDate = `October/${item.data.split("-")[0]}/${item.data.split("-")[2]}`;
                        break;
                    case "11":
                        newDate = `November/${item.data.split("-")[0]}/${item.data.split("-")[2]}`;
                        break;
                    case "12":
                        newDate = `December/${item.data.split("-")[0]}/${item.data.split("-")[2]}`;
                        break;
                }
                let evento = {
                    id: item._id,
                    name: item.nome,
                    description: item.inizio + " - " + item.fine + " - " + item.luogo + " - " + item.città,
                    date: newDate,
                    type: item.tipo === "Partita" ? "event" : item.tipo === "Allenamento" ? "birthday" : "holiday",
                    color: item.tipo === "Partita" ? "green" : item.tipo === "Allenamento" ? "blue" : "yellow"
                };
                eventsForCalendar.push(evento);

                let eventDateTime = parseDate(item.data);
                let yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1); // Imposta la data a ieri

                if (eventDateTime.getTime() > yesterday.getTime()) {
                    let _tr = $("<tr>").appendTo($("#eventiCalendario"));
                    $("<td>").text(item.data).appendTo(_tr);
                    $("<td>").text(item.nome).appendTo(_tr);
                    $("<td>").text(item.tipo).appendTo(_tr);
                    $("<td>").text(item.luogo + ", " + item.città).appendTo(_tr);
                    // $("<td>").text(item.inizio).appendTo(_tr);
                    // $("<td>").text(item.fine).appendTo(_tr);
                    let _tdStatoPresenza = $("<td>").addClass("statoPresenzaView")
                        .addClass("tooltip-container")
                        .appendTo(_tr)
                        .text("Non definito");
                    for (let pres of item.presenze) {
                        console.log(pres);
                        if (pres.userId == utenteCorrente._id) {
                            if (pres.presenza) {
                                _tdStatoPresenza.text("Presente").css('background-color', '#28a745').css('color', 'white');
                            } else if (!pres.presenza) {
                                _tdStatoPresenza.text("Assente").css('background-color', '#dc3545').css('color', 'white');
                                $("<span>").appendTo(_tdStatoPresenza).text(pres.descrizione).addClass("tooltip");
                            }
                        }
                    }
                    let _td = $("<td>").appendTo(_tr);
                    if (utenteCorrente.categoria === "giocatore") {
                        $("<button>").prop("type", "button")
                            .addClass("btn").addClass("btn-success").addClass("presentBtns")
                            .appendTo(_td).text("PRESENTE")
                            .on("click", function () {
                                // gestionePresenze(item._id, item.nome, item.tipo, item.data, item.inizio, item.fine, item.luogo, item.città, true)
                                Swal.fire({
                                    title: "Conferma presenza",
                                    text: "Sei sicuro di voler confermare la presenza?",
                                    icon: "question",
                                    showCancelButton: true,
                                    confirmButtonText: "Conferma",
                                    cancelButtonText: "Annulla",
                                    reverseButtons: true
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        let isPresent = true;
                                        let rq = inviaRichiesta('PATCH', '/api/confermaPresenza', { "id": item._id, utenteCorrente, isPresent });
                                        rq.then((response) => {
                                            console.log(response);
                                            if (response.data == "Presenza aggiunta correttamente") {
                                                Swal.fire({
                                                    title: "Presenza confermata!",
                                                    icon: "success",
                                                    showConfirmButton: false,
                                                    timer: 1500
                                                });
                                                _tdStatoPresenza.text("Presente").css('background-color', '#28a745').css('color', 'white');
                                                let request = inviaRichiesta('PATCH', '/api/aggiornaPresenzeGiocatore', { "tipo": item.tipo, utenteCorrente });
                                                request.then((response) => {
                                                    console.log(response);
                                                    alert("Presenza aggiornata correttamente");
                                                });
                                                request.catch((error) => {
                                                    console.log(error);
                                                });
                                            } else
                                                if (response.data == "L'utente ha già confermato la presenza") {
                                                    Swal.fire({
                                                        title: "Presenza già registrata!",
                                                        icon: "info",
                                                        showConfirmButton: false,
                                                        timer: 1500
                                                    });
                                                }
                                        });
                                        rq.catch((error) => {
                                            console.log(error);
                                        });
                                    }
                                });
                            });
                        $("<button>").prop("type", "button")
                            .addClass("btn").addClass("btn-danger").addClass("absentBtns")
                            .appendTo(_td).text("ASSENTE")
                            .on("click", function () {
                                // gestionePresenze(item._id, item.nome, item.tipo, item.data, item.inizio, item.fine, item.luogo, item.città, false)
                                Swal.fire({
                                    title: 'Assenza',
                                    html:
                                        '<span style="font-weight: bold;">Motivo dell\'assenza:</span>' +
                                        '<select id="motivoAssenza" class="form-control" style="margin-top: 10px;">' +
                                        '<option value="">Seleziona un motivo</option>' +
                                        '<option value="Motivi di salute">Motivi di salute</option>' +
                                        '<option value="Visita medica">Visita medica</option>' +
                                        '<option value="Impegni personali">Impegni personali</option>' +
                                        '<option value="Altro">Altro</option>' +
                                        '</select>',
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonColor: '#d33',
                                    cancelButtonColor: '#6c757d',
                                    confirmButtonText: 'Conferma',
                                    cancelButtonText: 'Annulla',
                                    preConfirm: () => {
                                        const motivo = document.getElementById('motivoAssenza').value;
                                        if (!motivo) {
                                            Swal.showValidationMessage('Seleziona il motivo dell\'assenza');
                                        }
                                        return { motivo: motivo };
                                    }
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        if (result.value.motivo == 'Altro') {
                                            Swal.fire({
                                                title: 'Motivo dell\'assenza',
                                                input: 'text',
                                                inputPlaceholder: 'Inserisci il motivo dell\'assenza',
                                                showCancelButton: true,
                                                confirmButtonColor: '#d33',
                                                cancelButtonColor: '#6c757d',
                                                confirmButtonText: 'Conferma',
                                                cancelButtonText: 'Annulla',
                                                inputValidator: (value) => {
                                                    if (!value) {
                                                        return 'E\' richiesto il motivo dell\'assenza!';
                                                    }
                                                }
                                            }).then((result) => {
                                                if (result.isConfirmed) {
                                                    let rq = inviaRichiesta('PATCH', '/api/confermaPresenza', { "id": item._id, utenteCorrente, "isPresent": false, motivo: result.value });
                                                    rq.then((response) => {
                                                        console.log(response);
                                                        if (response.data == "Assenza aggiunta correttamente") {
                                                            Swal.fire({
                                                                title: "Assenza confermata!",
                                                                icon: "success",
                                                                showConfirmButton: false,
                                                                timer: 1500
                                                            });
                                                            _tdStatoPresenza.text("Assente").css('background-color', '#dc3545').css('color', 'white');
                                                        } else
                                                            if (response.data == "L'utente ha già confermato l'assenza") {
                                                                Swal.fire({
                                                                    title: "Assenza già registrata!",
                                                                    icon: "info",
                                                                    showConfirmButton: false,
                                                                    timer: 1500
                                                                });
                                                            }
                                                    });
                                                    rq.catch((error) => {
                                                        console.log(error);
                                                    });
                                                }
                                            });
                                        } else {
                                            let rq = inviaRichiesta('PATCH', '/api/confermaPresenza', { "id": item._id, utenteCorrente, "isPresent": false, motivo: result.value.motivo });
                                            rq.then((response) => {
                                                console.log(response);
                                                if (response.data == "Assenza aggiunta correttamente") {
                                                    Swal.fire({
                                                        title: "Assenza confermata!",
                                                        icon: "success",
                                                        showConfirmButton: false,
                                                        timer: 1500
                                                    });
                                                    _tdStatoPresenza.text("Assente").css('background-color', '#dc3545').css('color', 'white');
                                                } else
                                                    if (response.data == "L'utente ha già confermato l'assenza") {
                                                        Swal.fire({
                                                            title: "Assenza già registrata!",
                                                            icon: "info",
                                                            showConfirmButton: false,
                                                            timer: 1500
                                                        });
                                                    }
                                            });
                                            rq.catch((error) => {
                                                console.log(error);
                                            });
                                        }
                                    }
                                });
                            });
                    }
                    else {
                        $("#thStatoPresenza").hide();
                        _tdStatoPresenza.hide();
                        $("<button>").prop("type", "button").addClass("btn").addClass("btn-primary").appendTo(_td).text("VISUALIZZA PRESENZE").click(function () {
                            visualizzaPresenze(item.presenze);
                        });
                    }
                }
                if (eventDateTime.getTime() > yesterday.getTime() && eventDateTime.getTime() < nearestDate.getTime()) {
                    nearestDate = eventDateTime;
                    nearestEvent = item;
                }
            }
            eventsForCalendar.forEach(function (event) {
                // Trova l'elemento .day corrispondente alla data dell'evento
                var dayElement = $('.day[data-date="' + event.date + '"]');

                // Aggiungi la classe appropriata in base al tipo di evento
                switch (event.type) {
                    case 'event':
                        dayElement.addClass('green-dot');
                        break;
                    case 'birthday':
                        dayElement.addClass('blue-dot');
                        break;
                    case 'holiday':
                        dayElement.addClass('yellow-dot');
                        break;
                }
            });

            if (nearestEvent != undefined) {
                $(".dashBoardTable").eq(0).text(nearestEvent.data);
                $(".dashBoardTable").eq(1).text(nearestEvent.nome);
                $(".dashBoardTable").eq(2).text(nearestEvent.città);
                $("#dashBoardTr").click(function () {
                    if (utenteCorrente.categoria === "giocatore")
                        gestionePresenze(nearestEvent._id, nearestEvent.nome, nearestEvent.tipo, nearestEvent.data,
                            nearestEvent.inizio, nearestEvent.fine, nearestEvent.luogo, nearestEvent.città);
                    else
                        gestionePresenzeAllenatore(nearestEvent._id, nearestEvent.nome, nearestEvent.tipo, nearestEvent.data,
                            nearestEvent.inizio, nearestEvent.fine, nearestEvent.luogo, nearestEvent.città, nearestEvent.presenze);
                });
                $("#mobileDashboardTd").text(nearestEvent.nome).click(function () {
                    if (utenteCorrente.categoria === "giocatore")
                        gestionePresenze(nearestEvent._id, nearestEvent.nome, nearestEvent.tipo, nearestEvent.data,
                            nearestEvent.inizio, nearestEvent.fine, nearestEvent.luogo, nearestEvent.città);
                    else
                        gestionePresenzeAllenatore(nearestEvent._id, nearestEvent.nome, nearestEvent.tipo, nearestEvent.data,
                            nearestEvent.inizio, nearestEvent.fine, nearestEvent.luogo, nearestEvent.città, nearestEvent.presenze);
                });
            } else {
                $(".dashBoardTable").eq(0).text("Nessun evento in programma");
                $(".dashBoardTable").eq(1).text("Nessun evento in programma");
                $(".dashBoardTable").eq(2).text("Nessun evento in programma");
                $("#mobileDashboardTd").text("Nessun evento in programma");
            }

            eventiSettimana = filterEventsForSelectedWeek(eventi);
            riempiVisualizzazioneDettagliata(eventiSettimana);
        });
        rq.catch((error) => {
            console.log(error);
        });
        rq.finally(() => {
            console.log("Chiamata getEventi terminata");
        });
    }

    function riempiVisualizzazioneDettagliata(eventiSettimana) {
        caricaOreCalendario();

        eventiSettimana.forEach(evento => {
            let oraInizio = parseInt(evento.inizio.split(":")[0]);
            let oraFine = parseInt(evento.fine.split(":")[0]);

            let tdIndexStart = oraInizio - 8;
            let tdIndexEnd = oraFine - 8;

            if (tdIndexStart >= 0 && tdIndexStart < 16) {
                let tdEventoStart = $("#tbodyOreCalendario tr:eq(" + tdIndexStart + ") td:eq(1)");
                tdEventoStart.addClass("event-start").addClass("eventTd");
                tdEventoStart.text(evento.nome);
                tdEventoStart.prop("eventDetails", evento);
                if (evento.tipo === "Partita") {
                    tdEventoStart.css("background-color", "green");
                    tdEventoStart.css("border-color", "green")
                } else if (evento.tipo === "Allenamento") {
                    tdEventoStart.css("background-color", "blue");
                    tdEventoStart.css("border-color", "blue")
                } else if (evento.tipo === "Sessione Video") {
                    tdEventoStart.css("background-color", "yellow").css("color", "black");
                    tdEventoStart.css("border-color", "yellow")
                }
            }

            if (tdIndexEnd > tdIndexStart && tdIndexEnd < 16) {
                for (let i = tdIndexStart + 1; i < tdIndexEnd; i++) {
                    let tdEvento = $("#tbodyOreCalendario tr:eq(" + i + ") td:eq(1)");
                    tdEvento.addClass("eventTd");
                    tdEvento.prop("eventDetails", evento);
                    if (evento.tipo === "Partita") {
                        tdEvento.css("background-color", "green");
                        tdEvento.css("border-color", "green")
                    } else if (evento.tipo === "Allenamento") {
                        tdEvento.css("background-color", "blue");
                        tdEvento.css("border-color", "blue")
                    } else if (evento.tipo === "Sessione Video") {
                        tdEvento.css("background-color", "yellow");
                        tdEvento.css("border-color", "yellow")
                    }
                    tdEvento.text("")
                }
            }
        });
    }

    $(document).on("click", ".eventTd", function () {
        let eventDetails = $(this).prop("eventDetails");

        let html = "<div>" +
            "<p><strong>Nome:</strong> " + eventDetails.nome + "</p>" +
            "<p><strong>Tipo:</strong> " + eventDetails.tipo + "</p>" +
            "<p><strong>Data:</strong> " + eventDetails.data + "</p>" +
            "<p><strong>Ora di inizio:</strong> " + eventDetails.inizio + "</p>" +
            "<p><strong>Ora di fine:</strong> " + eventDetails.fine + "</p>" +
            "<p><strong>Luogo:</strong> " + eventDetails.luogo + "</p>" +
            "<p><strong>Città:</strong> " + eventDetails.città + "</p>" +
            "</div>";

        Swal.fire({
            title: "Dettagli dell'evento",
            html: html,
            icon: "info",
            confirmButtonText: "Gestisci presenza",
            showCloseButton: true,
            closeButtonAriaLabel: "Chiudi"
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Gestione presenza",
                    showCancelButton: true,
                    showConfirmButton: true,
                    showCloseButton: true,
                    confirmButtonText: "PRESENTE",
                    confirmButtonColor: "green",
                    cancelButtonText: "ASSENTE",
                    cancelButtonColor: "red",
                    preConfirm: () => {
                        return Swal.fire({
                            title: "Conferma presenza",
                            text: "Sei sicuro di voler confermare la presenza?",
                            icon: "question",
                            showCancelButton: true,
                            confirmButtonText: "Conferma",
                            cancelButtonText: "Annulla",
                            reverseButtons: true
                        }).then((result) => {
                            if (result.isConfirmed) {
                                Swal.fire("Presenza confermata!", "", "success");
                            }
                        });
                    }
                }).then((result) => {
                    if (result.dismiss === Swal.DismissReason.cancel) {
                        Swal.fire({
                            title: 'Assenze',
                            html:
                                '<span style="font-weight: bold;">Motivo dell\'assenza:</span>' +
                                '<select id="motivoAssenza" class="form-control" style="margin-top: 10px;">' +
                                '<option value="">Seleziona un motivo</option>' +
                                '<option value="Malattia">Motivi di salute</option>' +
                                '<option value="Malattia">Visita medica</option>' +
                                '<option value="Impegni personali">Impegni personali</option>' +
                                '<option value="Altro">Altro</option>' +
                                '</select>',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#6c757d',
                            confirmButtonText: 'Conferma',
                            cancelButtonText: 'Annulla',
                            preConfirm: () => {
                                const motivo = document.getElementById('motivoAssenza').value;
                                if (!motivo) {
                                    Swal.showValidationMessage('Seleziona il motivo dell\'assenza');
                                }
                                return { motivo: motivo };
                            }
                        }).then((result) => {
                            if (result.isConfirmed) {
                                if (result.value.motivo == 'Altro') {
                                    Swal.fire({
                                        title: 'Motivo dell\'assenza',
                                        input: 'text',
                                        inputPlaceholder: 'Inserisci il motivo dell\'assenza',
                                        showCancelButton: true,
                                        confirmButtonColor: '#d33',
                                        cancelButtonColor: '#6c757d',
                                        confirmButtonText: 'Conferma',
                                        cancelButtonText: 'Annulla',
                                        inputValidator: (value) => {
                                            if (!value) {
                                                return 'E\' richiesto il motivo dell\'assenza!';
                                            }
                                        }
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            Swal.fire(
                                                'Assenza segnata!',
                                                'Motivo: ' + result.value,
                                                'success'
                                            );
                                        }
                                    });
                                } else {
                                    Swal.fire(
                                        'Assenza segnata!',
                                        'Motivo: ' + result.value.motivo,
                                        'success'
                                    );
                                }
                            }
                        });
                    }
                });
            }
        });
    });

    function getDatiPersonali() {
        let rq = inviaRichiesta('GET', '/api/getDatiPersonali', { mail });
        rq.then((response) => {
            console.log(response.data);
            $(".accountFields").eq(0).val(response.data[0].nome);
            $(".accountFields").eq(1).val(response.data[0].cognome);
            $(".accountFields").eq(2).val(response.data[0].data_di_nascita);
            $(".accountFields").eq(3).val(response.data[0].email);
            $(".accountFields").eq(4).val(response.data[0].username);
            $(".accountFields").eq(5).val(response.data[0].telefono);
            $(".accountFields").eq(6).val(response.data[0].squadra);

            utenteCorrente = {
                "_id": response.data[0]._id,
                "nome": response.data[0].nome,
                "cognome": response.data[0].cognome,
                "data_di_nascita": response.data[0].data_di_nascita,
                "email": response.data[0].email,
                "username": response.data[0].username,
                "telefono": response.data[0].telefono,
                "squadra": response.data[0].squadra,
                "categoria": response.data[0].categoria
            };
            localStorage.setItem('utenteCorrente', JSON.stringify(utenteCorrente));
        });
        rq.catch((error) => {
            console.log(error);
        });
        rq.finally(() => {
            console.log("Chiamata getDatiPersonali terminata");
        });
    }

    $("#btnModificaDati").click(function () {
        $(".accountFields").prop("disabled", false);
        $(".accountFields").eq(6).prop("disabled", true);
        $("#btnModificaDati").prop("disabled", true);
        $("#btnSalvaModifiche").show();
        $("#btnAnnullaModifiche").show();

        $("#btnSalvaModifiche").click(function () {
            $(".accountFields").prop("disabled", true);
            $("#btnModificaDati").prop("disabled", false);
            $("#btnSalvaModifiche").hide();
            $("#btnAnnullaModifiche").hide();

            var isValid = true;
            $("input").each(function () {
                if ($(this).val().trim() === "") {
                    isValid = false;
                    return false;
                }
            });

            if (!isValid) {
                Swal.fire("Errore", "Compilare tutti i campi", "error");
            } else {
                let accountDetails = {};
                accountDetails.nome = $(".accountFields").eq(0).val();
                accountDetails.cognome = $(".accountFields").eq(1).val();
                accountDetails.data_di_nascita = $(".accountFields").eq(2).val();
                accountDetails.email = $(".accountFields").eq(3).val();
                accountDetails.username = $(".accountFields").eq(4).val();
                accountDetails.telefono = $(".accountFields").eq(5).val();
                accountDetails.squadra = $(".accountFields").eq(6).val();

                let rq = inviaRichiesta('PATCH', '/api/updateDatiPersonali', { accountDetails });
                rq.then((response) => {
                    console.log(response);
                    Swal.fire({
                        title: "Dati aggiornati",
                        icon: "success",
                        timer: 2000
                    });
                });
                rq.catch((error) => {
                    console.log(error);
                });
            }

        });

        $("#btnAnnullaModifiche").click(function () {
            $(".accountFields").prop("disabled", true);
            $("#btnModificaDati").prop("disabled", false);
            $("#btnSalvaModifiche").hide();
            $("#btnAnnullaModifiche").hide();
            getDatiPersonali();
        });
    });

    // Inserimento di un nuovo giocatore da parte dell'allenatore
    $("#newGiocatore").click(function () {
        Swal.fire({
            title: 'Inserisci i dati del giocatore',
            html:
                '<label for="nome">Nome: </label><input id="nome" class="swal2-input">' +
                '<label for="cognome">Cognome: </label><input id="cognome" class="swal2-input">' +
                '<label for="email">Email: </label><input id="email" class="swal2-input">' +
                '<label for="data_di_nascita">Data di nascita: </label><input id="data_di_nascita" type="date" class="swal2-input">' +
                '<label for="ruolo">Ruolo: </label><input id="ruolo" class="swal2-input">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Conferma',
            cancelButtonText: 'Annulla',
            preConfirm: () => {
                return [
                    document.getElementById('nome').value,
                    document.getElementById('cognome').value,
                    document.getElementById('email').value,
                    document.getElementById('data_di_nascita').value,
                    document.getElementById('ruolo').value
                ]
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const [nome, cognome, email, data_di_nascita, ruolo] = result.value;
                // console.log(nome, cognome, email, data_di_nascita, ruolo);
                let rq = inviaRichiesta('POST', '/api/newGiocatore', { nome, cognome, email, data_di_nascita, ruolo, utenteCorrente });
                rq.then((response) => {
                    console.log(response);
                    Swal.fire({
                        title: "Giocatore inserito",
                        icon: "success",
                        timer: 2000
                    });
                    $("#tbodyGiocatori").empty();
                    getGiocatori();
                });
                rq.catch((error) => {
                    console.log(error);
                });
            } else {
                console.log('Operazione annullata');
            }
        });

    });

    // Inserimento di un nuovo evento da parte dell'allenatore
    $("#newEvento").click(function () {
        Swal.fire({
            title: 'Inserisci i dati dell\'evento',
            html:
                '<label for="nome">Nome: </label><input id="nome" class="swal2-input"><br><br>' +
                '<label for="tipo">Tipo: </label><select id="tipo" class="swal2-input"><br>' +
                '<option value="Allenamento">Allenamento</option>' +
                '<option value="Partita">Partita</option>' +
                '<option value="Sessione Video">Sessione Video</option>' +
                '</select><br>' +
                '<label for="data">Data: </label><input id="data" type="date" class="swal2-input"><br>' +
                '<label for="inizio">Ora di inizio: </label><input id="inizio" type="time" class="swal2-input"><br>' +
                '<label for="fine">Ora di fine: </label><input id="fine" type="time" class="swal2-input"><br>' +
                '<label for="luogo">Luogo: </label><input id="luogo" class="swal2-input"><br>' +
                '<label for="città">Città: </label><input id="città" class="swal2-input">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Conferma',
            cancelButtonText: 'Annulla',
            preConfirm: () => {
                const nome = document.getElementById('nome').value;
                const tipo = document.getElementById('tipo').value;
                const data = document.getElementById('data').value;
                const inizio = document.getElementById('inizio').value;
                const fine = document.getElementById('fine').value;
                const luogo = document.getElementById('luogo').value;
                const città = document.getElementById('città').value;

                if (!nome || !tipo || !data || !inizio || !fine || !luogo || !città) {
                    Swal.showValidationMessage('Completa tutti i campi');
                    return false;
                }

                return [nome, tipo, data, inizio, fine, luogo, città];
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const [nome, tipo, data, inizio, fine, luogo, città] = result.value;
                // console.log(nome, tipo, data, inizio, fine, luogo, città);
                let aus = data.split("-");
                console.log(aus);
                alert("FERMA")
                let newData = `${aus[2]}-${aus[1]}-${aus[0]}`;
                let rq = inviaRichiesta('POST', '/api/newEvento', { nome, tipo, "data": newData, inizio, fine, luogo, città, utenteCorrente });
                rq.then((response) => {
                    console.log(response);
                    Swal.fire({
                        title: "Evento inserito",
                        icon: "success",
                        timer: 2000
                    });
                    $("#eventiCalendario").empty();
                    getEventi();
                });
                rq.catch((error) => {
                    console.log(error);
                });
            } else {
                console.log('Operazione annullata');
            }
        });
    });

    function getStatistiche() {
        let rq = inviaRichiesta('GET', '/api/getGiocatori', { utenteCorrente });
        rq.then((response) => {
            console.log(response.data);
            let maxGoals = 0;
            let topGoalscorer, topGoalscorerImg;
            let maxAssists = 0;
            let topAssistman, topAssistmanImg;
            for (let item of response.data) {
                let _tr = $("<tr>").appendTo($("#tbodyStatistiche"));
                if (utenteCorrente.categoria === "allenatore") {
                    $("<input>").prop("disabled", true).prop("type", "text").css("width", "120px").css("text-align", "center").val(item.nome).appendTo($("<td>").appendTo(_tr));
                    $("<input>").prop("disabled", true).prop("type", "text").css("width", "120px").css("text-align", "center").val(item.cognome).appendTo($("<td>").appendTo(_tr));
                    $("<input>").prop("disabled", true).prop("type", "number").prop("min", 0).css("width", "120px").css("text-align", "center").val(item.statistiche.partite_giocate).appendTo($("<td>").appendTo(_tr));
                    $("<input>").prop("disabled", true).prop("type", "number").prop("min", 0).css("width", "80px").css("text-align", "center").val(item.statistiche.gol).appendTo($("<td>").appendTo(_tr));
                    $("<input>").prop("disabled", true).prop("type", "number").prop("min", 0).css("width", "80px").css("text-align", "center").val(item.statistiche.assist).appendTo($("<td>").appendTo(_tr));
                    $("<input>").prop("disabled", true).prop("type", "number").prop("min", 0).css("width", "120px").css("text-align", "center").val(item.statistiche.ammonizioni).appendTo($("<td>").appendTo(_tr));
                    $("<input>").prop("disabled", true).prop("type", "number").prop("min", 0).css("width", "120px").css("text-align", "center").val(item.statistiche.espulsioni).appendTo($("<td>").appendTo(_tr));
                } else {
                    $("<td>").text(item.nome).appendTo(_tr);
                    $("<td>").text(item.cognome).appendTo(_tr);
                    $("<td>").text(item.statistiche.partite_giocate).appendTo(_tr);
                    $("<td>").text(item.statistiche.gol).appendTo(_tr);
                    $("<td>").text(item.statistiche.assist).appendTo(_tr);
                    $("<td>").text(item.statistiche.ammonizioni).appendTo(_tr);
                    $("<td>").text(item.statistiche.espulsioni).appendTo(_tr);
                }

                if (parseInt(item.statistiche.gol) > parseInt(maxGoals)) {
                    maxGoals = item.statistiche.gol;
                    topGoalscorer = item.nome + " " + item.cognome;
                    topGoalscorerImg = item.immagine;
                }
                if (parseInt(item.statistiche.assist) > parseInt(maxAssists)) {
                    maxAssists = item.statistiche.assist;
                    topAssistman = item.nome + " " + item.cognome;
                    topAssistmanImg = item.immagine;
                }
            }
            $("#goalMigliorMarcatore").text(maxGoals);
            $("#assistMigliorAssistman").text(maxAssists);
            if (maxGoals > 0) {
                $("#topGoalscorerImg").prop("src", topGoalscorerImg).css("cursor", "pointer").click(function () {
                    window.location.href = "statistiche.html";
                });
                $("#topGoalscorer").text(topGoalscorer);
            }
            else {
                $("#topGoalscorerImg").prop("src", "https://res.cloudinary.com/doxdpaiqr/image/upload/v1716055693/GoalTrackr/h9y1tserq3xlqheyfhzr.png");
                $("#topGoalscorer").text("Nessuna rete segnata");
            }
            if (maxAssists > 0) {
                $("#topAssistmanImg").prop("src", topAssistmanImg).css("cursor", "pointer").click(function () {
                    window.location.href = "statistiche.html";
                });
                $("#topAssistman").text(topAssistman);
            }
            else {
                $("#topAssistmanImg").prop("src", "https://res.cloudinary.com/doxdpaiqr/image/upload/v1716055693/GoalTrackr/h9y1tserq3xlqheyfhzr.png");
                $("#topAssistman").text("Nessun assist fornito");
            }
        });
    }

    /* if (window.location.pathname.includes("presenze.html")) {
        await presenze();
    }

    function presenze() {
        let rq = inviaRichiesta('GET', '/api/getEventi', { utenteCorrente });
        rq.then((response) => {
            console.log(response.data);
            for (let item of response.data) {
                let _tr = $("<tr>").appendTo($("#eventiPresenze"));
                $("<td>").text(item.data).appendTo(_tr);
                $("<td>").text(item.tipo).appendTo(_tr);
                $("<td>").text(item.luogo + ", " + item.città).appendTo(_tr);
                $("<td>").text(item.inizio).appendTo(_tr);
                $("<td>").text(item.fine).appendTo(_tr);
                $("<td>").text(" -- ").appendTo(_tr);
                $("<td>").text(" -- ").appendTo(_tr);
            }
        });
    } */


    //RICERCA NEL SITO

    let suggestions = ["Home", "Statistiche", "Calendario", "Presenze", "Giocatori", "Account"];
    $(".searchInput").on("input", function () {
        let input = $(this).val().toLowerCase();
        $(".suggestionsBox").empty();

        if (input) {
            let startsWithSuggestions = suggestions.filter(function (suggestion) {
                return suggestion.toLowerCase().startsWith(input);
            });

            let containsSuggestions = suggestions.filter(function (suggestion) {
                return suggestion.toLowerCase().includes(input) && !suggestion.toLowerCase().startsWith(input);
            });

            let filteredSuggestions = startsWithSuggestions.concat(containsSuggestions);

            filteredSuggestions.forEach(function (suggestion) {
                $("<div>").appendTo($(".suggestionsBox")).addClass("suggestion").text(suggestion).click(function () {
                    window.location.href = suggestion.toLowerCase() + ".html";
                });
            });
        }
    });





    // |       ||||  |||||  |  |   |
    // |      |    | |      |  ||  |
    // |      |    | | |||  |  | | |
    // |      |    | |   |  |  |  ||
    // |||||   ||||  ||||   |  |   |





    // LOGIN ------------------------------------------------------------------------------------------------------------------------------------------------------------
    let _username = $("#usr")
    let _password = $("#pwd")


    $("#btnLogin").on("click", controllaLogin)
    // $("#btnRecuperaPassword").on("click",recuperaPassword)

    // il submit deve partire anche senza click 
    // con il solo tasto INVIO
    $(document).on('keydown', function (event) {
        if (event.keyCode == 13)
            controllaLogin();
    });

    if (window.location.pathname.includes("login.html")) {
        let rq = inviaRichiesta("PATCH", "/api/encryptPassword");
        rq.then(function (data) {
            console.log(data);
        });
        rq.catch(function (err) {
            console.log(err);
        });
    }

    function controllaLogin() {
        _username.removeClass("is-invalid");
        _username.prev().removeClass("icona-rossa");
        _password.removeClass("is-invalid");
        _password.prev().removeClass("icona-rossa");

        if (_username.val() == "") {
            _username.addClass("is-invalid");
            _username.prev().addClass("icona-rossa");
        }
        else if (_password.val() == "") {
            _password.addClass("is-invalid");
            _password.prev().addClass("icona-rossa");
        }
        else {
            mail = _username.val();
            localStorage.setItem('mail', mail);
            console.log(mail)
            let request = inviaRichiesta('POST', '/api/login',
                {
                    "username": _username.val(),
                    "password": _password.val()
                }
            );
            request.catch(function (err) {
                _username.addClass("is-invalid");
                _username.prev().addClass("icona-rossa");
                _password.addClass("is-invalid");
                _password.prev().addClass("icona-rossa");
                errore(err)
            });
            request.then(function (response) {
                window.location.href = "index.html"
            })
        }
    }

    // $("#btnGoogle").on("click",function(){
    // 	google.accounts.id.initialize({
    // 		"client_id": oAuthId,
    // 		"callback": function (response) {
    // 			if (response.credential !== "") {
    // 				let token = response.credential
    // 				console.log("token:", token)
    // 				localStorage.setItem("token", token)
    // 				/* window.location.href = "index.html" oppure */
    // 				let request = inviaRichiesta("POST", "/api/googleLogin");
    // 				request.then(function (response) {
    // 					window.location.href = "index.html"
    // 				});
    // 				request.catch(errore);
    // 			}
    // 		}
    // 	})
    // 	google.accounts.id.renderButton(
    // 		document.getElementById("googleDiv"), // qualunque tag DIV della pagina
    // 		{
    // 			"theme": "outline",
    // 			"size": "large",
    // 			"type": "standard",
    // 			"text": "continue_with",
    // 			"shape": "rectangular",
    // 			"logo_alignment": "center"
    // 		}
    // 	);
    // 	google.accounts.id.prompt();
    // })

    /* function recuperaPassword(){
        let request=inviaRichiesta("POST","/api/sendNewPassword",{"skipCheckToken":true})
        request.catch(errore)
        request.then((response)=>{
            alert("Mail inviata alla vostra casella di posta")
        })
    } */


    // REGISTRAZIONE -----------------------------------------------------------------------------------------------------------------------------------------------------

    let _nome = $("#FirstName")
    let _cognome = $("#LastName")
    let _email = $("#Email")
    let _passwordReg = $("#Password")
    let _confermaPassword = $("#RepeatPassword")
    let _categoriaGiocatore = $("input[name='category'][value='Giocatore']");
    let _categoriaAllenatore = $("input[name='category'][value='Allenatore']");
    $("#btnRegister").on("click", controllaRegistrazione)
    function controllaRegistrazione() {
        _nome.removeClass("is-invalid");
        _nome.prev().removeClass("icona-rossa");
        _cognome.removeClass("is-invalid");
        _cognome.prev().removeClass("icona-rossa");
        _email.removeClass("is-invalid");
        _email.prev().removeClass("icona-rossa");
        _passwordReg.removeClass("is-invalid");
        _passwordReg.prev().removeClass("icona-rossa");
        _confermaPassword.removeClass("is-invalid");
        _confermaPassword.prev().removeClass("icona-rossa");
        $(".radio-inputs").removeClass("is-invalid");
        $(".radio-inputs").prev().removeClass("icona-rossa");

        if (_nome.val() == "") {
            _nome.addClass("is-invalid");
            _nome.prev().addClass("icona-rossa");
        }
        else if (_cognome.val() == "") {
            _cognome.addClass("is-invalid");
            _cognome.prev().addClass("icona-rossa");
        }
        else if (!_categoriaGiocatore.is(":checked") && !_categoriaAllenatore.is(":checked")) {
            _categoriaGiocatore.css("border-color", "red");
            _categoriaAllenatore.css("border-color", "red");
        }
        else if (_email.val() == "") {
            _email.addClass("is-invalid");
            _email.prev().addClass("icona-rossa");
        }
        else if (_passwordReg.val() == "") {
            _passwordReg.addClass("is-invalid");
            _passwordReg.prev().addClass("icona-rossa");
        }
        else if (_confermaPassword.val() == "") {
            _confermaPassword.addClass("is-invalid");
            _confermaPassword.prev().addClass("icona-rossa");
        }
        else if (_passwordReg.val() != _confermaPassword.val()) {
            _passwordReg.addClass("is-invalid");
            _passwordReg.prev().addClass("icona-rossa");
            _confermaPassword.addClass("is-invalid");
            _confermaPassword.prev().addClass("icona-rossa");
        }
        else {
            mail = _email.val();
            localStorage.setItem('mail', mail);
            console.log(mail)
            /* let request = inviaRichiesta('POST', '/api/login',
                {
                    "username": _username.val(),
                    "password": _password.val()
                }
            );
            request.catch(function (err) {
                _username.addClass("is-invalid");
                _username.prev().addClass("icona-rossa");
                _password.addClass("is-invalid");
                _password.prev().addClass("icona-rossa");
                errore(err)
            });
            request.then(function (response) {
                window.location.href = "index.html"
            }) */
        }
    }
});


function clickEvent(id, nome, tipo, descrizione = "", titoloData = "") {
    let newType = "";
    let newDate;
    if (tipo === "event") {
        newType = "Partita";
    }
    else if (tipo === "birthday") {
        newType = "Allenamento";
    }
    else if (tipo === "holiday") {
        newType = "Sessione Video";
    }

    let vetDesc = descrizione.split("-")
    let inizio = vetDesc[0].trim()
    let fine = vetDesc[1].trim()
    let luogo = vetDesc[2].trim()
    let città = vetDesc[3].trim()

    let month = titoloData.split(",")[0].split(" ")[0]
    let day = titoloData.split(",")[0].split(" ")[1]
    let year = titoloData.split(",")[1].split(" ")[1]

    switch (month) {
        case "Gennaio":
            newDate = `${day}-01-${year}`;
            break;
        case "Febbraio":
            newDate = `${day}-02-${year}`;
            break;
        case "Marzo":
            newDate = `${day}-03-${year}`;
            break;
        case "Aprile":
            newDate = `${day}-04-${year}`;
            break;
        case "Maggio":
            newDate = `${day}-05-${year}`;
            break;
        case "Giugno":
            newDate = `${day}-06-${year}`;
            break;
        case "Loglio":
            newDate = `${day}-07-${year}`;
            break;
        case "Agosto":
            newDate = `${day}-08-${year}`;
            break;
        case "Settembre":
            newDate = `${day}-09-${year}`;
            break;
        case "Ottobre":
            newDate = `${day}-10-${year}`;
            break;
        case "Novembre":
            newDate = `${day}-11-${year}`;
            break;
        case "Dicembre":
            newDate = `${day}-12-${year}`;
            break;
    }

    if (utenteCorrente.categoria === "giocatore") {
        gestionePresenze(id, nome, newType, newDate, inizio, fine, luogo, città)
    }
    else {
        let rq = inviaRichiesta('GET', '/api/getPresenze', { id });
        rq.then((response) => {
            console.log(response.data);
            let presenze = response.data.presenze;
            console.log(presenze)
            gestionePresenzeAllenatore(id, nome, newType, newDate, inizio, fine, luogo, città, presenze)
        });
        rq.catch((error) => {
            console.log(error);
        });
    }
}

function gestionePresenze(id, nome, tipo, data, inizio, fine, luogo, città, isPresent = true) {
    let dataNow = new Date().toLocaleDateString('it-IT');
    let aus = dataNow.split("/");
    let dataCorrente = `${aus[0]}-${aus[1]}-${aus[2]}`;
    let dateToCompare = new Date(aus[2], aus[1] - 1, aus[0]);
    let dataParts = data.split("-");
    let dataToCompare = new Date(dataParts[2], dataParts[1] - 1, dataParts[0]);
    let condition = true;
    if (dataToCompare < dateToCompare) {
        condition = false;
    }

    let html = "<div>" +
        "<p><strong>Nome:</strong> " + nome + "</p>" +
        "<p><strong>Tipo:</strong> " + tipo + "</p>" +
        "<p><strong>Data:</strong> " + data + "</p>" +
        "<p><strong>Ora di inizio:</strong> " + inizio + "</p>" +
        "<p><strong>Ora di fine:</strong> " + fine + "</p>" +
        "<p><strong>Luogo:</strong> " + luogo + "</p>" +
        "<p><strong>Città:</strong> " + città + "</p>" +
        "</div>";

    Swal.fire({
        title: "Dettagli dell'evento",
        html: html,
        icon: "info",
        confirmButtonText: condition ? "Gestisci presenza" : "Chiudi",
        showCloseButton: true,
        closeButtonAriaLabel: "Chiudi"
    }).then((result) => {
        if (result.isConfirmed) {
            if (condition) {
                Swal.fire({
                    title: "Gestione presenza",
                    showCancelButton: true,
                    showConfirmButton: true,
                    showCloseButton: true,
                    confirmButtonText: "PRESENTE",
                    confirmButtonColor: "green",
                    cancelButtonText: "ASSENTE",
                    cancelButtonColor: "red",
                    preConfirm: () => {
                        return Swal.fire({
                            title: "Conferma presenza",
                            text: "Sei sicuro di voler confermare la presenza?",
                            icon: "question",
                            showCancelButton: true,
                            confirmButtonText: "Conferma",
                            cancelButtonText: "Annulla",
                            reverseButtons: true
                        }).then((result) => {
                            if (result.isConfirmed) {
                                let rq = inviaRichiesta('PATCH', '/api/confermaPresenza', { id, utenteCorrente, isPresent });
                                rq.then((response) => {
                                    console.log(response);
                                    if (response.data == "Presenza aggiunta correttamente") {
                                        Swal.fire({
                                            title: "Presenza confermata!",
                                            icon: "success",
                                            showConfirmButton: false,
                                            timer: 1500
                                        });
                                        let request = inviaRichiesta('PATCH', '/api/aggiornaPresenzeGiocatore', { tipo, utenteCorrente });
                                        request.then((response) => {
                                            console.log(response);
                                            alert("Presenza aggiornata correttamente");
                                        });
                                        request.catch((error) => {
                                            console.log(error);
                                        });
                                    } else
                                        if (response.data == "L'utente ha già confermato la presenza") {
                                            Swal.fire({
                                                title: "Presenza già registrata!",
                                                icon: "info",
                                                showConfirmButton: false,
                                                timer: 1500
                                            });
                                        }
                                });
                                rq.catch((error) => {
                                    console.log(error);
                                });
                            }
                        });
                    }
                }).then((result) => {
                    if (result.dismiss === Swal.DismissReason.cancel) {
                        Swal.fire({
                            title: 'Assenza',
                            html:
                                '<span style="font-weight: bold;">Motivo dell\'assenza:</span>' +
                                '<select id="motivoAssenza" class="form-control" style="margin-top: 10px;">' +
                                '<option value="">Seleziona un motivo</option>' +
                                '<option value="Motivi di salute">Motivi di salute</option>' +
                                '<option value="Visita medica">Visita medica</option>' +
                                '<option value="Impegni personali">Impegni personali</option>' +
                                '<option value="Altro">Altro</option>' +
                                '</select>',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#6c757d',
                            confirmButtonText: 'Conferma',
                            cancelButtonText: 'Annulla',
                            preConfirm: () => {
                                const motivo = document.getElementById('motivoAssenza').value;
                                if (!motivo) {
                                    Swal.showValidationMessage('Seleziona il motivo dell\'assenza');
                                }
                                return { motivo: motivo };
                            }
                        }).then((result) => {
                            if (result.isConfirmed) {
                                if (result.value.motivo == 'Altro') {
                                    Swal.fire({
                                        title: 'Motivo dell\'assenza',
                                        input: 'text',
                                        inputPlaceholder: 'Inserisci il motivo dell\'assenza',
                                        showCancelButton: true,
                                        confirmButtonColor: '#d33',
                                        cancelButtonColor: '#6c757d',
                                        confirmButtonText: 'Conferma',
                                        cancelButtonText: 'Annulla',
                                        inputValidator: (value) => {
                                            if (!value) {
                                                return 'E\' richiesto il motivo dell\'assenza!';
                                            }
                                        }
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            let rq = inviaRichiesta('PATCH', '/api/confermaPresenza', { id, utenteCorrente, isPresent: false, motivo: result.value });
                                            rq.then((response) => {
                                                console.log(response);
                                                if (response.data == "Assenza aggiunta correttamente") {
                                                    Swal.fire({
                                                        title: "Assenza confermata!",
                                                        icon: "success",
                                                        showConfirmButton: false,
                                                        timer: 1500
                                                    });
                                                } else
                                                    if (response.data == "L'utente ha già confermato l'assenza") {
                                                        Swal.fire({
                                                            title: "Assenza già registrata!",
                                                            icon: "info",
                                                            showConfirmButton: false,
                                                            timer: 1500
                                                        });
                                                    }
                                            });
                                            rq.catch((error) => {
                                                console.log(error);
                                            });
                                        }
                                    });
                                } else {
                                    let rq = inviaRichiesta('PATCH', '/api/confermaPresenza', { id, utenteCorrente, isPresent: false, motivo: result.value.motivo });
                                    rq.then((response) => {
                                        console.log(response);
                                        if (response.data == "Assenza aggiunta correttamente") {
                                            Swal.fire({
                                                title: "Assenza confermata!",
                                                icon: "success",
                                                showConfirmButton: false,
                                                timer: 1500
                                            });
                                        } else
                                            if (response.data == "L'utente ha già confermato l'assenza") {
                                                Swal.fire({
                                                    title: "Assenza già registrata!",
                                                    icon: "info",
                                                    showConfirmButton: false,
                                                    timer: 1500
                                                });
                                            }
                                    });
                                    rq.catch((error) => {
                                        console.log(error);
                                    });
                                }
                            }
                        });
                    }
                });
            }
        }
    });
}

function gestionePresenzeAllenatore(id, nome, tipo, data, inizio, fine, luogo, città, presenze) {
    let html = "<div>" +
        "<p><strong>Nome:</strong> " + nome + "</p>" +
        "<p><strong>Tipo:</strong> " + tipo + "</p>" +
        "<p><strong>Data:</strong> " + data + "</p>" +
        "<p><strong>Ora di inizio:</strong> " + inizio + "</p>" +
        "<p><strong>Ora di fine:</strong> " + fine + "</p>" +
        "<p><strong>Luogo:</strong> " + luogo + "</p>" +
        "<p><strong>Città:</strong> " + città + "</p>" +
        "</div>";

    Swal.fire({
        title: "Dettagli dell'evento",
        html: html,
        icon: "info",
        confirmButtonText: "Visualizza presenze",
        showCloseButton: true,
        closeButtonAriaLabel: "Chiudi"
    }).then((result) => {
        if (result.isConfirmed) {
            visualizzaPresenze(presenze);
        }
    });
}

function visualizzaPresenze(presenze) {
    let contPres = 0, contAss = 0;
    for (let presenza of presenze) {
        if (presenza.presenza)
            contPres++;
        else
            contAss++;
    }
    Swal.fire({
        title: "Presenze",
        html: `<p>Numero giocatori presenti: <b>${contPres}</b></p>
                                <p>Numero giocatori assenti: <b>${contAss}</b></p>`,
        icon: "info",
        showCloseButton: true,
        confirmButtonText: "Vedi presenti",
        cancelButtonText: "Vedi assenti",
        showCancelButton: true,
        cancelButtonColor: "red",
        confirmButtonColor: "green"
    }).then((result) => {
        if (result.isConfirmed) {
            let html = "<div>";
            let vuoto = true;
            for (let presenza of presenze) {
                console.log(presenza)
                if (presenza.presenza) {
                    html += `<p>${presenza.nome} ${presenza.cognome}</p>`;
                    vuoto = false;
                }
            }
            if (vuoto)
                html += "<p>Nessun giocatore presente</p>";
            html += "</div>";
            Swal.fire({
                title: "Giocatori presenti",
                html: html,
                icon: "info",
                showCloseButton: true,
                confirmButtonText: "Chiudi"
            }).then((result) => {
                if (result.isConfirmed) {
                    visualizzaPresenze(presenze);
                }
            });
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
            let html = "<div>";
            let vuoto = true;
            for (let presenza of presenze) {
                if (!presenza.presenza) {
                    html += `<p><b>${presenza.nome} ${presenza.cognome}</b>: ${presenza.descrizione}</p>`;
                    vuoto = false;
                }
            }
            if (vuoto)
                html += "<p>Nessun giocatore assente</p>";
            html += "</div>";
            Swal.fire({
                title: "Giocatori assenti",
                html: html,
                icon: "info",
                showCloseButton: true,
                confirmButtonText: "Chiudi"
            }).then((result) => {
                if (result.isConfirmed) {
                    visualizzaPresenze(presenze);
                }
            });
        }
    });
}