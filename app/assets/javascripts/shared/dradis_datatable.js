class DradisDatatable {
  constructor(selector) {
    this.$table = $(selector);
    if (!this.$table.length) {
      console.warn('Table not found.');
      return;
    }

    this.dataTable = null;
    this.$paths = this.$table.closest('[data-behavior~=paths]');
    this.tableHeaders = Array.from(this.$table[0].querySelectorAll('thead th, thead td'));
    this.init();
    this.setupListeners();
  }

  init() {
    var that = this;

    var colvisColumnIndexes = this.tableHeaders.reduce(function(indexes, column, index) {
      if(column.dataset.colvis != 'false') {
        indexes.push(index);
      }
      return indexes;
    }, []);

    // Assign the instantiated DataTable as a DradisDatatable property
    this.dataTable = this.$table.DataTable({
      // https://datatables.net/reference/option/dom,
      // The 'dom' attribute defines the order of elements in a DataTable.
      dom: 'Bfrtip',
      pageLength: 25,
      lengthChange: false,
      columnDefs: [ {
        orderable: false,
        className: 'select-checkbox',
        targets:   0
      } ],
      select: {
        selector: 'td:first-child',
        style: 'multi'
      },
      buttons: {
        dom: {
          button: {
            tag: 'button',
            className: 'btn'
          }
        },
        buttons: [
          {
            extend: 'selectAll',
            text: '<input type="checkbox" id="select-all" />',
            titleAttr: 'Select all'
          },
          {
            text: 'Delete',
            className: 'btn-danger d-none',
            name: 'bulkDeleteBtn',
            action: function (event, dataTable, node, config) {
              var destroyUrl = that.$paths.data('destroy-url');
              console.log(dataTable.rows({selected: true}).ids())
            }
          },
          {
            extend: 'colvis',
            text: '<i class="fa fa-columns mr-1"></i><i class="fa fa-caret-down"></i>',
            titleAttr: 'Choose columns to show',
            className: 'btn',
            columns: colvisColumnIndexes
          }
        ]
      }
    });

    this.behaviors();
  }

  behaviors() {
    this.unbindDataTable();
  }

  bulkDeleteBtn() {

  }

  showBulkDeleteBtn(boolean) {
    // https://datatables.net/reference/api/buttons()
    var bulkDeleteBtn = this.dataTable.buttons('bulkDeleteBtn:name');
    if (boolean) {
      bulkDeleteBtn[0].node.classList.remove('d-none');
    } else {
      bulkDeleteBtn[0].node.classList.add('d-none');
    }
  }

  setupListeners() {
    var that = this;

    this.dataTable.on('select.dt', function(e, dt, type, indexes) {
      if (that.dataTable.rows({selected:true}).count() == that.dataTable.rows().count()) {
        $('#select-all').prop('checked', true);
      }

      if (that.dataTable.rows({selected:true}).count()) {
        that.showBulkDeleteBtn(true);
      }
    });

    this.dataTable.on('deselect.dt', function(e, dt, type, indexes) {
      $('#select-all').prop('checked', false);

      if (that.dataTable.rows({selected:true}).count() === 0) {
        that.showBulkDeleteBtn(false);
      }
    });
  }

  unbindDataTable() {
    var that = this;

    that.hideColumns();

    document.addEventListener('turbolinks:before-cache', function() {
      that.dataTable.destroy();
    });
  }

  hideColumns() {
    var that = this;
    that.tableHeaders.forEach(function(column, index) {
      if (column.dataset.visible == 'false') {
        var dataTableColumn = that.dataTable.column(index);
        dataTableColumn.visible(false);
      }
    });
  }
}
