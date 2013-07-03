;(function(Form, Editor) {

  module('AutoSelect');

  module('AutoSelect#initialize');

  test('Default type is text', function() {
    var editor = new Editor().render();

    equal($(editor.el).attr('type'), 'text');
  });

  test('Has an autocomplete', function() {
    var editor = new Editor().render();
    ok($(editor.el).data('autocomplete'));
    var option = editor.$el.autocomplete('option');
    ok(option.source, 'with a source');
    ok(option.focus, 'with a focus');
    ok(option.select, 'with a select');
    ok(option.search, 'with a search');
    // debugger
  });

  module('AutoSelect#search', {
    setup: function() {
      this.editor = new Editor().render();
      this.callback = sinon.spy();
      this.ajax = sinon.stub($, 'getJSON');
    },

    teardown: function() {
      $.getJSON.restore();
    }
  })

  test('sets loading class when called', function() {

    this.editor.handleSearch({term: 'foo'}, this.callback);

    ok(this.editor.$el.hasClass('autocomplete-loading'));
  });

  test('removes loading class when complete', function() {
    var data = {items: []};
    this.ajax.callsArgWith(2, data);

    this.editor.handleSearch({term: 'foo'}, this.callback);

    ok(!this.editor.$el.hasClass('autocomplete-loading'));
  });

  test('autocomplete-supplied callback is called', function() {
    var items = [];
    var data = {items: items};
    this.ajax.callsArgWith(2, data);

    this.editor.handleSearch({term: 'foo'}, this.callback);

    ok(this.callback.called);
    ok(this.callback.calledWith(items), 'called with data');
  });

  module('AutoSelect#getValue()', {
    setup: function() {
      this.editor = new Editor().render();
    }
  });

  test('Default value', function() {
    equal(this.editor.getValue(), undefined);
  });

  test('When unselected', function() {
    this.editor.selectedValue = null
    this.editor.$el.val('foo')

    equal(this.editor.getValue(), null);
  });

  test('when selected', function() {
    this.editor.setValue({id: 1, title: 'foo'});

    equal(this.editor.getValue(), 1)
  })

  module('AutoSelect#setValue()', {
    setup: function() {
      this.editor = new Editor().render();
      this.item = {id: 1, title: 'foo'};
    }
  });

  test('sets value and text', function() {
    this.editor.setValue(this.item);

    equal(this.editor.$el.val(), this.item.title, 'sets the text');
    equal(this.editor.getValue(), this.item.id, 'sets the id');
  });

  test('sets jQuery autocompleteSelected data value', function() {
    this.editor.setValue(this.item);

    equal(this.editor.$el.data('autocompleteSelected'), this.item.id);
  });

  test('sets selected class', function() {
    this.editor.setValue(this.item);

    ok(this.editor.$el.hasClass('autocomplete-selected'));
  });

  test('truncates long strings', function() {
    this.item.title = (new Array(40)).join('A');
    this.editor.setValue(this.item);

    equal(this.editor.$el.val().length, 35);
  });

  test('trims whitespace', function() {
    this.item.title = 'foo   ';
    this.editor.setValue(this.item);
    equal(this.editor.$el.val(), 'foo');
  });

  test('calls validation', function() {
    sinon.stub(this.editor, 'handleValidation');

    this.editor.setValue(this.item);

    ok(this.editor.handleValidation.called);
  });

  module('AutoSelect#deselectValue()')

  test('unsets the selection', function() {
    var editor = new Editor().render();
    editor.selectedValue = 1;
    editor.$el.data('autocompleteSelected', 1)
    editor.$el.addClass('autocomplete-selected');

    editor.deselectValue();

    equal(editor.selectedValue, null, 'unset selectedValue');
    equal(editor.$el.data('autocompleteSelected'), null, 'unset autocompleteSelected data');
    ok(!editor.$el.hasClass('autocomplete-selected'), 'removes the selected class');
  });

  module('AutoSelect#validation', {
    setup: function() {
      this.editor = new Editor().render();
    }
  });

  test('removes error on empty', function() {
    this.editor.$el.addClass('autocomplete-error');

    this.editor.handleValidation();

    ok(!this.editor.$el.hasClass('autocomplete-error'));
  });

  test('if value not selected', function() {
    this.editor.$el.val('foo')
    // sinon.stub(this.editor.$el, 'tooltip')

    this.editor.handleValidation();

    ok(this.editor.$el.hasClass('autocomplete-error'), 'add error class');
    // ok('enable tooltip', this.editor.$el.tooltip.called);

    // this.editor.$el.tooltip.restore();
  });

  test('removes error class if value selected', function() {
    this.editor.$el.val('foo')
    this.editor.selectedValue = 1

    this.editor.handleValidation();

    ok(!this.editor.$el.hasClass('autocomplete-error'));
  });

  module('AutoSelect#focus', {
    setup: function() {
      this.sinon = sinon.sandbox.create();

      this.editor = new Editor().render();

      //jQuery events only triggered when element is on the page
      //TODO: Stub methods so we don't need to add to the page
      $('body').append(this.editor.el);
    },

    teardown: function() {
      this.sinon.restore();
      
      //Remove the editor from the page
      this.editor.remove();
    }
  });

  test('gives focus to editor and its input', function() {
    this.editor.focus();

    ok(this.editor.hasFocus);
    ok(this.editor.$el.is(':focus'));
  });

  test('triggers the "focus" event', function() {
    var editor = this.editor,
        spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.focus();

    ok(spy.called);
    ok(spy.calledWith(editor));
  });

})(Backbone.Form, Backbone.Form.editors.AutoSelect);