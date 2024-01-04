/**
 * lovelace-starline-card v1.2.1
 * Thu, 04 Jan 2024 12:07:28 GMT
 */
const STARLINE_ENTITIES = {
    'battery': {
        name: 'Battery',
        required: true,
        regex: /^sensor\.(.+)_battery(_[0-9]+)?$/,
    },
    'balance': {
        name: 'Balance',
        required: true,
        regex: /^sensor\.(.+)_balance(_[0-9]+)?$/,
    },
    'ctemp': {
        name: 'Interior Temperature',
        required: true,
        regex: /^sensor\.(.+)_interior_temperature(_[0-9]+)?$/,
    },
    'etemp': {
        name: 'Engine Temperature',
        required: true,
        regex: /^sensor\.(.+)_engine_temperature(_[0-9]+)?$/,
    },
    'gps': {
        name: 'GPS Satellites',
        required: false,
        regex: /^sensor\.(.+)_gps_satellites(_[0-9]+)?$/,
    },
    'gsm_lvl': {
        name: 'GSM Signal Level',
        required: true,
        regex: /^sensor\.(.+)_gsm_signal(_[0-9]+)?$/,
    },
    'fuel': {
        name: 'Fuel volume',
        required: false,
        regex: /^sensor\.(.+)_fuel_volume(_[0-9]+)?$/,
    },
    'hbrake': {
        name: 'Hand Brake',
        required: false,
        regex: /^binary_sensor\.(.+)_hand_brake(_[0-9]+)?$/,
    },
    'hood': {
        name: 'Hood',
        required: true,
        regex: /^binary_sensor\.(.+)_hood(_[0-9]+)?$/,
    },
    'horn': {
        name: 'Horn',
        required: true,
        regex: /^(button|switch)\.(.+)_horn(_[0-9]+)?$/,
    },
    'trunk': {
        name: 'Trunk',
        required: true,
        regex: /^binary_sensor\.(.+)_trunk(_[0-9]+)?$/,
    },
    'alarm': {
        name: 'Alarm Status',
        required: true,
        regex: /^binary_sensor\.(.+)_alarm(_[0-9]+)?$/,
    },
    'door': {
        name: 'Doors Status',
        required: true,
        regex: /^binary_sensor\.(.+)_doors(_[0-9]+)?$/,
    },
    'engine': {
        name: 'Engine',
        required: true,
        regex: /^switch\.(.+)_engine(_[0-9]+)?$/,
    },
    'webasto': {
        name: 'Heater',
        required: false,
        regex: /^switch\.(.+)_webasto(_[0-9]+)?$/,
    },
    'out': {
        name: 'Additional Channel',
        required: false,
        regex: /^switch\.(.+)_additional_channel(_[0-9]+)?$/,
    },
    'security': {
        name: 'Security',
        required: true,
        regex: /^lock\.(.+)_security(_[0-9]+)?$/,
    },
    'location': {
        name: 'Location',
        required: true,
        regex: /^device_tracker\.(.+)_location(_[0-9]+)?$/,
    },
    'handsfree': {
        name: 'Handsfree',
        required: false,
        regex: /^binary_sensor\.(.+)_handsfree(_[0-9]+)?$/,
    },
    'neutral': {
        name: 'Programmable neutral',
        required: false,
        regex: /^binary_sensor\.(.+)_programmable_neutral(_[0-9]+)?$/,
    },
    'moving_ban': {
        name: 'Moving ban',
        required: false,
        regex: /^binary_sensor\.(.+)_moving_ban(_[0-9]+)?$/,
    },
};

