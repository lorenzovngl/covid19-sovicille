$(document).ready(function () {

    $("#container-loading").height($(window).height());

    let data_labels;
    let datasets;
    let values;
    let values_var;
    let days;
    let chart_sm, chart_lg;
    const CHART_TOTAL = 0, CHART_VARIATION = 1, LAST_30 = 0, LAST_60 = 1, ALL_TIME = 2;
    const COL_GIORNO = 0, COL_TOTALE_CASI = 0, COL_CASI_POSITIVI = 1, COL_RICOVERI = 2,
        COL_GUARIGIONI = 3, COL_DECESSI = 4, COL_SORVEGLIANZA = 5, COL_MISURE_SCADUTE = 6;
    let chart_mode = CHART_TOTAL, time_mode = LAST_30;

    $.ajax({
        type: "GET",
        url: 'data.csv?v=57',
        dataType: "text",
        success: function (data) {
            data = data.split("\n");
            let labels = data[0].split(',');
            labels.shift();
            labels.unshift("Totale casi");
            days = [];
            values = [];
            data.slice(1, data.length).forEach(function (item) {
                let splitted = item.split(",");
                days.push(splitted[COL_GIORNO]);
                let vals = [];
                splitted.slice(1, splitted.length).forEach(function (item) {
                    vals.push(parseInt(item));
                });
                let v = vals[COL_CASI_POSITIVI-1]+vals[COL_GUARIGIONI-1]+vals[COL_DECESSI-1];
                if (isNaN(v)){
                    v = vals[COL_CASI_POSITIVI-1]+vals[COL_GUARIGIONI-1];
                }
                vals.unshift(v)
                values.push(vals);
            });
            days = days.map(function (item){
                return moment(item, "DD-MM-YY");
            });
            for (let i = 0; i < days.length; i++) {
                if (Math.abs(days[i].diff(days[i-1], 'days')) > 30){
                    values.splice(i, 0, [NaN, NaN, NaN, NaN, NaN]);
                }
            }
            values_var = [];
            for (let i = 0; i < values.length - 1; i++) {
                let tmp = [];
                for (let j = 0; j < values[i].length; j++) {
                    if (isNaN(values[i+1][j]) && i+1 < values.length - 1) {
                        if (isNaN(values[i][j])){
                            tmp.push(NaN);
                        } else {
                            tmp.push(0);
                        }
                    } else {
                        tmp.push(values[i][j] - values[i+1][j]);
                    }
                }
                values_var.push(tmp);
            }
            values_var.push(values[values.length - 1]);
            //console.log(days);
            //console.log(values);
            //console.log(values_var);
            $("#last-update").html(days[0].format("DD/MM/YYYY"));
            $("#totale-casi").html(values[0][COL_TOTALE_CASI]);
            $("#casi-positivi").html(values[0][COL_CASI_POSITIVI]);
            $("#ricoveri").html(values[0][COL_RICOVERI]);
            $("#guarigioni").html(values[0][COL_GUARIGIONI]);
            $("#decessi").html(values[0][COL_DECESSI]);
            $("#sorveglianza").html(values[0][COL_SORVEGLIANZA]);
            $("#scaduti").html(values[0][COL_MISURE_SCADUTE]);
            let prev = 1;
            $("#last-update-prev").html(days[prev].format("DD/MM/YYYY"));
            let v = values[0][COL_TOTALE_CASI]-values[prev][COL_TOTALE_CASI];
            let sign = "+";
            if (v <= 0){
                sign = '';
            }
            $("#totale-casi-var").html("(" + sign + v + ")");
            v = values[0][COL_CASI_POSITIVI]-values[prev][COL_CASI_POSITIVI];
            sign = "+";
            if (v <= 0){
                sign = '';
            }
            $("#casi-positivi-var").html("(" + sign + v + ")");
            v = values[0][COL_RICOVERI]-values[prev][COL_RICOVERI];
            sign = "+";
            if (v <= 0){
                sign = '';
            }
            if(isNaN(v)){
                $("#ricoveri-var").hide();
            } else {
                $("#ricoveri-var").html("(" + sign + v + ")");
            }
            v = values[0][COL_GUARIGIONI]-values[prev][COL_GUARIGIONI];
            sign = "+";
            if (v <= 0){
                sign = '';
            }
            $("#guarigioni-var").html("(" + sign + v + ")");
            v = values[0][COL_DECESSI]-values[prev][COL_DECESSI];
            sign = "+";
            if (v <= 0){
                sign = '';
            }
            if(isNaN(v)){
                $("#decessi-var").hide();
            } else {
                $("#decessi-var").html("(" + sign + v + ")");
            }
            v = values[0][COL_SORVEGLIANZA]-values[prev][COL_SORVEGLIANZA];
            sign = "+";
            if (v <= 0){
                sign = '';
            }
            $("#sorveglianza-var").html("(" + sign + v + ")");
            v = values[0][COL_MISURE_SCADUTE]-values[prev][COL_MISURE_SCADUTE];
            sign = "+";
            if (v <= 0){
                sign = '';
            }
            $("#scaduti-var").html("(" + sign + v + ")");
            let ctx_sm = document.getElementById('chart-sm').getContext('2d');
            let ctx_lg = document.getElementById('chart-lg').getContext('2d');
            let limit = 30;
            while (days[0].diff(days[limit], 'days') > 30){
                limit--;
            }
            datasets = [{
                label: labels[COL_TOTALE_CASI],
                data: values.slice(0, limit).map(function (item) {
                    return item[COL_TOTALE_CASI]
                }).reverse(),
                borderColor: 'rgba(220, 110, 0, 0.9)',
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderWidth: 2
            },{
                label: labels[COL_CASI_POSITIVI],
                data: values.slice(0, limit).map(function (item) {
                    return item[COL_CASI_POSITIVI]
                }).reverse(),
                borderColor: 'rgba(220, 0, 0, 0.9)',
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderWidth: 2
            }, {
                label: labels[COL_RICOVERI],
                data: values.slice(0, limit).map(function (item) {
                    return item[COL_RICOVERI]
                }).reverse(),
                borderColor: 'rgba(110, 0, 220, 0.9)',
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderWidth: 2
            }, {
                label: labels[COL_GUARIGIONI],
                data: values.slice(0, limit).map(function (item) {
                    return item[COL_GUARIGIONI]
                }).reverse(),
                borderColor: 'rgba(0, 220, 0, 0.9)',
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderWidth: 2
            }, {
                label: labels[COL_DECESSI],
                data: values.slice(0, limit).map(function (item) {
                    return item[COL_DECESSI]
                }).reverse(),
                borderColor: 'rgba(0, 0, 0, 0.9)',
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderWidth: 2
            }, {
                label: labels[COL_SORVEGLIANZA],
                data: values.slice(0, limit).map(function (item) {
                    return item[COL_SORVEGLIANZA]
                }).reverse(),
                borderColor: 'rgba(220, 220, 0, 0.9)',
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderWidth: 2
            },{
                label: labels[COL_MISURE_SCADUTE],
                data: values.slice(0, limit).map(function (item) {
                    return item[COL_MISURE_SCADUTE]
                }).reverse(),
                borderColor: 'rgba(128, 128, 128, 0.4)',
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderWidth: 2,
                hidden: true
            },];
            data_labels = days.reverse();
            let options = {
                type: 'line',
                data: {
                    labels: data_labels.slice(data_labels.length - limit, data_labels.length),
                    datasets: datasets
                },
                options: {
                    scales: {
                        xAxes: [{
                            type: 'time',
                            time: {
                                unit: 'day',
                                tooltipFormat: 'D/MM/YYYY',
                                displayFormats: {
                                    'day': 'D/MM/YYYY'
                                }
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    },
                    //spanGaps: true,
                    mantainAspectRatio: false
                }
            };
            chart_sm = new Chart(ctx_sm, options);
            chart_lg = new Chart(ctx_lg, options);
            $("#main-container").show();
            $("#container-loading").hide();
        },
        error: function (e) {
            console.log(e);
        }
    });

    function updateChart() {
        let array = values;
        switch (chart_mode) {
            case CHART_VARIATION:
                array = values_var;
                break;
        }
        let limit;
        switch (time_mode) {
            case LAST_30:
                limit = 30;
                while (Math.abs(days[days.length-1].diff(days[days.length-1-limit], 'days')) > 30){
                    limit--;
                }
                for (let i = 0; i < datasets.length; i++) {
                    datasets[i].data = array.slice(0, limit).map(function (item) {
                        return item[i]
                    }).reverse();
                }
                chart_sm.data.labels = data_labels.slice(data_labels.length - limit, data_labels.length);
                chart_lg.data.labels = data_labels.slice(data_labels.length - limit, data_labels.length);
                break;
            case LAST_60:
                limit = 60;
                while (Math.abs(days[days.length-1].diff(days[days.length-1-limit], 'days')) > 60){
                    limit--;
                }
                for (let i = 0; i < datasets.length; i++) {
                    datasets[i].data = array.slice(0, limit).map(function (item) {
                        return item[i]
                    }).reverse();
                }
                chart_sm.data.labels = data_labels.slice(data_labels.length - limit, data_labels.length);
                chart_lg.data.labels = data_labels.slice(data_labels.length - limit, data_labels.length);
                break;
            case ALL_TIME:
                for (let i = 0; i < datasets.length; i++) {
                    datasets[i].data = array.map(function (item) {
                        return item[i]
                    }).reverse();
                }
                chart_sm.data.labels = data_labels;
                chart_lg.data.labels = data_labels;
                break;
        }
        chart_sm.update();
        chart_lg.update();
        //console.log(datasets[0].data);
        //console.log(chart_sm.data.labels);
    }

    function switchButton(button) {
        let siblings = button.parent().find("button");
        siblings.removeClass("btn-primary");
        siblings.addClass("btn-outline-primary");
        button.addClass("btn-primary");
        button.removeClass("btn-outline-primary");
    }

    $("#btn-total").click(function () {
        chart_mode = CHART_TOTAL;
        updateChart();
        switchButton($(this));
    });

    $("#btn-var").click(function () {
        chart_mode = CHART_VARIATION;
        updateChart();
        switchButton($(this));
    });

    $("#btn-last-30").click(function () {
        time_mode = LAST_30;
        updateChart();
        switchButton($(this));
    });

    $("#btn-last-60").click(function () {
        time_mode = LAST_60;
        updateChart();
        switchButton($(this));
    });

    $("#btn-time-begin").click(function () {
        time_mode = ALL_TIME;
        updateChart();
        switchButton($(this));
    });

    let ABITANTI_SOVICILLE = 10030,
        ABITANTI_SIENA = 265364,
        ABITANTI_TOSCANA = 3709139,
        ABITANTI_ITALIA = 60026546;

    let casi_per_zona = [
        [429, 13216, 234592, 4131078],   // 12/05/21
        [357, 11484, 209208, 3769814],   // 11/04/21
        [330, 10501, 193836, 3561012],   // 31/03/21
        [312, 9791, 180998, 3356331],   // 20/03/21
        [232, 7421, 147853, 2795796],   // 20/02/21
        [198, 6866, 142650, 2710819],   // 13/02/21
        [190, 6535, 138618, 2636738],   // 07/02/21
        [184, 6255, 134829, 2560957],   // 01/02/21
        [181, 6002, 131627, 2485956],   // 26/01/21
        [177, 5739, 128438, 2400598],   // 19/01/21
        [178, 5624, 127446, 2368733],   // 16/01/21
        [175, 5433, 125633, 2303263],   // 12/01/21
        [163, 5263, 123950, 2237890],   // 08/01/21
        [157, 5126, 122083, 2166244],   // 04/01/21
        [154, 4959, 120328, 2107166],   // 01/01/21
        [144, 4882, 119236, 2067487],   // 29/12/20
        [139, 4827, 118557, 2038759],   // 26/12/20
        [136, 4722, 116979, 1991278],   // 23/12/20
        [135, 4682, 115783, 1953185],   // 20/12/20
        [132, 4638, 114760, 1921778],   // 18/12/20
        [131, 4600, 113610, 1888144],   // 16/12/20
        [125, 4539, 112344, 1843712],   // 13/12/20
        [122, 4480, 111097, 1805873],   // 09/12/20
        [117, 4425, 109418, 1757394],   // 08/12/20
        [115, 4368, 107644, 1709991],   // 05/12/20
        [115, 4291, 105804, 1664829],   // 03/12/20
        [112, 4205, 104099, 1620901],   // 01/12/20
        [113, 4170, 102548, 1585178],   // 29/11/20
        [112, 4081, 100444, 1538217],   // 27/11/20
        [109, 4059, 99327, 1509875],   // 26/11/20
        [107, 3973, 96028, 1431795],   // 23/11/20
        [107, 3876, 92776, 1380531],   // 21/11/20
        [105, 3720, 88677, 1308528],   // 19/11/20
        [103, 3588, 84197, 1238072],   // 17/11/20
        [103, 3494, 81836, 1205881],   // 16/11/20
        [100, 3387, 79403, 1178529],   // 15/11/20
        [89, 3160, 74330, 1107303],   // 13/11/20
        [87, 3061, 71852, 1066401],   // 12/11/20
        [80, 2873, 67413, 935104],   // 10/11/20
        [75, 2710, 62946, 935104],   // 08/11/20
        [68, 2571, 60467, 902490],   // 07/11/20
        [66, 2416, 57680, 862681],   // 06/11/20
        [65, 2245, 52815, 790377],   // 04/11/20
        [61, 2176, 50987, 759829],   // 03/11/20
        [59, 2088, 48651, 731588],   // 02/11/20
        [58, 2031, 46642, 709335],   // 01/11/20
        [58, 1968, 44263, 679430],   // 31/10/20
        [57, 1886, 41723, 647674]    // 30/10/20
    ]

    $("#casi-per-abit-sovicille").html((casi_per_zona[0][0]/ABITANTI_SOVICILLE*100).toFixed(2)
        .toLocaleString().replace(".", ",")+"%");
    $("#casi-per-abit-sovicille").parent().find(".sub-label").eq(0).html(casi_per_zona[0][0].toLocaleString() + " casi")
    $("#casi-per-abit-siena").html((casi_per_zona[0][1]/ABITANTI_SIENA*100).toFixed(2)
        .toLocaleString().replace(".", ",")+"%");
    $("#casi-per-abit-siena").parent().find(".sub-label").eq(0).html(casi_per_zona[0][1].toLocaleString() + " casi")
    $("#casi-per-abit-toscana").html((casi_per_zona[0][2]/ABITANTI_TOSCANA*100).toFixed(2)
        .toLocaleString().replace(".", ",")+"%");
    $("#casi-per-abit-toscana").parent().find(".sub-label").eq(0).html(casi_per_zona[0][2].toLocaleString() + " casi")
    $("#casi-per-abit-italia").html((casi_per_zona[0][3]/ABITANTI_ITALIA*100).toFixed(2)
        .toLocaleString().replace(".", ",")+"%");
    $("#casi-per-abit-italia").parent().find(".sub-label").eq(0).html(casi_per_zona[0][3].toLocaleString() + " casi");
});