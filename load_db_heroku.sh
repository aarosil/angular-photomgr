/c/mongo/bin/mongo -h ds053808.mongolab.com:53808 -u heroku_app19633384 -p 7ne6gnlvk09blo8g6kd9n6391t --eval "db.dropDatabase()"
/c/mongo/bin/mongoimport -h ds053808.mongolab.com:53808 -u heroku_app19633384 -p 7ne6gnlvk09blo8g6kd9n6391t --db heroku_app19633384 --collection albums albums.txt 
#/c/mongo/bin/mongoimport -h ds053808.mongolab.com:53808 -u heroku_app19633384 -p 7ne6gnlvk09blo8g6kd9n6391t --db heroku_app19633384 --collection photos photos.txt 
#heroku_app19633384 7ne6gnlvk09blo8g6kd9n6391t
