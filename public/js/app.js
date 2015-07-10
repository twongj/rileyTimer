var app = angular.module('rileyApp', ['ui.bootstrap']);

app.controller('rileyController', function($scope, $interval, $http, $log) {

    $scope.scrambleTypes = ['Rubik\'s Cube', '4x4 Cube', '5x5 Cube', '2x2 Cube'];

    $scope.sessions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // solves
    $http.get('/solves').success(function(response) {
        $scope.solves = response;
        $scope.solves.forEach(function(solve) {
            solve.displayTime = (solve.result/1000).toFixed(2);
        });
    });

    $scope.resetSession = function() {
        if (confirm('Reset Session?')) {
            $http.delete('/solves/reset').success(function(response) {
                $scope.solves = [];
            });
        }
    };

    $scope.removeSolve = function(solve) {
        if (confirm('Delete Solve: ' + solve.displayTime + '?')) {
            $http.delete('/solves/remove/' + solve.date).success(function(response) {
                $scope.solves = response;
                $scope.solves.forEach(function(solve) {
                    solve.displayTime = (solve.result/1000).toFixed(2);
                });
            });
        }
    };

    // timer
    $scope.now = 0; // updated using Date.now()
    $scope.time = 0;
    $scope.timerDisplay = '0.00';
    $scope.timer_delay = 10;
    $scope.interval = null;

    $scope.scramble = generate3x3Scramble(20);

    $scope.$watch(function(scope) {
        return scope.scramble;
    }, function() {
        $scope.reset();
        $scope.performMoves($scope.scramble);
    });

    $scope.isTiming = 0;
    $scope.isKeydown = 0;
    $scope.isTyping = 0;

    $scope.keydown = function(event) {
        if ((event.which === 32) && ($scope.isKeydown === 0) && ($scope.isTyping === 0)) {
            $scope.isKeydown = 1;
            if ($scope.isTiming === 0) {
                $scope.timerDisplay = '0.00';
                $scope.timerStyle = {'color':'#33CC00'};
            } else if ($scope.isTiming === 1) {
                $scope.stopTimer();
                var solve = {};
                solve.time = $scope.time;
                solve.penalty = 0;
                solve.scramble = $scope.scramble;
                solve.comment = '';
                solve.date = Date.now();
                $http.post('/solves/submit', solve).success(function(response) {
                    $scope.solves = response;
                    $scope.solves.forEach(function(solve) {
                        solve.displayTime = (solve.result/1000).toFixed(2);
                    });
                });
                $scope.now = 0;
                $scope.time = 0;
                $scope.interval = null;
                $scope.scramble = generate3x3Scramble(20);
            }
        }
    };

    $scope.keyup = function(event) {
        if ((event.which === 32) && ($scope.isKeydown === 1) && ($scope.isTyping === 0)) {
            $scope.isKeydown = 0;
            if ($scope.isTiming === 0) {
                $scope.isTiming = 1;
                $scope.timerStyle = {'color': 'black'};
                $scope.startTimer();
            } else if ($scope.isTiming === 1) {
                $scope.isTiming = 0;
            }
        }
    };

    $scope.startTimer = function() {
        $scope.now = Date.now();

        $scope.interval = $interval(function() {
            var tmp = Date.now();
            var offset = tmp - $scope.now;
            $scope.time += (offset);
            $scope.timerDisplay = ($scope.time/1000).toFixed(2);
            $scope.now = tmp;
        }, $scope.timerDelay);
    };

    $scope.stopTimer = function() {
        $interval.cancel($scope.interval);
    };

    // cube graphics

    $scope.color = {};

    $scope.color.white = '#ffffff';
    $scope.color.yellow = '#ffff00';
    $scope.color.orange = '#ff8000';
    $scope.color.red = '#ff0000';
    $scope.color.green = '#00ff00';
    $scope.color.blue = '#0000ff';

    $scope.cub = {};

    $scope.cub.U = $scope.color.white;
    $scope.cub.D = $scope.color.yellow;
    $scope.cub.L = $scope.color.orange;
    $scope.cub.R = $scope.color.red;
    $scope.cub.F = $scope.color.green;
    $scope.cub.B = $scope.color.blue;

    $scope.cub.UR = $scope.color.white;
    $scope.cub.RU = $scope.color.red;
    $scope.cub.UF = $scope.color.white;
    $scope.cub.FU = $scope.color.green;
    $scope.cub.UL = $scope.color.white;
    $scope.cub.LU = $scope.color.orange;
    $scope.cub.UB = $scope.color.white;
    $scope.cub.BU = $scope.color.blue;
    $scope.cub.DR = $scope.color.yellow;
    $scope.cub.RD = $scope.color.red;
    $scope.cub.DF = $scope.color.yellow;
    $scope.cub.FD = $scope.color.green;
    $scope.cub.DL = $scope.color.yellow;
    $scope.cub.LD = $scope.color.orange;
    $scope.cub.DB = $scope.color.yellow;
    $scope.cub.BD = $scope.color.blue;
    $scope.cub.FL = $scope.color.green;
    $scope.cub.LF = $scope.color.orange;
    $scope.cub.FR = $scope.color.green;
    $scope.cub.RF = $scope.color.red;
    $scope.cub.BL = $scope.color.blue;
    $scope.cub.LB = $scope.color.orange;
    $scope.cub.BR = $scope.color.blue;
    $scope.cub.RB = $scope.color.red;

    $scope.cub.URF = $scope.color.white;
    $scope.cub.RFU = $scope.color.red;
    $scope.cub.FUR = $scope.color.green;
    $scope.cub.UFL = $scope.color.white;
    $scope.cub.FLU = $scope.color.green;
    $scope.cub.LUF = $scope.color.orange;
    $scope.cub.ULB = $scope.color.white;
    $scope.cub.LBU = $scope.color.orange;
    $scope.cub.BUL = $scope.color.blue;
    $scope.cub.UBR = $scope.color.white;
    $scope.cub.BRU = $scope.color.blue;
    $scope.cub.RUB = $scope.color.red;
    $scope.cub.DFR = $scope.color.yellow;
    $scope.cub.FRD = $scope.color.green;
    $scope.cub.RDF = $scope.color.red;
    $scope.cub.DLF = $scope.color.yellow;
    $scope.cub.LFD = $scope.color.orange;
    $scope.cub.FDL = $scope.color.green;
    $scope.cub.DBL = $scope.color.yellow;
    $scope.cub.BLD = $scope.color.blue;
    $scope.cub.LDB = $scope.color.orange;
    $scope.cub.DRB = $scope.color.yellow;
    $scope.cub.RBD = $scope.color.red;
    $scope.cub.BDR = $scope.color.blue;

    $scope.newScramble = function() {
        $scope.scramble = generate3x3Scramble(20);
        $scope.reset();
        $scope.performMoves($scope.scramble);
    }

    $scope.performMoves = function(moves) {
        var movesArray = moves.split(" ");
        for (i = 0; i < movesArray.length; i++) {
            switch (movesArray[i]) {
                case 'U':
                    $scope.performU();
                    break;
                case 'U\'':
                    $scope.performU();
                    $scope.performU();
                    $scope.performU();
                    break;
                case 'U2':
                    $scope.performU();
                    $scope.performU();
                    break;
                case 'D':
                    $scope.performDPrime();
                    $scope.performDPrime();
                    $scope.performDPrime();
                    break;
                case 'D\'':
                    $scope.performDPrime();
                    break;
                case 'D2':
                    $scope.performDPrime();
                    $scope.performDPrime();
                    break;
                case 'L':
                    $scope.performL();
                    break;
                case 'L\'':
                    $scope.performL();
                    $scope.performL();
                    $scope.performL();
                    break;
                case 'L2':
                    $scope.performL();
                    $scope.performL();
                    break;
                case 'R':
                    $scope.performRPrime();
                    $scope.performRPrime();
                    $scope.performRPrime();
                    break;
                case 'R\'':
                    $scope.performRPrime();
                    break;
                case 'R2':
                    $scope.performRPrime();
                    $scope.performRPrime();
                    break;
                case 'F':
                    $scope.performF();
                    break;
                case 'F\'':
                    $scope.performF();
                    $scope.performF();
                    $scope.performF();
                    break;
                case 'F2':
                    $scope.performF();
                    $scope.performF();
                    break;
                case 'B':
                    $scope.performBPrime();
                    $scope.performBPrime();
                    $scope.performBPrime();
                    break;
                case 'B\'':
                    $scope.performBPrime();
                    break;
                case 'B2':
                    $scope.performBPrime();
                    $scope.performBPrime();
                    break;
            }
        }
    };

    $scope.performU = function() {
        var temp = $scope.cub.UR;
        $scope.cub.UR = $scope.cub.UB;
        $scope.cub.UB = $scope.cub.UL;
        $scope.cub.UL = $scope.cub.UF;
        $scope.cub.UF = temp;
        temp = $scope.cub.RU;
        $scope.cub.RU = $scope.cub.BU;
        $scope.cub.BU = $scope.cub.LU;
        $scope.cub.LU = $scope.cub.FU;
        $scope.cub.FU = temp;
        temp = $scope.cub.URF;
        $scope.cub.URF = $scope.cub.UBR;
        $scope.cub.UBR = $scope.cub.ULB;
        $scope.cub.ULB = $scope.cub.UFL;
        $scope.cub.UFL = temp;
        temp = $scope.cub.RFU;
        $scope.cub.RFU = $scope.cub.BRU;
        $scope.cub.BRU = $scope.cub.LBU;
        $scope.cub.LBU = $scope.cub.FLU;
        $scope.cub.FLU = temp;
        temp = $scope.cub.FUR;
        $scope.cub.FUR = $scope.cub.RUB;
        $scope.cub.RUB = $scope.cub.BUL;
        $scope.cub.BUL = $scope.cub.LUF;
        $scope.cub.LUF = temp;
    };

    $scope.performDPrime = function() {
        var temp = $scope.cub.DR;
        $scope.cub.DR = $scope.cub.DB;
        $scope.cub.DB = $scope.cub.DL;
        $scope.cub.DL = $scope.cub.DF;
        $scope.cub.DF = temp;
        temp = $scope.cub.RD;
        $scope.cub.RD = $scope.cub.BD;
        $scope.cub.BD = $scope.cub.LD;
        $scope.cub.LD = $scope.cub.FD;
        $scope.cub.FD = temp;
        temp = $scope.cub.DFR;
        $scope.cub.DFR = $scope.cub.DRB;
        $scope.cub.DRB = $scope.cub.DBL;
        $scope.cub.DBL = $scope.cub.DLF;
        $scope.cub.DLF = temp;
        temp = $scope.cub.RDF;
        $scope.cub.RDF = $scope.cub.BDR;
        $scope.cub.BDR = $scope.cub.LDB;
        $scope.cub.LDB = $scope.cub.FDL;
        $scope.cub.FDL = temp;
        temp = $scope.cub.FRD;
        $scope.cub.FRD = $scope.cub.RBD;
        $scope.cub.RBD = $scope.cub.BLD;
        $scope.cub.BLD = $scope.cub.LFD;
        $scope.cub.LFD = temp;
    };

    $scope.performL = function() {
        var temp = $scope.cub.LU;
        $scope.cub.LU = $scope.cub.LB;
        $scope.cub.LB = $scope.cub.LD;
        $scope.cub.LD = $scope.cub.LF;
        $scope.cub.LF = temp;
        temp = $scope.cub.UL;
        $scope.cub.UL = $scope.cub.BL;
        $scope.cub.BL = $scope.cub.DL;
        $scope.cub.DL = $scope.cub.FL;
        $scope.cub.FL = temp;
        temp = $scope.cub.LUF;
        $scope.cub.LUF = $scope.cub.LBU;
        $scope.cub.LBU = $scope.cub.LDB;
        $scope.cub.LDB = $scope.cub.LFD;
        $scope.cub.LFD = temp;
        temp = $scope.cub.UFL;
        $scope.cub.UFL = $scope.cub.BUL;
        $scope.cub.BUL = $scope.cub.DBL;
        $scope.cub.DBL = $scope.cub.FDL;
        $scope.cub.FDL = temp;
        temp = $scope.cub.FLU;
        $scope.cub.FLU = $scope.cub.ULB;
        $scope.cub.ULB = $scope.cub.BLD;
        $scope.cub.BLD = $scope.cub.DLF;
        $scope.cub.DLF = temp;
    };

    $scope.performRPrime = function() {
        var temp = $scope.cub.RU;
        $scope.cub.RU = $scope.cub.RB;
        $scope.cub.RB = $scope.cub.RD;
        $scope.cub.RD = $scope.cub.RF;
        $scope.cub.RF = temp;
        temp = $scope.cub.UR;
        $scope.cub.UR = $scope.cub.BR;
        $scope.cub.BR = $scope.cub.DR;
        $scope.cub.DR = $scope.cub.FR;
        $scope.cub.FR = temp;
        temp = $scope.cub.RFU;
        $scope.cub.RFU = $scope.cub.RUB;
        $scope.cub.RUB = $scope.cub.RBD;
        $scope.cub.RBD = $scope.cub.RDF;
        $scope.cub.RDF = temp;
        temp = $scope.cub.URF;
        $scope.cub.URF = $scope.cub.BRU;
        $scope.cub.BRU = $scope.cub.DRB;
        $scope.cub.DRB = $scope.cub.FRD;
        $scope.cub.FRD = temp;
        temp = $scope.cub.FUR;
        $scope.cub.FUR = $scope.cub.UBR;
        $scope.cub.UBR = $scope.cub.BDR;
        $scope.cub.BDR = $scope.cub.DFR;
        $scope.cub.DFR = temp;
    };

    $scope.performF = function() {
        var temp = $scope.cub.FU;
        $scope.cub.FU = $scope.cub.FL;
        $scope.cub.FL = $scope.cub.FD;
        $scope.cub.FD = $scope.cub.FR;
        $scope.cub.FR = temp;
        temp = $scope.cub.UF;
        $scope.cub.UF = $scope.cub.LF;
        $scope.cub.LF = $scope.cub.DF;
        $scope.cub.DF = $scope.cub.RF;
        $scope.cub.RF = temp;
        temp = $scope.cub.FUR;
        $scope.cub.FUR = $scope.cub.FLU;
        $scope.cub.FLU = $scope.cub.FDL;
        $scope.cub.FDL = $scope.cub.FRD;
        $scope.cub.FRD = temp;
        temp = $scope.cub.URF;
        $scope.cub.URF = $scope.cub.LUF;
        $scope.cub.LUF = $scope.cub.DLF;
        $scope.cub.DLF = $scope.cub.RDF;
        $scope.cub.RDF = temp;
        temp = $scope.cub.RFU;
        $scope.cub.RFU = $scope.cub.UFL;
        $scope.cub.UFL = $scope.cub.LFD;
        $scope.cub.LFD = $scope.cub.DFR;
        $scope.cub.DFR = temp;
    };

    $scope.performBPrime = function() {
        var temp = $scope.cub.BU;
        $scope.cub.BU = $scope.cub.BL;
        $scope.cub.BL = $scope.cub.BD;
        $scope.cub.BD = $scope.cub.BR;
        $scope.cub.BR = temp;
        temp = $scope.cub.UB;
        $scope.cub.UB = $scope.cub.LB;
        $scope.cub.LB = $scope.cub.DB;
        $scope.cub.DB = $scope.cub.RB;
        $scope.cub.RB = temp;
        temp = $scope.cub.BRU;
        $scope.cub.BRU = $scope.cub.BUL;
        $scope.cub.BUL = $scope.cub.BLD;
        $scope.cub.BLD = $scope.cub.BDR;
        $scope.cub.BDR = temp;
        temp = $scope.cub.UBR;
        $scope.cub.UBR = $scope.cub.LBU;
        $scope.cub.LBU = $scope.cub.DBL;
        $scope.cub.DBL = $scope.cub.RBD;
        $scope.cub.RBD = temp;
        temp = $scope.cub.RUB;
        $scope.cub.RUB = $scope.cub.ULB;
        $scope.cub.ULB = $scope.cub.LDB;
        $scope.cub.LDB = $scope.cub.DRB;
        $scope.cub.DRB = temp;
    };

    $scope.reset = function() {

        $scope.cub.U = $scope.color.white;
        $scope.cub.D = $scope.color.yellow;
        $scope.cub.L = $scope.color.orange;
        $scope.cub.R = $scope.color.red;
        $scope.cub.F = $scope.color.green;
        $scope.cub.B = $scope.color.blue;

        $scope.cub.UR = $scope.color.white;
        $scope.cub.RU = $scope.color.red;
        $scope.cub.UF = $scope.color.white;
        $scope.cub.FU = $scope.color.green;
        $scope.cub.UL = $scope.color.white;
        $scope.cub.LU = $scope.color.orange;
        $scope.cub.UB = $scope.color.white;
        $scope.cub.BU = $scope.color.blue;
        $scope.cub.DR = $scope.color.yellow;
        $scope.cub.RD = $scope.color.red;
        $scope.cub.DF = $scope.color.yellow;
        $scope.cub.FD = $scope.color.green;
        $scope.cub.DL = $scope.color.yellow;
        $scope.cub.LD = $scope.color.orange;
        $scope.cub.DB = $scope.color.yellow;
        $scope.cub.BD = $scope.color.blue;
        $scope.cub.FL = $scope.color.green;
        $scope.cub.LF = $scope.color.orange;
        $scope.cub.FR = $scope.color.green;
        $scope.cub.RF = $scope.color.red;
        $scope.cub.BL = $scope.color.blue;
        $scope.cub.LB = $scope.color.orange;
        $scope.cub.BR = $scope.color.blue;
        $scope.cub.RB = $scope.color.red;

        $scope.cub.URF = $scope.color.white;
        $scope.cub.RFU = $scope.color.red;
        $scope.cub.FUR = $scope.color.green;
        $scope.cub.UFL = $scope.color.white;
        $scope.cub.FLU = $scope.color.green;
        $scope.cub.LUF = $scope.color.orange;
        $scope.cub.ULB = $scope.color.white;
        $scope.cub.LBU = $scope.color.orange;
        $scope.cub.BUL = $scope.color.blue;
        $scope.cub.UBR = $scope.color.white;
        $scope.cub.BRU = $scope.color.blue;
        $scope.cub.RUB = $scope.color.red;
        $scope.cub.DFR = $scope.color.yellow;
        $scope.cub.FRD = $scope.color.green;
        $scope.cub.RDF = $scope.color.red;
        $scope.cub.DLF = $scope.color.yellow;
        $scope.cub.LFD = $scope.color.orange;
        $scope.cub.FDL = $scope.color.green;
        $scope.cub.DBL = $scope.color.yellow;
        $scope.cub.BLD = $scope.color.blue;
        $scope.cub.LDB = $scope.color.orange;
        $scope.cub.DRB = $scope.color.yellow;
        $scope.cub.RBD = $scope.color.red;
        $scope.cub.BDR = $scope.color.blue;
    };

});

