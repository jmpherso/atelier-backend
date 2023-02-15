importserver="localhost"
importport="27017"
importdb="reviewsandratings"
importcollection="reviews"
importfileone="reviews.csv"
importfiletwo="characteristic_reviews.csv"
importfilethree="characteristics.csv"
importfilefour="reviews_photos.csv"

mongoimport --host $importserver --port $importport --db $importdb --collection $importcollection --type csv --file $importfileone --headerline
mongoimport --host $importserver --port $importport --db $importdb --collection $importcollection --type csv --file $importfiletwo --headerline
mongoimport --host $importserver --port $importport --db $importdb --collection $importcollection --type csv --file $importfilethree --headerline
mongoimport --host $importserver --port $importport --db $importdb --collection $importcollection --type csv --file $importfilefour --headerline
