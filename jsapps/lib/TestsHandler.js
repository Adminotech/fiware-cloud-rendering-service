var tests = require('./tests');
var test;

function Runner(test){
	var runs = 0, maxRuns = 10, pause = 2000;
	var tests, category;
	var runnerInterval;

	tests = test.tests;
	category = test.category;

	function setTestSuccess(test){
		test.statusEl.innerHTML = test.success;
		test.statusEl.className = 'test-status status-success';
	};

	function setTestFail(test){
		test.statusEl.innerHTML = "Failure";
		test.statusEl.className = 'test-status status-failure';
	};

	function failTests(){
		var test;
		for (var i = tests.length - 1; i >= 0; i--) {
			test = tests[i];

			if (!test.result){
				setTestFail(test);
			}
		};
	}

	function runTest(test) {
		if ( test.result ) {
			return;
		}

		test.result = test.test();

		if ( test.result ){
			return setTestSuccess(test);
		}

	}

	function initTests(){
		var wrapElement, categoryElement, testElements = [];

		wrapElement = document.createElement('div');
		categoryElement = document.createElement('h3');
		categoryElement.innerText = category;

		wrapElement.appendChild( categoryElement );

		for (var i = tests.length - 1; i >= 0; i--) {
			var test = tests[i];

			var testElement = document.createElement('div');
			var testNameElement = document.createElement('span');
			var testStatusElement = document.createElement('span');

			testElement.className = 'test';
			testNameElement.className = 'test-name';
			testNameElement.innerText = test.name;
			testStatusElement.className = 'test-status';
			testStatusElement.innerText = 'Testing';

			test.el = testElement;
			test.statusEl = testStatusElement;

			testElement.appendChild( testNameElement );
			testElement.appendChild( testStatusElement );

			wrapElement.appendChild( testElement );
		};

		var holder = document.getElementById('testsHolder');

		holder.appendChild(wrapElement);
	};

	function iterateTests(){
		runs++;
		if (runs >= maxRuns) {
			clearInterval( runnerInterval );
			failTests();
		}

		for (var i = tests.length - 1; i >= 0; i--) {
			runTest( tests[i] );
		};
	}

	initTests();
	runnerInterval = setInterval( iterateTests, pause);
}

function TestsHandler(scope){
	var el = document.createElement('div');
	var header = document.createElement('h2');
	header.innerText = 'Tests';
	el.appendChild( header );
	el.id = 'testsHolder';
	document.body.appendChild(el);

	console.log('TestHandler init')

	for (var i = tests.length - 1; i >= 0; i--) {
		test = new tests[i](scope);
		var r = new Runner(test);
	};
};
module.exports = TestsHandler;
