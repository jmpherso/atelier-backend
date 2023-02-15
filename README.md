# RatingsAPI
API for the ratings portion of Atelier backend.

## ETL scripts
Repository contains ETL scripts for import to Postgres (ETLpostgres) and Mongo (ETLmongo).  
  
ETLpostgres >
```node ETLpostgres.js```

ETLmongo >
```sh ETLmongo.sh``

Note : This requires the files listed in the scripts to function, for usage on other files be sure to change the filenames. For example, 'reviews.csv' to 'questions.csv'. This is true for both scripts.
