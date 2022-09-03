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
