# RatingsAPI
API for the ratings portion of Atelier backend.

## ETL scripts
ETL scripts for importing CSV files to Postgres (ETLpostgres) and Mongo (ETLmongo).  
  
ETLpostgres >  
  
```node ETLpostgres.js```   
  
 **Note : For COPY, it's required that the order of your columns as defined in the schema match the order of columns as they appear in the CSV file.**  

  
ETLmongo >  
  
```sh ETLmongo.sh```  

**Note : This requires the files listed in the scripts to function, for usage on other files be sure to change the filenames and filepaths. For example, 'reviews.csv' to 'questions.csv'. This is true for both scripts.**
