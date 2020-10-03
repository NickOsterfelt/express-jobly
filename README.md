# express-jobly
Springboard cumulative Node Express project

### requirements
  - postgres installed globally
  - node.js installed (with npm)
### To run this project:
 - install node modules
    - `npm i`
 - create postgres databases 
      ``` 
          createdb jobly
          createdb jobly-test
      ```
 - create database tables
     ```
         psql jobly < data.sql
         psql jobly-test < data.sql 
     ```
 - start server
    - `nodemon server.js`

#### To run the tests
  - `jest --testPathIgnorePatterns='testconfig*' --runInBand`
