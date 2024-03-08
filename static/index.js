"use strict"

$(document).ready(function () {
    // Variabili globali
    let selectedSection = localStorage.getItem('selectedSection');
    let isSidebarToggled = localStorage.getItem('sidebarToggled');

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

    // Funzione per verificare se una stringa è una data nel formato "DD-MM-YYYY"
    function isDate(value) {
        var dateRegex = /^\d{2}-\d{2}-\d{4}$/;
        return dateRegex.test(value);
    }

    caricaOreCalendario()

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

    /****************************************************** FUNZIONI ************************************************************************/
    function caricaOreCalendario() {
        let _tbodyCalendario = $("#oreCalendario");

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

    /****************************************************** UTILIZZO SERVIZI ************************************************************************/
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
});