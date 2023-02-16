# Atelier API
API for specifically the ratings portion of Atelier storefront backend.

## Ratings and Review API server  
The server the API is running on is a basic express server utilizing axios that handles POST/GET/PUT requests and calls 'model' functions to interact with the PostgreSQL database.

## Ratings and Review Database Models  
Also contained is a models file that describes multiple functions used to interact directly with the PostgreSQL database. These models are called within the express server file.

## ETL scripts
ETL scripts for importing very large CSV files to Postgres (ETLpostgres) and Mongo (ETLmongo) and to accommadate easy remote setup.   
  
For importing data to Postgres from CSV files : 
  
```node ETLpostgres.js```   
  
 **Note : For Postgres, it's required that the order of your columns as defined in the schema match the order of columns as they appear in the CSV file.**  

  
For importing data to Mongo from CSV files :
  
```sh ETLmongo.sh```  

**Note : Both scripts require the files listed in the scripts to function, for usage on other files be sure to change the filenames and filepaths. For example, 'reviews.csv' to 'questions.csv'.**
