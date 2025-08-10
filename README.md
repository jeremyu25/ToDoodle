# ToDoodle
For now the most basic To Do App we can possibly do.

# Project Overview
A simple, intuitive todo application to help users organize and track their daily tasks efficiently.

## Features planned
- [ ]  User can create a new note.
- [ ]  User can edit their notes.
- [ ]  User can delete their notes.
- [ ]  User can save notes.
- [ ]  User can type text input to their notes.
- [ ]  User can create a user account.
- [ ]  User can log into their user account.
- [ ]  User can log out of their account.
- [ ]  User can access the website via a url link.

## Getting started

### Installation

Git clone the repository
```sh
git clone https://github.com/jeremyu25/ToDoodle/
```
Navigate to frontend folder and install npm packages for the frontend.
```sh
cd todoodlefrontend
npm install
```

Navigate to the backend folder and install npm packages for the backend.
```sh
cd backend
npm install
```

Note that for now, we are using local postgresql database hosted on docker for development. Set up instructions TBD as we may migrate to cloud database.

### Running in development

We need to run the frontend and backend separately.

To run the frontend
```sh
cd todoodlefrontend
```
Run this command to start the frontend server
```sh
npm run dev
```

To run the backend
```sh
cd backend
```

Run this command to start the backend server
```sh
npm start dev
```

Remember to start up your local postgres database as per your configuration.

## Configurations used

Add a .env file in the frontend and backend folder respectively.
(TBD: Add keys like DATABASE_URL, PORT, JWT_SECRET, etc.)

## Tech stack

ReactJS Typescript - frontend  
ExpressJS NodeJS - backend  
Postgresql - backend  

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.