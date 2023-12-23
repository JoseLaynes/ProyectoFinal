const url = "/gestion/api/infracciones";

function formatearFecha(fecha) {
    let fechaObjeto = new Date(fecha);
    let fechaUTC = fechaObjeto.toISOString().split('T')[0];
    return fechaUTC;
}


function save(bandera) {
    $("#modal-update").modal("hide");
    let id = $("#guardar").data("id");
    let fechaInput = $("#fecha").val();

    // Imprime la fecha antes de formatearla
    console.log("Fecha antes del formateo:", fechaInput);

    let infraccion = {
        id: id,
        dni: $("#dni").val(),
        fecha: formatearFecha(fechaInput),
        placa:  $("#placa").val(),
        infraccion:  $("#infraccion").val(),
        descripcion:  $("#descripcion").val(),
    };

    let metodo = bandera == 1 ? "POST" : "PUT";
    $.ajax({
        type: metodo,
        url: url,
        data: JSON.stringify(infraccion),
        dataType: "text",
        contentType: "application/json",
        cache: false,
        success: function (data) {
            if (data == 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'La infracción ya está registrada',
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                let texto = bandera == 1 ? "guardada" : "actualizada";
                getTabla();
                Swal.fire({
                    icon: 'success',
                    title: 'Se ha ' + texto + ' la infracción',
                    showConfirmButton: false,
                    timer: 1500
                });
                clear();
            }
        },
    }).fail(function () {

    });
}


function deleteFila(id) {
    $.ajax({
        type: "DELETE",
        url: url + "/" + id,
        data: {
            id: id,
        },
        cache: false,
        timeout: 600000,
        success: function (data) {
            Swal.fire({
                icon: 'success',
                title: 'Se ha eliminado la infracción',
                showConfirmButton: false,
                timer: 1500
            });
            getTabla();
        },
    }).fail(function () {

    });
}

function getTabla() {
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json", // Específica que esperas datos en formato JSON
        cache: false,
        success: function (data) {
            let t = $("#tablaInfracciones").DataTable();
            t.clear().draw(false);

            let botonera = '<button type="button" class="btn btn-warning btn-sm editar"><i class="fas fa-edit"></i> </button>' +
                '<button type="button" class="btn btn-danger btn-sm eliminar"><i class="fas fa-trash"></i></button>';

            $.each(data, function (index, infraccion) {
            
                            let fechaFormateada = formatearFecha(infraccion.fecha);
            
            	t.row.add([infraccion.id, infraccion.dni, fechaFormateada, infraccion.placa, infraccion.infraccion , infraccion.descripcion, botonera]).draw(false);
            });

            t.draw(false);
        },
    }).fail(function () {
        // Maneja errores aquí
    });
}
function getFila(id) {

    $.ajax({
        type: "GET",
        url: url + "/" + id,
        data: {
            id: id,
        },
        cache: false,
        timeout: 600000,
        success: function (data) {
            $("#modal-title").text("Editar Infracción");
            $("#dni").val(data.dni);
            
            let fechaFormateada = formatearFecha(data.fecha);
            $("#fecha").val(fechaFormateada);
            
        	$("#placa").val(data.placa),
        	$("#infraccion").val(data.infraccion),
        	$("#descripcion").val(data.descripcion),
            $("#guardar").data("id", data.id);
            $("#guardar").data("bandera", 0);
            $("#modal-update").modal("show");
        },
    }).fail(function () {

    });
}

function clear() {
    $("#modal-title").text("Nueva Infracción");
    $("#dni").val("");
	$("#fecha").val(""),
    $("#placa").val(""),
    $("#infraccion").val(""),
    $("#descripcion").val(""),
    $("#guardar").data("id", 0);
    $("#guardar").data("bandera", 1);
}

$(document).ready(function () {

    $("#tablaInfracciones").DataTable({
        // Configuración de DataTable
    });

    clear();

    $("#nuevo").click(function () {
        clear();
    });

    $("#guardar").click(function () {

        let bandera = $("#guardar").data("bandera");
        save(bandera);
    });

    $(document).on('click', '.eliminar', function () {
        Swal.fire({
            title: 'Eliminar Infracción',
            text: "¿Estás seguro de querer eliminar esta infracción?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si'
        }).then((result) => {
            if (result.isConfirmed) {
                let id = $($(this).parents('tr')[0].children[0]).text();
                deleteFila(id);
            }
        });
    });

    $(document).on('click', '.editar', function () {
        let id = $($(this).parents('tr')[0].children[0]).text();
        getFila(id);
    });
    getTabla();
});
