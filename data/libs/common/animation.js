<func note="기본함수">
	quad(timeFraction) {
	  return Math.pow(timeFraction, 2)
	}
	circ(timeFraction) {
	  return 1 - Math.sin(Math.acos(timeFraction));
	}
	// ex) x=1.5
	back(x, timeFraction) {
	  return Math.pow(timeFraction, 2) * ((x + 1) * timeFraction - x)
	}
	bounce(timeFraction) {
	  for (let a = 0, b = 1; 1; a += b, b /= 2) {
		if (timeFraction >= (7 - 4 * a) / 11) {
		  return -Math.pow((11 - 6 * a - 11 * timeFraction) / 4, 2) + Math.pow(b, 2)
		}
	  }
	}
	// ex) x=1.5
	elastic(x, timeFraction) {
	  return Math.pow(2, 10 * (timeFraction - 1)) * Math.cos(20 * Math.PI * x / 3 * timeFraction)
	}
	// timingEaseOut(timeFraction) = 1 - timing(1 - timeFraction)
	makeEaseOut(timing) {
	  return function(timeFraction) {
		return 1 - timing(1 - timeFraction);
	  }
	}
	makeEaseInOut(timing) {
	  return function(timeFraction) {
		if (timeFraction < .5)
		  return timing(2 * timeFraction) / 2;
		else
		  return (2 - timing(2 * (1 - timeFraction))) / 2;
	  }
	}
</func>