jQuery(function () {

    function ViewTablaTratamiento() {
        var self = this;

        self.drawTratamientoEnTabla = function (tratamiento) {
            var $tr = $("<tr></tr>");
            var $tdDiente = $("<td></td>");
            $tdDiente.text(tratamiento.diente.id);
            var $tdCara = $("<td></td>");
            $tdCara.text(tratamiento.cara);
            var $tdTratamiento = $("<td></td>");
            $tdTratamiento.text(tratamiento.tratamiento);
            $tr.append($tdDiente);
            $tr.append($tdCara);
            $tr.append($tdTratamiento);
            $("#tbl-tratamientos tbody").append($tr);
        };

        self.drawTablaTratamientos = function () {
            var tratamientosAplicados = viewModel.tratamientosAplicados();
            var $tablaTratamientos = $("#tbl-tratamientos tbody");
            $tablaTratamientos.empty();
            for (var i = 0; i < tratamientosAplicados.length; i++) {
                var tratamientoAplicado = tratamientosAplicados[i];
                self.drawTratamientoEnTabla(tratamientoAplicado);
            }
            if (tratamientosAplicados.length === 0) {
                var $tr = $("<tr></tr>");
                $tr.append('<td colspan="3">Todavía no se ha cargado ningún tratamiento.</td>');
                $tablaTratamientos.append($tr);
            }
        };
    }

    function ViewOdontrograma() {
        var self = this;

        self.drawDiente = function (svg, parentGroup, diente) {
            if (!diente)
                throw new Error('Error no se ha especificado el diente.');

            var x = diente.x || 0,
                    y = diente.y || 0;

            var defaultPolygon = {fill: 'white', stroke: 'navy', strokeWidth: 0.5};
            var dienteGroup = svg.group(parentGroup, {transform: 'translate(' + x + ',' + y + ')'});

            var caraSuperior = svg.polygon(dienteGroup,
                    [[0, 0], [20, 0], [15, 5], [5, 5]],
                    defaultPolygon);
            caraSuperior = $(caraSuperior).data('cara', 'S');

            var caraInferior = svg.polygon(dienteGroup,
                    [[5, 15], [15, 15], [20, 20], [0, 20]],
                    defaultPolygon);
            caraInferior = $(caraInferior).data('cara', 'I');

            var caraDerecha = svg.polygon(dienteGroup,
                    [[15, 5], [20, 0], [20, 20], [15, 15]],
                    defaultPolygon);
            caraDerecha = $(caraDerecha).data('cara', 'D');

            var caraIzquierda = svg.polygon(dienteGroup,
                    [[0, 0], [5, 5], [5, 15], [0, 20]],
                    defaultPolygon);
            caraIzquierda = $(caraIzquierda).data('cara', 'Z');

            var caraCentral = svg.polygon(dienteGroup,
                    [[5, 5], [15, 5], [15, 15], [5, 15]],
                    defaultPolygon);
            caraCentral = $(caraCentral).data('cara', 'C');

            var caraCompleto = svg.text(dienteGroup, 6, 30, diente.id.toString(),
                    {fill: 'navy', stroke: 'navy', strokeWidth: 0.1, style: 'font-size: 6pt;font-weight:normal'});
            caraCompleto = $(caraCompleto).data('cara', 'X');

            // Se aplica un color de fondo a las caras con tratamiento.
            var tratamientosAplicadosAlDiente = ko.utils.arrayFilter(viewModel.tratamientosAplicados(), function (t) {
                return t.diente.id == diente.id;
            });
            var caras = [];
            caras['S'] = caraSuperior;
            caras['C'] = caraCentral;
            caras['X'] = caraCompleto;
            caras['Z'] = caraIzquierda;
            caras['D'] = caraDerecha;
            caras['I'] = caraInferior;

            for (var i = tratamientosAplicadosAlDiente.length - 1; i >= 0; i--) {
                var t = tratamientosAplicadosAlDiente[i];
                if (caras[t.cara] !== undefined) {
                    caras[t.cara].attr('fill', 'red');
                }
            }

            // Se aplica un color de fondo al diente seleccionado.
            dienteSeleccionado = viewModel.dienteSeleccionado;
            if (dienteSeleccionado !== null) {
                if (dienteSeleccionado.id == diente.id) {
                    if (caras[viewModel.caraSeleccionada] !== undefined) {
                        caras[viewModel.caraSeleccionada].attr('fill', '#2a3f54');
                    }
                }
            }

            // Se asignan los eventos.
            $.each([caraCentral, caraIzquierda, caraDerecha, caraInferior, caraSuperior, caraCompleto], function (index, value) {
                value.click(function () {
                    var me = $(this);
                    var cara = me.data('cara');

                    viewModel.dienteSeleccionado = diente;
                    viewModel.caraSeleccionada = cara;

                    var tratamiento = "";
                    for (var i = tratamientosAplicadosAlDiente.length - 1; i >= 0; i--) {
                        var t = tratamientosAplicadosAlDiente[i];
                        var d = t.diente;
                        var c = t.cara;
                        if (d.id == viewModel.dienteSeleccionado.id && c == viewModel.caraSeleccionada) {
                            tratamiento = t.tratamiento;
                            break;
                        }
                    }
                    if (tratamiento !== "") {
                        $("#btn-eliminar-tratamiento").removeClass("hidden");
                    } else {
                        $("#btn-eliminar-tratamiento").addClass("hidden");
                    }
                    $("#txt-tratamiento").val(tratamiento);
                    $("#div-tratamiento").removeClass("hidden");
                    $("#label-diente-seleccionado").text(viewModel.dienteSeleccionado.id + " " + viewModel.caraSeleccionada);

                    self.renderSvg();
                }).mouseenter(function () {
                    var me = $(this);
                    me.data('oldFill', me.attr('fill'));
                    me.attr('fill', '#337ab7');
                }).mouseleave(function () {
                    var me = $(this);
                    me.attr('fill', me.data('oldFill'));
                });
            });
        }

        self.renderSvg = function () {
            var svg = $('#odontograma').svg('get').clear();
            var parentGroup = svg.group({transform: 'scale(1.5)'});
            var dientes = viewModel.dientes();
            for (var i = dientes.length - 1; i >= 0; i--) {
                var diente = dientes[i];
                var dienteUnwrapped = ko.utils.unwrapObservable(diente);
                viewOdontograma.drawDiente(svg, parentGroup, dienteUnwrapped);
            }
        }
    }

    $("#btn-guardar-tratamiento").click(function () {
        /* Acá enviar petición para guardar el tratamiento */
        
        var tratamiento = $("#txt-tratamiento").val();
        viewModel.tratamientosAplicados.push({diente: viewModel.dienteSeleccionado, cara: viewModel.caraSeleccionada, tratamiento: tratamiento});
        viewModel.dienteSeleccionado = null;
        $("#div-tratamiento").addClass("hidden");
        viewOdontograma.renderSvg();
        viewTablaTratamiento.drawTablaTratamientos();
        $("#modal-guardado-exito").modal("show");
    });

    $("#btn-eliminar-tratamiento").click(function () {
        var objetoAEliminar = null;
        var tratamientosAplicados = viewModel.tratamientosAplicados();
        for (var i = tratamientosAplicados.length - 1; i >= 0; i--) {
            var t = tratamientosAplicados[i];
            var d = t.diente;
            var c = t.cara;
            if (d.id == viewModel.dienteSeleccionado.id && c == viewModel.caraSeleccionada) {
                objetoAEliminar = t;
                /* Acá enviar petición para eliminar el tratamiento */
                
                tratamientosAplicados.splice(i, 1);
                break;
            }
        }
        if (objetoAEliminar !== null) {            
            viewModel.dienteSeleccionado = null;
            viewModel.caraSeleccionada = null;
            $("#div-tratamiento").addClass("hidden");
            viewOdontograma.renderSvg();

            viewTablaTratamiento.drawTablaTratamientos();
            $("#modal-eliminado-exito").modal("show");
        }
    });

    $("#btn-aceptar-guardado").click(function () {
        $("#modal-guardado-exito").modal("hide");
    });

    $("#btn-aceptar-eliminado").click(function () {
        $("#modal-eliminado-exito").modal("hide");
    });

    function DienteModel(id, x, y) {
        var self = this;

        self.id = id;
        self.x = x;
        self.y = y;
    }

    function ViewModel() {
        var self = this;

        self.tratamientosAplicados = ko.observableArray([]);
        self.tratamientoSeleccionado = ko.observable(null);
        self.dienteSeleccionado = ko.observable(null);
        self.caraSeleccionada = ko.observable(null);

        // Cargo los dientes
        var dientes = [];
        // Dientes izquierdos
        for (var i = 0; i < 8; i++) {
            dientes.push(new DienteModel(18 - i, i * 25, 0));
        }
        for (var i = 3; i < 8; i++) {
            dientes.push(new DienteModel(55 - i, i * 25, 1 * 40));
        }
        for (var i = 3; i < 8; i++) {
            dientes.push(new DienteModel(85 - i, i * 25, 2 * 40));
        }
        for (var i = 0; i < 8; i++) {
            dientes.push(new DienteModel(48 - i, i * 25, 3 * 40));
        }
        // Dientes derechos
        for (var i = 0; i < 8; i++) {
            dientes.push(new DienteModel(21 + i, i * 25 + 210, 0));
        }
        for (var i = 0; i < 5; i++) {
            dientes.push(new DienteModel(61 + i, i * 25 + 210, 1 * 40));
        }
        for (var i = 0; i < 5; i++) {
            dientes.push(new DienteModel(71 + i, i * 25 + 210, 2 * 40));
        }
        for (var i = 0; i < 8; i++) {
            dientes.push(new DienteModel(31 + i, i * 25 + 210, 3 * 40));
        }

        self.dientes = ko.observableArray(dientes);
    }

    viewModel = new ViewModel();
    viewTablaTratamiento = new ViewTablaTratamiento();
    viewOdontograma = new ViewOdontrograma();

    // Inicializo SVG
    $('#odontograma').svg({
        settings: {width: '620px', height: '250px'}
    });

    ko.applyBindings(viewModel);

    // Acá hacer la petición y cargar los tratamientos aplicados.
    /*var diente = viewModel.dientes()[10];
     var cara = 'Z';
     var tratamiento = "XXX";
     viewModel.tratamientosAplicados.push({diente: diente, cara: cara, tratamiento: tratamiento});*/

    viewOdontograma.renderSvg();
    viewTablaTratamiento.drawTablaTratamientos();

    $("#contenedor-principal-odontograma").removeClass("hidden");
});
