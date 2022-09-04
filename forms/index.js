//caolan-forms
const forms = require("forms");
const fields = forms.fields;
const validators = forms.validators;
const widgets = forms.widgets;

const bootstrapField = function (name, object) {
  if (!Array.isArray(object.widget.classes)) {
    object.widget.classes = [];
  }

  if (object.widget.type == "multipleCheckbox" || object.widget.type == "multipleRadio") {
    object.widget.classes.push("form-check-input", "mb-3");
  } else {
    if (object.widget.classes.indexOf("form-control") === -1) {
      object.widget.classes.push("form-control", "mb-3");
    }
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
      widget: widgets.textarea(),
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
      validators: [validators.integer(), validators.min(0)],
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
      choices: [
        [0, "---Select One---"],
        ["Yes", "Yes"],
        ["No", "No"],
      ],
      widget: widgets.select(),

    }),
    halal: fields.string({
      required: true,
      errorAfterField: true,
      choices: [
        [0, "---Select One---"],
        ["Yes", "Yes"],
        ["No", "No"],
      ],
      widget: widgets.select(),

    }),

    image_url: fields.string({
      widget: widgets.hidden(),
    }),
    thumbnail_url: fields.string({
      required: true,
      errorAfterField: true,

    }),
  });
};

const createVariantForm = (spiciness, sizes) => {
  return forms.create({
    stock: fields.number({
      required: true,
      errorAfterField: true,
      validators: [validators.integer(), validators.min(0), validators.max(6553)],
    }),
    cost: fields.number({
      required: true,
      errorAfterField: true,
      validators: [validators.integer(), validators.min(0), validators.max(429496729)],
    }),
    image_url: fields.string({
      widget: widgets.hidden(),
    }),

    thumbnail_url: fields.string({
      required: true,
      errorAfterField: true,

    }),
 
    spiciness_id: fields.string({
      label: "Spiciness",
      required: true,
      errorAfterField: true,
      widget: widgets.select(),
      choices: spiciness,
    }),

    size_id: fields.string({
      label: "Size",
      required: true,
      errorAfterField: true,
      widget: widgets.select(),
      choices: sizes,
    }),
  });
};

const createRegistrationForm = () => {
  return forms.create({
    username: fields.string({
      required: true,
      errorAfterField: true,
    }),
    email: fields.string({
      required: true,
      errorAfterField: true,
      validators: [validators.email(), validators.maxlength(320)],

    }),
    password: fields.password({
      required: true,
      errorAfterField: true,

    }),
    confirm_password: fields.password({
      required: true,
      errorAfterField: true,
      validators: [validators.matchField("password")],
    }),
  });
};

const createLoginForm = () => {
  return forms.create({
    email: fields.string({
      required: true,
      errorAfterField: true,
      validators: [validators.email(), validators.maxlength(320)],
    }),
    password: fields.password({
      required: true,
      errorAfterField: true,

    }),
  });
};

const createSearchForm = (types, countries, packagings, cuisine_styles) => {
  return forms.create({
    name: fields.string({
      required: false,
      errorAfterField: true,
      validators: [validators.maxlength(100)],

    }),
    min_shelf_life: fields.number({
      required: false,
      errorAfterField: true,
      validators: [validators.integer()],
    }),
    max_shelf_life: fields.number({
      required: false,
      errorAfterField: true,
      validators: [validators.integer()],
    }),

    type_id: fields.string({
      label: "Type",
      required: false,
      errorAfterField: true,
      choices: types,
      widget: widgets.select(),
    }),
    packaging_id: fields.string({
      label: "Packaging",
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
      required: false,
      errorAfterField: true,
      widget: widgets.multipleSelect(),
      choices: cuisine_styles,
    }),
    vegan: fields.string({
      required: false,
      errorAfterField: true,
      cssClasses: {
        label: ["form-label"],
      },  
      choices: { Yes: "Yes", No: "No" },
      widget: widgets.multipleRadio({
        classes: ["form-input", "ms-2"],
      }),
    }),
    halal: fields.string({
      required: false,
      errorAfterField: true,
      cssClasses: {
        label: ["form-label"],
      },
      choices: { Yes: "Yes", No: "No" },
      widget: widgets.multipleRadio({
        classes: ["form-input", "ms-2"],
      }),
    }),
  });
};

const createUserForm = () => {
  return forms.create({
    username: fields.string({
      required: true,
      errorAfterField: true,

    }),
    email: fields.string({
      required: true,
      errorAfterField: true,
      validators: [validators.email(), validators.maxlength(320)],

    }),
  });
};

const createOrderSearchForm = (order_statuses) => {
  return forms.create({
    min_total_cost: fields.number({
      required: false,
      errorAfterField: true,
      validators: [validators.integer()],
    }),
    max_total_cost: fields.number({
      required: false,
      errorAfterField: true,
      validators: [validators.integer()],
    }),
    email: fields.email({
      required: false,
      errorAfterField: true,
      widget: widgets.email(),
    }),
    order_date: fields.date({
      required: false,
      errorAfterField: true,
      widget: widgets.date(),
    }),
    order_status_id: fields.string({
      label: "Order Status",
      required: false,
      errorAfterField: true,
      widget: widgets.select(),
      choices: order_statuses,
    }),
  });
};

const createStatusForm = (order_statuses) => {
  return forms.create({
    order_status_id: fields.string({
      label: " ",
      cssClasses: { label: ["hideElement"] },
      required: true,
      errorAfterField: true,
      widget: widgets.select(),
      choices: order_statuses,
    }),
  });
};
module.exports = {
  createLoginForm,
  createProductForm,
  createVariantForm,
  createRegistrationForm,
  createSearchForm,
  createOrderSearchForm,
  createStatusForm,
  createUserForm,
  bootstrapField,
};
