import newman from 'newman';
import routeTestCollection from '../static/RouteTest.postman_collection.json' assert { type: "json" };
const rt = routeTestCollection;

newman.run({
  collection: routeTestCollection,
  reporters: 'cli'
}, function (err) {
if (err) { throw err; }
  console.log('collection run complete!');
});