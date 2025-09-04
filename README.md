# ToDoodle
For now the most basic To Do App we can possibly do.

<img src="./docs/assets/meme.gif" width="300" />


# Project Overview

<img src="./docs/assets/todoodle_logo.png" width="150" />

A simple, intuitive todo application to help users organize and track their daily tasks efficiently.  

## WIP demo  

<img src="./docs/assets/intro_page_demo.gif" width="600" />

[WIP_demo](./docs/assets/WIP_demo.mp4)

## Development plan

### Features planned
- [x]  User can create a new note.
- [x]  User can edit their notes.
- [x]  User can delete their notes.
- [x]  User can save notes.
- [x]  User can type text input to their notes.
- [x]  User can create a user account.
- [x]  User can log into their user account.
- [x]  User can log out of their account.
- [x]  User can access the website via a url link.
- [ ]  Debouncing and throttling.
- [ ]  Google oauth.
- [ ]  2FA authentication.

### DevOps
- [ ] Dockerise dev.
- [ ] Add unit testing for backend.
- [ ] Add OpenAPI specification for backend (Swagger UI).
- [ ] Add GitHub Actions CI/CD.
- [ ] Implement proper GitHub flow once CI/CD and deployment to prod is up.
- [ ] Deploy to AWS cloud. Monolithic EC2 for now.

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
npm run dev
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