function generate3x3Scramble(length) {
    var previousMove = -1,
        secondPreviousMove = -1,
        scramble = "";
    for (i = 0; i < length; i++) {
        var move = Math.floor((Math.random() * 6)),
            direction = Math.floor((Math.random() * 3));
        if (((previousMove == 0) && (secondPreviousMove != 1)) || ((previousMove == 1) && (secondPreviousMove != 0)) || ((previousMove == 2) && (secondPreviousMove != 3)) || ((previousMove == 3) && (secondPreviousMove != 2)) || ((previousMove == 4) && (secondPreviousMove != 5)) || ((previousMove == 5) && (secondPreviousMove != 4)))
            secondPreviousMove = -1;
        while ((move == previousMove) || (move == secondPreviousMove))
            move = Math.floor((Math.random() * 6));
        switch (move) {
            case 0:
                scramble = scramble.concat("U");
                break;
            case 1:
                scramble = scramble.concat("D");
                break;
            case 2:
                scramble = scramble.concat("L");
                break;
            case 3:
                scramble = scramble.concat("R");
                break;
            case 4:
                scramble = scramble.concat("F");
                break;
            case 5:
                scramble = scramble.concat("B");
                break;
        }
        switch (direction) {
            case 1:
                scramble = scramble.concat("'");
                break;
            case 2:
                scramble = scramble.concat("2");
                break;
        }
        secondPreviousMove = previousMove;
        previousMove = move;
        if (i < length - 1)
            scramble = scramble.concat(" ");
    }
    return scramble;
}
