const { Customer } = require("../models");

const getAllCustomers = async () => {
  const customers = await Customer.fetchAll().map((customer) => {
    return [customer.get("id"), customer.get("customer")];
  });

  return customers;
};
const getCustomerById = async (customerId) => {
  return await Customer.where({
    id: parseInt(customerId),
  }).fetch({
    require: true,
  });
};

// const createCustomer = async (name, username, email, password, contact_number) => {
//   //   const customer = await getCustomerByEmail(email);
//   //   if (!customer) {
 
//   const newCustomer= new Customer()
//   const newCustomerData = {
//     name,
//     username,
//     email,
//     password,
//     contact_number,
//     created_date: new Date()
//   }
//   newCustomer.set(newCustomerData)
//   await newCustomer.save();
// //   console.log("customer => ", newCustomer);
//   return newCustomer;
//   //   } else {
//   //     return false;
//   //   }
// };

const getCustomerEmail = async (email) => {
  return await Customer.where({
    email: email,
  }).fetch({
    require: false,
  });
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  // createCustomer,
  getCustomerEmail,
};
