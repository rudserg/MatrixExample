var http = require('http');
var fs = require('fs');
var NodeCache = require("node-cache");
var matrixCache = new NodeCache({stdTTL: 5});

function readMatrix() {
	console.log('readMatrix');
	fs.readFile('c:/Nodejs/matrix.txt', 'utf8', function(err, data) {
		if (!err) {
			matrixCache.set('matrix', JSON.parse(data));
		} else {
			console.log('error open file');
		}
	});
}

function multMatrix(matrix, vector) {
	var result = [];
	for(var i=0; i<matrix.length; i++) {
		var row = matrix[i];
		var resultRow = 0;
		for(var j=0; j<row.length; j++)
			resultRow += row[j] * parseInt(vector[i]);
		result.push(resultRow);
	}
	return result;
}



http.createServer(function (req, res) {

  var query = require('url').parse(req.url).query;
  var queryParse = require('querystring').parse(query);
  
  if (queryParse.vector) {
  
	  var vectorJson = queryParse.vector; // vector = [1,2,3]
	  var vector = vectorJson? JSON.parse(vectorJson): [];
	  
	  var viewMatrix = function() {
		 var matrix = matrixCache.get('matrix').matrix; //
		 if (matrix.length == vector.length) {
			var result = multMatrix(matrix, vector);
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.write(JSON.stringify(result));
		  } else {
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.write('vector should have '+matrix.length+' values');
		}
		res.end();
	  }

	// если первый раз обращаемся
	if (!matrixCache.get('matrix').matrix) {
		matrixCache.on( "expired", function( key, value ){
			if (key == 'matrix')  {
				console.log('expired');
				readMatrix();
			}
		});
		matrixCache.on( "set", function( key, value ){
			if (key == 'matrix')  {
				viewMatrix();
			}
		});
		readMatrix();
	} else
		viewMatrix();
 }
	
  
}).listen(1325, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1325/');