class StarlineCard extends HTMLElement {
    constructor() {
        super();
        this._config = {
            controls: ['arm', 'ign', 'horn', 'webasto', 'out'],
            info: ['balance', 'battery', 'ctemp', 'etemp', 'gps'],
            dark: false
        };
        this._hass = null;
        this._clickTimeouts = {
            left: null,
            center: null,
            right: null
        };
        this._inProgressTimeout = null;
        this._info = {
            balance: {
                element: null,
                value: null
            },
            battery: {
                element: null,
                value: null
            },
            ctemp: {
                element: null,
                value: null
            },
            etemp: {
                element: null,
                value: null
            },
            gps: {
                element: null,
                value: null
            },
            fuel: {
                element: null,
                value: null
            }
        };
        this._gsm_lvl = {
            element: null,
            value: null
        };
        this._handsfree = {
            element: null
        };
        this._neutral = {
            element: null
        };
        this._moving_ban = {
            element: null
        };
        this._controls = {
            security: null,
            engine: null,
            out: null,
            webasto: null
        };
        this.$wrapper = null;
        this.$container = null;
        this.$car = null;
        this.$security = null;
        this.$controlLeft = null;
        this.$controlCenter = null;
        this.$controlRight = null;
        this.$toast = null;
    }
    set hass(hass) {
        this._hass = hass;
        this._updateEntitiesConfig();
        if (!this.$wrapper) {
            this._render();
        }
        this._update();
    }
    _render() {
        const card = document.createElement('ha-card');
        const style = document.createElement('style');
        card.header = this._config.title || '';
        style.textContent = `@keyframes smoke { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAnUExURUdwTCyv5iyu5iyv5iuw5IaEky+v5yyv5i2u5yyv5uZRDy2v5y2v5lCbFAcAAAAMdFJOUwCB9c4kFAjhTbEoZGK0yqEAAABjSURBVDjLY2AYBYMJBGATXEC0YMBoCI6CUTAKiAYsgg6YYnPOKIorogkynwEBAWyCKqiC3GDB46jmstWARQ1QldqABRVQxDjAYocaUAQ5z5w5LHRYFMOiaawJ6K5vVkwgwt8Ajosmd/c+ZGEAAAAASUVORK5CYII="); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTCyv5iyv5iyv5iyv5iyv5i2t6Syv5iyv5iyv5iuv5Syv5i2u5i2v5tjmauoAAAANdFJOUwCVei+z+A/Xxlwe7kK24q1yAAAA+ElEQVQ4y2NgGAWjYBQMVZCAKcTjetUZXYyr9+7dqxPgXLbFIH2z7wLBJagQs3js3RsTGFLugsEBiDJfEPu64l6IYANYkAXMvnoXCgrAgmfvogABsKAsitj1BCyCmxmwCELdORdZ7ArUmbbIgjC3c2ATZMamnSEWSfAqLPB6sdjOoIvpITTrG6CCjNgE2YB+2uINFVSAWc+sqMPAVQsWu4gaQ6tBYiEHUAWZe+9el8SIYi7jBOolIGZFAwwxLt+7QeqBaILsqD5BDvkoVEFOSHwvQBXdixI8UAAJig2o6RcSORNQBIGp7obqdS0Mi9zYMMJi+kZi/A0Ag+QDeMVSCacAAAAASUVORK5CYII="); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAzUExURUdwTCyt5yyv5Syv5iyv5jSs6iyv5iyv5iyv5iyv5S2u5iyv5iyv5iyv5iyu5iyv5i2v5vj2ygIAAAAQdFJOUwASM9dfBcj4syNI7pR2pYbvIS3uAAABp0lEQVRIx9VXx3KFMAzEVe74/782gF/DscpMckj2vCOr7Qq27QdwqfgM2TTrKJo2/YlccWaC/gGvEFrM/QaPRAx9QlknN9M6RFG43ndRuCPDRef8ggffKyl9hTlBFZa0rl/PxaiTbdBJXvKdxnjXdg5XPA0sryCNnZHPGvlwV4JJQOtWUsWYsIjX5Lwo4Z2NMbI6JA/DpaXG8upYlsZ3ZaAST5rysaVYjiFNK7+jZU4bD9g6TWiULDYyw7y0vCyR9/LhIPSffe1nnu/KUPFy+Lyj7Zgvq9smNtzA1TtFb8m7YUM+NiTUuP0LKCcgpQAdgmZY8dF1WDRIxficlc2TKF/rUgyMBrvZ99P6IJhaMravpPcadKUw2e1kOMVctYfq4ibipY23l0l0LnLWh2oNm4bo3QPo8ZpuvhfVS3X6boJ4xZ73yRXvcRxyCJlqzNmbvdTT3u/2UXApvT/sICTye/Lq0vHVqThNRq3V37KSWIsWsE5hQq0GCsnzAvueeEB57qeQDEG8XUFPBDTcPf1uMEDMfiyfr3C4muLqCG5TivuBMXl3vzHXLz5aYuJ3oWBVAAAAAElFTkSuQmCC"); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAnUExURUdwTCyv5iyu5iyv5iuw5IaEky+v5yyv5i2u5yyv5uZRDy2v5y2v5lCbFAcAAAAMdFJOUwCB9c4kFAjhTbEoZGK0yqEAAABjSURBVDjLY2AYBYMJBGATXEC0YMBoCI6CUTAKiAYsgg6YYnPOKIorogkynwEBAWyCKqiC3GDB46jmstWARQ1QldqABRVQxDjAYocaUAQ5z5w5LHRYFMOiaawJ6K5vVkwgwt8Ajosmd/c+ZGEAAAAASUVORK5CYII="); } }

@keyframes smoke_dark { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTP///////////////////////////////////////////////////4sGkswAAAANdFJOUwD1zngajeEpCbFSZEINJr2gAAAAWUlEQVQ4y2NgGAWjYBSMglEwIgG7aQGGGMvcu8JmomiCTHdBIACboAiqIDdY8BqaublgUQVUQV2woACKGA9Y7OICFEHOu3cvGV4ywbBoBksDuusXiTYQ4W8AsnQoU/URMfgAAAAASUVORK5CYII="); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAzUExURUdwTP///////////////////////////////////////////////////////////////8/RimEAAAAQdFJOUwArHu7XD8az+HQ/WQWSnIVzM1qlAAAA+ElEQVRIx+2URxLDIAxF6YjO/U8bl8QWGSNYZJEFf+Uxz0j+KowtLS0tLS0tPUrHCchbqGD5gBKmHoLwEIZz/X4Msn7k2ihJwf7WhC0nbSuSRzehA+WSxFg1N9d8/y11B6Wwmi6ukNfpi8sEJpGDieCwf66PWWwe73Oty2aS83NxGYMeB3oycNsvZaIa9B+bNsE8ycUTlNZKypg9dMnFb00qFMZyf5TEdSNYT80QP1xSOejRTArP9X+tEu4SH1NiH0xwTkEiOWRtoTjUViD6WAx4XilQ9jukl2CVxO7EExH63LmvjINtqxHpnQvBRqZH1Q9KlviLur4AfdUl6STlcxYAAAAASUVORK5CYII="); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA8UExURUdwTP///////////////////////////////////////////////////////////////////////////4/JsPUAAAATdFJOUwDvZCES0pSx+AXGdytURDaFot8HrYrVAAABtklEQVRIx81W2ZLDIAzjxuHK4f//122abdMQA57ZfaieNWAbWUKIP2AqzkqQds1TjzZbfEHGNjMDfiCYBk1LvCA0TvRYwdHF1TQEzToOcWEd96iQmFwgeHDvxCGFukDjSRqm93Vaz0WtgF1eCdjHca/CEeadlmDIc43B1tj2HsfHPRspDBoqThfHC7N460O9HJ5/yJfD2wdjeX1wCgTDG3Q8xLKOp3Igdq60Lp0CbdXoSyX5hTxL3faCVIPjrS0mynzuNElanrzxLOkrK/X4LMOgfequh0zzCvn449EsLV8220XqbQM3p3/Y3M2N7CXC5qMeBYz4ChhOHcUDgk8Dlg5NTQuj0+utlKyW8i0XZ5/SD2qqfb/QgWCVk6048iPXpSXV0uvSo1nT2Y2PrUuj9LurX3Ud90QaWd8LgcmbefcK0QyvKvMDq9/epK/u0e44jOyK5v2Gg/Re9gazz2Zxcbd3czEu116l82MHvvR2KD2ntK3ZjHZSz8mIr0KKbh6z9L6YEOMGrsuzDPuueNDz3M9F2jrESwoG3sV0nt4NBjrRcfhViIA2mlEffhLGDDIkW7n8S8j8AFDKdPPAxr/eAAAAAElFTkSuQmCC"); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTP///////////////////////////////////////////////////4sGkswAAAANdFJOUwD1zngajeEpCbFSZEINJr2gAAAAWUlEQVQ4y2NgGAWjYBSMglEwIgG7aQGGGMvcu8JmomiCTHdBIACboAiqIDdY8BqaublgUQVUQV2woACKGA9Y7OICFEHOu3cvGV4ywbBoBksDuusXiTYQ4W8AsnQoU/URMfgAAAAASUVORK5CYII="); } }

@keyframes smoke_alert { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAkUExURUdwTOZPDuZPDuZPDuROD+ZPDulTDORQD+ZPD+dQD+ZPDuZQD/f3LHsAAAALdFJOUwDzh9UkbxMGxU2xiARw7AAAAFtJREFUOMtjYBgFo2AUjIJRMDKBqwqmmNfu3aGGCmiC1ruBYBM2wY0OqILRIMHdJqiCjGDBHaiCzGDBjaiCs8GCkqiCq3fvbpU2TUC3aFdBGkMBqiCnoToR3gYA+Q0i2rzy+iEAAAAASUVORK5CYII="); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTOZPDuZPDuZPDuZODuZPDupOEuZQDu1PAOZPDuZPDuZPDuZQDuZQDy7hZCMAAAANdFJOUwDtScIbaA0yBH3alKm5LxlJAAABAElEQVQ4y2NgGAWjYBQMVZCGKcQ26+7SBnTBwLt375rAeRzuDkDSGSh295YDVFew7N2LWxiYZEGCdw0ggopgzk5bMHX3EliM6S4KuAoWZEYVvAIWzEUVDAAL+qKI3WbAotICIsiIIqgAEeRBFrsI9Q4TNkEGW2TRAqhgLLLgBKigLrLgAgYsbrrCgMX6S1BBdlksgqCwu3UYKigGj5vorQ5QN1wsQIkgbnBkTEONNY6Jd+9aFmBEcLkHtqTQQFYCYtOegSkYePdyzC00eyGBLIJN8Daaq9eihC5KyF9CVamLlIYYUCPODEWMHSgy+eIhNLevvXuJwwHd8T7CBUQEDwBMHQfufpUZMQAAAABJRU5ErkJggg=="); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA2UExURUdwTOZPD+dSCOZPDuZPDupQEOZPDudPDuZPDuZPDuZPDuZQDuVPDuZPDuZPDuZPDuZPDuZQDyN1kxEAAAARdFJOUwArBoLwD9YbwOf5rEttOpVaeEGdTAAAAblJREFUSMfVl9l2hSAMRWUOIEP+/2er12urkgBd7UObR9deYKZzdFl+Ei5Fq4MHJXqULAHPAJ6UgJcIleMK3oMBxQND7UguPjksFJYbDLWZOg5xbbGVwFC1SWiKi0+sktiFM07kVVnEHmeUx24chTEWBwFsJe4RHNUnItLGqQluTwQmOL9xfoLDb3B2kouTXJ3MQ05c/Gpc1sPjjoEegfbcYde52scqv8aPaYpXj5105NXQLprixmmkAtT6LHT7EsWpqfXeMmk5Wvra0kiSaxTDMvoIQ1V5K1q498Jxgptuopd5oU+fJ+riur5RbMDNNla5/IcwZgba5dWmUUb1rSfQFkg6cT50X020N9AkeK2IL+Kp+3AdFo1nL0JJj4nI3AiwxgpDFT8SGIo4uxuk+5qex1wL3dHoPDLn98CO3ZngOoXJ/Ap1tpO/+L7thm+cW+YyvquWCHPcko9a2wikd1wntZTqnrn7jnyUiy/0Nk6qfezD4KvzRYos/pbEyFrSxBulvcpQY7C5h63Dr9t2rErv7eyEbzTzvHbUbuin7R4B3/vDzYMC1HHtafFevrBuijr6gYka8m/09QPptGkwO7DbFAAAAABJRU5ErkJggg=="); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAkUExURUdwTOZPDuZPDuZPDuROD+ZPDulTDORQD+ZPD+dQD+ZPDuZQD/f3LHsAAAALdFJOUwDzh9UkbxMGxU2xiARw7AAAAFtJREFUOMtjYBgFo2AUjIJRMDKBqwqmmNfu3aGGCmiC1ruBYBM2wY0OqILRIMHdJqiCjGDBHaiCzGDBjaiCs8GCkqiCq3fvbpU2TUC3aFdBGkMBqiCnoToR3gYA+Q0i2rzy+iEAAAAASUVORK5CYII="); } }

@keyframes smoke_alert_dark { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABIUExURUdwTM8KCsgKCvoSEs4KCuEODs0KCvYREeQODvgREfAREfwTE+0QEM0KCssKCtgNDfkREcYJCekQENoNDeEPD9QMDO4REcwLCzCQsa8AAAASdFJOUwBNCZHQ6PT+HHrPLLt7sWTai54U8UkAAABlSURBVEjH7dE3EsAgDERRcjA44XT/mxoaqBCN3e2bUfcbSYwBAAAAAMBvgpdhXLloM+83K8luspUnu7tKjujW1Ggq1GcTiU4dje5n/GoM73fLU6jZ5CH3KNkimBODQ3NldvHBW1/wrwbbN+n4uQAAAABJRU5ErkJggg=="); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAB1UExURUdwTNQMDNcMDOwPD9kMDN0GBvcSEucPD+oQENULC8oKCuMODtgMDPUREdsNDfgSEtULC8oJCfgSEuYPD8oKCvUREdULC/oSEvsTE+4REeYPD+wQEPMREfgSEsoKCt4NDc4LC/oTE/YSEvEREe8REekQEOIPDyaBbM0AAAAadFJOUwBnfkEyBcIbDkz09ZN05uzXv1+uqJfJ297pqgl/pAAAASxJREFUSMftlNl2gyAQQAVZxH1PG6MBbfL/n1i1jYG0gz709Inrm16HmYHB8xwOh8PhcPxKEByRkjelTgnd0cpMrTD+4xPl5PGSM9V/eepkiEHJsn4ma/garH/CNE1k4zf92CRsNPA3zb+MFsrNMwO8/DRtCQbTxUKyheOThUYr9gNkYnqj32HR17tXdQBTZOyED3md6dHqBtARQ0wg74YNT5wButw8bBEkns1zVd0hjMZ4JII8YR5SP70u5FV71bmnrzMSoDhGSzJI91ICj0b8tLBt4iiOZidqMdmbSUoIp8dmnP7PVUJFjA8shVIpZYHqMLfWKORGyI95MrZll0s5PB5sy2/QEJZqdQ/B8QpNK+C9J6sQ4mIIa2G7i/NFE/ONutNnXoct+Yt9/QRBxUpo4Bku/QAAAABJRU5ErkJggg=="); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABXUExURUdwTNYMDOcODvYREdgMDOENDeMODt4ODt0NDeANDeENDdALC8wKCu4QEM0KCvMREd0NDfcREegPD/IREdkNDfYSEu4QEPsSEtELC9UMDOoPD8gKCuUPD0Na0FgAAAATdFJOUwDGJ7JoNZILTBl+4fXTsObr8vNrOgd8AAACF0lEQVRIx9WX15KrMAyGcS+YEnog7/+ca1MCBreZPRdnfzFOgA9ZxpIyybLfSEhUvcYKSRiiGB2/QsSPofGiF/ZxdLTF3Rjpb9xLODk03kWd7tZb/XocDpnTXd+P/Qau39wR8p3Yh22UDwy+dm/bx36CHt5W7Hqsw8kJSAiXxeriKXTsU2XOTDRO7S+GFX1Emz8Uw/rW7Ahpo1xvcoGaByJmJi7auCrNVQlcyxI5mDav4VAKp18Mb9shZmYdWTFEtW4caSLehmqrEA0GVRzVDgNTVwif5cHAMDtsqO6NQzTzUwN4Vi51cI2jwKGDQ676Lp6cdHFynj83czYgaO5Y2OxufUjfs/x9mJPjn5sKT38EN456OGJjtfA1XGxh/gae4eagGipCvwiQFtoToJxlf0EsJUwm867LcQzDdfcx5shpJuBxUYBO62OG3AIZLmtztaamcnh9UHoE12RZoU0Ug87Sma+8C+lcCwhh72+A7J3mTuiHjodXu+qSrmy/7TJw3ZP67ZWVrqWP6pRda153NmccTk6z582wB5vedpPhk0/AThXlBe28Kr2c3bWgSuMykm/hlMDG8nuNMEwpNsHgafnalAfaBz2dyWDFSaVdKSBJtCYhgf9ZK+EUJ2A4X5YF4FLlwTXy5Ssl0riFhhzmF1CG4rtwC0+beAksHFyw0r/3cI+sXFTJQ2/ZrENpQsT+wJQKkH+xrz9vR4m2jLy+1AAAAABJRU5ErkJggg=="); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABIUExURUdwTM8KCsgKCvoSEs4KCuEODs0KCvYREeQODvgREfAREfwTE+0QEM0KCssKCtgNDfkREcYJCekQENoNDeEPD9QMDO4REcwLCzCQsa8AAAASdFJOUwBNCZHQ6PT+HHrPLLt7sWTai54U8UkAAABlSURBVEjH7dE3EsAgDERRcjA44XT/mxoaqBCN3e2bUfcbSYwBAAAAAMBvgpdhXLloM+83K8luspUnu7tKjujW1Ggq1GcTiU4dje5n/GoM73fLU6jZ5CH3KNkimBODQ3NldvHBW1/wrwbbN+n4uQAAAABJRU5ErkJggg=="); } }

@keyframes blink { 0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; } }

@keyframes smoke { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAnUExURUdwTCyv5iyu5iyv5iuw5IaEky+v5yyv5i2u5yyv5uZRDy2v5y2v5lCbFAcAAAAMdFJOUwCB9c4kFAjhTbEoZGK0yqEAAABjSURBVDjLY2AYBYMJBGATXEC0YMBoCI6CUTAKiAYsgg6YYnPOKIorogkynwEBAWyCKqiC3GDB46jmstWARQ1QldqABRVQxDjAYocaUAQ5z5w5LHRYFMOiaawJ6K5vVkwgwt8Ajosmd/c+ZGEAAAAASUVORK5CYII="); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTCyv5iyv5iyv5iyv5iyv5i2t6Syv5iyv5iyv5iuv5Syv5i2u5i2v5tjmauoAAAANdFJOUwCVei+z+A/Xxlwe7kK24q1yAAAA+ElEQVQ4y2NgGAWjYBQMVZCAKcTjetUZXYyr9+7dqxPgXLbFIH2z7wLBJagQs3js3RsTGFLugsEBiDJfEPu64l6IYANYkAXMvnoXCgrAgmfvogABsKAsitj1BCyCmxmwCELdORdZ7ArUmbbIgjC3c2ATZMamnSEWSfAqLPB6sdjOoIvpITTrG6CCjNgE2YB+2uINFVSAWc+sqMPAVQsWu4gaQ6tBYiEHUAWZe+9el8SIYi7jBOolIGZFAwwxLt+7QeqBaILsqD5BDvkoVEFOSHwvQBXdixI8UAAJig2o6RcSORNQBIGp7obqdS0Mi9zYMMJi+kZi/A0Ag+QDeMVSCacAAAAASUVORK5CYII="); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAzUExURUdwTCyt5yyv5Syv5iyv5jSs6iyv5iyv5iyv5iyv5S2u5iyv5iyv5iyv5iyu5iyv5i2v5vj2ygIAAAAQdFJOUwASM9dfBcj4syNI7pR2pYbvIS3uAAABp0lEQVRIx9VXx3KFMAzEVe74/782gF/DscpMckj2vCOr7Qq27QdwqfgM2TTrKJo2/YlccWaC/gGvEFrM/QaPRAx9QlknN9M6RFG43ndRuCPDRef8ggffKyl9hTlBFZa0rl/PxaiTbdBJXvKdxnjXdg5XPA0sryCNnZHPGvlwV4JJQOtWUsWYsIjX5Lwo4Z2NMbI6JA/DpaXG8upYlsZ3ZaAST5rysaVYjiFNK7+jZU4bD9g6TWiULDYyw7y0vCyR9/LhIPSffe1nnu/KUPFy+Lyj7Zgvq9smNtzA1TtFb8m7YUM+NiTUuP0LKCcgpQAdgmZY8dF1WDRIxficlc2TKF/rUgyMBrvZ99P6IJhaMravpPcadKUw2e1kOMVctYfq4ibipY23l0l0LnLWh2oNm4bo3QPo8ZpuvhfVS3X6boJ4xZ73yRXvcRxyCJlqzNmbvdTT3u/2UXApvT/sICTye/Lq0vHVqThNRq3V37KSWIsWsE5hQq0GCsnzAvueeEB57qeQDEG8XUFPBDTcPf1uMEDMfiyfr3C4muLqCG5TivuBMXl3vzHXLz5aYuJ3oWBVAAAAAElFTkSuQmCC"); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAnUExURUdwTCyv5iyu5iyv5iuw5IaEky+v5yyv5i2u5yyv5uZRDy2v5y2v5lCbFAcAAAAMdFJOUwCB9c4kFAjhTbEoZGK0yqEAAABjSURBVDjLY2AYBYMJBGATXEC0YMBoCI6CUTAKiAYsgg6YYnPOKIorogkynwEBAWyCKqiC3GDB46jmstWARQ1QldqABRVQxDjAYocaUAQ5z5w5LHRYFMOiaawJ6K5vVkwgwt8Ajosmd/c+ZGEAAAAASUVORK5CYII="); } }

@keyframes smoke_dark { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTP///////////////////////////////////////////////////4sGkswAAAANdFJOUwD1zngajeEpCbFSZEINJr2gAAAAWUlEQVQ4y2NgGAWjYBSMglEwIgG7aQGGGMvcu8JmomiCTHdBIACboAiqIDdY8BqaublgUQVUQV2woACKGA9Y7OICFEHOu3cvGV4ywbBoBksDuusXiTYQ4W8AsnQoU/URMfgAAAAASUVORK5CYII="); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAzUExURUdwTP///////////////////////////////////////////////////////////////8/RimEAAAAQdFJOUwArHu7XD8az+HQ/WQWSnIVzM1qlAAAA+ElEQVRIx+2URxLDIAxF6YjO/U8bl8QWGSNYZJEFf+Uxz0j+KowtLS0tLS0tPUrHCchbqGD5gBKmHoLwEIZz/X4Msn7k2ihJwf7WhC0nbSuSRzehA+WSxFg1N9d8/y11B6Wwmi6ukNfpi8sEJpGDieCwf66PWWwe73Oty2aS83NxGYMeB3oycNsvZaIa9B+bNsE8ycUTlNZKypg9dMnFb00qFMZyf5TEdSNYT80QP1xSOejRTArP9X+tEu4SH1NiH0xwTkEiOWRtoTjUViD6WAx4XilQ9jukl2CVxO7EExH63LmvjINtqxHpnQvBRqZH1Q9KlviLur4AfdUl6STlcxYAAAAASUVORK5CYII="); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA8UExURUdwTP///////////////////////////////////////////////////////////////////////////4/JsPUAAAATdFJOUwDvZCES0pSx+AXGdytURDaFot8HrYrVAAABtklEQVRIx81W2ZLDIAzjxuHK4f//122abdMQA57ZfaieNWAbWUKIP2AqzkqQds1TjzZbfEHGNjMDfiCYBk1LvCA0TvRYwdHF1TQEzToOcWEd96iQmFwgeHDvxCGFukDjSRqm93Vaz0WtgF1eCdjHca/CEeadlmDIc43B1tj2HsfHPRspDBoqThfHC7N460O9HJ5/yJfD2wdjeX1wCgTDG3Q8xLKOp3Igdq60Lp0CbdXoSyX5hTxL3faCVIPjrS0mynzuNElanrzxLOkrK/X4LMOgfequh0zzCvn449EsLV8220XqbQM3p3/Y3M2N7CXC5qMeBYz4ChhOHcUDgk8Dlg5NTQuj0+utlKyW8i0XZ5/SD2qqfb/QgWCVk6048iPXpSXV0uvSo1nT2Y2PrUuj9LurX3Ud90QaWd8LgcmbefcK0QyvKvMDq9/epK/u0e44jOyK5v2Gg/Re9gazz2Zxcbd3czEu116l82MHvvR2KD2ntK3ZjHZSz8mIr0KKbh6z9L6YEOMGrsuzDPuueNDz3M9F2jrESwoG3sV0nt4NBjrRcfhViIA2mlEffhLGDDIkW7n8S8j8AFDKdPPAxr/eAAAAAElFTkSuQmCC"); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTP///////////////////////////////////////////////////4sGkswAAAANdFJOUwD1zngajeEpCbFSZEINJr2gAAAAWUlEQVQ4y2NgGAWjYBSMglEwIgG7aQGGGMvcu8JmomiCTHdBIACboAiqIDdY8BqaublgUQVUQV2woACKGA9Y7OICFEHOu3cvGV4ywbBoBksDuusXiTYQ4W8AsnQoU/URMfgAAAAASUVORK5CYII="); } }

@keyframes smoke_alert { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAkUExURUdwTOZPDuZPDuZPDuROD+ZPDulTDORQD+ZPD+dQD+ZPDuZQD/f3LHsAAAALdFJOUwDzh9UkbxMGxU2xiARw7AAAAFtJREFUOMtjYBgFo2AUjIJRMDKBqwqmmNfu3aGGCmiC1ruBYBM2wY0OqILRIMHdJqiCjGDBHaiCzGDBjaiCs8GCkqiCq3fvbpU2TUC3aFdBGkMBqiCnoToR3gYA+Q0i2rzy+iEAAAAASUVORK5CYII="); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTOZPDuZPDuZPDuZODuZPDupOEuZQDu1PAOZPDuZPDuZPDuZQDuZQDy7hZCMAAAANdFJOUwDtScIbaA0yBH3alKm5LxlJAAABAElEQVQ4y2NgGAWjYBQMVZCGKcQ26+7SBnTBwLt375rAeRzuDkDSGSh295YDVFew7N2LWxiYZEGCdw0ggopgzk5bMHX3EliM6S4KuAoWZEYVvAIWzEUVDAAL+qKI3WbAotICIsiIIqgAEeRBFrsI9Q4TNkEGW2TRAqhgLLLgBKigLrLgAgYsbrrCgMX6S1BBdlksgqCwu3UYKigGj5vorQ5QN1wsQIkgbnBkTEONNY6Jd+9aFmBEcLkHtqTQQFYCYtOegSkYePdyzC00eyGBLIJN8Daaq9eihC5KyF9CVamLlIYYUCPODEWMHSgy+eIhNLevvXuJwwHd8T7CBUQEDwBMHQfufpUZMQAAAABJRU5ErkJggg=="); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA2UExURUdwTOZPD+dSCOZPDuZPDupQEOZPDudPDuZPDuZPDuZPDuZQDuVPDuZPDuZPDuZPDuZPDuZQDyN1kxEAAAARdFJOUwArBoLwD9YbwOf5rEttOpVaeEGdTAAAAblJREFUSMfVl9l2hSAMRWUOIEP+/2er12urkgBd7UObR9deYKZzdFl+Ei5Fq4MHJXqULAHPAJ6UgJcIleMK3oMBxQND7UguPjksFJYbDLWZOg5xbbGVwFC1SWiKi0+sktiFM07kVVnEHmeUx24chTEWBwFsJe4RHNUnItLGqQluTwQmOL9xfoLDb3B2kouTXJ3MQ05c/Gpc1sPjjoEegfbcYde52scqv8aPaYpXj5105NXQLprixmmkAtT6LHT7EsWpqfXeMmk5Wvra0kiSaxTDMvoIQ1V5K1q498Jxgptuopd5oU+fJ+riur5RbMDNNla5/IcwZgba5dWmUUb1rSfQFkg6cT50X020N9AkeK2IL+Kp+3AdFo1nL0JJj4nI3AiwxgpDFT8SGIo4uxuk+5qex1wL3dHoPDLn98CO3ZngOoXJ/Ap1tpO/+L7thm+cW+YyvquWCHPcko9a2wikd1wntZTqnrn7jnyUiy/0Nk6qfezD4KvzRYos/pbEyFrSxBulvcpQY7C5h63Dr9t2rErv7eyEbzTzvHbUbuin7R4B3/vDzYMC1HHtafFevrBuijr6gYka8m/09QPptGkwO7DbFAAAAABJRU5ErkJggg=="); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAkUExURUdwTOZPDuZPDuZPDuROD+ZPDulTDORQD+ZPD+dQD+ZPDuZQD/f3LHsAAAALdFJOUwDzh9UkbxMGxU2xiARw7AAAAFtJREFUOMtjYBgFo2AUjIJRMDKBqwqmmNfu3aGGCmiC1ruBYBM2wY0OqILRIMHdJqiCjGDBHaiCzGDBjaiCs8GCkqiCq3fvbpU2TUC3aFdBGkMBqiCnoToR3gYA+Q0i2rzy+iEAAAAASUVORK5CYII="); } }

@keyframes smoke_alert_dark { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABIUExURUdwTM8KCsgKCvoSEs4KCuEODs0KCvYREeQODvgREfAREfwTE+0QEM0KCssKCtgNDfkREcYJCekQENoNDeEPD9QMDO4REcwLCzCQsa8AAAASdFJOUwBNCZHQ6PT+HHrPLLt7sWTai54U8UkAAABlSURBVEjH7dE3EsAgDERRcjA44XT/mxoaqBCN3e2bUfcbSYwBAAAAAMBvgpdhXLloM+83K8luspUnu7tKjujW1Ggq1GcTiU4dje5n/GoM73fLU6jZ5CH3KNkimBODQ3NldvHBW1/wrwbbN+n4uQAAAABJRU5ErkJggg=="); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAB1UExURUdwTNQMDNcMDOwPD9kMDN0GBvcSEucPD+oQENULC8oKCuMODtgMDPUREdsNDfgSEtULC8oJCfgSEuYPD8oKCvUREdULC/oSEvsTE+4REeYPD+wQEPMREfgSEsoKCt4NDc4LC/oTE/YSEvEREe8REekQEOIPDyaBbM0AAAAadFJOUwBnfkEyBcIbDkz09ZN05uzXv1+uqJfJ297pqgl/pAAAASxJREFUSMftlNl2gyAQQAVZxH1PG6MBbfL/n1i1jYG0gz709Inrm16HmYHB8xwOh8PhcPxKEByRkjelTgnd0cpMrTD+4xPl5PGSM9V/eepkiEHJsn4ma/garH/CNE1k4zf92CRsNPA3zb+MFsrNMwO8/DRtCQbTxUKyheOThUYr9gNkYnqj32HR17tXdQBTZOyED3md6dHqBtARQ0wg74YNT5wButw8bBEkns1zVd0hjMZ4JII8YR5SP70u5FV71bmnrzMSoDhGSzJI91ICj0b8tLBt4iiOZidqMdmbSUoIp8dmnP7PVUJFjA8shVIpZYHqMLfWKORGyI95MrZll0s5PB5sy2/QEJZqdQ/B8QpNK+C9J6sQ4mIIa2G7i/NFE/ONutNnXoct+Yt9/QRBxUpo4Bku/QAAAABJRU5ErkJggg=="); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABXUExURUdwTNYMDOcODvYREdgMDOENDeMODt4ODt0NDeANDeENDdALC8wKCu4QEM0KCvMREd0NDfcREegPD/IREdkNDfYSEu4QEPsSEtELC9UMDOoPD8gKCuUPD0Na0FgAAAATdFJOUwDGJ7JoNZILTBl+4fXTsObr8vNrOgd8AAACF0lEQVRIx9WX15KrMAyGcS+YEnog7/+ca1MCBreZPRdnfzFOgA9ZxpIyybLfSEhUvcYKSRiiGB2/QsSPofGiF/ZxdLTF3Rjpb9xLODk03kWd7tZb/XocDpnTXd+P/Qau39wR8p3Yh22UDwy+dm/bx36CHt5W7Hqsw8kJSAiXxeriKXTsU2XOTDRO7S+GFX1Emz8Uw/rW7Ahpo1xvcoGaByJmJi7auCrNVQlcyxI5mDav4VAKp18Mb9shZmYdWTFEtW4caSLehmqrEA0GVRzVDgNTVwif5cHAMDtsqO6NQzTzUwN4Vi51cI2jwKGDQ676Lp6cdHFynj83czYgaO5Y2OxufUjfs/x9mJPjn5sKT38EN456OGJjtfA1XGxh/gae4eagGipCvwiQFtoToJxlf0EsJUwm867LcQzDdfcx5shpJuBxUYBO62OG3AIZLmtztaamcnh9UHoE12RZoU0Ug87Sma+8C+lcCwhh72+A7J3mTuiHjodXu+qSrmy/7TJw3ZP67ZWVrqWP6pRda153NmccTk6z582wB5vedpPhk0/AThXlBe28Kr2c3bWgSuMykm/hlMDG8nuNMEwpNsHgafnalAfaBz2dyWDFSaVdKSBJtCYhgf9ZK+EUJ2A4X5YF4FLlwTXy5Ssl0riFhhzmF1CG4rtwC0+beAksHFyw0r/3cI+sXFTJQ2/ZrENpQsT+wJQKkH+xrz9vR4m2jLy+1AAAAABJRU5ErkJggg=="); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABIUExURUdwTM8KCsgKCvoSEs4KCuEODs0KCvYREeQODvgREfAREfwTE+0QEM0KCssKCtgNDfkREcYJCekQENoNDeEPD9QMDO4REcwLCzCQsa8AAAASdFJOUwBNCZHQ6PT+HHrPLLt7sWTai54U8UkAAABlSURBVEjH7dE3EsAgDERRcjA44XT/mxoaqBCN3e2bUfcbSYwBAAAAAMBvgpdhXLloM+83K8luspUnu7tKjujW1Ggq1GcTiU4dje5n/GoM73fLU6jZ5CH3KNkimBODQ3NldvHBW1/wrwbbN+n4uQAAAABJRU5ErkJggg=="); } }

@keyframes blink { 0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; } }

.car { width: 332px; height: 197px; position: absolute; top: 0; left: -100px; right: -100px; margin: 0 auto -60px auto; transform: scale(0.6); transform-origin: top center; }

.car * { position: absolute; }

.car-cnt { top: 67px; left: 24px; cursor: pointer; }

.car-door { display: none; top: 28px; left: 15px; width: 63px; height: 91px; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAABbBAMAAAA2FECgAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAwUExURUdwTC+t5C6s4i6x4y+u5C+u5S+u5C+u5C+t5C+u5C+u5C+u5C+u5C+t5Dyp0zCu5O2Y2AAAAAAPdFJOUwDKIRGYL7NmQ/RXfejYBpsVG7wAAAJFSURBVEjHrZY9S1tRGMeP1Rg1NhgR1wRtt0JDM4mD+QaKEHAomHaQbgkUmtF2ECwUWgoFweG6iVkUHB0UnEX9ANY76uZrY2Laf++9uUnOc8/L06H/6Sbnd+953s8R4p80tOepUqlWV1cK8xkNMAVJzV0VWAYhNhTgnAC4nousDwA7ydyricLCanXzgwOsuxToA1qWBf9Pe8QoBS7xS/75DKh3zfBf2kaNvPAFuCOblHBLgN4S3STpoEj3THi+Sp5ceE5E/NoC1ogTiuOeJ107h9FUQvcakuGLuFOA2LH0ieWIl4FeSFaUcKMCMQfv2s/HONCUwOe3HRbRMLQc6cQyroZByeVHK/AUyFqBGU2ciL7SalC1j0c7MKsLJC3pB+t6ErpIy0EH/tj7EjjM+ZoI9bww33qYzLlh/Vl0IkS/bb3uJaHHBvgRGrQBxSAVZv3OBiVr1o9WrlBze30vPylAOZwu+bAlnch60A3ufggG5U31M8x2+wvRSVTPhNlGo1O9RI12OQBHZ6ep8aV0BMjrN+7OOpcBvoeWpU1AmQGuBQPcc0CeAeoZBuhOJQNwI41ZYy1ZgTIHZKXetYbJBDzK40GnhunEUwLtHzc63cojSqdvQpr1Oh3IU9DQ9m3pm3eEDFo70M8BfRyQ4IAhDohxQJKLQ7TpVaDEhFpfEFeCybd8oXhpbwtDtuQzpoepSX0yaoKJtXwQPrE3d3A9YIBZZgtt65CzdtHeWf41yVoP+rIlV444Y6MmEM0yPZ3fpKjG3ov/qL/LzLcyRWLc5wAAAABJRU5ErkJggg==") no-repeat center; }

.__dark .car-door { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAABbCAMAAADz5K2hAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAzUExURUdwTP///////////////////////////////////////////////////////////////8/RimEAAAAQdFJOUwBqwEIvgvAhzRGc4a9TB12anjaMAAACC0lEQVRYw7VY2YKDIAyU+xCU///aRexa63KEpDt91LFkMgmBZfkedpXBjl/GHmMUQsgMY0D0TacWtNrGfJY6WPch36YuuOzTxfGSymE454wxOe4cfhaBsfAKrB+EP16pK+XU+QVrBuqF1lPjTx1jkx+P5x2RxFq+4FsxhOOp68TnQi+Gsnze94c6Mymby2eDDEfdFKHoI0cWEWceKjId6qxjj8rGB2TRFlAkcq1+gA2yd3PCuQJRyR6sTEsI4cHXsPBfhcJNLfwA7TNyq5a+wncuX5FkBuvI/H24NCFfq/UEPP8r8jE839Lk3xLcvVU/Ff6G5u+lq7g3zBPnLnhHfuv6Q5XQsFfx4iAAG18H7Cp+FMLb/Ris7pa+eWh5q54cS87HlT1hocG/0v9s3m4oiv+cW57lw0eZf9jHz00z2nxWb0oRPkx9vu1/05FhM3iGhQaPs6/dSHxtZpRuZx7J5wuNL6cy3dUew3cLaf1/ppxJvqHxeX1yBWMn8l1998Qvf277UER+nDx3Dbz77p9o+X77N6zym9s/cMtpTW8E/jK731enT7R9pgqIN8c/Al8R+ZHIl0T9NyJ/IoFr++yN9v9UAtoDMLp+85mU0P0nJ9D6KYNT+t+UgIwoYP2UZoh8uAP9QnOgQtzdjfWDl3DrikdT6hcugEBdXo7UAzpA9y6Igu2De4Y/If8ffgBNZLjxPiAxkAAAAABJRU5ErkJggg==") no-repeat center; }

.__alarm_door .car-door { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAABbBAMAAAA2FECgAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAwUExURUdwTOZPDudRDuZPDuRODuZPDuZPDuZPDuZPDuZPDuZPDuZPDuZPDtNcKeZPDuZQDzk2zrIAAAAPdFJOUwDKIV0RMLXyRZ6GctgI5/iyXusAAAJESURBVEjHrZY7TxtBFIWXgENsY4QpkKhsWUmRhlhykTQIC7miAVmyREUIBa0jRCSUxkkRiSqhpCM1EoKKxgX8gES4S+sfgMTDEGMn4WRZe9dzZ+7MTZFT7ePTzp1zHzue908a3t+v1+uFwqvtT5VylgF+QFH7wAROVAD3eQM4IwCulrT3T4CjVGk+V1neLhSOa8D7BgXigBLZgk9M6jH+VG+f+4HSMObQIvefgQ5ZZA83BBip0kVSNazSNRP+XpfoJrR9vQS2yCb0jcf8nQziHMe9Yd0KlMBfo2MAsQvlEyfaLgPNAHfhdRXXJuBHsRte19BkSuDLWsRCt6H3OPIyadpg5PKDExgDik5gkfGJhkurgavYrhvY44ykJX3nfJ8C57TqGPDH3ZfAZulBub6eVcq9i6elB7cbCbh0GjhtV9tPwpAL+OWvMeoCVoNU2PW7GJSsXe96uUKrMeI3f+6jAeR7nYudfkvWtPedcPwcReVN9T14ehh9QZ9E7WwIbEWmE7XCcgDOv6XTU+sZDfjKLzyYdQ0B2OhHlrEBeQG48gTg1jKGI+0IX2hnBWAwlSzAoBWq9lpyAnkJKCq967QpSDejrgS0bH88w+igaBndqCOK01tPmfWcmuoUtLR9KL55J8igdQOPJSAuAUkJGJaAmASkJB/4uleBqpALviAuPSHf6oHihbstLNlS/zFDEpCwTXGn1yrwSOgLz7twdr+l+br2w6LRWXzh36rAuLse+KokR46kECNjhH6qfZOmmp71/qP+AgZ8sVI85IRdAAAAAElFTkSuQmCC") no-repeat center; }

.__dark .__alarm_door .car-door { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAABbCAMAAADz5K2hAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABFUExURUdwTO8QEOcPD+0QEMgKCukPD+QODu0PD/QREe4PD+IODvUREewQEM4KCvYREc4LC+oQEOMODsgKCtkNDdMMDN4ODvsSEguvwF8AAAAPdFJOUwBEs3jLXpYm/xHK7eDjz+6I+DcAAAJ1SURBVFjDtZiJYoMgDIYFyiVaT3z/R13Qrq0SMcL202NDvoQEEGlV/Z2kEkqskqsYSDMNIuHWLWdyyl7zYknIyUv+uST1vIiChUYixGEthAyRg0IaBDebBZHkVWiC+7DCXXZhzR4/u6rVVRZkuJ5IEtu6oM6uc7hoUqNkeTIGt5jz7r8G2ECbxbFk9pMTFHCDG1AGdDlPmYNWi0HS1EB9cz1HtQsxxAY0VBpVkQxgPRChVlZUA8YccsBJ4X8M8AMf6hzxNsEM11H4wSb1PsOQmQES+XcuhaTkjprA22zcBrzJd89MfyN92MICA6okfeBf5vNP4PuC9PeA9zob131Qwb4X/Dv7kY7F9v+GVp/099l6ros3n1+TXmfj25Jzufg2ZW0u3tjX8A1Z+PCaMSz83fdy27q30WM1VKVLL9/DH/yr43Z85f4NiCHouHz4kFZtv3jowXH51sneD+6zXNRmcL/+ZGiU0Fd3X/zQgOogznl90XuFReq9H2iq72Qqltf7TPmbRR4yvVb+frzfX1X77/owUn61+vvxfn9V7b69jvijBp9QNFP8PdkyPtpnbvLRfZ57P9FLvE3y6Y4kxnvya4qfEtQd93VVxM/ILi/Kwgd+phdkl5Z3/CMPWWyiu5+x7X8ma2qxp7eZHj/GV3T/c43xLZ1/oEe3Ql4V8mLuiAXnZUcVzuuO3AGUt4X+q5bkPLxa/OxN7gDOCzLfVWUD0Fl8AEZi6fCn/JHqfsRPGQ9yB3BedVQD+ClJjlThh1w9Et2PJ6e8lur/hFeFPDkBJ6dMTeXPTonEBDxOf/6i8aeHXFkw+tQEtKkjOn9cSMn8Hzj+Tz+kAMpOZYnmUQAAAABJRU5ErkJggg==") no-repeat center; }

.__door .car-door { display: block; }

.car-body { top: 19px; left: 63px; background: url("data:image/png;base64,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") no-repeat center; width: 158px; height: 113px; background: url("data:image/png;base64,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") no-repeat center; }

.__dark .car-body { background: url("data:image/png;base64,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") no-repeat center; }

.car-hood { left: 90px; top: 53px; width: 103px; height: 23px; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAXBAMAAADkTUwLAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTC+u4y+t4y+u5C+u5C+u5DCu5S+u5C+u5C+u5C+y5C+t5C+u5DCu5HLKP8YAAAANdFJOUwC7d0xmHzPZia4O758/efxUAAAAvUlEQVQ4y2NgoBQsDU1LNjY2cXFRAgINEKHi4uJsbJyWGroKRSFXWLKJU8dJQfHy3XfxgdvbywUlTzS5GKdFMTCw3CUV3ATatJdUTdeA7uslVZMAUFMsqZoMgJp4SNRzHRR8bCRqugQO9FrSNF0Fa9IlTdMEsKa1pIcDqSFxHZKQmEnSdAOa/GpJDwcSQ0IAqimW9HBgYOAkQc9tWJZiJiMcSAqJq3BNtsRraoBrYiIl18JBxkRBosAcSNgBAEDHItbFUQZuAAAAAElFTkSuQmCC") no-repeat center; }

.__dark .car-hood { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAXCAMAAAAhvaEKAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAzUExURUdwTP///////////////////////////////////////////////////////////////8/RimEAAAAQdFJOUwAiid80RVS7d2euFPIIzp8eZvc+AAAAv0lEQVRIx8WW3Q6DIAxGbUv5F3z/p13R6YzZbpZ97rsiSnpATirT9N/MpRA551TVe59G4h4+Rutze2+zbC4RlflzRatntVJk7jmE1kRqXb5PrSKthZA7sy3E2wqoGCct+OSxn4rnuPHhGI4J6wERnOM3EzoYI0/jHJgTd7UbllN2ToRLvaVA1dZXT8g3WDCiQA6fm5zgOHTmRHAvOExA9wK0CXL5IekdFgBNoCtH79kORrn87rrg2K4HP0zuJ9ceMdh2gQG/GwcAAAAASUVORK5CYII=") no-repeat center; }

.__alarm_hood .car-hood { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAXBAMAAADkTUwLAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTORSJeVSJOVRJOVRJOVRJOVRJOVRJOVRJORRIuVRJOVRJOVTJOVSJQdzHc0AAAANdFJOUwBE76Xcccu6MBBThx1KFafXAAAAvElEQVQ4y2NgIBtwnmiUWhoavdnYvDwtxcVJSUlJ9y4QXAIyVFzS0suNjXdvDV0l2HESqp7LuCxF6S7RQCWt2JSBgeMuqeAq0KpaUjVpAjWtJVXTBqAmFlI1HQBqYiVRz2VwcOuSpukiONBtSdPkANYkS3o4kBwSB8CaSAuJ69CER5KmW9DkR1JIKEA1yZIeDiSGxAGoJlbSw4GBgYeMcCApJBzgmqYQredSA1wTD9FWZSAXLI2CRIFOiHIApactav/9zA0AAAAASUVORK5CYII=") no-repeat center; }

.__dark .__alarm_hood .car-hood { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAXCAMAAAAhvaEKAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABOUExURUdwTPwSEuQODvoSEvcSEuMPD+4QEMoLC/sSEvMREfIREd4NDckKCvMREe4QEPwTE9gNDdIMDM0LC8gKCvkSEukQEOYPD+MPD98ODtwODmD76qwAAAANdFJOUwDLMNy0GJ5E7ndT39MmXfVVAAAA8ElEQVRIx72WYROCIAyGEXAIiFqi1f//o4EKgdGHOtZzB3cM2Mvp2CDk/7QtpUIoJT0AwD1N0zDGusAYsMHiZt2aba3bA36vUkJQ2raZdwXeGUtcFLA/zGyHYf4IIJ0OtUWcA/sNY+wKZq9D+HnO7J1Jh3EUjaYgZkJn0q222z+cwUbuf4ghywxHQMgBFx7ieanmcjlaZhIhtGGpwPrBPuh4hcSKiXzdVX1DJEkL8o4HTzPbA41JpUkOJix0lkwFmo7Ma4K+IJEXByJxVGZ+rnFXHNS5mAKKTP9etPsZAVp4HUB1lZ6WHyLuFVIRmobaEx0chly16JgFAAAAAElFTkSuQmCC") no-repeat center; }

.__hood .car-hood { animation: blink 1.2s linear infinite; }

.car-trunk { display: none; width: 128px; height: 32px; left: 78px; top: 0; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAgBAMAAAAoDG0WAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAwUExURUdwTDGv5S6t4y+w4i+u5C+u5C+u5C+u5C+u5C+u5C+u5C+t5C+u5C+u5Cyw5zCu5DtG2QQAAAAPdFJOUwAyIRSD3luYb8iu7/hFCrgSO68AAAG8SURBVEjHY2CgDeAzkk3r6HBxL69aXu7i0tGRe1GZeM1qVTOj/2OCP1tnLrlAjH6r/9jBHyD8mkBYP3P8fzzgC37NihnuK2P+4wVbZ5XkymHVrJtCSC8YnD8PMmV5mzCa5sr4/ySCnct74S5h3v+fLIAIEH/yDNgM1c7EYE2eAQ5MD8AGcCpwkKX/9wN2SMLSL+AjKxB+MNgsgITAYfICYTOD/z6wAfFfGHTICgLm/d9A+hn//zbgIscABZb/v0AGsPz/38BLhv6fDK///zEAGsD6//8+hnjSDfjG0A+0GmjAfVB4khGK5/iAtk4AGlD///9XBnnSDVjABiQ+Aw0ApYEEVrj4yZJcIWVjYyMlEBAEAzATJCaY4YXwawInOC0wgMNvATtUdFcSofLmynyoUgN5cEgygLUeZoMkzkIiijzmTGgk1IPjkgHs+G/MYLE+4kpdcVCh8h0ScwkQA36BeMSUmBCgBbKTCRISDOCc+BXknmLiS/5UYPiDff0VmJIUQQHNkP//GAn1DvP8/wHMIH2I8lX+zwVSaq5X/xegifB8I63qm++AJsLpQFrlqY3uYI4HpBnAYUCtehwAGIEO1u/v3KwAAAAASUVORK5CYII=") no-repeat center; }

.__dark .car-trunk { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAgCAMAAADt/IAXAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA5UExURUdwTP///////////////////////////////////////////////////////////////////////308lk0AAAASdFJOUwCLm3wZ9GEzIw/lsMYE11FvQieMTrwAAAG4SURBVFjD1VfZjsMgEAsw3Hf+/2N3IKShbap2q8Bq/VCRNJKN54BZln8FDUrmKERijBFCKKXW4g8u8UUSMWaptL+eFwS1Lhi+fgZugnOW5auUAF2/g4nX8If1a7DvaT3ImAg6/7Hx5yYEZwkTWemPiVUWhDqzXg0eLE1RvhYCWbARxCdCyJkQ4OtUkCcHyFR+DvfsCnvMVAuwPKBvEw4FsYn8BlOAdl1ClZDMtKAYwOkhgNWYzMsCrgsbPyoh1KyEmSVQ/BY7v2yi7CwBass4e1eBGJY8id+hAaZtuqK2P+NrKGYArU/7oqBtPM2qRNy4N7sVBe24RwvkFAEYetGWtR/6/QCKLRgPeh3F41QqpQtAHZAdjrewf1eOc2vOI7DHOhUBsVP2cPcxVqjf3qv27/220Jm5BwFwOO26CNR/Yr91Kv1VV8peQ+hbnlr61BddLwpJX3mtlZR3Xcj04egE2NuDEZffrJW9pZq6y4dWks2cLR5UD5gpfDQt0OJgrERwy+WtPrgYNNZASQXTEz4nGeYnj+MGK9sdAC984us4flTg3o4KjgwdLuGtv0wPFbAk+OP5+intfgByIJTUE+qiUQAAAABJRU5ErkJggg==") no-repeat center; }

.__alarm_trunk .car-trunk { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAgCAMAAADt/IAXAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAzUExURUdwTOdRD+dQD+ZPDuZPDuZQDuZPDuZPDuZQDuZPDuZPDuZPDuZPD+ZPDuZPDuZPD+ZQD+P1R6sAAAAQdFJOUwAgEFL2P+GrmMIudLnQh2EC7FmOAAABjUlEQVRYw81XCY7DIAwM4IMb/v/aTbqQkmarVCmgHalSmqKOscfXstyElFLskHIZDImokoua2ZtAAPkMAKJgPOsYXVJoO7JbTa9k+RpgUid+l+8iiK89bzHpfB/k1ljc0IfA5DQbgtwFQIajUx9YshJHbSiPAgTW7wwR2ve68EeGnAVq8lTgyQCcyu9fM239+MkOUG2Ogprrgs0BwT35VQ5zVYCVs4BzVturWTC/193bhYTfdzTLgBLwWA1IxStuEj8VyVM1wBddyEmVaL25bYtB4bUPLczAzqQP7ZZnyTBUB9QY1PQT72KwdTPWDfgJ3zzrwxkf4G0EdFuQRfPDqRoSOxRfjBMqGjgXgf2i+jDw0EsegE+ix0SF8ZDfUNKuPLcFENtyTK7jpIv89AO3jsZD+VljUM+R6jxWC13/2rVSS4cuaOoXcAMme2tqEuJxLFhnoQIuIgh2zHLhStjVTniei7ZK4IetOQpy2wP/TJyR/A8L9MURoqFrnstX6xLj2CXTX+nLjuVfxPLf8AOWC4HGpjYragAAAABJRU5ErkJggg==") no-repeat center; }

.__dark .__alarm_trunk .car-trunk { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAgCAMAAADt/IAXAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABLUExURUdwTOIODuoPD9YMDOcPD90ODuINDdcMDNELC+EODvAQEPMREfUREfgSEtILC+oQEPMREfgSEt4ODuIPD9oNDdALC+8REeUPD9UMDKcBn0UAAAAPdFJOUwB0i+NbFSuhuEDB0qfmySLWga8AAAHNSURBVFjD1VeLkoMgDJSnBNSino///9ILiNhWZ7xWYea2tQ0q2SQbHSiK/wEBwDmhtKq0MXVdtwfA00brqqKUcA7yRnZJDwnPoPlN/KT9FuZyGYQETtvvYQhqIb6oOaDela6ttc6N9Z/PYNt2nWttrSvsCxB/IV54Fx+O315H6w/3OxoXyHFJBLb3uEwY/TFG+yrGJz9LQrWp9g2qkTMjYBcA5KQf9fuT5krwyAgsAH9+RieUBPLRjwo5Ddn4+cPkLQG4fM0WQDVNriZTJvSuA/Q0RQ1E3/tzrM8EJzj+0ahA33c9loDkoZ8Ycio02BqA6hDYF6LLApe57Hq0wssg8MoQSXpEpqAB+fEoUYufHMDKy2g5NMtoFoWYD2fMrFHlK9TR9+2Whh17w7zLYHsNxByAF9T8BlYSEBeWE5zuXM7IyoJZegXCYGCbvUBxcceKCih7yQmlXu3BKzCsgAKiPTAi7ltVQhn9zvi4qdUenAYsXkMNIj2/e1kdQyCF2NJ0NCqOtthIgpW9DKWWz3UGH5tagU3gzjYyzebCO0fZeSTc19kFp0Sq7Q132Z1I5YVIBsyvPLmFMZEwAFThrLsVpN1kqrP+kmn5k/v/HL8BbpW3jbb4XwAAAABJRU5ErkJggg==") no-repeat center; }

.__trunk .car-trunk { display: block; }

.car-frontlight-left, .car-frontlight-right { width: 27px; height: 15px; left: 73px; top: 79px; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAPCAMAAAAiTUTqAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAzUExURUdwTC+u5C+u5C+t4y2u5TOv5y+u5C+u5C+u5C+u5C+u5C+t5DCu4y+u5C+u4y+t4zCu5EbHUKsAAAAQdFJOUwBxs10VCoTm1PSQqjpNwJyLOo1AAAAAaklEQVQY04WR2RKAIAhFxQXEpfj/r62waSx1Oq+HZbgY0wjBLIAoQhnKaIKVG87Ov12WDra1U04+ED7NUQYYmioyI6nDqRO3GKlLr500dzqVFy7+OEh5izRWYBecL9UB7vYs1PtX2Xv9ygEmfA7VN/I3oQAAAABJRU5ErkJggg==") no-repeat center; }

.__dark .car-frontlight-left, .__dark .car-frontlight-right { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAPCAMAAAAiTUTqAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABFUExURUdwTP///////////////////////////////////////////////////////////////////////////////////////1fUNLcAAAAWdFJOUwCxg3OP5BL01gqpUOtmN1y7yj8hnMR9iDvxAAAAbElEQVQY04XR1w6AIAxAUaaU7ez/f6qxGIMC8b4eRiiMlaxlgyIgaidTK5bjneFxepvDKsN9RRk/afFsBmwystCKvRSZ6hrSrUvfwnWn7hudagYGPyaVm0G3K0Q1uC35LMXODwj0/tHsJ/qVExSAFAeiR2XjAAAAAElFTkSuQmCC") no-repeat center; }

.__alarm .car-frontlight-left, .__alarm .car-frontlight-right { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAPCAMAAAAiTUTqAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA5UExURUdwTOZQDuZPD+ZPD/9eAOZPDuZPDuVREeZPDuZPDuZPDuZPDudQDuZPDuZPDuZQDuZPD+dND+ZQDwucMJ0AAAASdFJOUwCTc9gDhLMO9OaqzzpaZk3AIbg0Y9oAAABwSURBVBjTfZFZDoAgDAXZoSyCvf9hFdCE0Op8Mn2QPoSYeC94zKERIapsiPIOH0I8tnzEheDqki64AfYNG42EoKbLyCGHs6zD0l3iHfQ3gXfj1vDh9I9Lt1MytgR0wi7FnbkWZaVrGsb+tNtxYuavXLj5ENHPVj1DAAAAAElFTkSuQmCC") no-repeat center; animation: blink 1.2s linear infinite; }

.__dark .__alarm .car-frontlight-left, .__dark .__alarm .car-frontlight-right { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAPCAMAAAAiTUTqAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABmUExURUdwTOQODskKCvcREcwKCskJCdoMDOMTE9sLC9AKCvUREd8ODvUREfIREfQREeENDcoKCskJCfcREfoTE+YQEMgKCscKCucPD88LC+EPD9wODtgNDdMMDOoQEPAREcsLC/MSEvgSEkzMGOkAAAAXdFJOUwBT/qvrfo8KFdPn47RseDfAoWTWP16wfFc4cwAAAHtJREFUGNN10dkSwiAMQFG2sHaxWktdWuX/f9IJdRyK6Xm9QGYCYxtj2IH2kpKXXf9fTJO+vDzbfZPvwtrwIvG14rvf5bBU4hLbLY2RonPTN1Ke6u6kgDPDg4avqifNYZtp2EAPJ6fEqwbF4mzPrwDDhAeFUHC0e5t/5QMHLBh0H8bKCQAAAABJRU5ErkJggg==") no-repeat center; }

.car-frontlight-right { transform: scaleX(-1); left: 183px; }

.car-smoke { display: none; left: 222px; top: 22px; width: 39px; height: 85px; background-repeat: no-repeat; background-position: center; animation: smoke 1.5s linear infinite; }

.__dark .car-smoke { animation: smoke_dark 1.5s linear infinite; }

.__alert .car-smoke { animation: smoke_alert 1.5s linear infinite; }

.__dark.__alert .car-smoke { animation: smoke_alert_dark 1.5s linear infinite; }

.__smoke .car-smoke { display: block; }

.car-key { display: none; top: 30px; left: 117px; width: 54px; height: 22px; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAWBAMAAAB5x3LYAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAtUExURUdwTC2t6C2w5Syu5y2v6Cyv5iyu5iyv5i2y5Syv5iyv5iyu5iyv5iyv5i2v5jfwUQ4AAAAOdFJOUwAiQ04sxjiqD9z0ipdee2DFcQAAAH9JREFUKM9jYMAD2KreAcGrI9jk7N5BQCEWuXlQuXc7MOXevbwLkX6pgCn3DGbsa0y5J3ArDwoiAwEUOVTwUgC33LsNeOQOkC6XUXcjDpecQ51BHC77QHKvEpDlgpRgoMGpIUkDOVyeNmCEy1PbeTD/4IyHMNzxF4w73ssYqAcA0lz/zbvvtpMAAAAASUVORK5CYII=") no-repeat center; }

.__dark .car-key { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAWBAMAAAB5x3LYAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAtUExURUdwTC2t6C2w5Syu5y2v6Cyv5iyu5iyv5i2y5Syv5iyv5iyu5iyv5iyv5i2v5jfwUQ4AAAAOdFJOUwAiQ04sxjiqD9z0ipdee2DFcQAAAH9JREFUKM9jYMAD2KreAcGrI9jk7N5BQCEWuXlQuXc7MOXevbwLkX6pgCn3DGbsa0y5J3ArDwoiAwEUOVTwUgC33LsNeOQOkC6XUXcjDpecQ51BHC77QHKvEpDlgpRgoMGpIUkDOVyeNmCEy1PbeTD/4IyHMNzxF4w73ssYqAcA0lz/zbvvtpMAAAAASUVORK5CYII=") no-repeat center; }

.__alarm_ign .car-key { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAWBAMAAAB5x3LYAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAwUExURUdwTOhSD+VOD+dQDehPEeZQDuZPDuZPDuVNEOZPDuZPDuZQDuZPDuZPD+NODeZQDyhE/+UAAAAPdFJOUwAhQ04sOMadD9z0iq9hJW8BXywAAAB/SURBVCjPY2DAA1hP/QeCXyXY5Oz/Q8A5LHLzoXL/d2DK/f95FyL9UwFT7ivM2N+Ycl/gVhYKIgMBFDlU8PMBbrn/G/DIFZAuF3HeIh+XnEO9QT4u+0ByvwKQ5ZKUYKDBqSFIAzlcvjVghMs32/kw/+CMh1Tc8ZeMO95LGagHACmaEHDSUQrcAAAAAElFTkSuQmCC") no-repeat center; }

.__dark .__alarm_ign .car-key { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAWCAMAAAC8N5/ZAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABRUExURUdwTPQREd0NDekPD94NDdILC+UODvAPD9kLC9wMDOASEtsODvIREc0KCvwSEvkSEuoQEOYPD+MPD+0REcsKCtwODt8ODtgNDfIREdELC9UMDOZ96jwAAAAPdFJOUwDck1xNxaQiQi8KEYjbtH4wcz8AAADHSURBVDjLvdPZDoMgEEDRURZxqwqy/v+HdiZpGrFJgT70GgkPnAQNAPyYeoTtnRwrFd/y5FDFuu3eMlUw3GHHWIY7VcFCwFUsZC01DH8DD8G8nkBTOXyJmDGGmGmoQ7jvO7G9JfyG4ziIHS31AFprYrolZM45Yq6cmqVjs8AZMmstMVtuBGk5CJwh894T8+WQeWTeJwQp0chTnlCfTTCqGV8cAGKMxGKWKB5LWsTZekVnXz7M63lP1Nw5fke88naLC6q+3X/tCQVoKpGZHENiAAAAAElFTkSuQmCC") no-repeat center; }

.__key .car-key { display: block; }

.car-hbrake { display: none; top: 85px; left: 117px; width: 49px; height: 31px; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAfCAMAAAB55NVoAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA2UExURUdwTCyv5iyv5iyv5iyv5iyv5yyv5i2v5i2v5iyv5iyv5iyv5iyv5iyu5i2v5iyv5iyv5i2v5mmtHrcAAAARdFJOUwBZufAeLvpqD3/Rl+FMPMWsfs2jGgAAAa9JREFUOMutVFduxSAQNMV0Y7j/ZcPsshgrifQihR9jYMoWOI5/GeGKOed4hQ/P1+Y6huuu1Q/OW9330ewvtFUpRXvKEH1qTSeCmIuW9Z2SflwqbN2YecyS4i3rC9AKc1KOK1BsGDuhzm/icYTk6uvMIsY5OyyZd7DXgJQgPkQEhhMmbRK+IGMzyynDa6dIVJFqdyqlpOZBngeNFScXe4X5wBJpUaxEwSrcBLdsIQ0aE8MShNAxopBgz5PoloQeZWLrlCKEnyFE/oTphQOBmmKj6dgR2Mn8qRIIoEEiGhzt+EEDJpTkFzmwgsgzjYRo3kscyOt3hGLEo9G3pirM6AURpJhxjwPH70iJCDOOjCqsXDW2veUq7FWndWS3SD2cmVzqlSsemctAFWyr5iSrt5o/COv4T/W1XPtji5beiNE7Rkz12e50b05eNONrU0pq3ZCnI6RJpi2InLgM56vZ/VhKYTZ7F55g+tMo3ajtGUJGIcus5diVt41b7nkEFV3K6nYJkSx2uhhR3S23QnUkl0Fj5P2ROs/TWi5f2p8rlz95Fy/tpK3y+ad319f/ecWPLy5EJChiBoyyAAAAAElFTkSuQmCC") no-repeat center; }

.__dark .car-hbrake { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAfCAMAAAB55NVoAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABIUExURUdwTP///////////////////////////////////////////////////////////////////////////////////////////wV68vgAAAAXdFJOUwCtl88gEyxr+1FdukJ6BfH3CsXb5YU1BUygVwAAAd9JREFUOMutVMmyhCAMHDYBFxgF5f//9NEJuLyqqZrDcBFjOt1pMK/XT9bqFynlMq9f5s/CFV5vcXyRr6dyX0J/KDt77+mbj8hzSogpESTOCI/TptR0qRzxaQt1Z7FTo2E6C5Dz2BPzfjaaUQsUHuLtxR322pIDi0HO27Q4FR5RtEqKz2b9u5RsWrGTRNV9wkbUMv/dQabsWTlQbAAaUo721GJLKeckLIrLWkb3ZsmG1wKFK1Ok0EuwUbVrU3Ut6MSdsmDDhDYjUxBi2nccJKpXEoXwBkMJkRt2rraYjrAcwAc8EN9BSojulG21TsTLUdPBsX6yFOoNNp5riAcCNqGDxN+pdXigO0I2GwkhrO19wNfxE+LiuLyiRn1XhYbW0siXex9I3xYyAgkHVywudK8Ey3br2ccazovd4lu/GnQeOH4c0fjwim+j5GNYXemy9378U5P1RGjHb2M5w0e5ZBHJE1HvTjRNVGl/JP03A9sY61MrpXwHLM2Xmf61W5BIjiogD4/LbmtI1b6D6lcDy8TbRSlxvPINHAUtV03hzlzeQ3dh8zwC9JL7aJjdnaJTZt1UVPQmpOBZknB4ZsKStwFgjmPQmk74UI95Jc0XM86fMy7K4cs5amju2jn8Zoz/AURjMNlrHKURAAAAAElFTkSuQmCC") no-repeat center; }

.__alarm_hbrake .car-hbrake { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAfCAMAAAB55NVoAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA/UExURUdwTOVPD+hPEORSDeZQDuZRDeZPDuZPD+ZPDuZPDuZPDuZPDuZPDuZQD+ZPDuZQDuZPDuZPDuVPDudQDuZQD7gjf/cAAAAUdFJOUwAfLAhZEdH6armX4fBBek7FrIU1flLIIgAAAchJREFUOMutVNu2pSAME7kKiKL8/7cOaQHxnDVrfBheNkLTpCm7y/JfljyS9z7t8mP8nm3hZfP9IV5sZV5Z/CXtrpSiOxUpucl5MwSJOx1vpzHbo1Lh6sS3w84ozXQuAK2wJ+ZrFIqLKBrUusmCq5ZkwaJHzNITI05USfFd7FEhQXcdnQSCDTa5JvzpzlEvfY8KXMnaKe5OlU8TQjDZIbmvaURXQjYsCeI1U5iRgo06WGpCJXbIgg0byoxMQYjtutBIZPct0QlDCREadm9UhHCthIvOC84vkBIC9IqFmmVGLJaKlpb1UyGAamwOzpGXnxyJRRzdX3ggOsI3GwmRnet1wFf1C6EY8XA8Xg0O1xGyNPI014HwM5ERCLg5Y7Gye5VZ9uSVHA91b4FwN4x+hNYi9fKKl+c2wLIm++rt36aePwhh+UuVcXyXRxYdvRH17UTdRJV1GU23Kx/G+iuMMaoDUvNlL+OR8CGR3PgzrK/H7uqRke2xl55Hx+mhlKieeA1HQctZg5yZ+YJcOBXfiBT7aNjtTFGNI8ogmopa1Zl9DtTHgObpDcvPQ+q+VyGofbd5zSuvP8y4Y8y46NePc1TT3HWf5+4/1h8E6CqSNt5ihQAAAABJRU5ErkJggg==") no-repeat center; }

.__dark .__alarm_hbrake .car-hbrake { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAfCAMAAAB55NVoAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAACcUExURUdwTOAODtgMDM8LC+AKCvEQENcMDNsNDeIODuIQEO8QEPIQEPMQENgMDPMREekPD+UODvcREc0KCvUREd0NDfIQEO4QENILC/IREcgKCtUMDM8LC8sKCt8NDdkNDdIMDOMODukPD8sKCtgMDM8LC/UREcoKCt4ODuIPD+4QEOkQENkNDfcSEvsTE84LC/MREeYPD9MMDNUNDdEMDKRtAYQAAAAmdFJOUwA8XM0HaWsrHw5/v9Wr5/ZMVbr3FrGYMkWXfODx5vpTjNB6xPWm9gWLTQAAAk9JREFUOMutVNeSo0AMNBmTMcEE57BDuDXY/v9/O7UI9l7VVflh+2U0rW5pRkyxWPwKloGVpqmVLT/UZ0n0PSC6Sh/oTfv7HYn5n7JZGIacC6M/gJNcbYcjL2Path3HVmeDhhTvOXK04QKm5tEuCilUEySsyaAi4aFF2JFCe/VWLRC4zJLN8dSiI0BnRl3n/bxsAGrJxQhTE4diB0HSddG/0wnrrksRHEnlDTdZ1wS0kMY1TuianuckGk6R1nWEE2uQ8RgWFkU+Gl/rmlsZ9QQ/IL9f1zhN3BBxYEfSNI2Na/pNw7c2QFhWQnvfoCZNcwRtj7rFYksRikhN0y8nB6zBkMhG/kBbnx09QaZV73uutTCI4GZ+36fo3feYhwYhrHFFCFCjqtzBQYSOHrSi+baq9rTIEGIG5uRIqyqdHa6uu6KqfCiOVSX/cAgCmIMQYw8iKpILsQ34okKghw4h5q0iKCgohFBmRyvE7lzwq1ApXg8VxY4/4bZtWxQP2nY3zIoIfTk/1Gzkz0SXzKwo2uKx7dpWnh2vd+K27XlMt8OxiwcB41s9Hnwsg/Yvh7kbdvJjpqU7gY9FK5oYtL4c7v1+4UNBZgxc+SQgVp7PC62moij7yXCiHOYiQaSMZHEjrPCKL7dbafx47DqlFAxBgUiefjabaYf8Rn77DeUgUOMESTnP7/RF4ESBSNkPGfO0AY+hSOC/XrVUBfsSL0Dn1EVxc7fksMTHi1dA/nbaeL1emyZ/4TW7Z+Sf/Bf3q0m+yY0P/6Px/pTnuS6pv/Mb/wsK6lZGjZ1VwgAAAABJRU5ErkJggg==") no-repeat center; }

.__hbrake .car-hbrake { display: block; }

.car-shock { position: absolute; top: 0; right: 15px; width: 46px; height: 40px; background-size: contain !important; animation: blink 1.2s linear infinite; }

.__alarm_shock_l .car-shock { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAABLBAMAAADzB9aCAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAwUExURUdwTOZQEuZQDuZPDuZPDuZRDuZPDuZPDuZPDuZPDuZQDuZPDuZPDuZPDuZPDuZQDx+cyy8AAAAPdFJOUwAJ1a1LFJTB8yM35mCBcVjIzfsAAAKkSURBVEjH7VYxixNREJ41l9PsJRIUPMtrIniFyanYWNw2ighHgh4q2KSwszhEbGwCciLYZLW1MJ2CxTU2ipBUIlxx6bQQ4j84vEASjN44bzdu7mXmvbdaO8XuJnw7+2bm+2YG4B8sV6HL/Nerz9xQ78sSXauI+Oh+zYHdxjpdG4TFnw7oK8RvdA4FVQ82u0GQgI6roL8cbtuEoVPeUti6A7uKOKbbLkH7rizsIA7pViZsxYV9iTgAmCPosOjCHooydZiw95yVoAT8iLzv1ZxY+vp3gA3EkirhBesLHuISeE0ch/TjOb61Om5Q/EcR36lvNBEfxv9mL7cEbA+7FOCoFT2Snad05D6Wo5dnbYtKXMWn9HQz4gQ+OXeW/IuxHsGQikeU8NuomZDDzIhIpsj4SYdKJc8PKccdgBM4a12uoAGc3KfAGwy7zx2fgR3y8IZBcY8T5A6cApVhZivc7yW/At4qhw6EBBfzqrjcOgYCNTn0vYETPSGwUIZeTxeYMr/MoSb5X+HQUSf9aU2BwfHUgZGMGBUem2V0bRZraRVZlghLr3jxF45z7VnwA7Pj1ywT5qbCyXPa7LiaVGw7vo9bRmw+8edPPrFpdrw7SUBNdW8rJQAKMaI+GTOyjOMyR201HnBJybsGCgeQSQK6bRGnsuVIynGifIc27oawiP1iMptsBdkqgVfuTmeIrSALxJZ1Rmi5IPPaJEx4JxbE16KeszeftrYQ9Kza39AWjUziuC6OmFEgqaovKGQBo1nEyb8izuVxKHBUMY8nIh7J0/P/sZK4zBxU77GpYykR2maSmyowEBKhszBRoLCJZdcuan8XEqzYCNc/f9A3LKuWcsCis2iURbecateNouvXUmELFjFL++Nm2oV7EYdh6u18LYD/dtB+A33FZ8fnMix3AAAAAElFTkSuQmCC") no-repeat center; }

.__dark .__alarm_shock_l .car-shock { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAABLCAMAAAA29zuDAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABmUExURUdwTPIQENMLC/MREeIODuYODtoNDeIPD+UODuIODvIQEPUREe0QEPQREdcMDM8LC9MLC9cMDNUMDO8REfQREeQPD9oNDfoSEuwQEOcPD9ALC80LC90ODtUMDOkQEMoLC+AODsgKChJhKkIAAAATdFJOUwCv4+9NYXcOIjnbxoWY0K+U77+23j1AAAADEElEQVRYw+2Y2ZKrIBCGRRHEJS64TEyMyfu/5GHRxGWIjVrnan7NlFr40ekNMo7zfxSg8SqOfcwCegKTxk00XOJGywsjFByC+l7TJMN11LzlH2EyBSKDJz5QcsShiWZgfZu8ofERS8MBosNDvRGaHPIpGoKj78gIRcfC7zdlI87obXl5AlSFpxy/MG6GOQ6naygoZekP7ijlcRzqJKVQw5TdpVJ4QmFhZR7VE8jLcCwpipLdfKrM02klrX5Dg1A8x3uxkWCpmBPJ90YoVnOUiM1twAkDUWPxtiqkUELZ5KkSR6O9gZ9EfDLv9z4gXsXKwR8oRQKnDmV/hBIUeaW65cBoiuFyegkazGKhBGgsV6c2W3NhmYe4rNeAcz70Pp8rKSTXf+aClJ7PZb3GI5QmE1apP4uTAxpawBOZVlw31CDiAAE6ekikwXp+5kGgPyGgaEXkQ91fyA9ICBAvTB2W6IQCMTlonRAT+7pGfx4A6MNqmcTeA6Crx2yg8eN6BVAvNrsEih4Q5gPZNEcWXkGyWs9xBWJWdtsZAoLmzHJBQNWm7OKkscUmNd+xiNHLpq3FHmxYPb8eVbUHG7jPDe3D5lvY52UHluX379qJvW/p6e74sYDrFSf33TmW2WP9eiFhG8unD+75DiyZMe8q6rOp7nW9Y/MVTxGZfpYtvoDdzxu6QLxbVDGndlYNkSmXpcO7EwcGbt1Njy6zweq2lHZSsxbFupnqe2qRuJlKR1qIFxev+XNbu9qiHlinBtPL2nNZt5BFPbhdobfUv7TKFRacuMKi1Nh8unZ+5NDEZW1rjC9uV4Kujq4Ya0py0i6MNQ9duuCbCena2gzqgvbWG+JA3TnyJs4U7II2N2QNu7VL7g1UD9lNqDclo39bC7KaMT3UVDrZL1hImbnK2Fdh2jesoH1fAF0gxqamYlgb22+XA+sHGZIG9yu9AGlLMUldOdgwlqyx0EYTSLShGtIdpk7RpojNoYf+9TeN2OujPRsEQ8Q+0JQ6p4mMUOKcqVQxc3wqVKyYAloEztnCBDt/+tNM/wBYdaecjvxIKgAAAABJRU5ErkJggg==") no-repeat center; }

.__alarm_shock_h .car-shock { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAABLBAMAAADzB9aCAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAwUExURUdwTOZQEuZQDuZPDuZPDuZRDuZPDuZPDuZPDuZPDuZQDuZPDuZPDuZPDuZPDuZQDx+cyy8AAAAPdFJOUwAJ1a1LFJTB8yM35mCBcVjIzfsAAAKkSURBVEjH7VYxixNREJ41l9PsJRIUPMtrIniFyanYWNw2ighHgh4q2KSwszhEbGwCciLYZLW1MJ2CxTU2ipBUIlxx6bQQ4j84vEASjN44bzdu7mXmvbdaO8XuJnw7+2bm+2YG4B8sV6HL/Nerz9xQ78sSXauI+Oh+zYHdxjpdG4TFnw7oK8RvdA4FVQ82u0GQgI6roL8cbtuEoVPeUti6A7uKOKbbLkH7rizsIA7pViZsxYV9iTgAmCPosOjCHooydZiw95yVoAT8iLzv1ZxY+vp3gA3EkirhBesLHuISeE0ch/TjOb61Om5Q/EcR36lvNBEfxv9mL7cEbA+7FOCoFT2Snad05D6Wo5dnbYtKXMWn9HQz4gQ+OXeW/IuxHsGQikeU8NuomZDDzIhIpsj4SYdKJc8PKccdgBM4a12uoAGc3KfAGwy7zx2fgR3y8IZBcY8T5A6cApVhZivc7yW/At4qhw6EBBfzqrjcOgYCNTn0vYETPSGwUIZeTxeYMr/MoSb5X+HQUSf9aU2BwfHUgZGMGBUem2V0bRZraRVZlghLr3jxF45z7VnwA7Pj1ywT5qbCyXPa7LiaVGw7vo9bRmw+8edPPrFpdrw7SUBNdW8rJQAKMaI+GTOyjOMyR201HnBJybsGCgeQSQK6bRGnsuVIynGifIc27oawiP1iMptsBdkqgVfuTmeIrSALxJZ1Rmi5IPPaJEx4JxbE16KeszeftrYQ9Kza39AWjUziuC6OmFEgqaovKGQBo1nEyb8izuVxKHBUMY8nIh7J0/P/sZK4zBxU77GpYykR2maSmyowEBKhszBRoLCJZdcuan8XEqzYCNc/f9A3LKuWcsCis2iURbecateNouvXUmELFjFL++Nm2oV7EYdh6u18LYD/dtB+A33FZ8fnMix3AAAAAElFTkSuQmCC") no-repeat center; }

.__dark .__alarm_shock_h .car-shock { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAABLCAMAAAA29zuDAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABmUExURUdwTPIQENMLC/MREeIODuYODtoNDeIPD+UODuIODvIQEPUREe0QEPQREdcMDM8LC9MLC9cMDNUMDO8REfQREeQPD9oNDfoSEuwQEOcPD9ALC80LC90ODtUMDOkQEMoLC+AODsgKChJhKkIAAAATdFJOUwCv4+9NYXcOIjnbxoWY0K+U77+23j1AAAADEElEQVRYw+2Y2ZKrIBCGRRHEJS64TEyMyfu/5GHRxGWIjVrnan7NlFr40ekNMo7zfxSg8SqOfcwCegKTxk00XOJGywsjFByC+l7TJMN11LzlH2EyBSKDJz5QcsShiWZgfZu8ofERS8MBosNDvRGaHPIpGoKj78gIRcfC7zdlI87obXl5AlSFpxy/MG6GOQ6naygoZekP7ijlcRzqJKVQw5TdpVJ4QmFhZR7VE8jLcCwpipLdfKrM02klrX5Dg1A8x3uxkWCpmBPJ90YoVnOUiM1twAkDUWPxtiqkUELZ5KkSR6O9gZ9EfDLv9z4gXsXKwR8oRQKnDmV/hBIUeaW65cBoiuFyegkazGKhBGgsV6c2W3NhmYe4rNeAcz70Pp8rKSTXf+aClJ7PZb3GI5QmE1apP4uTAxpawBOZVlw31CDiAAE6ekikwXp+5kGgPyGgaEXkQ91fyA9ICBAvTB2W6IQCMTlonRAT+7pGfx4A6MNqmcTeA6Crx2yg8eN6BVAvNrsEih4Q5gPZNEcWXkGyWs9xBWJWdtsZAoLmzHJBQNWm7OKkscUmNd+xiNHLpq3FHmxYPb8eVbUHG7jPDe3D5lvY52UHluX379qJvW/p6e74sYDrFSf33TmW2WP9eiFhG8unD+75DiyZMe8q6rOp7nW9Y/MVTxGZfpYtvoDdzxu6QLxbVDGndlYNkSmXpcO7EwcGbt1Njy6zweq2lHZSsxbFupnqe2qRuJlKR1qIFxev+XNbu9qiHlinBtPL2nNZt5BFPbhdobfUv7TKFRacuMKi1Nh8unZ+5NDEZW1rjC9uV4Kujq4Ya0py0i6MNQ9duuCbCena2gzqgvbWG+JA3TnyJs4U7II2N2QNu7VL7g1UD9lNqDclo39bC7KaMT3UVDrZL1hImbnK2Fdh2jesoH1fAF0gxqamYlgb22+XA+sHGZIG9yu9AGlLMUldOdgwlqyx0EYTSLShGtIdpk7RpojNoYf+9TeN2OujPRsEQ8Q+0JQ6p4mMUOKcqVQxc3wqVKyYAloEztnCBDt/+tNM/wBYdaecjvxIKgAAAABJRU5ErkJggg==") no-repeat center; }

.car-tilt { position: absolute; top: 0; left: 10px; width: 46px; height: 40px; background-size: contain !important; animation: blink 1.2s linear infinite; }

.__alarm_tilt .car-tilt { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFYAAABLCAMAAADdwICAAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA2UExURUdwTOZPDuZPDuZPDuZPDuxUAOZPDuZPDuZPDuZQDuZPDuVOD+lRFOZPDuZRDOZPDuZQDuZQD8Ilk6MAAAARdFJOUwAwoNxWBOr3bceSHQu0FIFEUD/dFAAAAuBJREFUWMPtWNmS4yAMDKc4DIb//9kx+Igxl3FSuy/Ry5RxTUdHtyT8ev3s/5ulmAAQI6bvYTJqwG/GxZdA9cwjIJGShL9Sx2OkJICxD0ERDo6CoXZ9Cg+Lw9aszqtn0cvoH31n1AWPMeVbTuQ46CQCBCj0YufiSf82oMO1jykleekZPlAlGq2Tghg9K72cN1TFBkFjnYyrvRcxAe4JKG4FOA+nwMbwsW6Ukm5VA3WbtiIUyjT8QIqfmKD0rfiDH9L1iHymWN9jpklT9LuMU+M97k7kUHxVxiXrdB+1oE53o7+Nq8Fz3ZBxboC3+rk2GUVZcbzsZEjYFKVMGnVbwiy8RaYW+qZd3GmQ4El25qqgIE6F9lBlul1kcDlq1elNKxoeTY20aJFsWnzi76DG7Hlfc5cmGaoVv0CpdVTgerdTb1DeAj1joL3vTFV+zfdAvdfvJtrSBKOK7DRhXVDP96Dmk57zaenIMZ5vgC4Bn5N62IX0TBwpY+1CJUlwst0ZDlRP7oEGhIL4LlngfthANgt5hgX/qYkrswimWn4MexEwit6Tj2FJqVV/jLrzLuXuAxyekhwai9UI6HQiZ6XbyAeg6b+VBqE9GIlnISjtyI0IdnTpnQe63G2DB+jYLZnqgx6jbDmi1R3wMpBqYyzdei2JO2tl1TU5nXVRd9mGZmdR3+9MPpVtoVmYwbU+g0X5HgdhUR5b7FWSBCtyvvFZj/q6Nl3Otm3blIo/vXR1vNaX7G34M1faNyVdI4Lhy+i63Je2ONhuJxMcs/m+4ZpIZ53n6b65LvXJdUm6ZaQa/Spm9+zuLLLobUnLoxybLtW6LFWo0VSH3KWZXuKv2Q/dTfyyB5uHOUYvyWXFUIY5dh08rswT+kjBp6tMOZDx7zO4ltyk+Qz3saRznz5vIN8b3J0vVL74fScdl6CH06DerZAV2PWQY8sIhtAMXFvXbBx3Qoj1uhB9fcFob5//2c/+pf0Ba1qMolEe8QwAAAAASUVORK5CYII=") no-repeat center; }

.__dark .__alarm_tilt .car-tilt { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFYAAABLCAMAAADdwICAAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABsUExURUdwTOMODt0NDeoPD+EODuIODvIQEOgPD+QPD+ENDfQREdcMDNQLC/gSEt4ODtILC/cREdILC/QREc4KCuoPD94ODuMPD+oQEOEODu0QEOYPD8oKCvEREdoNDc4LC9IMDPUSEvoSEtYMDMcKCq59Vo4AAAAVdFJOUwDfomVVdJIaCzDHuov1RdDh6rH08b56qukAAAOKSURBVFjD7ZjZkqsgEIYDyuK+xOhoTGT0/d/xgEsCCJ6QTNXczM/UVGzgo2kaJDmd/vT7Ih7OkyQvPfqDUL9Mvlcl3k85ivMZmIfh/CEksznAYZKU7zoflLOPpU8W1uowKRfn8XuzD2f/pIimwmPo52tMQncmRaJzggM1JuH3U4nvHlKxTDnaRw8/qGHwBpR9h2ZnOJeJgh0XjMCEMVamtnrEa1mSukK5J6w8miAW3jqFgE+fuwIPulAvFN4yvprkVao3T/8AGuCKPfQimAg/wvQokXsmqX8JTHLGKvumJyhnunqW/y93ad73oXXwAHJH+71Yj46xmFPp0ewFQy3zHzs81UjfV8S2jXuTKoyXiqMURr15OgRXfWuAtiJgFItP+cF+C/uWmk7GBdnuyrp3Bbc/OCCrFuxsadnatAWUAvFkzXTStuVunazQ5plWvngurQnUtlDdcKC1S05WPnjT2Nz1mwbLGx80vLFN8tr6QFhs0fWkKoqqI6g8rSCcW7aVJRlQ08RP6LHI8xDtmm6xmfaEj0G3eksR4C27TrS3lGqbVLyML4z1/m2Zgm4WnmM6M5d/FlXbmsqtan2HonqpaKBo+YoEIQ21obUoeI8K8Bq069ApiLq6Vo2RigW1s6qs7nSbHoVqMX+5cLvOYERaaGsAfRLVH+qibeBg9h58fSpgOqovn1IvFwM2vbgLoEJ+rAzY+A0oPXmyARqwmSt0ufRK3YDhRUhuS90tgzHyfB/x9jd7AdtNOthMl8j0evVvXAWSDmN4swpI1/O1GTBfQmJRp57wkQWaKQQKuCmyvdHFoNqmJqMJuiMQ5NmvYcK1WGtf3Ea9RI7XejiOo4IN4mLU5QrlsRW9pIllI/dN1q2IiTvW4z3Py/pSPxp2jorcDwbo/G1x4BJLnMLzsFM0L348nIkrtxC9eUCHYdTKsH6RoHw85IqFg1k8pNu5LJ5csakRmvnP/ZRtcXJSNty1cla+Rs3j3jNXLLqrOiN1faLF7JpjtNCw6qUqWKxX+Km7ahjjbTTymbuT4hc9r+arc47596tcCnUqi/V+L5x/n4muiuQjMHtYJ+ccC1SsdKL5V+7qKuccO0GZKgdXnsfkfI6Rs9z9GYRgksdzzjEx2Q2aSU7F8mjT5HyOneJpUZYq2TUpit1//Yo54gzV9yBSqVPxxm+ANNgtSaZh3XPMGHCdOmWnP/3p1/QPHqzWy7q1+aYAAAAASUVORK5CYII=") no-repeat center; }

.car-security { display: none; top: 0; left: 0; cursor: pointer; }

.__arm .car-security { display: block; }

.car-security-1, .car-security-5 { width: 39px; height: 112px; top: 86px; left: 0; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABwBAMAAABvBnRJAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTK/ICa/ICa/ICa7HB6/ICa/ICa/ICa/ICa/ICa/HCa/ICq/ICa/ICsRZvT8AAAANdFJOUwBnltgMUO0hvoA696epbjnKAAABn0lEQVRIx4XUv2rCUBTH8fSPbZUOdi0Ibp0KLh0Fpy6lkBcQWugq+AKCc0Fw6Cr4CKW4FnwBoSYmxtrzLtXUnHOTfKF3/GByfuecGz3PzptXPpW4XsYTCf0SNkSSfsFOeyLy0cljVfbnOa/3Kcpd8ZXpeS2+Mj03hkeZyXbspNTTUuwaWmNte1xT1eyHP/rDS8NvxQHVmUAdiy7SL0eXRJ++MFxSnbXireGQ6mjxikBxp59QX/lgGJRWsTuR4sJwpsU/IZHTpIyhSfGhuHRgaSF1bjF7MDhnk7a1qoMrStSiRHNIZA05iWzubQen2YwEluHG3FLMkGLq3TwTmIdzZWRD2ZeUXRc8osk5I9Z7eC6AbkM6Y/cmyNcBjwndLuWp/E0bPgrsbUDYJWwQTggXhCPCNuXsEQr0nhtnNro8rmHG2Y4q/2ME28guQzWHG8KAMCEMYcMSEx4+9wJOCX3CMWGTcEj4TrgmjAg3hAlhTPj3L1BEn7BJ2CJcEUaEAWFImAYtYZ1wTjgjjAgDwphwP6cyzglfCHfla1fFc+3h+QXx/qxVpukoCgAAAABJRU5ErkJggg==") no-repeat center; }

.__dark .car-security-1, .__dark .car-security-5 { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABwCAMAAACq9plIAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA2UExURUdwTP///////////////////////////////////////////////////////////////////4ZSzFsAAAARdFJOUwAy04RK7Rxmlgvgwlhys/efWYEPZgAAAZZJREFUWMON1tuWgyAMQFFBEBFv+f+f7ay201ZD4OR5L0MuqMNQjS0PJFaJibhFRHzosiTP2F2b5eXl5JinltvkE7FRUI7yE0sAj3tGce3TfeOc7GIvcYz13qnwlVHUYlPO19ihuhOqjzvV4/aqU52ZhFUxsiquI/vExJpSVNrC0jphaWeW1qhiY7PQaeuzWFTao+pmsqB/EVhatVJG2gLTjiytOp6RVnXPaLJa0VPYzajPVhJbKXWDRsNltMlqCayu7Kwrahqz4Vby9tHlZoPdp2Yd74Dd82ynVFuM4d7v0CSsfavlEivjvvRFWJsjc2YZt3EE0+Xmh/QbbKnuziw3gi+pduby3W6Rg85uiycvPuVG6E54vgKdF9a/CJ0Imu/UcBmN47qnoeEcdIFc3ptLDZfQ7bi+N8aGm6HbofPoVl4H3HK/g2s6B90K3QbdCV2B7oDuZ1PbboVuhK5AF6H7FtJxK3QzdB66zwr2XIBuhs5D99/BrkvQ7dC9/9y77t2Zvjuhi9C9EgN3Qhczc8/ELvXDDTQeJjq5H1b0bNwAAAAASUVORK5CYII=") no-repeat center; }

.__alarm .car-security-1, .__alarm .car-security-5 { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABwBAMAAABvBnRJAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAwUExURUdwTOZQDuVPDuZQDuRREOZPDuZPDuZQDeZPDuZPDuZPDuZPDuZPDuZPDuZPDuZQD0Tf75AAAAAPdFJOUwBnleoL1kocfDL3wViyn/aizI0AAAGiSURBVEjHbdU9UsJAFMDxoKgw4gyWVnADLSzswoydjVS2cAO8gRT2cgMch85CWiu4gdxAOks0IYAoPCWafbvJ/5W/SfZ9LcHzNG69bJTCchZ3JGpmsCKy6qQs74vIw7WLBdnEWc3B8xjlKn1kHM/pI+N4U8wlJsu2wW2DUjf4oqhPNvR1U9WuPrg2Dx4ofhq8oTzHkEdLFzEzKal9mbf3FT8MdhXnlKdPecrQjya3+onMkReKAc1tZvBVsWeSP0FFOSt5FZJLE5JrmS0qc0IL8mFwRYGtFSycwth1lXZFI6hI92vtQobZuyWS/DzyAl3aC1pSmRGVuYLbrmuzrqYsYJU6JLt2s+ABTc4H3LMbmkNDZsb2TZD3f9witLuUE+jS4CVhV2CZLcIK4R3hhHBA2RuEPqFA7844k9EVBYbszDhZh4uzzHdG0dlGchkKDi4IA8IVLDO5tC6GhFIj7BAOCduEY8I+4T3hnPCbMCB8JAwJ/74CaRwSVgnrhFPCGWFAGBHGhWawTDgi7BHOCNeEIeHm3yOLY8JTwt/0xcN0HHkYP5hlZNxJw3odAAAAAElFTkSuQmCC") no-repeat center; }

.__dark .__alarm .car-security-1, .__dark .__alarm .car-security-5 { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABwCAMAAACq9plIAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABFUExURUdwTPgSEvIQENYMDO0QEOcPD9sMDNELC9QLC+MODswLC/AQEPkSEtwNDdMMDPQREeAODsoKCuoQEM8LC+UPD9cNDcgKCtDZKboAAAAKdFJOUwDlztN1tupelStNBNQuAAACJUlEQVRYw52Y7ZaDIAxE6wcCgtKi9f0fdVVEMYE6ZycoFm8nCbr7o69XVu0LkrQVRFbW2lo+Yq3dJTRgt0shdrtaxG5TJRG7TbUG7EKZGrArlVnluCrzKDC/Ooc5humsnWCcsG6PYGOPa9avdudtF+btqJmdinaHVbDjXVRukz1GCOdYWnndTAZPW7tL9rxqeRfRywYyBEurXEaZzatyHE8rsxhPK5wz+9iP49rwV8W4JOKFUzytyYRjfx/CpHLx4iFtnNnDkCYnXp7IcoaV5/NcNq2PI068PLWue0OG5+VVhmOr6MPV3pskzok+3HZbTY9jYm+yjz7J7HkbPi/6jspj/Uh4JqdtqIKf5OVlRdudMU76OUYYcWa7FzSHYw4nP9NtEXOQn0+/3ZNuS3fcpiJvgb6Qq7TtA9k+ORdEtk+BnChxmrXxzoYmbaxLgJ9+l0SexruQlnAK9BMlrCPtFrCZcAPmV2h3oJxcl3hsYHPnhoIIp0rcgHL3+gTINSDXDd9C3Ln9qxQJ022bv5soGE537linY5VmfhkNd05+ixpA7iv/wbU/uPbOjaVI/w+psSyBcVMD+nUgN6KcxuobZcpNhVjBlvhlsfWUbKCafqiBuHHqQb9Jg5xEuH7qFea3XG+C6n9pgbip7zXm10uM+yiQa8A+PmB9Z4Hq81OLwrizQLU8SIOcBDkBcgvKSZBTINeBXEgMcArkFpTbEmv5rKcfMC79AZfGsCDm3n69AAAAAElFTkSuQmCC") no-repeat center; }

.car-security-2, .car-security-4 { width: 93px; height: 84px; top: 11px; left: 22px; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF0AAABUBAMAAAASUCY4AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAnUExURUdwTK/ICa/ICa/ICa7JCa/ICa/ICa/ICa7ICa7ICa/ICa/ICq/ICjnK72AAAAAMdFJOUwDvwBwLfkk322Ke+9zX1ccAAAHWSURBVEjHtZc9SwNBEIYXEy+crUYRrghEtLlCBUGwCQFBrzK1FrG3UEEQbASrQIooFpaCZWwUPzBckwONevOjNFGS2S1u5i0y9cPLfO+OMWOztUMIv4pvATpXI5rR44U2EX2pcT/8xelRi283+zilyzp8M6A/21Hi8T9/DqkT9TShDtWJvmXca9LIHipi3kPiVpeqem/hJHXEpY3TUzZ+6uBCR0Spyyfq1Azs8xqIlaiTOTD7Dp0WM7MfueqNTLzgOr+YncpdB1/KxlcxdS+AcNebhoBXbbwotHHOzk1HGnO7Uom0Bv2Y492WNFN239wZKNh5cbGG3J1EXGnrmPN2Lsvivjni+LO853njdOuQfFrG5N8NJK/wxpK/kOVXeKXEXWznXvHYbmHB5vmuVzxtUwx/U7xUe1Aujc/kZxXyZ5h8LsDkq5g8n/IXA0WbtrBoNd8i3jqaX8sEIZ8Kq7YLCtxjb6zm08UGZU7jToglcxKaEyv5JQWeHyW/q4mWDdaHxp0DrLbMHcXSsdyZBt1pge4YrFgqdzaw7LDeUbnDBvfVYNnU3UvHw96pqHhzA+yFQQFqwHUyWCZt1THgXBGJ0Vv/K94D+P7RVEJ4E8XYdWtOxnNk/wA0Z9yEQCw47gAAAABJRU5ErkJggg==") no-repeat center; }

.__dark .car-security-2, .__dark .car-security-4 { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF0AAABUBAMAAAASUCY4AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAtUExURUdwTP///////////////////////////////////////////////////////81e3QIAAAAOdFJOUwDyBeRIuzcS0B+dcYNb4fCPuwAAAeFJREFUSMe1l89KQlEQxg8XUcrcRBQViRuhP/QEkdgLhEgQbaRo0yruJgjbRLRpkSQRtGgRPYDoqm3RXoToAcQUUZtnSEt0zlncmW/hWf/4+GbOzDkzxkzsPB0itPdFzwA+9UE0q8fDJSL6UeObhT5OTS2+kaK/c6fDL4Y4lXV4fIjTpcrMCKcW4H1wOjIeK4xxaiTEvOeIn7SAR0oWThmhZio2TgvB/ImDUzcQz7t4cEWEUi7efgViJVoKbJhPF9/yIfO3gZcVds3vBWe+CuHmAcPdVF4LdeO42RbwMxtfFsp4rWDhHV+Q37GLQHoGoxZelx4Fz66bA6kFkxa+IuERK9imFKt5tMzXxHc7BZk3xxzvye9NnD9PaVH+iMvvG0i+ZyD5ehqTv5Hl76GbsnP/IsufY8F6vHIUX9s6wzVfcxXKpYkx+TmF/Ckmz5OpkV/F5A3r8m+DRVszUGV2FXiERfum4JPQUGHdbVaBh1iT+wq+OObnNXZyWDKjUJ9YpZbFkt/QjJjTWOmYXexuvbGddgKzswjaKWN2VAP7DGiniNlhtaPKDmtczbjOs6nbl0ZDb91X8aNBs6vDjff+z1+pd7eSurPYFtEGtsPB/NgC+MHSlIGW2zxB221/G57Mkv0L4RJaovSl6icAAAAASUVORK5CYII=") no-repeat center; }

.__alarm .car-security-2, .__alarm .car-security-4 { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF0AAABUBAMAAAASUCY4AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAkUExURUdwTOZPDuZPDuZPDuVPDuZPDuVRDuZQDuZPDuZPDuZPDuZQDzupNLwAAAALdFJOUwDvwBpONwnbnmyBVzm5lwAAAcZJREFUSMe1lztPQkEQhW/kEbAVTZSGBLWhQRuNNmhjYYM2FjaGmPioTDQmhsbEkgYba6mpLkoE5895BSMzt9g5p2DrL5OzZx67E0VzO3tNhs4fyjOBZ3oiKzie64jIJ4xf1hJcBih+05bJqWP4bXmKS5fD5Q4S84/LEMCLM1xGPp5tz3CJL1zfa6JPw8tqx+BuRbxaXD7C+FkKl3EQv07j4Yow1kzO1xtx18T+YMMcpPG1OiX+KZisXFr8etjKfgrfCOPbXPRsmcLTah4cvGXxVaeMM9abkdfmNlMDbwwWDR67Q8HWzUtEXbbkDlbTsQN3pO1w4q2XVXfenGj825/zunDiJhe+yoX31ZjwcYMLf++H39KZcmex9R54bK+4y+Z15QBPW0HhyNPcp7w0bVUCwp9z4TNlLnyLC6+7HDGnSLyyqduOke+WKp13gF+gPhUmt5sAnlVvLPLpUo2yjMipcWYuUn1izK8gX+OZ+TFy2wJXOtExl1slBxg6Rs4SKadLyom4ZEFy9jk5qnYgOaqUke+6dhPbl06p2knOETEXJgnoTflHeHfrwJ2ltgh4G/v7ig8J/ndpqjB8tCvUdptsw/NZsn8Asl6i46vl48YAAAAASUVORK5CYII=") no-repeat center; }

.__dark .__alarm .car-security-2, .__dark .__alarm .car-security-4 { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF0AAABUCAMAAADXoMs5AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABOUExURUdwTO4QENELC/AQEN8NDeYPD+MODuQODuQODuQODu4QENgMDM8KCvcREegPD/kSEvUREdoNDfAREeEODusQENQMDOYPD80LC9ALC8kKCsUQSJ4AAAAPdFJOUwCnwMMxX/AWRnrZk+Pr/L8uNVIAAAIwSURBVFjD1ZnZkoMgFERRUBZ1wIUs//+jg0Qni5eZKmkepi9l8pKTruaqiIz9O0ktirEbbm1VyvZgg4YSbFXZTU2RSHZxMFsb+yqJj/tFuiDbWgPL5MgOEgXZ1naIPtnm0h3o+S0veAS77ejs9jV+qMzJrFxKNowqM/AIIcut/jNaXhn3h85fDX4J5amzVwM1/M02Wp41Pk1uK3K4qTrbMc0Qfr7DHTUGLU8nPkWlvZsmo1U2dko84yTS0+/KYUtejh36sByb6WVKVRimybtkrQxKK77Nu9EJs6QU4F3ePVq1EUMPnnmT019J50ubuzDq0uylkrm3oILGJV+WS6JyjTNpLillGw+deEkYv/DspaJok87zF4ppeKvKwb9qCYHPVM2A5bNoZ1qAVCKcNG4Aa2eZcI6IPJxEiVgQT6JJOGLNz/g8ztSAPGtVK+udHAvyjNuNY0A9DvsIB0QnhoXiE/gzRhRc7bj98/FXGLjsP9FRHgJn9UgJ4zzO6FEg52FG/aFGj9luEZ4yjunzdUY9UZDTP8yoJ3QDbaFpH5x+Dl+D9swo576XoNBJuigZegML/XYoD9o8ExH26Rw0o7K/EQLNKOso+E2BmvFKwUHnKCNzAYXOuislicqFEmqTu6fgqFw0Bb+DchF3io7a4a6v92OhcmnulFCvdDoKjjqPQu71Ad4j31o0/QddM6j0u3UGlnyNXzG4nvHXrIRUX8z6I/6+mPU9/nLvRkP8mv0XfQM4dIpCk/aeEQAAAABJRU5ErkJggg==") no-repeat center; }

.car-security-3 { width: 114px; height: 29px; top: 0; left: 110px; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHIAAAAdBAMAAACEUSXBAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAwUExURUdwTK/ICa/HCa3IAq/ICa/ICa/ICa/ICa/HCa/ICa/ICa/ICa/ICq/ICa3JCq/ICv8v1LYAAAAPdFJOUwDuPAidaVC8J3vQsOCMF/ZYjFEAAAE1SURBVDjLY2AYJMBCLXSud3nVqlWryqt9p4ZpGBClyyjTe+F/NPBxuWfQA/zank0p/I8DfFwyDadmjtya/3jBx9oMrK6Mlv9PGEhPQvez0XRi9IHA90vIejmiidUHtjcCrlH3/H/SwJFkiEMd/5MMProBndwi/58cIK3A0P+fPBDAwEWmzgcMrORp/M3AwEeezm/AsN1Plk5hoM58snQ6AHUa4pIUlDkjiDPKFIA6WTBEpUqupmk8hqQv5hdqqVN2YRjwByTHhJo6SqY1Y2Yk5rYQ1Bz4Eyy8HiGwZBLurP8oBEnhP7DQfJh1O5XxlxjMqntgOgvAAu8hLndtIKKUavWBpT0QYAcxKxuILBdbN4KcB8ndwPQnkkx8kcoMzM5foEyZS6QVx0x3PkFZDSQX5Q0UVQQAlnx7pGE3jf8AAAAASUVORK5CYII=") no-repeat center; }

.__dark .car-security-3 { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHIAAAAdCAMAAABBocjAAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA8UExURUdwTP///////////////////////////////////////////////////////////////////////////4/JsPUAAAATdFJOUwBv7tqiQ+i3CCWVfDbK911QFYfCw5V4AAABQElEQVRIx+2W226EMAxE14kd555A/v9fCxTtBi1loUD60pGQECAdbLBnHo9/VdKGcgJnEZk5hCCHYzhDtA5SJqOvQ3U+OctSlE8SktEl352CkcOgylGJgC6bwzSTez4Oq6W4T7u5Hk7SqoLZ+Q/fWJPjWK5VDD39hDVwOe6JZXhvMllZ7pW0VbGarCotJDBPVIOitFNEGpClrWAoM7RFjtsJmhJ52muxJTJPfyw3JIrvQckNkXaey6NTEoUQUkolxOFv4uddYHc0ZDDDHhJ50y0Xpu6Mp9G6eY/Pyad3bJnQ6H5e7wwOGeymDbnns+v7VaKj7lfWDhjWW/5a7u7dYMGfCzPaA6rVoZzfa4HDZC7KTSYtDSpV93jL2E5iXzYc68alqTyb9T15dHZHXFyMytKtMdj3siwJpkH49n+X+78Ag5CEv8mnspIAAAAASUVORK5CYII=") no-repeat center; }

.__alarm .car-security-3 { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHIAAAAdCAMAAABBocjAAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA2UExURUdwTOZPDuZQDeZPDuZQDeZPDuZQDuZPDuFRDeZQDuZPDuZPDuZPDuZPDuZPDuZPDuZPDuZQD7mHeasAAAARdFJOUwCiHm8w6UG3CfLalXzLTl2HHdjP1gAAATRJREFUSMftlu3OgyAMRi0USvmU+7/Zl6nZcB+vOhn7sycxMWpy0oZ6Ogy/VDFCxyS9AyCiEIItV7kDcF6mqNE0RGHyjoLKW2FL4JM+hRbRww7UfVQAH8UbtJGOw1ZgGtNuLsqTtKrX5LcabbQnzm3DYXyJFbI57latfGyydjZ/NtZFU7XTqdwjDDMVgXO/MOiCzH0jS5mhL/JyjmRXIk3D0RUZpxNLPY/PPCixI9Itc3l0KplZWWsVHx8vvfwL3A5KkeFYVIwozJ25EfVF3XuUmu3VHVv226l8g1G6fzXkr98+/79a8Fq8s0doCeH1UM7xj4KV5zaKUrEE9XQoF2+tcJCw0d4k0lpQqXpHN7Fh482w0jDXjUtTebXRmu6jix1h9ZCV0x9dg3G0eU0QHZZvHL6WP2X9duq4jkEQAAAAAElFTkSuQmCC") no-repeat center; }

.__dark .__alarm .car-security-3 { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHIAAAAdCAMAAABBocjAAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABXUExURUdwTNMLC88LC/QREecODuENDfkSEuAODt4NDd4NDdALC/UREfUREfgREdILC98ODu0QEPUSEvoSEukQEOIPD+UPD9oNDe8REdIMDNgNDfIREcwKCtUNDTevv54AAAAPdFJOUwDtmu5YDrk/cibbhaDQt/ceTMQAAAFXSURBVEjH7ZbtdoIwDEBtG5r0g0pVxnS+/3OuhYFFZQyF/to9Ho4HS68JkGS3+yehUAhAxlgrpSw7wjdrjSEAVMWKKgRjZSkOc4hSWgNYvCcjK+dVj+pgVottCswg8/HTHm74R5Pvl3arhVzgRZLCr8HBC0mziUYTdRe/Io00k1oVortsQ4hWPQmvbJqq2ZDSYuqzomqq7REW2hQrK475EDFWdazrbMagohBmWefkFFNLp5y4tq7tcwLtA+syGllXFeAjH/znvWTnZVwZY1rrcLwuvPLclwN+nYVpx0MrxtCKxwWzCK0bgYg7zea30UP1+ZyGOU7wx5Yf7FH9y240rH2+SnN6qceH1s4nvLfiTl93MEf45jCD5PT9ti7pW+l5zV8YI6aGCz7SQvKbG/4HqZUnQ0WO9blLEwftGY7FNgMpdsHy0R1nmuOmY3C0jg0qw/CdwzHBNz+DjK+yt7KeAAAAAElFTkSuQmCC") no-repeat center; }

.car-security-4 { transform: scaleX(-1); left: 218px; }

.car-security-5 { transform: scaleX(-1); left: 294px; }

.info { position: absolute; left: 16px; right: 16px; bottom: 11px; margin: 0 auto; max-width: 420px; text-align: center; white-space: nowrap; display: flex; flex-flow: row nowrap; justify-content: space-around; align-content: center; }

.info-i { cursor: pointer; height: 30px; line-height: 30px; vertical-align: middle; --mdc-icon-size: 20px; }

.info-i.__hidden { display: none; }

@keyframes smoke { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAnUExURUdwTCyv5iyu5iyv5iuw5IaEky+v5yyv5i2u5yyv5uZRDy2v5y2v5lCbFAcAAAAMdFJOUwCB9c4kFAjhTbEoZGK0yqEAAABjSURBVDjLY2AYBYMJBGATXEC0YMBoCI6CUTAKiAYsgg6YYnPOKIorogkynwEBAWyCKqiC3GDB46jmstWARQ1QldqABRVQxDjAYocaUAQ5z5w5LHRYFMOiaawJ6K5vVkwgwt8Ajosmd/c+ZGEAAAAASUVORK5CYII="); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTCyv5iyv5iyv5iyv5iyv5i2t6Syv5iyv5iyv5iuv5Syv5i2u5i2v5tjmauoAAAANdFJOUwCVei+z+A/Xxlwe7kK24q1yAAAA+ElEQVQ4y2NgGAWjYBQMVZCAKcTjetUZXYyr9+7dqxPgXLbFIH2z7wLBJagQs3js3RsTGFLugsEBiDJfEPu64l6IYANYkAXMvnoXCgrAgmfvogABsKAsitj1BCyCmxmwCELdORdZ7ArUmbbIgjC3c2ATZMamnSEWSfAqLPB6sdjOoIvpITTrG6CCjNgE2YB+2uINFVSAWc+sqMPAVQsWu4gaQ6tBYiEHUAWZe+9el8SIYi7jBOolIGZFAwwxLt+7QeqBaILsqD5BDvkoVEFOSHwvQBXdixI8UAAJig2o6RcSORNQBIGp7obqdS0Mi9zYMMJi+kZi/A0Ag+QDeMVSCacAAAAASUVORK5CYII="); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAzUExURUdwTCyt5yyv5Syv5iyv5jSs6iyv5iyv5iyv5iyv5S2u5iyv5iyv5iyv5iyu5iyv5i2v5vj2ygIAAAAQdFJOUwASM9dfBcj4syNI7pR2pYbvIS3uAAABp0lEQVRIx9VXx3KFMAzEVe74/782gF/DscpMckj2vCOr7Qq27QdwqfgM2TTrKJo2/YlccWaC/gGvEFrM/QaPRAx9QlknN9M6RFG43ndRuCPDRef8ggffKyl9hTlBFZa0rl/PxaiTbdBJXvKdxnjXdg5XPA0sryCNnZHPGvlwV4JJQOtWUsWYsIjX5Lwo4Z2NMbI6JA/DpaXG8upYlsZ3ZaAST5rysaVYjiFNK7+jZU4bD9g6TWiULDYyw7y0vCyR9/LhIPSffe1nnu/KUPFy+Lyj7Zgvq9smNtzA1TtFb8m7YUM+NiTUuP0LKCcgpQAdgmZY8dF1WDRIxficlc2TKF/rUgyMBrvZ99P6IJhaMravpPcadKUw2e1kOMVctYfq4ibipY23l0l0LnLWh2oNm4bo3QPo8ZpuvhfVS3X6boJ4xZ73yRXvcRxyCJlqzNmbvdTT3u/2UXApvT/sICTye/Lq0vHVqThNRq3V37KSWIsWsE5hQq0GCsnzAvueeEB57qeQDEG8XUFPBDTcPf1uMEDMfiyfr3C4muLqCG5TivuBMXl3vzHXLz5aYuJ3oWBVAAAAAElFTkSuQmCC"); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAnUExURUdwTCyv5iyu5iyv5iuw5IaEky+v5yyv5i2u5yyv5uZRDy2v5y2v5lCbFAcAAAAMdFJOUwCB9c4kFAjhTbEoZGK0yqEAAABjSURBVDjLY2AYBYMJBGATXEC0YMBoCI6CUTAKiAYsgg6YYnPOKIorogkynwEBAWyCKqiC3GDB46jmstWARQ1QldqABRVQxDjAYocaUAQ5z5w5LHRYFMOiaawJ6K5vVkwgwt8Ajosmd/c+ZGEAAAAASUVORK5CYII="); } }

@keyframes smoke_dark { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTP///////////////////////////////////////////////////4sGkswAAAANdFJOUwD1zngajeEpCbFSZEINJr2gAAAAWUlEQVQ4y2NgGAWjYBSMglEwIgG7aQGGGMvcu8JmomiCTHdBIACboAiqIDdY8BqaublgUQVUQV2woACKGA9Y7OICFEHOu3cvGV4ywbBoBksDuusXiTYQ4W8AsnQoU/URMfgAAAAASUVORK5CYII="); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAzUExURUdwTP///////////////////////////////////////////////////////////////8/RimEAAAAQdFJOUwArHu7XD8az+HQ/WQWSnIVzM1qlAAAA+ElEQVRIx+2URxLDIAxF6YjO/U8bl8QWGSNYZJEFf+Uxz0j+KowtLS0tLS0tPUrHCchbqGD5gBKmHoLwEIZz/X4Msn7k2ihJwf7WhC0nbSuSRzehA+WSxFg1N9d8/y11B6Wwmi6ukNfpi8sEJpGDieCwf66PWWwe73Oty2aS83NxGYMeB3oycNsvZaIa9B+bNsE8ycUTlNZKypg9dMnFb00qFMZyf5TEdSNYT80QP1xSOejRTArP9X+tEu4SH1NiH0xwTkEiOWRtoTjUViD6WAx4XilQ9jukl2CVxO7EExH63LmvjINtqxHpnQvBRqZH1Q9KlviLur4AfdUl6STlcxYAAAAASUVORK5CYII="); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA8UExURUdwTP///////////////////////////////////////////////////////////////////////////4/JsPUAAAATdFJOUwDvZCES0pSx+AXGdytURDaFot8HrYrVAAABtklEQVRIx81W2ZLDIAzjxuHK4f//122abdMQA57ZfaieNWAbWUKIP2AqzkqQds1TjzZbfEHGNjMDfiCYBk1LvCA0TvRYwdHF1TQEzToOcWEd96iQmFwgeHDvxCGFukDjSRqm93Vaz0WtgF1eCdjHca/CEeadlmDIc43B1tj2HsfHPRspDBoqThfHC7N460O9HJ5/yJfD2wdjeX1wCgTDG3Q8xLKOp3Igdq60Lp0CbdXoSyX5hTxL3faCVIPjrS0mynzuNElanrzxLOkrK/X4LMOgfequh0zzCvn449EsLV8220XqbQM3p3/Y3M2N7CXC5qMeBYz4ChhOHcUDgk8Dlg5NTQuj0+utlKyW8i0XZ5/SD2qqfb/QgWCVk6048iPXpSXV0uvSo1nT2Y2PrUuj9LurX3Ud90QaWd8LgcmbefcK0QyvKvMDq9/epK/u0e44jOyK5v2Gg/Re9gazz2Zxcbd3czEu116l82MHvvR2KD2ntK3ZjHZSz8mIr0KKbh6z9L6YEOMGrsuzDPuueNDz3M9F2jrESwoG3sV0nt4NBjrRcfhViIA2mlEffhLGDDIkW7n8S8j8AFDKdPPAxr/eAAAAAElFTkSuQmCC"); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTP///////////////////////////////////////////////////4sGkswAAAANdFJOUwD1zngajeEpCbFSZEINJr2gAAAAWUlEQVQ4y2NgGAWjYBSMglEwIgG7aQGGGMvcu8JmomiCTHdBIACboAiqIDdY8BqaublgUQVUQV2woACKGA9Y7OICFEHOu3cvGV4ywbBoBksDuusXiTYQ4W8AsnQoU/URMfgAAAAASUVORK5CYII="); } }

@keyframes smoke_alert { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAkUExURUdwTOZPDuZPDuZPDuROD+ZPDulTDORQD+ZPD+dQD+ZPDuZQD/f3LHsAAAALdFJOUwDzh9UkbxMGxU2xiARw7AAAAFtJREFUOMtjYBgFo2AUjIJRMDKBqwqmmNfu3aGGCmiC1ruBYBM2wY0OqILRIMHdJqiCjGDBHaiCzGDBjaiCs8GCkqiCq3fvbpU2TUC3aFdBGkMBqiCnoToR3gYA+Q0i2rzy+iEAAAAASUVORK5CYII="); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTOZPDuZPDuZPDuZODuZPDupOEuZQDu1PAOZPDuZPDuZPDuZQDuZQDy7hZCMAAAANdFJOUwDtScIbaA0yBH3alKm5LxlJAAABAElEQVQ4y2NgGAWjYBQMVZCGKcQ26+7SBnTBwLt375rAeRzuDkDSGSh295YDVFew7N2LWxiYZEGCdw0ggopgzk5bMHX3EliM6S4KuAoWZEYVvAIWzEUVDAAL+qKI3WbAotICIsiIIqgAEeRBFrsI9Q4TNkEGW2TRAqhgLLLgBKigLrLgAgYsbrrCgMX6S1BBdlksgqCwu3UYKigGj5vorQ5QN1wsQIkgbnBkTEONNY6Jd+9aFmBEcLkHtqTQQFYCYtOegSkYePdyzC00eyGBLIJN8Daaq9eihC5KyF9CVamLlIYYUCPODEWMHSgy+eIhNLevvXuJwwHd8T7CBUQEDwBMHQfufpUZMQAAAABJRU5ErkJggg=="); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA2UExURUdwTOZPD+dSCOZPDuZPDupQEOZPDudPDuZPDuZPDuZPDuZQDuVPDuZPDuZPDuZPDuZPDuZQDyN1kxEAAAARdFJOUwArBoLwD9YbwOf5rEttOpVaeEGdTAAAAblJREFUSMfVl9l2hSAMRWUOIEP+/2er12urkgBd7UObR9deYKZzdFl+Ei5Fq4MHJXqULAHPAJ6UgJcIleMK3oMBxQND7UguPjksFJYbDLWZOg5xbbGVwFC1SWiKi0+sktiFM07kVVnEHmeUx24chTEWBwFsJe4RHNUnItLGqQluTwQmOL9xfoLDb3B2kouTXJ3MQ05c/Gpc1sPjjoEegfbcYde52scqv8aPaYpXj5105NXQLprixmmkAtT6LHT7EsWpqfXeMmk5Wvra0kiSaxTDMvoIQ1V5K1q498Jxgptuopd5oU+fJ+riur5RbMDNNla5/IcwZgba5dWmUUb1rSfQFkg6cT50X020N9AkeK2IL+Kp+3AdFo1nL0JJj4nI3AiwxgpDFT8SGIo4uxuk+5qex1wL3dHoPDLn98CO3ZngOoXJ/Ap1tpO/+L7thm+cW+YyvquWCHPcko9a2wikd1wntZTqnrn7jnyUiy/0Nk6qfezD4KvzRYos/pbEyFrSxBulvcpQY7C5h63Dr9t2rErv7eyEbzTzvHbUbuin7R4B3/vDzYMC1HHtafFevrBuijr6gYka8m/09QPptGkwO7DbFAAAAABJRU5ErkJggg=="); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAkUExURUdwTOZPDuZPDuZPDuROD+ZPDulTDORQD+ZPD+dQD+ZPDuZQD/f3LHsAAAALdFJOUwDzh9UkbxMGxU2xiARw7AAAAFtJREFUOMtjYBgFo2AUjIJRMDKBqwqmmNfu3aGGCmiC1ruBYBM2wY0OqILRIMHdJqiCjGDBHaiCzGDBjaiCs8GCkqiCq3fvbpU2TUC3aFdBGkMBqiCnoToR3gYA+Q0i2rzy+iEAAAAASUVORK5CYII="); } }

@keyframes smoke_alert_dark { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABIUExURUdwTM8KCsgKCvoSEs4KCuEODs0KCvYREeQODvgREfAREfwTE+0QEM0KCssKCtgNDfkREcYJCekQENoNDeEPD9QMDO4REcwLCzCQsa8AAAASdFJOUwBNCZHQ6PT+HHrPLLt7sWTai54U8UkAAABlSURBVEjH7dE3EsAgDERRcjA44XT/mxoaqBCN3e2bUfcbSYwBAAAAAMBvgpdhXLloM+83K8luspUnu7tKjujW1Ggq1GcTiU4dje5n/GoM73fLU6jZ5CH3KNkimBODQ3NldvHBW1/wrwbbN+n4uQAAAABJRU5ErkJggg=="); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAB1UExURUdwTNQMDNcMDOwPD9kMDN0GBvcSEucPD+oQENULC8oKCuMODtgMDPUREdsNDfgSEtULC8oJCfgSEuYPD8oKCvUREdULC/oSEvsTE+4REeYPD+wQEPMREfgSEsoKCt4NDc4LC/oTE/YSEvEREe8REekQEOIPDyaBbM0AAAAadFJOUwBnfkEyBcIbDkz09ZN05uzXv1+uqJfJ297pqgl/pAAAASxJREFUSMftlNl2gyAQQAVZxH1PG6MBbfL/n1i1jYG0gz709Inrm16HmYHB8xwOh8PhcPxKEByRkjelTgnd0cpMrTD+4xPl5PGSM9V/eepkiEHJsn4ma/garH/CNE1k4zf92CRsNPA3zb+MFsrNMwO8/DRtCQbTxUKyheOThUYr9gNkYnqj32HR17tXdQBTZOyED3md6dHqBtARQ0wg74YNT5wButw8bBEkns1zVd0hjMZ4JII8YR5SP70u5FV71bmnrzMSoDhGSzJI91ICj0b8tLBt4iiOZidqMdmbSUoIp8dmnP7PVUJFjA8shVIpZYHqMLfWKORGyI95MrZll0s5PB5sy2/QEJZqdQ/B8QpNK+C9J6sQ4mIIa2G7i/NFE/ONutNnXoct+Yt9/QRBxUpo4Bku/QAAAABJRU5ErkJggg=="); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABXUExURUdwTNYMDOcODvYREdgMDOENDeMODt4ODt0NDeANDeENDdALC8wKCu4QEM0KCvMREd0NDfcREegPD/IREdkNDfYSEu4QEPsSEtELC9UMDOoPD8gKCuUPD0Na0FgAAAATdFJOUwDGJ7JoNZILTBl+4fXTsObr8vNrOgd8AAACF0lEQVRIx9WX15KrMAyGcS+YEnog7/+ca1MCBreZPRdnfzFOgA9ZxpIyybLfSEhUvcYKSRiiGB2/QsSPofGiF/ZxdLTF3Rjpb9xLODk03kWd7tZb/XocDpnTXd+P/Qau39wR8p3Yh22UDwy+dm/bx36CHt5W7Hqsw8kJSAiXxeriKXTsU2XOTDRO7S+GFX1Emz8Uw/rW7Ahpo1xvcoGaByJmJi7auCrNVQlcyxI5mDav4VAKp18Mb9shZmYdWTFEtW4caSLehmqrEA0GVRzVDgNTVwif5cHAMDtsqO6NQzTzUwN4Vi51cI2jwKGDQ676Lp6cdHFynj83czYgaO5Y2OxufUjfs/x9mJPjn5sKT38EN456OGJjtfA1XGxh/gae4eagGipCvwiQFtoToJxlf0EsJUwm867LcQzDdfcx5shpJuBxUYBO62OG3AIZLmtztaamcnh9UHoE12RZoU0Ug87Sma+8C+lcCwhh72+A7J3mTuiHjodXu+qSrmy/7TJw3ZP67ZWVrqWP6pRda153NmccTk6z582wB5vedpPhk0/AThXlBe28Kr2c3bWgSuMykm/hlMDG8nuNMEwpNsHgafnalAfaBz2dyWDFSaVdKSBJtCYhgf9ZK+EUJ2A4X5YF4FLlwTXy5Ssl0riFhhzmF1CG4rtwC0+beAksHFyw0r/3cI+sXFTJQ2/ZrENpQsT+wJQKkH+xrz9vR4m2jLy+1AAAAABJRU5ErkJggg=="); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABIUExURUdwTM8KCsgKCvoSEs4KCuEODs0KCvYREeQODvgREfAREfwTE+0QEM0KCssKCtgNDfkREcYJCekQENoNDeEPD9QMDO4REcwLCzCQsa8AAAASdFJOUwBNCZHQ6PT+HHrPLLt7sWTai54U8UkAAABlSURBVEjH7dE3EsAgDERRcjA44XT/mxoaqBCN3e2bUfcbSYwBAAAAAMBvgpdhXLloM+83K8luspUnu7tKjujW1Ggq1GcTiU4dje5n/GoM73fLU6jZ5CH3KNkimBODQ3NldvHBW1/wrwbbN+n4uQAAAABJRU5ErkJggg=="); } }

@keyframes blink { 0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; } }

.controls { display: flex; flex-wrap: wrap; justify-content: space-between; width: 330px; height: 110px; position: absolute; top: 134px; left: -100px; right: -100px; margin: 0 auto; transform: scale(0.7); transform-origin: top center; }

.control { cursor: pointer; box-sizing: border-box; overflow: hidden; position: relative; margin: 0 auto; z-index: 2; width: 110px; height: 110px; border-radius: 50%; border: 3px solid #b0c80c; background-color: var(--paper-card-background-color); }

.control:active { opacity: .8; }

.__dark .control { border: 4px solid #000; background: linear-gradient(to bottom, #3c4042 0%, #141c22 100%); }

.__dark .control { box-shadow: inset 0 2px 1px 0 #5d5d5d; }

.__offline .control { opacity: .4; pointer-events: none; }

.control.__inprogress { pointer-events: none; }

.control.__inprogress .control-icon { animation: blink 1.2s linear infinite; }

.control .control-icon { content: ''; position: absolute; display: block; top: 0; bottom: 0; left: 0; right: 0; background-size: 60px auto !important; background-position: center !important; }

.control-left, .control-right { width: 90px; height: 90px; top: 10px; }

.control-icon-arm .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTK7HCa7ICa/JCq/ICa7HCLDKCbHKC6/ICa/ICa/ICa7ICq7ICa/ICmoptxgAAAANdFJOUwBp7lmrOCEO2JmFSMLYESkfAAABbklEQVRIx2NgoD0o9Lh7t0WcsLqQu2DgSkhd5V0ocMevjlUXpvBSAF6Fm+7CgTZeA+8igQ14FCaBFHSZbl4BotXwKPQFyjeDGBZAxhXc6rhB0gUgFrsvXrt5gLIOECYLkHkAp8Lcu3dvFECY7L13717FqXDt3bu3Yey9d+/ewqnw7N27DTA2x927d3AqBEbLAhibCxg5uNSxAz1gAOMwAzkFOBSyAeWAMcw6c2YAJJIS8CtkvHtXgN4K2VetWpVAjEIoGFkKWV3AwBGkUMTFB6jQBXsaZ4ZkvpsghXMhbIHBqbAF4hkPQgqvwILHl4DC26zGlnfvTjYO2EtA4S02cMF3KWEtAYWXAmxB1GVWgp5p5wSREyoIKrwCKkxuFPgSDkcBYCGpxkhEgKsCaYNYIhTeKJh7E2Q9QYV3HSraWe4So/AiW4IsUQovBcBrG/wK7youukucQgQYVgoNsBePuujqLuEo7WOU0MBRmjZeAK5yEJ15qkPkAAAAAElFTkSuQmCC") no-repeat center; }

.__dark .control-icon-arm .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAnUExURUdwTB8/Vx49VClScCVJYxw4Txk0SidPaxgzRyNGYCJDXCZMZytVc9BpXXIAAAAMdFJOUwBpVu+rOSHZDpmFwibH4xAAAAFkSURBVEjH5da9S8NAGAbwVnrx1CWDg4NDqYgIXVTslKFCpIIZgrjpEHB1EOlQpEMEoau4FToIDkLo4OLmYhIJrc8f5V2v0VK8j6Ui+gy5F+6Xg3tDLikUZp/rBtBc0btjjLKvczcY50DtSDuHma+Ea/jMtnJBTES15BkHV+tHj3ysKaDH5i95scGKVO7m+HTIK8pvKUvhEputi7LEyicpPGddCUVJWZ/epLAPxHldBYZS+AJc5PU88C6FDnCf14tAInN0cqe8A6EEWuJxkG7XFw8pUMMiYP80pFEUBSZwnP8FiTvKHofL7iGDri99EVgGHPZEbf9O2BSbaehgmrfH08CYVDaBu4pf1cCh5fAhCfoamIilYqLdTGuBX287WpjywyQLPX0fbXZI1ooGDd9lY/nUAGZhb0DbBhD1TqsEE/hqBatGMPGJYwSx9QAz+JU/Bb//dlFn2iWS0/5kZyrPM/15+QB3AOmJ3wTnUgAAAABJRU5ErkJggg==") no-repeat center; }

.__arm .control-icon-arm .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAwUExURUdwTP///////////////////////////////////////////////////////////0Q+7AIAAAAPdFJOUwDtaVoPiJh4rNohw/hJNLgkhVEAAAFDSURBVEjH7dUxS8NAGAbg00aUlhYcXUxHNyO4e7uO/gBdXeI/0DEiIoIKcdFNrEt/QV2creAoiLsuh1itBl7fS7RKyd1FcFDsB7n7Qh7uLl9yiRC/Krxi7HgDyf6s211DR7Licqd4j0W7K7U/YPfICqfRi0mbG/50ULYh77XYu7la1v2uBR7yeksnM0wezW60d9k7Y4nMcw8RrmbpPNMlI5wDntmVJQ8fODfCbeCFXaXJZg14MEKOss4u1OtcADomV+a6grSYbMeAVxOsEd6mxbxIK6BMsEoohccFdKUe1wEr+qk0C8AQadmdsJS9EoETnsQ7wER84J5ajAB1IX4C1jYJo2hLw6mIJ0l0mb9fstt40jDM8voADuC3YMdrNGQRqLi1q+0CECqOfRSBX+J/wiD/N+33OyXzPxV3433REn8r3gDnYnLToAqL/AAAAABJRU5ErkJggg==") no-repeat center; }

.__dark .__arm .control-icon-arm .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5CAMAAACWNFwNAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABFUExURUdwTC7Q+TPN9Cqs+VPP8T3X+jnV+Sqt9ymt9Siu/TW36Smu+Cu5+S/J+i7O+i/A7izP+EXJ8E/Y9iy/+S2v5kO+61DG7in4Uz0AAAAUdFJOUwCg0Sj3rsI+GQ38NE1yi+mx8eFeChy9HgAAAaBJREFUWMPtl9mSgyAQRQcb2dGowP9/6rC0mkymJgF9mZT3xWiK44W+LH59XXqWFKC5MVyDkCfghLa3bnTOqbEjBo4ipSYJtkp19hgS7D0uI5lpJ0og7lmTFc28m3NnEnee8j54r3ZiU6/FgO19mBkZhp5NfiW2jKPkWI8wDzwmMKbR9NNaGWgwiB0OjG92xDKj6YZOG4U8ndsWgDQT5rHaoiiJ8XPxJw1eF3xP9ShClxtSi7wRyVh6T2qjw1UxqMsE7NZCoMXqssilGOnFZsuTzNDZuipvqgCWEIbcY0ykzzMEWBmLRuAi90K4Kd1hnChvA5q7hMd+xsI0AsUOLIO2zZDDDlMg1bZIEHHUoTQzpVMiqolSOvPDDiVobViOkNEaZBswbiWYFIgSUIDxBwC/YcWhYq5I2424CCQNugA1SXfbPxUrjnjYS3zPC5B3j49FK5BdwAt4AT8FGEKg5CygYpwv1i76LKDzA08yP562A9MnRZRy5wF/0wX850D5DjCQ9/fleNhXLw3SmnO7sPGI9Lfmui8+AfyF4Iyv+8/QN5kuax1JidTjAAAAAElFTkSuQmCC") no-repeat center; }

.__arm .control-icon-arm.control { border: 3px solid #b0c80c; background-color: var(--paper-card-background-color); background-color: #b0c80c; }

.__arm .control-icon-arm.control:active { opacity: .8; }

.__dark .__arm .control-icon-arm.control { border: 4px solid #000; background: linear-gradient(to bottom, #3c4042 0%, #141c22 100%); }

.__dark .__arm .control-icon-arm.control { box-shadow: inset 0 2px 1px 0 #6ecaf1, inset 0 0 0 6px #2bafe5; }

.control-icon-ign .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA6BAMAAADVUMOiAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAwUExURUdwTK/ICa7JCa7KB6/HCa/HCq/HCbHGDq/ICa7GAK/ICa7ICa/ICa/HCq/ICa/ICjy79wIAAAAPdFJOUwC5VCDfd2cRQAXu0J4uib3vzUYAAAHySURBVEjH5ZW/S8NAFMev1v4SLRVHhda6dCsYJxcL7dIpUzah/Q/sUCg6FcHFpXEScXFQpIPUVRzazaXQzuLgn6BURGLbM+8ul9yPRF1ExLfcS/LJ5ft+3AtCP2ozi7wNg8Eo5q35T8CYpmnrwBRtRzM/z2UcwOtvJP2XwAPDMLYBvDDAakFcBIuWCgJ3JPA1qMkkDlvyt+NLZMkzoIgSuyhtO4/STt2RGy6xDNt+InHYBhuNQ8a9QO32wHsXwFkMoC7FMCBulQdDMlj2dFwC0F/pZ5zsiSBsc0rdMQC6IzYugURixbkYUnAK4LEEgsQwu7ihII1KF8Ey1e29BY9I6tN4ahgdQWKeL47upNbV40mMea+dl0punvJKJ8zLVafF3BJugcSWAvYAnBNu2R9JdBUwhfgQmcSIwtGzEZIlhuFUpwWwQEEuPWXfoYHPKDjxEs765f4L0GrYVlPjeVJ2BGurmfQHe3IRgsAmCndwkMblWxe1THSEA0G3qUlbV2SwwIExFugbd3KFyiSd87vhBl33rzV6uCLLQocFPfDvHoRO6OKMgGYU+/ejNKUsc1MFqz5zbyyUz+6mrvorSZKgk1gF5QEIUbRbKvgsz1KoyF1HBZXZC/JWsQqOlPFcx1bFB+wpYCKbywq2htB+NmeiP2EfO/MhTIfIU+UAAAAASUVORK5CYII=") no-repeat center; }

.__dark .control-icon-ign .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAAA5CAMAAABEZFZVAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABUUExURUdwTCVJYyNGYSE9UxgwRCJEXSpUciZGYyNEXRo0SClSbidQbChRbSdOahs2Sx8+Vh47Uho0SB06UChQbBw2TBo1SRo1SSdPaypVciZMaCtVcydOajPwxC0AAAAadFJOUwCmQgmJM+4R/v16ZuK2ZfxVyuLTHHalw/aSFFCpSQAAAftJREFUWMPtl9uWgyAMRUfwVvEuagv//5+jlWikErQzD7Nm9bxVXNuEnAT69fVR6FD/Fi11qHmLFqtjdR8aqTx+6g6U2Gj8iVEE0JLfsF3572k8WdQDTSagN7r0ZlQB7baqvcoLU+WWDq/BegqmVBr5ADWaNKUNe0RG+fLbM0fqpgo2WGXBcg4r2uRaUi5oK60CqOQLTAnznlxjpgrRzp980gZcxZfQhu0ZUYhAAS042vQMtiM9KETdzMLjPSNpsQmNt/hps27lrJRtNEbSILRQ70xX7joPZS4pGoQWWbYxhTC0HE9GggahNfbCgGlabrRi3te5BVNnaKV+6Yi+nAR1rq0y3Cc5Q5PtQYNVk+AjyM+1syUhtEF51FtlUITXWOqjPU4cdyY03vpgqrCKSoSWMKPcSRv3tC6b1FmhWc3d67O04sBv2R4WEbvX+WnMDMnFmgm1eydocK4sZho0Qcv9tN1ZWpIu6U7TnkuyUldpTAjxUEeTnDe0345qunWtnWioL7m3sCb7/kVvawXYSQGm8cJOVLZX+nRuHnylGa1EvSNEUSds0u0S7bWXVlOHv4xRopHDHGJqEygZfTWJ1jmcOOcR2wbtndNXE3aHRJ0dhWjFydu4qJ3mQDThvcUtWxK5zYFoJ66bM24kOmqjZVeu0g6tr/DP3/k/pG8AurQkYXK9UgAAAABJRU5ErkJggg==") no-repeat center; }

.__smoke .control-icon-ign .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA6CAMAAAAQoC6jAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA2UExURUdwTP///////////////////////////////////////////////////////////////////4ZSzFsAAAARdFJOUwBWCYS9QC/ud5ljDo/1IN6m5n8dKQAAAX5JREFUWMPt1tkSgyAMBVBREFcs//+zVRQhVQhBHtqZ3kexZ7AsSVX9cFgfTB7Y62D+4FeDQtoMKNiKPSfMhY3zZjvYpc+0s795XYayvAiY54XBTC8IUj3BjrzORWFnFN2bdCS8JntNYa977gn/khsee4LrxbtaMU8iHlvWsSXDa+49ZQYNOG7H/KlXVdKBOp57b2y2dOoEeSoYmN/+id6f1iSCnx6rAagFWAUcXL3W9wY7SQtOYMooePX0rADovnnbp3I79APJWx8CUI9gVdD1uHrrYxP7vE26WmLeR1jS2U339Fn52jKetzXnIp7bN5Us4nlVZ31/Np3fIw+CMrCxCd6xLeMgxUsBgTdhGwwHaR4OEr07EJQAqnezykcTmemFwKPs0j3tavsCQHOF85HseWe5HriErUiOB+u+gs1Njufuw9uene65GxvzIs2JUEq1l5qS75lJjZeql+8BcCrgAVAU8HxQ4l6Pej7YpHh1h2Rb2P0lluIVyLd7z/MGm36bJ6uXegoAAAAASUVORK5CYII=") no-repeat center; }

.__dark .__smoke .control-icon-ign .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAAA5CAMAAABEZFZVAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAB4UExURUdwTCis9hPn+iqt+QCx/ymt+Syx+Cmr/yiq/yqv9Sqv+Squ9zK9+Suv+Bfc9mjW9STK+iPY+1LJ+mzY9iHP+wzz/yXM+z+++VPP8TTC717R+E7O+Rrp/EzV9EHF+krN9DLf9kjB6y2v5kG96yq06E3F7jKz6CLJ7x0w2R4AAAAidFJOUwAd9zQBKWgFDBVVPYBK/u+ZtITmpPuPivXlwqjX5m/O+fl1AP20AAADL0lEQVRYw72Y2ZaiMBCGDSFkIwq2bSso9hCN7/+GUwkJDS0I6Jz5r1w4H0VqZ7X6H4opZcOiNF5MowwRPCSCOF1MY2S/ywe1J2wxjcvTeljfki+nqWM9rIP6pzSBWle1mnDpNC2mjKNGnNE3nzSmnKjESUj0nBYzfL45aQ8xN6+N8wLA5P7T60TY82dlSAp737T0tFuZNoYoxDwsurrb6A81YRsY5w6FqCzQMkXaQ+rDEjJ1bs5fNIYgDjSIWkg358CFMOuvxmHyxzbpHcgZWwjjRCphlQSazhL3g5LwwAthMou8v6IQGVHrQaWmYJS2lcbCdutrUKD5r3pTiewprAlr/7uzbD0SurXefCVPYZZFZJIh5mHYP8grMCiMRKWnz7PkzkYi34FB2APrbs6K29QT4fJZMFvwuY2ZtrwzfLrD30BjJLdOW2BZzBCWIMJDpjJ8qT0N5/UY6gGGbX+gXJyschm6BcO7QJN5PROWKuJoKL1brbPQLShJZ9B+wZL9zhpHfR6bE/iwoSFhLE0QIvK5sN36u4KDY9jTvoWvSk3VNudUiDSfhtUNDMwRkuBQsaDE0NDtrBuuEeg+G1abe77Lsp2/v84x67qhn5WTMNDa3t/noL7I1g1fIa+XwPrXXELTpigx9azQGIW5kPBpj8TxTViH1jRPo7U25kVYbQ49mvlTFMXl+CKsO1A42iEVKrm8CnugCYJU/iqsvv2mPeTpI+y6hIbzp7BoHGYOjzSSW8d2YPuZsCEaRVvrWLMcNkiDQRx6fGEWw7rxxuTR2K9uSeBEgHULYd1cYGR78VOenbUAtxRW6x8adFRZbUNlB5wq0mWwTg3pTw5uj8FiBsxoGGT9JKsLyXp7Vdtg7SSSzrBMFyUoDLJ4ZMWBSWQOrNalkG1fSAl9CwY0zEPP2ggUz4CNTyWO5vspHBufgm1SsX/iTV0S1rQUc/sa3Ax7sEpW0W1chz2C+cp9/JBDW2sfhpGqtuOqAMFx5T6hgW0GArfqwLgdDkcFwz6ElbtieG+DASrSTjcLs8PeU9lFxF0zuFNSnpZlYVUmZGJ/j+P57wYIYvQfvrd44T3FavUXwksnSh3G8YgAAAAASUVORK5CYII=") no-repeat center; }

.__smoke .control-icon-ign.control { border: 3px solid #b0c80c; background-color: var(--paper-card-background-color); background-color: #b0c80c; }

.__smoke .control-icon-ign.control:active { opacity: .8; }

.__dark .__smoke .control-icon-ign.control { border: 4px solid #000; background: linear-gradient(to bottom, #3c4042 0%, #141c22 100%); }

.__dark .__smoke .control-icon-ign.control { box-shadow: inset 0 2px 1px 0 #6ecaf1, inset 0 0 0 6px #2bafe5; }

.control-icon-out .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA6CAMAAAAQoC6jAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAzUExURUdwTK/ICa/ICa/ICa/ICa/ICa/ICq/ICa7JDK/ICavGAK/ICa/ICa/ICa/ICbDIB6/ICiZTdo4AAAAQdFJOUwBZgKdGMvvvE9IHlGvivyE3M9FuAAACJElEQVRYw+1XSZLDIAxkNzv8/7XjhN04jnBySdXoNFPlNN1CagmE/uMnQzNLjDHEMvkFtEC8iDWU4Z/BMR+P4ay+DcdVPAuH78FJE1+FD9+jl2Jj69nbup97Qwgx1HWQdhWvXu3WXWwgjTZZ01v4bcc7xRlSiBWOsoijtZRJAdYkkxcLJZmrryPBBZ7S68CNgzNeV280Oj0lxEAF5+87vCCGfwsiUDSZz6ePPp41eJi5pOOVHgkOFJ8nQCnm09n0czWnxcCvuFcTxJTUnJcN4DxSTASLS6jrzy4Vp6Mlx4Sq1tVC0erbHqo50aE7sk9IYvYatTeynUhfpnDvEU1fupfaSfKE/R5QtdzQCzykE/P37Zd0BvQSUagE4oCVOBx8NgW87KW8B4yDEvMSDwzYSz5B9LWUoZKP342TuZkY+FL8YQaNgKICgsvmqVHQQwpqVOrgwk6t56oxHHKIRwcCtJ4c3YsdAMloDnjZvmzpjtzSdNm+CgQfvJUhPrhsNli6MKNUK1+VhHHfrtlEqB22IUXyJTtcdTGVmbOVIVUoisfx4bCL4CfbsK0QrFl87GxyyvrelMFFeAaHVeS8KLhbXUWqpGhOysKWZWll6azrYXcj7V7urJxt4XSkLdTSqjqz1hbOcSV2+/C0dh+ooo3AVTykuZuGSftL3HlZyIsxevM9hd35m+L+W0rj+bGykc+ekNz0mI4yjT6OwKyhlBqCOfqPX4w/xWhEmJODQbYAAAAASUVORK5CYII=") no-repeat center; }

.__dark .control-icon-out .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAA5CAMAAAB59jczAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABgUExURUdwTCpUchkyRiJFXSRHYCRIYhw3TB49VB89UxxFWilTcR5BVipUcSlScClTcBo1SRw4TRs0SypVcxkyRRozSCpUchw5TylRbihPbBkxRRkyRho0SCFCWytVcyhPbCFBWaejGWEAAAAddFJOUwDqZy1P/v08FATYC6f0kZzsIXp/Wr+yacvJ2ovbjMaJ2wAAAp9JREFUWMPtl2mPpCAQhhEVxfG+jxb+/79ctRBB2xmwN5tsMvWpQ2Ye3zopEPq1/9e+AlxN2TRhL/wbuKIaCOHc933OCRmz4EOeNxDO5sOYT0b89ZwXDETFCSjP66fhy97wgDkUT4Du6M93xnLvgcf5IdBp0rIs09g5mARbA4nEpS6ViS+j/ZhXtgp3XnfKrLczuZXKcAfGsqanXSgtd6RFadJWxLA78qRICkQ8R/MWwpDlREloNr/ogQcky4wLUfisAF1/ZkpdC6Rv6ncFPqdIlTirIpEH32ytJEYKoFjDoIpEsY1IDN8PThJ1kWGyHZlFst3+tkEniSeRKYg0mUOhf06LkHgSecnerdXQK9s/h0FdtUO+jwxGxnbCAZRhsx1NBsQJmmVBD/k2vfWJu05yMixN3W0HvXEYl26hMbsbZtEi091+JQbEl8w0jW+I/eo3hd8GnQhlUShV9xaIEPSN+zNR+3T6BtiIiokuZWtCpOkt0JzoKF6/USmB5l6fP91oQEcCKTPNDBCO+drrGmXbuDBDDaonPY2ARCe6+kDpjbtQtnBximOtd0JqMimgLTx9tkqr7gfKD4Fs9Wk575fqfl5BGI22qk4bzzDJ+gC50EAv7f6NzS5ryMVAZaoj8M1d1TNQlTHT+j6yzbaI0WSOOlkxQS8gnn8Z9N+KhG7gq7LC6ai+pKzJLvLZRuIeyXld6cJL6Jf+LEZmEcXNVdF5pP52EXTMtxQq/J55dq0OivfV12rJD0Tv+XlNz7s5F5VZWj4S5M49VsfSHeJj17cELshEMpc7tcIYV9moPEWsgUs9R9qdyrV7NukevBVoGN++FSIXPTMvestLSvr40UW7K9MpP3jFbdWSqlAn9ij63EJveR3FcVp6Lvq1f2V/AOUWegqMuCJUAAAAAElFTkSuQmCC") no-repeat center; }

.__out .control-icon-out .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA6CAMAAAAQoC6jAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA/UExURUdwTP///////////////////////////////////////////////////////////////////////////////0qNmhgAAAAUdFJOUwAE1xVQ5WDxPYD7DMq9n2+RLqshtP26agAAAkhJREFUWMPtV9tyhCAMBQQRRLn5/99aL9zRLti+dKZ52G1nlkNykpwEAP7tT9o8jUytislp+AU0ywTfdjs/NqSmn8FhsZWG5PwabqrhDiPjS+rW7ckW+wJPo+3ZKO4PlybHlz3FTBmSQMpePB4YUxrGlKOXiME/WuYUB8ie1Aw+OBNKmXk3IXPO846SXNyRGJZOHHLuc9LcOKPDS1K5bghGdBfA2hcwjz5ByzPONO0Kml33K5A6uKUuAuwKvK1DruvT85aXaXVdpDsYnKrjKKWFtrO4VNFYVyi44oU2KM9QH/YqkbnIq589SeCZP3oyOOiRGRG7miLDRqfbS5W5B1NXixziSp60RjAA5PmnaKVw7xFoHtULDUfvnNifAVHI8SOiOIKGF4mf2+9i7JRkuD7jAUAaK3FLL75DFHMZSgvgnKUomycz6ANMQr5DDHjNIZcXL/kIDXjNSVkKfc8BOYyS21g2quh6moescw0RrWJDvCe24DA0r2ltvUIccAHIusUBiEy+pO82Pwe75ctDTGlpiwlok0rY3CGw7rcCBn8RBsc/05FwPqfl2TSlIEvZovv2BtP9TncPKT8vzrFsiYT5JnJUqKUdDkYWj7E7VKzb45Y8QZ+D9qvI/T7kF4f2VSSExNebspB+0+vZ38N6mGSk3Lv7FkQcF04WF+phFFXLNCN6UdiRiWFyHNmKblqwI+o4RHnxvbfcm5fF8M0Y1eCV4ftJTyV8+5SCY/1YIez90+ykUqWYZMUQ/Ngslmo1+/sWa/Bvf9G+AEUAVdCHNzcqAAAAAElFTkSuQmCC") no-repeat center; }

.__dark .__out .control-icon-out .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAA5CAMAAAB59jczAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAACNUExURUdwTCmt/ymt+Smt9yms+Cmt9Smt9wCt/yms/yir/ymv+Cqw+Smu81bK7yms+Sqx+S63+VnN+TO9+WbU9DTE+ijR+x/h+w3y/SHX+yzL+k3H8UvF+FnN9BHw/mDU+SLc/DG/7TjX9Bju/CHX9RTs/Rrk/EfA7S2v5i+x5zW16ErD7T276iLI7ym66hfe97qCvDIAAAAndFJOUwAQNkEnGiABBApLUxX9Lltkp23teJrM/6yE4IjT9b287vbp9N3X9SqYwL8AAAR8SURBVFjD3VjZdqM6EAySEIsAsTpstidews7/f960FjzkXJ8LTuZp+iknNkW1uru65Le3fyYsEX8Ly3YMzzQphOkZjm39GM6jAcIuD+OQMxcH1PsJqGUbZoDD7HA7vos4Xg557CJqfBfTdkzEsvv7PI5TI2Kaxvn9lvPvYjpe4GaXeWybLzHOxzMPTOdlSAsIprd5av4b7XzJMNB8NWPq5sdxjbP6e5oPjLwGaRuE3WcN0g5970P0/dAt/xovcfAKpOUQftMEu96vT1XMOQ+rqPYHidm20yV9AdJyKLuPGi85QcMERAbCYVRqzEmw3Fse23QPo8rXP4WYwKgYpgu9De2OWPTZaUhOd1bcNlCuAZMKEwMesym+hMSxoOcpistO1eeATXvnIaazfKRPYuQJGha8A573bDlHAa8lZHfN0K68Ied7qxiGgRoOm/Jr85ESZ+kDBdmKvPdQDDKZ85AsDSIpNp0iKZNgpXrneQ9JQVHm5FdIt4ek2DxIipfGn5LkR0i3T9IhhaTYn5ZzVxSb9kFS1C7qJMkcGZtJG/ggKSaitkK8bWj3q6zUh2hqfbCslN/6cDfLbZvsqilC/4F6U4JYLgUDSHJEhJJDf6KsbdYn8b9Ji8dbPw1MmBFQ7zQ7X7VCXM95EYKSI2IS/kuW74w2EVGukmYEF7lU73nRtLaZZ1Dy2+FcwKe1/N4dexuI+hiHE6bx8aHe65hGEN2Momw5yI3+8VyZTR8hj1SfbfMsOl98GsuW7DndQDQ1YkEcDz2HBEBsgjzJuenTrY40mXp1TGz7OaQCtEy2vHoXYuPDMFhPITXgKpn9HN+eQLYL4Nt+jutXS8hfXxD7yJWAFmXTvnNcap0FjnQVlJdfkvbDQAq3rWvtb9bawKWaBSwlYCnAI+RxiEkIVD8mm/1o6JnRnWvT8GuPL+QNfJZvrjdnBuZ6LQE2Kb6WGvTLUeKjBWVTzkB7hiVt6zHmoISDWlfDQRyH5aBMcverTe2BdGotz0IfVXKwZZOo7gVmV7reSuiTbX2EIy86TRIU2wPhaMEGRMxlVQ082w9mwj5E2bgkbe3YM7La7bWAPQPtKfEQ9czArcBQ9DEFVQ+van727BmxC+UO6S6wXE0X8JQFBYMauFHpF9QAEzNpod+zsBeSzXTjAWXRwyYLTISrlBJtYmAX7dnXgmQ6KEt3C8Ve+WORhTEXe0e7IpDJfV7K9nCkWmW8FOCjVnZJ+B4cK9/W9rVr7vR7junW2iyB50biwiFoyqsIeP3jYrM42evGpQ3pFs+dh1jkDpckEmCeaW/e/jExu8IgoYYEz3285wVnjMGePcAy0zOUpOgV2wz+i9fDoomj2KlHsWeX1dhKI/iStbcM4p6GlXy309SuNkPNg29cP3BVDk93ITS9S14FFOXxAvDcWnJWi6YHb46+cedSvQc+voRbTLegDb2fgNf/9l1TYAZuHNUl3I7ELSmpT6kYSucn92HHgy50WZxWaaxcmfHDS7ulfgOghFDocgOm52/9TGHbahL/jZ9dfgOqncd2gC9OCAAAAABJRU5ErkJggg==") no-repeat center; }

.__out .control-icon-out.control { border: 3px solid #b0c80c; background-color: var(--paper-card-background-color); background-color: #b0c80c; }

.__out .control-icon-out.control:active { opacity: .8; }

.__dark .__out .control-icon-out.control { border: 4px solid #000; background: linear-gradient(to bottom, #3c4042 0%, #141c22 100%); }

.__dark .__out .control-icon-out.control { box-shadow: inset 0 2px 1px 0 #6ecaf1, inset 0 0 0 6px #2bafe5; }

.control-icon-webasto .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAwUExURUdwTK/ICarHAK/ICa/ICa/ICa/IB67JCa/ICa/ICa/ICa7IDq/ICa/ICa/HCq/IClNEJvYAAAAPdFJOUwD1B6mQUSA6eOPAEdFjL2yk3eAAAAI4SURBVEjHvZbNSiNBEIDb/I1r/AEP8bBgAt5E0Dcw7Au4B++J4F19AvMGgYX1kkPyBtFjToovEN9gzRPIkPUnQS2nqrtqMtM9zcDC1iFUMl93/ddEqf8ghR85wZ1BTvDwJ2unXq4YNoxW+e0Fu3PWRps+bg3+Gq06vPOBE3hjH+DAw1XHAv7xgkVg05U6+Ey3AKZy5LvHch9gJkc+ssESRHJO6hDgPRs8QZBiCFB7yASP8HFN7q5luljHxxTNCmrz7LKQYFcskdZxteEBpQSlF33dIG3bAe42lfqmwbnc+N5wtGGUlVsNYrSrWms6MhgdfjJgzUQN8GnXLow+LkFsB1qzch61QCMGMdqxeJGQFarcGYPbVGuUX3bXdCRqitak6jkFjulsEWLbVW17muTK0U9vUhkd94SUmdXYELZNrU3cZa0lU07ODUz3cL27pLQT4D5o2zcC3rHH1wmQ8hI+Ljj5qnQ4obJvhHsaAJBoJ3ZL6gRGgzpiEDfQmvbHGiq0HUjc53rAXpKgaYEB7oe41bD26W0x5HqVGMROXMXkOuYUPS9wOHjVctpFKV47DqdJlbXX9CE7tl6PwcCyrNSePG3FwQTP9mxV+gyW4vSUm45xvWCwMOaEq2rmlugoU7l0w6bDeVSUFMcILMiI27nQdwxV0rZJb9e7GvGintZu3EtnYYs+yJC/+t5FLY502bWcFuTpSoZ3du0DL/n9uw5b3vfqsRKwk+/VHkxz/gco93KClfY//Hf5AuvDOeBpTjHeAAAAAElFTkSuQmCC") no-repeat center; }

.__dark .control-icon-webasto .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAA5CAMAAAB59jczAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABIUExURUdwTB47Uh89VCpTcSBCWhw5TyRHYh46USFDWyA6UCpUch8+VSpUchw4TRw5TilSbx48Uhw5Tx8+VSdOaiJEXhkzRytVcyhPbDoWIOQAAAAWdFJOUwARQOsvW/0ecAfQULfOq4jmgPed05dUEBw8AAACI0lEQVRYw+1X25KDIAxVQMFbtdqG///TtUAxJs5IsbMPO5vHtDnNSU5CWhR/xrrmy4Bm+DJgNRvq0vdrgKAp4NRdABQztMRVDvJCYfUE0BPfYPt8wGawAMve97TU84ndVkAS39UAt/yurNEkvlzLwCqbbC4a4EE4A9gyE9FFr/FIPcplDSYPMEQDID0/vWfKS/IWAGGK8mvCj9hnlhTfKYKNJLu3qxYZiHeINmnm+4i38F9+bIhRQBui/UCTnV9e2iLEOvBekKtKXw1mXzJns+dtkCuVt55BsODVfOICeRJ5lwOAPkK0TpSNxKUQqWOijhBhdu6R531SxJcGfckrggjDS+clTtJWCetwk4qiiJ73rmGP8+3lFFP7Qko45W31GeKA9bwA4+38PfKcvWBvUdfdIe1QN1zKs61W7ee4h8PmFEomI5q9eA+SpOOUjBiGdmSQobnxA5HKOsxx07IkvfrjB2ejren+0kxB4YEIBTm/BFq6rARFfG+HJYn0fvL842KOC+nppDzbLRtaonOJv6lStqOk6ZDuRMS13WPak4CSbAreHbkprU08+ZAGA6ldd2LpjNSp78w2e4IJH91pS/qZW7ZsINCAxx37yZUbF4E+6FfevVORkiHeueeyZ4nEESWkMhHVnvSWZP5F3wPRb3MtRZeSLHkhxmzAl6gFF3574X+RYulUlzivObJ0uuxrPkha8w3SF981I8svI3aq+LdftB+wD1ZmezEQbwAAAABJRU5ErkJggg==") no-repeat center; }

.__webasto .control-icon-webasto .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5CAMAAACWNFwNAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA5UExURUdwTP///////////////////////////////////////////////////////////////////////308lk0AAAASdFJOUwBSn9EiNI4I+fEU4sGxYXxBb4JlWzgAAAIbSURBVFjD3VfbkqwgDFRE7t7y/x971kGREMbB7FSdquUxVbbpdCeErvsbRyv9XbwpfDfBCXoSk4qPJ8AQxtL3bLwFgDB23rCrOgNASU8HGLh4o/kBXEgRYOIK7IEC7klPbEGAUJZ70kzK/QuvSGfaQ8Zx8JyPgLbyk5kDqOA4axYMMcTh/CrW64hM9jO2/SJBMJIGrXxsGZsAM1lCigVOj6STWjf7y9KamcjskQieNsliZmycfoLkkpHOo4Nua45oEgf4HMYb8phqk1Zjf2BVBTwj3ae+WAvAQ1Uc/mhvuZeonuGp6lArxNsTrkaTBDAS7FHMt0yXpabypSqqItzfLZGO19SHGWmHSIuG8Xf0/UwBY09L28pZIIc4yvlQGpXxztwef6co4CHYkkVuRrcui1VJcSB9fgPoSodsb1PUSRjbNWV4OKQitCim+e1U9GXfO08ArcbTcmlR+SI9GoI4otFtbi+CkTqEmvHs3vWzr/MLIzUV8Y7K2+rTTSUNSVGHuirRjNuji0l2NWFE1qih5QIg1SqEUVfFW65mPdBP8QRMLFdoWoulp7ko2ir7fxr39ouhqqV9Ldf68caw1dTnrK6i6Ak0rzjPibhYo1msz8p61nNipm2/8bfCc+xYNDmdebDN1FfNudbmK/M10VM1t4bZcjfHbHlVrGxFImBfmZWNC2aVsqoN36375hnZz7t3SXv3XUApu/9y/gFwdVBhatIP0gAAAABJRU5ErkJggg==") no-repeat center; }

.__dark .__webasto .control-icon-webasto .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAA5CAMAAAB59jczAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAACEUExURUdwTCqq/yqt+Smv+imt9imt9ier/wD//yOj/ySt/ymt+Cmu+Syz+Sms9ymt+Cmt9iy2+TXD+ivS+yHl+zLX807N8DHB+hzp+yPY+zrO+GHS8iHf/EvG9EvJ+CvH+mXW9l3W+j+760S/7UvE8BvW9DXT+EXZ+C2v5jGz6Di46UbB7CrE7gjniWoAAAAndFJOUwAKKTQUHA4BAwYiLlNDSjtgeZLZ/fpq7K+k9MPEkoPdr/fr2fm408hOVk8AAAO1SURBVFjDxVjpeqsgEA0KCO5m0SzN1jZXNO//fncAF7CtWm++7/pz4hxnOXMYslrNeTzPW73y8ThCiL0UEBOXINvGGFseNsdBXjjUNDFE6fKoGXaz4hZQC5AEOeZLAWmQFbvMQSagH53WhC8GzAtxDEmfo4f8eLMNFyJCOGkhqmuM+z5wEp2e15iwZW0m8eZZVn8ibNQ12X9alt91Jdk/SwsRynD5LJciam8bkZOwKEvxJyZL+Ki9wX/XdcbTUZe71OeLc5b+eevP/VxGXdYHl/4+SNR4Q9r7xt+jyUmosDcL6AMham/Dn5Gw+chzn+D5/NHixf208S7L7dql0p87l/YjBcwRm01rxOFd5O5FiyiK1EeesrWmSsbtzeSMEi8Px5uye56nSEoDlLH7yOy8GXXCDYgX89Nnj9jkbSCWYnsJKJvF6lSJF3fWBmCTN3IfpimcQUolDfU5QCsU7E1EmTfhKFhbphl5K2moM4evrHDavKH/lWmCfntzxqS+fIcoitxBOPowTNUmngjSQ072qUZMZn2wEaU/oU5mBbkO0ESIijEVUIUBmQeI5fbgYpy8CSPuTYRH04bCPxUvQFkYScUQEvKmfvhh2LfpqJYzHGlSyyC5XbIm7whTJ3/vLfXaGSNQT2pJXhocvgQp7dg933vE/WghUUdqSV5EwvchooDmIJwcuu7UD3cUsdcBOcfY/SZIaC5wtuvOJOLDdMUk/vgaJNAAQXdaxMN41gYF5RxjJ79/CRIOCLln6B/ELhsdbYuCco6hCdUAsd5DmjBauiByNxhlDwnvVl8xid4GkPqk5U3X6ptLR4eQJm+Dvtp8VnnGWL7pniX8ceqQBWm5231FTvo+QAxJ+6bY3dwJzWXULJzqa9eE9tGInpyoGvYpPimPUS8EAlY6Bk2wuiM3P/kmTR7VMZ+UR7kbGoWrM5+pj1QmYqx2IJjR3dmdcXQxZAiBkgH7I8AXvVUh/3BLZq0VUMpLW7j6LIXF+ojkC9L7fuhgNOu85r0Q7GTWdr9gSLR8wXVB7Qkz91rdnW79lpYu6WZIfnOjgcJpDt6vreSjdsDF1JD8VEo1tWJ3bu8cIO46yOq47I6gp9ZUATgjharibckiqgbiDapoHO9MK8OcIfnxTISKmSsIlWlXx+kd4kehzOqrVTEKBwbk/Ju9dlDI/JhaKyxyD/+Qs+xtmPtWOFCHSn5k6aUaBgIjPjh4j5lLF9+p5UDYE4HI+hwsvlJ/z3pMMH/l/x+Mcc5e+4fKf3z+Al27tKUa0zBJAAAAAElFTkSuQmCC") no-repeat center; }

.__webasto .control-icon-webasto.control { border: 3px solid #b0c80c; background-color: var(--paper-card-background-color); background-color: #b0c80c; }

.__webasto .control-icon-webasto.control:active { opacity: .8; }

.__dark .__webasto .control-icon-webasto.control { border: 4px solid #000; background: linear-gradient(to bottom, #3c4042 0%, #141c22 100%); }

.__dark .__webasto .control-icon-webasto.control { box-shadow: inset 0 2px 1px 0 #6ecaf1, inset 0 0 0 6px #2bafe5; }

.control-icon-horn .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAtUExURUdwTK/ICa/ICa7JCK/HCa/HCbDICa/ICa3JC6/ICa7ICa/HCa/ICa/ICa/ICtkSnpQAAAAOdFJOUwBmmlOrdiTCDu+IPt2GMS7pjAAAAXtJREFUSMdjYBjMoO41kQrPEatwHpEKOd49I04hM7EKmYhV2EmsQjkiFXLMI1Jh+zsiFfq9e/eCGHXp74hT2DqPOIW7QOqwKWTbbAwH1pulPN+BwQMMdVvmvcMGMBSmvHtHlEK2eTgUTkBTmPOOSIV174izmvkdkQrZgUIvS1zgwEmlBrvCPKBQBapQ9xpsCu2ABjagh5g5lpiRe/fuEWZcSWIqjHv37hWWSD2HTeFbLOkiEznhmuFRyI2ssK5UUFAQmJSfC8KBcAJMUg9ZIZZQfqkGD7ZnBCLvAkSShaDC55BQZSSo8J0DJIAIK3yIUezhUAiNUaSCtG6KkpISUPVzJThQB6kUQC+ag7FE4U64Izdb4I1CRqDCA1gzO5pCDqwZGlsyw6kQmHDfoGWhCVgVgrKCAmrmLcCqkAco8+ZqKBQEgUqDAKwKWXEFOEZhfQ5d4VMcheFOdIUFOKsorMkMC9iDqtADd5USg6yuGl+ZnRy1CgouWjAMPQAAFoAqhV0tDd8AAAAASUVORK5CYII=") no-repeat center; }

.__dark .control-icon-horn .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5CAMAAACWNFwNAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABRUExURUdwTCFDWxgxQyA+VSpUch49VCpVcxo1SCpUchkwQyNFXh48Uh48UipUcSNEXxs1SydPaxkxRRs3SydOaipUcxkxRRw3TStVcyFAWSZNaSpTcKZZG8YAAAAXdFJOUwAK7oXuQs5nVc14WS2vHcO+l/6R3/2q9qLsgwAAAZRJREFUWMPt19tygyAQBuAgIh5QBA8Lvv+DNqk4TYwIa5lpL/Lfql8IspvN7fbJfwifJpoUrAHqpOCQGuwTgyQH4ClBtiQGZ0gLCnsHm4SghLSgsklBogykBIVcPWBpOKUtpAIJo5V2ywNYyphHGiUrX7JJm211kSvkmTHWmwVeEwSJNPtnThMCSWUBUoIz0guBDdYLgXK7Lz/KOI45DuzcAtvOv8miHMZosFlv6oOdtY0Ea4gteFFEVQqNr0/Sxnw4xRR86wWZuASSwgdSXdX8O/0KUn6QRrztoxcEa9a4U2OOonWmuvcvzf0793hnp0WxGP06GpVBMBgzx0wOCBAMjZhtMCAYFp6+UCDI8HxIoefld9zpr8uD1K7R2Kfjw49B0UUd7M6V79Muknt+UXpsvTojfnPPQRLZ3KLbl3DdFwG6BiuPN0at9TIgwM69SCkOrqkr45FrN1ZP2T7bPJMT1Bj+0wn22S4g/0e0oUIpCA4kxbmXd+jx73SNBdp7tM3Ru7ya3C6FDW1f7NMO5UXuk7/LFxyuYIMfUfNyAAAAAElFTkSuQmCC") no-repeat center; }

.toast { z-index: 3; position: absolute; left: 6px; right: 6px; top: 155px; background: rgba(0, 0, 0, 0.86); color: #fff; height: 42px; line-height: 42px; text-align: center; border-radius: 5px; pointer-events: none; transition: opacity .2s ease-in-out; opacity: 0; max-width: 300px; margin: 0 auto; }

.__dark .toast { background: rgba(255, 255, 255, 0.9); color: #444; }

.icon-btn { display: inline-block; text-align: center; cursor: pointer; width: 28px; height: 28px; --mdc-icon-size: 22px; }

.gsm-lvl { float: right; }

.handsfree { display: none; }

.__handsfree .handsfree { display: inline-block; }

.neutral { display: none; }

.__neutral .neutral { display: inline-block; }

.moving-ban { display: none; }

.__ban .moving-ban { display: inline-block; }

.wrapper { overflow: hidden; position: relative; height: 270px; padding: 20px 16px 0 16px; opacity: 0; transition: opacity .1s linear; font-size: 15px; line-height: 20px; color: #00aeef; }

.wrapper.__dark { color: #fff; }

.wrapper.__title { padding-top: 0 !important; }

.container { position: relative; margin: 0 auto; }
`;
        card.innerHTML = `<div class="wrapper">
    <div class="container">
        <div class="car">
            <div class="car-cnt">
                <div class="car-body"></div>
                <div class="car-door"></div>
                <div class="car-hood"></div>
                <div class="car-trunk"></div>
                <div class="car-frontlight-left"></div>
                <div class="car-frontlight-right"></div>
                <div class="car-smoke"></div>
                <div class="car-key"></div>
                <div class="car-hbrake"></div>
            </div>
            <div class="car-security">
                <div class="car-security-1"></div>
                <div class="car-security-2"></div>
                <div class="car-security-3"></div>
                <div class="car-security-4"></div>
                <div class="car-security-5"></div>
            </div>
            <div class="car-shock"></div>
            <div class="car-tilt"></div>
        </div>

        <div class="controls">
            <div class="control control-left">
                <div class="control-icon"></div>
            </div>
            <div class="control control-center">
                <div class="control-icon"></div>
            </div>
            <div class="control control-right">
                <div class="control-icon"></div>
            </div>
        </div>

        <div class="toast">Double tap for action</div>
    </div>

    <div class="info">
        <div class="info-i info-balance">
            <ha-icon icon="mdi:sim"></ha-icon>
            <span class="info-i-cnt"></span>
        </div>
        <div class="info-i info-battery">
            <ha-icon icon="mdi:car-battery"></ha-icon>
            <span class="info-i-cnt"></span>
        </div>
        <div class="info-i info-inner">
            <ha-icon icon="mdi:car"></ha-icon>
            <span class="info-i-cnt"></span>
        </div>
        <div class="info-i info-engine">
            <ha-icon icon="mdi:engine"></ha-icon>
            <span class="info-i-cnt"></span>
        </div>
        <div class="info-i info-gps">
            <ha-icon icon="mdi:satellite-variant"></ha-icon>
            <span class="info-i-cnt"></span>
        </div>
        <div class="info-i info-fuel">
            <ha-icon icon="mdi:fuel"></ha-icon>
            <span class="info-i-cnt"></span>
        </div>
    </div>

    <ha-icon class="gsm-lvl icon-btn" icon="mdi:signal-cellular-outline"></ha-icon>
    <ha-icon class="handsfree icon-btn" icon="mdi:hand-back-right"></ha-icon>
    <ha-icon class="neutral icon-btn" icon="mdi:alpha-n-circle-outline"></ha-icon>
    <ha-icon class="moving-ban icon-btn" icon="mdi:car-off"></ha-icon>
</div>
`;
        card.appendChild(style);
        this.appendChild(card);
        this.$wrapper = card.querySelector('.wrapper');
        this.$container = this.$wrapper.querySelector('.container');
        this.$car = this.$container.querySelector('.car-cnt');
        this.$security = this.$container.querySelector('.car-security');
        this.$controlLeft = this.$container.querySelector('.control-left');
        this.$controlCenter = this.$container.querySelector('.control-center');
        this.$controlRight = this.$container.querySelector('.control-right');
        this._info.balance.element = this.$wrapper.querySelector('.info-balance');
        this._info.battery.element = this.$wrapper.querySelector('.info-battery');
        this._info.ctemp.element = this.$wrapper.querySelector('.info-inner');
        this._info.etemp.element = this.$wrapper.querySelector('.info-engine');
        this._info.gps.element = this.$wrapper.querySelector('.info-gps');
        this._info.fuel.element = this.$wrapper.querySelector('.info-fuel');
        this._gsm_lvl.element = this.$wrapper.querySelector('.gsm-lvl');
        this._handsfree.element = this.$wrapper.querySelector('.handsfree');
        this._neutral.element = this.$wrapper.querySelector('.neutral');
        this._moving_ban.element = this.$wrapper.querySelector('.moving-ban');
        this.$toast = this.$wrapper.querySelector('.toast');
        if (this._hass?.language === 'ru') {
            this.$toast.textContent = 'Нажмите дважды для выполнения';
        }
        this._setDarkMode();
        this._setHasTitle();
        this._setControls();
        this._setInfo();
        this._initHandlers();
        setTimeout(() => {
            this.$wrapper.style.opacity = '1';
        }, 10);
    }
    _update() {
        this._setAlarmState();
        this._setCarState();
        this._setInfoState();
    }
    _getState(entity_id) {
        const entityName = this._config.entities?.[entity_id];
        if (!entityName) {
            return null;
        }
        const entity = this._hass?.states[entityName];
        const state = entity ? entity.state : 'unavailable';
        if (state === 'on' || state === 'off' || state === 'unlocked' || state === 'locked') {
            return state === 'on' || state === 'locked';
        }
        if (state !== 'unavailable') {
            return state;
        }
        return null;
    }
    _getAttr(entity_id, name) {
        const entityName = this._config.entities?.[entity_id];
        if (!entityName) {
            return null;
        }
        const entity = this._hass?.states[entityName];
        if (!entity || !entity.attributes.hasOwnProperty(name)) {
            return null;
        }
        return entity.attributes[name];
    }
    _setDarkMode() {
        this.$wrapper.classList.toggle('__dark', !!this._config.dark);
    }
    _setHasTitle() {
        this.$wrapper.classList.toggle('__title', !!this._config.title);
    }
    _setAlarmState() {
        const entity = this._hass?.states[this._config.entities.security];
        const states = entity ? entity.attributes : {};
        for (const name in states) {
            if (states.hasOwnProperty(name) && name !== 'friendly_name' && name !== 'icon') {
                this.$container?.classList.toggle('__alarm_' + name, states[name]);
            }
        }
        this.$container?.classList.toggle('__alarm', this._getState('alarm'));
    }
    _setCarState() {
        const controls = {
            security: this._getState('security'),
            engine: this._getState('engine'),
            out: this._getState('out'),
            webasto: this._getState('webasto')
        };
        const states = {
            '__arm': controls.security,
            '__key': this._getAttr('engine', 'ignition'),
            '__door': this._getState('door'),
            '__trunk': this._getState('trunk'),
            '__hood': this._getState('hood'),
            '__smoke': controls.engine,
            '__out': controls.out,
            '__webasto': controls.webasto,
            '__hbrake': this._getState('hbrake'),
            '__offline': this._getAttr('gsm_lvl', 'online'),
        };
        const icons = {
            '__handsfree': this._getState('handsfree'),
            '__neutral': this._getState('neutral'),
            '__ban': this._getState('moving_ban'),
        };
        Object.keys(states).forEach((className) => {
            const state = states[className];
            if (className === '__offline') {
                this.$container?.classList.toggle(className, !state);
            }
            else if (state !== null) {
                this.$container?.classList.toggle(className, state);
            }
        });
        Object.keys(icons).forEach((className) => {
            const state = icons[className];
            if (state !== null) {
                this.$wrapper?.classList.toggle(className, state);
            }
        });
        let carStateChanged = false;
        Object.keys(controls).forEach((key) => {
            if (controls[key] !== null && controls[key] !== this._controls[key]) {
                this._controls[key] = controls[key];
                carStateChanged = true;
            }
        });
        if (carStateChanged) {
            this._stopBtnProgress();
        }
    }
    _setInfoState() {
        for (const [key, data] of Object.entries(this._info)) {
            let visible = false;
            if (this._config.info.indexOf(key) > -1) {
                const state = this._getState(key);
                visible = state !== null;
                if (state !== null && state !== data.value) {
                    this._info[key].value = state;
                    const unit = key === 'gps' ? '' :
                        this._getAttr(key, 'unit_of_measurement');
                    this._info[key].element.querySelector('.info-i-cnt').textContent = `${state} ${unit}`;
                }
            }
            this._info[key].element.classList.toggle('__hidden', !visible);
        }
        const gsm_lvl = this._getState('gsm_lvl');
        if (gsm_lvl !== this._gsm_lvl.value) {
            this._gsm_lvl.value = gsm_lvl;
            this._gsm_lvl.element.icon = gsm_lvl ? this._getAttr('gsm_lvl', 'icon') : 'mdi:signal-off';
        }
    }
    _setControls() {
        this.$controlLeft.classList.add(`control-icon-${this._config.controls[0]}`);
        this.$controlCenter.classList.add(`control-icon-${this._config.controls[1]}`);
        this.$controlRight.classList.add(`control-icon-${this._config.controls[2]}`);
    }
    _setInfo() {
        const $cnt = this._info.balance.element.parentNode;
        for (const name of this._config.info) {
            const $item = this._info[name]?.element;
            if ($item) {
                $cnt.appendChild($item);
            }
        }
    }
    _initHandlers() {
        for (const [key, data] of Object.entries(this._info)) {
            data.element.addEventListener('click', () => this._moreInfo(key));
        }
        this._gsm_lvl.element.addEventListener('click', () => this._moreInfo('gsm_lvl'));
        this._handsfree.element.addEventListener('click', () => this._moreInfo('handsfree'));
        this._neutral.element.addEventListener('click', () => this._moreInfo('neutral'));
        this._moving_ban.element.addEventListener('click', () => this._moreInfo('moving_ban'));
        this.$car.addEventListener('click', () => this._moreInfo('engine'));
        this.$security.addEventListener('click', () => this._moreInfo('security'));
        this.$controlLeft.addEventListener('click', () => this._onClick('left', this.$controlLeft));
        this.$controlCenter.addEventListener('click', () => this._onClick('center', this.$controlCenter));
        this.$controlRight.addEventListener('click', () => this._onClick('right', this.$controlRight));
    }
    _onClick(position, $element) {
        this._fireEvent('haptic', 'light');
        const _showToast = () => {
            this.$toast.style.opacity = '1';
            setTimeout(() => {
                this.$toast.style.opacity = '0';
            }, 2000);
        };
        const _stopTimeout = () => {
            clearTimeout(this._clickTimeouts[position]);
            this._clickTimeouts[position] = null;
        };
        const _startTimeout = () => {
            this._clickTimeouts[position] = setTimeout(() => {
                _stopTimeout();
                _showToast();
            }, 500);
        };
        const _run = () => {
            let btn = null;
            switch (position) {
                case 'left':
                    btn = this._config.controls[0];
                    break;
                case 'center':
                    btn = this._config.controls[1];
                    break;
                case 'right':
                    btn = this._config.controls[2];
                    break;
            }
            let entity;
            let event;
            let action;
            switch (btn) {
                case 'arm':
                    entity = 'security';
                    event = 'lock';
                    action = this._getState(entity) ? 'unlock' : 'lock';
                    break;
                case 'ign':
                    entity = 'engine';
                    event = 'switch';
                    action = this._getState(entity) ? 'turn_off' : 'turn_on';
                    break;
                case 'webasto':
                    entity = 'webasto';
                    event = 'switch';
                    action = this._getState(entity) ? 'turn_off' : 'turn_on';
                    break;
                case 'out':
                    entity = 'out';
                    event = 'switch';
                    action = this._getState(entity) ? 'turn_off' : 'turn_on';
                    break;
                case 'horn':
                    entity = 'horn';
                    if (this._config.entities[entity].startsWith('button')) {
                        event = 'button';
                        action = 'press';
                    }
                    else {
                        event = 'switch';
                        action = 'turn_on';
                    }
                    break;
            }
            if (entity) {
                this._startBtnProgress($element, entity === 'horn' ? 5000 : 30000);
                this._hass.callService(event, action, {
                    entity_id: this._config.entities[entity]
                });
            }
        };
        if (this._clickTimeouts[position]) {
            _stopTimeout();
            _run();
        }
        else {
            _startTimeout();
        }
    }
    _startBtnProgress($element, timeout) {
        $element.classList.add('__inprogress');
        clearTimeout(this._inProgressTimeout);
        this._inProgressTimeout = setTimeout(() => this._stopBtnProgress(), timeout);
    }
    _stopBtnProgress() {
        clearTimeout(this._inProgressTimeout);
        this._inProgressTimeout = null;
        this.$controlLeft.classList.remove('__inprogress');
        this.$controlCenter.classList.remove('__inprogress');
        this.$controlRight.classList.remove('__inprogress');
        this._fireEvent('haptic', 'success');
    }
    _moreInfo(entity) {
        this._fireEvent('haptic', 'light');
        this._fireEvent('hass-more-info', {
            entityId: this._config.entities[entity]
        });
    }
    _fireEvent(type, detail) {
        const event = new Event(type, {
            bubbles: true,
            cancelable: false,
            composed: true
        });
        event.detail = detail || {};
        this.$wrapper.dispatchEvent(event);
        return event;
    }
    _updateEntitiesConfig() {
        if (!this._hass) {
            return;
        }
        if (this._config.entities?.alarm) {
            return;
        }
        if (!this._config.entity_id && !this._config.device_id) {
            return;
        }
        const entitiesToAdd = { ...STARLINE_ENTITIES };
        this._config.entities = {};
        const deviceId = this._config.device_id || this._hass.entities[this._config.entity_id].device_id;
        const deviceEntities = Object.values(this._hass.entities).filter(({ device_id }) => device_id === deviceId);
        for (const entity of deviceEntities) {
            for (const [key, data] of Object.entries(entitiesToAdd)) {
                if (data.regex.test(entity.entity_id)) {
                    this._config.entities[key] = entity.entity_id;
                    delete entitiesToAdd[key];
                }
            }
        }
    }
    setConfig(config) {
        this._config.entity_id = config.entity_id;
        this._config.device_id = config.device_id;
        this._config.dark = !!config.dark;
        this._config.title = config.title;
        if (!config.entity_id && !config.device_id && !config.entities) {
            throw new Error(`You need to define entity_id, device_id or entities`);
        }
        if (config.entities && !config.entity_id && !config.device_id) {
            for (const [key, data] of Object.entries(STARLINE_ENTITIES)) {
                if (data.required && !config.entities[key]) {
                    throw new Error(`You need to define an entity: ${data.name}`);
                }
            }
            this._config.entities = config.entities;
        }
        if (config.controls) {
            Object.assign(this._config.controls, config.controls);
        }
        if (config.info) {
            this._config.info = config.info;
        }
    }
    getCardSize() {
        return 3;
    }
}

customElements.define('starline-card', StarlineCard);
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'starline-card',
    name: 'StarLine',
    description: "Amazing card for Starline integration",
    documentationURL: "https://github.com/Anonym-tsk/lovelace-starline-card",
});
