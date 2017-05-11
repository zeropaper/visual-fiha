module.exports = `snippet distribute
trigger
	distribute(\${1:width / 2}, \${2:height / 2}, \${3:10}, \${4:Math.min(width, height) / 2}, \${5:0}, function(pX, pY) {
		\${0:// code}
	});

snippet rep
	repeat(\${1:10}, function(index) {
		\${0:// code}
	});

snippet gri
	grid(\${1:24}, \${2:6}, function(x, y) {
		\${0:// code}
	});
`;