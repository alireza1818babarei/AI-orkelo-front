
import List from 'list.js';

const InitListTable = () => {

    var options = {
        valueNames: ['id', 'employee', 'email', 'contact', 'date', 'status',],
        page: 4,
        pagination: true
    };

    var contactList = new List('myTable', options);

    var idField = $('#id-field'),
        employeeField = $('#employee-field'),
        emailField = $('#email-field'),
        contactField = $('#contact-field'),
        dateField = $('#date-field'),
        statusField = $('#status-field'),
        addBtn = $('#add-btn'),
        editBtn = $('#edit-btn').hide(),
        removeBtns = $('.remove-item-btn'),
        editBtns = $('.edit-item-btn');


    refreshCallbacks();

    $(document).on("submit", "#add_employee_form", function (e) {
        e.preventDefault();
        $(this).parent().modal("hide");
        let newItem = {
            id: Math.floor(Math.random() * 110000),
            employee: employeeField.val(),
            email: emailField.val(),
            contact: contactField.val(),
            date: dateField.val(),
            status: `<span class="badge text-uppercase bg-${statusField.val()}-subtle text-${statusField.val()}">${$("#status-field option:selected").text()}</span>`,
        }
        contactList.add(newItem)
        clearFields();
        refreshCallbacks();
    })

    $(document).on('click', '#edit-btn', function () {
        var item = contactList.get('id', idField.val())[0];
        item.values({
            id: idField.val(),
            employee: employeeField.val(),
            email: emailField.val(),
            contact: contactField.val(),
            date: dateField.val(),
            status: `<span class="badge text-uppercase bg-${statusField.val()}-subtle text-${statusField.val()}">${$("#status-field option:selected").text()}</span>`,
        });
        clearFields();
        editBtn.hide();
        addBtn.show();
    });

    function refreshCallbacks() {
        // Needed to add new buttons to jQuery-extended object
        removeBtns = $(removeBtns.selector);
        editBtns = $(editBtns.selector);

        $(document).on('click', '.remove-item-btn', function () {
            var itemId = $(this).closest('tr').find('.id').text();
            contactList.remove('id', itemId);
        });
        $(document).on('click', '.edit-item-btn', function () {
            var itemId = $(this).closest('tr').find('.id').text();
            var itemValues = contactList.get('id', itemId)[0].values();
            idField.val(itemValues.id);
            employeeField.val(itemValues.employee);
            emailField.val(itemValues.email);
            contactField.val(itemValues.contact);
            dateField.val(itemValues.date);
            statusField.val(itemValues.status);

            editBtn.show();
            addBtn.hide();
        });
    }

    function clearFields() {
        employeeField.val('');
        emailField.val('');
        contactField.val('');
        dateField.val('');
        statusField.val('');
    }

    $(function () {
        $(".checkAll").on("click", function () {
            $(this)
                .closest("table")
                .find("tbody :checkbox")
                .prop("checked", this.checked)
                .closest("tr")
                .toggleClass("selected", this.checked);
        });

        $("tbody :checkbox").on("click", function () {
            $(this)
                .closest("tr")
                .toggleClass("selected", this.checked);

            $(this).closest("table")
                .find(".checkAll")
                .prop("checked",
                    $(this)
                        .closest("table")
                        .find("tbody :checkbox:checked").length ==
                    $(this)
                        .closest("table")
                        .find("tbody :checkbox").length
                );
        });

    });
};

export default InitListTable;