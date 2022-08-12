// require in caolan-forms
const forms = require("forms");
// create some shortcuts
const fields = forms.fields;
const validators = forms.validators;
const widgets = forms.widgets;

const bootstrapField = function (name, object) {
  if (!Array.isArray(object.widget.classes)) {
    object.widget.classes = [];
  }

  if (object.widget.classes.indexOf("form-control") === -1) {
    object.widget.classes.push("form-control");
  }

  var validationclass = object.value && !object.error ? "is-valid" : "";
  validationclass = object.error ? "is-invalid" : validationclass;
  if (validationclass) {
    object.widget.classes.push(validationclass);
  }

  var label = object.labelHTML(name);
  var error = object.error ? '<div class="invalid-feedback">' + object.error + "</div>" : "";

  var widget = object.widget.toHTML(name, object);
  return '<div class="form-group">' + label + widget + error + "</div>";
};

const createProductForm = (types, countries, ingredients, packagings, cuisine_styles) => {
  return forms.create({
    type_id: fields.string({
      label: "Type",
      required: true,
      errorAfterField: true,
      choices: types,
      widget: widgets.select(),
    }),
    name: fields.string({
      required: true,
      errorAfterField: true,
    }),
    country_id: fields.string({
      label: "Country",
      required: true,
      errorAfterField: true,
      choices: countries,
      widget: widgets.select(),
    }),
    description: fields.string({
      required: true,
      errorAfterField: true,
    }),
    ingredient: fields.string({
      required: true,
      errorAfterField: true,
      widget: widgets.multipleSelect(),
      choices: ingredients,
    }),
    packaging_id: fields.string({
      label: "Packaging",
      required: true,
      errorAfterField: true,
      choices: packagings,
      widget: widgets.select(),
    }),
    shelf_life: fields.number({
      required: true,
      errorAfterField: true,
      validators: [validators.integer(), validators.min(0)]
    }),
    cuisine_style: fields.string({
      required: true,
      errorAfterField: true,
      widget: widgets.multipleSelect(),
      choices: cuisine_styles,
    }),
    vegan: fields.string({
      required: true,
      errorAfterField: true,
    }),
    halal: fields.string({
      required: true,
      errorAfterField: true,
    }),
    image_url: fields.string({
      required: true,
      errorAfterField: true,
    }),
    thumbnail_url: fields.string({
      required: true,
      errorAfterField: true,
    }),
    image_url:fields.string({
      widget: widgets.hidden()
  })
  });
};


const createRegistrationForm =()=>{
  return forms.create({
    username: fields.string({
      required: true,
      errorAfterField: true,
      cssClasses: {
          label: ['form-label']
      }
  }),
  email: fields.string({
      required: true,
      errorAfterField: true,
      cssClasses: {
          label: ['form-label']
      }
  }),
  password: fields.password({
      required: true,
      errorAfterField: true,
      cssClasses: {
          label: ['form-label']
      }
  }),
  confirm_password: fields.password({
      required: true,
      errorAfterField: true,
      cssClasses: {
          label: ['form-label']
      },
      validators: [validators.matchField('password')]
  })
})
}

const createLoginForm = () => {
  return forms.create({
      email: fields.string({
          required: true,
          errorAfterField: true,
          cssClasses: {
              label: ['form-label']
          }
      }),
      password: fields.password({
          required: true,
          errorAfterField: true,
          cssClasses: {
              label: ['form-label']
          }
      }),
  })
}


const createSearchForm = (types, countries, packagings, cuisine_styles) => {
  return forms.create({
      name: fields.string({
          required: false,
          errorAfterField: true,
          cssClasses: {
              label: ['form-label']
          }
      }),
      min_shelf_life: fields.number({
        required: false,
        errorAfterField: true,
        cssClasses: {
            label: ['form-label']
        },
        validators: [validators.integer()]
    }),
      max_shelf_life: fields.number({
        required: false,
        errorAfterField: true,
        cssClasses: {
            label: ['form-label']
        },
        validators: [validators.integer()]
    }),
        vegan: fields.string({
          required: false,
          errorAfterField: true,
          cssClasses: {
              label: ['form-label']
          },
      }),
      halal: fields.string({
        required: false,
        errorAfterField: true,
        cssClasses: {
            label: ['form-label']
        },
    }),
      type_id: fields.string({
          label: 'Type',
          required: false,
          errorAfterField: true,
          choices: types,
          widget: widgets.select(),
        
      }),
      packaging_id: fields.string({
        label: 'Packaging',
        required: false,
        errorAfterField: true,
        choices: packagings,
        widget: widgets.select(),
      
    }),
      country_id: fields.string({
        label: "Country",
        required: true,
        errorAfterField: true,
        choices: countries,
        widget: widgets.select(),
      }),
      cuisine_style: fields.string({
          required:false,
          errorAfterField: true,
          cssClasses: {
              label: ['form-label']
          },
          widget: widgets.multipleSelect(),
          choices: cuisine_styles
      }),
  })
}





module.exports = { createLoginForm, createProductForm, createRegistrationForm,createSearchForm, bootstrapField };
