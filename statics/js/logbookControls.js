class LogbookControls extends App {
    constructor() {
        super(LogbookControls.name, `
            <button data-icon="engine" data-iconpos="top" id="reffButton" data-corners="false">Reffen</button>
            <button data-icon="boat" data-iconpos="top" id="unreefButton" data-corners="false">Ausreffen</button>
            <button data-icon="boat" data-iconpos="top" id="segelButton" data-corners="false">Segel</button>
            <button data-icon="engine" data-iconpos="top" id="motorButton" data-corners="false">Motor</button>
            <button data-icon="poller" data-iconpos="top" id="anlegenButton" data-corners="false">Anlegen</button>
            <button data-icon="boat" data-iconpos="top" id="ablegenButton" data-corners="false">Ablegen</button>
            <button data-icon="poller" data-iconpos="top" id="hafenButton" data-corners="false">Hafen</button>
            <button data-icon="anker" data-iconpos="top" data-corners="false" id="ankerButton">Anker</button>
            <button data-icon="boje" data-iconpos="top" id="bojeButton" data-corners="false">Boje</button>
            <button data-icon="pen" data-iconpos="top" id="safetyBriefingButton" data-corners="false">Safety Briefing</button>
            <button data-icon="pen" data-iconpos="top" id="weatherReportButton" data-corners="false">Weather Report</button>
            <button data-icon="pen" data-iconpos="top" id="sonstigesButton" data-corners="false">Sonstiges</button>
            <button data-icon="rettungsring" data-iconpos="top" data-theme="d" id="pobButton" data-corners="false">Person über Bord</button>
            <div id="sonstigesArea">
                <h1 id="sonstigesSubject"></h1>
                <div id="sonstigesContent"></div>
            </div>
            <button data-icon="save" data-iconpos="top" id="speichernButton" data-corners="false">Speichern</button>
            <button data-icon="back" data-iconpos="top" data-corners="false" id="backButton">Zurück</button>
        `);

        /*
        * ##############################################################################
        * ## Logbook Status Controls ###################################################
        * ##############################################################################
        */
        $('#anlegenButton').click(() => {
            this.lastGuiScreen = this.guiScreen;
            this.gotoScreen("landing");
        });
        $('#ablegenButton').click(() => {
            this.lastGuiScreen = this.guiScreen;
            this.gotoScreen("leaving");
        });
        $('#backButton').click(() => {
            this.gotoScreen(this.lastGuiScreen);
        });
        
        $('#motorButton').click(() => {
            this.connector.send({status: "motoring"});
        });
        $('#segelButton, #unreefButton').click(() => {
            this.connector.send({status: "sailing"});
        });
        $('#reffButton').click(() => {
            this.connector.send({status: "reef"});
        });
        $('#hafenButton').click(() => {
            this.connector.send({status: "landed"});
        });
        $('#ankerButton').click(() => {
            this.connector.send({status: "landed"});
        });
        $('#bojeButton').click(() => {
            this.connector.send({status: "landed"});
        });
        $('#safetyBriefingButton').click(() => {
            this.lastGuiScreen = this.guiScreen;
            $("#sonstigesSubject").html("Sicherheitseinweisung")
            $("#sonstigesContent").html(window.message_templates.safety_briefing);
            this.gotoScreen("custom");
        });
        $('#weatherReportButton').click(() => {
            this.connector.send({command: 'weather_report'});
        });
        $('#sonstigesButton').click(() => {
            this.lastGuiScreen = this.guiScreen;
            $("#sonstigesSubject").html("Notiz")
            $("#sonstigesContent").html(window.message_templates.note);
            this.gotoScreen("custom");
        });
        $('#speichernButton').click(() => {
            // persist checkboxes
            $('#sonstigesContent input:checkbox').each(function(index, value) {
            if(value.checked)
                value.setAttribute("checked", "checked");
            else
                value.removeAttribute("checked");
            });

            // persist textarea
            $('#sonstigesContent textarea').each(function(index, value) {
            value.innerText = $(value).val();
            });

            this.connector.send({message: {subject: $('#sonstigesSubject').html(), content: $('#sonstigesContent').html()}});
            this.gotoScreen(this.lastGuiScreen);
        });
        $('#pobButton').click(() => {
            this.connector.send({message: "MOB"});
        });

        this.gotoScreen('landed');
    };

    lastGuiScreen = "";
    guiScreen = "landed";

    gotoScreen(screen) {
        $('#' + LogbookControls.name.toLowerCase()).children().hide();
        $('#safetyBriefingButton').show();
        $('#weatherReportButton').show();
        
        switch(screen) {
        case "landing":
            $('#hafenButton').show();
            $('#ankerButton').show();
            $('#bojeButton').show();
            $('#backButton').show();
            break;
        case "landed":
            $('#ablegenButton').show();
            $('#sonstigesButton').show();
            break;
        case "leaving":
            $('#segelButton').show();
            $('#reffButton').show();
            $('#motorButton').show();
            $('#backButton').show();
            break;
        case "sailing":
            $('#reffButton').show();
            $('#motorButton').show();
            $('#anlegenButton').show();
            $('#sonstigesButton').show();
            $('#pobButton').show();
            break;
        case "reef":
            $('#unreefButton').show();
            $('#motorButton').show();
            $('#anlegenButton').show();
            $('#sonstigesButton').show();
            $('#pobButton').show();
            break;
        case "motoring":
            $('#segelButton').show();
            $('#reffButton').show();
            $('#anlegenButton').show();
            $('#sonstigesButton').show();
            $('#pobButton').show();
            break;
        case "custom":
            $('#sonstigesArea').show();
            $('#speichernButton').show();
            $('#backButton').show();
            break;
        }
        this.guiScreen = screen;
    }

    add(incoming) {
        if(undefined != incoming.logline.status)
            this.gotoScreen(incoming.logline.status);
    }
}