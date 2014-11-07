'use strict';

var jobs = [];
var baseTime = new Date().getTime();
var buff = [];

function main() {
	for(var i=0; i<50; i++ ) {
		(function(i) {
			var atTime = baseTime + parseInt(12-Math.random()*14)*1000;
			var fun = function() {
				var execSecond =  (new Date().getTime() - baseTime);
				console.log('task'+i+': execSecond=' + execSecond+',delta='+(new Date().getTime() - atTime));
			};
			schedule({"work": fun, "time": atTime});
		})(i);
	}
}

main();

/**
 * 
 * @param job
 *            {"work":taskFunction, "time":executeTime(unix timestamp)}
 */
function schedule(job) {
    if (!job || !job.time || typeof job.time !== 'number') {
        logError('invalid job ' + job);
        return;
    }
    addJob(job);
    runTask();

}

function addJob(job) {
    if (jobs.length === 0) {
        jobs.push(job);
        return;
    }
    var p = jobs.length;
    for (var i = 0; i < jobs.length; i++) {
        if (jobs[i].time > job.time) {
            p = i;
            break;
        } else if (jobs[i].time === job.time) {
            p = i + 1;
            break;
        }
    }
    if (p === 0 && jobs.length > 0) {
        clearTimeout(jobs[0].timerId);
        delete jobs[0].timerId;
    }
    jobs.splice(p, 0, job);
    return;
}

function runTask() {
    var delay = jobs[0].time - new Date().getTime();
    if (!jobs[0].timerId) {
        jobs[0].timerId = setTimeout(function() {
            var work = jobs[0].work;
            jobs.shift();
            invokeFunctionSafety(work);
            if (jobs.length > 0) {
                runTask();
            }
        },
        delay);
    }
}

function invokeFunctionSafety(fun) {
    if (fun && typeof fun === 'function') {
        try {
            fun();
        } catch(e) {
            logError('execute failed, function is ' + fun, e);
        }
    } else {
        logError(fun + ' is not a function ');
    }
}

function logError(msg, err) {
    console.log('ERROR: ' + msg + (err ? '\n' + err: ''));
}

function logInfo(msg) {
    console.log('INFO: ' + msg);
}