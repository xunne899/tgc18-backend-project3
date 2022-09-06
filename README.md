# tgc-18-project-3-backend-SolelySpice

### Frontend Web Interface
- Refer to github frontend react webpage over [here](https://github.com/xunne899/tgc18-project3-frontend) for more details.

### BackEnd Database
- Refer [here](https://github.com/xunne899/tgc18-backend-project3) for more gitub backend database details

### Live Demo
  Link of live backend demo can be found [here](https://project3-spice-sauce.herokuapp.com/login)

# Summary

- API endpoint CRUD was created
- Deployed to Heroku

## Test Account (Backend admin)

| Email              | Password |
| ------------------ | -------- |
| test@gmail.com     | 123      |

## BackEnd Features

| Features | Description |
| -------- | ----------- |
| Owner / Staff Management (login, logout and register new account) | Only Owner and staff are able to access backend webpage through account, edit and delete admin profile|
| Products and Variants Management | Products search, create(add), update, delete on products and variants | 
| Orders Management | Orders search and able to change update status on orders |


### Database Name

- spice_sauce


### ERD

![ERD](./public/images/spices_erd.png)

### Schema

![Schema Design](./public/images/schema.png)


## Sample of Database Route
### Get/Request

```
GET /products
```

### Results/Response

```
Results of all products will show
```

### Create a new product

```
POST /products/create
```

### Results/Response

```
New product will be added to database
```

### Edit a product

```
POST products/:product_id/update
```

### Results/Response

```
Product with id is updated in database
```

### Delete a product

```
DELETE products/:product_id/delete
```

### Results/Response

```
product with id is deleted from database
```

### Backend Environment Variables

#### This project makes use of the environment variables as shown below:
```
DB_DRIVER=
DB_USER=
DB_PASSWORD=
DB_DATABASE=
DB_HOST=

CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_PRESET=

STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_SUCCESS_URL=
STRIPE_CANCELLED_URL=
STRIPE_ENDPOINT_SECRET=

SESSION_SECRET_KEY=

TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
```

## Testing

- POST, GET, PUT, DELETE testing was done through Advanced REST Client (ARC)<br>
  Link of ARC software can be found [here](https://install.advancedrestclient.com/install)

## Live Deployment

- Deployment is through Netlify for react frontend<br>
  Link of live Netlify deployment can be found [here](https://solely-spice.netlify.app/)

- Deployment is through heroku for backend database<br>
  Link of live HEROKU deployment can be found [here](https://project3-spice-sauce.herokuapp.com/login)

## Main Tehnology Used (BackEnd Database)

- flash-sessions - using middleware display flash messsages
- csurf - Cross-Site Request Forgery (CSRF) protection
- wax-on - template inheritance using block, extend hbs
- handlebar-helpers - handlebar-helpers
- cloudinary - external supporting  widget for image uploading
- caolan forms - validate and create forms
- knex - MySQL Query builder
- CORS - share access, Cross-Origin Resource Sharing 
- doteenv - loading of environment variables
- db-migrate - migrate backend files
- json web token - authentication tools for frontend
- bookshelf- backend SQL database ORM
- hbs - for backend file display
- SQL- backend database
- Express Node JS- Backend programming
- DB Beaver, postgress - store backend data after live deployment
- SweetAlert2 - alert box for successfully deleted and added
- Bootstrap - styling, sizing, aligning content, match its mobile responsiveness
- React Boostrap 5.0 - accordian, cards ,modal, forms, col, rows
- Heroku - hosting live for backend project
- Github & Gitpod - storing respositories/project