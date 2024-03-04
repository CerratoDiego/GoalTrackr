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
    $(".table-responsive").css('margin', 'auto');

    // Visibilità
    _dashboard.show();
    $("#programmaGenerale").show();
    $("#visualizzazioneDettagliata").hide();

    if (isSidebarToggled === 'true') {
        $('body').addClass('sidebar-toggled');
        _navbar.addClass('toggled');
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
    $('.table-responsive').hide();
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
            confirmButtonText: 'Si',
            cancelButtonText: 'No',
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
                                return 'Il motivo dell\'assenza è richiesto!';
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
        $('#visualizzazioneButton').css('background-color', '#b8dfff').css('color', 'black');
        // Qui puoi aggiungere il codice per passare al programma generale
        $("#programmaGenerale").show();
        $("#visualizzazioneDettagliata").hide();
    });

    // Gestisci il click sul bottone Visualizzazione dettagliata
    $('#visualizzazioneDettagliataButton').click(function () {
        $(this).css('background-color', '#107ed9').css('color', 'white');
        $('#programmaButton').css('background-color', '#b8dfff').css('color', 'black');
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
});