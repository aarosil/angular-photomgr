   /c/mongo/bin/mongo ng-photomanager-db --eval "db.dropDatabase()"
   /c/mongo/bin/mongoimport --db ng-photomanager-db --collection albums albums.txt 
   /c/mongo/bin/mongoimport --db ng-photomanager-db --collection photos photos.txt 
