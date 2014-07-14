var http = require('http');
var fs = require('fs');
var NodeCache = require("node-cache");
var matrixCache = new NodeCache({stdTTL: 3601});

function readMatrix() {
	fs.readFile(__dirname+'/matrix2.txt', 'utf8', function(err, data) {
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
	
	var resultSum = 0;
	for(var i=0; i<result.length; i++) {
		resultSum += result[i];
	}
	return resultSum;
}

function generateMatrix(size1, size2) {
	var result = [];
	for(var i=0; i<size1; i++) {
		var row = [];
		for(var j=0; j<size2; j++) {
			row[j] = randomInt(1, 100);
		}
		result[i] = row;
	}
	return result;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

function writeMatrix(data) {
	fs.writeFile(__dirname+'/matrix2.txt', data, function(err, data) {
		if (err) throw err;		
	});
}

var start = process.hrtime();

function elapsed_time(note, hide){
    var precision = 3; // 3 decimal places
    var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
    if (!hide)
		console.log(process.hrtime(start)[0] + "s " + elapsed.toFixed(precision) + "ms " + note); // print message + time
    start = process.hrtime(); // reset the timer
}

http.createServer(function (req, res) {
 
  var query = require('url').parse(req.url).query;
  var queryParse = require('querystring').parse(query);
  
  if (queryParse.vector) {
	  elapsed_time("recieved request", true);
	  var viewMatrix = function() {
		var matrix = matrixCache.get('matrix').matrix;
		var vector = generateMatrix(1, matrix.length)[0];
		var result = multMatrix(matrix, vector);
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.write(''+result);
		res.end();
		elapsed_time("end viewMatrix");
	  }

	// ���� ������ ��� ����������
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
 } else if (queryParse.generate) {
	elapsed_time("recieved request", true);
	var size = parseInt(queryParse.generate);
	var matrix = generateMatrix(size, size);
	writeMatrix(JSON.stringify(matrix));	
	res.write('Generated matrix ' +size +'x'+size);
	res.end();
	elapsed_time("end writeMatrix");
 } else {
	fs.readFile(__dirname+'/button.html',function (err, data){
		if (!err) {
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
		} else {
			console.log('error open file');
		}
			
    });
 }
	
	
  
}).listen(1325, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1325/');
