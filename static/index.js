"use strict"

let giorniSettimana = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];

$(document).ready(async function () {
    // Variabili globali
    let selectedSection = localStorage.getItem('selectedSection');
    let isSidebarToggled = localStorage.getItem('sidebarToggled');
    let dataCorrente = new Date();
    let dataSelezionata = dataCorrente;
    let mail = localStorage.getItem('mail') || "";

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

    // Nascondi tutti i div all'avvio tranne quello selezionato
    $('.presenceTables').hide();
    $('#' + selectedSection).show();

    // Gestisci il click su allenamentiToggler
    $('#allenamentiToggler').click(function () {
        localStorage.setItem('selectedSection', 'allenamenti');
    });

    // Gestisci il click su partiteToggler
    $('#partiteToggler').click(function () {
        localStorage.setItem('selectedSection', 'partite');
    });

    // Gestisci il click su sessionivideoToggler
    $('#sessionivideoToggler').click(function () {
        localStorage.setItem('selectedSection', 'sessionivideo');
    });

    /****************************************************** GESTIONE BUTTON ************************************************************************/
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

    if (window.location.pathname.includes("giocatori.html")) {
        // Chiamata alla funzione getGiocatori solo se si è sulla pagina giocatori.html
        getGiocatori();
    }

    function getGiocatori() {
        let rq = inviaRichiesta('GET', '/api/getGiocatori', {});
        rq.then((response) => {
            console.log(response.data);
            for (let item of response.data) {
                let _tr = $("<tr>").appendTo($("#tbodyGiocatori"));
                $("<td>").text(item.nome).appendTo(_tr);
                $("<td>").text(item.cognome).appendTo(_tr);
                $("<td>").text(item.data_di_nascita).appendTo(_tr);
                $("<td>").text(item.numero).appendTo(_tr);
                $("<td>").text(item.ruolo).appendTo(_tr);
                $("<button>").text("VISUALIZZA STATISTICHE").addClass("stats-button").css("background-color", "#107ed9").appendTo($("<td>").appendTo(_tr)).click(function () {
                    window.location.href = "/statistiche.html";
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

        $("#visualizzazioneDettagliata h3").text(`Settimana selezionata: da ${lunedìFormat} a ${domenicaFormat}`);

        $("#theadOreCalendario").html("");
        let _tr = $("<tr>").appendTo($("#theadOreCalendario"));
        $("<th>").text("Orario").appendTo(_tr);
        for (let i = 0; i < 7; i++) {
            $("<th>").text(giorniSettimana[i] + ", " + parseInt(lunedì.getDate() + i) + "/" + (lunedì.getMonth() + 1)).appendTo(_tr);
        }
    }

    scriviSettimana(dataCorrente);

    if (window.location.pathname.includes("calendario.html")) {
        await getEventi();
    }

    let eventiSettimana = [];
    let eventi = [];
    function getEventi() {
        let rq = inviaRichiesta('GET', '/api/getEventi', {});
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

            for (let item of eventi) {
                let _tr = $("<tr>").appendTo($("#eventiCalendario"));
                $("<td>").text(item.data).appendTo(_tr);
                $("<td>").text(item.tipo).appendTo(_tr);
                $("<td>").text(item.luogo + ", " + item.città).appendTo(_tr);
                $("<td>").text(item.inizio).appendTo(_tr);
                $("<td>").text(item.fine).appendTo(_tr);
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

    if (window.location.pathname.includes("account.html")) {
        getDatiPersonali();
    }

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
        $("#btnSalvaModifiche").prop("disabled", false);

        $("#btnSalvaModifiche").click(function () {
            $(".accountFields").prop("disabled", true);
            $("#btnModificaDati").prop("disabled", false);
            $("#btnSalvaModifiche").prop("disabled", true);

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
                    Swal.fire("Modifiche salvate", "", "success");
                });
                rq.catch((error) => {
                    console.log(error);
                });
            }

        });
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
});