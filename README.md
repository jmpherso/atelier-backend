

# 🖥️ Atelier API
API for the ratings portion of Atelier storefront backend. This repository is packaged as a whole for convenience and includes the ETL scripts to load database data, NGINX for loadbalancing, as well as the API server itself. This single repository can be cloned across multiple AWS instances to achieve differently functionality in each.

## 🗏 Table of Contents
- [Atelier API](#atelier-api)
  * [Ratings and Review API servers](#ratings-and-review-api-servers)
    + [Optimizations](#optimizations)
    + [Load Balancing](#load-balancing)
  * [Ratings and Review Database](#ratings-and-review-database)
    + [ETL scripts](#etl-scripts)
    + [Optimizations](#optimizations-1)
  * [Final Results](#final-results)
  
## 🖥️ Tech Stack
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white)![Mocha](https://img.shields.io/badge/-mocha-%238D6748?style=for-the-badge&logo=mocha&logoColor=white)

## 📚 Ratings and Review API servers  
The server the API is running on is a basic express server utilizing axios that handles POST/GET/PUT requests and calls 'model' functions to interact with the PostgreSQL database.

### Optimizations  
Most of the optimizations that happened within the API server code itself involved breaking up nested for loops and managing to offload coding to the query to the database itself. Local testing was also done initially via K6 to ensure code was working within reasonable standards.

### Load Balancing  
This repo includes NGINX and can also be installed on a separate instance strictly for load balancing. It requires setting up NGINX per its own instructions based on your own server addresses and needs, [documentation can be found here.](http://nginx.org/en/docs/)

## ✍️ Ratings and Review Database
It's expected that the database also be set up on its own separate instance. Table and database names should match provided ETL functions and the server information in the API code. This would all need to be edited individually to use different database information for each individual use case.

### ETL scripts
ETLpostgres.js and ETLmongo.js are ETL scripts that can be used for loading data in the form of CSV (as well as TXT) files into a database. These ETLs are designed to freshly drop and create tables with the right schemas, as well as address sequencing issues and provide a fully functioning database as needed by the API.

For importing data to Postgres from CSV files : 
  
```node ETLpostgres.js```   
  
 **Note : For Postgres, it's required that the order of your columns as defined in the schema match the order of columns as they appear in the CSV file.**  

  
For importing data to Mongo from CSV files :
  
```sh ETLmongo.sh```  

**Note : Both scripts require the files listed in the scripts to function, for usage on other files be sure to change the filenames and filepaths. For example, 'reviews.csv' to 'questions.csv'.**

### Optimizations
The most significant optimization to the database was indexing the tables on the columns that were being searched by the API. Since the database is enormous this reduced initial query times down from ~500ms to ~1ms.  

## ✨ Final Results

This is the result of an NGINX load balancer distributing traffic to 3 API servers connecting to a single PostgreSQL database, showing roughly a limit of 1740 client requests per second with stable connection results. Pushing the API beyond this results in errors starting to arise and significant (1000ms+) spikes in response time. Obvious further scaling would include more horizontal scaling as well as invstigation of more suitable AWS instances, as the t2.micro instances being used may have upper limits we're nearing or at regardless of our code.

![Image](https://i.imgur.com/dTDuStO.png)
